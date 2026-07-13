import React, { useEffect, useRef } from "react";

import PremiumCooabrielClaude from "./PremiumCooabrielClaude.jsx";
import PremiumTermometroMercado from "./PremiumTermometroMercado.jsx";
import PremiumNoticias from "./PremiumNoticias.jsx";

export default function PremiumPreview() {
  const carouselRef = useRef(null);
  const slideRefs = useRef([]);

  useEffect(() => {
    const bodyMarginAnterior = document.body.style.margin;
    const bodyBackgroundAnterior = document.body.style.background;
    const bodyOverflowXAnterior = document.body.style.overflowX;
    const htmlBackgroundAnterior =
      document.documentElement.style.background;

    document.body.style.margin = "0";
    document.body.style.background = "#07110c";
    document.body.style.overflowX = "hidden";
    document.documentElement.style.background = "#07110c";

    return () => {
      document.body.style.margin = bodyMarginAnterior;
      document.body.style.background = bodyBackgroundAnterior;
      document.body.style.overflowX = bodyOverflowXAnterior;
      document.documentElement.style.background =
        htmlBackgroundAnterior;
    };
  }, []);

  function irParaPagina(index) {
    const carousel = carouselRef.current;
    const slide = slideRefs.current[index];

    if (!carousel || !slide) return;

    carousel.scrollTo({
      left: slide.offsetLeft,
      behavior: "smooth",
    });
  }

  function renderizarIndicador(indiceAtivo) {
    return (
      <div style={styles.indicador}>
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => irParaPagina(index)}
            aria-label={`Ir para a página ${index + 1}`}
            style={{
              ...styles.bolinha,
              ...(indiceAtivo === index
                ? styles.bolinhaAtiva
                : styles.bolinhaInativa),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={styles.pagina}>
      <div ref={carouselRef} style={styles.carousel}>
        <div
          ref={(elemento) => {
            slideRefs.current[0] = elemento;
          }}
          style={styles.phoneColumn}
        >
          <PremiumCooabrielClaude />
          {renderizarIndicador(0)}
        </div>

        <div
          ref={(elemento) => {
            slideRefs.current[1] = elemento;
          }}
          style={styles.phoneColumn}
        >
          <PremiumTermometroMercado />
          {renderizarIndicador(1)}
        </div>

        <div
          ref={(elemento) => {
            slideRefs.current[2] = elemento;
          }}
          style={styles.phoneColumn}
        >
          <PremiumNoticias />
          {renderizarIndicador(2)}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pagina: {
    width: "100%",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    background: "#07110c",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  carousel: {
    display: "flex",
    gap: "18px",
    width: "100%",
    alignItems: "flex-start",
    overflowX: "auto",
    overflowY: "hidden",
    margin: 0,
    padding: 0,
    background: "#07110c",
    scrollSnapType: "x mandatory",
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
  },

  phoneColumn: {
    position: "relative",
    width: "390px",
    minWidth: "390px",
    maxWidth: "390px",
    flex: "0 0 390px",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    scrollSnapAlign: "start",
    scrollSnapStop: "always",
  },

  indicador: {
    position: "absolute",
    top: "146px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  bolinha: {
    width: "8px",
    height: "8px",
    padding: 0,
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
  },

  bolinhaAtiva: {
    background: "#C8963C",
  },

  bolinhaInativa: {
    background: "rgba(245, 240, 232, 0.38)",
  },
};