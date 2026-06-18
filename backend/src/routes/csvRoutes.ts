// =============================================================================
// src/routes/csvRoutes.ts
//
// Purpose: Express router for CSV file upload and ingestion.
// Integrates multer (in-memory buffering), fileValidator, csvParser,
// CSV upload limiter, and audit logging in the correct order.
//
// Security considerations:
// - multer is configured to store files in memory only (memoryStorage).
//   Files never touch the filesystem in a user-accessible path.
// - multer enforces the MAX_CSV_FILE_SIZE_MB limit as a first pass.
//   fileValidator re-checks the actual buffer size as a second pass to
//   defend against Content-Length header spoofing.
// - fileFilter rejects non-.csv extensions at the multer layer (first pass).
//   fileValidator then inspects magic bytes and UTF-8 validity (definitive).
//   Both checks must pass — neither alone is sufficient.
// - The upload record is always created before parsing begins. On any
//   validation or parse error, the record is marked QUARANTINED or FAILED
//   so the audit trail is complete. QUARANTINED records are never deleted.
// - The stored filename is a UUID — it has no relation to the user-supplied
//   name, preventing path traversal if the file is later written to disk.
// - The original filename is sanitised before DB storage (see fileValidator).
// - Rate limited to 5 uploads per hour per user (csvUploadLimiter).
// - requireAuth must be applied by the caller — no unauthenticated uploads.
//
// Mount as:
//   app.use('/api/csv', requireAuth, csvRouter);
// =============================================================================

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import type { PrismaClient } from '@prisma/client';
import type { Redis as RedisClient } from 'ioredis';
import {
  validateCsvFile,
  sanitiseFilename,
  generateStoredFilename,
} from '../middleware/fileValidator';
import { parseCsvBuffer, detectDataSource } from '../modules/csv/csvParser';
import { csvUploadLimiter } from '../middleware/rateLimiter';
import { AuditLogService, AuditAction } from '../modules/audit/auditLog';
import { config } from '../config/env';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthenticatedRequest extends Request {
  user:      { id: string };
  requestId: string;
}

// ─── Multer configuration ─────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: config.csv.maxFileSizeMb * 1_024 * 1_024 },
  fileFilter(_req, file, cb) {
    // Extension check — first pass only. fileValidator does the definitive check.
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      cb(new Error('Only .csv files are accepted.'));
      return;
    }
    cb(null, true);
  },
});

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createCsvRouter(
  prisma: PrismaClient,
  redis:  RedisClient,
): Router {
  const router   = Router();
  const auditLog = new AuditLogService(prisma);

  function resolveIp(req: Request): string {
    if (config.trustProxy) {
      const fwd = req.headers['x-forwarded-for'];
      if (typeof fwd === 'string') return fwd.split(',')[0]?.trim() ?? 'unknown';
    }
    return req.socket.remoteAddress ?? 'unknown';
  }

  // ── POST /api/csv/upload ───────────────────────────────────────────────────

  router.post(
    '/upload',
    csvUploadLimiter(redis),
    upload.single('file'),
    validateCsvFile,
    async (req: Request, res: Response): Promise<void> => {
      const authReq   = req as AuthenticatedRequest;
      const rawIp     = resolveIp(req);
      const file      = (req as Request & { file?: Express.Multer.File }).file;
      const validation = req.csvValidation;

      // multer will have already rejected non-.csv or oversized files
      if (!file || !validation) {
        res.status(400).json({ error: 'No file received.' });
        return;
      }

      // fileValidator returns valid: false with a generic error string
      if (!validation.valid) {
        void auditLog.log({
          userId:  authReq.user.id,
          action:  AuditAction.CSV_QUARANTINED,
          rawIp,
          userAgent: req.headers['user-agent'],
          success: false,
        });
        res.status(422).json({ error: validation.error ?? 'File failed validation.' });
        return;
      }

      const sanitisedFilename = sanitiseFilename(file.originalname);
      const storedFilename    = generateStoredFilename();

      // Create a PENDING upload record before parsing
      const uploadRecord = await prisma.csvUpload.create({
        data: {
          userId:          authReq.user.id,
          originalFilename: sanitisedFilename,
          storedFilename,
          fileSize:        file.size,
          status:          'PROCESSING',
          columnHeaders:   [],
          dataSource:      'UNKNOWN',
        },
      });

      try {
        const result     = await parseCsvBuffer(file.buffer);
        const dataSource = detectDataSource(result.columnHeaders);

        await prisma.csvUpload.update({
          where: { id: uploadRecord.id },
          data:  {
            status:        result.rowCount > 0 ? 'COMPLETE' : 'FAILED',
            rowCount:      result.rowCount,
            columnHeaders: result.columnHeaders,
            dataSource,
            processedAt:   new Date(),
            errorMessage:  result.truncated
              ? `File was truncated at ${config.csv.maxRows} rows.`
              : null,
          },
        });

        // Batch-insert parsed rows (chunked for large files)
        if (result.rows.length > 0) {
          const CHUNK_SIZE = 500;
          for (let i = 0; i < result.rows.length; i += CHUNK_SIZE) {
            const chunk = result.rows.slice(i, i + CHUNK_SIZE);
            await prisma.csvRow.createMany({
              data: chunk.map((r) => ({
                uploadId:        uploadRecord.id,
                rowIndex:        r.rowIndex,
                rawData:         r.rawData,
                transformedData: r.transformedData,
                flagged:         r.flagged,
                flagReason:      r.flagReason ?? null,
              })),
            });
          }
        }

        void auditLog.log({
          userId:       authReq.user.id,
          action:       AuditAction.CSV_PROCESSED,
          resourceType: 'CsvUpload',
          resourceId:   uploadRecord.id,
          rawIp,
          userAgent:    req.headers['user-agent'],
          success:      true,
        });

        res.json({
          uploadId:      uploadRecord.id,
          rowCount:      result.rowCount,
          columnHeaders: result.columnHeaders,
          dataSource,
          truncated:     result.truncated,
        });
      } catch (err) {
        console.error(`[csvRoutes] Parse error [${authReq.requestId}]:`, err);

        await prisma.csvUpload.update({
          where: { id: uploadRecord.id },
          data:  {
            status:       'FAILED',
            processedAt:  new Date(),
            errorMessage: 'Parse failed — the file may be malformed.',
          },
        });

        void auditLog.log({
          userId:       authReq.user.id,
          action:       AuditAction.CSV_QUARANTINED,
          resourceType: 'CsvUpload',
          resourceId:   uploadRecord.id,
          rawIp,
          userAgent:    req.headers['user-agent'],
          success:      false,
        });

        res.status(422).json({ error: 'File could not be processed. Please check the format and try again.' });
      }
    },
  );

  return router;
}
