import React, { useEffect, useRef, useState } from "react";

import PremiumCooabrielClaude from "./PremiumCooabrielClaude.jsx";
import PremiumTermometroMercado from "./PremiumTermometroMercado.jsx";
import PremiumNoticias from "./PremiumNoticias.jsx";

export default function PremiumPreview() {
  const carouselRef = useRef(null);
  const slideRefs = useRef([]);
  const conteudoRefs = useRef([]);
  const temporizadorScrollRef = useRef(null);

  const [paginaAtiva, setPaginaAtiva] = useState(0);
  const [alturaAtiva, setAlturaAtiva] = useState(null);

  useEffect(() => {
    const bodyMarginAnterior = document.body.style.margin;
    const bodyBackgroundAnterior = document.body.style.background;
    const bodyOverflowXAnterior = document.body.style.overflowX;
    const htmlBackgroundAnterior =
      document.documentElement.style.background;

    document.body.style.margin = "0";
    document.body.style.background =
      "linear-gradient(180deg, #102117 0%, #18261D 100%)";
    document.body.style.overflowX = "hidden";
    document.documentElement.style.background =
      "linear-gradient(180deg, #102117 0%, #18261D 100%)";

    return () => {
      document.body.style.margin = bodyMarginAnterior;
      document.body.style.background = bodyBackgroundAnterior;
      document.body.style.overflowX = bodyOverflowXAnterior;
      document.documentElement.style.background =
        htmlBackgroundAnterior;
    };
  }, []);

  function medirPagina(index) {
    const conteudo = conteudoRefs.current[index];

    if (!conteudo) return;

    const alturaReal = Math.ceil(conteudo.scrollHeight);

    if (alturaReal > 0) {
      setAlturaAtiva(alturaReal + 2);
    }
  }

  useEffect(() => {
    const primeiroFrame = window.requestAnimationFrame(() => {
      medirPagina(0);
    });

    const segundaMedicao = window.setTimeout(() => {
      medirPagina(0);
    }, 250);

    return () => {
      window.cancelAnimationFrame(primeiroFrame);
      window.clearTimeout(segundaMedicao);
    };
  }, []);

  useEffect(() => {
    medirPagina(paginaAtiva);

    const conteudoAtual = conteudoRefs.current[paginaAtiva];

    if (!conteudoAtual || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observador = new ResizeObserver(() => {
      medirPagina(paginaAtiva);
    });

    observador.observe(conteudoAtual);

    return () => {
      observador.disconnect();
    };
  }, [paginaAtiva]);

  useEffect(() => {
    function medirNovamente() {
      medirPagina(paginaAtiva);
    }

    window.addEventListener("resize", medirNovamente);

    return () => {
      window.removeEventListener("resize", medirNovamente);
    };
  }, [paginaAtiva]);

  useEffect(() => {
    return () => {
      if (temporizadorScrollRef.current) {
        window.clearTimeout(temporizadorScrollRef.current);
      }
    };
  }, []);

  function identificarPaginaAtiva() {
    const carousel = carouselRef.current;

    if (!carousel || carousel.clientWidth === 0) return;

    const indiceCalculado = Math.round(
      carousel.scrollLeft / carousel.clientWidth
    );

    const ultimoIndice = slideRefs.current.length - 1;

    const indiceSeguro = Math.max(
      0,
      Math.min(indiceCalculado, ultimoIndice)
    );

    setPaginaAtiva(indiceSeguro);

    window.requestAnimationFrame(() => {
      medirPagina(indiceSeguro);
    });
  }

  function acompanharScroll() {
    if (temporizadorScrollRef.current) {
      window.clearTimeout(temporizadorScrollRef.current);
    }

    temporizadorScrollRef.current = window.setTimeout(() => {
      identificarPaginaAtiva();
    }, 120);
  }

  function irParaPagina(index) {
    const carousel = carouselRef.current;
    const slide = slideRefs.current[index];

    if (!carousel || !slide) return;

    carousel.scrollTo({
      left: slide.offsetLeft,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      setPaginaAtiva(index);
      medirPagina(index);
    }, 350);
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
      <div
        ref={carouselRef}
        onScroll={acompanharScroll}
        style={{
          ...styles.carousel,
          ...(alturaAtiva
            ? {
                height: `${alturaAtiva}px`,
              }
            : {}),
        }}
      >
        <div
          ref={(elemento) => {
            slideRefs.current[0] = elemento;
          }}
          style={styles.paginaPremium}
        >
          <div
            ref={(elemento) => {
              conteudoRefs.current[0] = elemento;
            }}
            style={styles.conteudoPremium}
          >
            <PremiumCooabrielClaude />
          </div>

          {renderizarIndicador(0)}
        </div>

        <div
          ref={(elemento) => {
            slideRefs.current[1] = elemento;
          }}
          style={styles.paginaPremium}
        >
          <div
            ref={(elemento) => {
              conteudoRefs.current[1] = elemento;
            }}
            style={styles.conteudoPremium}
          >
            <PremiumTermometroMercado />
          </div>

          {renderizarIndicador(1)}
        </div>

        <div
          ref={(elemento) => {
            slideRefs.current[2] = elemento;
          }}
          style={styles.paginaPremium}
        >
          <div
            ref={(elemento) => {
              conteudoRefs.current[2] = elemento;
            }}
            style={styles.conteudoPremium}
          >
            <PremiumNoticias />
          </div>

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
    background:
      "linear-gradient(180deg, #102117 0%, #18261D 100%)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  carousel: {
    display: "flex",
    width: "100%",
    alignItems: "flex-start",
    overflowX: "auto",
    overflowY: "hidden",
    margin: 0,
    padding: 0,
    gap: 0,
    background:
      "linear-gradient(180deg, #102117 0%, #18261D 100%)",
    scrollSnapType: "x mandatory",
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    transition: "height 0.28s ease",
  },

  paginaPremium: {
    position: "relative",
    width: "100vw",
    minWidth: "100vw",
    maxWidth: "100vw",
    flex: "0 0 100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    scrollSnapAlign: "start",
    scrollSnapStop: "always",
  },

  conteudoPremium: {
    width: "100%",
    maxWidth: "390px",
    minWidth: 0,
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
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