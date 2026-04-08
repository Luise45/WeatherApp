
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!city) return;
    navigate(`/weather?city=${city}`);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 text-white">
      <div className="backdrop-blur-md bg-white/10 p-10 rounded-3xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">🌦️ Weather App</h1>

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
      </div>
    </div>
  );
}


