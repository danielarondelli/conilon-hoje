import React from "react";

import PremiumCooabrielClaude from "./PremiumCooabrielClaude.jsx";

import PremiumTermometroMercado from "./PremiumTermometroMercado.jsx";
import PremiumNoticias from "./PremiumNoticias.jsx";

export default function PremiumPreview() {
 return (
  <div
    style={{
      minHeight: "100vh",
      background: "#07110C",
      padding: "24px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}
  >
    <div style={{ marginBottom: "18px", color: "#f5f0e8" }}>
      <h1 style={{ margin: 0, fontSize: "28px", lineHeight: 1.1 }}>
        Preview Premium
      </h1>

      <p
        style={{
          margin: "6px 0 0",
          fontSize: "13px",
          color: "rgba(245,240,232,0.62)",
        }}
      >
        Visualização interna dos quatro cards Premium lado a lado.
      </p>
    </div>

    <div
      style={{
        display: "flex",
        gap: "18px",
        alignItems: "flex-start",
        overflowX: "auto",
        paddingBottom: "20px",
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
  },
};