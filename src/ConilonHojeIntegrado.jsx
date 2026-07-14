import React, { useState } from "react";

import App from "./App.jsx";
import PremiumPreview from "./pages/premium/PremiumPreview.jsx";

export default function ConilonHojeIntegrado() {
  const [telaAtiva, setTelaAtiva] = useState("basico");

  function abrirPremium() {
    setTelaAtiva("premium");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function voltarAoBasico() {
    setTelaAtiva("basico");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (telaAtiva === "premium") {
    return (
      <div style={styles.premiumShell}>
        <button
          type="button"
          onClick={voltarAoBasico}
          style={styles.voltarBasico}
          aria-label="Voltar ao aplicativo básico"
        >
          ← Voltar ao Básico
        </button>

        <PremiumPreview />
      </div>
    );
  }

  return <App onAbrirPremium={abrirPremium} />;
}

const styles = {
  premiumShell: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #102117 0%, #18261D 100%)",
  },

  voltarBasico: {
    position: "fixed",
    top: "max(12px, env(safe-area-inset-top))",
    left: "12px",
    zIndex: 1000,
    border: "1px solid rgba(200,169,110,0.38)",
    borderRadius: "999px",
    padding: "9px 13px",
    background: "rgba(10,24,17,0.92)",
    color: "#F5F0E8",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(0,0,0,0.32)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
};