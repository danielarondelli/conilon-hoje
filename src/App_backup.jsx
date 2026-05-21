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
  const [clima, setClima] = React.useState([]);
  const [statusClima, setStatusClima] = React.useState("Buscando clima da sua região...");
const [planilha,setPlanilha] = React.useState([])
const [historico, setHistorico] = React.useState([])

const [noticiasDinamicas, setNoticiasDinamicas] = React.useState([])


 const dados = planilha[0] || {};
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
            setStatusClima("Clima da sua região");
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
        cccv: col[idx("cccv")],
        robusta: col[idx("ice_robusta")],
        noticia1: col[idx("noticia1")],
        noticia2: col[idx("noticia2")],
        noticia3: col[idx("noticia3")],
        noticia4: col[idx("noticia4")],
        robusta_cccv_ano_anterior: col[idx("robusta_cccv_ano_anterior")],
        arabica_cccv: col[idx("arabica_cccv")],
        leitura_mercado: col[idx("leitura_mercado")],
        data_grafico: col[idx("data_grafico")],
        preco_cooabriel_grafico: col[idx("preco_cooabriel_grafico")],
      }));

      const dadosHistorico = tabela
  .filter((item) => item.data_grafico && item.preco_cooabriel_grafico)
  .map((item) => ({
    dia: item.data_grafico.slice(0, 5),
    preco: Number(
      String(item.preco_cooabriel_grafico)
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ),
  }))
  .filter((item) => !isNaN(item.preco));

const noticiasTabela = [
  { categoria: "☕", texto: tabela[0]?.noticia1 || "" },
  { categoria: "☕", texto: tabela[0]?.noticia2 || "" },
  { categoria: "☕", texto: tabela[0]?.noticia3 || "" },
  { categoria: "☕", texto: tabela[0]?.noticia4 || "" },
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

<small>
  Atualizado: {new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</small>
      </header>

     <h2 style={styles.sectionTitle}>Preço de referência • ES, Brasil</h2>

<section style={styles.grid}>
 
 <Card titulo="Cooabriel" valor={`R$ ${dados.cooabriel},00`} corFundo="#E7DED1" subtitulo={<>Mercado produtor •<br/>São Gabriel da Palha</>} />
 <Card titulo="CCCV" valor={`R$ ${dados.cccv},00`} corFundo="#E7DED1" subtitulo={<>
Mercado exportador •<br/>
Vitória<br/>
<span style={{ color: "#9a9a9a", fontSize: 13 }}>
  Referência diária atualizada após 17h
</span>
</>} />
</section>

      <h2 style={styles.sectionTitle}>Referência de mercado</h2>
      <section style={styles.grid}>
        <Card titulo="CCCV Arábica" tamanhoValor="26px" valor={`R$ ${Number(dados.arabica_cccv).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} subtitulo="Referência diária atualizada após 17h" cor="#8B6B4A" />
        <Card titulo="Dólar" valor={dolar ? `R$ ${Number(dolar).toFixed(2)}` : "Carregando..."} subtitulo="Câmbio comercial • USD/BRL" />
       <Card titulo="ICE Robusta" valor={`US$ ${dados.robusta}/t`} subtitulo="Bolsa de Londres • Robusta" />
      </section>

      <section style={styles.box}>
       <h3 style={{ marginTop: 0, marginBottom: 8 }}>Simulador de venda</h3>
        <p style={{ marginTop: 0, marginBottom: 8, fontSize: 14 }}>
Digite a quantidade de sacas:
</p>
        <input
          type="number"
          value={sacas}
          onChange={(e) => setSacas(e.target.value)}
          placeholder="Ex: 100"
          style={styles.input}
        />
        <h3 style={{ color: "#123d28", marginTop: 10, marginBottom: 6 }}>
  Total estimado: R$ {valorVenda.toLocaleString("pt-BR")}
</h3>
        <small>Base: preço Cooabriel de hoje</small>
      </section><section style={styles.box}>
        <div>
  <h2 style={{ marginBottom: 6 }}>{statusClima}</h2>

  <p
    style={{
      marginTop: 0,
      marginBottom: 18,
      fontSize: 14,
      color: "#666",
      lineHeight: 1.4,
    }}
  >
    {resumoClima}
  </p>
</div>
        {clima.length === 0 ? (
          <p>Aguardando permissão de localização...</p>
        ) : (
          clima
  .filter((dia) => new Date(dia.dia) >= new Date(new Date().setHours(0,0,0,0)))
  .slice(0, 5)
  .map((dia, index) => (
            <div key={dia.dia} style={styles.weatherRow}>
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
    color: dia.temperatura >= 30 ? "#9C5A1A" : "#444",
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
          ))
        )}
      </section>

      

      <section style={styles.box}>
        <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 24 }}>
  Conilon • hoje x ano anterior
</h3>
<p style={{ marginTop: -8, marginBottom: 14, fontSize: 13, color: "#777" }}>
  Compare o preço atual com o mesmo período do ano anterior.
</p>
        <p style={{ margin: "6px 0", fontSize: 17 }}>
  Preço/hoje: R$ {dados.cooabriel},00
</p>
        <p style={{ margin: "6px 0", fontSize: 17 }}>
  Ano anterior:
  {dados.robusta_cccv_ano_anterior
    ? ` R$ ${Number(dados.robusta_cccv_ano_anterior).toLocaleString("pt-BR")},00`
    : " Carregando..."}
</p>
        
      </section>

      <section style={styles.box}>
        <h2>Conilon • últimos 5 dias</h2>
        <p style={{ fontSize: 12, color: "#666", marginTop: -10 }}>
  Referência Cooabriel • São Gabriel da Palha • saca 60 kg
</p>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart
  data={historico.slice(-5)}
  margin={{ top: 25, right: 40, left: 10, bottom: 5 }}
>

<CartesianGrid
  stroke="#E7E2D8"
  strokeDasharray="3 3"
  vertical={false}
/>




            <XAxis dataKey="dia" />
            <YAxis
  domain={[750, 1000]}
  tickFormatter={(value) => `R$ ${value}`}
  tick={{ fontSize: 11 }}
  tickCount={5}
/>
           <Tooltip
  formatter={(value) => [`R$ ${value}`, "Preço"]}
  labelFormatter={(label) => `Dia ${label}`}
/>
         <Line
  type="monotone"
  dataKey="preco"
  stroke="#1F4D2B"
  strokeWidth={3}
  dot={{
    r: 4,
    stroke: "#1F4D2B",
    strokeWidth: 3,
    fill: "#F5F1E8",
  }}
  activeDot={{
    r: 7,
    stroke: "#1F4D2B",
    strokeWidth: 3,
    fill: "#FFFFFF",
  }}
>
  <LabelList
    dataKey="preco"
    position="top"
    formatter={(value) => `R$ ${value}`}
    style={{
      fontSize: 11,
      fontWeight: 600,
      fill: "#1F4D2B",
    }}
  />
</Line>
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section style={styles.box}>
        <h2>Notícias do mercado</h2>
        {noticiasDinamicas.map((noticia, index) => (
          <div key={index} style={styles.newsItem}>
            <span style={{ ...styles.dot, background: noticia.cor }}></span>
            <strong>{noticia.categoria}: </strong>
            <span>{noticia.texto}</span>
          </div>
        ))}
      </section>

      <section style={styles.readingBox}>
        <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
  Resumo Diário do Café
</h3>
        <p style={{ margin: 0, lineHeight: 1.5, fontSize: 15 }}>
          {leituraMercado}
        </p>
      </section>

      <section style={styles.ctaBox}>
        <h2>Receba a análise semanal do Conilon</h2>
        <p>Preço, clima, exportações e tendências do Conilon.</p>
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

function Card({ titulo, valor, subtitulo, cor, corFundo, tamanhoValor }) {
  return (
    <div style={{ ...styles.card, backgroundColor: corFundo || "#fff" }}>
      <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{titulo}</p>
      <h2 style={{ margin: "8px 0", color: cor || "#123d28", fontSize: tamanhoValor || 30 }}>
        {valor}
      </h2>
      <small style={{ color: "#777" }}>{subtitulo}</small>
    </div>
  );
}

const styles = {
  page: {
  background: "#f4efe6",
  minHeight: "100vh",
  padding: 18,
  fontFamily: "Arial",
  color: "#222",
  maxWidth: 520,
  margin: "0 auto",
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
  fontWeight: "bold",
  color: "white",
},






  header: {
    background: "#123d28",
    color: "white",
    padding: 24,
    borderRadius: 22,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    color: "#6B4A2B",
  },
  grid: {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 14,
},
  card: {
    background: "white",
    padding: 10,
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    border: "1px solid #eee",
  },
  box: {
    background: "white",
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  },
  weatherRow: {
  display: "grid",
  gridTemplateColumns: "1fr 80px 70px",
  gap: 10,
  alignItems: "center",
  padding: "9px 14px",
  marginBottom: 10,
  borderRadius: 16,
  background: "#F8F4EA",
  border: "1px solid rgba(107,74,43,0.10)",
},
  input: {
    padding: 10,
    width: "100%",
    borderRadius: 12,
    border: "1px solid #ccc",
    fontSize: 16,
    boxSizing: "border-box",
  },
  newsItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  readingBox: {
    background: "#fff8e8",
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
  },
  ctaBox: {
    background: "#123d28",
    color: "white",
    marginTop: 8,
    padding: 4,
    borderRadius: 8,
    textAlign: "center",
  },
  button: {
  background: "white",
  color: "#123d28",
  border: "none",
  padding: "14px 18px",
  borderRadius: 14,
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
  width: "100%",
},
};
