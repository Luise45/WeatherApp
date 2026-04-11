import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

function getWeatherType(code) {
  if ([0].includes(code)) return "clear";
  if ([1, 2, 3].includes(code)) return "cloudy";
  if ([45, 48].includes(code)) return "fog";
  if ([61, 63, 65].includes(code)) return "rain";
  if ([71].includes(code)) return "snow";
  return "clear";
}

export default function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city");

  useEffect(() => {
    if (!city) return;

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
      .then((res) => res.json())
      .then((geo) => {
        const loc = geo.results?.[0];
        if (!loc) {
          alert("City not found");
          return;
        }

        return fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto`
        );
      })
      .then((res) => res.json())
      .then((data) => setWeather(data));
  }, [city]);

  if (!weather) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }


  const weatherCode = weather.current_weather.weathercode;
  const weatherType = getWeatherType(weatherCode);
  
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
 
    <div className="page" style={backgroundStyle}>
   <div className="background-layer" style={backgroundStyle}>
  
  
   <div className="weather-header">
 <div className="city-name">
    <header style={{
      position: "relative",
      zIndex: 1,

      backdropFilter: "blur(10px)",
      padding: "0.6rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "1rem"
    }}>
      <div className="max-w-5xl mx-auto p-4">
        <button
          onClick={() => navigate("/")}
          className="back-btn"
        >
          ← Back
        </button>
        </div>
        
    </header>
    </div>
    </div>
   
 
     
        <div className="content-layer">
        <div className="weather-main">
        <h1 className="h1">Weather in {city}</h1>
        <div className="content-layer">
        <div className="card">
          <div className="icon">
            {weatherIcons[weather.current_weather.weathercode] || "🌡️"}
          </div>
          <p className="temp">
            {weather.current_weather.temperature}°C
          </p>
          <p className="wind">
            {weather.current_weather.windspeed} km/h wind
          </p>
          <p className="rain">
            {weather.current_weather.percipitation} 
          </p>
          
        </div>

        <div>
          <div className="section"></div>
          <h2 className="h2">Hourly Forecast</h2>
          <div className="hourly">
            {weather.hourly.time.slice(0, 24).map((t, i) => (
              <div key={i} className="hour-card">
                <p>{new Date(t).getHours()}:00</p>
                <p className="text-lg">
                  {weather.hourly.temperature_2m[i]}°
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="section"></div>
        <div>
          <h2 className="h2">5-Day Forecast</h2>
          <div className="daily">
            {weather.daily.time.slice(0, 5).map((d, i) => (
              <div key={i} className="day-card">
                <p className="font-medium">
                  {new Date(d).toLocaleDateString()}
                </p>
                <div className="text-2xl my-2">
                  {weatherIcons[weather.daily.weathercode[i]] || "🌤️"}
                </div>
                <p>
                  {weather.daily.temperature_2m_max[i]}° /{" "}
                  {weather.daily.temperature_2m_min[i]}°
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>

   <div className="weather-footer">
   <div className="weather-footer p">
        <footer style={{
          position: "relative",
          zIndex: 1,
  
          backdropFilter: "blur(10px)",
          padding: "1rem",
          textAlign: "center",
          marginTop: "auto"
        }}>

          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            © {new Date().getFullYear()} Weather App | Data from Open-Meteo
          </p>

        </footer>
        </div>
        </div>
      </div>



  );
}