import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";


export default function RecentSearches() {
    const [cities, setCities] = useState([]);
    const navigate = useNavigate();
  
    useEffect(() => {
      const stored = JSON.parse(localStorage.getItem("recentCities")) || [];
      setCities(stored);
    }, []);
  
    if (cities.length === 0) return null;
  
    return (
      <div className="recent-container">
        <p className="recent-title">Recent Searches</p>
  
        <div className="chip-container">
          {cities.map((city, index) => (
            <button
              key={index}
              onClick={() => navigate(`/weather?city=${city}`)}
              className="chip"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    );
  }