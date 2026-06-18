// =============================================================================
// src/modules/csv/csvParser.ts
//
// Purpose: Parses a validated CSV buffer into structured row objects ready
// for database insertion via the CsvRow model. Handles BOM stripping,
// header sanitisation, formula injection removal, and row count enforcement.
//
// Security considerations:
// - Row count is checked incrementally during parsing. When MAX_CSV_ROWS is
//   reached, remaining records are drained without being stored, preventing
//   memory exhaustion from maliciously oversized files.
// - rawData preserves the original cell values before sanitisation, so any
//   stripping action is auditable via the CsvRow record.
// - transformedData contains formula-injection-stripped values. These are
//   the values used in downstream analysis — never rawData directly.
// - relax_column_count is false: rows with a different number of columns
//   than the header row cause the parse to fail. This prevents silently
//   misaligned data from reaching the database.
// - BOM (byte order mark, U+FEFF) is automatically stripped if present.
//   Excel exports often include a BOM.
// - Column headers are trimmed and deduplicated (suffix _2, _3...) to
//   prevent duplicate-key collisions in the rawData/transformedData JSON.
// - No file I/O occurs in this module — it accepts a Buffer that has
//   already been written to disk by the upload handler. The caller is
//   responsible for reading the file from the private storage path.
// =============================================================================

import { parse, type Options as ParseOptions } from 'csv-parse';
import { config } from '../../config/env';
import { stripFormulaInjection } from '../../middleware/fileValidator';

// ─── Output types ─────────────────────────────────────────────────────────────

export interface ParsedRow {
  rowIndex:         number;
  rawData:          Record<string, string>;
  transformedData:  Record<string, string>;
  flagged:          boolean;
  /** Set when one or more cells had formula injection characters removed. */
  flagReason?:      string;
}

export interface CsvParseResult {
  columnHeaders: string[];
  rows:          ParsedRow[];
  rowCount:      number;
  /** True when the file contained more rows than MAX_CSV_ROWS. */
  truncated:     boolean;
}

// ─── Header sanitisation ──────────────────────────────────────────────────────

/** Trims whitespace and caps header length at 128 characters. */
function sanitiseHeader(raw: string): string {
  return raw.trim().slice(0, 128);
}

/**
 * Appends _2, _3, ... to duplicate header names after the first occurrence.
 * Ensures every key in rawData/transformedData JSON is unique.
 */
function deduplicateHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((h) => {
    const count = (seen.get(h) ?? 0) + 1;
    seen.set(h, count);
    return count === 1 ? h : `${h}_${count}`;
  });
}

// ─── Row transformation ───────────────────────────────────────────────────────

/**
 * Applies formula injection stripping to every cell in a row.
 * Returns the transformed record plus a flag indicating whether any cell
 * value was changed.
 */
function transformRow(raw: Record<string, string>): {
  transformed: Record<string, string>;
  flagged:     boolean;
  flagReason?: string;
} {
  const transformed: Record<string, string> = {};
  let flagged    = false;
  let flagReason: string | undefined;

  for (const [key, value] of Object.entries(raw)) {
    const cellStr  = value ?? '';
    const stripped = stripFormulaInjection(cellStr);
    transformed[key] = stripped;

    if (stripped !== cellStr && !flagged) {
      flagged    = true;
      flagReason = 'One or more cells contained formula injection characters that were stripped.';
    }
  }

  return { transformed, flagged, flagReason };
}

// ─── Parser ───────────────────────────────────────────────────────────────────

const PARSE_OPTIONS: ParseOptions = {
  bom:                true,   // Strip UTF-8 BOM if present (common in Excel exports)
  trim:               true,   // Trim whitespace from cell values
  skip_empty_lines:   true,   // Ignore completely blank lines
  relax_column_count: false,  // Reject rows with wrong column count
  cast:               false,  // Keep all values as strings — no auto-casting
};

/**
 * Parses a CSV file buffer that has already been validated by fileValidator.ts.
 *
 * Usage:
 *   const buffer = await fs.promises.readFile(storagePath);
 *   const result = await parseCsvBuffer(buffer);
 *   // Insert result.rows into CsvRow table.
 *
 * @param buffer - Raw file buffer (UTF-8 CSV content).
 * @returns A CsvParseResult containing headers, parsed rows, and metadata.
 * @throws if the CSV is structurally malformed (bad quoting, inconsistent columns).
 */
export async function parseCsvBuffer(buffer: Buffer): Promise<CsvParseResult> {
  const maxRows = config.csv.maxRows;

  return new Promise<CsvParseResult>((resolve, reject) => {
    const rows: ParsedRow[] = [];
    let columnHeaders: string[] = [];
    let rowIndex   = 0;
    let truncated  = false;

    const parser = parse({
      ...PARSE_OPTIONS,
      columns(rawHeaders: string[]) {
        const sanitised = rawHeaders.map(sanitiseHeader);
        columnHeaders   = deduplicateHeaders(sanitised);
        return columnHeaders;
      },
    });

    parser.on('readable', () => {
      let record: Record<string, string> | null;

      // eslint-disable-next-line no-cond-assign
      while ((record = parser.read() as Record<string, string> | null) !== null) {
        if (rowIndex >= maxRows) {
          // Drain remaining records without storing them — prevents unbounded
          // memory growth on oversized files that slipped past the size check.
          truncated = true;
          continue;
        }

        const rawData                          = { ...record };
        const { transformed, flagged, flagReason } = transformRow(rawData);

        rows.push({
          rowIndex,
          rawData,
          transformedData: transformed,
          flagged,
          flagReason,
        });

        rowIndex++;
      }
    });

    parser.on('error', (err: Error) => {
      reject(new Error(`[csvParser] Parse failed: ${err.message}`));
    });

    parser.on('end', () => {
      resolve({
        columnHeaders,
        rows,
        rowCount:  rowIndex,
        truncated,
      });
    });

    parser.write(buffer);
    parser.end();
  });
}

// ─── Insight row detection ────────────────────────────────────────────────────

/**
 * Heuristically identifies the data source from the column headers.
 * Used to set CsvUpload.dataSource after parsing.
 */
export function detectDataSource(
  headers: string[],
): 'YOUTUBE_EXPORT' | 'SPOTIFY_EXPORT' | 'CUSTOM' | 'UNKNOWN' {
  const h = headers.map((s) => s.toLowerCase());

  const isYoutube =
    h.some((c) => c.includes('video title') || c.includes('video id')) &&
    h.some((c) => c.includes('views') || c.includes('impressions'));

  const isSpotify =
    h.some((c) => c.includes('streams') || c.includes('listeners')) &&
    h.some((c) => c.includes('podcast') || c.includes('episode'));

  if (isYoutube) return 'YOUTUBE_EXPORT';
  if (isSpotify) return 'SPOTIFY_EXPORT';
  if (h.length > 0) return 'CUSTOM';
  return 'UNKNOWN';
}
