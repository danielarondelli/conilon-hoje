import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import App from "./App.jsx";
import PremiumCooabriel from "./pages/PremiumCooabriel.jsx";
function PremiumHome() {
  return (
    <div style={{ padding: 20, color: "#111", fontSize: 24 }}>
      Premium em construção
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/premium" element={<PremiumCooabriel />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);