import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import WeatherPage from "./Weather/Weather";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/weather" element={<WeatherPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

