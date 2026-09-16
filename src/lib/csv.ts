import Papa from "papaparse";

/** Neutraliza fórmulas em células (proteção contra formula injection em planilhas). */
export function safeCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const data = rows.map((r) => columns.map((c) => safeCell(r[c])));
  return "﻿" + Papa.unparse({ fields: columns, data }, { delimiter: ";", newline: "\r\n" });
}

export function parseCsv(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const clean = text.replace(/^﻿/, "");
  const res = Papa.parse<Record<string, string>>(clean, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase() });
  return { rows: res.data, errors: res.errors.map((e) => `linha ${(e.row ?? 0) + 1}: ${e.message}`) };
}
