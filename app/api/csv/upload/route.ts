// Next.js App Router API route — POST /api/csv/upload
//
// Security: validates magic bytes, UTF-8 validity, file size, and strips
// formula injection from every cell before returning any data.
// Tokens/credentials are never involved here — this is file parsing only.

import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE_MB = 10;
const MAX_ROWS         = 100_000;
const PREVIEW_ROWS     = 50; // rows returned to the client for display
const FORMULA_RE       = /^[=+\-@\t\r]+/;

// ─── Security checks ──────────────────────────────────────────────────────────

function hasDangerousMagicBytes(buf: Buffer): boolean {
  if (buf.length < 4) return false;
  return (
    (buf[0] === 0x50 && buf[1] === 0x4b) ||                                    // ZIP/XLSX/DOCX
    (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) || // PDF
    (buf[0] === 0x7f && buf[1] === 0x45 && buf[2] === 0x4c && buf[3] === 0x46) || // ELF
    (buf[0] === 0x4d && buf[1] === 0x5a) ||                                    // PE/EXE
    (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) || // PNG
    (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) ||                  // JPEG
    (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) ||                  // GIF
    (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0)  // OLE2
  );
}

function looksLikeUtf8(buf: Buffer): boolean {
  if (buf.includes(0x00)) return false;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buf.subarray(0, 4_096));
    return true;
  } catch { return false; }
}

function stripFormula(value: string): string {
  return value.replace(FORMULA_RE, '');
}

// ─── CSV parser ───────────────────────────────────────────────────────────────
// Handles quoted fields, commas inside quotes, escaped double-quotes, CRLF/LF.

function parseRow(line: string): string[] {
  const fields: string[] = [];
  let field    = '';
  let inQuotes = false;
  let i        = 0;

  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { field += '"'; i += 2; }
      else if (ch === '"')                   { inQuotes = false; i++; }
      else                                   { field += ch; i++; }
    } else {
      if      (ch === '"')  { inQuotes = true; i++; }
      else if (ch === ',')  { fields.push(field.trim()); field = ''; i++; }
      else                  { field += ch; i++; }
    }
  }
  fields.push(field.trim());
  return fields;
}

function parseCsvText(text: string): {
  headers: string[];
  rows: Record<string, string>[];
  truncated: boolean;
} {
  // Strip UTF-8 BOM
  const content = text.startsWith('﻿') ? text.slice(1) : text;
  const lines   = content.split(/\r?\n/).filter(l => l.trim().length > 0);

  if (lines.length === 0) return { headers: [], rows: [], truncated: false };

  const rawHeaders = parseRow(lines[0]);
  const headers    = rawHeaders.map(h => h.slice(0, 128));

  // Deduplicate headers
  const seen = new Map<string, number>();
  const dedupedHeaders = headers.map(h => {
    const n = (seen.get(h) ?? 0) + 1;
    seen.set(h, n);
    return n === 1 ? h : `${h}_${n}`;
  });

  const dataLines = lines.slice(1);
  const truncated = dataLines.length > MAX_ROWS;
  const limited   = dataLines.slice(0, MAX_ROWS);

  const rows = limited.map(line => {
    const cells = parseRow(line);
    const obj: Record<string, string> = {};
    dedupedHeaders.forEach((h, i) => {
      obj[h] = stripFormula(cells[i] ?? '');
    });
    return obj;
  });

  return { headers: dedupedHeaders, rows, truncated };
}

// ─── Data source detection ────────────────────────────────────────────────────

type DataSource = 'YOUTUBE_EXPORT' | 'SPOTIFY_EXPORT' | 'CUSTOM' | 'UNKNOWN';

function detectDataSource(headers: string[]): DataSource {
  const h = headers.map(s => s.toLowerCase());
  const isYoutube =
    h.some(c => c.includes('video title') || c.includes('video id') || c.includes('content title')) &&
    h.some(c => c.includes('views') || c.includes('impressions') || c.includes('watch time'));
  const isSpotify =
    h.some(c => c.includes('streams') || c.includes('listeners') || c.includes('starts')) &&
    h.some(c => c.includes('podcast') || c.includes('episode') || c.includes('show'));
  if (isYoutube) return 'YOUTUBE_EXPORT';
  if (isSpotify) return 'SPOTIFY_EXPORT';
  if (h.length > 0) return 'CUSTOM';
  return 'UNKNOWN';
}

// ─── Summary stats ────────────────────────────────────────────────────────────

function summarise(
  rows:    Record<string, string>[],
  headers: string[],
  source:  DataSource,
): Record<string, string | number> {
  const summary: Record<string, string | number> = {};

  if (source === 'YOUTUBE_EXPORT') {
    const viewsCol = headers.find(h => /^views$/i.test(h.trim()));
    const dateCol  = headers.find(h => /^date$/i.test(h.trim()) || /^video publish time/i.test(h.trim()) || /^content publish time/i.test(h.trim()));

    if (viewsCol) {
      const total = rows.reduce((sum, r) => {
        const n = parseFloat(r[viewsCol]?.replace(/,/g, '') ?? '0');
        return sum + (isNaN(n) ? 0 : n);
      }, 0);
      summary['Total views'] = total.toLocaleString();
    }
    if (dateCol) {
      const dates = rows.map(r => r[dateCol]).filter(Boolean).sort();
      if (dates.length > 0) {
        summary['Date range'] = `${dates[0]} – ${dates[dates.length - 1]}`;
      }
    }
  }

  if (source === 'SPOTIFY_EXPORT') {
    const streamsCol = headers.find(h => /streams/i.test(h));
    if (streamsCol) {
      const total = rows.reduce((sum, r) => {
        const n = parseFloat(r[streamsCol]?.replace(/,/g, '') ?? '0');
        return sum + (isNaN(n) ? 0 : n);
      }, 0);
      summary['Total streams'] = total.toLocaleString();
    }
  }

  return summary;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Rate-limit hint (enforce at the proxy/middleware level in production)
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE_MB * 1_024 * 1_024) {
    return NextResponse.json({ error: `File exceeds the ${MAX_FILE_SIZE_MB} MB limit.` }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file attached.' }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    return NextResponse.json({ error: 'Only .csv files are accepted.' }, { status: 422 });
  }

  if (file.size > MAX_FILE_SIZE_MB * 1_024 * 1_024) {
    return NextResponse.json({ error: `File exceeds the ${MAX_FILE_SIZE_MB} MB limit.` }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);

  if (hasDangerousMagicBytes(buffer)) {
    return NextResponse.json({ error: 'File type not permitted. Only plain-text CSV files are accepted.' }, { status: 422 });
  }

  if (!looksLikeUtf8(buffer)) {
    return NextResponse.json({ error: 'File does not appear to be valid UTF-8 text.' }, { status: 422 });
  }

  const text = buffer.toString('utf-8');
  const { headers, rows, truncated } = parseCsvText(text);

  if (headers.length === 0 || rows.length === 0) {
    return NextResponse.json({ error: 'File appears to be empty or has no data rows.' }, { status: 422 });
  }

  const dataSource  = detectDataSource(headers);
  const summaryStats = summarise(rows, headers, dataSource);
  const sampleRows   = rows.slice(0, PREVIEW_ROWS);

  return NextResponse.json({
    rowCount:      rows.length,
    columnCount:   headers.length,
    columnHeaders: headers,
    dataSource,
    sampleRows,
    summaryStats,
    truncated,
  });
}
