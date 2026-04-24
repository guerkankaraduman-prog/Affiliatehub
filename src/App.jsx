import { useState, useEffect, useRef } from "react";

const API_CALL = async (systemPrompt, userPrompt) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await response.json();
  return data.content?.map((b) => b.text || "").join("") || "";
};

const DEMO_DATA = {
  employees: [
    { id: 1, name: "Sarah MÃ¼ller", role: "Senior Developer", dept: "IT", salary: 72000, performance: 94, status: "active", joined: "2021-03-15", avatar: "SM" },
    { id: 2, name: "Thomas Becker", role: "Marketing Manager", dept: "Marketing", salary: 65000, performance: 88, status: "active", joined: "2020-07-01", avatar: "TB" },
    { id: 3, name: "Lisa Wagner", role: "HR Specialist", dept: "HR", salary: 55000, performance: 91, status: "active", joined: "2022-01-10", avatar: "LW" },
    { id: 4, name: "Markus Klein", role: "Sales Director", dept: "Sales", salary: 85000, performance: 96, status: "active", joined: "2019-05-20", avatar: "MK" },
    { id: 5, name: "Anna Schulz", role: "Finance Analyst", dept: "Finance", salary: 60000, performance: 82, status: "on-leave", joined: "2021-09-01", avatar: "AS" },
    { id: 6, name: "Felix Hoffmann", role: "DevOps Engineer", dept: "IT", salary: 78000, performance: 89, status: "active", joined: "2020-11-15", avatar: "FH" },
  ],
  clients: [
    { id: 1, name: "TechVenture GmbH", industry: "Software", revenue: 145000, contact: "Klaus Meier", status: "premium", score: 94, projects: 3 },
    { id: 2, name: "Industrie AG", industry: "Manufacturing", revenue: 290000, contact: "Petra Schmidt", status: "enterprise", score: 87, projects: 7 },
    { id: 3, name: "Retail Solutions KG", industry: "Retail", revenue: 89000, contact: "Hans Weber", status: "standard", score: 72, projects: 2 },
    { id: 4, name: "BioMed Research", industry: "Healthcare", revenue: 175000, contact: "Dr. Karin Braun", status: "premium", score: 91, projects: 4 },
    { id: 5, name: "Logistik Partner", industry: "Logistics", revenue: 210000, contact: "Uwe Fischer", status: "enterprise", score: 96, projects: 5 },
  ],
  kpis: { revenue: 1240000, costs: 890000, profit: 350000, headcount: 127, turnover: 8.2, satisfaction: 87 },
  monthlyData: [
    { month: "Jan", revenue: 95000, costs: 72000, hires: 3 },
    { month: "Feb", revenue: 102000, costs: 75000, hires: 2 },
    { month: "Mar", revenue: 115000, costs: 78000, hires: 5 },
    { month: "Apr", revenue: 108000, costs: 74000, hires: 1 },
    { month: "Mai", revenue: 124000, costs: 81000, hires: 4 },
    { month: "Jun", revenue: 131000, costs: 83000, hires: 6 },
  ],
};

const COLORS = {
  bg: "#050B14",
  surface: "#0A1628",
  card: "#0D1F3C",
  border: "#1A3054",
  accent: "#00C8FF",
  accent2: "#0066FF",
  gold: "#FFB800",
  green: "#00E5A0",
  red: "#FF4757",
  text: "#E8F4FF",
  muted: "#5A7A9A",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'Syne', sans-serif; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${COLORS.surface}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(0,200,255,0.1); } 50% { box-shadow: 0 0 40px rgba(0,200,255,0.25); } }
  @keyframes scanline { 0% { top: -2px; } 100% { top: 100%; } }
  @keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

  .animate-in { animation: slideIn 0.4s ease forwards; }
  .glow-card { animation: glow 3s ease-in-out infinite; }

  .btn-primary {
    background: linear-gradient(135deg, ${COLORS.accent2}, ${COLORS.accent});
    border: none; color: white; padding: 10px 20px; border-radius: 8px;
    cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px;
    transition: all 0.2s; letter-spacing: 0.5px;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,102,255,0.4); }

  .btn-ghost {
    background: transparent; border: 1px solid ${COLORS.border}; color: ${COLORS.muted};
    padding: 9px 18px; border-radius: 8px; cursor: pointer; font-family: 'Syne', sans-serif;
    font-size: 13px; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: ${COLORS.accent}; color: ${COLORS.accent}; }

  .mono { font-family: 'IBM Plex Mono', monospace; }

  .tag-premium { background: rgba(255,184,0,0.12); color: ${COLORS.gold}; border: 1px solid rgba(255,184,0,0.25); }
  .tag-enterprise { background: rgba(0,200,255,0.12); color: ${COLORS.accent}; border: 1px solid rgba(0,200,255,0.25); }
  .tag-standard { background: rgba(90,122,154,0.12); color: ${COLORS.muted}; border: 1px solid rgba(90,122,154,0.25); }
  .tag-active { background: rgba(0,229,160,0.12); color: ${COLORS.green}; border: 1px solid rgba(0,229,160,0.25); }
  .tag-on-leave { background: rgba(255,71,87,0.12); color: ${COLORS.red}; border: 1px solid rgba(255,71,87,0.25); }

  .input-field {
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; color: ${COLORS.text};
    padding: 10px 14px; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 13px;
    outline: none; transition: border-color 0.2s; width: 100%;
  }
  .input-field:focus { border-color: ${COLORS.accent}; }
  .input-field::placeholder { color: ${COLORS.muted}; }

  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
    border-radius: 8px; cursor: pointer; transition: all 0.2s;
    color: ${COLORS.muted}; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
    border: 1px solid transparent;
  }
  .nav-item:hover { color: ${COLORS.text}; background: rgba(255,255,255,0.04); }
  .nav-item.active {
    color: ${COLORS.accent}; background: rgba(0,200,255,0.08);
    border-color: rgba(0,200,255,0.2);
  }

  .card {
    background: ${COLORS.card}; border: 1px solid ${COLORS.border};
    border-radius: 12px; padding: 20px;
  }

  .ai-typing::after {
    content: 'â–‹'; animation: pulse 0.8s infinite;
  }

  .progress-bar {
    height: 4px; border-radius: 2px; background: ${COLORS.border};
    overflow: hidden;
  }
  .progress-fill {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, ${COLORS.accent2}, ${COLORS.accent});
    transition: width 1s ease;
  }

  .chart-bar {
    background: linear-gradient(180deg, ${COLORS.accent} 0%, ${COLORS.accent2} 100%);
    border-radius: 4px 4px 0 0; transition: height 0.8s ease;
    cursor: pointer; position: relative;
  }
  .chart-bar:hover { filter: brightness(1.2); }

  .chat-msg-user { background: rgba(0,102,255,0.15); border: 1px solid rgba(0,102,255,0.25); }
  .chat-msg-ai { background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.15); }
`;

// â”€â”€â”€ Mini Bar Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BarChart = ({ data, valueKey, labelKey, height = 120 }) => {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            className="chart-bar"
            style={{ width: "100%", height: `${(d[valueKey] / max) * (height - 20)}px` }}
            title={`${d[labelKey]}: ${d[valueKey].toLocaleString()}`}
          />
          <span style={{ fontSize: 9, color: COLORS.muted, fontFamily: "IBM Plex Mono" }}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
};

// â”€â”€â”€ KPI Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const KPICard = ({ label, value, sub, color, icon }) => (
  <div className="card" style={{ position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80,
      background: `radial-gradient(circle at top right, ${color}18, transparent)`, borderRadius: "0 12px 0 80px" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 10, fontFamily: "IBM Plex Mono" }}>{value}</div>
    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{sub}</div>
  </div>
);

// â”€â”€â”€ AI Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AIChat = ({ context }) => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Guten Tag! Ich bin Ihr KI-HR-Assistent. Ich kann Ihnen bei Personalanalysen, Controlling-Berichten und B2B-Strategien helfen. Was mÃ¶chten Sie wissen?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const system = `Du bist ein intelligenter HR-, Controlling- und B2B-Marketing-Assistent fÃ¼r ein Unternehmen.
Kontext: ${JSON.stringify(context)}
Antworte prÃ¤zise, professionell und auf Deutsch. Nutze konkrete Zahlen aus dem Kontext. Max 150 WÃ¶rter.`;
      const reply = await API_CALL(system, userMsg);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Entschuldigung, es gab einen Verbindungsfehler. Bitte versuchen Sie es erneut." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "4px 0 12px" }}>
        {messages.map((m, i) => (
          <div key={i} className={`animate-in ${m.role === "user" ? "chat-msg-user" : "chat-msg-ai"}`}
            style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.6,
              marginLeft: m.role === "user" ? "20%" : 0, marginRight: m.role === "ai" ? "20%" : 0 }}>
            <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontFamily: "IBM Plex Mono", textTransform: "uppercase", letterSpacing: 1 }}>
              {m.role === "user" ? "Sie" : "ðŸ¤– KI-Assistent"}
            </div>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="chat-msg-ai" style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, marginRight: "20%" }}>
            <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontFamily: "IBM Plex Mono", textTransform: "uppercase", letterSpacing: 1 }}>ðŸ¤– KI-Assistent</div>
            <span className="ai-typing" style={{ color: COLORS.green }}>Analysiere</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="input-field" placeholder="Frage stellenâ€¦" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()} />
        <button className="btn-primary" onClick={send} disabled={loading} style={{ whiteSpace: "nowrap" }}>
          â†‘ Senden
        </button>
      </div>
    </div>
  );
};

// â”€â”€â”€ AI Report Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AIReportGen = ({ data }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("monthly");

  const generate = async () => {
    setLoading(true);
    setReport("");
    const prompts = {
      monthly: `Erstelle einen professionellen Monats-HR-Controlling-Bericht auf Basis dieser Daten: ${JSON.stringify(data)}. 
Strukturiere ihn mit: Executive Summary, KPI-Analyse, Personalstatus, Handlungsempfehlungen. Professionelles Deutsch, ca. 200 WÃ¶rter.`,
      forecast: `Basierend auf diesen Daten: ${JSON.stringify(data.monthlyData)}
Erstelle eine 3-Monats-Prognose fÃ¼r Umsatz, Kosten und Personalbestand. BegrÃ¼nde die SchÃ¤tzungen. Professionelles Deutsch, ca. 150 WÃ¶rter.`,
      risk: `Analysiere diese Unternehmensdaten: ${JSON.stringify(data)}
Identifiziere die Top-5 HR- und Controlling-Risiken und gib konkrete MaÃŸnahmen an. Professionelles Deutsch, ca. 150 WÃ¶rter.`,
    };
    try {
      const result = await API_CALL(
        "Du bist ein erfahrener HR-Controlling-Experte. Erstelle prÃ¤zise, datenbasierte Berichte auf Deutsch.",
        prompts[type]
      );
      setReport(result);
    } catch { setReport("Fehler beim Generieren des Berichts."); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[["monthly", "ðŸ“Š Monatsbericht"], ["forecast", "ðŸ“ˆ Prognose"], ["risk", "âš ï¸ Risikoanalyse"]].map(([v, l]) => (
          <button key={v} onClick={() => setType(v)}
            style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${type === v ? COLORS.accent : COLORS.border}`,
              background: type === v ? "rgba(0,200,255,0.1)" : "transparent",
              color: type === v ? COLORS.accent : COLORS.muted, cursor: "pointer",
              fontFamily: "Syne, sans-serif", fontSize: 12, fontWeight: 600 }}>
            {l}
          </button>
        ))}
        <button className="btn-primary" onClick={generate} disabled={loading} style={{ marginLeft: "auto" }}>
          {loading ? "â³ Generiereâ€¦" : "ðŸ¤– KI-Bericht erstellen"}
        </button>
      </div>
      {report && (
        <div className="animate-in" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 10, padding: 20, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap",
          color: COLORS.text, maxHeight: 400, overflowY: "auto" }}>
          {report}
        </div>
      )}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: COLORS.muted, fontSize: 13 }}>
          <span className="ai-typing" style={{ color: COLORS.accent }}>KI analysiert Daten</span>
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ DASHBOARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Dashboard = ({ data }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      <KPICard label="Jahresumsatz" value={`â‚¬${(data.kpis.revenue / 1000).toFixed(0)}K`} sub="â†‘ 12.4% zum Vorjahr" color={COLORS.accent} icon="ðŸ’°" />
      <KPICard label="Personalkosten" value={`â‚¬${(data.kpis.costs / 1000).toFixed(0)}K`} sub="Anteil: 71.8%" color={COLORS.gold} icon="ðŸ‘¥" />
      <KPICard label="EBIT-Marge" value={`${((data.kpis.profit / data.kpis.revenue) * 100).toFixed(1)}%`} sub="â‚¬350K Gewinn" color={COLORS.green} icon="ðŸ“ˆ" />
      <KPICard label="Mitarbeiterzahl" value={data.kpis.headcount} sub="6 offene Stellen" color={COLORS.accent2} icon="ðŸ¢" />
      <KPICard label="Fluktuation" value={`${data.kpis.turnover}%`} sub="Branchendurchschnitt 11%" color={COLORS.red} icon="ðŸ”„" />
      <KPICard label="Mitarbeiterzufriedenheit" value={`${data.kpis.satisfaction}%`} sub="eNPS Score: +42" color={COLORS.green} icon="â­" />
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: COLORS.accent }}>ðŸ“Š Umsatz vs. Kosten (2024)</div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>Umsatz</div>
            <BarChart data={data.monthlyData} valueKey="revenue" labelKey="month" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>Kosten</div>
            <BarChart data={data.monthlyData} valueKey="costs" labelKey="month" height={120} />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: COLORS.gold }}>ðŸ¢ Abteilungsverteilung</div>
        {[["IT", 28, COLORS.accent], ["Sales", 22, COLORS.green], ["Marketing", 18, COLORS.gold], ["HR", 12, COLORS.accent2], ["Finance", 20, COLORS.muted]].map(([dept, pct, color]) => (
          <div key={dept} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: COLORS.text }}>{dept}</span>
              <span style={{ fontSize: 12, color, fontFamily: "IBM Plex Mono" }}>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="card">
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: COLORS.green }}>ðŸ¤– KI-Empfehlungen</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { icon: "âš¡", title: "SofortmaÃŸnahme", text: "IT-Abteilung: 2 Senior-Entwickler bis Q3 einstellen. Auslastung bei 112%.", color: COLORS.red },
          { icon: "ðŸ“ˆ", title: "Wachstumschance", text: "Sales-Team-Expansion mÃ¶glich: ROI-Prognose +34% bei 3 neuen Account-Managern.", color: COLORS.green },
          { icon: "ðŸ’¡", title: "Optimierung", text: "Weiterbildungsbudget um 15% erhÃ¶hen â†’ Fluktuationsreduktion auf 6% erwartet.", color: COLORS.gold },
        ].map((item, i) => (
          <div key={i} style={{ background: `${item.color}08`, border: `1px solid ${item.color}25`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// â”€â”€â”€ HR MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HRModule = ({ employees }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );

  const analyzeEmployee = async (emp) => {
    setSelected(emp);
    setAiAnalysis("");
    setLoading(true);
    try {
      const result = await API_CALL(
        "Du bist ein HR-Experte. Erstelle eine kurze Mitarbeiteranalyse auf Deutsch (max 100 WÃ¶rter).",
        `Analysiere diesen Mitarbeiter: ${JSON.stringify(emp)}. Gib Feedback zu Performance, Gehaltsangemessenheit und Entwicklungsempfehlungen.`
      );
      setAiAnalysis(result);
    } catch { setAiAnalysis("Analyse nicht verfÃ¼gbar."); }
    setLoading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16 }}>
      <div>
        <div style={{ marginBottom: 12 }}>
          <input className="input-field" placeholder="ðŸ” Mitarbeiter suchenâ€¦" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(emp => (
            <div key={emp.id} onClick={() => analyzeEmployee(emp)} className="card"
              style={{ cursor: "pointer", transition: "all 0.2s",
                borderColor: selected?.id === emp.id ? COLORS.accent : COLORS.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.accent2}, ${COLORS.accent})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{emp.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{emp.role} Â· {emp.dept}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontFamily: "IBM Plex Mono", color: COLORS.gold }}>
                    â‚¬{(emp.salary / 1000).toFixed(0)}K
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}
                    className={`tag-${emp.status}`}>{emp.status}</span>
                </div>
                <div style={{ textAlign: "center", marginLeft: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: emp.performance >= 90 ? COLORS.green : emp.performance >= 80 ? COLORS.gold : COLORS.red }}>
                    {emp.performance}
                  </div>
                  <div style={{ fontSize: 9, color: COLORS.muted }}>Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card animate-in" style={{ position: "sticky", top: 0, height: "fit-content" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.name}</div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16 }}>âœ•</button>
          </div>
          {[["Rolle", selected.role], ["Abteilung", selected.dept], ["Eingetreten", selected.joined], ["Gehalt", `â‚¬${selected.salary.toLocaleString()}`], ["Performance", `${selected.performance}/100`]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
              <span style={{ color: COLORS.muted }}>{k}</span>
              <span style={{ fontFamily: "IBM Plex Mono" }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: 12, background: COLORS.surface, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>ðŸ¤– KI-Analyse</div>
            {loading ? <span className="ai-typing" style={{ fontSize: 12, color: COLORS.muted }}>Analysiere Mitarbeiter</span>
              : <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>{aiAnalysis}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ CLIENTS MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ClientsModule = ({ clients }) => {
  const [aiPitch, setAiPitch] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const generatePitch = async (client) => {
    setLoadingId(client.id);
    try {
      const result = await API_CALL(
        "Du bist ein B2B-Marketing-Experte. Erstelle einen personalisierten Sales-Pitch auf Deutsch (max 80 WÃ¶rter).",
        `Erstelle einen Upselling-Pitch fÃ¼r diesen Kunden: ${JSON.stringify(client)}. Fokus auf konkreten Mehrwert und nÃ¤chste Schritte.`
      );
      setAiPitch(p => ({ ...p, [client.id]: result }));
    } catch { setAiPitch(p => ({ ...p, [client.id]: "Pitch nicht verfÃ¼gbar." })); }
    setLoadingId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 4 }}>
        {[
          { label: "Kunden gesamt", val: clients.length, color: COLORS.accent },
          { label: "Gesamtumsatz", val: `â‚¬${(clients.reduce((s, c) => s + c.revenue, 0) / 1000).toFixed(0)}K`, color: COLORS.green },
          { label: "Ã˜ Score", val: `${(clients.reduce((s, c) => s + c.score, 0) / clients.length).toFixed(0)}`, color: COLORS.gold },
        ].map(item => (
          <div key={item.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color, fontFamily: "IBM Plex Mono" }}>{item.val}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {clients.map(client => (
        <div key={client.id} className="card">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{client.name}</span>
                <span className={`tag-${client.status}`} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>{client.status}</span>
              </div>
              <div style={{ display: "flex", gap: 20, fontSize: 12, color: COLORS.muted }}>
                <span>ðŸ“‹ {client.industry}</span>
                <span>ðŸ‘¤ {client.contact}</span>
                <span>ðŸ“ {client.projects} Projekte</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.green, fontFamily: "IBM Plex Mono" }}>
                â‚¬{(client.revenue / 1000).toFixed(0)}K
              </div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>Jahresumsatz</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: client.score >= 90 ? COLORS.green : client.score >= 80 ? COLORS.gold : COLORS.red }}>
                {client.score}
              </div>
              <div style={{ fontSize: 10, color: COLORS.muted }}>NPS</div>
            </div>
            <button className="btn-ghost" onClick={() => generatePitch(client)} disabled={loadingId === client.id}
              style={{ fontSize: 12, whiteSpace: "nowrap" }}>
              {loadingId === client.id ? "â³ â€¦" : "ðŸ¤– KI-Pitch"}
            </button>
          </div>
          {aiPitch[client.id] && (
            <div className="animate-in" style={{ marginTop: 12, padding: 12, background: `rgba(0,200,255,0.05)`,
              border: `1px solid rgba(0,200,255,0.15)`, borderRadius: 8, fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>
              <span style={{ color: COLORS.accent, fontWeight: 700 }}>ðŸ¤– KI-Pitch: </span>{aiPitch[client.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// â”€â”€â”€ MAIN APP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [loginView, setLoginView] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState("");

  const doLogin = () => {
    if (loginEmail.includes("@") && loginPw.length >= 4) {
      setLoginView(false);
    } else {
      setLoginError("Bitte gÃ¼ltige E-Mail und Passwort (min. 4 Zeichen) eingeben.");
    }
  };

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "â¬¡" },
    { id: "hr", label: "Personalmanagement", icon: "ðŸ‘¥" },
    { id: "controlling", label: "Controlling", icon: "ðŸ“Š" },
    { id: "clients", label: "B2B Kunden", icon: "ðŸ¤" },
    { id: "ai", label: "KI-Assistent", icon: "ðŸ¤–" },
  ];

  if (loginView) return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif" }}>
      <style>{styles}</style>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: 1, background: `linear-gradient(180deg, transparent, ${COLORS.accent}40, transparent)`,
            left: `${i * 5.2}%`, top: 0, bottom: 0, opacity: 0.3 }} />
        ))}
      </div>
      <div className="animate-in" style={{ width: 400, padding: 40, background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160,
          background: `radial-gradient(circle, ${COLORS.accent}20, transparent)`, borderRadius: "50%" }} />
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>â¬¡</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>NEXUS<span style={{ color: COLORS.accent }}>HR</span></div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>KI-gestÃ¼tztes Personalmanagement & Controlling</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>E-Mail</div>
            <input className="input-field" type="email" placeholder="name@unternehmen.de" value={loginEmail}
              onChange={e => { setLoginEmail(e.target.value); setLoginError(""); }}
              onKeyDown={e => e.key === "Enter" && doLogin()} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Passwort</div>
            <input className="input-field" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={loginPw}
              onChange={e => { setLoginPw(e.target.value); setLoginError(""); }}
              onKeyDown={e => e.key === "Enter" && doLogin()} />
          </div>
          {loginError && <div style={{ fontSize: 12, color: COLORS.red }}>{loginError}</div>}
          <button className="btn-primary" onClick={doLogin} style={{ padding: "12px", marginTop: 4, fontSize: 14 }}>
            Anmelden â†’
          </button>
          <div style={{ textAlign: "center", fontSize: 11, color: COLORS.muted }}>
            Demo: beliebige E-Mail + mind. 4 Zeichen Passwort
          </div>
        </div>
      </div>
    </div>
  );

  const pageContent = {
    dashboard: <Dashboard data={DEMO_DATA} />,
    hr: <HRModule employees={DEMO_DATA.employees} />,
    controlling: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: COLORS.accent }}>ðŸ“ˆ Neueinstellungen / Monat</div>
            <BarChart data={DEMO_DATA.monthlyData} valueKey="hires" labelKey="month" height={100} />
          </div>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: COLORS.gold }}>ðŸ’° Budget-Tracking</div>
            {[["Personalentwicklung", 78, COLORS.green], ["Recruiting", 91, COLORS.accent], ["Benefits", 62, COLORS.gold], ["Weiterbildung", 45, COLORS.red]].map(([label, pct, color]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>{label}</span>
                  <span style={{ fontSize: 12, fontFamily: "IBM Plex Mono", color }}>{pct}% genutzt</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: COLORS.green }}>ðŸ¤– KI-Berichtsgenerator</div>
          <AIReportGen data={DEMO_DATA} />
        </div>
      </div>
    ),
    clients: <ClientsModule clients={DEMO_DATA.clients} />,
    ai: (
      <div className="card" style={{ height: 520, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: COLORS.green, display: "flex", alignItems: "center", gap: 8 }}>
          <span>ðŸ¤– KI-Assistent</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: "rgba(0,229,160,0.1)", color: COLORS.green, border: "1px solid rgba(0,229,160,0.2)" }}>ONLINE</span>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <AIChat context={DEMO_DATA} />
        </div>
      </div>
    ),
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", fontFamily: "Syne, sans-serif" }}>
      <style>{styles}</style>

      {/* Sidebar */}
      <div style={{ width: 220, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
        display: "flex", flexDirection: "column", padding: "20px 12px", flexShrink: 0 }}>
        <div style={{ padding: "0 4px 20px", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>NEXUS<span style={{ color: COLORS.accent }}>HR</span></div>
          <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2, fontFamily: "IBM Plex Mono" }}>v2.4.1 Â· KI-Platform</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {nav.map(item => (
            <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.accent2}, ${COLORS.accent})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {loginEmail[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {loginEmail || "Demo User"}
              </div>
              <div style={{ fontSize: 10, color: COLORS.muted }}>Administrator</div>
            </div>
          </div>
          <button className="btn-ghost" onClick={() => setLoginView(true)}
            style={{ width: "100%", marginTop: 10, fontSize: 12 }}>Abmelden</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ height: 56, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center",
          padding: "0 24px", gap: 16, background: COLORS.surface, flexShrink: 0 }}>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>
            {nav.find(n => n.id === page)?.icon} {nav.find(n => n.id === page)?.label}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: "IBM Plex Mono" }}>
              {new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: COLORS.green }}>KI aktiv</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div className="animate-in" key={page}>{pageContent[page]}</div>
        </div>
      </div>
    </div>
  );
}
