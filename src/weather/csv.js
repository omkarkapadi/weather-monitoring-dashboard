export function buildCsv(rows, columns) {
  const header = columns.join(",");
  const lines = (rows || []).map((row) =>
    columns.map((column) => escapeCsv(row?.[column])).join(","),
  );
  return [header, ...lines].join("\n");
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}
