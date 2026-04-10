
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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
  
    if (!weather)
      return (
        <div className="h-screen flex items-center justify-center text-xl">
          Loading...
        </div>
      );
  
    return (
      
      <div className="page">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="back-btn " 
           >
            ← Back
          </button>
  
          <h1 className="h1">Weather in {city}</h1>
  
         
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
          </div>
  
       <div>
        <div className="section"></div>
            <h2 className="h2">Hourly Forecast</h2>
            <div className="hourly">
              {weather.hourly.time.slice(0, 24).map((t, i) => (
                <div
                  key={i}
                  className="hour-card"
                >
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
                <div
                  key={i}
                  className="day-card"
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
  