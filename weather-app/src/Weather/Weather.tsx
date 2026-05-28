import { useState, useEffect } from "react";
import "./Weather.css";

const weatherIcons = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "❄️",
};

const weatherBackgrounds = {
  clear: "url('https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920')",
  cloudy: "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920')",
  rain: "url('https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920')",
  snow: "url('https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=1920')",
  fog: "url('https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920')",
};

type WeatherData = {
  current_weather: {
    weathercode: number;
    temperature: number;
    windspeed: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    windspeed_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
    weathercode: number[];
  };
};

type MarineData = {
  hourly?: {
    wave_height: number[];
    sea_surface_temperature: number[];
  };
};

export type WeatherSearch = string | {
  label: string;
  lat?: number;
  lon?: number;
};

function getWeatherType(code: number): string {
  if ([0].includes(code)) return "clear";
  if ([1, 2, 3].includes(code)) return "cloudy";
  if ([45, 48].includes(code)) return "fog";
  if ([61, 63, 65].includes(code)) return "rain";
  if ([71].includes(code)) return "snow";
  return "clear";
}

function getSearchLabel(search: WeatherSearch) {
  return typeof search === "string" ? search : search.label;
}

function getSearchCoordinates(search: WeatherSearch) {
  if (typeof search === "string") {
    return { latitude: NaN, longitude: NaN };
  }

  return {
    latitude: typeof search.lat === "number" ? search.lat : NaN,
    longitude: typeof search.lon === "number" ? search.lon : NaN,
  };
}

type WeatherPageProps = {
  search: WeatherSearch;
};

export default function WeatherPage({ search }: WeatherPageProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const city = getSearchLabel(search);
  const [viewMode, setViewMode] = useState("temperature");

  const [marine, setMarine] = useState<MarineData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) return;

    const controller = new AbortController();
    const { latitude, longitude } = getSearchCoordinates(search);

    async function loadWeather() {
      setWeather(null);
      setMarine(null);
      setError("");

      try {
        let location = {
          latitude,
          longitude,
        };

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
              city
            )}`,
            { signal: controller.signal }
          );
          const geo = await geoRes.json();
          const loc = geo.results?.[0];

          if (!loc) {
            setError("City not found");
            return;
          }

          location = {
            latitude: loc.latitude,
            longitude: loc.longitude,
          };
        }

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,precipitation,windspeed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&current_weather=true&timezone=auto`,
          { signal: controller.signal }
        );
        const weatherData = await weatherRes.json();
        setWeather(weatherData);

        const marineRes = await fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${location.latitude}&longitude=${location.longitude}&hourly=wave_height,wave_direction,wave_period,sea_surface_temperature`,
          { signal: controller.signal }
        );
        const marineData = await marineRes.json();
        setMarine(marineData);
      } catch {
        if (!controller.signal.aborted) {
          setError("Weather data could not be loaded");
        }
      }
    }

    loadWeather();

    return () => {
      controller.abort();
    };
  }, [city, search]);

  if (error) {
    return (
      <div className="weather-status">
        {error}
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-status">
        Loading...
      </div>
    );
  }


  const weatherCode = weather.current_weather.weathercode;
  const weatherType = getWeatherType(weatherCode) as keyof typeof weatherBackgrounds;
  
  const backgroundStyle = {
    backgroundImage: `
      linear-gradient(rgba(20,20,40,0.6), rgba(20,20,40,0.9)),
      ${weatherBackgrounds[weatherType]}
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };


  return (
    <section className="weather-panel" style={backgroundStyle}>
      <div className="weather-main">
        <div className="toggle">
          <button
            className={viewMode === "temperature" ? "active" : ""}
            onClick={() => setViewMode("temperature")}
          >
            Temperature
          </button>

          <button
            className={viewMode === "rainwind" ? "active" : ""}
            onClick={() => setViewMode("rainwind")}
          >
            Rain & Wind
          </button>

          <button
            className={viewMode === "marine" ? "active" : ""}
            onClick={() => setViewMode("marine")}
          >
            Marine
          </button>
        </div>


        <h1 className="h1">Weather in {city}</h1>
        <div className="card">
          <div className="icon">
            {weatherIcons[weather.current_weather.weathercode as keyof typeof weatherIcons] || "🌡️"}
          </div>
        </div>
        


{viewMode === "marine" && marine?.hourly ? (
  <>
    <p className="temp">
      {marine.hourly.wave_height[0]} m waves
    </p>
  
    <p className="rain">
       {marine.hourly.sea_surface_temperature[0]}°C water
    </p>
  </>
) : (
  viewMode === "marine" ? (
    <p className="rain">Marine data is not available here.</p>
  ) : (
    <>
      <p className="temp">
        {weather.current_weather.temperature}°C
      </p>
      <p className="wind">
        {weather.current_weather.windspeed} km/h wind
      </p>
      <p className="rain">
        {weather.hourly.precipitation[0]} mm rain
      </p>
    </>
  )
)}


          
        </div>

        <div className="hourly">
  {weather.hourly.time.slice(0, 24).map((t: string, i: number) => (
    <div key={i} className="hour-card">
      <p>{new Date(t).getHours()}:00</p>

      {viewMode === "marine" && marine?.hourly ? (
  <>
    <p>{marine.hourly.wave_height[i]} m</p>
    <p> {marine.hourly.sea_surface_temperature[i]}°</p>
  </>
) : viewMode === "marine" ? (
  <p>N/A</p>
) : viewMode === "temperature" ? (
  <p>{weather.hourly.temperature_2m[i]}°</p>
) : (
  <>
    <p>{weather.hourly.precipitation[i]} mm</p>
    <p>{weather.hourly.windspeed_10m[i]} km/h</p>
  </>
)}
    </div>
  ))}
</div>

        <div className="section"></div>
        <div>
          <h2 className="h2">5-Day Forecast</h2>

          <div className="daily">
  {weather.daily.time.slice(0, 5).map((d: string, i: number) => (
    <div key={i} className="day-card">
      <p>{new Date(d).toLocaleDateString()}</p>

      <div className="text-2xl my-2">
        {weatherIcons[weather.daily.weathercode[i] as keyof typeof weatherIcons] || "🌤️"}
      </div>

      {viewMode === "temperature" ? (
        <p>
          {weather.daily.temperature_2m_max[i]}° /{" "}
          {weather.daily.temperature_2m_min[i]}°
        </p>
      ) : (
        <>
          <p>{weather.daily.precipitation_sum[i]} mm</p>
          <p>{weather.daily.windspeed_10m_max[i]} km/h</p>
        </>
      )}
    </div>
  ))}


 </div>
</div>

   
   <div className="weather-footer">
   <div className="weather-footer p">
        <footer style={{
          position: "relative",
          zIndex: 1,
  
  
          padding: "0.7rem",
          textAlign: "center",
          marginTop: "auto"
        }}>

          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            © {new Date().getFullYear()} Weather App | Data from Open-Meteo and OpenWeatherMap | Developed by Luise   </p>

        </footer>
        </div>
        </div>
  
    
    </section>
    );

}
