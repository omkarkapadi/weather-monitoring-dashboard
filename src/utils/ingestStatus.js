function toDate(value) {
  if (!value) {
    return null;
  }
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapIngestStatus(docs) {
  return (docs || [])
    .map((entry) => ({
      id: entry.id || String(entry.city || "").trim().toLowerCase(),
      city: String(entry.city || "").trim(),
      lastSuccessAt: toDate(entry.lastSuccessAt),
      lastError: String(entry.lastError || "").trim() || null,
    }))
    .filter((row) => row.city)
    .sort((left, right) => left.city.localeCompare(right.city));
}

export function ingestHealth(row) {
  if (row?.lastError) {
    return "error";
  }
  if (row?.lastSuccessAt) {
    return "ok";
  }
  return "unknown";
}

export function formatIngestTime(value) {
  const date = toDate(value);
  return date ? date.toLocaleString() : "Never";
}
