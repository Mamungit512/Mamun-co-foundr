/**
 * Serialize a 2D array of cells into a CSV string.
 *
 * Every cell is wrapped in double quotes and any embedded double quotes are
 * escaped (`"` → `""`), so values containing commas, quotes, or newlines stay
 * intact. Rows are joined with CRLF for maximum spreadsheet compatibility.
 *
 * Shared by the admin roster export and the on-demand report endpoints so all
 * CSVs quote identically.
 */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell == null ? "" : String(cell);
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\r\n");
}
