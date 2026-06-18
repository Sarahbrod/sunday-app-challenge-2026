'use client';

import { useCallback, useEffect, useState } from 'react';

export type DataSource = 'YOUTUBE_EXPORT' | 'SPOTIFY_EXPORT' | 'CUSTOM' | 'UNKNOWN';

export interface CsvUploadResult {
  rowCount:      number;
  columnCount:   number;
  columnHeaders: string[];
  dataSource:    DataSource;
  sampleRows:    Record<string, string>[];  // first 50 rows
  summaryStats:  Record<string, string | number>;
  truncated:     boolean;
  uploadedAt:    string; // ISO timestamp
}

const STORAGE_KEY = 'csv_upload_result';

function load(): CsvUploadResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CsvUploadResult) : null;
  } catch { return null; }
}

function save(result: CsvUploadResult): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // sessionStorage can fail if storage quota is exceeded (very large previews)
    console.warn('[useCsvData] sessionStorage write failed — data will not persist across refreshes');
  }
}

export function useCsvData() {
  const [csvData, setCsvData] = useState<CsvUploadResult | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setCsvData(load());
    setInitialized(true);
  }, []);

  /**
   * Uploads a CSV file to /api/csv/upload, parses the response,
   * persists the result, and returns it.
   *
   * Throws with a user-facing message on validation or server errors.
   */
  const upload = useCallback(async (file: File): Promise<CsvUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/csv/upload', {
      method: 'POST',
      body:   formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `Upload failed (${res.status}). Please try again.`);
    }

    const data = await res.json() as Omit<CsvUploadResult, 'uploadedAt'>;
    const result: CsvUploadResult = { ...data, uploadedAt: new Date().toISOString() };

    save(result);
    setCsvData(result);
    return result;
  }, []);

  /** Clears the stored CSV data (e.g. when user wants to start fresh). */
  const clear = useCallback(() => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
    setCsvData(null);
  }, []);

  return { csvData: initialized ? csvData : null, upload, clear };
}
