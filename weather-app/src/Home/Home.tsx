import { useState, useEffect } from "react";
import "./Home.css";
import Recent, { type RecentSearch } from "./Recent";
import WeatherPage from "../Weather/Weather";



type CitySuggestion = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
};

function getSuggestionLabel(suggestion: CitySuggestion) {
  return `${suggestion.name}${
    suggestion.state ? `, ${suggestion.state}` : ""
  }, ${suggestion.country}`;
}

function getSearchLabel(search: RecentSearch) {
  return typeof search === "string" ? search : search.label;
}

export default function Home() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<CitySuggestion | null>(null);
  const [selectedSearch, setSelectedSearch] = useState<RecentSearch | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    return JSON.parse(localStorage.getItem("recentCities") ?? "[]") as RecentSearch[];
  });

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const saveSearch = (search: RecentSearch) => {
    const searchLabel = getSearchLabel(search);
    const searches = recentSearches
      .filter((savedSearch) => getSearchLabel(savedSearch) !== searchLabel)
      .slice(0, 4);

    const nextSearches = [search, ...searches];

    setRecentSearches(nextSearches);
    localStorage.setItem("recentCities", JSON.stringify(nextSearches));
  };

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

    setSelectedSearch(search);
    saveSearch(search);
    setSuggestions([]);
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
    <main className="dashboard-page">
      <section className="home-container">
        <h1>Weather Forecast</h1>

        <div className="search-row">
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
          />

          <button onClick={handleSearch}>
            Search
          </button>
        </div>

        {suggestions.length > 0 && (
          <ul className="suggestion-list">
            {suggestions.map((s) => {
              const label = getSuggestionLabel(s);

              return (
                <li
                  key={`${s.name}-${s.state ?? ""}-${s.country}-${s.lat}-${s.lon}`}
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

        <Recent
          cities={recentSearches}
          onSelect={(search) => {
            setCity(getSearchLabel(search));
            setSelectedSearch(search);
            saveSearch(search);
          }}
        />
      </section>

      {selectedSearch ? (
        <WeatherPage search={selectedSearch} />
      ) : (
        <section className="empty-dashboard">
          <h2>Search for a city to see the dashboard.</h2>
         
        </section>
      )}
    </main>
  );
}
