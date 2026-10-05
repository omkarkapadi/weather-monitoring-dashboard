const DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function utcDay(value) {
  if (value instanceof Date) {
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }
  const [year, month, day] = String(value).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function addUtcDays(value, days) {
  return toIsoDate(new Date(utcDay(value) + days * DAY_MS));
}

export function defaultArchiveRange(now = new Date()) {
  const end = addUtcDays(now, -2);
  return {
    start: addUtcDays(end, -6),
    end,
  };
}

export function validateArchiveRange(start, end, now = new Date()) {
  if (!start || !end) {
    return { ok: false, message: "Choose a start and end date." };
  }
  if (start > end) {
    return { ok: false, message: "Start date must be on or before the end date." };
  }
  const days = Math.round((utcDay(end) - utcDay(start)) / DAY_MS) + 1;
  if (days > 366) {
    return { ok: false, message: "Choose a range of 366 days or less." };
  }
  if (end > addUtcDays(now, -1)) {
    return { ok: false, message: "Archive data is only available through yesterday." };
  }
  return { ok: true, start, end, days };
}
