import { Card } from "../ui/Card.jsx";
import { Stat } from "../ui/Stat.jsx";

export function WeatherHero({ hero }) {
  return (
    <Card className={`weather-hero is-${hero.visual}`} data-visual={hero.visual}>
      <p className="eyebrow">Current weather</p>
      <div className="weather-hero-top">
        <div>
          <h2>{hero.place}</h2>
          <p className="weather-hero-condition">
            <span aria-hidden="true">{hero.icon}</span> {hero.condition}
          </p>
          <p className="weather-hero-range">
            High {hero.high} · Low {hero.low}
          </p>
        </div>
        <p className="weather-hero-temp">{hero.temperature}</p>
      </div>
      <p className="weather-hero-feels">Feels like {hero.feelsLike}</p>
      <dl className="weather-hero-metrics">
        <Stat label="Humidity" value={hero.humidity} />
        <Stat label="Wind" value={hero.wind} />
        <Stat label="Gusts" value={hero.gust} />
        <Stat label="Pressure" value={hero.pressure} />
        <Stat label="Visibility" value={hero.visibility} />
        <Stat label="UV index" value={hero.uvIndex} />
        <Stat label="Dew point" value={hero.dewPoint} />
        <Stat label="Cloud cover" value={hero.cloudCover} />
        <Stat label="Rain chance" value={hero.precip} />
        <Stat label="Sunrise" value={hero.sunrise} />
        <Stat label="Sunset" value={hero.sunset} />
        <Stat label="US AQI" value={`${hero.aqi.value} · ${hero.aqi.label}`} />
      </dl>
      {hero.updatedAt ? <p className="meta">{hero.updatedAt}</p> : null}
    </Card>
  );
}
