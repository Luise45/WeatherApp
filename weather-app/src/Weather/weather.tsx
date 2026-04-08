import { useEffect, useState } from "react";

export default function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  
  navigator.geolocation.getCurrentPosition((pos) => {
    console.log(pos.coords.latitude, pos.coords.longitude);
  });
  const weatherMap = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    61: "🌧️",
  };

  // Berlin default coords
  const lat = 52.52;
  const lon = 13.41;

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Weather</h1>


      <div className="mb-6 p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Current Weather</h2>
        <p>Temperature: {weather.current_weather.temperature}°C</p>
        <p>Wind Speed: {weather.current_weather.windspeed} km/h</p>
      </div>


      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Hourly Forecast</h2>
        <div className="flex overflow-x-auto gap-4">
          {weather.hourly.time.slice(0, 24).map((time, i) => (
            <div key={i} className="p-3 min-w-[80px] rounded-xl shadow">
              <p className="text-sm">
                {new Date(time).getHours()}:00
              </p>
              <p>{weather.hourly.temperature_2m[i]}°C</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">5-Day Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {weather.daily.time.slice(0, 5).map((day, i) => (
            <div key={i} className="p-4 rounded-xl shadow">
              <p className="font-medium">
                {new Date(day).toLocaleDateString()}
              </p>
              <p>
                {weather.daily.temperature_2m_max[i]}° / {" "}
                {weather.daily.temperature_2m_min[i]}°C
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}