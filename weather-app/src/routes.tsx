import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home/App";
import WeatherPage from "./WeatherPage/WeatherPage";

export default function App() {
   
  return (
    <Router>
      <Routes>
        <Route path="/"  element={<Home />} />
        <Route path="/weather" element={<WeatherPage />} />
      </Routes>
    </Router>
  );
}