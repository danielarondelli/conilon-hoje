import React, { useEffect } from "react";

import PremiumCooabrielClaude from "./PremiumCooabrielClaude.jsx";
import PremiumTermometroMercado from "./PremiumTermometroMercado.jsx";
import PremiumNoticias from "./PremiumNoticias.jsx";

export default function PremiumPreview() {
  useEffect(() => {
    const bodyMarginAnterior = document.body.style.margin;
    const bodyBackgroundAnterior = document.body.style.background;
    const htmlBackgroundAnterior =
      document.documentElement.style.background;

    document.body.style.margin = "0";
    document.body.style.background = "#07110c";
    document.documentElement.style.background = "#07110c";

    return () => {
      document.body.style.margin = bodyMarginAnterior;
      document.body.style.background = bodyBackgroundAnterior;
      document.documentElement.style.background =
        htmlBackgroundAnterior;
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "#07110c",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "18px",
          alignItems: "flex-start",
          overflowX: "auto",
          padding: 0,
          margin: 0,
          background: "#07110c",
        }}
      >
        <div style={styles.phoneColumn}>
          <PremiumCooabrielClaude />
        </div>

        <div style={styles.phoneColumn}>
          <PremiumTermometroMercado />
        </div>

        <div style={styles.phoneColumn}>
          <PremiumNoticias />
        </div>
      </div>
    </div>
  );
}

const styles = {
  phoneColumn: {
    width: "390px",
    minWidth: "390px",
    maxWidth: "390px",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
};