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

type RecentSearch = string | {
  label: string;
  lat?: number;
  lon?: number;
};

function getSuggestionLabel(suggestion: CitySuggestion) {
  return `${suggestion.name}${
    suggestion.state ? `, ${suggestion.state}` : ""
  }, ${suggestion.country}`;
}

function getWeatherUrl(search: RecentSearch) {
  if (typeof search === "string") {
    return `/weather?city=${encodeURIComponent(search)}`;
  }

  const params = new URLSearchParams({ city: search.label });

  if (typeof search.lat === "number" && typeof search.lon === "number") {
    params.set("lat", String(search.lat));
    params.set("lon", String(search.lon));
  }

  return `/weather?${params.toString()}`;
}

export default function Home() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<CitySuggestion | null>(null);
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const handleSearch = () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    const selectedLabel = selectedSuggestion
      ? getSuggestionLabel(selectedSuggestion)
      : "";
    const search: RecentSearch =
      selectedSuggestion && selectedLabel === trimmedCity
        ? {
            label: selectedLabel,
            lat: selectedSuggestion.lat,
            lon: selectedSuggestion.lon,
          }
        : trimmedCity;

    let searches = JSON.parse(
      localStorage.getItem("recentCities") ?? "[]"
    ) as RecentSearch[];

    searches = searches.filter((savedSearch) => {
      const savedLabel =
        typeof savedSearch === "string" ? savedSearch : savedSearch.label;

      return savedLabel !== trimmedCity;
    });
    searches.unshift(search);
    searches = searches.slice(0, 5);

    localStorage.setItem("recentCities", JSON.stringify(searches));

    navigate(getWeatherUrl(search));
  };

  useEffect(() => {
    const trimmedCity = city.trim();

    if (!trimmedCity || trimmedCity.length < 2 || !apiKey) return;

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
          onChange={(e) => {
            const value = e.target.value;

            setCity(value);
            setSelectedSuggestion(null);

            if (value.trim().length < 2) {
              setSuggestions([]);
            }
          }}
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
            const label = getSuggestionLabel(s);

            return (
              <li
                key={`${s.name}-${s.state ?? ""}-${s.country}-${s.lat}-${s.lon}`}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setCity(label);
                  setSelectedSuggestion(s);
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
