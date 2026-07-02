import React, { useState } from "react";

const PRECO_COOABRIEL = {
  tipo7: 920,
  tipo78: 900,
  tipo8: 875,
};

const CUSTO_REFERENCIA_ES = 680;

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

export default function PremiumCooabriel() {
  const [tipo, setTipo] = useState("tipo7");
  const [custoUsuario, setCustoUsuario] = useState("");
  const [sacas, setSacas] = useState("");

  const preco = PRECO_COOABRIEL[tipo];
  const custo = custoUsuario ? Number(custoUsuario) : CUSTO_REFERENCIA_ES;
  const quantidade = sacas ? Number(sacas) : 0;

  const margemPorSaca = preco - custo;
  const receitaBruta = preco * quantidade;
  const custoTotal = custo * quantidade;
  const margemTotal = receitaBruta - custoTotal;

  const margemPositiva = margemPorSaca >= 0;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <p style={styles.kicker}>Conilon Hoje Premium</p>
        <h1 style={styles.title}>Cooabriel — Esse preço paga minha safra?</h1>
        <p style={styles.subtitle}>
          Compare o preço Cooabriel do dia com o custo da sua saca e veja a margem estimada.
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
          <span style={styles.small}>por saca · fonte a confirmar</span>
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
        <p style={styles.label}>O que isso significa para o meu café?</p>

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
        <p style={styles.label}>Comparativo de margem por tipo</p>

        {Object.entries(PRECO_COOABRIEL).map(([key, precoTipo]) => {
          const margemTipo = precoTipo - custo;
          const positiva = margemTipo >= 0;

          return (
            <div key={key} style={styles.compareItem}>
              <div style={styles.row}>
                <span>{TIPOS[key]}</span>
                <strong style={positiva ? styles.inlinePositive : styles.inlineNegative}>
                  {positiva ? "+" : ""}
                  {fmt(margemTipo)}
                </strong>
              </div>

              <div style={styles.barBase}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${Math.min(Math.max((margemTipo / precoTipo) * 100, 0), 100)}%`,
                    background: positiva ? "#4ade80" : "#f87171",
                  }}
                />
              </div>
            </div>
          );
        })}
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
        color: "#7ee787",
        fontSize: "34px",
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      +33%
    </div>

    <div
      style={{
        color: "#c8c0b0",
        fontSize: "13px",
        marginTop: "6px",
      }}
    >
      Margem em expansão
    </div>
  </div>

  <svg width="320" height="90" viewBox="0 0 320 90">
    <polyline
      fill="none"
      stroke="#d6c08d"
      strokeWidth="3"
      points="20,60 110,25 200,45 290,10"
    />

    <circle cx="20" cy="60" r="5" fill="#d6c08d" />
    <circle cx="110" cy="25" r="5" fill="#d6c08d" />
    <circle cx="200" cy="45" r="5" fill="#d6c08d" />
    <circle cx="290" cy="10" r="5" fill="#d6c08d" />

    <text x="20" y="80" textAnchor="middle" fill="#c8c0b0">01/06</text>
    <text x="110" y="80" textAnchor="middle" fill="#c8c0b0">05/06</text>
    <text x="200" y="80" textAnchor="middle" fill="#c8c0b0">10/06</text>
    <text x="290" y="80" textAnchor="middle" fill="#c8c0b0">15/06</text>
  </svg>
</div>

<p style={styles.infoMuted}>
  A margem simulada evoluiu de R$ 180 para R$ 240 por saca no período analisado,
  representando crescimento aproximado de 33%.
</p>

<p
  style={{
    color: "#7ee787",
    fontWeight: 700,
    marginTop: "10px",
  }}
>
  ● Tendência positiva de rentabilidade.
</p>
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
        <p style={styles.label}>O que entra no custo da saca?</p>

        <p style={styles.info}>
          Fertilizantes, corretivos, defensivos, mão de obra, colheita, secagem,
          beneficiamento, frete, máquinas, combustível, manutenção e custos administrativos.
        </p>

        <p style={styles.infoMuted}>
          O custo de referência é apenas um parâmetro. Cada propriedade pode ter uma estrutura
          de custo diferente.
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

const styles = {
  page: {
    minHeight: "100vh",
    background: "#07110C",
    color: "#f0ebe0",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    marginBottom: 24,
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
    background: "#101915",
    border: "1px solid #1f342b",
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
    fontWeight: 800,
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
};