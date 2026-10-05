export function defaultUnits() {
  return {
    temperature: "C",
    wind: "kmh",
    clock: "12h",
  };
}

export function convertTemperature(celsius, unit = "C") {
  if (unit === "F") {
    return (celsius * 9) / 5 + 32;
  }
  return celsius;
}

export function convertWind(metresPerSecond, unit = "kmh") {
  if (unit === "ms") {
    return metresPerSecond;
  }
  if (unit === "mph") {
    return metresPerSecond * 2.2369362921;
  }
  return metresPerSecond * 3.6;
}
