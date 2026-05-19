import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Recent from "./Recent";


type CitySuggestion = {
  name: string;
  country: string;
  lat: number;
  lon: number;
};
export default function Home() {
  const [city, setCity] = useState("");
  
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!city) return;

    let searches = JSON.parse(
      localStorage.getItem("recentCities") ?? "[]"
    ) as string[];
    searches = searches.filter((c) => c !== city);
    searches.unshift(city);
    searches = searches.slice(0, 5);
    localStorage.setItem("recentCities", JSON.stringify(searches));

    navigate(`/weather?city=${city}`);
  };

  useEffect(() => {
  if (!city || city.length < 2) {
    setSuggestions([]);
    return;
  }

  const timer = setTimeout(() => {
    fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=5&appid=YOUR_API_KEY`
    )
      .then((res) => res.json())
      .then((data: CitySuggestion[]) => {
        setSuggestions(data ?? []);
      })
      .catch(() => setSuggestions([]));
  }, 300);

  return () => clearTimeout(timer);
}, [city]);

  return (
    <div className="home-container">
      <h1>Weather Forecast</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-3 rounded-xl text-black outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-white text-black px-4 rounded-xl hover:bg-gray-200 transition"
        >
          Search
        </button>
      </div>

      {city && suggestions.length > 0 && (
        <ul className="bg-white text-black rounded-xl mt-2 shadow-lg">
          {suggestions.map((s, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                setCity(s.name);
                setSuggestions([]);
              }}
            >
              {s.name}, {s.country}
            </li>
          ))}
        </ul>
      )}

      <Recent />
    </div>
  );
}

