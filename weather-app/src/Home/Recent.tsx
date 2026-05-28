import "./Home.css";

export type RecentSearch = string | {
  label: string;
  lat?: number;
  lon?: number;
};

function getSearchLabel(search: RecentSearch) {
  return typeof search === "string" ? search : search.label;
}

type RecentSearchesProps = {
  cities: RecentSearch[];
  onSelect: (search: RecentSearch) => void;
};

export default function RecentSearches({ cities, onSelect }: RecentSearchesProps) {
  if (cities.length === 0) return null;

  return (
    <div className="recent-container">
      <p className="recent-title">Recent Searches</p>

      <div className="chip-container">
        {cities.map((city, index) => (
          <button
            key={index}
            onClick={() => onSelect(city)}
            className="chip"
          >
            {getSearchLabel(city)}
          </button>
        ))}
      </div>
    </div>
  );
}
