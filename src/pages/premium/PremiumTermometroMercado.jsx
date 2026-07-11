import React, { useEffect, useMemo, useState } from "react";
import logoConilon from "../../assets/logo-conilon.jpg.jpeg";
import seuConilon from "../../assets/mascotes/seu_conilon_sem_fundo.png";
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub?gid=863354306&single=true&output=csv&t=" +
  Date.now();

function detectarSeparador(linha) {
  const virgulas = (linha.match(/,/g) || []).length;
  const pontoVirgulas = (linha.match(/;/g) || []).length;
  return pontoVirgulas > virgulas ? ";" : ",";
}

function parseLinhaCSV(linha, separador) {
  return linha.split(separador).map((item) => item.trim().replace(/^"|"$/g, ""));
}

function numero(valor) {
  if (valor == null || valor === "") return null;

  const limpo = String(valor)
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

function formatBRL(valor, casas = 0) {
  if (valor == null) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function formatNumero(valor) {
  if (valor == null) return "—";
  return valor.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });
}

function calcVariacao(atual, anterior) {
  if (atual == null || anterior == null || anterior === 0) return null;
  return ((atual - anterior) / anterior) * 100;
}

function pegarValor(obj, chaves) {
  for (const chave of chaves) {
    if (obj[chave] !== undefined && obj[chave] !== "") return obj[chave];
  }
  return "";
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


function avaliarVetor(tipo, hist) {
  const pesos = { físico: 5, ice: 3, dólar: 2 };
  const pesoMaximo = pesos[tipo] || 1;

  if (!hist || hist.atual == null) {
    return {
      status: "Neutro", intensidade: "sem dados", cor: "#facc15", emoji: "🟡",
      ponto: 0, score: 0, resumo: "Sem dados disponíveis.",
      texto: "Não foi possível carregar os dados deste indicador.",
      detalhe: "Verifique a conexão com a planilha.",
      significado: "Este vetor não está influenciando a leitura do termômetro.",
    };
  }

  const { atual, anterior, variacaoDia, valor7d, variacao7d, media30, n30 } = hist;
  const temOntem = anterior != null && variacaoDia != null;
  const tem7d = valor7d != null && variacao7d != null;
  const temMedia = media30 != null;

  // direção do dia
  const direcao = temOntem ? (variacaoDia > 0 ? 1 : variacaoDia < 0 ? -1 : 0) : 0;
  const abs = temOntem ? Math.abs(variacaoDia) : 0;
  let fator = 0.4;
  let intensidade = "leve";
  if (abs >= 1.5) { fator = 1; intensidade = "forte"; }
  else if (abs >= 0.5) { fator = 0.7; intensidade = "moderada"; }

  const score = Number((direcao * pesoMaximo * fator).toFixed(1));

  // textos por vetor e direção
  const fmt = (v, dec = 0) => v != null ? v.toFixed(dec) : "—";
  const pct = (v) => v != null ? `${v > 0 ? "+" : ""}${v.toFixed(2)}%` : null;

  const linhas7d = tem7d
    ? `Nos últimos 7 pregões, ${
        tipo === "físico" ? "o preço físico" : tipo === "ice" ? "a ICE Robusta" : "o dólar"
      } ${variacao7d > 0 ? "acumulou alta de" : "acumulou queda de"} ${pct(variacao7d)}.`
    : "";

  const linhasMedia = temMedia
    ? `Está ${atual > media30 ? "acima" : atual < media30 ? "abaixo" : "na"} da média dos últimos ${n30} pregões (${
        tipo === "dólar" ? "R$ " + fmt(media30, 2) : fmt(media30, 0)
      }).`
    : "";

  const semOntem = !temOntem
    ? "Não há fechamento anterior disponível para comparação diária."
    : null;

  if (!temOntem) {
    return {
      status: "Neutro", intensidade: "sem comparação", cor: "#facc15", emoji: "🟡",
      ponto: 0, score: 0,
      resumo: semOntem,
      texto: semOntem,
      detalhe: [semOntem, linhasMedia].filter(Boolean).join(" "),
      significado: temMedia
        ? `Referência atual contra média de ${n30} pregões disponível.`
        : "Histórico ainda insuficiente para análise comparativa.",
    };
  }

    // FAVORECE
  if (direcao > 0) {
    const texto =
      tipo === "físico"
        ? `O mercado físico local avançou ${pct(variacaoDia)} frente ao fechamento anterior. Isso favorece o produtor, pois indica melhora no preço praticado na praça local.`
        : tipo === "ice"
        ? `A ICE Robusta subiu ${pct(variacaoDia)} frente ao fechamento anterior. Isso favorece o Conilon, pois a referência internacional ganhou força.`
        : `O dólar avançou ${pct(variacaoDia)} frente ao fechamento anterior. Isso favorece o mercado interno, pois melhora a conversão da referência externa para reais.`;

    return {
      status: "Favorece",
      intensidade,
      cor: "🟩#22c55e",
      emoji: "🟢",
      ponto: 1,
      score,
      resumo: texto.split(".")[0] + ".",
      texto,
      detalhe: [texto, linhas7d, linhasMedia].filter(Boolean).join(" "),
      significado:
        "Este vetor está ajudando o termômetro porque aponta melhora em uma das forças que sustentam o preço do Conilon.",
    };
  }

  // PRESSIONA
  if (direcao < 0) {
    const texto =
      tipo === "físico"
        ? `O mercado físico local recuou ${pct(variacaoDia)} frente ao fechamento anterior. Isso pressiona o produtor, pois indica perda de força no preço praticado na praça local.`
        : tipo === "ice"
        ? `A ICE Robusta caiu ${pct(variacaoDia)} frente ao fechamento anterior. Isso pressiona o Conilon, pois a referência internacional perdeu sustentação.`
        : `O dólar recuou ${pct(variacaoDia)} frente ao fechamento anterior. Isso pressiona o mercado interno, pois reduz a conversão da referência externa para reais.`;

    return {
      status: "Pressiona",
      intensidade,
      cor: "🟥#ef4444",
      emoji: "🔴",
      ponto: -1,
      score,
      resumo: texto.split(".")[0] + ".",
      texto,
      detalhe: [texto, linhas7d, linhasMedia].filter(Boolean).join(" "),
      significado:
        "Este vetor está pressionando o termômetro porque aponta perda de força em uma das referências que influenciam o preço do Conilon.",
    };
  }

  // NEUTRO com dados
  return {
    status: "Neutro",
    intensidade: "",
    cor: "🟨#facc15",
    emoji: "🟡",
    ponto: 0,
    score: 0,
    resumo: "Não houve variação relevante frente ao fechamento anterior.",
    texto: "O vetor ficou praticamente estável no dia.",
    detalhe: ["O vetor ficou praticamente estável no dia.", linhas7d, linhasMedia]
      .filter(Boolean)
      .join(" "),
    significado:
      "Quando um vetor permanece neutro, ele não adiciona pressão relevante de alta nem de baixa ao termômetro.",
  };
}


function interpretarTermometro(vetores) {
  const score = Number(
    vetores.reduce((acc, item) => acc + item.score, 0).toFixed(1)
  );

  if (score >= 3.5) {
    return {
      score,
      status: "Vetores ajudam o Conilon",
      cor: "#22c55e",
      emoji: "🟢",
      texto:
        "O conjunto do dia está mais favorável ao Conilon. A leitura ponderada entre mercado físico, ICE Robusta e câmbio indica maior sustentação para o preço interno.",
      cafe:
        "Para quem possui café, o ambiente está mais construtivo. O ponto principal é observar se essa combinação entre físico, dólar e bolsa se mantém nos próximos dias.",
    };
  }

  if (score <= -3.5) {
    return {
      score,
      status: "Vetores pressionam o Conilon",
      cor: "#ef4444",
      emoji: "🔴",
      texto:
        "O conjunto do dia está mais pressionado. A leitura ponderada sugere menor sustentação para o preço interno, principalmente se bolsa e câmbio estiverem trabalhando contra o físico.",
      cafe:
        "Para quem possui café, o cenário pede cautela. O ponto principal é acompanhar se a pressão é pontual ou se começa a formar uma sequência de enfraquecimento.",
    };
  }

  return {
    score,
    status: "Sinal misto",
    cor: "#facc15",
    emoji: "🟡",
    texto:
      "Os indicadores estão sem consenso. O mercado ainda não mostra direção predominante.",
    cafe:
      "Para quem possui café, o sinal é de atenção. O mercado não está totalmente contra, mas também não mostra força ampla entre físico, dólar e ICE Robusta.",
  };
}



export default function PremiumTermometroMercado() {
    const [historico, setHistorico] = useState({ cccv: null, ice: null, dolar: null });

  const [vetorAberto, setVetorAberto] = useState(null);
    const [dados, setDados] = useState({
    data: "",
    cccvAtual: null,
    cccvAnterior: null,
    iceAtual: null,
    iceAnterior: null,
    dolarAtual: null,
    dolarVariacao: null,
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const resposta = await fetch(CSV_URL);
        const texto = await resposta.text();

        const linhas = texto.trim().split(/\r?\n/);
        const separador = detectarSeparador(linhas[0]);

        const cabecalho = parseLinhaCSV(linhas[0], separador);
        const valoresAtuais = parseLinhaCSV(linhas[1], separador);
        const valoresAnteriores = parseLinhaCSV(linhas[2] || linhas[1], separador);

        const atual = {};
        const anterior = {};

        cabecalho.forEach((coluna, index) => {
          atual[coluna.trim()] = valoresAtuais[index]?.trim();
          anterior[coluna.trim()] = valoresAnteriores[index]?.trim();
        });

        setDados((dadosAtuais) => ({
          ...dadosAtuais,
          data: pegarValor(atual, ["data", "Data"]),
          cccvAtual: numero(pegarValor(atual, ["cccv", "CCCV"])),
          cccvAnterior: numero(pegarValor(anterior, ["cccv", "CCCV"])),
          iceAtual: numero(
            pegarValor(atual, [
              "ice_robusta",
              "robusta",
              "ice",
              "ICE",
              "ICE Robusta",
            ])
          ),
          iceAnterior: numero(
            pegarValor(anterior, [
              "ice_robusta",
              "robusta",
              "ice",
              "ICE",
              "ICE Robusta",
            ])
          ),
        }));
      } catch (error) {
        console.error("Erro ao carregar dados do termômetro:", error);
      }
    }

    carregarDados();
  }, []);

  
useEffect(() => {
  const HIST_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT538JtTs5njlBOQ9W_zW94-MBB84BBIVwteDGctFQDD2RQC_bUdSkYbyeAq1N-R2uGZsVsIIIuH0CN/pub?gid=899441478&single=true&output=csv";


  fetch(HIST_URL)
    .then((res) => res.text())
    .then((csv) => {
      const linhas = csv.trim().split("\n");
      // linha 0 = cabeçalho: data,cccv,ice,dolar
      const registros = linhas
        .slice(1)
        .map((linha) => {
          const cols = linha.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          const n = (v) => {
  if (v == null || String(v).trim() === "") return null;
  const s = String(v).trim();
  const temVirgula = s.includes(",");
  const temPonto = s.includes(".");
  let limpo;
  if (temVirgula && temPonto) {
    limpo = s.replace(/\./g, "").replace(",", ".");
  } else if (temVirgula && !temPonto) {
    limpo = s.replace(",", ".");
  } else {
    limpo = s;
  }
  limpo = limpo.replace(/[^\d.-]/g, "");
  const num = Number(limpo);
  return Number.isFinite(num) ? num : null;
};

          return {
            data: cols[0],
            cccv: n(cols[1]),
            ice: n(cols[2]),
           dolar: n(cols[3] !== undefined && cols[4] !== undefined ? `${cols[3]}.${cols[4]}` : cols[3]),
          };
        })
        .filter((r) => r.data && (r.cccv || r.ice || r.dolar))



      if (registros.length === 0) return;

      const atual = registros[registros.length - 1];
      const anterior = registros.length >= 2 ? registros[registros.length - 2] : null;
      const idx7d = registros.length >= 8 ? registros.length - 8 : null;
      const ref7d = idx7d !== null ? registros[idx7d] : null;
      const ultimos30 = registros.slice(-30);

      const media = (campo) => {
        const vals = ultimos30.map((r) => r[campo]).filter((v) => v != null);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      };

      const variacao = (a, b) =>
        a != null && b != null && b !== 0 ? ((a - b) / b) * 100 : null;

      setHistorico({
        cccv: {
          atual: atual.cccv,
          anterior: anterior?.cccv ?? null,
          variacaoDia: variacao(atual.cccv, anterior?.cccv),
          valor7d: ref7d?.cccv ?? null,
          variacao7d: variacao(atual.cccv, ref7d?.cccv),
          media30: media("cccv"),
          n30: ultimos30.length,
        },
        ice: {
          atual: atual.ice,
          anterior: anterior?.ice ?? null,
          variacaoDia: variacao(atual.ice, anterior?.ice),
          valor7d: ref7d?.ice ?? null,
          variacao7d: variacao(atual.ice, ref7d?.ice),
          media30: media("ice"),
          n30: ultimos30.length,
        },
        dolar: {
          atual: atual.dolar,
          anterior: anterior?.dolar ?? null,
          variacaoDia: variacao(atual.dolar, anterior?.dolar),
          valor7d: ref7d?.dolar ?? null,
          variacao7d: variacao(atual.dolar, ref7d?.dolar),
          media30: media("dolar"),
          n30: ultimos30.length,
        },
      });
    })
    .catch(() => {});
}, []);



  const variacaoCCCV = historico.cccv?.variacaoDia ?? null;


  const variacaoICE = historico.ice?.variacaoDia ?? null;


  const variacaoDolar = historico.dolar?.variacaoDia ?? null;


  const vetorFisico = avaliarVetor("físico", {
  atual: dados.cccvAtual,
  anterior: dados.cccvAnterior,
  variacaoDia: variacaoCCCV,
});
const vetorDolar = avaliarVetor("dólar", historico.dolar);
const vetorICE = avaliarVetor("ice", historico.ice);


  const leitura = interpretarTermometro([vetorFisico, vetorDolar, vetorICE]);

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
          <div style={styles.icon}>🌡️</div>

          <div>
            <h1 style={styles.h1}>Termômetro de Mercado</h1>
            <p style={styles.subtitle}>
              Mercado físico · Dólar comercial · ICE Robusta
            </p>
          </div>
        </section>

        <section style={styles.questionCard}>
          <p style={styles.question}>
            Esses vetores estão ajudando ou pressionando o Conilon hoje?
          </p>
        </section>

        <section style={styles.gridTop}>
          <MiniCard
            titulo="Mercado físico"
            valor={dados.cccvAtual == null ? "-" : `R$ ${dados.cccvAtual}`}

            subtitulo="CCCV Vitória • Atualização após 17h"
            variacao={variacaoCCCV}
            vetor={vetorFisico}
          />

          <MiniCard
            titulo="Dólar comercial"
           valor={historico.dolar?.atual == null ? "-" : `R$ ${historico.dolar.atual.toFixed(2)}`}



            subtitulo="USD/BRL · Atualização durante do dia"
            variacao={variacaoDolar}
            vetor={vetorDolar}
          />

          <MiniCard
            titulo="ICE Robusta"
            valor={historico.ice?.atual == null ? "-" : `US$ ${historico.ice.atual.toFixed(0)}`}

            subtitulo="1º contrato · Londres · Atualização após 14h"
            variacao={variacaoICE}
            vetor={vetorICE}
          />
        </section>

        <div
  style={{
    display: "flex",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    gap: "16px",
    paddingBottom: "10px",
  }}
>
  <div style={{ minWidth: "100%", scrollSnapAlign: "start" }}>
    <section style={styles.mainCard}>
      <h2 style={{ ...styles.statusGrande, color: leitura.cor }}>
        <GraoVies cor={leitura.cor} /> {leitura.status}
      </h2>

      <GaugeTermometro score={leitura.score} />

      <p style={styles.text}>{leitura.texto}</p>
    </section>
  </div>

  <div style={{ minWidth: "100%", scrollSnapAlign: "start" }}>
    <section style={styles.card}>
      <h3 style={styles.h3}>Força dos vetores hoje</h3>

      <VetorLinha
        nome="Mercado físico"
        vetor={vetorFisico}
        aberto={vetorAberto === "Mercado físico"}
        onClick={() =>
          setVetorAberto(vetorAberto === "Mercado físico" ? null : "Mercado físico")
        }
      />

      <VetorLinha
        nome="Dólar comercial"
        vetor={vetorDolar}
        aberto={vetorAberto === "Dólar comercial"}
        onClick={() =>
          setVetorAberto(vetorAberto === "Dólar comercial" ? null : "Dólar comercial")
        }
      />

      <VetorLinha
        nome="ICE Robusta"
        vetor={vetorICE}
        aberto={vetorAberto === "ICE Robusta"}
        onClick={() =>
          setVetorAberto(vetorAberto === "ICE Robusta" ? null : "ICE Robusta")
        }
      />
    </section>
  </div>

  <div style={{ minWidth: "100%", scrollSnapAlign: "start" }}>
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

        <span>O que isso significa para o meu café?</span>
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
            * O Termômetro de Mercado apresenta o retrato mais atualizado disponível do mercado. Os indicadores são atualizados de forma independente, conforme a disponibilidade das fontes oficiais.
            <br />
            * O indicador é uma leitura direcional de curto prazo e não constitui uma recomendação de venda.
          </p>
        </section>
      </div>
    </div>
  );
}

function MiniCard({ titulo, valor, subtitulo, variacao, vetor }) {
  return (
    <div style={styles.cardSmall}>
      <p style={styles.label}>{titulo}</p>
      <h2 style={styles.price}>{valor}</h2>
      <p style={styles.muted}>{subtitulo}</p>

      <div style={{ ...styles.miniBadge, borderColor: vetor.cor }}>
        <GraoVies cor={vetor.cor} />
        <span style={{ color: vetor.cor }}>
  {vetor.status}
  
</span>
        {variacao != null && (
          <span style={styles.variacao}>
            {variacao > 0 ? "+" : ""}
            {variacao.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

function VetorLinha({ nome, vetor, aberto, onClick }) {
  return (
    <div style={{ cursor: "pointer" }} onClick={onClick}>
      <div style={styles.vetorLinha}>
        <div>
          <strong style={styles.vetorNome}>{nome}</strong>
          {!aberto && <p style={styles.vetorTexto}>{vetor.resumo}</p>}
        </div>

        <span
          style={{
            ...styles.vetorStatus,
            color: vetor.cor,
            borderColor: vetor.cor,
          }}
        >
          <GraoVies cor={vetor.cor} /> {vetor.status}
          {vetor.intensidade &&
          vetor.intensidade !== "sem comparação" &&
          vetor.intensidade !== ""
            ? ` ${vetor.intensidade}`
            : ""}
        </span>
      </div>

      {aberto && (
        <div style={styles.expansao}>
          <p style={{ margin: "0 0 10px 0" }}>
            <strong style={{ color: "#f0c040", display: "block", marginBottom: "4px" }}>
              O que aconteceu?
            </strong>
            {vetor.detalhe ?? vetor.texto}
          </p>

          <p style={{ margin: 0 }}>
            <strong style={{ color: "#f0c040", display: "block", marginBottom: "4px" }}>
              O que isso significa para o preço do Conilon?
            </strong>
            {vetor.significado ??
              "Este vetor ainda não influencia a leitura do mercado. À medida que o histórico diário for sendo construído, ele passará a contribuir para o termômetro."}
          </p>
        </div>
      )}
    </div>
  );
}

function GaugeTermometro({ score }) {
  const scoreLimitado = Math.max(-10, Math.min(10, score || 0));
  const percentual = ((scoreLimitado + 10) / 20) * 100;
  const angulo = -90 + (percentual / 100) * 180;

  return (
    <div style={styles.gaugeBox}>
      <div style={styles.gaugeArc}>
        <div
          style={{
            ...styles.gaugeNeedle,
            transform: `rotate(${angulo}deg)`,
          }}
        />
        <div style={styles.gaugeCenter} />
      </div>

      <div style={styles.gaugeLabels}>
        <span>Pressiona</span>
        <span>Neutro</span>
        <span>Favorece</span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1B2B22 0%, #162019 100%)",
    color: "#F7F3E8",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    padding: "20px 14px 40px",
  },

  container: {
    maxWidth: "460px",
    margin: "0 auto",
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

  questionCard: {
    background: "linear-gradient(180deg, rgba(214,168,79,0.16), rgba(255,255,255,0.06))",
    border: "1px solid rgba(214,168,79,0.28)",
    borderRadius: "20px",
    padding: "15px 16px",
    marginBottom: "12px",
  },

  question: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.45,
    color: "rgba(247,243,232,0.86)",
    fontWeight: 700,
  },

  gridTop: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    marginBottom: "12px",
  },

  cardSmall: {
    background:
      "linear-gradient(180deg, rgba(27,43,34,0.88), rgba(22,32,25,0.88))",
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
    fontSize: "25px",
    lineHeight: 1.05,
  },

  muted: {
    margin: 0,
    fontSize: "11px",
    color: "rgba(247,243,232,0.58)",
  },

  miniBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "800",
    marginTop: "10px",
    background: "rgba(255,255,255,0.04)",
  },

  variacao: {
    color: "rgba(247,243,232,0.68)",
    fontWeight: 700,
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

  statusGrande: {
    fontSize: "26px",
    lineHeight: 1.15,
    margin: "10px 0 12px",
    letterSpacing: "-0.4px",
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
    background:
      "linear-gradient(180deg, rgba(27,43,34,0.88), rgba(22,32,25,0.88))",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "22px",
    padding: "18px",
    marginBottom: "12px",
  },

  h3: {
    margin: "0 0 14px",
    fontSize: "17px",
  },

  vetorLinha: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
  },

  vetorNome: {
    fontSize: "14px",
  },

  vetorTexto: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "rgba(247,243,232,0.64)",
    lineHeight: 1.35,
  },

  vetorStatus: {
    whiteSpace: "nowrap",
    border: "1px solid",
    borderRadius: "999px",
    padding: "6px 9px",
    fontSize: "12px",
    fontWeight: 800,
    background: "rgba(255,255,255,0.04)",
  },

expansao: {
  width: "100%",
  marginTop: 2,
  paddingTop: 4,
// borderTop: "1px solid rgba(255,255,255,0.10)",
  color: "rgba(247,243,232,0.76)",
  fontSize: "12px",
  lineHeight: 1.45,
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

  scoreTexto: {
  margin: "-4px 0 12px",
  fontSize: "14px",
  fontWeight: 800,
  color: "rgba(247,243,232,0.78)",
},

gaugeBox: {
  margin: "0 auto 14px",
  maxWidth: "220px",
},

gaugeArc: {
  position: "relative",
  height: "76px",
  borderTopLeftRadius: "160px",
  borderTopRightRadius: "160px",
  background:
    "conic-gradient(from 270deg, #ef4444 0deg, #facc15 90deg, #22c55e 180deg, transparent 180deg)",
  overflow: "hidden",
},

gaugeNeedle: {
  position: "absolute",
  bottom: 0,
  left: "50%",
  width: "2px",
  height: "62px",
  background: "#F7F3E8",
  transformOrigin: "bottom center",
  borderRadius: "999px",
  boxShadow: "0 0 8px rgba(0,0,0,0.45)",
},

gaugeCenter: {
  position: "absolute",
  bottom: "-7px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  background: "#D6A84F",
  border: "3px solid #162019",
},

gaugeLabels: {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "6px",
  fontSize: "10px",
  color: "rgba(247,243,232,0.55)",
},

};