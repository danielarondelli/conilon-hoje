import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import ConilonHojeIntegrado from "./ConilonHojeIntegrado.jsx";
import PremiumPreview from "./pages/premium/PremiumPreview.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConilonHojeIntegrado />} />
        <Route path="/premium" element={<PremiumPreview />} />
      </Routes>
    </BrowserRouter>
    <Analytics />
  </React.StrictMode>
);