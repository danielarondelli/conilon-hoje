import React, { useEffect, useState } from "react";

import logoConilon from "../assets/logo-conilon.jpg.jpeg";

const PRECO_COOABRIEL = {
  tipo7: 920,
  tipo78: 900,
  tipo8: 875,
};

const CUSTO_REFERENCIA_ES = 591;

const TIPOS = {
  tipo7: "Tipo 7",
  tipo78: "Tipo 7/8",
  tipo8: "Tipo 8",
};
const HISTORICO_COOABRIEL_30D = [
  860, 865, 870, 875, 880,
  882, 885, 887, 890, 892,
  895, 898, 900, 902, 905,
  907, 910, 912, 915, 918,
  920, 918, 915, 917, 919,
  920, 922, 918, 920, 920,
];

const fmt = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export default function PremiumCooabriel() {
  const [tipo, setTipo] = useState("tipo7");
  const [custoUsuario, setCustoUsuario] = useState("");
  const [sacas, setSacas] = useState("");

  const [precoRecebido, setPrecoRecebido] = useState("");
const [dadosApp, setDadosApp] = useState(null);
const [historicoCooabriel30d, setHistoricoCooabriel30d] = useState([]);
useEffect(() => {
  const urlApp = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub?gid=951000819&single=true&output=csv";
  const urlPagina1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub?gid=863354306&single=true&output=csv";

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

  // Fetch 1: aba app — data + cooabriel tipo 7 + histórico
  const fetchApp = fetch(urlApp)
    .then((res) => res.text())
    .then((text) => {
      const linhas = text.trim().split(/\r?\n/).filter((l) => l.trim() !== "");
      const cabecalho = parseCsvLine(linhas[0]);
      const dadosLinhas = linhas.slice(1).map(parseCsvLine);

      const indiceData = cabecalho.indexOf("data");
      const indiceCooabriel = cabecalho.indexOf("cooabriel");

      // última linha válida com cooabriel
      const ultimaLinha = [...dadosLinhas]
        .reverse()
        .find((l) => limparNumero(l[indiceCooabriel]) > 0);

      const data = ultimaLinha?.[indiceData] || "";
      const cooabriel = limparNumero(ultimaLinha?.[indiceCooabriel]);

      // histórico para o gráfico: todas as linhas com cooabriel > 0
      const historico = dadosLinhas
        .map((l) => limparNumero(l[indiceCooabriel]))
        .filter((v) => v > 0);

      return { data, cooabriel, historico };
    });

  // Fetch 2: Página1 — cooabriel_tipo_78 e cooabriel_tipo_8
  const fetchPagina1 = fetch(urlPagina1)
    .then((res) => res.text())
    .then((text) => {
      const linhas = text.trim().split(/\r?\n/).filter((l) => l.trim() !== "");
      const cabecalho = parseCsvLine(linhas[0]);
      const dadosLinhas = linhas.slice(1).map(parseCsvLine);

      const indiceTipo78 = cabecalho.indexOf("cooabriel_tipo_78");
      const indiceTipo8 = cabecalho.indexOf("cooabriel_tipo_8");

      const ultimaTipo78 = [...dadosLinhas]
        .reverse()
        .find((l) => limparNumero(l[indiceTipo78]) > 0);

      const ultimaTipo8 = [...dadosLinhas]
        .reverse()
        .find((l) => limparNumero(l[indiceTipo8]) > 0);

      return {
        cooabriel78: limparNumero(ultimaTipo78?.[indiceTipo78]),
        cooabriel8: limparNumero(ultimaTipo8?.[indiceTipo8]),
      };
    });

  Promise.all([fetchApp, fetchPagina1]).then(([app, pagina1]) => {
    const ultimos30 = app.historico.slice(-30);
    const precoAtual = ultimos30[ultimos30.length - 1] || 0;

    setHistoricoCooabriel30d(ultimos30);
    setPrecoRecebido(precoAtual);
    setDadosApp({
      data: app.data,
      cooabriel: app.cooabriel,
      cooabriel78: pagina1.cooabriel78,
      cooabriel8: pagina1.cooabriel8,
    });
  });
}, []);

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

  const precoBase = Number(dadosApp?.cooabriel || dadosApp?.tipo7 || PRECO_COOABRIEL.tipo7);

const PRECO_ATUAL_COOABRIEL = {
  tipo7: Number(dadosApp?.cooabriel || dadosApp?.tipo7 || precoBase),
  tipo78: Number(dadosApp?.cooabriel78 || dadosApp?.tipo78 || PRECO_COOABRIEL.tipo78),
tipo8: Number(dadosApp?.cooabriel8 || dadosApp?.tipo8 || PRECO_COOABRIEL.tipo8),
};

const preco = PRECO_ATUAL_COOABRIEL[tipo];
  const custo = custoUsuario ? Number(custoUsuario) : CUSTO_REFERENCIA_ES;
  const quantidade = sacas ? Number(sacas) : 0;

  const margemPorSaca = preco - custo;
  const receitaBruta = preco * quantidade;
  const custoTotal = custo * quantidade;
  const margemTotal = receitaBruta - custoTotal;
  const margemPercentualVenda = preco > 0 ? (margemPorSaca / preco) * 100 : 0;


  const margemPositiva = margemPorSaca >= 0;

  const custoProducao =
  custosDetalhados.fertilizantes +
  custosDetalhados.defensivos +
  custosDetalhados.maoDeObra;

const custoColheita =
  custosDetalhados.colheita +
  custosDetalhados.beneficiamento +
  custosDetalhados.frete;

const custoEstrutura =
  custosDetalhados.combustivel +
  custosDetalhados.administrativo +
  custosDetalhados.depreciacao +
  custosDetalhados.terra;

const custoTotalDetalhado =
  custoProducao + custoColheita + custoEstrutura;

const margemDetalhadaPorSaca = Number(precoRecebido || 0) - custoTotalDetalhado;

const atualizarCustoDetalhado = (campo, valor) => {
  setCustosDetalhados((custosAtuais) => ({
    ...custosAtuais,
    [campo]: Number(valor) || 0,
  }));
};

   const valores30d = historicoCooabriel30d.length > 0
  ? historicoCooabriel30d
  : HISTORICO_COOABRIEL_30D.filter((valor) => Number(valor) > 0);

    const historicoMargem30d = valores30d.map((valor, index) => {
  const precoHistorico = Number(valor);
  const margemHistorica = precoHistorico - custo;
  const margemPercentual = custo > 0 ? (margemHistorica / custo) * 100 : 0;

  return {
    dia: index + 1,
    preco: precoHistorico,
    margem: margemHistorica,
    margemPercentual,
  };
});

const ultimos7Dias = historicoMargem30d.slice(-7);

const margemInicial7d =
  ultimos7Dias.length > 0 ? ultimos7Dias[0].margemPercentual : 0;

const margemAtual7d =
  ultimos7Dias.length > 0
    ? ultimos7Dias[ultimos7Dias.length - 1].margemPercentual
    : 0;

const tendenciaPositiva7d = margemAtual7d >= margemInicial7d;

const variacao7d = margemAtual7d - margemInicial7d;

const margemPercentualAtual =
  custo > 0 ? (margemPorSaca / custo) * 100 : 0;

const margemPercentualGaugeMin = -50;
const margemPercentualGaugeMax = 100;

const margemPercentualGaugeLimitada = Math.max(
  margemPercentualGaugeMin,
  Math.min(margemPercentualAtual, margemPercentualGaugeMax)
);

const posicaoGaugeMargem =
  ((margemPercentualGaugeLimitada - margemPercentualGaugeMin) /
    (margemPercentualGaugeMax - margemPercentualGaugeMin)) *
  100;

const textoTendencia7d =
  Math.abs(variacao7d) < 1
    ? `⚪ A margem permaneceu estável nos últimos 7 dias, oscilando entre ${Math.round(margemInicial7d)}% e ${Math.round(margemAtual7d)}%.`
    : tendenciaPositiva7d
    ? `🟢 A margem ganhou força nos últimos 7 dias, evoluindo de ${Math.round(margemInicial7d)}% para ${Math.round(margemAtual7d)}%.`
    : `🔴 A margem perdeu força nos últimos 7 dias, recuando de ${Math.round(margemInicial7d)}% para ${Math.round(margemAtual7d)}%.`;

const margemPercentualValores30d = historicoMargem30d.map(
  (item) => item.margemPercentual
);

const margemPercentualValores7d = ultimos7Dias.map(
  (item) => item.margemPercentual
);

const margemPercentualMinima30d = -20;
const margemPercentualMaxima30d = 80;

const margemPercentualAmplitude30d =
  margemPercentualMaxima30d - margemPercentualMinima30d;
const pontosGraficoMargem = ultimos7Dias
  .map((item, index) => {
    const x =
      ultimos7Dias.length === 1
        ? 160
        : 20 + (index * 280) / (ultimos7Dias.length - 1);

    const percentualLimitado = Math.max(
  margemPercentualMinima30d,
  Math.min(item.margemPercentual, margemPercentualMaxima30d)
);

const y =
  75 -
  ((percentualLimitado - margemPercentualMinima30d) /
    margemPercentualAmplitude30d) *
    55;

    return `${x},${y}`;
  })
  .join(" ");

  const precoAtual30d = valores30d[valores30d.length - 1] || Number(precoRecebido || 0);
  const precoMinimo30d = Math.min(...valores30d);
  const precoMaximo30d = Math.max(...valores30d);

  const media30d =
    valores30d.reduce((total, valor) => total + valor, 0) / valores30d.length;

  const diferencaMedia30d = ((precoAtual30d - media30d) / media30d) * 100;

  const posicaoPreco30d =
    precoMaximo30d === precoMinimo30d
      ? 50
      : ((precoAtual30d - precoMinimo30d) / (precoMaximo30d - precoMinimo30d)) * 100;

  const textoPosicao30d =
    posicaoPreco30d >= 70
      ? "O preço atual está próximo da máxima dos últimos 30 dias."
      : posicaoPreco30d <= 30
      ? "O preço atual está próximo da mínima dos últimos 30 dias."
      : "O preço atual está próximo do centro da faixa de negociação dos últimos 30 dias.";

        const leituraMercado30d =
    posicaoPreco30d >= 70 && diferencaMedia30d > 1
      ? {
          selo: "Mercado forte",
          simbolo: "●",
          cor: "#4ade80",
          texto:
            "O preço atual combina proximidade da máxima com negociação acima da média recente.",
        }
      : posicaoPreco30d <= 30 && diferencaMedia30d < -1
      ? {
          selo: "Mercado fraco",
          simbolo: "●",
          cor: "#f87171",
          texto:
            "O preço atual combina proximidade da mínima com negociação abaixo da média recente.",
        }
      : {
          selo: "Mercado neutro",
          simbolo: "●",
          cor: "#facc15",
          texto:
            "O preço atual não mostra força ou fraqueza dominante dentro dos últimos 30 dias.",
        };

  const textoTendencia30d =
    diferencaMedia30d > 1
    ? "O mercado negocia acima do comportamento médio recente."
    : diferencaMedia30d < -1
    ? "O mercado negocia abaixo do comportamento médio recente."
    : "O mercado permanece próximo do padrão médio recente.";

    const observacaoHistorico =
  tipo === "tipo7"
    ? "Análise baseada na série histórica do tipo 7 da Cooabriel dos últimos 30 dias."
    : "Análise baseada na série histórica do Tipo 7 da Cooabriel, utilizada como referência de mercado.";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
  <div style={styles.brandCard}>
  <div style={styles.brandRow}>
    <img
  src={logoConilon}
  alt="Logo Conilon Hoje"
  style={styles.logo}
/>

    <div>
      <div style={styles.brandTitle}>Conilon Hoje</div>

      <div style={styles.premiumLine}>PREMIUM</div>

      <div style={styles.updatedText}>
      Atualizado: {dadosApp?.data || dadosApp?.Data || dadosApp?.DATA || "Carregando..."}
      </div>
    </div>
  </div>
</div>

  <h1 style={styles.title}>
    Esse preço paga minha safra?
  </h1>

  <p style={styles.subtitle}>
    Uma leitura da margem operacional utilizando o preço de referência da Cooabriel para o mercado de conilon do Espírito Santo.
  </p>
</header>

      <section style={styles.card}>
        <p style={styles.label}>Preço do dia · Cooabriel</p>

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
      </section>

      <section style={styles.card}>
        <p style={styles.label}>Custo de referência · Espírito Santo</p>

        <div style={styles.row}>
          <strong style={styles.cost}>{fmt(CUSTO_REFERENCIA_ES)}</strong>
          <span style={styles.small}>Fonte: Senar-ES ATeG 2024/25</span>
        </div>

        <div style={margemPositiva ? styles.positiveBox : styles.negativeBox}>
          <p style={styles.small}>Margem estimada por saca</p>

          <strong style={margemPositiva ? styles.positiveText : styles.negativeText}>
            {margemPositiva ? "+" : ""}
            {fmt(margemPorSaca)}
          </strong>

          <p style={styles.resultText}>
            {margemPositiva
              ? "Esse preço cobre o custo de referência e deixa margem positiva."
              : "Esse preço está abaixo do custo de referência."}
          </p>
        </div>
      </section>

      <section style={styles.card}>
        <p style={styles.label}>Simule com seu custo real</p>

        <input
          style={styles.input}
          type="number"
          placeholder="Seu custo por saca"
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
            <Result label="Custo estimado" value={fmt(custoTotal)} />
            <Result
              label="Margem total"
              value={`${margemTotal >= 0 ? "+" : ""}${fmt(margemTotal)}`}
              highlight={margemTotal >= 0}
            />
          </div>
        )}
      </section>

      <section style={styles.card}>
        <p
  style={{
    ...styles.label,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 16,
  }}
>
  O que isso significa para o meu café?
</p>

        <p style={styles.info}>
          Considerando o preço atual da Cooabriel para {TIPOS[tipo]}, a margem estimada é de{" "}
          <strong style={margemPositiva ? styles.inlinePositive : styles.inlineNegative}>
            {margemPositiva ? "+" : ""}
            {fmt(margemPorSaca)} por saca
          </strong>
          .
        </p>

        <p style={styles.info}>
          {margemPositiva
            ? "Isso indica que o preço atual ainda remunera a produção acima do custo informado ou do custo de referência usado no cálculo."
            : "Isso indica que o preço atual não cobre integralmente o custo informado ou o custo de referência usado no cálculo."}
        </p>

        <p style={styles.infoMuted}>
          Esta leitura não é recomendação de venda. É uma interpretação da margem entre preço e custo.
        </p>
      </section>

      <section style={styles.card}>
  <p style={styles.label}>Onde o preço está hoje?</p>

  <svg width="320" height="155" viewBox="0 0 320 155">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <polyline
    fill="none"
    stroke="#7ee787"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    filter="url(#glow)"
    points={valores30d
      .map((valor, index) => {
        const x =
          valores30d.length === 1
            ? 160
            : 20 + (index * 280) / (valores30d.length - 1);

        const y =
          95 -
          ((Number(valor) - precoMinimo30d) /
            (precoMaximo30d - precoMinimo30d || 1)) *
            60;

        return `${x},${y}`;
      })
      .join(" ")}
  />

  {(() => {
    const indiceMinimo = valores30d.findIndex(
      (valor) => Number(valor) === precoMinimo30d
    );

    const x =
      valores30d.length === 1
        ? 160
        : 20 + (indiceMinimo * 280) / (valores30d.length - 1);

    const y = 95;

    return (
      <>
        <circle cx={x} cy={y} r="7" fill="#f87171" filter="url(#glow)" />
        <text x={x + 10} y={y + 5} fill="#f87171" fontSize="11" fontWeight="700">
          Min {fmt(precoMinimo30d)}
        </text>
      </>
    );
  })()}

  {(() => {
    let indiceMedia = 0;
    let menorDiferenca = Infinity;

    valores30d.forEach((valor, index) => {
      const diferenca = Math.abs(Number(valor) - media30d);
      if (diferenca < menorDiferenca) {
        menorDiferenca = diferenca;
        indiceMedia = index;
      }
    });

    const valorMedia = Number(valores30d[indiceMedia]);

    const x =
      valores30d.length === 1
        ? 160
        : 20 + (indiceMedia * 280) / (valores30d.length - 1);

    const y =
      95 -
      ((valorMedia - precoMinimo30d) /
        (precoMaximo30d - precoMinimo30d || 1)) *
        60;

    return (
      <>
        <circle cx={x} cy={y} r="7" fill="#facc15" filter="url(#glow)" />
        <text x={x + 10} y={y + 5} fill="#facc15" fontSize="11" fontWeight="700">
          Média {fmt(media30d)}
        </text>
      </>
    );
  })()}

  {(() => {
    const indiceHoje = valores30d.length - 1;
    const valorHoje = Number(valores30d[indiceHoje]);

    const x =
      valores30d.length === 1
        ? 160
        : 20 + (indiceHoje * 280) / (valores30d.length - 1);

    const y =
      95 -
      ((valorHoje - precoMinimo30d) /
        (precoMaximo30d - precoMinimo30d || 1)) *
        60;

    return (
      <>
        <circle cx={x} cy={y} r="8" fill="#7ee787" filter="url(#glow)" />
        <text x={x - 45} y={y - 10} fill="#7ee787" fontSize="11" fontWeight="700">
          Hoje {fmt(precoAtual30d)}
        </text>
      </>
    );
  })()}
</svg>

  <div style={styles.insightBox}>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      alignItems: "start",
    }}
  >
    <div>
      <p style={styles.insightTitle}>Preço hoje</p>
<strong
  style={{
    fontSize: 40,
    fontWeight: 700,
    color: "#f0ebe0"
  }}
>
  {fmt(precoAtual30d)}
</strong>
    </div>

    <div>
      <p style={styles.insightTitle}>Faixa dos últimos 30 dias</p>

<p style={{ ...styles.insightSub, color: "#f87171" }}>
  ● Mín. {fmt(precoMinimo30d)}
</p>

<p style={{ ...styles.insightSub, color: "#facc15" }}>
  ● Média {fmt(media30d)}
</p>

<p style={{ ...styles.insightSub, color: "#7ee787" }}>
  ● Máx. {fmt(precoMaximo30d)}
</p>
    </div>
  </div>
</div>

    

  <p style={styles.info}>
    A saca Tipo 7 na Cooabriel está em patamar elevado, próxima da máxima registrada nos últimos 30 dias.
  </p>
</section>
      <section style={styles.card}>
<p style={styles.label}>Margem Operacional • Tendência</p>

<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "16px",
    marginBottom: "16px",
  }}
>
  <div>
    <div
      style={{
        color: margemPorSaca >= 0 ? "#7ee787" : "#f87171",
        fontSize: "34px",
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {margemPorSaca >= 0 ? "+" : ""}
      {fmt(margemPorSaca)}/sc
    </div>

    <div style={{ color: "#c8c0b0", fontSize: "13px", marginTop: "6px" }}>
      {margemPorSaca > 0
        ? "Margem positiva"
        : margemPorSaca === 0
        ? "Ponto de equilíbrio"
        : "Margem abaixo do custo"}
    </div>
  </div>

  <svg width="340" height="110" viewBox="0 0 340 110">
  {/* linha base */}
  <line
    x1="20"
    y1="45"
    x2="300"
    y2="45"
    stroke="#30463b"
    strokeWidth="4"
    strokeLinecap="round"
  />

  {/* zona negativa */}
  <line
    x1="20"
    y1="45"
    x2="113"
    y2="45"
    stroke="#f87171"
    strokeWidth="6"
    strokeLinecap="round"
  />

  {/* zona positiva */}
  <line
    x1="113"
    y1="45"
    x2="300"
    y2="45"
    stroke="#4ade80"
    strokeWidth="6"
    strokeLinecap="round"
  />

  {/* marcador */}
  <circle
    cx={20 + (280 * posicaoGaugeMargem) / 100}
    cy="45"
    r="8"
    fill={margemPorSaca >= 0 ? "#d6c08d" : "#f87171"}
  />

  {/* início */}
<text
  x="20"
  y="75"
  fill="#8c8c80"
  fontSize="20"
  textAnchor="middle"
>
  Ruim
</text>

  {/* centro */}
<text
  x="113"
  y="75"
  fill="#8c8c80"
  fontSize="20"
  textAnchor="middle"
>
  Equilíbrio
</text>

  {/* final */}
<text
  x="300"
  y="75"
  fill="#8c8c80"
  fontSize="20"
  textAnchor="middle"
>
  Forte
</text>

</svg>
</div>

<p style={styles.infoMuted}>
  {margemPorSaca >= 0
    ? "A margem calculada indica que o preço atual está acima do custo informado ou do custo de referência usado no cálculo."
    : "A margem calculada indica que o preço atual está abaixo do custo informado ou do custo de referência usado no cálculo."}
</p>

<div
  style={{
    color:
      margemPercentualVenda >= 20
        ? "#7ee787"
        : margemPercentualVenda >= 0
        ? "#facc15"
        : "#f87171",
    fontSize: 20,
    fontWeight: 800,
    marginTop: "8px",
    marginBottom: "6px",
  }}
>
  {margemPercentualVenda >= 0
  ? `↗ Margem positiva de ${Math.abs(margemPercentualVenda).toFixed(1)}%`
  : `↘ Prejuízo de ${Math.abs(margemPercentualVenda).toFixed(1)}%`}
</div>

<p
  style={{
    color: margemPorSaca >= 0 ? "#7ee787" : "#f87171",
    fontWeight: 700,
    marginTop: "10px",
  }}
>
  {margemPorSaca >= 0
    ? "● Tendência positiva de rentabilidade."
    : "● Tendência negativa de rentabilidade."}
</p>
</section>

            <section style={styles.card}>
          <div style={styles.insightBox}>
            <p style={styles.insightTitle}>Comparação com a média recente</p>

            <div style={{ marginBottom: 18 }}>
  <div
    style={{
      fontSize: 40,
      fontWeight: 800,
      color: "#f0ebe0",
      lineHeight: 1,
      marginBottom: 10,
    }}
  >
    {fmt(precoAtual30d)}
  </div>

  <div
    style={{
      color: diferencaMedia30d >= 0 ? "#4ade80" : "#f87171",
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 14,
    }}
  >
    {diferencaMedia30d >= 0 ? "+" : ""}
    {diferencaMedia30d.toFixed(1)}% em relação à média
  </div>

  <div
    style={{
      background: "#101915",
      border: "1px solid #30463b",
      borderRadius: 10,
      padding: "10px 12px",
      display: "inline-block",
    }}
  >
    <div
      style={{
        color: "#8f8a80",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      Média 30 dias
    </div>

    <div
      style={{
        color: "#f0ebe0",
        fontWeight: 700,
        fontSize: 20,
        marginTop: 4,
      }}
    >
      {fmt(media30d)}
    </div>
  </div>
</div>
            <p style={styles.info}>{textoTendencia30d}</p>

<p
  style={{
    ...styles.small,
    marginTop: 8,
  }}
>
  {observacaoHistorico}
</p>
          </div>
        
      </section>

      <section style={styles.card}>
        <p style={styles.label}>Parceiro Premium</p>

        <div
          style={{
            background: "#17231d",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#c8a96e", marginTop: 0 }}>
            AgroFértil Nutrição
          </h3>

          <p style={{ color: "#c8c0b0" }}>
            Soluções para fertilidade do solo, produtividade e rentabilidade do cafeeiro.
          </p>

          <p style={{ color: "#8f8a80", fontSize: "13px" }}>
            Espaço demonstrativo para patrocinadores.
          </p>
        </div>
      </section>


      <section style={styles.card}>
  <p style={styles.label}>
    Antes de calcular sua margem, confirme se você está contabilizando todos os custos.
  </p>

  

  <div style={styles.costReferenceBox}>
  <div style={styles.costGroup}>
    <p style={styles.costGroupTitle}>Custos de Produção</p>

    <CostLine
  label="Fertilizantes e corretivos"
  value={custosDetalhados.fertilizantes}
  onChange={(valor) => atualizarCustoDetalhado("fertilizantes", valor)}
/>

<CostLine
  label="Defensivos agrícolas"
  value={custosDetalhados.defensivos}
  onChange={(valor) => atualizarCustoDetalhado("defensivos", valor)}
/>

<CostLine
  label="Mão de obra"
  value={custosDetalhados.maoDeObra}
  onChange={(valor) => atualizarCustoDetalhado("maoDeObra", valor)}
/>

    <div style={styles.costSubtotal}>
      <span>Subtotal custos de produção</span>
      <strong>{fmt(custoProducao)}/sc</strong>
    </div>
  </div>

  <div style={styles.costGroup}>
    <p style={styles.costGroupTitle}>Custos de Colheita e pós-colheita</p>

    <CostLine
  label="Colheita e secagem"
  value={custosDetalhados.colheita}
  onChange={(valor) => atualizarCustoDetalhado("colheita", valor)}
/>

<CostLine
  label="Beneficiamento"
  value={custosDetalhados.beneficiamento}
  onChange={(valor) => atualizarCustoDetalhado("beneficiamento", valor)}
/>

<CostLine
  label="Frete e transporte"
  value={custosDetalhados.frete}
  onChange={(valor) => atualizarCustoDetalhado("frete", valor)}
/>
    <div style={styles.costSubtotal}>
      <span>Subtotal colheita e pós-colheita</span>
      <strong>{fmt(custoColheita)}/sc</strong>
    </div>
  </div>

  <div style={styles.costGroup}>
    <p style={styles.costGroupTitle}>Custos Estruturais</p>

    <CostLine
  label="Combustível e manutenção"
  value={custosDetalhados.combustivel}
  onChange={(valor) => atualizarCustoDetalhado("combustivel", valor)}
/>

<CostLine
  label="Custos administrativos e financeiros"
  value={custosDetalhados.administrativo}
  onChange={(valor) => atualizarCustoDetalhado("administrativo", valor)}
/>

<CostLine
  label="Depreciação de máquinas e equipamentos"
  value={custosDetalhados.depreciacao}
  onChange={(valor) => atualizarCustoDetalhado("depreciacao", valor)}
  highlight
/>

<CostLine
  label="Custo de oportunidade da terra"
  value={custosDetalhados.terra}
  onChange={(valor) => atualizarCustoDetalhado("terra", valor)}
  highlight
/>

    <div style={styles.costSubtotal}>
      <span>Subtotal custos estruturais</span>
      <strong>{fmt(custoEstrutura)}/sc</strong>
    </div>
  </div>

  <div style={styles.costTotalBox}>
    <span>Custo de referência total</span>
    <strong>R$ 591/sc</strong>
  </div>
</div>

  <div style={styles.resultBox}>
  <div style={styles.resultRow}>
    <span style={styles.resultLabel}>Preço recebido</span>
    <strong
  style={{
    ...styles.resultValue,
    color: "#8BFF6A",
  }}
>
  R$ {Number(precoRecebido).toFixed(2)}
</strong>
  </div>

  <div style={styles.resultRow}>
    <span style={styles.resultLabel}>Custo total / sc</span>
    <strong
  style={{
    ...styles.resultValue,
    color: "#E8D17A",
  }}
>
      R$ {custoTotalDetalhado.toFixed(2)}
    </strong>
  </div>

  <hr style={styles.resultDivider} />

  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
  }}
>
  <span style={{ ...styles.resultLabel, flex: 1, order: 1 }}>
  {margemDetalhadaPorSaca >= 0
    ? "⬆ Margem estimada / saca"
    : "⬇ Prejuízo estimado / saca"}
</span>

  <strong
    style={{
       ...styles.marginValue,
  color: margemDetalhadaPorSaca >= 0 ? "#8BFF6A" : "#f87171",
  whiteSpace: "nowrap",
  textAlign: "right",
  flex: 1,
  order: 3,
  marginLeft: 0,
    }}
  >
    {margemDetalhadaPorSaca >= 0 ? "+ R$ " : "- R$ "}
    {Math.abs(margemDetalhadaPorSaca).toFixed(2)}
  </strong>

<div
  style={{
  textAlign: "center",
  flex: 1,
  order: 2
}}
>
  <div
    style={{
      color: margemDetalhadaPorSaca >= 0 ? "#8BFF6A" : "#f87171",
      fontSize: 30,
      fontWeight: 800,
      lineHeight: 1
    }}
  >
    {(Math.abs(margemDetalhadaPorSaca) / Number(precoRecebido || 0) * 100).toFixed(1)}%
  </div>

  <div
    style={{
      color: "#a7a093",
      fontSize: 12,
      marginTop: 6
    }}
  >
    {margemDetalhadaPorSaca >= 0
  ? "do preço da saca vira margem"
  : "com esse custo, a saca opera no prejuízo"}
  </div>
</div>

<p
  style={{
    display: "none",
    color: margemDetalhadaPorSaca >= 0 ? "#8BFF6A" : "#f87171",
    fontSize: 13
  }}
>
  da saca corresponde ao custo total
</p>

</div>
</div>

<p style={styles.costFinalNote}>
  Valores inseridos manualmente. Compare com o custo de referência do Espírito Santo disponível no painel. Custos não registrados distorcem a margem calculada e podem levar a interpretações equivocadas sobre a rentabilidade da lavoura.
</p>

</section>
    </div>
  );
}

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

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #102117 0%, #18261D 100%)",
    boxShadow: "0 0 0 100vmax #102117",
    color: "#f0ebe0",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    marginBottom: 24,
  },

  brandCard: {
  background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)",
  border: "1px solid #1f342b",
  borderRadius: 16,
  padding: 16,
  marginBottom: 24,
},

brandTitle: {
  color: "#f0ebe0",
  fontSize: 20,
  fontWeight: 700,
  lineHeight: 1,
},

premiumLine: {
  color: "#d6c08d",
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: "0.04em",
  lineHeight: 1.1,
},

updatedText: {
  color: "#f0ebe0",
  fontSize: 14,
  fontWeight: 700,
  marginTop: 6,
},

logo: {
  width: 58,
  height: 58,
  borderRadius: 14,
},

brandRow: {
  display: "flex",
  alignItems: "center",
  gap: 12,
},

logo: {
  width: 68,
  height: 68,
  borderRadius: 12,
},

brandTitle: {
  fontSize: 38,
  fontWeight: 700,
  color: "#f0ebe0",
  lineHeight: 1.1,
},

premiumLine: {
  fontSize: 18,
  fontWeight: 700,
  color: "#c8a96e",
  letterSpacing: "0.12em",
  marginTop: 2,
},

updatedText: {
  fontSize: 12,
  color: "#a7a093",
  marginTop: 4,
},
  kicker: {
    color: "#c8a96e",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    margin: 0,
    lineHeight: 1.25,
  },
  subtitle: {
    color: "#a7a093",
    fontSize: 15,
    lineHeight: 1.5,
  },
  card: {
    background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)",
border: "1px solid rgba(120,160,120,0.14)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  label: {
    color: "#8f8a80",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
  },
  buttons: {
    display: "flex",
    gap: 8,
    marginBottom: 18,
  },
  typeButton: {
    flex: 1,
    border: "none",
    borderRadius: 10,
    padding: "12px 8px",
    fontWeight: 700,
    cursor: "pointer",
  },
  price: {
    color: "#c8a96e",
    fontSize: 46,
    fontWeight: 700,
  },
  cost: {
    fontSize: 28,
  },
  small: {
    color: "#8f8a80",
    fontSize: 13,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  positiveBox: {
    background: "#0b2d18",
    border: "1px solid #166534",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  negativeBox: {
    background: "#2d0a0a",
    border: "1px solid #7f1d1d",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  positiveText: {
    color: "#4ade80",
    fontSize: 34,
  },
  negativeText: {
    color: "#f87171",
    fontSize: 34,
  },
  inlinePositive: {
    color: "#4ade80",
  },
  inlineNegative: {
    color: "#f87171",
  },
  resultText: {
    color: "#c8c0b0",
    fontSize: 14,
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#17231d",
    border: "1px solid #30463b",
    color: "#f0ebe0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    fontSize: 16,
  },
  results: {
    marginTop: 12,
  },
  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    background: "#17231d",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    color: "#d6d0c2",
  },
  compareItem: {
    marginBottom: 14,
  },
  barBase: {
    height: 7,
    background: "#17231d",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },
  barFill: {
    height: "100%",
    borderRadius: 10,
  },
  info: {
    color: "#c8c0b0",
    lineHeight: 1.6,
    fontSize: 14,
  },
  infoMuted: {
    color: "#8f8a80",
    lineHeight: 1.6,
    fontSize: 13,
  },
  graphRow: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
},

graphLabel: {
  width: 60,
  color: "#c8c0b0",
  fontSize: 13,
},

graphTrack: {
  flex: 1,
  height: 10,
  background: "#1b1b1b",
  borderRadius: 999,
  overflow: "hidden",
},

graphBar: {
  height: "100%",
  background: "#d6c08d",
  borderRadius: 999,
},

graphValue: {
  width: 70,
  textAlign: "right",
  color: "#d6c08d",
  fontWeight: 700,
},
lineChartBox: {
  width: "100%",
  marginTop: 12,
  background: "#0b1410",
  borderRadius: 12,
  padding: "12px 8px",
  boxSizing: "border-box",
},

lineChartSvg: {
  width: "100%",
  height: "160px",
  display: "block",
},

  insightGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
  },

  insightBox: {
    background: "#17231d",
    border: "1px solid #30463b",
    borderRadius: 14,
    padding: 14,
  },

  insightTitle: {
    color: "#c8a96e",
    fontWeight: 800,
    fontSize: 15,
    marginTop: 0,
    marginBottom: 14,
  },

  positionValues: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#c8c0b0",
    fontSize: 13,
    marginBottom: 12,
  },

  positionBar: {
    position: "relative",
    height: 8,
    background: "#07110C",
    borderRadius: 999,
    marginBottom: 16,
  },

  positionMarker: {
    position: "absolute",
    top: "50%",
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#c8a96e",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 0 4px rgba(200, 169, 110, 0.18)",
  },

  trendNumbers: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 12,
  },

  costInputWrap: {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 4,
},

costInput: {
  width: 54,
  background: "#1b2d25",
  border: "1px solid #385045",
  borderRadius: 6,
  color: "#f3f0e6",
  fontSize: 14,
  fontWeight: 700,
  textAlign: "right",
  padding: "4px 6px",
  boxSizing: "border-box",
  outline: "none",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
},

costInputSuffix: {
  fontSize: 12,
  color: "#9fb09f",
  fontWeight: 600,
  whiteSpace: "nowrap",
},

    costReferenceBox: {
    marginTop: 16,
  },

  costGroup: {
    background: "rgba(7, 17, 12, 0.22)",
    border: "1px solid rgba(200, 169, 110, 0.12)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  costGroupTitle: {
    color: "#c8a96e",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontSize: 12,
    fontWeight: 800,
    margin: 0,
    marginBottom: 10,
  },

  costLine: {
    display: "grid",
    gridTemplateColumns: "22px 1fr auto",
    alignItems: "center",
    gap: 8,
    padding: "7px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  costIcon: {
    color: "#c8a96e",
    fontWeight: 900,
  },

  costIconHighlight: {
    color: "#facc15",
    fontWeight: 900,
  },

  costLineLabel: {
    color: "#f0ebe0",
    fontSize: 13,
    lineHeight: 1.35,
  },

  costValue: {
    color: "#d6d0c2",
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  costValueHighlight: {
    color: "#c8a96e",
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  costSubtotal: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid rgba(200, 169, 110, 0.18)",
    color: "#a7a093",
    fontSize: 12,
    fontWeight: 700,
  },

  costTotalBox: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(200, 169, 110, 0.12)",
  border: "1px solid rgba(200, 169, 110, 0.28)",
  borderRadius: 12,
  padding: "12px",
  color: "#f0ebe0",
  fontSize: 13,
  fontWeight: 800,
},

costFinalNote: {
  marginTop: 18,
  paddingTop: 12,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  color: "#8f9a8f",
  fontSize: 12,
  lineHeight: 1.55,
  fontStyle: "italic",
},

};