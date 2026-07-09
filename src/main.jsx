import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import App from "./App.jsx";
import PremiumPreview from "./pages/premium/PremiumPreview.jsx";
function PremiumHome() {
  return <PremiumTermometroMercado />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/premium" element={<PremiumPreview />} />
      </Routes>

      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);