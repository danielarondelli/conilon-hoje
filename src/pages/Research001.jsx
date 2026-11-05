
import React, { useState } from "react";

const content = {
  en: {
    back: "Back to Conilon Hoje",
    issue: "RESEARCH 001 | INAUGURAL EDITION",
    title: "How much coffee can the world afford to lose in 2027/28?",
    subtitle: "An independent quantitative assessment of global coffee supply risk.",
    questionTitle: "Two questions. One supply-risk assessment.",
    q1: "How much production headroom remains under different supply shocks in 2027/28?",
    q2: "What can observable coffee inventories tell us about supply resilience?",
    description:
      "The research combines public production and consumption data, origin-level scenarios, historical supply shocks and inventory evidence. It examines the resilience of the global coffee balance without presenting conditional scenarios as definitive forecasts.",
    metrics: ["Lower stress", "Central", "Severe stress"],
    scopeTitle: "What you receive",
    scope:
      "A 22-page digital PDF with quantitative scenarios, documented assumptions, inventory analysis, methodological limitations and a practical framework for professional supply-risk assessment.",
    audience:
      "For physical traders, cooperatives, exporters, industrial coffee buyers and market analysts.",
    warning:
      "This research is not a price forecast or a guarantee of future physical availability.",
    priceLabel: "INAUGURAL PRICE",
    formTitle: "Request your payment link",
    formInfo:
      "Submit your details to request an individual Payoneer payment link. The PDF is delivered by email after payment confirmation.",
    name: "Full name",
    email: "Email address",
    language: "Report edition",
    company: "Company or professional activity (optional)",
    submit: "Request payment link",
    sending: "Sending request...",
    success: "Request received. We will contact you by email with payment instructions.",
    error: "The request could not be sent. Please try again later.",
    footer: "Independent coffee market research | Daniela Rondelli"
  },
  pt: {
    back: "Voltar ao Conilon Hoje",
    issue: "PESQUISA 001 | EDICAO INAUGURAL",
    title: "Quanto cafe o mundo pode perder em 2027/28?",
    subtitle: "Uma avaliacao quantitativa independente do risco mundial de abastecimento de cafe.",
    questionTitle: "Duas perguntas. Uma pesquisa de risco de abastecimento.",
    q1: "Qual e a margem de producao diante de diferentes choques de oferta em 2027/28?",
    q2: "O que os estoques observaveis revelam sobre a resiliencia do abastecimento?",
    description:
      "A pesquisa combina dados publicos de producao e consumo, cenarios por origem, choques historicos de oferta e evidencias de estoques. Investiga a resiliencia do balanco mundial sem apresentar cenarios condicionais como previsoes definitivas.",
    metrics: ["Menor estresse", "Central", "Estresse severo"],
    scopeTitle: "O que voce recebe",
    scope:
      "Relatorio digital em PDF com 22 paginas, cenarios quantitativos, premissas documentadas, analise de estoques, limitacoes metodologicas e uma estrutura pratica para avaliar riscos de abastecimento.",
    audience:
      "Para traders fisicos, cooperativas, exportadores, compradores industriais e analistas do mercado de cafe.",
    warning:
      "Esta pesquisa nao e uma previsao de precos nem uma garantia de disponibilidade fisica futura.",
    priceLabel: "PRECO INAUGURAL",
    formTitle: "Solicite seu link de pagamento",
    formInfo:
      "Envie seus dados para solicitar um link individual da Payoneer. O PDF sera entregue por email apos a confirmacao do pagamento.",
    name: "Nome completo",
    email: "Endereco de email",
    language: "Edicao do relatorio",
    company: "Empresa ou atividade profissional (opcional)",
    submit: "Solicitar link de pagamento",
    sending: "Enviando solicitacao...",
    success: "Solicitacao recebida. Entraremos em contato por email com as instrucoes de pagamento.",
    error: "Nao foi possivel enviar a solicitacao. Tente novamente mais tarde.",
    footer: "Pesquisa independente do mercado de cafe | Daniela Rondelli"
  }
};

const colors = {
  dark: "#102b20",
  green: "#183b2b",
  gold: "#c5a15a",
  paper: "#f7f5f0",
  ink: "#192e23",
  muted: "#617066"
};

export default function Research001() {
  const [lang, setLang] = useState("en");
  const [edition, setEdition] = useState("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("idle");

  const t = content[lang];

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");

    try {
      const response = await fetch("/api/research-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "Research 001",
          price: 69,
          currency: "USD",
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          edition
        })
      });

      if (!response.ok) throw new Error("Request failed");

      setStatus("success");
      setName("");
      setEmail("");
      setCompany("");
    } catch {
      setStatus("error");
    }
  }

  const section = {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "40px 24px"
  };

  const field = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    marginTop: 8,
    border: "1px solid #c8d0c8",
    borderRadius: 7,
    fontSize: 16,
    background: "#fff",
    color: colors.ink
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: colors.paper,
      color: colors.ink,
      fontFamily: "Arial, Helvetica, sans-serif"
    }}>
      <header style={{
        background: colors.dark,
        color: "#fff",
        borderBottom: `3px solid ${colors.gold}`
      }}>
        <div style={{
          ...section,
          paddingTop: 23,
          paddingBottom: 23,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 18
        }}>
          <div>
            <div style={{
              fontSize: 19,
              letterSpacing: 2,
              fontWeight: 700
            }}>
              CONILON HOJE
            </div>
            <div style={{ color: colors.gold, marginTop: 5 }}>
              Market Intelligence
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setLang("en")}
              style={{ cursor: "pointer", fontWeight: lang === "en" ? 700 : 400 }}>
              EN
            </button>
            <button onClick={() => setLang("pt")}
              style={{ cursor: "pointer", fontWeight: lang === "pt" ? 700 : 400 }}>
              PT
            </button>
          </div>
        </div>
      </header>

      <section style={{
        background: colors.green,
        color: "#fff"
      }}>
        <div style={{ ...section, paddingTop: 65, paddingBottom: 70 }}>
          <a href="/" style={{ color: "#d1d6cd", fontSize: 14 }}>
            {t.back}
          </a>

          <p style={{
            marginTop: 42,
            color: colors.gold,
            fontWeight: 700,
            letterSpacing: 2,
            fontSize: 13
          }}>
            {t.issue}
          </p>

          <h1 style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(36px, 5vw, 62px)",
            maxWidth: 850,
            lineHeight: 1.12,
            marginBottom: 20
          }}>
            {t.title}
          </h1>

          <p style={{
            maxWidth: 680,
            fontSize: 19,
            lineHeight: 1.65,
            color: "#d1dbd2"
          }}>
            {t.subtitle}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 42
          }}>
            {["+6.1 M", "+1.2 M", "-5.4 M"].map((value, i) => (
              <div key={i} style={{
                background: "#244737",
                padding: 21,
                borderTop: `5px solid ${["#55b998", "#79acc9", "#c66c59"][i]}`
              }}>
                <div style={{ fontSize: 30, fontWeight: 700 }}>
                  {value}
                </div>
                <div style={{ color: "#d0ddd4", marginTop: 7 }}>
                  {t.metrics[i]}
                </div>
              </div>
            ))}
          </div>

          <p style={{ color: "#c9d7ce", marginTop: 16, fontSize: 13 }}>
            Conditional production-consumption balances, million 60-kg bags.
          </p>
        </div>
      </section>

      <section style={section}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 30 }}>
          {t.questionTitle}
        </h2>
        <div style={{
          borderLeft: `4px solid ${colors.gold}`,
          paddingLeft: 22,
          lineHeight: 1.7,
          fontSize: 19
        }}>
          <p><strong>01.</strong> {t.q1}</p>
          <p><strong>02.</strong> {t.q2}</p>
        </div>

        <p style={{
          lineHeight: 1.8,
          maxWidth: 780,
          color: colors.muted,
          fontSize: 16,
          marginTop: 30
        }}>
          {t.description}
        </p>
      </section>

      <section style={{ background: "#e9eee8" }}>
        <div style={section}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 30 }}>
            {t.scopeTitle}
          </h2>
          <p style={{ lineHeight: 1.8, maxWidth: 780 }}>
            {t.scope}
          </p>
          <p style={{ lineHeight: 1.8, maxWidth: 780 }}>
            {t.audience}
          </p>
          <p style={{
            borderLeft: `4px solid ${colors.gold}`,
            padding: "12px 18px",
            background: "#fff",
            maxWidth: 760
          }}>
            {t.warning}
          </p>
        </div>
      </section>

      <section style={{ ...section, maxWidth: 720 }}>
        <div style={{
          border: "1px solid #d8dcd4",
          padding: "32px 26px",
          background: "#fff",
          borderRadius: 12
        }}>
          <div style={{
            color: colors.muted,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1
          }}>
            {t.priceLabel}
          </div>

          <div style={{
            fontSize: 44,
            fontWeight: 700,
            color: colors.green,
            marginTop: 6
          }}>
            US$ 69
          </div>

          <h2 style={{
            fontFamily: "Georgia, serif",
            fontSize: 27
          }}>
            {t.formTitle}
          </h2>

          <p style={{ lineHeight: 1.7, color: colors.muted }}>
            {t.formInfo}
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              {t.name}
              <input style={field} required maxLength={120}
                value={name} onChange={e => setName(e.target.value)} />
            </label>

            <label style={{ display: "block", marginTop: 19 }}>
              {t.email}
              <input style={field} required type="email"
                maxLength={254} value={email}
                onChange={e => setEmail(e.target.value)} />
            </label>

            <label style={{ display: "block", marginTop: 19 }}>
              {t.language}
              <select style={field} value={edition}
                onChange={e => setEdition(e.target.value)}>
                <option value="en">English PDF</option>
                <option value="pt">PDF em portugues</option>
              </select>
            </label>

            <label style={{ display: "block", marginTop: 19 }}>
              {t.company}
              <input style={field} maxLength={150}
                value={company}
                onChange={e => setCompany(e.target.value)} />
            </label>

            <button type="submit"
              disabled={status === "sending"}
              style={{
                marginTop: 26,
                padding: "16px 22px",
                width: "100%",
                border: 0,
                borderRadius: 7,
                fontSize: 16,
                background: colors.green,
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer"
              }}>
              {status === "sending" ? t.sending : t.submit}
            </button>

            {status === "success" && (
              <p role="status" style={{ color: "#17673f" }}>
                {t.success}
              </p>
            )}
            {status === "error" && (
              <p role="alert" style={{ color: "#a13729" }}>
                {t.error}
              </p>
            )}
          </form>
        </div>
      </section>

      <footer style={{
        padding: 30,
        background: colors.dark,
        borderTop: `3px solid ${colors.gold}`,
        color: "#d4dcd3",
        textAlign: "center",
        fontSize: 13
      }}>
        {t.footer}
        <div style={{ marginTop: 10 }}>
          www.conilonhoje.com.br
        </div>
      </footer>
    </main>
  );
}
