import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { useState } from “react”;
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from “recharts”;

// ── DATA ──────────────────────────────────────────────────────────────────────
const earningsData = [
  { month: “Jan”, einnahmen: 7200, klicks: 3200 },
{ month: “Feb”, einnahmen: 6800, klicks: 2900 },
{ month: “Mär”, einnahmen: 8100, klicks: 3800 },
{ month: “Apr”, einnahmen: 7600, klicks: 3400 },
{ month: “Mai”, einnahmen: 9200, klicks: 4100 },
{ month: “Jun”, einnahmen: 8800, klicks: 3900 },
{ month: “Jul”, einnahmen: 10400, klicks: 4600 },
{ month: “Aug”, einnahmen: 11200, klicks: 5100 },
{ month: “Sep”, einnahmen: 10800, klicks: 4800 },
{ month: “Okt”, einnahmen: 12100, klicks: 5400 },
{ month: “Nov”, einnahmen: 11600, klicks: 5200 },
{ month: “Dez”, einnahmen: 12847, klicks: 5800 },
];

const links = [
  { id: 1, name: “Amazon Produktbewertung”, url: “amzn.to / 3xK9pL2”, klicks: 1842, konversionen: 127, einnahmen: 4820, status: “aktiv”, programm: “Amazon” },
{ id: 2, name: “Shopify Free Trial”, url: “shopify.pxf.io / ref”, klicks: 934, konversionen: 48, einnahmen: 3210, status: “aktiv”, programm: “Shopify” },
{ id: 3, name: “ClickBank eBook”, url: “cb.com / hop / ref123”, klicks: 612, konversionen: 31, einnahmen: 2640, status: “pausiert”, programm: “ClickBank” },
{ id: 4, name: “ShareASale Promo”, url: “shareasale.com / r / x”, klicks: 405, konversionen: 19, einnahmen: 1480, status: “aktiv”, programm: “ShareASale” },
{ id: 5, name: “Fiverr Empfehlung”, url: “fvrr.co / ref456”, klicks: 289, konversionen: 12, einnahmen: 890, status: “aktiv”, programm: “Fiverr” },
];

const provisionen = [
  { datum: “29.04.2026”, programm: “Amazon Associates”, typ: “Provision”, betrag: 142.50, status: “bezahlt” },
{ datum: “28.04.2026”, programm: “Shopify Partners”, typ: “Provision”, betrag: 89.00, status: “bezahlt” },
{ datum: “27.04.2026”, programm: “ClickBank”, typ: “Provision”, betrag: 56.20, status: “ausstehend” },
{ datum: “26.04.2026”, programm: “ShareASale”, typ: “Provision”, betrag: 34.80, status: “bezahlt” },
{ datum: “25.04.2026”, programm: “Amazon Associates”, typ: “Provision”, betrag: 198.40, status: “bezahlt” },
{ datum: “24.04.2026”, programm: “Fiverr”, typ: “Provision”, betrag: 25.00, status: “ausstehend” },
];

const topPrograms = [
  { name: “Amazon Associates”, einnahmen: 4820, pct: 75, farbe: “#f97316” },
{ name: “Shopify Partners”, einnahmen: 3210, pct: 55, farbe: “#10b981” },
{ name: “ClickBank”, einnahmen: 2640, pct: 42, farbe: “#3b82f6” },
{ name: “ShareASale”, einnahmen: 1480, pct: 28, farbe: “#8b5cf6” },
{ name: “Fiverr”, einnahmen: 890, pct: 18, farbe: “#ec4899” },
];

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const navItems = [
  { id: “dashboard”, label: “Dashboard”, icon: “⊞” },
{ id: “links”, label: “Links”, icon: “⛓” },
{ id: “analysen”, label: “Analysen”, icon: “📊” },
{ id: “provisionen”, label: “Provisionen”, icon: “💲” },
{ id: “einstellungen”, label: “Einstellungen”, icon: “⚙” },
];

const S = {
  sidebar: { width: 220, background: “#fff”, display: “flex”, flexDirection: “column”, borderRight: “1px solid #e2ebe8”, padding: “24px 0”, flexShrink: 0 },
  logo: { padding: “0 20px 28px”, display: “flex”, alignItems: “center”, gap: 10 },
  logoIcon: { width: 34, height: 34, borderRadius: 10, background: “linear- gradient(135deg,#0d9660,#10b981)”, display: “flex”, alignItems: “center”, justifyContent: “center”, color: “#fff”, fontSize: 16, fontWeight: 700
},
  main: { flex: 1, padding: “32px 36px”, overflowY: “auto”, background: “#f0f4f3” },
card: { background: “#fff”, borderRadius: 14, padding: “20px 22px”, border: “1px solid #e2ebe8”, boxShadow: “0 1px 4px rgba(0, 0, 0, 0.04)” },
};

function Sidebar({ active, setActive }) {
  return (
<aside style={S.sidebar}>
<div style={S.logo}>
<div style={S.logoIcon}>A</div>
<span style={{ fontWeight: 700, fontSize: 16 }}>AffiliateHub</span>
</div>
<nav style={{ flex: 1 }}>
{navItems.map(item => (
<button key={item.id} onClick={() => setActive(item.id)} style={{
display: “flex”, alignItems: “center”, gap: 10, width: “100%”,
padding: “10px 20px”, border: “none”,
background: active === item.id ? “#eaf7f2” : “transparent”,
color: active === item.id ? “#0d9660” : “#4a6b62”,
fontWeight: active === item.id ? 600 : 400, fontSize: 14,
cursor: “pointer”, borderLeft: active === item.id ? “3px solid #0d9660” : “3px solid transparent”,
textAlign: “left”, fontFamily: “inherit”
}}>
<span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
</button>
))}
</nav>
<div style={{ padding: “0 16px” }}>
<div style={{ background: “linear-gradient(135deg,#0d9660,#10b981)”, borderRadius: 12, padding: “14px 16px”, color: “#fff”, marginBottom: 16 }}>
<div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Auf Pro upgraden</div>
<div style={{ fontSize: 11, opacity: 0.75, marginBottom: 10 }}>Erweiterte Analysen & höhere Provisionssätze</div>
<button style={{ background: “#fff”, color: “#0d9660”, border: “none”, borderRadius: 7, padding: “6px 14px”, fontSize: 12, fontWeight: 700, cursor: “pointer”, width: “100%”, fontFamily: “inherit” }}>
Jetzt upgraden
</button>
</div >
    <button onClick={() => setActive(“einstellungen”)} style={{ display: “block”, width: “100%”, background: “none”, border: “none”, padding: “8px 4px”, color: “#4a6b62”, fontSize: 13, cursor: “pointer”, textAlign: “left”, fontFamily: “inherit” }}>
      ⎋ Abmelden
    </button>
</div >
</aside >
);
}

// ── DASHBOARD PAGE ─────────────────────────────────────────────────────────
function Dashboard() {
  return (
<main style={S.main}>
<div style={{ marginBottom: 28 }}>
<h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Dashboard</h1>
<p style={{ color: “#4a6b62”, margin: “4px 0 0”, fontSize: 14 }}>Willkommen zurück, Alex — hier sind deine heutigen Einnahmen.</p>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(4,1fr)”, gap: 16, marginBottom: 24 }}>
{[
{ label: “Gesamteinnahmen”, value: “12.847,50 €”, delta: “+23,5%”, pos: true, icon: “💲” },
{ label: “Gesamtklicks”, value: “48.293”, delta: “+12,3%”, pos: true, icon: “🖱” },
{ label: “Konversionen”, value: “1.429”, delta: “+8,1%”, pos: true, icon: “✅” },
{ label: “Empfehlungen”, value: “847”, delta: “-2,4%”, pos: false, icon: “👥” },
].map(s => (
<div key={s.label} style={S.card}>
<div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: 10 }}>
<span style={{ fontSize: 12, color: “#4a6b62”, fontWeight: 500 }}>{s.label}</span>
<span style={{ fontSize: 18 }}>{s.icon}</span>
</div>
<div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{s.value}</div>
<div style={{ fontSize: 12, color: s.pos ? “#10b981” : “#ef4444”, fontWeight: 500 }}>
{s.pos ? “↗” : “↘”} {s.delta} ggü. Vormonat
</div>
</div >
))
}
</div >
<div style={{ display: “grid”, gridTemplateColumns: “1fr 300px”, gap: 16, marginBottom: 24 }}>
<div style={S.card}>
<div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Einnahmenübersicht</div>
<div style={{ fontSize: 12, color: “#4a6b62”, marginBottom: 16 }}>Monatliche Einnahmen der letzten 12 Monate</div>
<ResponsiveContainer width="100%" height={200}>
<AreaChart data={earningsData}>
<defs>
<linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
</linearGradient>
</defs>
<XAxis dataKey=“month” tick={{ fontSize: 11, fill: “#9cb5ae” }} axisLine={false} tickLine={false} />
<YAxis tick={{ fontSize: 11, fill: “#9cb5ae” }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
<Tooltip formatter={v => [`${v.toLocaleString()} €`, “Einnahmen”]} contentStyle={{ borderRadius: 8, border: “none”, boxShadow: “0 4px 12px rgba(0,0,0,.1)”, fontSize: 12 }} />
<Area type="monotone" dataKey="einnahmen" stroke="#10b981" strokeWidth={2.5} fill="url(#g1)" dot={false} />
</AreaChart>
</ResponsiveContainer>
</div>
<div style={S.card}>
<div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Top Programme</div>
{topPrograms.map(p => (
<div key={p.name} style={{ marginBottom: 14 }}>
<div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: 5 }}>
<span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</span>
<span style={{ fontSize: 12, fontWeight: 700, color: “#0d9660” }}>{p.einnahmen.toLocaleString()} €</span>
</div>
<div style={{ height: 6, borderRadius: 99, background: “#e8f3ef” }}>
<div style={{ width: `${p.pct}%`, height: “100%”, borderRadius: 99, background: p.farbe }} />
</div>
</div >
))}
</div >
</div >
</main >
);
}

// ── LINKS PAGE ────────────────────────────────────────────────────────────────
function Links() {
  const [search, setSearch] = useState(””);
  const filtered = links.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
  return (
<main style={S.main}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 28 }}>
<div>
<h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Affiliate Links</h1>
<p style={{ color: “#4a6b62”, margin: “4px 0 0”, fontSize: 14 }}>Verwalte und tracke deine Links</p>
</div>
<button style={{ background: “#0d9660”, color: “#fff”, border: “none”, borderRadius: 10, padding: “10px 20px”, fontSize: 14, fontWeight: 600, cursor: “pointer”, fontFamily: “inherit” }}>
+ Neuer Link
</button>
</div >
<div style={{ …S.card, marginBottom: 16 }}>
<input value={search} onChange={e => setSearch(e.target.value)}
placeholder=“🔍 Links durchsuchen…”
style={{ width: “100%”, padding: “10px 14px”, border: “1px solid #e2ebe8”, borderRadius: 8, fontSize: 14, outline: “none”, fontFamily: “inherit”, boxSizing: “border-box” }} />
</div>
<div style={S.card}>
<table style={{ width: “100%”, borderCollapse: “collapse”, fontSize: 13 }}>
<thead>
<tr style={{ borderBottom: “1px solid #e2ebe8” }}>
{[“Name”, “URL”, “Klicks”, “Konversionen”, “Einnahmen”, “Status”, “”].map(h => (
<th key={h} style={{ textAlign: “left”, padding: “0 12px 12px 0”, color: “#4a6b62”, fontWeight: 600, fontSize: 12 }}>{h}</th>
))}
</tr>
</thead >
<tbody>
{filtered.map(link => (
<tr key={link.id} style={{ borderBottom: “1px solid #f0f4f3” }}>
<td style={{ padding: “12px 12px 12px 0”, fontWeight: 600 }}>{link.name}</td>
<td style={{ padding: “12px 12px 12px 0”, color: “#4a6b62”, fontSize: 12 }}>{link.url}</td>
<td style={{ padding: “12px 12px 12px 0” }}>{link.klicks.toLocaleString()}</td>
<td style={{ padding: “12px 12px 12px 0” }}>{link.konversionen}</td>
<td style={{ padding: “12px 12px 12px 0”, fontWeight: 600, color: “#0d9660” }}>{link.einnahmen.toLocaleString()} €</td>
<td style={{ padding: “12px 12px 12px 0” }}>
<span style={{ padding: “3px 10px”, borderRadius: 99, fontSize: 11, fontWeight: 600, background: link.status === “aktiv” ? “#eaf7f2” : “#fef3cd”, color: link.status === “aktiv” ? “#0d9660” : “#b45309” }}>
{link.status}
</span>
</td >
    <td style={{ padding: “12px 0” }}>
      <button style={{ background: “none”, border: “1px solid #e2ebe8”, borderRadius: 6, padding: “4px 10px”, fontSize: 11, cursor: “pointer”, color: “#4a6b62”, fontFamily: “inherit” }}>
      Kopieren
    </button>
</td >
</tr >
))
}
</tbody >
</table >
</div >
</main >
);
}

// ── ANALYSEN PAGE ─────────────────────────────────────────────────────────────
function Analysen() {
  return (
<main style={S.main}>
<div style={{ marginBottom: 28 }}>
<h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Analysen</h1>
<p style={{ color: “#4a6b62”, margin: “4px 0 0”, fontSize: 14 }}>Detaillierte Statistiken deiner Performance</p>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(3,1fr)”, gap: 16, marginBottom: 24 }}>
{[
{ label: “Konversionsrate”, value: “2,96%”, sub: “Klicks → Käufe”, color: “#10b981” },
{ label: “Ø Einnahmen/Klick”, value: “0,27 €”, sub: “Pro Klick”, color: “#3b82f6” },
{ label: “Bester Monat”, value: “Dez 2025”, sub: “12.847 € Einnahmen”, color: “#f59e0b” },
].map(s => (
<div key={s.label} style={{ …S.card, borderTop: `3px solid ${s.color}` }}>
<div style={{ fontSize: 12, color: “#4a6b62”, marginBottom: 8 }}>{s.label}</div>
<div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
<div style={{ fontSize: 12, color: “#9cb5ae” }}>{s.sub}</div>
</div >
))
}
</div >
  <div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 16 }}>
    <div style={S.card}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Klicks vs. Einnahmen</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={earningsData.slice(-6)}>
          <XAxis dataKey=“month” tick={{ fontSize: 11, fill: “#9cb5ae” }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: “#9cb5ae” }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: “none”, boxShadow: “0 4px 12px rgba(0,0,0,.1)”, fontSize: 12 }} />
          <Bar dataKey="einnahmen" fill="#10b981" radius={[4, 4, 0, 0]} name="Einnahmen (€)" />
          <Bar dataKey="klicks" fill="#e2ebe8" radius={[4, 4, 0, 0]} name="Klicks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div style={S.card}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Programme Vergleich</div>
      {topPrograms.map((p, i) => (
        <div key={p.name} style={{ display: “flex”, alignItems: “center”, gap: 12, marginBottom: 14 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: p.farbe, display: “flex”, alignItems: “center”, justifyContent: “center”, color: “#fff”, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      {i + 1}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
      <span style={{ fontSize: 13, fontWeight: 700 }}>{p.einnahmen.toLocaleString()} €</span>
    </div>
    <div style={{ height: 5, borderRadius: 99, background: “#e8f3ef” }}>
    <div style={{ width: `${p.pct}%`, height: “100%”, borderRadius: 99, background: p.farbe }} />
  </div>
</div >
</div >
))}
</div >
</div >
</main >
);
}

// ── PROVISIONEN PAGE ──────────────────────────────────────────────────────────
function Provisionen() {
  return (
<main style={S.main}>
<div style={{ marginBottom: 28 }}>
<h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Provisionen</h1>
<p style={{ color: “#4a6b62”, margin: “4px 0 0”, fontSize: 14 }}>Übersicht deiner Einnahmen und Auszahlungen</p>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(3,1fr)”, gap: 16, marginBottom: 24 }}>
{[
{ label: “Gesamt bezahlt”, value: “11.420,70 €”, icon: “✅”, color: “#10b981” },
{ label: “Ausstehend”, value: “1.426,80 €”, icon: “⏳”, color: “#f59e0b” },
{ label: “Nächste Auszahlung”, value: “01.05.2026”, icon: “📅”, color: “#3b82f6” },
].map(s => (
<div key={s.label} style={S.card}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 10 }}>
<span style={{ fontSize: 12, color: “#4a6b62” }}>{s.label}</span>
<span style={{ fontSize: 20 }}>{s.icon}</span>
</div>
<div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
</div >
))
}
</div >
  <div style={S.card}>
    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Transaktionshistorie</div>
    <table style={{ width: “100%”, borderCollapse: “collapse”, fontSize: 13 }}>
    <thead>
      <tr style={{ borderBottom: “1px solid #e2ebe8” }}>
      {[“Datum”, “Programm”, “Typ”, “Betrag”, “Status”].map(h => (
      <th key={h} style={{ textAlign: “left”, padding: “0 12px 12px 0”, color: “#4a6b62”, fontWeight: 600, fontSize: 12 }}>{h}</th>
))}
  </tr>
</thead >
<tbody>
{provisionen.map((p, i) => (
<tr key={i} style={{ borderBottom: “1px solid #f0f4f3” }}>
<td style={{ padding: “12px 12px 12px 0”, color: “#4a6b62” }}>{p.datum}</td>
<td style={{ padding: “12px 12px 12px 0”, fontWeight: 500 }}>{p.programm}</td>
<td style={{ padding: “12px 12px 12px 0”, color: “#4a6b62” }}>{p.typ}</td>
<td style={{ padding: “12px 12px 12px 0”, fontWeight: 700, color: “#0d9660” }}>+{p.betrag.toFixed(2)} €</td>
<td style={{ padding: “12px 0” }}>
<span style={{ padding: “3px 10px”, borderRadius: 99, fontSize: 11, fontWeight: 600, background: p.status === “bezahlt” ? “#eaf7f2” : “#fef3cd”, color: p.status === “bezahlt” ? “#0d9660” : “#b45309” }}>
{p.status}
</span>
</td >
</tr >
))}
</tbody >
</table >
</div >
</main >
);
}

// ── EINSTELLUNGEN PAGE ────────────────────────────────────────────────────────
function Einstellungen() {
  const [name, setName] = useState(“Alex Müller”);
  const [email, setEmail] = useState(“alex@affiliatehub.de”);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
<main style={S.main}>
<div style={{ marginBottom: 28 }}>
<h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Einstellungen</h1>
<p style={{ color: “#4a6b62”, margin: “4px 0 0”, fontSize: 14 }}>Dein Profil und Kontoeinstellungen</p>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 16 }}>
<div style={S.card}>
<div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Profil</div>
{[
{ label: “Vollständiger Name”, value: name, setter: setName },
{ label: “E-Mail Adresse”, value: email, setter: setEmail },
].map(f => (
<div key={f.label} style={{ marginBottom: 16 }}>
<label style={{ fontSize: 12, fontWeight: 600, color: “#4a6b62”, display: “block”, marginBottom: 6 }}>{f.label}</label>
<input value={f.value} onChange={e => f.setter(e.target.value)}
style={{ width: “100%”, padding: “10px 12px”, border: “1px solid #e2ebe8”, borderRadius: 8, fontSize: 14, fontFamily: “inherit”, outline: “none”, boxSizing: “border-box” }} />
</div>
))}
<button onClick={save} style={{ background: saved ? “#10b981” : “#0d9660”, color: “#fff”, border: “none”, borderRadius: 8, padding: “10px 20px”, fontSize: 14, fontWeight: 600, cursor: “pointer”, fontFamily: “inherit”, transition: “background 0.3s” }}>
{saved ? “✅ Gespeichert!” : “Speichern”}
</button>
</div >
<div style={S.card}>
<div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Benachrichtigungen</div>
{[
{ label: “Neue Provision erhalten”, desc: “Benachrichtigung bei jeder neuen Provision” },
{ label: “Wöchentlicher Bericht”, desc: “Zusammenfassung jede Woche per E-Mail” },
{ label: “Link-Performance Alarm”, desc: “Alert wenn ein Link ungewöhnlich performt” },
].map((n, i) => (
<div key={i} style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, padding: “12px 0”, borderBottom: i < 2 ? “1px solid #f0f4f3” : “none” }}>
<div>
<div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div>
<div style={{ fontSize: 12, color: “#9cb5ae”, marginTop: 2 }}>{n.desc}</div>
</div>
<div style={{ width: 40, height: 22, borderRadius: 99, background: i === 2 ? “#e2ebe8” : “#10b981”, position: “relative”, cursor: “pointer”, flexShrink: 0 }}>
<div style={{ width: 18, height: 18, borderRadius: “50%”, background: “#fff”, position: “absolute”, top: 2, left: i === 2 ? 2 : 20, transition: “left 0.2s” }} />
</div>
</div >
))
}
</div >
<div style={S.card}>
<div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Sicherheit</div>
<div style={{ marginBottom: 16 }}>
<label style={{ fontSize: 12, fontWeight: 600, color: “#4a6b62”, display: “block”, marginBottom: 6 }}>Passwort ändern</label>
<input type=“password” placeholder=“Neues Passwort”
style={{ width: “100%”, padding: “10px 12px”, border: “1px solid #e2ebe8”, borderRadius: 8, fontSize: 14, fontFamily: “inherit”, outline: “none”, boxSizing: “border-box” }} />
</div>
<button style={{ background: “none”, border: “1px solid #e2ebe8”, color: “#4a6b62”, borderRadius: 8, padding: “10px 20px”, fontSize: 14, cursor: “pointer”, fontFamily: “inherit” }}>
Passwort aktualisieren
</button>
</div >
<div style={{ …S.card, border: “1px solid #fee2e2” }}>
<div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: “#ef4444” }}>⚠️ Gefahrenzone</div>
<p style={{ fontSize: 13, color: “#4a6b62”, marginBottom: 16 }}>Diese Aktionen können nicht rückgängig gemacht werden.</p>
<button style={{ background: “#ef4444”, color: “#fff”, border: “none”, borderRadius: 8, padding: “10px 20px”, fontSize: 14, fontWeight: 600, cursor: “pointer”, fontFamily: “inherit” }}>
Konto löschen
</button>
</div >
</div >
</main >
);
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(“dashboard”);
  const pages = { dashboard: <Dashboard />, links: <Links />, analysen: <Analysen />, provisionen: <Provisionen />, einstellungen: <Einstellungen /> };

  return (
    <div style={{ display: “flex”, minHeight: “100vh”, fontFamily: “‘DM Sans’,‘Segoe UI’, sans- serif”, color: “#1a2e2a” }}>
      <Sidebar active={page} setActive={setPage} />
{ pages[page] }
</div >
);
} clerk a Cd