import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";

export default function Home() {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!city) return;
    navigate(`/weather?city=${city}`);
  };
 
   
  return (
    <div className="home-container">
        <h1> Weather App</h1>

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

  );
  
}
