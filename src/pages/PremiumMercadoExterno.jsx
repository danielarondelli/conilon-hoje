import React, { useEffect, useMemo, useState } from "react";

import logoConilon from "../assets/logo-conilon.jpg.jpeg";
import seuConilon from "../assets/mascotes/seu_conilon_sem_fundo.png";
import PremiumNoticias from "./premium/PremiumNoticias";



import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub?gid=863354306&single=true&output=csv&t=" +
  Date.now();

const SPREAD_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub?gid=482645901&single=true&output=csv&t=" +
  Date.now();

const FALLBACK = {
  data: "Atualizando...",
  contrato: "julho/2026",
  cccv: 930,
  ice_convertido: 1258,
  spread: -193,
  ice: 4064,
  dolar: 5.16,
};

const historicoSpread = [
  { data: "27/mai", spread: -22 },
  { data: "03/jun", spread: 88 },
  { data: "10/jun", spread: 139 },
  { data: "16/jun", spread: 147 },
  { data: "Hoje", spread: 147 },
];

function numero(valor, fallback = 0) {
  if (valor == null || valor === "") return fallback;

  const limpo = String(valor)
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const n = Number(limpo);

  return Number.isFinite(n) ? n : fallback;
}

function formatBRL(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatNumero(valor) {
  return valor.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });
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

// IMPORTANTE:
//
// No mercado de Conilon do Norte/Noroeste do ES,
// o spread calculado pela paridade ICE × dólar é
// estruturalmente negativo na maior parte do tempo.
//
// Por isso, "Mercado físico abaixo da referência"
// representa um comportamento esperado do mercado,
// utilizando a cor laranja (atenção) e não vermelho.
//
// O vermelho deve ser reservado para situações
// excepcionalmente distantes do padrão histórico.

function interpretarSpread(spread) {
  if (spread >= 120) {
    return {
      status: "Mercado físico muito acima da referência",
      cor: "#22c55e",
      emoji: "🟢",
      texto:
        "O mercado físico está acima do equivalente bruto do ICE convertido. Esse prêmio indica forte sustentação da praça local frente à referência internacional, podendo refletir disputa por mercadoria, menor disponibilidade ou demanda doméstica/exportadora mais ativa.",
      cafe:
        "Para quem possui café, o sinal é positivo: o físico está negociando acima da referência externa convertida de forma simples. O ponto principal é acompanhar se esse prêmio se mantém, aumenta ou começa a perder força nos próximos dias.",
    };
  }

  if (spread >= 40) {
    return {
      status: "Mercado físico acima da referência",
      cor: "#86efac",
      emoji: "🟢",
      texto:
        "O mercado físico está acima do equivalente bruto do ICE convertido, mas com prêmio mais moderado. Esse diferencial sugere sustentação local, embora sem indicar excesso de força frente à referência internacional.",
      cafe:
        "Para quem possui café, o cenário ainda é favorável. O físico mostra boa sustentação frente ao externo, mas a leitura deve acompanhar a direção do diferencial: prêmio aumentando reforça o físico; prêmio diminuindo pede mais atenção.",
    };
  }

  if (spread >= -40) {
    return {
      status: "Mercado físico próximo da referência",
      cor: "#facc15",
      emoji: "🟡",
      texto:
        "O mercado físico está próximo do equivalente bruto do ICE convertido. Nessa faixa, a praça local e a referência internacional caminham com pouca diferença na conversão simples, sem prêmio ou desconto expressivo.",
      cafe:
        "Para quem possui café, o sinal é de equilíbrio. O mais importante é observar para qual lado o diferencial vai se deslocar: acima da paridade indica ganho relativo do físico; abaixo dela indica aumento do desconto frente ao externo.",
    };
  }

  return {
    status: "Mercado físico abaixo da referência internacional",
    cor: "#f59e0b",
    emoji: "🔴",
    texto:
      "O mercado físico está abaixo do equivalente bruto do ICE convertido. Esse desconto é comum na comparação entre bolsa internacional e preço físico local, pois a referência externa ainda precisa ser ajustada por base, logística, qualidade, custos de exportação e condições de negociação na praça doméstica.",
    cafe:
      "Para quem possui café, o ponto principal não é apenas o spread estar negativo, mas se esse desconto está aumentando ou diminuindo. Desconto menor indica melhora relativa do físico frente ao externo; desconto maior sugere perda de força da praça local em relação à referência internacional.",
  };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const val = payload[0].value;
  const color = val >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div
      style={{
        background: "#0f2318",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: "10px",
        padding: "8px 12px",
        fontSize: "12px",
        color: "#F7F3E8",
      }}
    >
      <p style={{ color: "rgba(247,243,232,0.6)", margin: "0 0 4px" }}>
        {label}
      </p>

      <p style={{ color, fontWeight: 800, margin: 0 }}>
        {val >= 0 ? "+" : ""}
        {formatBRL(val)}/sc
      </p>
    </div>
  );
}

export default function PremiumMercadoExterno() {
  const [dados, setDados] = useState(FALLBACK);

  const [historicoReal, setHistoricoReal] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const resposta = await fetch(CSV_URL);
        const texto = await resposta.text();
        
        const linhas = texto.trim().split(/\r?\n/);
const cabecalho = linhas[0].split(",").map((coluna) => coluna.trim());

const hojeBR = new Date().toLocaleDateString("pt-BR");
const linhaPrincipal =
  linhas.find((linha) => linha.startsWith(hojeBR)) ||
  linhas.find((linha) => linha.includes(",1030,") || linha.includes(",1015,")) ||
  linhas[1];

const valores = linhaPrincipal.split(",");

        const dadosCSV = {};


        cabecalho.forEach((coluna, index) => {
          dadosCSV[coluna.trim()] = valores[index]?.trim();
        });

        setDados((dadosAtuais) => ({
          ...dadosAtuais,
          data: dadosCSV.data || dadosCSV.Data || FALLBACK.data,
          contrato: dadosCSV.contrato || dadosCSV.Contrato || FALLBACK.contrato,
          cccv: Number(
  String(dadosCSV.cccv || dadosCSV.CCCV || FALLBACK.cccv)
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim()
),


          ice: numero(
  dadosCSV.ice_robusta ||
    dadosCSV.robusta ||
    dadosCSV.ice ||
    dadosCSV.ICE ||
    dadosCSV["ICE Robusta"],
  FALLBACK.ice
),
        }));
      } catch (error) {
        setDados(FALLBACK);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL")
      .then((res) => res.json())
      .then((data) => {
        setDados((dadosAtuais) => ({
          ...dadosAtuais,
          dolar: Number(data.USDBRL.bid),
        }));
      })
      .catch(() => {
        setDados((dadosAtuais) => ({
          ...dadosAtuais,
          dolar: FALLBACK.dolar,
        }));
      });
  }, []);

  useEffect(() => {
  async function carregarHistoricoSpread() {
    try {
      const resposta = await fetch(SPREAD_CSV_URL);
      const texto = await resposta.text();

     

      const linhas = texto.trim().split("\n");
      const cabecalho = linhas[0].split(",").map((coluna) => coluna.trim());

      const indice = (nome) => cabecalho.indexOf(nome);

      const dataIndex = indice("data");
      const spreadIndex = indice("spread");

      const historico = linhas
        .slice(1)
        .map((linha) => {
          const valoresHistorico = linha.split(",");

          const dataOriginal = valoresHistorico[dataIndex]?.trim();
          const spreadValor = numero(valoresHistorico[spreadIndex], null);

          return {
            data: dataOriginal,
            spread: spreadValor,
          };
        })
        .filter((item) => item.data && Number.isFinite(item.spread))
        .slice(-7)
        .map((item) => ({
  data: item.data.slice(0, 5),
  spread: Math.round(item.spread),
}));

      setHistoricoReal(historico);
    } catch (error) {
      setHistoricoReal([]);
    }
  }

  carregarHistoricoSpread();
}, []);

  const iceConvertido = useMemo(() => {
    return (dados.ice * dados.dolar * 60) / 1000;
  }, [dados.ice, dados.dolar]);

  const spread = useMemo(() => {
    return dados.cccv - iceConvertido;
  }, [dados.cccv, iceConvertido]);

  const leitura = interpretarSpread(spread);

  const historicoAtualizado = useMemo(() => {
  const historicoBase =
    historicoReal.length >= 7 ? historicoReal : historicoSpread;

  return historicoBase
    .map((item, index) =>
      index === historicoBase.length - 1
        ? { ...item, spread: Math.round(spread) }
        : item
    )
    .slice(-7);
}, [historicoReal, historicoSpread, spread]);

  const dadosGrafico = useMemo(() => {
  return historicoAtualizado.map((item) => ({
    date: item.data,
    value: item.spread,
  }));
}, [historicoAtualizado]);

  const spreads = historicoAtualizado.map((item) => item.spread);
  const minimo = Math.min(...spreads, -80);
  const maximo = Math.max(...spreads, 180);

  const posicao =
    maximo === minimo ? 50 : ((spread - minimo) / (maximo - minimo)) * 100;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={{ marginBottom: 24 }}>
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
          Atualizado: {dados.data || "—"}
        </div>
      </div>
    </div>
  </div>
</header>
        <section style={styles.moduleTitle}>
          <div style={styles.icon}>🌎</div>

          <div>
            <h1 style={styles.h1}>Mercado Externo</h1>
            <p style={styles.subtitle}>Spread Brasil × ICE Robusta</p>
          </div>
        </section>

        <section style={styles.gridTop}>
          <div style={styles.cardSmall}>
            <p style={styles.label}>Mercado físico ES</p>
            <h2 style={styles.price}>{formatBRL(dados.cccv)}/sc</h2>
            <p style={styles.muted}>CCCV Vitória</p>
          </div>

          <div style={styles.cardSmall}>
            <p style={styles.label}>ICE Robusta convertido</p>
            <h2 style={styles.price}>{formatBRL(iceConvertido)}/sc</h2>
            <p style={styles.muted}>
              ICE {formatNumero(dados.ice)} × dólar {dados.dolar.toFixed(2)}
            </p>
          </div>
                </section>

        
    <section style={styles.mainCard}>
      <p style={styles.label}>Preço local vs ICE convertido</p>
      <h2 style={{ ...styles.spread, color: leitura.cor }}>
        {spread >= 0 ? "+" : ""}
        {formatBRL(spread)}/sc
      </h2>

      <div style={{ ...styles.badge, borderColor: leitura.cor }}>
        <GraoVies cor={leitura.cor} />
        <span style={{ color: leitura.cor }}>{leitura.status}</span>
      </div>

      <p style={styles.text}>{leitura.texto}</p>
    </section>

    <section style={styles.card}>
      <h3 style={styles.h3}>Onde o spread está hoje?</h3>

      <div style={styles.rangeLabels}>
        <span>Desconto máximo</span>
        <span>Prêmio máximo</span>
      </div>

      <div style={styles.rangeBar}>
        <div style={{ ...styles.rangeDot, left: `${posicao}%` }} />
      </div>

      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "6px 13px",
            borderRadius: "999px",
            border: `1px solid ${leitura.cor}`,
            color: leitura.cor,
            fontSize: "12px",
            fontWeight: 800,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <GraoVies cor={leitura.cor} />
          {leitura.status}
        </span>
      </div>

      <p style={styles.textCenter}>
        {Math.round(posicao) <= 15
  ? "Hoje a diferença entre o mercado físico e a referência internacional está entre as maiores dos últimos registros."
  : Math.round(posicao) >= 85
  ? "Hoje a diferença entre o mercado físico e a referência internacional está entre as menores dos últimos registros."
  : "Hoje a diferença entre o mercado físico e a referência internacional está dentro do comportamento recente."}
      </p>
    </section>
  

  <div style={styles.pager}>
  <div style={styles.pagerPage}>
    <section style={styles.card}>
      <h3 style={styles.h3}>Evolução recente do spread</h3>

      <div style={{ width: "100%", height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dadosGrafico}
            margin={{ top: 8, right: 8, left: -12, bottom: 12 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(247,243,232,0.56)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />

            <YAxis hide />

            <ReferenceLine
              y={0}
              stroke="rgba(247,243,232,0.22)"
              strokeDasharray="3 3"
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />

            <Bar dataKey="value" radius={[8, 8, 2, 2]} maxBarSize={34}>
              {dadosGrafico.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? "#22c55e" : "#ef4444"}
                  opacity={entry.date === "Hoje" ? 1 : 0.68}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  </div>

  <div style={styles.pagerPage}>
    <section style={styles.card}>
      <h3 style={styles.h3}>Histórico recente</h3>

      <div style={styles.table}>
        {historicoAtualizado
          .slice()
          .reverse()
          .map((item) => (
            <div key={item.data} style={styles.row}>
              <span>{item.data}</span>

              <strong
                style={{
                  color: item.spread >= 0 ? "#22c55e" : "#ef4444",
                }}
              >
                {item.spread >= 0 ? "+" : ""}
                {formatBRL(item.spread)}/sc
              </strong>
            </div>
          ))}
      </div>
    </section>
  </div>

  <div style={styles.pagerPage}>
    <section style={styles.finalCard}>
      <h3
        style={{
          ...styles.finalTitle,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <img
          src={seuConilon}
          alt="Seu Conilon"
          style={{
            width: "38px",
            height: "38px",
            marginTop: "-4px",
            flexShrink: 0,
          }}
        />

        <span>E o que isso significa para o meu café?</span>
      </h3>

      <p style={styles.finalText}>{leitura.cafe}</p>
    </section>
  </div>
</div>
          
        <section
  style={{
    padding: "10px 4px 0",
    marginTop: "2px",
  }}
>
  <p
    style={{
      margin: 0,
      color: "rgba(247,243,232,0.42)",
      fontSize: "10px",
      lineHeight: 1.55,
    }}
  >
    * Spread = preço físico CCCV Vitória − ICE Robusta convertido em R$/sc.
    Conversão: ICE Robusta em USD/t × dólar × 0,06.
    <br />
    * O preço CCCV pode refletir o último valor disponível até a atualização da praça, geralmente após 17h.
  </p>
</section>
        </div>
      </div>

      



        
      
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
  "linear-gradient(180deg, #1B2B22 0%, #162019 100%)",
    color: "#F7F3E8",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    padding: "20px 14px 40px",
  },

  container: {
    maxWidth: "460px",
    margin: "0 auto",
  },

  header: {
    background: "linear-gradient(180deg, rgba(27,43,34,0.92), rgba(22,32,25,0.92))",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "22px",
    padding: "16px",
    marginBottom: "18px",
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#D6A84F",
    color: "#10251E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "24px",
  },

  brand: {
    fontSize: "19px",
    fontWeight: "800",
    lineHeight: 1,
  },

  premium: {
    fontSize: "13px",
    color: "#D6A84F",
    marginTop: "3px",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },

  updated: {
    fontSize: "12px",
    color: "rgba(247,243,232,0.72)",
  },

  moduleTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },

  icon: {
    fontSize: "34px",
  },

  h1: {
    margin: 0,
    fontSize: "26px",
    lineHeight: 1.1,
  },

  subtitle: {
    margin: "4px 0 0",
    color: "rgba(247,243,232,0.75)",
    fontSize: "14px",
  },

  gridTop: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },

  cardSmall: {
    background: "linear-gradient(180deg, rgba(27,43,34,0.88), rgba(22,32,25,0.88))",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "20px",
    padding: "14px",
  },

  label: {
    margin: 0,
    fontSize: "12px",
    color: "rgba(247,243,232,0.68)",
  },

  price: {
    margin: "8px 0 4px",
    fontSize: "22px",
    lineHeight: 1.05,
  },

  muted: {
    margin: 0,
    fontSize: "11px",
    color: "rgba(247,243,232,0.58)",
  },

  mainCard: {
    background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)",
    border: "1px solid rgba(214,168,79,0.35)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
    borderRadius: "26px",
    padding: "22px",
    marginBottom: "12px",
    textAlign: "center",
  },

  spread: {
    fontSize: "44px",
    lineHeight: 1,
    margin: "10px 0 12px",
    letterSpacing: "-1px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "14px",
  },

  text: {
    margin: 0,
    color: "rgba(247,243,232,0.78)",
    fontSize: "14px",
    lineHeight: 1.45,
  },

  card: {
    background: "linear-gradient(180deg, rgba(27,43,34,0.88), rgba(22,32,25,0.88))",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "22px",
    padding: "18px",
    marginBottom: "12px",
  },

  h3: {
    margin: "0 0 14px",
    fontSize: "17px",
  },

  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "rgba(247,243,232,0.58)",
    marginBottom: "10px",
  },

  rangeBar: {
    height: "10px",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #ef4444 0%, #eab308 45%, #22c55e 100%)",
    position: "relative",
    marginBottom: "14px",
  },

  rangeDot: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#F7F3E8",
    border: "4px solid #D6A84F",
    boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
  },

  textCenter: {
    margin: 0,
    textAlign: "center",
    color: "rgba(247,243,232,0.76)",
    fontSize: "13px",
  },

  chart: {
    height: "130px",
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: "10px",
    paddingTop: "8px",
  },

  chartColumn: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "end",
    alignItems: "center",
    gap: "7px",
  },

  chartBar: {
    width: "100%",
    maxWidth: "28px",
    borderRadius: "999px 999px 4px 4px",
    minHeight: "8px",
  },

  chartLabel: {
    fontSize: "10px",
    color: "rgba(247,243,232,0.56)",
  },

  table: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    paddingBottom: "9px",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
  },

  finalCard: {
    background:
      "linear-gradient(180deg, rgba(214,168,79,0.18), rgba(255,255,255,0.07))",
    border: "1px solid rgba(214,168,79,0.35)",
    borderRadius: "24px",
    padding: "20px",
    marginTop: "4px",
  },

  finalTitle: {
    margin: "0 0 10px",
    fontSize: "18px",
  },

  finalText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.5,
    color: "rgba(247,243,232,0.82)",
  },

pager: {
  display: "flex",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  gap: "16px",
  marginTop: "16px",
  paddingBottom: "10px",
},

pagerPage: {
  minWidth: "100%",
  scrollSnapAlign: "start",
},

pagerHint: {
  display: "none",
},

};