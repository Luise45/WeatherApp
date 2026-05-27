import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

type RecentSearch = string | {
  label: string;
  lat?: number;
  lon?: number;
};

function getSearchLabel(search: RecentSearch) {
  return typeof search === "string" ? search : search.label;
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

export default function RecentSearches() {
  const [cities] = useState<RecentSearch[]>(() => {
    const stored = JSON.parse(
      localStorage.getItem("recentCities") ?? "[]"
    ) as RecentSearch[];

    return stored;
  });
  const navigate = useNavigate();

  if (cities.length === 0) return null;

  return (
    <div className="recent-container">
      <p className="recent-title">Recent Searches</p>

      <div className="chip-container">
        {cities.map((city, index) => (
          <button
            key={index}
            onClick={() => navigate(getWeatherUrl(city))}
            className="chip"
          >
            {getSearchLabel(city)}
          </button>
        ))}
      </div>
    </div>
  );
}
