const TABLE = {
  0: { text: "Clear sky", visual: "clear", icon: "clear" },
  1: { text: "Mainly clear", visual: "clear", icon: "clear" },
  2: { text: "Partly cloudy", visual: "cloudy", icon: "cloudy" },
  3: { text: "Overcast", visual: "cloudy", icon: "cloudy" },
  45: { text: "Fog", visual: "cloudy", icon: "fog" },
  48: { text: "Depositing rime fog", visual: "cloudy", icon: "fog" },
  51: { text: "Light drizzle", visual: "rain", icon: "drizzle" },
  53: { text: "Drizzle", visual: "rain", icon: "drizzle" },
  55: { text: "Heavy drizzle", visual: "rain", icon: "drizzle" },
  61: { text: "Slight rain", visual: "rain", icon: "rain" },
  63: { text: "Rain", visual: "rain", icon: "rain" },
  65: { text: "Heavy rain", visual: "rain", icon: "rain" },
  71: { text: "Slight snow", visual: "cloudy", icon: "snow" },
  73: { text: "Snow", visual: "cloudy", icon: "snow" },
  75: { text: "Heavy snow", visual: "cloudy", icon: "snow" },
  80: { text: "Rain showers", visual: "rain", icon: "rain" },
  81: { text: "Rain showers", visual: "rain", icon: "rain" },
  82: { text: "Violent rain showers", visual: "rain", icon: "rain" },
  95: { text: "Thunderstorm", visual: "storm", icon: "storm" },
  96: { text: "Thunderstorm with hail", visual: "storm", icon: "storm" },
  99: { text: "Thunderstorm with heavy hail", visual: "storm", icon: "storm" },
};

export function mapWmo(code, isDay = 1) {
  const entry = TABLE[code] || {
    text: "Unknown conditions",
    visual: "cloudy",
    icon: "cloudy",
  };
  const night = isDay === 0;
  return {
    text: entry.text,
    visual: night ? "night" : entry.visual,
    icon: night ? `${entry.icon}-night` : `${entry.icon}-day`,
  };
}
