// PremiumNoticias.jsx
// Card 4 — Notícias do Mercado | Conilon Hoje
// src/pages/premium/PremiumNoticias.jsx

import React, { useEffect, useState } from "react";
import logoConilon from "../../assets/logo-conilon.jpg.jpeg";
import seuConilon from "../../assets/mascotes/seu_conilon_sem_fundo.png";
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub?gid=863354306&single=true&output=csv&t=" +
  Date.now();
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes; }
    else if (line[i] === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += line[i]; }
  }
  result.push(current.trim());
  return result;
}

const viesConfig = {
  ALTA:   { emoji: "🟢", label: "ALTA — favorece preço mais alto", cor: "#22c55e", bg: "rgba(34,197,94,0.10)", borda: "rgba(34,197,94,0.30)" },
  NEUTRO: { emoji: "🟡", label: "NEUTRO — sem direção clara", cor: "#eab308", bg: "rgba(234,179,8,0.10)", borda: "rgba(234,179,8,0.30)" },
  BAIXA:  { emoji: "🔴", label: "BAIXA — pressiona preço para baixo", cor: "#ef4444", bg: "rgba(239,68,68,0.10)", borda: "rgba(239,68,68,0.30)" },
};

const categoriaConfig = {
  Clima:       { cor: "#60a5fa", bg: "rgba(96,165,250,0.10)" },
  Bolsa:       { cor: "#C8963C", bg: "rgba(200,150,60,0.10)" },
  Exportações: { cor: "#2dd4bf", bg: "rgba(45,212,191,0.10)" },
  Geopolítica: { cor: "#f87171", bg: "rgba(248,113,113,0.10)" },
  Oferta:      { cor: "#34d399", bg: "rgba(52,211,153,0.10)" },
  Demanda:     { cor: "#f97316", bg: "rgba(249,115,22,0.10)" },
  Câmbio:      { cor: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
};

function detectarVies(texto) {
  const t = texto.toLowerCase();
  if (t.includes("alta") || t.includes("sobe") || t.includes("recorde") || t.includes("favor") || t.includes("prêmio")) return "ALTA";
  if (t.includes("queda") || t.includes("recua") || t.includes("pressiona") || t.includes("baixa")) return "BAIXA";
  return "NEUTRO";
}

function detectarCategoria(texto) {
  const t = texto.toLowerCase();
  if (t.includes("chuva") || t.includes("clima") || t.includes("seca") || t.includes("el ni") || t.includes("tempo")) return "Clima";
  if (t.includes("bolsa") || t.includes("ice") || t.includes("futuro") || t.includes("contrato")) return "Bolsa";
  if (t.includes("export") || t.includes("embarque") || t.includes("cecafé")) return "Exportações";
  if (t.includes("geopolí") || t.includes("guerra") || t.includes("tarifa") || t.includes("sanção")) return "Geopolítica";
  if (t.includes("câmbio") || t.includes("dólar") || t.includes("real")) return "Câmbio";
  if (t.includes("oferta") || t.includes("safra") || t.includes("estoque")) return "Oferta";
  if (t.includes("demand") || t.includes("consumo") || t.includes("importa")) return "Demanda";
  return "Mercado";
}

function GraoVies({ cor = "#C8963C" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "10px",
        height: "15px",
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${cor} 0%, ${cor} 55%, rgba(0,0,0,0.28) 100%)`,
        transform: "rotate(18deg)",
        position: "relative",
        marginRight: "6px",
        boxShadow: `0 0 8px ${cor}55`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: "4px",
          width: "2px",
          height: "11px",
          borderRadius: "50%",
          background: "rgba(15,32,15,0.75)",
          transform: "rotate(12deg)",
        }}
      />
    </span>
  );
}

function NoticiaItem({ noticia, leitura, carregando }) {
  const vies = detectarVies(noticia);
  const categoria = detectarCategoria(noticia);
  const v = viesConfig[vies] || viesConfig["NEUTRO"];
  const cat = categoriaConfig[categoria] || { cor: "#C8963C", bg: "rgba(200,150,60,0.10)" };

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,150,60,0.15)", borderRadius: "12px", padding: "15px", marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
        <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: cat.cor, background: cat.bg, border: `1px solid ${cat.cor}35`, borderRadius: "20px", padding: "3px 10px" }}>
          {categoria}
        </span>
        <span title={v.label} style={{ fontSize: "10px", fontWeight: "800", color: v.cor, background: v.bg, border: `1px solid ${v.borda}`, borderRadius: "20px", padding: "3px 10px", display: "flex",
alignItems: "center",
gap: "2px", cursor: "help" }}>
          <GraoVies cor={v.cor} /> {vies}
        </span>
      </div>

      <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.75)", margin: "0 0 12px 0", lineHeight: "1.7" }}>
        {noticia}
      </p>

      <div style={{ borderLeft: "3px solid #C8963C", background: "rgba(200,150,60,0.06)", borderRadius: "0 8px 8px 0", padding: "10px 12px" }}>
        <p style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.10em", textTransform: "uppercase", color: "#C8963C", margin: "0 0 5px 0" }}>
          Nossa leitura
        </p>
        {carregando ? (
          <p style={{ fontSize: "12px", color: "rgba(245,240,232,0.40)", margin: 0, fontStyle: "italic" }}>
            Analisando impacto para o Conilon...
          </p>
        ) : (
          <p style={{ fontSize: "12px", color: "rgba(245,240,232,0.82)", margin: 0, lineHeight: "1.65", fontStyle: "italic" }}>
            {leitura}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PremiumNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [leituras, setLeituras] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [conversaPremium, setConversaPremium] = useState("");

  const [hoje, setHoje] = useState("");
  useEffect(() => {
    async function carregarDados() {
      try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        const linhas = text.trim().split("\n");
        const cabecalho = parseCsvLine(linhas[0]);

const idxData = cabecalho.findIndex(
  (c) => String(c).trim().toLowerCase() === "data"
);

        const dados = parseCsvLine(linhas[1]);

        setHoje(dados[idxData] || "");

const idxConversaPremium = cabecalho.findIndex(c =>
  c.toLowerCase().includes("conversa_premium")
);

        const idxN1 = cabecalho.findIndex(c => c.toLowerCase().includes("noticia1") || c.toLowerCase().includes("notícia1"));
        const idxN2 = cabecalho.findIndex(c => c.toLowerCase().includes("noticia2") || c.toLowerCase().includes("notícia2"));
        const idxN3 = cabecalho.findIndex(c => c.toLowerCase().includes("noticia3") || c.toLowerCase().includes("notícia3"));
        const idxN4 = cabecalho.findIndex(c => c.toLowerCase().includes("noticia4") || c.toLowerCase().includes("notícia4"));

        const noticiasCarregadas = [
          dados[idxN1] || "",
          dados[idxN2] || "",
          dados[idxN3] || "",
          dados[idxN4] || "",
        ].filter(n => n.length > 5);

        setNoticias(noticiasCarregadas);

const idxLeitura1 = cabecalho.findIndex(c => c.toLowerCase().includes("leitura_noticia1"));
const idxLeitura2 = cabecalho.findIndex(c => c.toLowerCase().includes("leitura_noticia2"));
const idxLeitura3 = cabecalho.findIndex(c => c.toLowerCase().includes("leitura_noticia3"));
const idxLeitura4 = cabecalho.findIndex(c => c.toLowerCase().includes("leitura_noticia4"));

setLeituras({
  0: dados[idxLeitura1] || "",
  1: dados[idxLeitura2] || "",
  2: dados[idxLeitura3] || "",
  3: dados[idxLeitura4] || "",
});

setConversaPremium(dados[idxConversaPremium] || "");

setCarregando(false);
      } catch (e) {
        setErro("Não foi possível carregar as notícias.");
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  async function gerarLeituras(noticiasLista) {
    const novasLeituras = {};
    for (let i = 0; i < noticiasLista.length; i++) {
      const n = noticiasLista[i];
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 150,
            messages: [{
              role: "user",
              content: `Você é analista de mercado de café Conilon/Robusta brasileiro. Em 2 frases curtas e diretas, explique o impacto prático desta notícia para o preço do café Conilon no Espírito Santo: "${n}". Responda apenas a análise, sem introdução.`
            }]
          })
        });
        const data = await res.json();
        novasLeituras[i] = data.content?.[0]?.text || "Análise indisponível no momento.";
      } catch {
        novasLeituras[i] = "Análise indisponível no momento.";
      }
    }
    setLeituras(novasLeituras);
    setCarregando(false);
  }

  return (
    <div style={{ background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)",
minHeight: "100vh", borderRadius: "16px", border: "none", overflow: "hidden", marginBottom: "24px", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* HEADER — padrão igual aos outros cards */}
      <div
  style={{
    background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)",
    border: "1px solid #1f342b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <img
      src={logoConilon}
      alt="Logo Conilon Hoje"
      style={{ width: 68, height: 68, borderRadius: 12 }}
    />

    <div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: "#f0ebe0",
          lineHeight: 1.1,
        }}
      >
        Conilon Hoje
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#c8a96e",
          letterSpacing: "0.12em",
          marginTop: 2,
        }}
      >
        PREMIUM
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#a7a093",
          marginTop: 4,
        }}
      >
        Atualizado: {hoje}
      </div>
    </div>
  </div>
</div>

<section
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "18px 18px 14px 18px",
    borderBottom: "none",
  }}
>
  <div
    style={{
      fontSize: "20px",
      lineHeight: 1,
    }}
  >
    📰
  </div>

  <div>
    <h1
  style={{
    margin: 0,
    fontSize: "26px",
    lineHeight: 1.1,
    color: "#f7f3e8",
  }}
>
  Notícias do Mercado
</h1>

    <p
  style={{
    margin: "4px 0 0",
    fontSize: "14px",
    color: "rgba(247,243,232,0.75)",
  }}
>
  Fatos do dia e leitura para o Conilon
</p>
  </div>
</section>

      {/* CORPO */}
      <div style={{ padding: "16px 14px 4px 14px" }}>
        {erro ? (
          <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center" }}>{erro}</p>
        ) : noticias.length === 0 && carregando ? (
          <p style={{ color: "rgba(245,240,232,0.40)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
            Carregando notícias...
          </p>
        ) : (
         <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  {[0, 2].map((startIndex) => (
    <div
      key={startIndex}
      style={{
        display: "flex",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        gap: "16px",
        paddingBottom: "10px",
      }}
    >
      {noticias.slice(startIndex, startIndex + 2).map((n, i) => {
        const realIndex = startIndex + i;

        return (
          <div
            key={realIndex}
            style={{
              minWidth: "100%",
              scrollSnapAlign: "start",
            }}
          >
            <NoticiaItem
              noticia={n}
              leitura={leituras[realIndex]}
              carregando={carregando || !leituras[realIndex]}
            />
          </div>
        );
      })}
    </div>
  ))}
</div>
        )}
      </div>

      {/* BLOCO — CONECTAR OS PONTOS */}
<div
  style={{
    margin: "8px 14px 16px 14px",
    padding: "16px 15px",
    background: "rgba(26,46,26,0.72)",
    border: "1px solid rgba(110,170,110,0.28)",
    borderRadius: "14px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
  }}
>
  <p
    style={{
      fontSize: "10px",
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "rgba(180,220,180,0.78)",
      margin: "0 0 6px 0",
    }}
  >
    Análise do dia
  </p>

  <h3
    style={{
      fontSize: "18px",
      fontWeight: 800,
      color: "#f5f0e8",
      margin: "0 0 8px 0",
      lineHeight: 1.2,
    }}
  >
    Vamos conversar sobre o café
  </h3>

  <p
    style={{
      fontSize: "13px",
      color: "rgba(245,240,232,0.68)",
      margin: "0 0 12px 0",
      lineHeight: 1.6,
      fontStyle: "italic",
    }}
  >
    Você já viu os fatos do dia. Agora vamos conectar os acontecimentos e entender o que eles podem significar para o mercado do Conilon.
  </p>

  <div
  style={{
    display: "flex",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    gap: "16px",
    marginTop: "18px",
    paddingBottom: "8px",
  }}
>
  {/* TELA 1 — CHAMADA DO MASCOTE */}
  <div
    style={{
      minWidth: "100%",
      scrollSnapAlign: "start",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      minHeight: "190px",
    }}
  >
    <img
  src={seuConilon}
  alt="Seu Conilon"
  style={{
    width: "125px",
    height: "auto",
    marginBottom: "10px",
    marginLeft: "-60px",
  }}
/>

    <div
  style={{
    position: "relative",
top: "-160px",
left: "68px",

    display: "inline-block",
    background: "#f5f0e8",
    color: "#1A2E1A",
    padding: "5px 8px",
    borderRadius: "8px",
    fontSize: "8px",
    fontWeight: "700",
    lineHeight: "1.45",
    maxWidth: "105px",
    marginBottom: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
  }}
>
  Quer saber o que isso significa?
  <br />
  Arraste que eu te explico. →

  <div
    style={{
      position: "absolute",
      bottom: "-7px",
      right: "42px",
      width: 0,
      height: 0,
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "8px solid #f5f0e8",
    }}
  />
</div>
  </div>

  {/* TELA 2 — CONVERSA DO DIA */}
  <div
    style={{
      minWidth: "100%",
      scrollSnapAlign: "start",
    }}
  >
    <p
      style={{
        fontSize: "13px",
        color: "rgba(245,240,232,0.84)",
        margin: 0,
        lineHeight: 1.75,
      }}
    >
      {conversaPremium || "A conversa premium do dia ainda não foi preenchida."}
    </p>
  </div>
</div>



</div>



      {/* RODAPÉ */}
      <div style={{ margin: "0 14px 16px 14px", padding: "12px 14px", background: "rgba(200,150,60,0.05)", border: "1px solid rgba(200,150,60,0.12)", borderRadius: "10px" }}>
        <p style={{ fontSize: "10px", color: "rgba(245,240,232,0.38)", margin: 0, lineHeight: "1.6", textAlign: "center", fontStyle: "italic" }}>
         O Conilon Hoje Premium transforma notícias em contexto, conectando os principais acontecimentos do dia para facilitar a leitura do mercado. As análises seguem critérios editoriais e curadoria próprios e não constituem recomendação de compra ou venda.
        </p>
      </div>
    </div>
  );
}
