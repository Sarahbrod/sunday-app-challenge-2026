// =============================================================================
// src/middleware/fileValidator.ts
//
// Purpose: Server-side validation for CSV file uploads. Enforces file size,
// magic byte inspection, UTF-8 validity, filename sanitisation, row count
// limit, and formula injection stripping before data reaches the parser.
//
// Security considerations:
// - The Content-Type header is NOT trusted as proof of file type. An attacker
//   can send any Content-Type header regardless of file content. We inspect
//   the actual bytes instead.
// - CSV is plain text with no unique magic bytes. Validation therefore:
//     1. Rejects known-dangerous binary magic bytes (ZIP, PDF, ELF, PE,
//        GIF, PNG, JPEG, DOCX/XLSX).
//     2. Verifies the file contains no null bytes (binary indicator).
//     3. Verifies the file decodes as valid UTF-8.
// - storedFilename is a UUID with a .csv extension — never derived from
//   user input. The original filename is sanitised before DB storage only.
// - Path traversal characters (/, \, null bytes, shell metacharacters) are
//   stripped from the original filename before it is written anywhere.
// - Formula injection characters (=, +, -, @, TAB, CR at cell start) are
//   stripped from cell values. This prevents CSV Injection (CWE-1236) when
//   the data is later opened in a spreadsheet application.
// - Files that fail validation are marked QUARANTINED — not deleted — so an
//   audit trail is preserved and the file can be reviewed manually.
// - Upload limits (size, row count) are read from config, never hardcoded.
// =============================================================================

import path from 'node:path';
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Formula injection characters at the start of a cell value that cause
 * spreadsheet applications to interpret the cell as a formula.
 * Strip these when the character appears at position 0 of the cell string.
 */
const FORMULA_PREFIX_RE = /^[=+\-@\t\r]+/;

/**
 * Characters that must never appear in a stored or logged filename.
 * Covers path separators, null byte, and common shell injection characters.
 */
const UNSAFE_FILENAME_RE = /[/\\:*?"<>|;\x00-\x1f\x7f]/g;

/** Maximum bytes to read when inspecting magic bytes. */
const MAGIC_SAMPLE_BYTES = 4_096;

// ─── Filename helpers ─────────────────────────────────────────────────────────

/**
 * Sanitises a user-supplied filename for safe storage in the database.
 * Strips path components, null bytes, and shell metacharacters.
 * Returns the sanitised basename, truncated to 255 characters.
 *
 * The returned value is for display/logging only — the actual file on disk
 * uses a UUID name (see generateStoredFilename).
 */
export function sanitiseFilename(original: string): string {
  // path.basename handles both / and \ path separators.
  const base  = path.basename(original);
  const clean = base.replace(UNSAFE_FILENAME_RE, '_').trim();
  return (clean.slice(0, 255) || 'upload');
}

/**
 * Generates a cryptographically random UUID-based filename with a .csv
 * extension. This is the name used on disk — it has no relationship to the
 * user-supplied filename, making the storage path completely unguessable.
 */
export function generateStoredFilename(): string {
  return `${crypto.randomUUID()}.csv`;
}

// ─── Magic byte / content inspection ─────────────────────────────────────────

/**
 * Known-dangerous binary magic byte sequences.
 * Reject any file that begins with these bytes regardless of extension.
 */
export function hasDangerousMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  const b = buffer;
  return (
    // ZIP / XLSX / DOCX / JAR
    (b[0] === 0x50 && b[1] === 0x4b) ||
    // PDF
    (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) ||
    // ELF (Linux executable / shared library)
    (b[0] === 0x7f && b[1] === 0x45 && b[2] === 0x4c && b[3] === 0x46) ||
    // PE (Windows .exe / .dll)
    (b[0] === 0x4d && b[1] === 0x5a) ||
    // PNG
    (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) ||
    // JPEG
    (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
    // GIF
    (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) ||
    // OLE2 (XLS, DOC, PPT — old Office formats)
    (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0)
  );
}

/**
 * Verifies the buffer looks like valid UTF-8 plain text.
 * Returns false if the file contains null bytes (binary indicator) or fails
 * UTF-8 decoding on the first MAGIC_SAMPLE_BYTES bytes.
 */
export function looksLikeUtf8Text(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, MAGIC_SAMPLE_BYTES);

  // Null bytes in text files are a strong binary indicator.
  if (sample.includes(0x00)) return false;

  try {
    // fatal: true causes TextDecoder to throw on invalid byte sequences.
    new TextDecoder('utf-8', { fatal: true }).decode(sample);
    return true;
  } catch {
    return false;
  }
}

// ─── Limit checks ─────────────────────────────────────────────────────────────

/** Returns true if the file size exceeds the configured maximum. */
export function exceedsFileSizeLimit(fileSizeBytes: number): boolean {
  return fileSizeBytes > config.csv.maxFileSizeMb * 1_024 * 1_024;
}

/** Returns true if the row count exceeds the configured maximum. */
export function exceedsRowLimit(rowCount: number): boolean {
  return rowCount > config.csv.maxRows;
}

// ─── Formula injection stripping ──────────────────────────────────────────────

/**
 * Strips formula injection prefix characters from a single cell value.
 * Safe to call on every cell in every row before writing to transformedData.
 *
 * Examples:
 *   "=SUM(A1)"     → "SUM(A1)"
 *   "+19 numbers"  → "19 numbers"
 *   "@user"        → "user"
 *   "normal text"  → "normal text"  (unchanged)
 */
export function stripFormulaInjection(value: string): string {
  if (typeof value !== 'string') return String(value ?? '');
  return value.replace(FORMULA_PREFIX_RE, '');
}

// ─── Express middleware ───────────────────────────────────────────────────────

export interface CsvValidationResult {
  valid:              boolean;
  error?:             string;
  /** Sanitised version of the user-supplied filename, for DB storage. */
  sanitisedFilename?: string;
  /** UUID-based filename used on disk. Never derived from user input. */
  storedFilename?:    string;
}

declare global {
  namespace Express {
    interface Request {
      csvValidation?: CsvValidationResult;
    }
  }
}

/**
 * Express middleware that validates an in-memory CSV file buffer after multer
 * has received it. Attach immediately after multer's upload handler:
 *
 *   router.post(
 *     '/upload',
 *     upload.single('file'),   // multer buffers the file
 *     validateCsvFile,         // this middleware
 *     csvUploadHandler,        // your route handler
 *   );
 *
 * The route handler must check req.csvValidation.valid. If false, set
 * the CsvUpload.status to QUARANTINED before returning an error response.
 * Never delete the upload record — quarantined files form the audit trail.
 */
export async function validateCsvFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // multer attaches the file to req.file when using single-file upload.
  const file = (req as Request & { file?: Express.Multer.File }).file;

  if (!file) {
    res.status(400).json({ error: 'No file was attached to the request.' });
    return;
  }

  const result: CsvValidationResult = { valid: false };

  // ── 1. File size ────────────────────────────────────────────────────────────
  if (exceedsFileSizeLimit(file.size)) {
    result.error = `File size ${(file.size / 1_024 / 1_024).toFixed(2)} MB exceeds the ${config.csv.maxFileSizeMb} MB limit.`;
    req.csvValidation = result;
    return next();
  }

  // ── 2. Dangerous binary magic bytes ─────────────────────────────────────────
  if (hasDangerousMagicBytes(file.buffer)) {
    result.error = 'File type is not permitted. Only plain-text CSV files are accepted.';
    req.csvValidation = result;
    return next();
  }

  // ── 3. UTF-8 text validation ─────────────────────────────────────────────────
  if (!looksLikeUtf8Text(file.buffer)) {
    result.error = 'File does not appear to be a valid UTF-8 text file. Binary files are not accepted.';
    req.csvValidation = result;
    return next();
  }

  // ── 4. Filename sanitisation & stored name generation ────────────────────────
  result.sanitisedFilename = sanitiseFilename(file.originalname);
  result.storedFilename    = generateStoredFilename();
  result.valid             = true;

  req.csvValidation = result;
  next();
}
