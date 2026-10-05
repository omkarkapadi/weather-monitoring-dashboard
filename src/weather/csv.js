export const ARCHIVE_CSV_COLUMNS = ["date", "high", "low", "precipitation", "place"];

export function buildCsv(rows, columns) {
  const header = columns.join(",");
  const lines = (rows || []).map((row) =>
    columns.map((column) => escapeCsv(row?.[column])).join(","),
  );
  return [header, ...lines].join("\n");
}

export function csvFileName(label, start, end) {
  const slug = String(label || "place")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `weather-${slug || "place"}-${start}-to-${end}.csv`;
}

export function downloadCsv(
  csv,
  fileName,
  {
    createObjectURL = URL.createObjectURL,
    revokeObjectURL = URL.revokeObjectURL,
    documentRef = document,
  } = {},
) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const href = createObjectURL(blob);
  const link = documentRef.createElement("a");
  link.href = href;
  link.download = fileName;
  documentRef.body.appendChild(link);
  link.click();
  link.remove();
  revokeObjectURL(href);
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}
