import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
export default function WeatherPage() {
    const [weather, setWeather] = useState(null);
    const navigate = useNavigate();

    const query = new URLSearchParams(window.location.search);
    const city = query.get("city");
  
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
  
    if (!weather)
      return (
        <div className="h-screen flex items-center justify-center text-xl">
          Loading...
        </div>
      );
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-700 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="mb-4 bg-white/20 px-4 py-2 rounded-xl backdrop-blur hover:bg-white/30"
          >
            ← Back
          </button>
  
          <h1 className="text-3xl font-bold mb-6">Weather in {city}</h1>
  
    
          <div className="mb-6 p-6 rounded-3xl bg-white/10 backdrop-blur shadow-xl">
            <div className="text-5xl mb-2">
              {weatherIcons[weather.current_weather.weathercode] || "🌡️"}
            </div>
            <p className="text-2xl">
              {weather.current_weather.temperature}°C
            </p>
          </div>
  

          <div className="mb-6">
            <h2 className="text-xl mb-3">Hourly Forecast</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {weather.hourly.time.slice(0, 24).map((t, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/10 backdrop-blur shadow min-w-[90px] text-center"
                >
                  <p>{new Date(t).getHours()}:00</p>
                  <p className="text-lg">
                    {weather.hourly.temperature_2m[i]}°
                  </p>
                </div>
              ))}
            </div>
          </div>
  
          {/* Daily */}
          <div>
            <h2 className="text-xl mb-3">5-Day Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {weather.daily.time.slice(0, 5).map((d, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/10 backdrop-blur shadow text-center"
                >
                  <p className="font-medium">
                    {new Date(d).toLocaleDateString()}
                  </p>
                  <div className="text-2xl my-2">
                    {weatherIcons[weather.daily.weathercode[i]] || "🌤️"}
                  </div>
                  <p>
                    {weather.daily.temperature_2m_max[i]}° / {" "}
                    {weather.daily.temperature_2m_min[i]}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  
  
  