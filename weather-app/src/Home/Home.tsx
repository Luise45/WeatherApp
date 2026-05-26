import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Recent from "./Recent";



type CitySuggestion = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
};

export default function Home() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const handleSearch = () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    let searches = JSON.parse(
      localStorage.getItem("recentCities") ?? "[]"
    ) as string[];

    searches = searches.filter((c) => c !== trimmedCity);
    searches.unshift(trimmedCity);
    searches = searches.slice(0, 5);

    localStorage.setItem("recentCities", JSON.stringify(searches));

    navigate(`/weather?city=${encodeURIComponent(trimmedCity)}`);
  };

  useEffect(() => {
    const trimmedCity = city.trim();

    if (!trimmedCity || trimmedCity.length < 2 || !apiKey) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            trimmedCity
          )}&limit=5&appid=${apiKey}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          setSuggestions([]);
          return;
        }

        const data = (await res.json()) as CitySuggestion[];
        setSuggestions(data ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [city, apiKey]);

  return (
    <div className="home-container">
      <h1>Weather Forecast</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="p-3 rounded-xl text-black outline-none"
        />

        <button
          onClick={handleSearch}
          className="bg-white text-black px-4 rounded-xl hover:bg-gray-200 transition"
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="bg-white text-black rounded-xl mt-2 shadow-lg">
          {suggestions.map((s) => {
            const label = `${s.name}${s.state ? `, ${s.state}` : ""}, ${
              s.country
            }`;

            return (
              <li
                key={`${s.name}-${s.state ?? ""}-${s.country}-${s.lat}-${s.lon}`}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setCity(label);
                  setSuggestions([]);
                }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}

      <Recent />
    </div>
  );
}
