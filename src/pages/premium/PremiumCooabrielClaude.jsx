import React, { useEffect, useState } from "react";
import logoConilon from "../../assets/logo-conilon.jpg.jpeg";
import seuConilon from "../../assets/mascotes/seu_conilon_sem_fundo.png";
// ─── Constantes de fallback ───────────────────────────────────────────────────
const CUSTO_REFERENCIA_ES = 591;

const TIPOS = {
  tipo7: "Tipo 7",
  tipo78: "Tipo 7/8",
  tipo8: "Tipo 8",
};

const fmt = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

// ─── URLs das abas ────────────────────────────────────────────────────────────
const BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub";

const URL_APP       = `${BASE_URL}?gid=951000819&single=true&output=csv`;
const URL_PAGINA1   = `${BASE_URL}?gid=863354306&single=true&output=csv`;
// Aba histórico Cooabriel — mesma aba app (gid 951000819) contém o histórico
const URL_HISTORICO = URL_APP;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseCsvLine = (linha) => {
  const resultado = [];
  let atual = "";
  let dentroAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const char = linha[i];
    if (char === '"') { dentroAspas = !dentroAspas; }
    else if (char === "," && !dentroAspas) { resultado.push(atual.trim()); atual = ""; }
    else { atual += char; }
  }
  resultado.push(atual.trim());
  return resultado;
};

const limparNumero = (valor) =>
  Number(
    String(valor || "")
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function Result({ label, value, highlight }) {
  return (
    <div style={styles.resultRow}>
      <span>{label}</span>
      <strong style={{ color: highlight ? "#4ade80" : "#f0ebe0" }}>{value}</strong>
    </div>
  );
}

function CostLine({ label, value, onChange, highlight }) {
  return (
    <div style={styles.costLine}>
      <span style={highlight ? styles.costIconHighlight : styles.costIcon}>
        {highlight ? "★" : "✓"}
      </span>
      <span style={styles.costLineLabel}>{label}</span>
      <div style={styles.costInputWrap}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.costInput}
        />
        <span style={styles.costInputSuffix}>R$/sc</span>
      </div>
    </div>
  );
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

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PremiumCooabriel() {
  const [tipo, setTipo] = useState("tipo7");
  const [custoUsuario, setCustoUsuario] = useState("");
  const [sacas, setSacas] = useState("");
  const [precoRecebido, setPrecoRecebido] = useState("");
  const [dadosApp, setDadosApp] = useState(null);
  const [historicoCooabriel30d, setHistoricoCooabriel30d] = useState([]);
  const [erroFetch, setErroFetch] = useState(false);
  const [carregando, setCarregando] = useState(true);
const [mostrarAnalise, setMostrarAnalise] = useState(false);
const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [custosDetalhados, setCustosDetalhados] = useState({
    fertilizantes: 180,
    defensivos: 65,
    maoDeObra: 90,
    colheita: 80,
    beneficiamento: 30,
    frete: 25,
    combustivel: 40,
    administrativo: 20,
    depreciacao: 31,
    terra: 30,
  });

  // ── Fetch de dados ──────────────────────────────────────────────────────────
  useEffect(() => {
    setCarregando(true);
    setErroFetch(false);

    // Fetch 1: aba app — data + cooabriel tipo 7 (linha mais recente)
    const fetchApp = fetch(URL_PAGINA1)
      .then((res) => res.text())
      .then((text) => {
        const linhas = text.trim().split(/\r?\n/).filter((l) => l.trim() !== "");
        const cabecalho = parseCsvLine(linhas[0]);
        const dadosLinhas = linhas.slice(1).map(parseCsvLine);

        const indiceData = cabecalho.findIndex(
  (col) => String(col).trim().toLowerCase() === "data"
);

const indiceCooabriel = cabecalho.findIndex(
  (col) => String(col).trim().toLowerCase() === "cooabriel"
);

        const ultimaLinha = [...dadosLinhas]
          .reverse()
          .find((l) => limparNumero(l[indiceCooabriel]) > 0);

        return {
          data:      ultimaLinha?.[indiceData] || "",
          cooabriel: limparNumero(ultimaLinha?.[indiceCooabriel]),
        };
      });

    // Fetch 2: Página1 — tipo 7/8 e tipo 8
    const fetchPagina1 = fetch(URL_PAGINA1)
      .then((res) => res.text())
      .then((text) => {
        const linhas = text.trim().split(/\r?\n/).filter((l) => l.trim() !== "");
        const cabecalho   = parseCsvLine(linhas[0]);
        const dadosLinhas = linhas.slice(1).map(parseCsvLine);

        const indiceTipo78 = cabecalho.indexOf("cooabriel_tipo_78");
        const indiceTipo8  = cabecalho.indexOf("cooabriel_tipo_8");

        const ultimaTipo78 = [...dadosLinhas].reverse()
          .find((l) => limparNumero(l[indiceTipo78]) > 0);
        const ultimaTipo8 = [...dadosLinhas].reverse()
          .find((l) => limparNumero(l[indiceTipo8]) > 0);

        return {
          cooabriel78: limparNumero(ultimaTipo78?.[indiceTipo78]),
          cooabriel8:  limparNumero(ultimaTipo8?.[indiceTipo8]),
        };
      });

    // Fetch 3: histórico 30 dias — aba histórico (colunas data + cooabriel)
    const fetchHistorico = fetch(URL_HISTORICO)
      .then((res) => res.text())
      .then((text) => {
        const linhas = text.trim().split(/\r?\n/).filter((l) => l.trim() !== "");
        const cabecalho   = parseCsvLine(linhas[0]);
        const dadosLinhas = linhas.slice(1).map(parseCsvLine);

        const indiceCooabriel = cabecalho.indexOf("cooabriel");

        const historico = dadosLinhas
          .map((l) => limparNumero(l[indiceCooabriel]))
          .filter((v) => v > 0);

        return historico.slice(-30);
      });

    Promise.all([fetchApp, fetchPagina1, fetchHistorico])
      .then(([app, pagina1, historico]) => {
        const precoAtual = Number(app.cooabriel || 0) || Number(historico[historico.length - 1] || 0);

        setHistoricoCooabriel30d(historico);
        setPrecoRecebido(precoAtual);
        setDadosApp({
         data: pagina1.data || pagina1.Data || app.data || app.Data || "",
          cooabriel:   app.cooabriel,
          cooabriel78: pagina1.cooabriel78,
          cooabriel8:  pagina1.cooabriel8,
        });
        setCarregando(false);
      })
      .catch(() => {
        setErroFetch(true);
        setCarregando(false);
      });
  }, []);

  const atualizarCustoDetalhado = (campo, valor) => {
    setCustosDetalhados((prev) => ({ ...prev, [campo]: Number(valor) || 0 }));
  };

  // ── Preços por tipo ─────────────────────────────────────────────────────────
  const PRECO_ATUAL = {
    tipo7:  Number(dadosApp?.cooabriel  || 0),
    tipo78: Number(dadosApp?.cooabriel78 || 0),
    tipo8:  Number(dadosApp?.cooabriel8  || 0),
  };

  const preco     = PRECO_ATUAL[tipo];
  const custo     = custoUsuario ? Number(custoUsuario) : CUSTO_REFERENCIA_ES;
  const quantidade = sacas ? Number(sacas) : 0;

  // ── Cálculos de margem ──────────────────────────────────────────────────────
  const margemPorSaca          = preco - custo;
  const receitaBruta           = preco * quantidade;
  const custoTotal             = custo * quantidade;
  const margemTotal            = receitaBruta - custoTotal;
  const margemPositiva         = margemPorSaca >= 0;
  const margemPercentualVenda  = preco > 0 ? (margemPorSaca / preco) * 100 : 0;
  const margemPercentualCusto  = custo > 0 ? (margemPorSaca / custo) * 100 : 0;

  // Ponto de equilíbrio reverso
  const precoMinimoEquilibrio = custo;
  const distanciaEquilibrio   = preco - precoMinimoEquilibrio;

  // Comparativo dos 3 tipos
  const margemTipo7  = PRECO_ATUAL.tipo7  - custo;
  const margemTipo78 = PRECO_ATUAL.tipo78 - custo;
  const margemTipo8  = PRECO_ATUAL.tipo8  - custo;

  // ── Custos detalhados ───────────────────────────────────────────────────────
  const custoProducao  = custosDetalhados.fertilizantes + custosDetalhados.defensivos + custosDetalhados.maoDeObra;
  const custoColheita  = custosDetalhados.colheita + custosDetalhados.beneficiamento + custosDetalhados.frete;
  const custoEstrutura = custosDetalhados.combustivel + custosDetalhados.administrativo + custosDetalhados.depreciacao + custosDetalhados.terra;
  const custoTotalDetalhado   = custoProducao + custoColheita + custoEstrutura;
  const margemDetalhadaPorSaca = Number(precoRecebido || 0) - custoTotalDetalhado;

  // ── Histórico 30 dias ───────────────────────────────────────────────────────
  const valores30d     = historicoCooabriel30d.length > 0 ? historicoCooabriel30d : [];
  const precoAtual30d = Number(precoRecebido || 0);
  const precoMinimo30d = valores30d.length > 0 ? Math.min(...valores30d) : 0;
  const precoMaximo30d = valores30d.length > 0 ? Math.max(...valores30d, precoAtual30d) : precoAtual30d;
  const media30d       = valores30d.length > 0
    ? valores30d.reduce((t, v) => t + v, 0) / valores30d.length
    : 0;
  const diferencaMedia30d = media30d > 0 ? ((precoAtual30d - media30d) / media30d) * 100 : 0;
  const posicaoPreco30d   = precoMaximo30d === precoMinimo30d ? 50
    : ((precoAtual30d - precoMinimo30d) / (precoMaximo30d - precoMinimo30d)) * 100;

  // ── Leitura de mercado (selo) ───────────────────────────────────────────────
  const leituraMercado =
    posicaoPreco30d >= 70 && diferencaMedia30d > 1
      ? { selo: "Mercado Forte",  cor: "#4ade80", bg: "#0b2d18", border: "#166534" }
      : posicaoPreco30d <= 30 && diferencaMedia30d < -1
      ? { selo: "Mercado Fraco",  cor: "#f87171", bg: "#2d0a0a", border: "#7f1d1d" }
      : { selo: "Mercado Neutro", cor: "#facc15", bg: "#1a1a07", border: "#713f12" };

  const textoTendencia30d =
    diferencaMedia30d > 1
      ? "O mercado negocia acima do comportamento médio recente."
      : diferencaMedia30d < -1
      ? "O mercado negocia abaixo do comportamento médio recente."
      : "O mercado permanece próximo do padrão médio recente.";

  // ── Gauge margem ────────────────────────────────────────────────────────────
  const gaugeMin = -50;
  const gaugeMax = 100;
  const gaugeLimitado  = Math.max(gaugeMin, Math.min(margemPercentualCusto, gaugeMax));
  const posicaoGauge   = ((gaugeLimitado - gaugeMin) / (gaugeMax - gaugeMin)) * 100;

  // ── Histórico margem 7 dias ─────────────────────────────────────────────────
  const historicoMargem30d = valores30d.map((valor, index) => ({
    dia:             index + 1,
    preco:           valor,
    margem:          valor - custo,
    margemPercentual: custo > 0 ? ((valor - custo) / custo) * 100 : 0,
  }));
  const ultimos7Dias      = historicoMargem30d.slice(-7);
  const margemInicial7d   = ultimos7Dias[0]?.margemPercentual || 0;
  const margemAtual7d     = ultimos7Dias[ultimos7Dias.length - 1]?.margemPercentual || 0;
  const variacao7d        = margemAtual7d - margemInicial7d;
  const tendenciaPos7d    = margemAtual7d >= margemInicial7d;

  const textoTendencia7d =
    Math.abs(variacao7d) < 1
      ? `⚪ Margem estável nos últimos 7 dias (${Math.round(margemInicial7d)}% → ${Math.round(margemAtual7d)}%).`
      : tendenciaPos7d
      ? `🟢 Margem ganhou força nos últimos 7 dias (${Math.round(margemInicial7d)}% → ${Math.round(margemAtual7d)}%).`
      : `🔴 Margem perdeu força nos últimos 7 dias (${Math.round(margemInicial7d)}% → ${Math.round(margemAtual7d)}%).`;

  // pontos SVG margem 7d
  const margemPercentualMinima30d = -20;
  const margemPercentualMaxima30d = 80;
  const ampMargem = margemPercentualMaxima30d - margemPercentualMinima30d;
  const pontosGraficoMargem = ultimos7Dias
    .map((item, index) => {
      const x = ultimos7Dias.length === 1 ? 160 : 20 + (index * 280) / (ultimos7Dias.length - 1);
      const pct = Math.max(margemPercentualMinima30d, Math.min(item.margemPercentual, margemPercentualMaxima30d));
      const y   = 75 - ((pct - margemPercentualMinima30d) / ampMargem) * 55;
      return `${x},${y}`;
    })
    .join(" ");

  // ── Render ──────────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <p style={{ color: "#c8a96e", fontSize: 16, fontWeight: 700 }}>Carregando dados do mercado...</p>
        </div>
      </div>
    );
  }

  if (erroFetch) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: "#f87171", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Não foi possível carregar os dados.
          </p>
          <p style={{ color: "#8f8a80", fontSize: 14 }}>
            Verifique sua conexão e recarregue a página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ── HEADER ── */}
      <header style={styles.header}>
        <div style={styles.brandCard}>
          <div style={styles.brandRow}>
            <img src={logoConilon} alt="Logo Conilon Hoje" style={styles.logo} />
            <div>
              <div style={styles.brandTitle}>Conilon Hoje</div>
              <div style={styles.premiumLine}>PREMIUM</div>
              <div style={styles.updatedText}>
                Atualizado: {dadosApp?.data || "—"}
              </div>
            </div>
          </div>
        </div>
       <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  }}
>
  <section style={styles.moduleTitle}>
  <div style={styles.icon}>💰</div>

  <div>
    <h1 style={styles.h1}>Mercado Físico</h1>
  </div>
</section>
</div>

<p style={styles.subtitle}>
  Leitura da margem operacional com base no preço de referência da Cooabriel para o mercado de Conilon do Espírito Santo.
</p>



      </header>

      {/* ── PREÇO DO DIA + SELO DE MERCADO ── */}
      <section style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ ...styles.label, marginBottom: 0 }}>Preço do dia · Cooabriel</p>
          {/* MELHORIA 3: Selo visual de mercado */}
          <div style={{
            background: leituraMercado.bg,
            border: `1px solid ${leituraMercado.border}`,
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 800,
            color: leituraMercado.cor,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            <GraoVies cor={leituraMercado.cor} /> {leituraMercado.selo}
          </div>
        </div>

        <div style={styles.buttons}>
          {Object.entries(TIPOS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTipo(key)}
              style={{
                ...styles.typeButton,
                background: tipo === key ? "#c8a96e" : "#17231d",
                color: tipo === key ? "#07110C" : "#d6d0c2",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={styles.price}>{fmt(preco)}</div>
        <p style={styles.small}>por saca · {TIPOS[tipo]}</p>

        {/* MELHORIA 4: Comparativo 3 tipos lado a lado */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginTop: 16,
          background: "#101915",
          borderRadius: 10,
          padding: 12,
        }}>
          {[
            { key: "tipo7",  label: "Tipo 7",   preco: PRECO_ATUAL.tipo7,  margem: margemTipo7 },
            { key: "tipo78", label: "Tipo 7/8", preco: PRECO_ATUAL.tipo78, margem: margemTipo78 },
            { key: "tipo8",  label: "Tipo 8",   preco: PRECO_ATUAL.tipo8,  margem: margemTipo8 },
          ].map((item) => (
            <div key={item.key} style={{
              textAlign: "center",
              padding: "8px 4px",
              borderRadius: 8,
              background: tipo === item.key ? "rgba(200,169,110,0.1)" : "transparent",
              border: tipo === item.key ? "1px solid rgba(200,169,110,0.3)" : "1px solid transparent",
            }}>
              <div style={{ color: "#8f8a80", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ color: "#f0ebe0", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                {fmt(item.preco)}
              </div>
              <div style={{ color: item.margem >= 0 ? "#4ade80" : "#f87171", fontSize: 12, fontWeight: 800 }}>
                {item.margem >= 0 ? "+" : ""}{fmt(item.margem)}
              </div>
              <div style={{ color: "#8f8a80", fontSize: 10 }}>margem/sc</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUSTO DE REFERÊNCIA + PONTO DE EQUILÍBRIO ── */}
<div
  style={{
    display: "flex",
    overflowX: "auto",
    gap: 14,
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 8,
    marginBottom: 14,
  }}
>
  <section style={{ ...styles.card, minWidth: "100%", boxSizing: "border-box", scrollSnapAlign: "start" }}>
    <p style={styles.label}>Custo de referência · Espírito Santo</p>
    <div style={styles.row}>
      <strong style={styles.cost}>{fmt(CUSTO_REFERENCIA_ES)}</strong>
      <span style={styles.small}>Fonte: Senar-ES ATeG 2024/25</span>
    </div>

    <div style={margemPositiva ? styles.positiveBox : styles.negativeBox}>
      <p style={styles.small}>Margem estimada por saca</p>
      <strong style={margemPositiva ? styles.positiveText : styles.negativeText}>
        {margemPositiva ? "+" : ""}{fmt(margemPorSaca)}
      </strong>
      <p style={styles.resultText}>
        {margemPositiva
          ? "Esse preço cobre o custo de referência e deixa margem positiva."
          : "Esse preço está abaixo do custo de referência."}
      </p>
    </div>

    <p style={{ ...styles.infoMuted, marginTop: 10, textAlign: "right" }}>
      Deslize → Ponto de equilíbrio
    </p>
  </section>

  <section style={{ ...styles.card, minWidth: "100%", boxSizing: "border-box", scrollSnapAlign: "start" }}>
    <p style={{ ...styles.label, marginBottom: 8 }}>Ponto de equilíbrio</p>

    <div
      style={{
        background: "#101915",
        border: "1px solid #30463b",
        borderRadius: 10,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ color: "#8f8a80", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Preço mínimo para cobrir seu custo
          </div>
          <div style={{ color: "#c8a96e", fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {fmt(precoMinimoEquilibrio)}/sc
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#8f8a80", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Distância do equilíbrio
          </div>
          <div
            style={{
              color: distanciaEquilibrio >= 0 ? "#4ade80" : "#f87171",
              fontSize: 24,
              fontWeight: 800,
              marginTop: 4,
            }}
          >
            {distanciaEquilibrio >= 0 ? "+" : ""}{fmt(distanciaEquilibrio)}
          </div>
        </div>
      </div>

      <p style={{ ...styles.infoMuted, marginTop: 10 }}>
        {distanciaEquilibrio >= 0
          ? `O preço atual está ${fmt(distanciaEquilibrio)} acima do mínimo necessário para cobrir o custo.`
          : `O preço precisa subir ${fmt(Math.abs(distanciaEquilibrio))} para atingir o ponto de equilíbrio.`}
      </p>
    </div>
  </section>
</div>
     

      {/* ── SIMULADOR INTEGRADO AO BREAKDOWN ── */}
<section style={styles.card}>
  <p style={styles.label}>Simule com seu custo real</p>

  <input
    style={styles.input}
    type="number"
    placeholder="Seu custo por saca (R$)"
    value={custoUsuario}
    onChange={(e) => setCustoUsuario(e.target.value)}
  />

  <input
    style={styles.input}
    type="number"
    placeholder="Quantidade de sacas"
    value={sacas}
    onChange={(e) => setSacas(e.target.value)}
  />

  {quantidade > 0 && (
    <div style={styles.results}>
      <Result label="Receita bruta" value={fmt(receitaBruta)} />
      <Result label={custoUsuario ? "Custo (seu custo)" : "Custo (referência ES)"} value={fmt(custoTotal)} />
      <Result
        label="Margem total"
        value={`${margemTotal >= 0 ? "+" : ""}${fmt(margemTotal)}`}
        highlight={margemTotal >= 0}
      />

      <div
        style={{
          background: "#101915",
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
          border: "1px solid #30463b",
        }}
      >
        <div style={{ color: "#8f8a80", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Usando custo detalhado abaixo ({fmt(custoTotalDetalhado)}/sc)
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#c8c0b0", fontSize: 13 }}>Margem pelo custo detalhado</span>
          <strong
            style={{
              color: preco - custoTotalDetalhado >= 0 ? "#4ade80" : "#f87171",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            {preco - custoTotalDetalhado >= 0 ? "+" : ""}{fmt(preco - custoTotalDetalhado)}/sc
          </strong>
        </div>

        {quantidade > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "#c8c0b0", fontSize: 13 }}>Total em {quantidade} sacas</span>
            <strong
              style={{
                color: (preco - custoTotalDetalhado) * quantidade >= 0 ? "#4ade80" : "#f87171",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              {(preco - custoTotalDetalhado) * quantidade >= 0 ? "+" : ""}
              {fmt((preco - custoTotalDetalhado) * quantidade)}
            </strong>
          </div>
        )}
      </div>
    </div>
  )}
</section>

{/* ── ANÁLISE DO SEU CONILON ── */}
<section style={styles.card}>
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <img
      src={seuConilon}
      alt="Seu Conilon"
      style={{
        width: 64,
        height: 64,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />

    <button
      type="button"
      onClick={() => setMostrarAnalise(!mostrarAnalise)}
      style={{
        flex: 1,
        background: "#101915",
        border: "1px solid #30463b",
        borderRadius: 14,
        padding: "12px 14px",
        color: "#f5f0e8",
        textAlign: "left",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      👉 Vamos interpretar esse resultado?
      <div style={{ color: "#c8a96e", fontSize: 12, marginTop: 4 }}>
        {mostrarAnalise ? "Ocultar análise" : "Ver análise"}
      </div>
    </button>
  </div>

  {mostrarAnalise && (
    <div
      style={{
        marginTop: 14,
        background: "#101915",
        border: "1px solid #30463b",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <p style={{ ...styles.label, color: "#ffffff", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
        O que isso significa para o meu café?
      </p>

      <p style={styles.info}>
        Considerando o preço atual da Cooabriel para {TIPOS[tipo]}, a margem estimada é de{" "}
        <strong style={margemPositiva ? styles.inlinePositive : styles.inlineNegative}>
          {margemPositiva ? "+" : ""}{fmt(margemPorSaca)} por saca
        </strong>.
      </p>

      <p style={styles.info}>
        {margemPositiva
          ? "Isso indica que o preço atual remunera a produção acima do custo informado."
          : "Isso indica que o preço atual não cobre integralmente o custo informado."}
      </p>

      <p style={styles.infoMuted}>
        Esta leitura não é recomendação de venda. É uma interpretação da margem entre preço e custo.
      </p>
    </div>
  )}
</section>

      {/* ── CARROSSEL FINANCEIRO 30 DIAS ── */}
<div
  style={{
    display: "flex",
    gap: 16,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 8,
    marginBottom: 18,
  }}
>
  {/* SLIDE 1 — GRÁFICO 30 DIAS */}
  {valores30d.length > 0 && (
    <section style={{ ...styles.card, width: "100%", minWidth: "100%", maxWidth: "100%", flex: "0 0 100%", boxSizing: "border-box", scrollSnapAlign: "start" }}>
      <p style={styles.label}>Onde o preço está hoje? · 30 dias</p>

      <svg width="320" height="155" viewBox="0 0 320 155">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <polyline
          fill="none"
          stroke="#7ee787"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          points={valores30d.map((valor, index) => {
            const x = valores30d.length === 1 ? 160 : 20 + (index * 280) / (valores30d.length - 1);
            const y = 95 - ((Number(valor) - precoMinimo30d) / (precoMaximo30d - precoMinimo30d || 1)) * 60;
            return `${x},${y}`;
          }).join(" ")}
        />

        {/* Mínimo */}
        {(() => {
          const idx = valores30d.findIndex((v) => Number(v) === precoMinimo30d);
          const x = valores30d.length === 1 ? 160 : 20 + (idx * 280) / (valores30d.length - 1);
          return (
            <>
              <circle cx={x} cy={95} r="7" fill="#f87171" filter="url(#glow)" />
              <text x={x + 10} y={100} fill="#f87171" fontSize="11" fontWeight="700">Min {fmt(precoMinimo30d)}</text>
            </>
          );
        })()}

        {/* Média */}
        {(() => {
          let idxMedia = 0;
          let menor = Infinity;
          valores30d.forEach((v, i) => {
            const d = Math.abs(Number(v) - media30d);
            if (d < menor) {
              menor = d;
              idxMedia = i;
            }
          });
          const val = Number(valores30d[idxMedia]);
          const x = valores30d.length === 1 ? 160 : 20 + (idxMedia * 280) / (valores30d.length - 1);
          const y = 95 - ((val - precoMinimo30d) / (precoMaximo30d - precoMinimo30d || 1)) * 60;
          return (
            <>
              <circle cx={x} cy={y} r="7" fill="#facc15" filter="url(#glow)" />
              <text x={x + 10} y={y + 5} fill="#facc15" fontSize="11" fontWeight="700">Média {fmt(media30d)}</text>
            </>
          );
        })()}

        {/* Hoje */}
        {(() => {
          const idx = valores30d.length - 1;
          const val = Number(precoAtual30d || 0);
          const x = valores30d.length === 1 ? 160 : 20 + (idx * 280) / (valores30d.length - 1);
          const y = 95 - ((val - precoMinimo30d) / (precoMaximo30d - precoMinimo30d || 1)) * 60;
          return (
            <>
              <circle cx={x} cy={y} r="8" fill="#7ee787" filter="url(#glow)" />
              <text x={x - 8} y={y - 10} fill="#7ee787" fontSize="11" fontWeight="700" textAnchor="end">
  Hoje {fmt(precoAtual30d)}
</text>
            </>
          );
        })()}
      </svg>

      <div style={styles.insightBox}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <p style={styles.insightTitle}>Preço hoje</p>
            <strong style={{ fontSize: 36, fontWeight: 700, color: "#f0ebe0" }}>{fmt(precoAtual30d)}</strong>
          </div>
          <div>
            <p style={styles.insightTitle}>Faixa 30 dias</p>
            <p style={{ ...styles.insightSub, color: "#f87171" }}>● Mín. {fmt(precoMinimo30d)}</p>
            <p style={{ ...styles.insightSub, color: "#facc15" }}>● Média {fmt(media30d)}</p>
            <p style={{ ...styles.insightSub, color: "#7ee787" }}>● Máx. {fmt(precoMaximo30d)}</p>
          </div>
        </div>
      </div>

      <p style={{ ...styles.info, marginTop: 12 }}>{textoTendencia30d}</p>
      <p style={{ ...styles.small, marginTop: 10 }}>Arraste para ver a margem operacional →</p>
    </section>
  )}

  {/* SLIDE 2 — MARGEM OPERACIONAL */}
  <section style={{ ...styles.card, width: "100%", minWidth: "100%", maxWidth: "100%", flex: "0 0 100%", boxSizing: "border-box", scrollSnapAlign: "start" }}>
    <p style={styles.label}>Margem Operacional · Tendência</p>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginTop: 16, marginBottom: 16 }}>
      <div>
        <div style={{ color: margemPorSaca >= 0 ? "#7ee787" : "#f87171", fontSize: 34, fontWeight: 800, lineHeight: 1 }}>
          {margemPorSaca >= 0 ? "+" : ""}{fmt(margemPorSaca)}/sc
        </div>
        <div style={{ color: "#c8c0b0", fontSize: 13, marginTop: 6 }}>
          {margemPorSaca > 0 ? "Margem positiva" : margemPorSaca === 0 ? "Ponto de equilíbrio" : "Abaixo do custo"}
        </div>
      </div>

      <svg width="200" height="80" viewBox="0 0 200 80">
        <line x1="10" y1="35" x2="190" y2="35" stroke="#30463b" strokeWidth="4" strokeLinecap="round" />
        <line x1="10" y1="35" x2="82" y2="35" stroke="#f87171" strokeWidth="6" strokeLinecap="round" />
        <line x1="82" y1="35" x2="190" y2="35" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
        <circle cx={10 + (180 * posicaoGauge) / 100} cy="35" r="8" fill={margemPorSaca >= 0 ? "#d6c08d" : "#f87171"} />
        <text x="10" y="58" fill="#8c8c80" fontSize="11" textAnchor="middle">Ruim</text>
        <text x="82" y="58" fill="#8c8c80" fontSize="11" textAnchor="middle">Equilíbrio</text>
        <text x="190" y="58" fill="#8c8c80" fontSize="11" textAnchor="middle">Forte</text>
      </svg>
    </div>

    <p style={styles.infoMuted}>
      {margemPorSaca >= 0
        ? "O preço atual está acima do custo informado ou do custo de referência usado no cálculo."
        : "O preço atual está abaixo do custo informado ou do custo de referência usado no cálculo."}
    </p>

    <div
      style={{
        color: margemPercentualCusto >= 20 ? "#7ee787" : margemPercentualCusto >= 0 ? "#facc15" : "#f87171",
        fontSize: 20,
        fontWeight: 800,
        marginTop: 8,
        marginBottom: 6,
      }}
    >
      {margemPercentualCusto >= 0
        ? `↗ Margem de ${Math.abs(margemPercentualCusto).toFixed(1)}% sobre o custo`
        : `↘ Prejuízo de ${Math.abs(margemPercentualCusto).toFixed(1)}% sobre o custo`}
    </div>

    {textoTendencia7d && (
      <p style={{ color: "#c8c0b0", fontSize: 13, marginTop: 8 }}>{textoTendencia7d}</p>
    )}

    <p style={{ ...styles.small, marginTop: 10 }}>Arraste para comparar com a média recente →</p>
  </section>

  {/* SLIDE 3 — COMPARAÇÃO COM MÉDIA RECENTE */}
  <section style={{ ...styles.card, width: "100%", minWidth: "100%", maxWidth: "100%", flex: "0 0 100%", boxSizing: "border-box", scrollSnapAlign: "start" }}>
    <div style={styles.insightBox}>
      <p style={styles.insightTitle}>Comparação com a média recente</p>

      <div style={{ fontSize: 36, fontWeight: 800, color: "#f0ebe0", lineHeight: 1, marginBottom: 10 }}>
        {fmt(precoAtual30d)}
      </div>

      <div style={{ color: diferencaMedia30d >= 0 ? "#4ade80" : "#f87171", fontSize: 20, fontWeight: 800, marginBottom: 14 }}>
        {diferencaMedia30d >= 0 ? "+" : ""}{diferencaMedia30d.toFixed(1)}% em relação à média
      </div>

      <div style={{ background: "#101915", border: "1px solid #30463b", borderRadius: 10, padding: "10px 12px", display: "inline-block" }}>
        <div style={{ color: "#8f8a80", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Média 30 dias</div>
        <div style={{ color: "#f0ebe0", fontWeight: 700, fontSize: 20, marginTop: 4 }}>{fmt(media30d)}</div>
      </div>

      <p style={{ ...styles.info, marginTop: 14 }}>{textoTendencia30d}</p>

      <p style={{ ...styles.small, marginTop: 8 }}>
        Análise baseada na série histórica da Cooabriel dos últimos 30 dias.
      </p>
    </div>
  </section>
</div>
      {/* ── PARCEIRO PREMIUM ── */}
      <section style={styles.card}>
        <p style={styles.label}>Parceiro Premium</p>
        <div style={{ background: "#17231d", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <h3 style={{ color: "#c8a96e", marginTop: 0 }}>AgroFértil Nutrição</h3>
          <p style={{ color: "#c8c0b0" }}>Soluções para fertilidade do solo, produtividade e rentabilidade do cafeeiro.</p>
          <p style={{ color: "#8f8a80", fontSize: 13 }}>Espaço demonstrativo para patrocinadores.</p>
        </div>
      </section>

     {/* ── CHAMADA PARA CALCULADORA ── */}
<section
  style={{
    ...styles.card,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 16,
  }}
  onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
>
  <img
    src={seuConilon}
    alt="Seu Conilon"
    style={{
      width: 82,
      height: 82,
      objectFit: "contain",
      flexShrink: 0,
    }}
  />

  <div>
    <p
  style={{
    ...styles.label,
    color: "#f5f0e8",
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.25,
    marginBottom: 10,
  }}
>
  Como esse preço paga minha safra?
</p>

    <p style={{ ...styles.info, marginBottom: 10 }}>
      O Conilon Hoje transforma o preço do mercado no resultado da sua propriedade.
    </p>

    <strong style={{ color: "#facc15", fontSize: 15 }}>
      {mostrarCalculadora ? "Fechar calculadora ↑" : "Calcular minha margem →"}
    </strong>
  </div>
</section>

{mostrarCalculadora && (
  <section style={styles.card}>
    <p style={styles.label}>Antes de calcular sua margem, confirme todos os custos.</p>

    <div style={styles.costReferenceBox}>
      <div style={styles.costGroup}>
        <p style={styles.costGroupTitle}>Custos de Produção</p>
        <CostLine label="Fertilizantes e corretivos" value={custosDetalhados.fertilizantes} onChange={(v) => atualizarCustoDetalhado("fertilizantes", v)} />
        <CostLine label="Defensivos agrícolas" value={custosDetalhados.defensivos} onChange={(v) => atualizarCustoDetalhado("defensivos", v)} />
        <CostLine label="Mão de obra" value={custosDetalhados.maoDeObra} onChange={(v) => atualizarCustoDetalhado("maoDeObra", v)} />
        <div style={styles.costSubtotal}>
          <span>Subtotal produção</span>
          <strong>{fmt(custoProducao)}/sc</strong>
        </div>
      </div>

      <div style={styles.costGroup}>
        <p style={styles.costGroupTitle}>Custos de Colheita e pós-colheita</p>
        <CostLine label="Colheita e secagem" value={custosDetalhados.colheita} onChange={(v) => atualizarCustoDetalhado("colheita", v)} />
        <CostLine label="Beneficiamento" value={custosDetalhados.beneficiamento} onChange={(v) => atualizarCustoDetalhado("beneficiamento", v)} />
        <CostLine label="Frete e transporte" value={custosDetalhados.frete} onChange={(v) => atualizarCustoDetalhado("frete", v)} />
        <div style={styles.costSubtotal}>
          <span>Subtotal colheita</span>
          <strong>{fmt(custoColheita)}/sc</strong>
        </div>
      </div>

      <div style={styles.costGroup}>
        <p style={styles.costGroupTitle}>Custos Estruturais</p>
        <CostLine label="Combustível e manutenção" value={custosDetalhados.combustivel} onChange={(v) => atualizarCustoDetalhado("combustivel", v)} />
        <CostLine label="Custos administrativos e financeiros" value={custosDetalhados.administrativo} onChange={(v) => atualizarCustoDetalhado("administrativo", v)} />
        <CostLine label="Depreciação de máquinas e equipamentos" value={custosDetalhados.depreciacao} onChange={(v) => atualizarCustoDetalhado("depreciacao", v)} highlight />
        <CostLine label="Custo de oportunidade da terra" value={custosDetalhados.terra} onChange={(v) => atualizarCustoDetalhado("terra", v)} highlight />

        <div style={styles.costSubtotal}>
          <span>Subtotal estrutural</span>
          <strong>{fmt(custoEstrutura)}/sc</strong>
        </div>
      </div>

      <div style={styles.costTotalBox}>
        <span>Custo total detalhado</span>
        <strong>{fmt(custoTotalDetalhado)}/sc</strong>
      </div>
    </div>

    <div style={styles.resultBox}>
      <div style={styles.resultRow}>
        <span style={styles.resultLabel}>Preço recebido</span>
        <strong style={{ ...styles.resultValue, color: "#8BFF6A" }}>
          {fmt(Number(precoRecebido))}
        </strong>
      </div>

      <div style={styles.resultRow}>
        <span style={styles.resultLabel}>Custo total / sc</span>
        <strong style={{ ...styles.resultValue, color: "#E8D17A" }}>
          {fmt(custoTotalDetalhado)}
        </strong>
      </div>

      <hr style={styles.resultDivider} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginTop: 10 }}>
        <span style={{ ...styles.resultLabel, flex: 1 }}>
          {margemDetalhadaPorSaca >= 0 ? "⬆ Margem estimada / saca" : "⬇ Prejuízo estimado / saca"}
        </span>

        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ color: margemDetalhadaPorSaca >= 0 ? "#8BFF6A" : "#f87171", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
            {Number(precoRecebido) > 0
              ? (Math.abs(margemDetalhadaPorSaca) / Number(precoRecebido) * 100).toFixed(1)
              : "0.0"}%
          </div>

          <div style={{ color: "#a7a093", fontSize: 12, marginTop: 6 }}>
            {margemDetalhadaPorSaca >= 0 ? "do preço vira margem" : "prejuízo sobre o preço"}
          </div>
        </div>

        <strong style={{ ...styles.marginValue, color: margemDetalhadaPorSaca >= 0 ? "#8BFF6A" : "#f87171", flex: 1, textAlign: "right" }}>
          {margemDetalhadaPorSaca >= 0 ? "+ " : "- "}{fmt(Math.abs(margemDetalhadaPorSaca))}
        </strong>
      </div>
    </div>

    <p style={styles.costFinalNote}>
      Valores inseridos manualmente. Compare com o custo de referência do Espírito Santo disponível no painel. Custos não registrados distorcem a margem calculada e podem levar a interpretações equivocadas sobre a rentabilidade da lavoura.
    </p>
  </section>
)}
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #102117 0%, #18261D 100%)",
    color: "#f0ebe0",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header:      { marginBottom: 24 },
  brandCard:   { background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)", border: "1px solid #1f342b", borderRadius: 16, padding: 16, marginBottom: 24 },
  brandRow:    { display: "flex", alignItems: "center", gap: 12 },
  logo:        { width: 68, height: 68, borderRadius: 12 },
  brandTitle:  { fontSize: 34, fontWeight: 700, color: "#f0ebe0", lineHeight: 1.1 },
  premiumLine: { fontSize: 16, fontWeight: 700, color: "#c8a96e", letterSpacing: "0.12em", marginTop: 2 },
  updatedText: { fontSize: 12, color: "#a7a093", marginTop: 4 },

moduleTitle: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 10,
},

icon: {
  fontSize: 34,
  lineHeight: 1,
},

h1: {
  margin: 0,
  fontSize: 26,
  fontWeight: 800,
  color: "#f5f0e8",
  lineHeight: 1.1,
},

questionCard: {
  background:
    "linear-gradient(180deg, rgba(214,168,79,0.16), rgba(255,255,255,0.06))",
  border: "1px solid rgba(214,168,79,0.28)",
  borderRadius: "20px",
  padding: "15px 16px",
  marginBottom: "12px",
},

question: {
  margin: 0,
  color: "#f5f0e8",
  fontSize: "15px",
  fontWeight: 800,
  lineHeight: 1.45,
},

  title:       { fontSize: 28, margin: 0, lineHeight: 1.25 },
  subtitle:    { color: "#a7a093", fontSize: 13, lineHeight: 1.5 },
  card:        { background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)", border: "1px solid rgba(120,160,120,0.14)", borderRadius: 16, padding: 18, marginBottom: 16 },
  label:       { color: "#8f8a80", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12, fontWeight: 700, marginBottom: 12 },
  buttons:     { display: "flex", gap: 8, marginBottom: 18 },
  typeButton:  { flex: 1, border: "none", borderRadius: 10, padding: "12px 8px", fontWeight: 700, cursor: "pointer" },
  price:       { color: "#c8a96e", fontSize: 46, fontWeight: 700 },
  cost:        { fontSize: 28 },
  small:       { color: "#8f8a80", fontSize: 13 },
  row:         { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  positiveBox: { background: "#0b2d18", border: "1px solid #166534", borderRadius: 12, padding: 16, marginTop: 16 },
  negativeBox: { background: "#2d0a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: 16, marginTop: 16 },
  positiveText:   { color: "#4ade80", fontSize: 34 },
  negativeText:   { color: "#f87171", fontSize: 34 },
  inlinePositive: { color: "#4ade80" },
  inlineNegative: { color: "#f87171" },
  resultText:  { color: "#c8c0b0", fontSize: 14, lineHeight: 1.5 },
  input:       { width: "100%", boxSizing: "border-box", background: "#17231d", border: "1px solid #30463b", color: "#f0ebe0", borderRadius: 10, padding: 14, marginBottom: 10, fontSize: 16 },
  results:     { marginTop: 12 },
  resultBox:   { marginTop: 16, background: "#101915", border: "1px solid #30463b", borderRadius: 12, padding: 14 },
  resultRow:   { display: "flex", justifyContent: "space-between", background: "#17231d", padding: 12, borderRadius: 10, marginBottom: 8, color: "#d6d0c2" },
  resultLabel: { color: "#c8c0b0", fontSize: 13 },
  resultValue: { fontSize: 15, fontWeight: 700 },
  resultDivider: { border: "none", borderTop: "1px solid #30463b", margin: "8px 0" },
  marginValue: { fontSize: 20, fontWeight: 800 },
  info:        { color: "#c8c0b0", lineHeight: 1.6, fontSize: 14 },
  infoMuted:   { color: "#8f8a80", lineHeight: 1.6, fontSize: 13 },
  insightBox:  { background: "#17231d", border: "1px solid #30463b", borderRadius: 14, padding: 14 },
  insightTitle: { color: "#c8a96e", fontWeight: 800, fontSize: 15, marginTop: 0, marginBottom: 14 },
  insightSub:  { color: "#c8c0b0", fontSize: 13, margin: "4px 0" },
  costReferenceBox: { marginTop: 16 },
  costGroup:   { background: "rgba(7,17,12,0.22)", border: "1px solid rgba(200,169,110,0.12)", borderRadius: 12, padding: 12, marginBottom: 12 },
  costGroupTitle: { color: "#c8a96e", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 12, fontWeight: 800, margin: 0, marginBottom: 10 },
  costLine:    { display: "grid", gridTemplateColumns: "22px 1fr auto", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  costIcon:    { color: "#c8a96e", fontWeight: 900 },
  costIconHighlight: { color: "#facc15", fontWeight: 900 },
  costLineLabel: { color: "#f0ebe0", fontSize: 13, lineHeight: 1.35 },
  costInputWrap: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 },
  costInput:   { width: 54, background: "#1b2d25", border: "1px solid #385045", borderRadius: 6, color: "#f3f0e6", fontSize: 14, fontWeight: 700, textAlign: "right", padding: "4px 6px", boxSizing: "border-box", outline: "none" },
  costInputSuffix: { fontSize: 12, color: "#9fb09f", fontWeight: 600, whiteSpace: "nowrap" },
  costSubtotal: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(200,169,110,0.18)", color: "#a7a093", fontSize: 12, fontWeight: 700 },
  costTotalBox: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(200,169,110,0.12)", border: "1px solid rgba(200,169,110,0.28)", borderRadius: 12, padding: 12, color: "#f0ebe0", fontSize: 13, fontWeight: 800 },
  costFinalNote: { marginTop: 18, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)", color: "#8f9a8f", fontSize: 12, lineHeight: 1.55, fontStyle: "italic" },
};