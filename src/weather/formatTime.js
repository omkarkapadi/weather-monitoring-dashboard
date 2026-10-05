export function formatClock(value, timeZone, clock = "12h") {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: clock !== "24h",
    timeZone,
  }).format(date);
}

export function formatLocalClock(isoLocal, clock = "12h") {
  const match = String(isoLocal || "").match(/T(\d{2}):(\d{2})/);
  if (!match) {
    return "";
  }
  const minute = match[2];
  let hour = Number(match[1]);
  if (clock === "24h") {
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

export function formatLocalDay(isoDate) {
  const date = String(isoDate || "").slice(0, 10);
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return { weekday: "", monthDay: "" };
  }
  const weekday = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  });
  return { weekday, monthDay: `${month}/${day}` };
}

export function dailyHeading(isoDate, todayIso) {
  if (String(isoDate || "").slice(0, 10) === String(todayIso || "").slice(0, 10)) {
    return "Today";
  }
  return formatLocalDay(isoDate).weekday;
}
