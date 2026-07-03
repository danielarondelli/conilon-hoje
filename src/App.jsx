import React from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";

import logoConilon from "./assets/logo-conilon.jpg.jpeg"; 



const noticias = [
  { categoria: "Geopolítica", texto: "Tensão no Estreito de Ormuz pressiona fertilizantes", cor: "#b84a4a" },
  { categoria: "Clima", texto: "Frente fria avança no Sudeste com previsão de chuva", cor: "#3a78b8" },
  { categoria: "Mercado", texto: "Exportações brasileiras desaceleram em abril", cor: "#2f7d50" },
  { categoria: "Safra", texto: "Produtores seguram vendas aguardando preços melhores", cor: "#b8892f" },
];

export default function App() {
  
  const [dolar, setDolar] = React.useState(null);
  const [sacas, setSacas] = React.useState("");
  const [precoVenda, setPrecoVenda] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("7");
  const totalVenda =
  (Number(sacas) || 0) * (Number(precoVenda) || 0);
  const [clima, setClima] = React.useState([]);
  const [statusClima, setStatusClima] = React.useState("Buscando clima da sua região...");
const [planilha,setPlanilha] = React.useState([])
const [historico, setHistorico] = React.useState([])
const [noticiasDinamicas, setNoticiasDinamicas] = React.useState(noticias);


 const dados = planilha[0] || {};
 const precoAtual = Number(dados.cooabriel || 0);

const precoAnoAnterior = Number(dados.robusta_cccv_ano_anterior || 0);

console.log("COOABRIEL ATUAL:", dados.cooabriel);
console.log("COOABRIEL ANO ANTERIOR:", dados.cooabriel_ano_anterior);
console.log(dados);

  const precosPorTipo = {
  "7": Number(dados.cooabriel || 0),
  "7/8": parseFloat(dados.cooabriel_tipo_78?.replace("R$","").replace(".","").replace(",",".").trim() || 0),

"8": parseFloat(dados.cooabriel_tipo_8?.replace("R$","").replace(".","").replace(",",".").trim() || 0),
    
};

const precoSimulador = precosPorTipo[selectedType] ?? precoAtual;
  

const precoAnterior = Number(
  historico[historico.length - 2]?.preco || precoAtual
);

const variacao =
  precoAnterior > 0
    ? ((precoAtual - precoAnterior) / precoAnterior) * 100
    : 0;
 console.log("DADOS AGORA:", dados);
console.log("LEITURA NO OBJETO:", dados.leitura_mercado);
const leituraMercado =
  dados.leitura_mercado ||
  "Leitura de mercado em atualização.";

console.log("ANO ANTERIOR 1:", dados.robusta_cccv_ano_anterior);

const qtdPlanilha = planilha.length;



const linhaAtual = planilha.length > 0 ? planilha[planilha.length - 1] : null;
const testePlanilha = linhaAtual ? linhaAtual.data : "carregando planilha";

  

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,precipitation_sum&timezone=auto&forecast_days=7`
        )
          .then((res) => res.json())
          .then((data) => {
            const previsao = data.daily.time.map((dia, index) => ({
              dia,
              temperatura: data.daily.temperature_2m_max[index],
              chuva: data.daily.precipitation_sum[index],
            }));

            setClima(previsao);
            setStatusClima("CLIMA");
          });
      },
      () => setStatusClima("Não foi possível acessar sua localização.")
    );
  }, []);

  React.useEffect(() => {
  fetch(
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub?gid=863354306&single=true&output=csv&t=" +
    Date.now()
)
.then((res) => res.text())
.then((text) => {

      const parseCSV = (text) => {
        const rows = [];
        let row = [];
        let cell = "";
        let insideQuotes = false;

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];

          if (char === '"' && insideQuotes && nextChar === '"') {
            cell += '"';
            i++;
          } else if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === "," && !insideQuotes) {
            row.push(cell.trim());
            cell = "";
          } else if ((char === "\n" || char === "\r") && !insideQuotes) {
            if (cell || row.length) {
              row.push(cell.trim());
              rows.push(row);
              row = [];
              cell = "";
            }
          } else {
            cell += char;
          }
        }

        if (cell || row.length) {
          row.push(cell.trim());
          rows.push(row);
        }

        return rows;
      };

      const rows = parseCSV(text);
      const headers = rows[0].map((h) => h.trim());

      const idx = (nome) => headers.indexOf(nome);

      const tabela = rows.slice(1).map((col) => ({
        data: col[idx("data")],
        status: col[idx("status")],
        cooabriel: col[idx("cooabriel")],
        cooabriel_tipo_78: col[idx("cooabriel_tipo_78")],
        cooabriel_tipo_8: col[idx("cooabriel_tipo_8")],
        cccv: col[idx("cccv")],
        robusta: col[idx("ice_robusta")],
        noticia1: col[idx("noticia1")],
        noticia2: col[idx("noticia2")],
        noticia3: col[idx("noticia3")],
        noticia4: col[idx("noticia4")],
        robusta_cccv_ano_anterior: col[idx("robusta_cccv_ano_anterior")],
        arabica_cccv: col[idx("arabica_cccv")],
        leitura_mercado: col[idx("leitura_mercado")],
        data_grafico_cooabriel: col[idx("data_grafico_cooabriel")],
valor_grafico_cooabriel: col[idx("valor_grafico_cooabriel")],
      }));

     const dadosHistorico = tabela
  .filter((item) => item.data_grafico_cooabriel && item.valor_grafico_cooabriel)
  .map((item) => ({
    dia: item.data_grafico_cooabriel.slice(0, 5),
    preco: Number(
      String(item.valor_grafico_cooabriel)
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ),
  }))
  .filter((item) => !isNaN(item.preco));
const noticiasTabela = [
  { cor: "#6BCB77", texto: tabela[0]?.noticia1 || "" },
  { cor: "#6BCB77", texto: tabela[0]?.noticia2 || "" },
  { cor: "#FF6B6B", texto: tabela[0]?.noticia3 || "" },
  { cor: "#777", texto: tabela[0]?.noticia4 || "" },
].filter((item) => item.texto);

setPlanilha(tabela);
setHistorico(dadosHistorico);
setNoticiasDinamicas(noticiasTabela);
    });
}, []);

React.useEffect(() => {
  fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL")
    .then((res) => res.json())
    .then((data) => {
      setDolar(data.USDBRL.bid);
    })
    .catch((erro) => {
      console.error("Erro ao buscar dólar:", erro);
    });
}, []);

const ultimo = planilha[planilha.length - 1] || {}
const precoCooabriel = Number(ultimo.cooabriel || 0)
const precoCCCV = Number(ultimo.cccv || 0)
const precoRobusta = Number(ultimo.robusta || 0)



  const valorVenda = Number(sacas || 0) * dados.cooabriel;
  const diferencaAno = dados.cooabriel - dados.robusta_cccv_ano_anterior;
  const percentualAno = (diferencaAno / dados.robusta_cccv_ano_anterior) * 100;
console.log("DADOS USADOS NO CARD:", dados);
const climaVisivel = clima
  .filter((dia) => new Date(dia.dia) >= new Date(new Date().setHours(0,0,0,0)))
  .slice(0, 5);

const chuvaTotal = climaVisivel.reduce(
  (total, dia) => total + Number(dia.chuva || 0),
  0
);

const diasComChuva = climaVisivel.filter(
  (dia) => Number(dia.chuva || 0) > 0
).length;

const resumoClima =
  chuvaTotal >= 10
    ? "Chuva mais presente nos próximos dias."
    : diasComChuva >= 3
    ? "Chuva fraca e frequente na região."
    : "Janela mais seca, com pouca chuva prevista.";

const meses = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

const hoje = new Date();
const mesComparativo = meses[hoje.getMonth()];
const anoAtual = hoje.getFullYear();
const anoAnterior = anoAtual - 1;

  return (
    <div style={styles.page}>
      
      <header style={styles.header}>
        <div style={styles.headerTop}>
  <img
    src={logoConilon}
    alt="Logo Conilon Hoje"
    style={styles.logo}
  />

  <h1 style={styles.title}>Conilon Hoje</h1>
</div>

<small
  style={{
    color: "#B7C2B0",
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    display: "block",
    marginTop: 6,
  }}
>
  Atualizado: {new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</small>
      </header>

     <h2 style={styles.sectionTitle}>Preço de Referência</h2>

<section style={styles.grid}>
 
 <div style={{ ...styles.card, justifyContent: "flex-start", gridColumn: "1 / span 2", minHeight: 170, position: "relative", overflow: "hidden" }}>
  <div style={{
  position: "absolute",
  left: 12,
  right: 12,
  top: 120,
  height: 65,
  opacity: 1,
  zIndex: 1,
  
}}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={historico.slice(-7)} margin={{ top: 8, right: 0, left: 0, bottom: 8 }}>
  <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
  <XAxis dataKey="dia" tick={{ fill: "#9AA89D", fontSize: 10 }} axisLine={false} tickLine={false} padding={{ left: 12, right: 12 }}/>
  <Tooltip />

      
      <Line
        type="monotone"
        dataKey="preco"
        stroke="#57C878"
        strokeWidth={2}
        dot={{ r: 3, fill: "#57C878" }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
  <p style={{ margin: 0, color: "#A8B3A2", fontSize: 12,
position: "relative",
zIndex: 2 }}>


    Cooabriel • São Gabriel da Palha
  </p>

  <h1
    style={{
      margin: "4px 0 0 0",
      color: "#F3EFE8",
      fontSize: 44,
      fontWeight: "800",
      letterSpacing: -2,
      position: "relative",
zIndex: 2,
    }}
  >
    <>
  {dados.cooabriel}
  <span style={{
    fontSize: 22,
    fontWeight: "500",
    marginLeft: 8,
    opacity: 0.75
  }}>
    R$/saca
  </span>
  <div
  style={{
    marginTop: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 9px",
    borderRadius: 20,
    background:
      variacao >= 0
        ? "rgba(79,209,117,0.08)"
        : "rgba(255,90,90,0.08)",
    color:
      variacao >= 0
        ? "#69db7c"
        : "#ff6b6b",
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 0.3,
    position: "absolute",
right: 24,
top: 14,
  }}
>
  {variacao >= 0 ? "▲" : "▼"}
  {Math.abs(variacao).toFixed(1).replace(".", ",")}%
  <div style={{
  fontSize: 10,
  opacity: 0.65,
  marginTop: 2
}}>
  vs dia anterior
</div>
</div>
</>
  </h1>


<small
  style={{
    color: "#8A8A80",
    fontSize: 11,
    letterSpacing: 0.2,
    lineHeight: 1.5,
    position: "relative",
    zIndex: 2,
  }}
>
  Referência diária atualizada após 10h
</small>


  
</div>

 <Card
  titulo="CCCV • Vitória • Mercado exportador"
  valor={
    <>
    <div
  style={{
    position: "absolute",
    right: 18,
    top: 14,
    background:
      parseFloat(dados.cccv) >= parseFloat(dados.cccvAnterior || 0)
        ? "rgba(120,255,160,0.12)"
        : "rgba(255,120,120,0.12)",
    color:
      parseFloat(dados.cccv) >= parseFloat(dados.cccvAnterior || 0)
        ? "#B8FFB0"
        : "#FF9B9B",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700
  }}
>
  {parseFloat(dados.cccv) >= parseFloat(dados.cccvAnterior || 0)
    ? "▲"
    : "▼"}{" "}
  {dados.cccvAnterior
    ? Math.abs(
        ((parseFloat(dados.cccv) -
          parseFloat(dados.cccvAnterior)) /
          parseFloat(dados.cccvAnterior)) *
          100
      )
        .toFixed(1)
        .replace(".", ",")
    : "--"}
  %
</div>
      {dados.cccv}
      <span
        style={{
          fontSize: 16,
          fontWeight: "500",
          marginLeft: 6,
          opacity: 0.75,
        }}
      >
        R$/saca
      </span>
      
    </>
  }
  corFundo="#0F1A14"
  cor="#8D948D"
  tamanhoValor={34}
  estiloExtra={{
  gridColumn: "1 / span 2",
  height: 70,
  minHeight: 70,
  padding: "18px 24px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}}
  subtitulo={
   <>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 6,
      fontSize: 13,
      color: "#9a9a9a",
    }}
  >
    
    <span
      style={{
        fontSize: 11,
        opacity: 0.8,
      }}
    >
      Referência diária atualizada após 17h
    </span>
  </div>
</>
  }
/>
</section>

      <h2 style={styles.sectionTitle}>Mercado</h2>
      <section style={styles.grid}>
        <Card titulo="CCCV Arábica" tamanhoValor="26px" valor={`R$ ${Number(dados.arabica_cccv).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} subtitulo="Referência diária atualizada após 17h" cor="#8B6B4A" />
        <Card titulo="Dólar" valor={dolar ? `R$ ${Number(dolar).toFixed(2)}` : "Carregando..."} cor="#F3EFE8" subtitulo="Câmbio comercial • USD/BRL" />
       <Card
  titulo="ICE Robusta"
  valor={`US$ ${dados.robusta}/t`}
  cor="#8D948D"
  subtitulo="Bolsa de Londres • Robusta"
  altura="220px"
/>
      

     <section style={{ ...styles.card, minHeight: 220, padding: 12, gridColumn: "1 / span 2" }}>
       <h3 style={{ marginTop: 0, marginBottom: 6, color: "#AEB4AE", display: "flex", alignItems: "center", gap: 8 }}>
  Simulador <span style={{ fontSize: 24 }}>🧮</span>
</h3>

<p
  style={{
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 6,
    marginTop: 2
  }}
>
  Escolha o tipo do seu café ⬇
</p>

<select
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
  style={{
    width: "100%",
    padding: "6px 10px",
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    appearance: "none",
  }}
>
  <option value="7" style={{ background: "#1a1a1a" }}>Tipo 7</option>
  <option value="7/8" style={{ background: "#1a1a1a" }}>Tipo 7/8</option>
  <option value="8" style={{ background: "#1a1a1a" }}>Tipo 8</option>
</select> 
        
        
        <input
  type="number"
  placeholder="Sacas"
  value={sacas}
  onChange={(e) => setSacas(e.target.value)}
  style={{
    width: "100%",
    padding: "6px 10px",
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box"
  }}
/>

<input
 type="text"
placeholder="Valor estimado"
value={
  `R$ ${(Number(sacas || 1) * precoSimulador).toLocaleString("pt-BR")}`
}
readOnly
  style={{
    width: "100%",
    padding: "6px 10px",
    marginBottom: 4,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box"
  }}
/>

<h3 style={{
marginTop: 12,
marginBottom: 6,
fontSize: 18,
color: "#6EE787"
}}>

<p
  style={{
    marginTop: 10,
    marginBottom: 0,
    fontSize: 13,
    color: "#B7C2B0",
    lineHeight: 1.4
  }}
>
  
</p>

<div
  style={{
    fontSize: 24,
    fontWeight: 700,
    color: "#6EE787",
    marginTop: 4
  }}
>
  
</div>
</h3>

<small style={{
color: "#8B949E",
fontSize: 11
}}>

</small>
        <small style={{
  display: "block",
  marginTop: 4,
  fontSize: 11,
  lineHeight: 1.3,
  color: "#8FA89A",
  wordBreak: "break-word"
}}>
  
</small>
        </section>
        
          

      <section style={{ ...styles.box, width: "100%", gridColumn: "1 / -1", boxSizing: "border-box", marginRight: 0 }}>
  <p style={styles.sectionTitle}>Comparativo Anual</p>

  <div
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: 24,
      padding: 18,
      marginTop: 10,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      <div
        style={{
          color: "#CFCFCF",
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        {`CONILON • ${mesComparativo} ${anoAtual} VS. ${mesComparativo} ${anoAnterior}`}
      </div>

      <div
        style={{
          background: "rgba(255,80,80,0.12)",
          color: "#FF7B7B",
          padding: "8px 12px",
          borderRadius: 14,
          fontWeight: 700,
          fontSize: 14,
        }}
      >
       {precoAnoAnterior > 0
  ? `${(((precoAtual - precoAnoAnterior) / precoAnoAnterior) * 100).toFixed(1).replace(".", ",")}%`
  : "0,0%"}
      </div>
    </div>

    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ color: "#59D98E", fontSize: 15 }}>2026</span>

        <span
          style={{
            color: "#59D98E",
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          R$ {dados.cooabriel}
        </span>
      </div>

      <div
        style={{
          height: 10,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "62%",
            height: "100%",
            background: "#59D98E",
            borderRadius: 999,
          }}
        />
      </div>
    </div>

    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ color: "#777", fontSize: 15 }}>2025</span>

        <span
          style={{
            color: "#888",
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          {dados.robusta_cccv_ano_anterior
            ? `R$ ${Number(
                dados.robusta_cccv_ano_anterior
              ).toLocaleString("pt-BR")}`
            : "Carregando..."}
        </span>
      </div>

      <div
        style={{
          height: 10,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.18)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  </div>
</section>
</section><section style={styles.box}>
        <div>
  <h2 style={{ marginBottom: 6, color: "#9AA09A" }}>{statusClima}</h2>

  <p
    style={{
      marginTop: 0,
      marginBottom: 18,
      fontSize: 14,
      color: "#B7C2B0",
      lineHeight: 1.4,
    }}
  >
    {resumoClima}
  </p>
</div>
        {clima.length === 0 ? (
          <p>Aguardando permissão de localização...</p>
        ) : (
          <div style={{
  display: "flex",
  gap: 12,
  overflowX: "auto",
  paddingBottom: 6,
  paddingRight: 16,
}}>
  {clima
  .filter((dia) => new Date(dia.dia) >= new Date(new Date().setHours(0,0,0,0)))
  .slice(0, 5)
  .map((dia, index) => (
            <div key={dia.dia} style={styles.weatherCard}>
              <strong>
                {index === 0
  ? "Hoje"
  : new Date(dia.dia).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    })}
              </strong>
             <span
  style={{
    fontWeight: 700,
    fontSize: 18,
    color: dia.temperatura >= 30 ? "#C98745" : "#E8E3D7",
  }}
>
  {dia.chuva >= 3
    ? "🌧️"
    : dia.chuva > 0
    ? "🌦️"
    : "☀️"}{" "}
  {Math.round(dia.temperatura)}°C
</span>
              <span>{dia.chuva} mm</span>
            </div>
          )
        )}
        </div>
        )}
      </section>

      

      <section style={styles.box}>
        <h2 style={{ ...styles.sectionTitle, color: "#9AA09A" }}>Notícias ›</h2>
        <div style={styles.newsScroll}>
        {noticiasDinamicas.map((noticia, index) => (
          <div key={index} style={styles.newsItem}>
            <span style={{ ...styles.dot, background: noticia.cor }}></span>
            <span style={{ color: "#8E8E8E", flex: 1, minWidth: 0, whiteSpace: "normal", overflowWrap: "break-word", lineHeight: 1.45 }}>
  <strong style={{ color: "#EAEAEA" }}>
    {noticia.texto.split(" ")[0]}
  </strong>
  {" " + noticia.texto.split(" ").slice(1).join(" ")}
</span>
          </div>
        ))}
        </div>
      </section>

      <section style={{ ...styles.readingBox, background: "#0E1A16" }}>
        <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 24, color: "#9AA09A", }}>
  Resumo Diário do Café
</h3>
        <p style={{ margin: 0, lineHeight: 1.7, fontSize: 15 }}>
          {leituraMercado}
        </p>
      </section>

      <section style={styles.ctaBox}>
        <h2 style={{ color: "#9AA09A" }}>
  Receba a análise semanal do Conilon
</h2>
        
       <a
  href="https://wa.me/5527999999999?text=Quero%20receber%20a%20análise%20semanal%20do%20Conilon"
  target="_blank"
  rel="noopener noreferrer"
  style={{ textDecoration: "none" }}
>
  <button style={styles.button}>
    Entrar na lista da Newsletter pelo WhatsApp
  </button>
</a>
      </section>
    </div>
  );
}

function Card({ titulo, valor, subtitulo, cor, corFundo, tamanhoValor, estiloExtra }) {
  return (
    <div style={{ ...styles.card, ...estiloExtra, backgroundColor: corFundo || "#fff" }}>
      <p style={{ margin: 0, color: "#A8B3A2", fontSize: 12 }}>{titulo}</p>
      <h2
  style={{
    margin: "10px 0",
    color: cor || "#CFC8BE",
    fontSize: tamanhoValor || 34,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 1.1,
  }}
>
        {valor}
      </h2>
      <small
  style={{
    color: "#8A8A80",
    fontSize: 11,
    letterSpacing: 0.2,
    lineHeight: 1.5,
  }}
>
  {subtitulo}
</small>
    </div>
  );
}

const styles = {
  page: {
  background: "linear-gradient(180deg, #102117 0%, #18261D 100%)",
  minHeight: "100dvh",
  padding: "18px 16px 40px",
  fontFamily: "Arial",
  color: "#F0EDE6",
  maxWidth: 520,
margin: "0 auto",
    boxShadow: "0 0 0 100vmax #102117",
},

headerTop: {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 8,
},

logo: {
  width: 52,
  height: 52,
  borderRadius: 12,
  objectFit: "cover",
},

title: {
  margin: 0,
  fontSize: 34,
  fontWeight: "700",
  letterSpacing: -1.2,
  color: "#F0EDE6",
  marginBottom: 4,
},






  header: {
    background: "linear-gradient(180deg, #213328 0%, #18221B 100%)",
color: "white",
padding: "30px 28px",
borderRadius: 30,
boxShadow: "0 10px 35px rgba(0,0,0,0.30)",
border: "1px solid rgba(140,180,140,0.10)",
marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
fontWeight: "800",
lineHeight: 1.1,
letterSpacing: -2,
color: "#6F7C74",
textShadow: "0 2px 10px rgba(0,0,0,0.25)",
marginTop: 34,
marginBottom: 16,
  },
  grid: {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 14,
  alignItems: "start",
},
  card: {
  background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)",
  padding: 16,
  display: "flex",
flexDirection: "column",
justifyContent: "flex-start",
  borderRadius: 24,
  boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  border: "1px solid rgba(120,160,120,0.14)",
  marginTop: 14,
  minHeight: 125,
},
  box: {
  background: "#151710",
  marginTop: 10,
  padding: 14,
  borderRadius: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  border: "1px solid rgba(255,255,255,0.05)",
},
  weatherCard: {
  minWidth: 72,
  padding: "14px 10px",
  borderRadius: 18,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
},
  input: {
    padding: 10,
    width: "100%",
    borderRadius: 12,
    border: "1px solid #ccc",
    fontSize: 16,
    boxSizing: "border-box",
  },
  newsScroll: {
  display: "flex",
  overflowX: "auto",
  gap: 12,
  paddingBottom: 6,
  scrollSnapType: "x mandatory",
},
  newsItem: {
  display: "grid",
  gridTemplateColumns: "14px 1fr",
  alignItems: "flex-start",
  columnGap: 10,
  background: "#151710",
  padding: "16px 18px",
  borderRadius: 18,
  minWidth: "calc(100% - 24px)",
  maxWidth: "calc(100% - 24px)",
  flexShrink: 0,
  scrollSnapAlign: "start",
  whiteSpace: "normal",
  lineHeight: 1.45,
  overflowWrap: "break-word",
},
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  readingBox: {
    background: "#151710",
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
  },
  ctaBox: {
    background: "#151710",
    color: "white",
    marginTop: 8,
    padding: 4,
    borderRadius: 8,
    textAlign: "center",
  },
  button: {
  background: "linear-gradient(135deg, #4CAF6B 0%, #3F8E58 100%)",
color: "#08110B",
border: "none",
padding: "14px 18px",
borderRadius: 18,
fontSize: 16,
fontWeight: "700",
cursor: "pointer",
width: "100%",
boxShadow: "0 8px 20px rgba(76,175,107,0.22)",
},
};
