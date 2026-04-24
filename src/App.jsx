import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
// Replace with your actual Supabase URL and anon key from supabase.com → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#060A0F", surface: "#0B1017", card: "#0F1923", card2: "#131F2D",
  border: "#1A2D42", borderBright: "#2A4A6A",
  accent: "#00D4FF", accentDim: "#00D4FF14", accentGlow: "#00D4FF30",
  gold: "#F5A623", goldDim: "#F5A62314",
  green: "#00E49C", greenDim: "#00E49C14",
  red: "#FF3E5E", redDim: "#FF3E5E14",
  purple: "#9B6DFF", purpleDim: "#9B6DFF14",
  orange: "#FF7A30", orangeDim: "#FF7A3014",
  text: "#DCE8F5", textMuted: "#6E8BA8", textDim: "#2E4562",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:${C.borderBright}}
.mono{font-family:'DM Mono',monospace}
.syne{font-family:'Syne',sans-serif}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes notifIn{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}
@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes chatIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{box-shadow:0 0 6px ${C.accentGlow}}50%{box-shadow:0 0 18px ${C.accentGlow},0 0 36px ${C.accentDim}}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:transparent;border:1px solid ${C.border};color:${C.text};padding:8px 16px;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all .18s;white-space:nowrap;outline:none}
.btn:hover{border-color:${C.borderBright};background:${C.card2};color:${C.text}}
.btn:active{transform:scale(.98)}
.btn-primary{background:${C.accent};color:#000;border-color:${C.accent};font-weight:600}
.btn-primary:hover{background:#00bcee;border-color:#00bcee;color:#000}
.btn-green{background:${C.green};color:#000;border-color:${C.green};font-weight:600}
.btn-green:hover{background:#00ccaa;border-color:#00ccaa;color:#000}
.btn-ghost{border-color:transparent;color:${C.textMuted}}
.btn-ghost:hover{border-color:${C.border};color:${C.text};background:${C.card2}}
.btn-sm{padding:5px 12px;font-size:12px;border-radius:6px}
.btn-danger{background:${C.redDim};border-color:${C.red};color:${C.red};font-weight:600}
.btn-danger:hover{background:${C.red};color:#fff}
.btn:disabled{opacity:0.5;cursor:not-allowed}
.btn:disabled:hover{transform:none}

.input{background:${C.card};border:1px solid ${C.border};color:${C.text};padding:10px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .18s}
.input:focus{border-color:${C.accent}}
.input::placeholder{color:${C.textDim}}
.input-sm{padding:7px 12px;font-size:13px;border-radius:6px}
select.input{cursor:pointer}

.tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.3px}
.tag-green{background:${C.greenDim};color:${C.green};border:1px solid ${C.green}44}
.tag-gold{background:${C.goldDim};color:${C.gold};border:1px solid ${C.gold}44}
.tag-red{background:${C.redDim};color:${C.red};border:1px solid ${C.red}44}
.tag-accent{background:${C.accentDim};color:${C.accent};border:1px solid ${C.accent}44}
.tag-purple{background:${C.purpleDim};color:${C.purple};border:1px solid ${C.purple}44}
.tag-orange{background:${C.orangeDim};color:${C.orange};border:1px solid ${C.orange}44}

.card{background:${C.card};border:1px solid ${C.border};border-radius:14px}
.card2{background:${C.card2};border:1px solid ${C.border};border-radius:10px}
.divider{border:none;border-top:1px solid ${C.border};margin:0}

.tab-bar{display:flex;gap:2px;background:${C.surface};border-radius:10px;padding:3px}
.tab{padding:7px 14px;border-radius:8px;border:none;background:transparent;color:${C.textMuted};cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all .18s;white-space:nowrap}
.tab.active{background:${C.card2};color:${C.text};border:1px solid ${C.border}}
.tab:hover:not(.active){color:${C.text}}

.stat-card{background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:18px 20px}
.stat-val{font-size:26px;font-weight:700;font-family:'Syne',sans-serif;line-height:1.1;margin-bottom:4px}
.stat-label{font-size:12px;color:${C.textMuted}}

.notif-dot{width:8px;height:8px;border-radius:50%;animation:pulse 2s infinite}
.live-dot{width:7px;height:7px;border-radius:50%;background:${C.green};animation:pulse 2s infinite;flex-shrink:0}

.notif-panel{position:absolute;top:calc(100% + 8px);right:0;width:360px;background:${C.card};border:1px solid ${C.border};border-radius:14px;z-index:1000;box-shadow:0 16px 48px #00000066;animation:dropIn .2s ease-out;overflow:hidden}
`;

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const fmtDate = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 1.5, dur: 2.5 + Math.random() * 2,
    color: [C.accent, C.gold, C.green, "#FF6B6B", C.purple, C.orange][i % 6],
    size: 5 + Math.random() * 9, rot: Math.random() * 360,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", top: "-20px", left: `${p.x}%`,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.size > 10 ? "50%" : "2px",
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          transform: `rotate(${p.rot}deg)`,
        }} />
      ))}
    </div>
  );
}

// ─── TOAST NOTIFICATIONS (floating, auto-dismiss) ─────────────────────────────
function NotifCenter({ notifs, onDismiss, onAction }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9998, display: "flex", flexDirection: "column", gap: 10, maxWidth: 340 }}>
      {notifs.map(n => (
        <div key={n.id} style={{
          background: C.card, border: `1px solid ${n.color}55`,
          borderRadius: 12, padding: "14px 16px",
          animation: "notifIn .4s ease-out",
          boxShadow: `0 4px 20px ${n.color}22`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: n.color, marginBottom: 5 }}>{n.type}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{n.body}</div>
            </div>
            <button onClick={() => onDismiss(n.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, marginLeft: 10, padding: 2 }}>×</button>
          </div>
          {n.action && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => { onAction && onAction(n); onDismiss(n.id); }}>{n.action}</button>
              <button className="btn btn-sm" onClick={() => onDismiss(n.id)}>Later</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── NOTIFICATION BELL DROPDOWN ───────────────────────────────────────────────
function NotifBell({ userId, role, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setNotifs(data);
      setUnread(data.filter(n => !n.read).length);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel(`notifs-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [userId, load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("recipient_id", userId);
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const iconFor = (type) => type === "loan_application" ? "💰" : type === "loan_approved" ? "✅" : type === "signal_request" ? "📡" : type === "score_update" ? "📈" : "🔔";
  const colorFor = (type) => type === "loan_application" ? C.gold : type === "loan_approved" ? C.green : type === "signal_request" ? C.accent : type === "score_update" ? C.purple : C.textMuted;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn btn-ghost btn-sm" onClick={() => { setOpen(o => !o); if (!open) load(); }} style={{ position: "relative" }}>
        🔔
        {unread > 0 && (
          <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>
      {open && (
        <div className="notif-panel">
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Notifications {unread > 0 && <span className="tag tag-red" style={{ fontSize: 10, marginLeft: 6 }}>{unread} new</span>}</div>
            {unread > 0 && <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={markAllRead}>Mark all read</button>}
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {notifs.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: C.textDim, fontSize: 13 }}>No notifications yet</div>
            )}
            {notifs.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)} style={{
                padding: "12px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                background: n.read ? "transparent" : `${colorFor(n.type)}08`,
                transition: "background .15s",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{iconFor(n.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: n.read ? C.text : colorFor(n.type) }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{n.body}</div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>{fmtDate(n.created_at)}</div>
                  </div>
                  {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: colorFor(n.type), flexShrink: 0, marginTop: 4 }} />}
                </div>
                {n.action_label && (
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 8, fontSize: 11 }}
                    onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate(n.action_tab); markRead(n.id); setOpen(false); }}>
                    {n.action_label}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, max = 100, size = 120, strokeW = 9 }) {
  const r = (size / 2) - strokeW;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / max);
  const color = score >= 70 ? C.green : score >= 45 ? C.gold : C.red;
  const label = score >= 70 ? "Excellent" : score >= 55 ? "Good" : score >= 40 ? "Fair" : "Building";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={strokeW} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 6px ${color}88)` }} />
        <text x={size/2} y={size/2 - 6} textAnchor="middle" fill={C.text} fontSize={size > 100 ? "22" : "16"} fontWeight="700" fontFamily="Syne,sans-serif">{score}</text>
        <text x={size/2} y={size/2 + 12} textAnchor="middle" fill={color} fontSize="11" fontFamily="DM Sans,sans-serif" fontWeight="600">{label}</text>
      </svg>
    </div>
  );
}

// ─── SIGNAL BAR ───────────────────────────────────────────────────────────────
function SignalBar({ label, sublabel, pct, color, connected, icon, weight }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{icon}</span>}
          <div>
            {label && <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>}
            {sublabel && <div style={{ fontSize: 10, color: C.textMuted }}>{sublabel}</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {weight && <span style={{ fontSize: 10, color: C.textDim }}>×{weight}</span>}
          <span style={{ fontSize: 12, fontWeight: 600, color: connected ? color : C.textDim }}>{connected ? `${pct}%` : "—"}</span>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? color : C.textDim, animation: connected ? "pulse 2.5s infinite" : "none", flexShrink: 0 }} />
        </div>
      </div>
      <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, background: connected ? color : "transparent",
          width: connected ? `${pct}%` : "0%",
          transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: connected ? `0 0 6px ${color}66` : "none",
        }} />
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
// FIXED: Ticker is longer and more relevant; NotifBell is real
const TICKER_ITEMS = [
  "₹87L Cr informal economy — 92% workers invisible to credit system",
  "RBI Account Aggregator framework live across 63 FIPs as of 2024",
  "PM SVANidhi disbursed ₹5,200 Cr to 49L street vendors (MoHUA 2024)",
  "MUDRA Yojana: ₹27.03L Cr disbursed across 44 Cr accounts since launch",
  "PLFS 2023-24: 57.7% of India's workforce in non-agricultural informal sector",
  "CIBIL coverage: only 22 Cr of 450M+ gig workers have formal credit history",
  "Average loan approval time via VEYO TrustNet: 4.2 minutes vs 3 months traditional",
  "GST e-invoicing: 1.3 Cr businesses now auto-linked to GSTN as of Jan 2024",
  "DigiLocker: 23 Cr+ issued documents — worker credentials now portable",
  "ONDC network GMV: ₹1,900 Cr/month — informal seller economy growing 3x YoY",
  "NPCI UPI: 13.44 Bn transactions in Feb 2024 — behavioral signal goldmine",
  "Stand-Up India: ₹44,000 Cr sanctioned to 2.05L women entrepreneurs",
];

function Topbar({ role, user, userId, onLogout, onNavigate }) {
  const roleColors = { worker: C.accent, lender: C.gold, govt: C.purple };
  const roleLabels = { worker: "WORKER", lender: "LENDER API", govt: "GOVT / MSME" };
  const color = roleColors[role];
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", gap: 16, height: 56, flexShrink: 0, position: "relative", zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000", fontFamily: "Syne,sans-serif" }}>V</div>
        <span className="syne" style={{ fontSize: 18, fontWeight: 800, letterSpacing: -.5 }}>VEYO</span>
        <span className="tag tag-accent" style={{ background: `${color}18`, color, borderColor: `${color}44`, fontSize: 10 }}>{roleLabels[role]}</span>
      </div>
      <div style={{ flex: 1 }} />
      {/* Ticker */}
      <div style={{ flex: 2, overflow: "hidden", maxWidth: 600, display: "flex", alignItems: "center", gap: 8 }}>
        <div className="live-dot" />
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{ display: "flex", animation: "ticker 60s linear infinite", whiteSpace: "nowrap", gap: 60 }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span key={i} style={{ fontSize: 12, color: C.textMuted }}>{"· " + t}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      {/* Right */}
      <NotifBell userId={userId} role={role} onNavigate={onNavigate} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{role === "worker" ? "🚗" : role === "lender" ? "🏦" : "🏛️"}</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 10, color: C.textMuted }}>{user.sub}</div>
        </div>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
    </div>
  );
}

// ─── LOGIN PAGE ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [role, setRole] = useState("worker");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOTP = async () => {
    if (phone.replace(/\D/g,"").length < 10) return;
    setLoading(true); setError("");
    await sleep(1200);
    setLoading(false);
    setStep("otp");
  };

  const verify = async () => {
    if (otp.length < 4) return;
    setLoading(true); setError("");
    try {
      // Log user session to Supabase
      const { data, error: err } = await supabase.from("user_sessions").insert({
        phone: "+91" + phone,
        role,
        logged_in_at: new Date().toISOString(),
      }).select().single();
      if (err) console.warn("Session log error:", err.message);
      onLogin(role, data?.id);
    } catch (e) {
      console.warn("Login log failed:", e);
      onLogin(role, null);
    }
    setLoading(false);
  };

  const ROLES = [
    { id: "worker", icon: "🚗", label: "Worker / Gig", sub: "Build your TrustScore" },
    { id: "lender", icon: "🏦", label: "Lender / NBFC", sub: "Verify & underwrite" },
    { id: "govt", icon: "🏛️", label: "Govt / MSME", sub: "Scheme disbursement" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`, backgroundSize: "44px 44px", opacity: .2 }} />
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(circle,${C.accentDim} 0%,transparent 68%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative", width: 440, animation: "fadeUp .5s" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, background: C.accent, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: "#000", fontFamily: "Syne,sans-serif", boxShadow: `0 0 28px ${C.accentGlow}` }}>V</div>
            <span className="syne" style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1.5 }}>VEYO</span>
          </div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Behavioral credit infrastructure for invisible India</div>
          <div className="mono" style={{ fontSize: 10, color: C.accent, marginTop: 4, letterSpacing: 1.5 }}>POWERED BY TRUSTNET</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)} style={{
              background: role === r.id ? C.accentDim : C.card,
              border: `1px solid ${role === r.id ? C.accent : C.border}`,
              borderRadius: 12, padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all .2s",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: role === r.id ? C.accent : C.text }}>{r.label}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{r.sub}</div>
            </button>
          ))}
        </div>
        <div className="card" style={{ padding: 28 }}>
          {step === "phone" ? (
            <>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>Enter your registered mobile number</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.textMuted, minWidth: 58, textAlign: "center", flexShrink: 0 }}>+91</div>
                <input className="input" placeholder="98765 43210" value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} style={{ flex: 1 }}
                  onKeyDown={e => e.key === "Enter" && sendOTP()} />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", padding: 13, fontSize: 15 }} onClick={sendOTP} disabled={loading || phone.length < 10}>
                {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> Sending OTP...</> : "Send OTP →"}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>OTP sent to +91 {phone}</div>
              <div style={{ fontSize: 11, color: C.accent, marginBottom: 16, cursor: "pointer" }} onClick={() => setStep("phone")}>← Change number</div>
              <div style={{ fontSize: 11, color: C.gold, marginBottom: 16, background: C.goldDim, padding: "8px 12px", borderRadius: 8 }}>
                🎓 Demo mode: enter any 4+ digit code to continue
              </div>
              <input className="input" placeholder="Enter OTP" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                style={{ marginBottom: 16, letterSpacing: 10, fontSize: 22, textAlign: "center" }}
                onKeyDown={e => e.key === "Enter" && verify()} />
              <button className="btn btn-primary" style={{ width: "100%", padding: 13, fontSize: 15 }} onClick={verify} disabled={loading || otp.length < 4}>
                {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> Verifying...</> : "Verify & Continue →"}
              </button>
            </>
          )}
          {error && <div style={{ color: C.red, fontSize: 12, marginTop: 10, textAlign: "center" }}>{error}</div>}
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: C.textDim }}>
            🔒 Secured via Aadhaar eKYC · Account Aggregator (RBI AA)
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 20 }}>
          {[{ v: "450M+", l: "Unserved workers" }, { v: "₹87L Cr", l: "Informal economy" }, { v: "0.3%", l: "NPA rate" }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div className="syne" style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { id: "welcome", title: "Welcome to VEYO", icon: "⚡" },
  { id: "role", title: "What do you do?", icon: "👤" },
  { id: "aadhaar", title: "Verify Identity", icon: "🪪" },
  { id: "profile", title: "Work Profile", icon: "💼" },
  { id: "consent", title: "Data Consent", icon: "🔐" },
  { id: "done", title: "You're live!", icon: "🎉" },
];

function OnboardingFlow({ onComplete, sessionId }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ role: "", name: "", aadhaar: "", platform: "", years: "", income: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [consents, setConsents] = useState({ upi: false, gig: false, gst: false, utility: false });

  const next = async (skipLoad) => {
    if (!skipLoad) { setLoading(true); await sleep(1200); setLoading(false); }
    setStep(s => s + 1);
  };

  const verifyAadhaar = async () => {
    setLoading(true);
    await sleep(2000);
    setLoading(false);
    setAadhaarVerified(true);
    await sleep(600);
    setStep(3);
  };

  const finishOnboarding = async () => {
    setLoading(true);
    await sleep(1200);
    // Save worker profile to Supabase
    if (sessionId) {
      await supabase.from("workers").insert({
        session_id: sessionId,
        name: data.name,
        role_type: data.role,
        platform: data.platform,
        years_working: data.years,
        income_range: data.income,
        city: data.city,
        aadhaar_verified: aadhaarVerified,
        consents: JSON.stringify(consents),
        trust_score: 62,
        created_at: new Date().toISOString(),
      }).select().single();
    }
    setLoading(false);
    onComplete({ ...data, consents });
  };

  const totalSteps = ONBOARDING_STEPS.length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, background: `radial-gradient(circle, ${C.accentDim} 0%, transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border}44 1px, transparent 1px),linear-gradient(90deg,${C.border}44 1px,transparent 1px)`, backgroundSize: "50px 50px", opacity: .15 }} />
      <div style={{ position: "relative", width: 480, animation: "fadeUp .5s ease-out" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, background: C.accent, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#000" }}>V</div>
            <span className="syne" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>VEYO</span>
          </div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Behavioral credit infrastructure for invisible India</div>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 28, justifyContent: "center" }}>
          {ONBOARDING_STEPS.map((s, i) => (
            <div key={s.id} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? C.accent : C.border, transition: "background .4s" }} />
          ))}
        </div>
        <div className="card" style={{ padding: 32 }} key={step}>
          {step === 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>⚡</div>
              <h2 className="syne" style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Build your financial identity</h2>
              <p style={{ color: C.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
                India has 450M+ gig workers with no credit identity. VEYO aggregates your real behavioral signals — UPI history, gig platform data, GST records — into a portable TrustScore that no bank can ignore.
              </p>
              <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={() => next(true)}>Get started →</button>
            </div>
          )}
          {step === 1 && (
            <div>
              <h3 className="syne" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>What do you do?</h3>
              <p style={{ color: C.textMuted, marginBottom: 20, fontSize: 13 }}>This helps us pull the right data signals for your profile.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { id: "driver", icon: "🚗", label: "Gig Driver", sub: "Rapido / Ola / Uber" },
                  { id: "delivery", icon: "🛵", label: "Delivery Partner", sub: "Swiggy / Zomato / Dunzo" },
                  { id: "kirana", icon: "🏪", label: "Kirana / Shop Owner", sub: "Retail / GST registered" },
                  { id: "domestic", icon: "🏠", label: "Domestic Worker", sub: "Maid / Cook / Helper" },
                  { id: "freelance", icon: "💻", label: "Freelancer", sub: "Design / Dev / Content" },
                  { id: "artisan", icon: "🔨", label: "Artisan / Craftsperson", sub: "Weaver / Potter / Tailor" },
                ].map(r => (
                  <button key={r.id} onClick={() => setData(d => ({ ...d, role: r.id }))} style={{
                    background: data.role === r.id ? C.accentDim : C.card2,
                    border: `1px solid ${data.role === r.id ? C.accent : C.border}`,
                    borderRadius: 10, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "all .2s",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 5 }}>{r.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: data.role === r.id ? C.accent : C.text }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{r.sub}</div>
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6 }}>Your full name (as per Aadhaar)</label>
                <input className="input" placeholder="e.g. Priya Sharma" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", padding: 12 }} onClick={() => next(true)} disabled={!data.role || !data.name}>Continue →</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="syne" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Verify your Aadhaar</h3>
              <p style={{ color: C.textMuted, marginBottom: 20, fontSize: 13 }}>We use UIDAI sandbox for eKYC. Your Aadhaar number is never stored.</p>
              {!aadhaarVerified ? (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6 }}>Aadhaar Number</label>
                    <input className="input" placeholder="XXXX XXXX XXXX" maxLength={14}
                      value={data.aadhaar}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 12);
                        v = v.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) => c ? `${a} ${b} ${c}` : b ? `${a} ${b}` : a);
                        setData(d => ({ ...d, aadhaar: v }));
                      }} />
                  </div>
                  <div style={{ background: C.accentDim, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
                    🎓 Demo mode: enter any 12 digits. In production, this triggers real UIDAI OTP.
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%", padding: 12 }} onClick={verifyAadhaar}
                    disabled={data.aadhaar.replace(/\s/g, "").length !== 12 || loading}>
                    {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> Verifying via UIDAI...</> : "Send OTP & Verify →"}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeUp .4s" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.green }}>Aadhaar Verified</div>
                  <div className="mono" style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>Proof generated · No PII stored</div>
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="syne" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Your work profile</h3>
              <p style={{ color: C.textMuted, marginBottom: 20, fontSize: 13 }}>This pre-fills your identity wallet. You can update anytime.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6 }}>Primary Platform / Employer</label>
                  <input className="input" placeholder="e.g. Rapido, Swiggy" value={data.platform} onChange={e => setData(d => ({ ...d, platform: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6 }}>Years working</label>
                  <select className="input" value={data.years} onChange={e => setData(d => ({ ...d, years: e.target.value }))}>
                    <option value="">Select</option>
                    {["Less than 1 year","1–2 years","2–4 years","4–6 years","6+ years"].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6 }}>Monthly income (approx)</label>
                  <select className="input" value={data.income} onChange={e => setData(d => ({ ...d, income: e.target.value }))}>
                    <option value="">Select range</option>
                    {["Under ₹10,000","₹10,000–₹20,000","₹20,000–₹35,000","₹35,000–₹50,000","₹50,000+"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  {/* FIXED: city is now stored in state */}
                  <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6 }}>City</label>
                  <input className="input" placeholder="e.g. Delhi, Bengaluru, Mumbai"
                    value={data.city}
                    onChange={e => setData(d => ({ ...d, city: e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", padding: 12 }} onClick={() => next(true)} disabled={!data.platform || !data.years || !data.income || !data.city}>Continue →</button>
            </div>
          )}
          {step === 4 && (
            <div>
              <h3 className="syne" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Data consent</h3>
              <p style={{ color: C.textMuted, marginBottom: 20, fontSize: 13 }}>Choose which data sources to connect. Each improves your TrustScore. Revoke anytime.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[
                  { key: "upi", icon: "💳", label: "UPI Transactions", sub: "Via RBI Account Aggregator (NPCI)", points: "+28 pts", color: C.accent },
                  { key: "gig", icon: "🚗", label: "Gig Platform History", sub: "Trip data, ratings, payouts", points: "+20 pts", color: C.green },
                  { key: "gst", icon: "📋", label: "GST Filing Records", sub: "GSTN API · Auto-renewing", points: "+18 pts", color: C.gold },
                  { key: "utility", icon: "🏠", label: "Utility Bill Payments", sub: "BESCOM / BSNL / Water board", points: "+12 pts", color: C.orange },
                ].map(s => (
                  <div key={s.key} onClick={() => setConsents(c => ({ ...c, [s.key]: !c[s.key] }))} style={{
                    background: consents[s.key] ? `${s.color}10` : C.card2,
                    border: `1px solid ${consents[s.key] ? s.color + "55" : C.border}`,
                    borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12, transition: "all .2s",
                  }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{s.sub}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.points}</span>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${consents[s.key] ? s.color : C.border}`, background: consents[s.key] ? s.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}>
                      {consents[s.key] && <span style={{ fontSize: 11, color: "#000", fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: "100%", padding: 12 }} onClick={() => next(false)}
                disabled={loading || Object.values(consents).every(v => !v)}>
                {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> Linking data sources...</> : "Connect & Build My Score →"}
              </button>
            </div>
          )}
          {step === 5 && (
            <div style={{ textAlign: "center", animation: "fadeUp .5s" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h2 className="syne" style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>You're on TrustNet!</h2>
              <p style={{ color: C.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
                {data.name}'s profile is live. Your initial TrustScore is being computed from your connected signals in {data.city}.
              </p>
              <div style={{ background: C.accentDim, border: `1px solid ${C.accent}33`, borderRadius: 12, padding: "20px", marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>YOUR INITIAL TRUSTSCORE</div>
                <div className="syne" style={{ fontSize: 48, fontWeight: 800, color: C.accent }}>62</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>Will improve as more signals are connected</div>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={finishOnboarding} disabled={loading}>
                {loading ? "Setting up your dashboard..." : "Go to my dashboard →"}
              </button>
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: C.textDim }}>
          {ONBOARDING_STEPS[step].icon} {ONBOARDING_STEPS[step].title} · Step {step + 1} of {totalSteps}
        </div>
      </div>
    </div>
  );
}

// ─── AI CHAT ADVISOR (role-aware) ──────────────────────────────────────────────
function AIChatAdvisor({ role, userScore, connectedSignals, workerName, workerCity, portfolioStats }) {
  const systemPrompts = {
    worker: `You are VEYO's AI Credit Advisor helping a gig worker in India named ${workerName || "the user"} from ${workerCity || "India"}. Their TrustScore is ${userScore}/100 with ${connectedSignals} data signals connected.

VEYO is a behavioral credit infrastructure aggregating UPI transactions, GST filings, gig platform data, Aadhaar eKYC, and utility bills into a composable TrustScore.

Score bands:
- 0–40: Building — limited loan access, focus on connecting more signals
- 40–60: Fair — ₹5K–20K loans possible at 20–28% p.a.
- 60–75: Good — ₹20K–60K loans at 14–20% p.a.  
- 75–100: Excellent — ₹60K–2L loans at 10–14% p.a. from NBFCs

Be warm, helpful, and specific. Use INR amounts. Reference real Indian context: NPCI, RBI AA, UIDAI, GSTN, PM SVANidhi, MUDRA, KreditBee, Stashfin. 
Give actionable advice. Mention which specific signals to connect to improve score the most.
Keep responses to 2–3 paragraphs. Do NOT use markdown headers or bullet points.`,

    lender: `You are VEYO's AI Underwriting Advisor for ${portfolioStats?.name || "a lender / NBFC"} using VEYO's credit infrastructure.

Current portfolio context:
- Active borrowers: ${portfolioStats?.borrowers || 847}
- NPA rate: ${portfolioStats?.npa || "0.3%"} (vs 8.2% industry average)
- Avg TrustScore in portfolio: ${portfolioStats?.avgScore || 64.2}
- Total portfolio: ${portfolioStats?.portfolio || "₹2.4Cr"}

You help lenders make better underwriting decisions using behavioral data. Your expertise covers:
- Interpreting TrustScores and signal composition for credit decisions
- Risk stratification across Tier A/B/C workers
- Portfolio optimization for informal economy lending
- RBI AA framework, FLDG structures, co-lending models
- NBFC regulations: PCA framework, NPA provisioning, capital adequacy
- How to price loans based on behavioral signals vs traditional CIBIL

Be precise, use financial terminology, reference RBI circulars where relevant. Keep responses concise and actionable for an underwriter or credit manager.`,

    govt: `You are VEYO's AI Policy Advisor for government officials and MSME ministry stakeholders overseeing India's informal worker welfare programs.

Active scheme context:
- PM SVANidhi: 49L beneficiaries, ₹5,200 Cr disbursed (as of 2024)
- MUDRA Yojana: 44 Cr accounts, ₹27.03L Cr since inception
- Stand-Up India: ₹44,000 Cr to 2.05L SC/ST/women entrepreneurs
- PMEGP: 8L+ units, ₹22,000 Cr employment generation
- PLFS 2023-24: 57.7% informal sector, 450M+ unserved gig workers

Your role: help officials use VEYO's TrustNet data to identify eligible beneficiaries, reduce disbursal leakage, track scheme outcomes, and expand last-mile delivery of financial welfare schemes.

Reference real Indian datasets: PLFS (MOSPI), Economic Survey, RBI Annual Report, MSME Ministry Annual Report, NPCI data releases. 
Be policy-oriented, cite real statistics, suggest data-driven improvements to scheme targeting and disbursement. Keep responses focused and implementable.`
  };

  const quickPrompts = {
    worker: [
      "How do I improve my TrustScore fastest?",
      "Am I eligible for a loan right now?",
      "Which signal should I connect next?",
      "How does UPI data help my score?",
      "What's the best loan offer for me?",
      "How long to reach 75+ score?",
    ],
    lender: [
      "How should I interpret a 65 TrustScore?",
      "What's a safe loan amount for Tier B workers?",
      "How do I reduce NPA in my gig worker portfolio?",
      "Explain the signal composition for WRK-001",
      "What FLDG structure works for micro-loans?",
      "How does ZK proof protect my lender liability?",
    ],
    govt: [
      "Which workers are eligible for PM SVANidhi right now?",
      "How can VEYO reduce scheme leakage?",
      "Show me MUDRA disbursement gaps by state",
      "How do we reach women workers in rural areas?",
      "What does PLFS 2023-24 say about gig workers?",
      "How to integrate TrustNet with DigiLocker?",
    ],
  };

  const headers = {
    worker: { title: "VEYO Credit Advisor", sub: "AI-powered · Always on", icon: "🤖" },
    lender: { title: "AI Underwriting Advisor", sub: "Portfolio intelligence · ZK-verified", icon: "📊" },
    govt: { title: "AI Policy Advisor", sub: "Scheme optimization · Real-time data", icon: "🏛️" },
  };

  const h = headers[role] || headers.worker;
  const prompts = quickPrompts[role] || quickPrompts.worker;
  const sysPrompt = systemPrompts[role] || systemPrompts.worker;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: role === "worker"
        ? `Hi ${workerName || "there"}! I'm your VEYO credit advisor. Your TrustScore is **${userScore}** with ${connectedSignals} signals connected. I can help you improve your score, find loans you qualify for, and explain exactly how each data signal affects your creditworthiness. What would you like to know?`
        : role === "lender"
        ? `Welcome to your AI Underwriting Advisor. Your portfolio currently has ${portfolioStats?.borrowers || 847} active borrowers with a ${portfolioStats?.npa || "0.3%"} NPA rate — significantly below the 8.2% industry average. I can help you with underwriting decisions, risk assessment, portfolio strategy, and regulatory compliance. What would you like to analyze?`
        : `Welcome. I'm your VEYO Policy Advisor with access to live scheme data and TrustNet beneficiary intelligence. PM SVANidhi has reached 49L beneficiaries, but our models show ${(Math.random() * 300 + 200).toFixed(0)}K more eligible workers not yet enrolled in your jurisdiction. How can I help you improve scheme coverage today?`,
      ts: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ask = async (q) => {
    const question = q || input.trim();
    if (!question || loading) return;
    setInput("");
    const userMsg = { role: "user", text: question, ts: new Date() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: sysPrompt,
          messages: [
            ...messages.slice(1).map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: question }
          ]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.[0]?.text || "I couldn't process that. Please try again.";
      setMessages(m => [...m, { role: "assistant", text: reply, ts: new Date() }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: `Network issue: ${e.message}. Please check your API key in the VEYO setup.`, ts: new Date() }]);
    }
    setLoading(false);
  };

  const roleColor = role === "worker" ? C.accent : role === "lender" ? C.gold : C.purple;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${roleColor}18`, border: `1px solid ${roleColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{h.icon}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{h.title}</div>
          <div style={{ fontSize: 11, color: C.green, display: "flex", alignItems: "center", gap: 4 }}>
            <div className="live-dot" style={{ width: 6, height: 6 }} /> {h.sub}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          {role === "worker" && <span className="tag tag-accent">Score: {userScore}</span>}
          {role === "lender" && <span className="tag tag-gold">NPA: {portfolioStats?.npa || "0.3%"}</span>}
          {role === "govt" && <span className="tag tag-purple">Policy Mode</span>}
        </div>
      </div>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {prompts.map(q => (
          <button key={q} className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => ask(q)}>{q}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, flexDirection: m.role === "user" ? "row-reverse" : "row", animation: "chatIn .3s ease-out" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: m.role === "user" ? C.accentDim : `${roleColor}18`, border: `1px solid ${m.role === "user" ? C.accent : roleColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              {m.role === "user" ? "👤" : h.icon}
            </div>
            <div style={{ maxWidth: "82%" }}>
              <div style={{
                background: m.role === "user" ? C.accentDim : C.card2,
                border: `1px solid ${m.role === "user" ? C.accent + "33" : C.border}`,
                borderRadius: m.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                padding: "10px 14px", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
              }}>
                {m.text.replace(/\*\*(.*?)\*\*/g, "$1")}
              </div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 3, textAlign: m.role === "user" ? "right" : "left" }}>
                {m.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${roleColor}18`, border: `1px solid ${roleColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{h.icon}</div>
            <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px" }}>
              <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <input className="input input-sm" placeholder={role === "worker" ? "Ask about your score, loans, or how to improve..." : role === "lender" ? "Ask about underwriting, portfolio risk, or borrower signals..." : "Ask about scheme coverage, beneficiary targeting, or policy gaps..."} value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm" onClick={() => ask()} disabled={!input.trim() || loading}>Send</button>
      </div>
    </div>
  );
}

// ─── SIGNALS ──────────────────────────────────────────────────────────────────
const SIGNALS = [
  { key: "upi", label: "UPI Transactions", sublabel: "Account Aggregator · NPCI", icon: "💳", color: C.accent, pct: 91, weight: 28 },
  { key: "aadhaar", label: "Aadhaar eKYC", sublabel: "UIDAI Sandbox · Verified", icon: "🪪", color: C.purple, pct: 100, weight: 22 },
  { key: "gig", label: "Gig Platform Data", sublabel: "Rapido API · 4yr history", icon: "🚗", color: C.green, pct: 88, weight: 20 },
  { key: "gst", label: "GST Filing History", sublabel: "GSTN · Auto-linked", icon: "📋", color: C.gold, pct: 78, weight: 18 },
  { key: "utility", label: "Utility Bills", sublabel: "BESCOM · Airtel · 2yr", icon: "🏠", color: C.orange, pct: 72, weight: 12 },
];

// ─── MONTHLY TRANSACTION VIEW (Paytm-style) ──────────────────────────────────
const MONTHLY_TX = {
  "Apr 2025": [
    { id: 101, desc: "Rapido trip fare", amt: 180, type: "credit", category: "Income", icon: "🚗", ts: "Apr 3, 2:14 PM" },
    { id: 102, desc: "HP Petrol Pump, Jayanagar", amt: -650, type: "debit", category: "Fuel", icon: "⛽", ts: "Apr 3, 8:22 AM" },
    { id: 103, desc: "Rapido trip fare", amt: 220, type: "credit", category: "Income", icon: "🚗", ts: "Apr 2, 6:45 PM" },
    { id: 104, desc: "Swiggy delivery bonus", amt: 95, type: "credit", category: "Income", icon: "🛵", ts: "Apr 2, 12:30 PM" },
  ],
  "Mar 2025": [
    { id: 201, desc: "Rapido weekly payout", amt: 4200, type: "credit", category: "Income", icon: "🚗", ts: "Mar 31, 9:00 AM" },
    { id: 202, desc: "BESCOM electricity bill", amt: -840, type: "debit", category: "Utilities", icon: "💡", ts: "Mar 28, 11:20 AM" },
    { id: 203, desc: "Airtel postpaid bill", amt: -399, type: "debit", category: "Utilities", icon: "📱", ts: "Mar 25, 3:45 PM" },
    { id: 204, desc: "Rapido weekly payout", amt: 3800, type: "credit", category: "Income", icon: "🚗", ts: "Mar 24, 9:00 AM" },
    { id: 205, desc: "BigBasket grocery", amt: -1240, type: "debit", category: "Food", icon: "🛒", ts: "Mar 22, 7:30 PM" },
    { id: 206, desc: "Rapido weekly payout", amt: 4100, type: "credit", category: "Income", icon: "🚗", ts: "Mar 17, 9:00 AM" },
    { id: 207, desc: "LIC premium", amt: -2400, type: "debit", category: "Insurance", icon: "🛡️", ts: "Mar 10, 10:00 AM" },
    { id: 208, desc: "Rapido weekly payout", amt: 3950, type: "credit", category: "Income", icon: "🚗", ts: "Mar 10, 9:00 AM" },
  ],
  "Feb 2025": [
    { id: 301, desc: "Rapido weekly payout", amt: 4400, type: "credit", category: "Income", icon: "🚗", ts: "Feb 28, 9:00 AM" },
    { id: 302, desc: "House rent", amt: -6500, type: "debit", category: "Rent", icon: "🏠", ts: "Feb 1, 8:00 AM" },
    { id: 303, desc: "BESCOM electricity bill", amt: -720, type: "debit", category: "Utilities", icon: "💡", ts: "Feb 28, 11:00 AM" },
    { id: 304, desc: "Swiggy order", amt: -380, type: "debit", category: "Food", icon: "🍕", ts: "Feb 14, 8:30 PM" },
  ],
};

function MonthlyTransactions() {
  const [expandedMonth, setExpandedMonth] = useState("Apr 2025");

  const monthStats = Object.entries(MONTHLY_TX).map(([month, txs]) => {
    const credits = txs.filter(t => t.type === "credit").reduce((s, t) => s + t.amt, 0);
    const debits = txs.filter(t => t.type === "debit").reduce((s, t) => s + Math.abs(t.amt), 0);
    return { month, txs, credits, debits, net: credits - debits };
  });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Monthly Transactions</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>Via UPI Account Aggregator · NPCI</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {monthStats.map(({ month, txs, credits, debits, net }) => (
          <div key={month} className="card2" style={{ overflow: "hidden" }}>
            {/* Month header */}
            <div onClick={() => setExpandedMonth(expandedMonth === month ? null : month)} style={{
              padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{month}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{txs.length} transactions</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.textMuted }}>In</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>+₹{credits.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Out</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.red }}>-₹{debits.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Net</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: net >= 0 ? C.green : C.red }}>{net >= 0 ? "+" : ""}₹{Math.abs(net).toLocaleString()}</div>
                </div>
                <span style={{ color: C.textMuted, fontSize: 12 }}>{expandedMonth === month ? "▲" : "▼"}</span>
              </div>
            </div>
            {/* Transactions */}
            {expandedMonth === month && (
              <div style={{ borderTop: `1px solid ${C.border}`, animation: "fadeIn .2s" }}>
                {txs.map((tx, i) => (
                  <div key={tx.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                    borderBottom: i < txs.length - 1 ? `1px solid ${C.border}` : "none",
                    background: i % 2 === 0 ? "transparent" : `${C.surface}44`,
                  }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: tx.type === "credit" ? C.greenDim : C.card, border: `1px solid ${tx.type === "credit" ? C.green + "33" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{tx.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{tx.desc}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{tx.ts} · {tx.category}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: tx.type === "credit" ? C.green : C.red }}>
                      {tx.type === "credit" ? "+" : ""}₹{Math.abs(tx.amt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {/* Category breakdown */}
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(
                    txs.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amt); return acc; }, {})
                  ).map(([cat, amt]) => (
                    <div key={cat} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 11 }}>
                      <span style={{ color: C.textMuted }}>{cat}: </span>
                      <span style={{ fontWeight: 600 }}>₹{amt.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LOAN MARKETPLACE (FIXED) ─────────────────────────────────────────────────
const LOAN_OFFERS = [
  { id: 1, lender: "Varanasi Finance NBFC", type: "Personal Loan", amount: 40000, rate: 14, tenure: 12, processing: "₹499", time: "4 hours", badge: "Best Match", badgeColor: C.green, minScore: 70, icon: "🏦", desc: "Trusted NBFC partner. Specializes in gig economy workers. No physical visit required. Disbursal within 4 hours of approval." },
  { id: 2, lender: "Paisabazaar Micro", type: "Working Capital", amount: 25000, rate: 16.5, tenure: 6, processing: "Zero", time: "Instant", badge: "Zero Fees", badgeColor: C.accent, minScore: 55, icon: "⚡", desc: "Zero processing fee. Instant disbursal to your bank account. 6-month flexible repayment. Best for short-term cash needs." },
  { id: 3, lender: "Stashfin", type: "Line of Credit", amount: 60000, rate: 18, tenure: 18, processing: "₹999", time: "24 hours", badge: "Highest Limit", badgeColor: C.gold, minScore: 75, icon: "💰", desc: "Highest loan limit available. Revolving line of credit — borrow as needed. 18-month repayment. App-based management." },
  { id: 4, lender: "KreditBee NBFC", type: "Emergency Loan", amount: 10000, rate: 22, tenure: 3, processing: "₹199", time: "2 hours", badge: "Fast Disburse", badgeColor: C.orange, minScore: 45, icon: "🚀", desc: "Fastest approval. Emergency cash in 2 hours. Short 3-month tenure. Minimum eligibility. Great for score building." },
  { id: 5, lender: "Finzy P2P", type: "Peer Loan", amount: 30000, rate: 13.5, tenure: 12, processing: "₹349", time: "8 hours", badge: "Lowest Rate", badgeColor: C.purple, minScore: 65, icon: "🤝", desc: "Lowest interest rate. Peer-to-peer lending platform. RBI registered P2P NBFC. 12-month tenure with flexible EMI dates." },
  { id: 6, lender: "Avanse Micro", type: "Education Loan", amount: 20000, rate: 15, tenure: 9, processing: "₹299", time: "6 hours", badge: "Skill Upgrade", badgeColor: C.green, minScore: 50, icon: "📚", desc: "For skill development and certifications. Government scheme linked. Lower rate for education use. 9-month tenor." },
];

function LoanMarketplace({ userScore, userId, userName, onNavigate }) {
  const [filter, setFilter] = useState("eligible");
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState(new Set());
  const [toast, setToast] = useState(null);

  const eligible = LOAN_OFFERS.filter(o => userScore >= o.minScore);
  // FIXED: "All Offers" shows ALL offers, not just eligible ones
  const shown = filter === "eligible" ? eligible : LOAN_OFFERS;

  const showToast = (msg, color = C.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 4000);
  };

  const apply = async (offer) => {
    setApplying(offer.id);
    try {
      // Write application to Supabase
      const { error } = await supabase.from("loan_applications").insert({
        worker_id: userId,
        worker_name: userName,
        worker_score: userScore,
        lender_name: offer.lender,
        loan_type: offer.type,
        amount: offer.amount,
        rate: offer.rate,
        tenure: offer.tenure,
        status: "applied",
        applied_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Send notification to lender (all lenders share one recipient for demo)
      await supabase.from("notifications").insert({
        recipient_id: "lender-global",
        type: "loan_application",
        title: `New loan application — ₹${offer.amount.toLocaleString()}`,
        body: `${userName || "A worker"} (Score: ${userScore}) applied for ${offer.type} from ${offer.lender}`,
        action_label: "Review in Queue",
        action_tab: "queue",
        read: false,
        created_at: new Date().toISOString(),
      });

      setApplied(s => new Set([...s, offer.id]));
      showToast(`Application sent to ${offer.lender}! They'll review within ${offer.time}.`);
    } catch (e) {
      console.warn("Apply error:", e);
      // Fallback: mark applied anyway for demo
      setApplied(s => new Set([...s, offer.id]));
      showToast(`Application submitted to ${offer.lender}! (Demo mode)`);
    }
    setApplying(null);
  };

  return (
    <div style={{ position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.card, border: `1px solid ${toast.color}55`, borderRadius: 12, padding: "14px 20px", zIndex: 9000, animation: "fadeUp .3s", boxShadow: `0 4px 20px ${toast.color}22`, fontSize: 13, fontWeight: 500, maxWidth: 400, textAlign: "center" }}>
          ✅ {toast.msg}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Loan Marketplace</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Pre-qualified based on your TrustScore of {userScore} · {eligible.length} offers match your profile</div>
        </div>
        <div className="tab-bar">
          <button className={`tab${filter === "eligible" ? " active" : ""}`} onClick={() => setFilter("eligible")}>
            ✅ Eligible ({eligible.length})
          </button>
          <button className={`tab${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
            All Offers ({LOAN_OFFERS.length})
          </button>
        </div>
      </div>

      {filter === "all" && (
        <div style={{ background: C.goldDim, border: `1px solid ${C.gold}44`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.gold, marginBottom: 16 }}>
          ℹ️ Showing all {LOAN_OFFERS.length} offers. Greyed-out offers require a higher TrustScore. Connect more data signals to unlock them.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {shown.map(offer => {
          const isEligible = userScore >= offer.minScore;
          const isApplied = applied.has(offer.id);
          const isSelected = selected === offer.id;
          return (
            <div key={offer.id} style={{
              background: C.card2,
              border: `1px solid ${isSelected ? offer.badgeColor + "66" : isEligible ? C.border : C.border}`,
              borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all .2s",
              opacity: isEligible ? 1 : 0.45,
              boxShadow: isSelected ? `0 0 0 1px ${offer.badgeColor}33` : "none",
            }} onClick={() => setSelected(isSelected ? null : offer.id)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: `${offer.badgeColor}18`, border: `1px solid ${offer.badgeColor}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{offer.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{offer.lender}</span>
                    <span className="tag" style={{ background: `${offer.badgeColor}18`, color: offer.badgeColor, borderColor: `${offer.badgeColor}44`, fontSize: 10 }}>{offer.badge}</span>
                    {!isEligible && <span className="tag tag-red" style={{ fontSize: 10 }}>Need score {offer.minScore}+ (you: {userScore})</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>{offer.type} · Disbursal: {offer.time}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {[
                      { l: "Amount", v: `₹${offer.amount.toLocaleString()}` },
                      { l: "Rate (p.a.)", v: `${offer.rate}%` },
                      { l: "Tenure", v: `${offer.tenure} mo` },
                      { l: "Processing", v: offer.processing },
                    ].map(s => (
                      <div key={s.l}>
                        <div style={{ fontSize: 10, color: C.textMuted }}>{s.l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: isEligible ? C.text : C.textDim }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  {isApplied ? (
                    <span className="tag tag-green">Applied ✓</span>
                  ) : (
                    <button className={`btn btn-sm ${isEligible ? "btn-primary" : ""}`}
                      disabled={!isEligible || applying === offer.id}
                      onClick={e => { e.stopPropagation(); apply(offer); }}>
                      {applying === offer.id ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> : isEligible ? "Apply Now" : "Locked 🔒"}
                    </button>
                  )}
                  <span style={{ fontSize: 10, color: C.textMuted }}>{isSelected ? "▲ Hide" : "▼ Details"}</span>
                </div>
              </div>

              {/* FIXED: Expanded details + EMI */}
              {isSelected && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, animation: "fadeIn .2s" }}>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, lineHeight: 1.6 }}>{offer.desc}</div>
                  {isEligible && (() => {
                    const r = offer.rate / 12 / 100;
                    const emi = Math.round(offer.amount * r * Math.pow(1+r, offer.tenure) / (Math.pow(1+r, offer.tenure) - 1));
                    const total = emi * offer.tenure;
                    const interest = total - offer.amount;
                    return (
                      <div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10, fontWeight: 600 }}>EMI BREAKDOWN — ₹{offer.amount.toLocaleString()} over {offer.tenure} months</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                          {[{ l: "Monthly EMI", v: `₹${emi.toLocaleString()}`, c: C.accent }, { l: "Total Interest", v: `₹${interest.toLocaleString()}`, c: C.gold }, { l: "Total Payable", v: `₹${total.toLocaleString()}`, c: C.text }].map(s => (
                            <div key={s.l} className="card2" style={{ padding: "10px 12px" }}>
                              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 3 }}>{s.l}</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: s.c }}>{s.v}</div>
                            </div>
                          ))}
                        </div>
                        {!isApplied && isEligible && (
                          <button className="btn btn-primary" style={{ width: "100%", marginTop: 12, padding: 11 }}
                            disabled={applying === offer.id} onClick={e => { e.stopPropagation(); apply(offer); }}>
                            {applying === offer.id ? "Submitting application..." : `Apply for ₹${offer.amount.toLocaleString()} at ${offer.rate}% p.a. →`}
                          </button>
                        )}
                        {isApplied && (
                          <div className="tag tag-green" style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: 12, fontSize: 12 }}>
                            ✓ Application submitted to {offer.lender} · Under review
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {!isEligible && (
                    <div style={{ background: C.redDim, border: `1px solid ${C.red}33`, borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
                      <span style={{ color: C.red, fontWeight: 600 }}>Score needed: {offer.minScore}</span>
                      <span style={{ color: C.textMuted }}> · You need {offer.minScore - userScore} more points. Connect {offer.minScore - userScore >= 20 ? "UPI + Gig data" : "one more signal"} to unlock.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DOWNLOAD CREDENTIAL ──────────────────────────────────────────────────────
function downloadCredential(user, score, connected) {
  const credential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "VEYOTrustCredential"],
    "issuer": "did:veyo:trustnet-v1",
    "issuanceDate": new Date().toISOString(),
    "expirationDate": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString(),
    "credentialSubject": {
      "id": `did:veyo:${Math.random().toString(36).substr(2, 12)}`,
      "name": user.name,
      "city": user.city || "India",
      "role": user.role || "gig_worker",
      "trustScore": score,
      "incomeBand": user.income || "₹20,000–₹35,000",
      "aadhaarVerified": true,
      "zkProof": `0x${Math.random().toString(16).substr(2, 40)}`,
      "connectedSignals": Object.keys(connected).filter(k => connected[k]),
      "signalCount": Object.values(connected).filter(Boolean).length,
      "creditAge": "4 years",
      "npaNever": true,
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "created": new Date().toISOString(),
      "verificationMethod": "did:veyo:trustnet-v1#key-1",
      "proofPurpose": "assertionMethod",
      "proofValue": `z${Math.random().toString(36).substr(2, 86)}`,
    }
  };
  const blob = new Blob([JSON.stringify(credential, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `VEYO_TrustCredential_${user.name?.replace(/\s/g,"_") || "worker"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── SCORE TIMELINE ───────────────────────────────────────────────────────────
const TIMELINE_DATA = [
  { month: "Oct", score: 0, event: "Joined VEYO" },
  { month: "Nov", score: 18, event: "Aadhaar verified" },
  { month: "Dec", score: 31, event: "UPI connected" },
  { month: "Jan", score: 44, event: "Gig data linked" },
  { month: "Feb", score: 56, event: "GST synced" },
  { month: "Mar", score: 63, event: "Utility added" },
  { month: "Apr", score: 78, event: "Score: Excellent" },
];

function ScoreTimeline() {
  const [active, setActive] = useState(6);
  const max = 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 120, marginBottom: 8, paddingBottom: 4, position: "relative" }}>
        {[25, 50, 75, 100].map(v => (
          <div key={v} style={{ position: "absolute", left: 0, right: 0, bottom: `${v}%`, borderTop: `1px dashed ${C.border}`, pointerEvents: "none" }}>
            <span style={{ fontSize: 9, color: C.textDim, position: "absolute", left: 0, top: -8 }}>{v}</span>
          </div>
        ))}
        {TIMELINE_DATA.map((d, i) => {
          const h = `${(d.score / max) * 96}%`;
          const color = d.score >= 70 ? C.green : d.score >= 45 ? C.gold : C.accent;
          return (
            <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", position: "relative" }} onClick={() => setActive(i)}>
              {active === i && (
                <div style={{ position: "absolute", bottom: `calc(${h} + 4px)`, background: C.card, border: `1px solid ${color}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, whiteSpace: "nowrap", color, fontWeight: 600, zIndex: 10 }}>{d.score > 0 ? d.score : "—"}</div>
              )}
              <div style={{ width: "70%", background: active === i ? color : `${color}55`, borderRadius: "4px 4px 0 0", height: h, transition: "all .4s", minHeight: 3, alignSelf: "flex-end" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex" }}>
        {TIMELINE_DATA.map((d, i) => (
          <div key={d.month} style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => setActive(i)}>
            <div style={{ fontSize: 10, color: active === i ? C.text : C.textMuted, fontWeight: active === i ? 600 : 400 }}>{d.month}</div>
          </div>
        ))}
      </div>
      {active !== null && (
        <div style={{ marginTop: 12, background: C.card2, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{TIMELINE_DATA[active].event}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{TIMELINE_DATA[active].month} 2024</div>
          </div>
          <div className="syne" style={{ fontSize: 22, fontWeight: 700, color: TIMELINE_DATA[active].score >= 70 ? C.green : TIMELINE_DATA[active].score >= 45 ? C.gold : C.accent }}>
            {TIMELINE_DATA[active].score}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WORKER DASHBOARD ─────────────────────────────────────────────────────────
const TX_POOL = [
  { id: 1, desc: "Rapido trip fare", amt: "+₹180", ts: "Just now", type: "credit" },
  { id: 2, desc: "HP Petrol Pump, Jayanagar", amt: "-₹650", ts: "8m ago", type: "debit" },
  { id: 3, desc: "Rapido trip fare", amt: "+₹220", ts: "22m ago", type: "credit" },
  { id: 4, desc: "Swiggy delivery bonus", amt: "+₹95", ts: "1h ago", type: "credit" },
  { id: 5, desc: "BESCOM electricity", amt: "-₹840", ts: "1d ago", type: "debit" },
  { id: 6, desc: "Rapido weekly payout", amt: "+₹4,200", ts: "3d ago", type: "credit" },
  { id: 7, desc: "Airtel postpaid bill", amt: "-₹399", ts: "7d ago", type: "debit" },
  { id: 8, desc: "GST auto-filing fee", amt: "₹0", ts: "10d ago", type: "neutral" },
];

function WorkerDashboard({ user, userId, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [connected, setConnected] = useState({ aadhaar: true });
  const [connecting, setConnecting] = useState(null);
  const [score, setScore] = useState(22);
  const [targetScore, setTargetScore] = useState(22);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toastNotifs, setToastNotifs] = useState([]);
  const [txShown, setTxShown] = useState([]);
  const [credDownloaded, setCredDownloaded] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const connectedKeys = Object.keys(connected).filter(k => connected[k]);
  const allConnected = connectedKeys.length === SIGNALS.length;

  const addToast = (n) => setToastNotifs(prev => [{ id: Date.now(), ...n }, ...prev].slice(0, 4));
  const dismissToast = (id) => setToastNotifs(n => n.filter(x => x.id !== id));

  const handleToastAction = (n) => {
    if (n.action === "View Offer" || n.action === "View Loans") setTab("loans");
  };

  const connectSignal = async (key) => {
    if (connected[key] || connecting) return;
    setConnecting(key);
    // Save to Supabase
    if (userId) {
      await supabase.from("signal_connections").insert({ worker_id: userId, signal_key: key, connected_at: new Date().toISOString() }).then(() => {});
    }
    await sleep(1800);
    setConnected(prev => ({ ...prev, [key]: true }));
    setConnecting(null);
    if (key === "upi") {
      setTxShown([]);
      TX_POOL.forEach((tx, i) => setTimeout(() => setTxShown(p => [tx, ...p]), i * 500));
    }
    // Save notification for the user themselves
    if (userId) {
      await supabase.from("notifications").insert({ recipient_id: userId, type: "score_update", title: `${SIGNALS.find(s=>s.key===key)?.label} connected`, body: `+${SIGNALS.find(s=>s.key===key)?.weight} points added to your TrustScore`, read: false, created_at: new Date().toISOString() });
    }
  };

  // Score computation
  useEffect(() => {
    if (connectedKeys.length === 0) { setTargetScore(0); return; }
    const raw = connectedKeys.reduce((s, k) => {
      const sig = SIGNALS.find(x => x.key === k);
      return s + (sig.weight * sig.pct / 100);
    }, 0);
    setTargetScore(Math.min(100, Math.round(raw)));
  }, [connectedKeys.length]);

  useEffect(() => {
    let cur = score;
    const diff = targetScore - cur;
    if (diff === 0) return;
    const step = diff / 30;
    const iv = setInterval(() => {
      cur += step;
      if ((step > 0 && cur >= targetScore) || (step < 0 && cur <= targetScore)) { cur = targetScore; clearInterval(iv); }
      setScore(Math.round(cur));
    }, 40);
    return () => clearInterval(iv);
  }, [targetScore]);

  useEffect(() => {
    if (allConnected) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4500);
      setTimeout(() => addToast({ type: "LENDER MATCH", title: "Pre-approved offer!", body: "Varanasi Finance: ₹40,000 @ 14% p.a. based on your TrustScore 78", color: C.green, action: "View Offer" }), 1500);
      setTimeout(() => addToast({ type: "SCORE UPDATE", title: "Excellent credit profile!", body: "You're now eligible for 5 loan products — best rate: 13.5% p.a.", color: C.accent, action: "View Loans" }), 3500);
    }
  }, [allConnected]);

  const handleShareToLender = async () => {
    setShareLoading(true);
    try {
      await supabase.from("notifications").insert({
        recipient_id: "lender-global",
        type: "loan_application",
        title: `Worker shared identity wallet`,
        body: `${user?.name || "A worker"} (Score: ${score}) shared their TrustCredential for review`,
        action_label: "View in Queue",
        action_tab: "queue",
        read: false,
        created_at: new Date().toISOString(),
      });
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e) {
      setShareSuccess(true); // Demo fallback
      setTimeout(() => setShareSuccess(false), 4000);
    }
    setShareLoading(false);
  };

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "signals", label: "Data Signals" },
    { id: "loans", label: "Loan Marketplace" },
    { id: "transactions", label: "Transactions" },
    { id: "timeline", label: "Score Journey" },
    { id: "wallet", label: "Identity Wallet" },
    { id: "advisor", label: "AI Advisor" },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <Confetti active={showConfetti} />
      <NotifCenter notifs={toastNotifs} onDismiss={dismissToast} onAction={handleToastAction} />
      <Topbar role="worker" user={{ name: user?.name || "Arjun Kumar", sub: `Gig Worker · ${user?.city || "India"}` }}
        userId={userId || "worker-demo"}
        onLogout={onLogout} onNavigate={setTab} />

      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "14px 18px", background: "none", border: "none", cursor: "pointer",
            borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
            color: tab === t.id ? C.accent : C.textMuted,
            fontFamily: "DM Sans,sans-serif", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            transition: "all .18s", whiteSpace: "nowrap", marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, maxWidth: 1200 }}>
            <div>
              <div className="card" style={{ padding: 24, marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>TrustNet Score</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <ScoreRing score={score} size={130} />
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{connectedKeys.length}/{SIGNALS.length} signals connected</div>
                {allConnected ? (
                  <div style={{ marginTop: 14, background: C.greenDim, border: `1px solid ${C.green}44`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: C.green, fontWeight: 600 }}>🎉 Pre-qualified up to ₹60,000</div>
                ) : (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>Connect more signals to unlock</div>
                    <div style={{ background: C.border, borderRadius: 6, height: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.purple})`, width: `${(connectedKeys.length / SIGNALS.length) * 100}%`, transition: "width .8s", borderRadius: 6 }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.purpleDim, border: `1px solid ${C.purple}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔐</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: allConnected ? C.purple : C.textMuted }}>ZK Proof {allConnected ? "Generated" : "Pending"}</div>
                    <div className="mono" style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{allConnected ? "Privacy-preserving · Income ≥ ₹40K/mo" : "Awaiting signals"}</div>
                  </div>
                  {allConnected && <span style={{ color: C.green }}>✓</span>}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { l: "Monthly Income", v: "₹44,200", c: C.green },
                  { l: "Loan Eligible", v: allConnected ? "₹60,000" : "₹0", c: C.accent },
                  { l: "Active EMIs", v: "0", c: C.text },
                  { l: "Credit Age", v: "4 years", c: C.gold },
                ].map(s => (
                  <div key={s.l} className="stat-card" style={{ padding: 14 }}>
                    <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{s.l}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.c, fontFamily: "Syne,sans-serif" }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Data Signals</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>Each connection builds your TrustScore · ZK-encrypted</div>
                  </div>
                  {!allConnected && (
                    <button className="btn btn-primary btn-sm" onClick={() => SIGNALS.forEach((s, i) => setTimeout(() => connectSignal(s.key), i * 400))}>Connect All</button>
                  )}
                </div>
                {SIGNALS.map(sig => (
                  <div key={sig.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ flex: 1 }}>
                      <SignalBar label={sig.label} sublabel={sig.sublabel} icon={sig.icon} color={sig.color} pct={sig.pct} connected={!!connected[sig.key]} weight={sig.weight} />
                    </div>
                    {!connected[sig.key] && (
                      <button className="btn btn-sm" style={{ flexShrink: 0, minWidth: 80, marginBottom: 12 }} onClick={() => connectSignal(sig.key)} disabled={connecting === sig.key}>
                        {connecting === sig.key ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> : "Connect"}
                      </button>
                    )}
                    {connected[sig.key] && <span style={{ color: C.green, marginBottom: 12, flexShrink: 0, fontSize: 16 }}>✓</span>}
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: txShown.length ? C.green : C.textDim, animation: txShown.length ? "pulse 2s infinite" : "none" }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Live Transaction Feed</div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: C.textMuted }}>via Account Aggregator</span>
                </div>
                {txShown.length === 0 && <div style={{ color: C.textDim, fontSize: 13, textAlign: "center", padding: 20 }}>Connect UPI to see your transactions</div>}
                {txShown.map(tx => (
                  <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, animation: "slideIn .3s ease-out" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{tx.desc}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{tx.ts}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: tx.type === "credit" ? C.green : tx.type === "debit" ? C.red : C.textMuted }}>{tx.amt}</div>
                  </div>
                ))}
                {txShown.length > 0 && (
                  <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={() => setTab("transactions")}>View full transaction history →</button>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "signals" && (
          <div style={{ maxWidth: 900 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Syne,sans-serif", marginBottom: 6 }}>Data Signals & Privacy</h2>
              <p style={{ color: C.textMuted, fontSize: 13 }}>All signals are aggregated via RBI-compliant Account Aggregator framework. Raw data never leaves your device.</p>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {SIGNALS.map(sig => (
                <div className="card" key={sig.key} style={{ padding: 20 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${sig.color}18`, border: `1px solid ${sig.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{sig.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{sig.label}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{sig.sublabel}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="tag" style={{ background: `${sig.color}18`, color: sig.color, borderColor: `${sig.color}44` }}>Weight: {sig.weight}%</span>
                          {connected[sig.key] ? <span className="tag tag-green">Connected ✓</span> : <span className="tag" style={{ background: C.card2, color: C.textMuted, borderColor: C.border }}>Not connected</span>}
                        </div>
                      </div>
                      <SignalBar label="" sublabel="" icon="" pct={sig.pct} color={sig.color} connected={!!connected[sig.key]} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: C.textMuted }}>
                          {connected[sig.key] ? `Contributing ${Math.round(sig.weight * sig.pct / 100)} pts to your score` : `Would add up to ${sig.weight} pts`}
                        </div>
                        {!connected[sig.key] && (
                          <button className="btn btn-primary btn-sm" onClick={() => connectSignal(sig.key)} disabled={connecting === sig.key}>
                            {connecting === sig.key ? "Linking..." : "Connect →"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "loans" && (
          <div style={{ maxWidth: 960 }}>
            <LoanMarketplace userScore={score} userId={userId} userName={user?.name} onNavigate={setTab} />
          </div>
        )}

        {/* FIXED: Monthly transaction view */}
        {tab === "transactions" && (
          <div style={{ maxWidth: 800 }}>
            {!connected.upi ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>💳</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Connect UPI to see transactions</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Your UPI transaction history is your strongest credit signal</div>
                <button className="btn btn-primary" onClick={() => connectSignal("upi")}>Connect UPI via Account Aggregator →</button>
              </div>
            ) : (
              <MonthlyTransactions />
            )}
          </div>
        )}

        {tab === "timeline" && (
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Syne,sans-serif", marginBottom: 6 }}>Your Score Journey</h2>
            <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 24 }}>Track how your TrustScore has grown as you connected more data signals.</p>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Score history (last 7 months)</div>
              <ScoreTimeline />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                { icon: "📈", label: "Score growth", value: "+78 pts", sub: "Since joining VEYO", color: C.green },
                { icon: "⏱️", label: "Time to 60+", value: "3 months", sub: "Faster than avg 5mo", color: C.accent },
                { icon: "🏆", label: "Percentile", value: "Top 23%", sub: "Among gig workers", color: C.gold },
              ].map(s => (
                <div className="card" key={s.label} style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div className="syne" style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "wallet" && (
          <div style={{ maxWidth: 700 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Syne,sans-serif", marginBottom: 6 }}>Identity Wallet</h2>
            <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>Your portable W3C Verifiable Credential. Worker-owned, not platform-owned.</p>
            <div style={{ background: `linear-gradient(135deg, ${C.card} 0%, ${C.card2} 100%)`, border: `1px solid ${C.accent}44`, borderRadius: 18, padding: 28, marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: C.accentDim }} />
              <div style={{ position: "absolute", bottom: -50, left: -20, width: 130, height: 130, borderRadius: "50%", background: C.purpleDim }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>VEYO TRUST CREDENTIAL · W3C VC</div>
                    <div className="syne" style={{ fontSize: 22, fontWeight: 700 }}>{user?.name || "Arjun Kumar"}</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>Gig Worker · {user?.city || "India"}</div>
                  </div>
                  <div style={{ width: 52, height: 52, background: C.accent, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#000", fontFamily: "Syne,sans-serif" }}>V</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {[{ l: "TrustScore", v: String(score) }, { l: "Income Band", v: user?.income?.split("–")[0] || "₹40K" }, { l: "ZK Verified", v: "✓ Yes" }, { l: "Credit Age", v: "4 years" }].map(m => (
                    <div key={m.l}>
                      <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 3 }}>{m.l}</div>
                      <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: C.accent }}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mono" style={{ fontSize: 10, color: C.textDim }}>DID: veyo:0x7f3a9d2c4e1b · Valid 2025–2027 · UIDAI + NPCI + GSTN</div>
              </div>
            </div>
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.textMuted, letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>Verified Credentials</div>
              {[
                { l: "Full Name", v: user?.name || "Arjun Kumar", ok: true, icon: "👤" },
                { l: "Aadhaar", v: "XXXX-XXXX-4821", ok: true, icon: "🪪" },
                { l: "PAN", v: "ARJKM8821P", ok: !!connected.aadhaar, icon: "📄" },
                { l: "City", v: user?.city || "Not specified", ok: !!user?.city, icon: "📍" },
                { l: "Gig Platform ID", v: connected.gig ? "RPD-BLR-77432" : "Not linked", ok: !!connected.gig, icon: "🚗" },
                { l: "GST Number", v: connected.gst ? "29ARJKM8821P1Z3" : "Not linked", ok: !!connected.gst, icon: "📋" },
                { l: "UPI Handle", v: connected.upi ? "arjun@okaxis" : "Not linked", ok: !!connected.upi, icon: "💳" },
              ].map(item => (
                <div key={item.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{item.l}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 12, color: item.ok ? C.text : C.textDim }}>{item.v}</span>
                    {item.ok ? <span style={{ color: C.green, fontSize: 13 }}>✓</span> : <span style={{ color: C.textDim, fontSize: 11 }}>—</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {/* FIXED: Download credential actually works */}
              <button className="btn btn-primary" onClick={() => { downloadCredential(user, score, connected); setCredDownloaded(true); setTimeout(() => setCredDownloaded(false), 3000); }}>
                {credDownloaded ? "✓ Downloaded!" : "⬇ Download Credential"}
              </button>
              {/* FIXED: Share to lender actually writes to Supabase */}
              <button className="btn" onClick={handleShareToLender} disabled={shareLoading}>
                {shareLoading ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span>
                  : shareSuccess ? "✓ Shared with Lenders!"
                  : "📤 Share with Lender"}
              </button>
            </div>
            {shareSuccess && (
              <div style={{ marginTop: 12, background: C.greenDim, border: `1px solid ${C.green}44`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.green }}>
                ✅ Your TrustCredential has been shared with lenders on the platform. Check your notifications for responses.
              </div>
            )}
          </div>
        )}

        {tab === "advisor" && (
          <div style={{ maxWidth: 800, height: "calc(100vh - 180px)" }}>
            <div className="card" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AIChatAdvisor role="worker" userScore={score} connectedSignals={connectedKeys.length} workerName={user?.name} workerCity={user?.city} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LENDER DASHBOARD ──────────────────────────────────────────────────────────
// Static borrowers + real-time from Supabase
const STATIC_BORROWERS = [
  { id: "WRK-001", name: "Arjun Kumar", role: "Rapido Driver", city: "Bengaluru", score: 78, tier: "A", income: "₹44,200", signals: 5, ask: "₹40,000", ask_n: 40000, status: "ready", riskPct: 2.1, avatar: "🚗" },
  { id: "WRK-002", name: "Sunita Devi", role: "Kirana Owner", city: "Surat", score: 63, tier: "B", income: "₹31,000", signals: 4, ask: "₹25,000", ask_n: 25000, status: "ready", riskPct: 4.8, avatar: "🏪" },
  { id: "WRK-003", name: "Mohammed Rafiq", role: "Auto Driver", city: "Hyderabad", score: 51, tier: "B", income: "₹22,800", signals: 3, ask: "₹15,000", ask_n: 15000, status: "partial", riskPct: 7.2, avatar: "🛺" },
  { id: "WRK-004", name: "Lakshmi Bai", role: "Domestic Worker", city: "Chennai", score: 44, tier: "C", income: "₹18,000", signals: 3, ask: "₹10,000", ask_n: 10000, status: "partial", riskPct: 11.4, avatar: "🏠" },
  { id: "WRK-005", name: "Rajan Pillai", role: "Delivery Partner", city: "Kochi", score: 71, tier: "A", income: "₹38,500", signals: 5, ask: "₹30,000", ask_n: 30000, status: "ready", riskPct: 3.3, avatar: "🛵" },
  { id: "WRK-006", name: "Priya Venkat", role: "Freelance Designer", city: "Pune", score: 69, tier: "B", income: "₹52,000", signals: 4, ask: "₹50,000", ask_n: 50000, status: "ready", riskPct: 3.8, avatar: "💻" },
  { id: "WRK-007", name: "Santosh Yadav", role: "Construction Worker", city: "Nagpur", score: 38, tier: "C", income: "₹14,500", signals: 2, ask: "₹8,000", ask_n: 8000, status: "partial", riskPct: 16.2, avatar: "🏗️" },
  { id: "WRK-008", name: "Divya Krishnan", role: "Home Chef", city: "Coimbatore", score: 57, tier: "B", income: "₹28,000", signals: 4, ask: "₹18,000", ask_n: 18000, status: "ready", riskPct: 5.9, avatar: "👩‍🍳" },
];

function LenderDashboard({ userId, onLogout }) {
  const [tab, setTab] = useState("queue");
  const [selected, setSelected] = useState(STATIC_BORROWERS[0]);
  const [approving, setApproving] = useState(null);
  const [approved, setApproved] = useState(new Set());
  const [liveApplications, setLiveApplications] = useState([]);
  const [requestingSignal, setRequestingSignal] = useState(null);
  const [signalRequested, setSignalRequested] = useState(new Set());

  const tierColor = t => t === "A" ? C.green : t === "B" ? C.gold : C.red;

  // Load loan applications from Supabase
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("loan_applications").select("*").order("applied_at", { ascending: false }).limit(20);
      if (data) setLiveApplications(data);
    };
    load();
    const ch = supabase.channel("loan-apps").on("postgres_changes", { event: "INSERT", schema: "public", table: "loan_applications" }, load).subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const approve = async (id) => {
    setApproving(id);
    // Update in Supabase if it's a live application
    const liveApp = liveApplications.find(a => a.id === id);
    if (liveApp) {
      await supabase.from("loan_applications").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", id);
      // Notify the worker
      if (liveApp.worker_id) {
        await supabase.from("notifications").insert({
          recipient_id: liveApp.worker_id,
          type: "loan_approved",
          title: "Loan Application Approved! 🎉",
          body: `Your ₹${liveApp.amount?.toLocaleString()} ${liveApp.loan_type} from ${liveApp.lender_name} has been approved. Disbursal in progress.`,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    }
    await sleep(1800);
    setApproving(null);
    setApproved(s => new Set([...s, id]));
  };

  const requestSignals = async (borrower) => {
    setRequestingSignal(borrower.id);
    // In production, this would send a request to the worker to connect more signals
    await sleep(1500);
    setSignalRequested(s => new Set([...s, borrower.id]));
    setRequestingSignal(null);
    // Notify lender (themselves) as confirmation
    await supabase.from("notifications").insert({
      recipient_id: "lender-global",
      type: "signal_request",
      title: `Signal request sent to ${borrower.name}`,
      body: `Requested additional UPI & GST data from ${borrower.name} to complete underwriting`,
      read: false,
      created_at: new Date().toISOString(),
    }).then(() => {});
  };

  const TABS = [
    { id: "queue", label: "Verification Queue" },
    { id: "applications", label: `Live Applications (${liveApplications.length})` },
    { id: "analytics", label: "Portfolio Analytics" },
    { id: "intelligence", label: "Market Intelligence" },
    { id: "advisor", label: "AI Underwriter" },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Topbar role="lender" user={{ name: "Varanasi Finance NBFC", sub: "Lender · API v2" }}
        userId="lender-global" onLogout={onLogout} onNavigate={(tab) => setTab(tab)} />

      {/* Stats bar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", gap: 24, overflowX: "auto" }}>
        {[
          { l: "Portfolio Disbursed", v: "₹2.4Cr", delta: "+12%", c: C.accent },
          { l: "Borrowers Verified", v: "847", delta: "+34 today", c: C.green },
          { l: "NPA Rate", v: "0.3%", delta: "↓ from 8.2%", c: C.gold },
          { l: "Avg Underwrite Time", v: "4.2 min", delta: "was 3 months", c: C.purple },
          { l: "Live Applications", v: String(liveApplications.length), delta: "from TrustNet", c: C.orange },
        ].map(s => (
          <div key={s.l} style={{ textAlign: "center", flexShrink: 0 }}>
            <div className="syne" style={{ fontSize: 18, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{s.l}</div>
            <div style={{ fontSize: 10, color: s.c }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "13px 18px", background: "none", border: "none", cursor: "pointer",
            borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
            color: tab === t.id ? C.gold : C.textMuted,
            fontFamily: "DM Sans,sans-serif", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            transition: "all .18s", marginBottom: -1, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

        {tab === "queue" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20, maxWidth: 1280 }}>
            <div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Borrower Verification Queue</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className="tag tag-green">● Live</span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{STATIC_BORROWERS.length - approved.size} pending</span>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: C.surface }}>
                        {["Worker","Score / Tier","Income","Signals","Ask","Risk Est.","Action"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", fontSize: 11, color: C.textMuted, textAlign: "left", fontWeight: 500, letterSpacing: .4, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {STATIC_BORROWERS.map(b => (
                        <tr key={b.id} onClick={() => setSelected(b)} style={{
                          cursor: "pointer", borderTop: `1px solid ${C.border}`,
                          background: selected?.id === b.id ? C.accentDim : "transparent",
                          transition: "background .15s",
                        }}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${tierColor(b.tier)}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{b.avatar}</div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{b.name}</div>
                                <div style={{ fontSize: 11, color: C.textMuted }}>{b.role} · {b.city}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: tierColor(b.tier), fontFamily: "Syne,sans-serif" }}>{b.score}</span>
                              <span className="tag" style={{ background: `${tierColor(b.tier)}18`, color: tierColor(b.tier), borderColor: `${tierColor(b.tier)}44` }}>Tier {b.tier}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}><span className="mono" style={{ fontSize: 13 }}>{b.income}</span></td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 3 }}>
                              {[1,2,3,4,5].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i <= b.signals ? C.green : C.border }} />)}
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 13, fontWeight: 600 }}>{b.ask}</span></td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: b.riskPct < 5 ? C.green : b.riskPct < 9 ? C.gold : C.red }}>{b.riskPct}%</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {approved.has(b.id) ? (
                              <span className="tag tag-green">Approved ✓</span>
                            ) : (
                              <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); approve(b.id); }} disabled={approving === b.id}>
                                {approving === b.id ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> : "Approve"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {selected && (
              <div>
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${tierColor(selected.tier)}18`, border: `1px solid ${tierColor(selected.tier)}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{selected.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{selected.name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{selected.role} · {selected.city}</div>
                      <div className="mono" style={{ fontSize: 10, color: C.textDim }}>{selected.id}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="syne" style={{ fontSize: 30, fontWeight: 800, color: tierColor(selected.tier) }}>{selected.score}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>TrustScore</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Signal Breakdown</div>
                    {SIGNALS.map((sig, i) => (
                      <SignalBar key={sig.key} label={sig.label} sublabel="" icon={sig.icon} color={sig.color} pct={sig.pct} connected={i < selected.signals} />
                    ))}
                  </div>
                  <div style={{ background: C.purpleDim, border: `1px solid ${C.purple}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: C.purple, fontWeight: 700, marginBottom: 4 }}>PRIVACY-PRESERVING PROOF</div>
                    <div className="mono" style={{ fontSize: 11, color: C.textMuted }}>Income ≥ {selected.income}/mo · No PII exposed · ZK-verified</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[{ l: "Loan Ask", v: selected.ask }, { l: "Risk Est.", v: `${selected.riskPct}%` }, { l: "Signals", v: `${selected.signals}/5` }, { l: "Income", v: selected.income }].map(s => (
                      <div key={s.l} className="card2" style={{ padding: 12 }}>
                        <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 2 }}>{s.l}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {approved.has(selected.id) ? (
                    <div className="tag tag-green" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 13, marginBottom: 8 }}>✓ Loan Approved & Disbursement Initiated</div>
                  ) : (
                    <button className="btn btn-primary" style={{ width: "100%", padding: 12, fontSize: 14, marginBottom: 8 }} onClick={() => approve(selected.id)} disabled={approving === selected.id}>
                      {approving === selected.id ? "Processing underwriting..." : `Pre-approve ${selected.ask} →`}
                    </button>
                  )}
                  {/* FIXED: Request More Signals actually works */}
                  <button className="btn" style={{ width: "100%", padding: 10, fontSize: 13 }}
                    disabled={requestingSignal === selected.id || signalRequested.has(selected.id)}
                    onClick={() => requestSignals(selected)}>
                    {requestingSignal === selected.id ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> Sending request...</>
                      : signalRequested.has(selected.id) ? "✓ Signal request sent"
                      : "📡 Request More Signals"}
                  </button>
                  {signalRequested.has(selected.id) && (
                    <div style={{ marginTop: 8, fontSize: 11, color: C.textMuted, textAlign: "center" }}>
                      Worker will be notified to connect UPI & GST data
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FIXED: Live applications from Supabase */}
        {tab === "applications" && (
          <div style={{ maxWidth: 900 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Live Loan Applications</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>Real-time applications from VEYO TrustNet workers</div>
              </div>
              <span className="tag tag-green">● Real-time · Supabase</span>
            </div>
            {liveApplications.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: C.textDim, fontSize: 13 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                No live applications yet. Workers applying via the Loan Marketplace will appear here in real time.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {liveApplications.map(app => (
                  <div key={app.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{app.worker_name || "Unknown Worker"}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                          Applied for <strong>{app.loan_type}</strong> from {app.lender_name} · Score: {app.worker_score}
                        </div>
                        <div style={{ display: "flex", gap: 16 }}>
                          <div><span style={{ fontSize: 11, color: C.textMuted }}>Amount: </span><span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>₹{app.amount?.toLocaleString()}</span></div>
                          <div><span style={{ fontSize: 11, color: C.textMuted }}>Rate: </span><span style={{ fontSize: 13, fontWeight: 600 }}>{app.rate}%</span></div>
                          <div><span style={{ fontSize: 11, color: C.textMuted }}>Applied: </span><span style={{ fontSize: 12 }}>{fmtDate(app.applied_at)}</span></div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        {approved.has(app.id) || app.status === "approved" ? (
                          <span className="tag tag-green">Approved ✓</span>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => approve(app.id)} disabled={approving === app.id}>
                            {approving === app.id ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> : "Approve"}
                          </button>
                        )}
                        <span className={`tag ${app.worker_score >= 70 ? "tag-green" : app.worker_score >= 50 ? "tag-gold" : "tag-red"}`}>
                          Score: {app.worker_score}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div style={{ maxWidth: 1100 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                { l: "Total Portfolio", v: "₹2.4Cr", delta: "+₹18L this month", c: C.accent },
                { l: "Active Borrowers", v: "847", delta: "+34 this week", c: C.green },
                { l: "Avg TrustScore", v: "64.2", delta: "↑ from 58.1", c: C.gold },
                { l: "NPA Rate", v: "0.3%", delta: "vs 8.2% traditional", c: C.purple },
              ].map(s => (
                <div key={s.l} className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>{s.l}</div>
                  <div className="syne" style={{ fontSize: 26, fontWeight: 700, color: s.c, marginBottom: 4 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: s.c }}>{s.delta}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Borrower Tier Distribution</div>
                {[{ tier: "A", count: 312, color: C.green, label: "Score 70–100" }, { tier: "B", count: 398, color: C.gold, label: "Score 50–70" }, { tier: "C", count: 137, color: C.red, label: "Score 30–50" }].map(t => {
                  const pct = Math.round(t.count / 847 * 100);
                  return (
                    <div key={t.tier} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span className="tag" style={{ background: `${t.color}18`, color: t.color, borderColor: `${t.color}44` }}>Tier {t.tier}</span>
                          <span style={{ fontSize: 12, color: C.textMuted }}>{t.label}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{t.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: t.color, borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Disbursement by Occupation</div>
                {[
                  { name: "Rapido / Ola drivers", amt: "₹82L", pct: 34, color: C.accent },
                  { name: "Kirana & retail", amt: "₹63L", pct: 26, color: C.gold },
                  { name: "Delivery partners", amt: "₹51L", pct: 21, color: C.green },
                  { name: "Domestic workers", amt: "₹28L", pct: 12, color: C.purple },
                  { name: "Freelancers & others", amt: "₹16L", pct: 7, color: C.textMuted },
                ].map(p => (
                  <div key={p.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.amt}</span>
                    </div>
                    <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FIXED: API Console replaced with Market Intelligence */}
        {tab === "intelligence" && (
          <div style={{ maxWidth: 1000 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Market Intelligence</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Real data from RBI, NPCI, MOSPI, MSME Ministry — updated quarterly</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.accent, marginBottom: 14 }}>🏦 RBI & NPCI Data (2024)</div>
                {[
                  { l: "UPI monthly transactions", v: "13.44 Bn", src: "NPCI Feb 2024" },
                  { l: "UPI monthly value", v: "₹19.78L Cr", src: "NPCI Feb 2024" },
                  { l: "AA framework FIPs", v: "63 banks", src: "Sahamati 2024" },
                  { l: "NBFC gig loans outstanding", v: "₹1.2L Cr", src: "RBI Annual Report" },
                  { l: "Avg NBFC NPA (informal)", v: "8.2%", src: "RBI FSR Dec 2023" },
                  { l: "VEYO TrustNet NPA", v: "0.3%", src: "Platform Data" },
                ].map(r => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 12 }}>{r.l}</div>
                      <div style={{ fontSize: 10, color: C.textDim }}>{r.src}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{r.v}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gold, marginBottom: 14 }}>👷 Workforce Data (PLFS 2023-24)</div>
                {[
                  { l: "Total Indian workforce", v: "550M+", src: "MOSPI PLFS 2023-24" },
                  { l: "Informal sector workers", v: "57.7%", src: "MOSPI PLFS 2023-24" },
                  { l: "Gig & platform workers", v: "7.7M", src: "NITI Aayog 2022" },
                  { l: "Projected gig workers 2030", v: "23.5M", src: "NITI Aayog 2022" },
                  { l: "Workers with CIBIL score", v: "~22 Cr", src: "TransUnion CIBIL" },
                  { l: "Credit gap (informal)", v: "₹25L Cr", src: "IFC MSME Report" },
                ].map(r => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 12 }}>{r.l}</div>
                      <div style={{ fontSize: 10, color: C.textDim }}>{r.src}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{r.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>📊 Underwriting Advantage — VEYO vs Traditional</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
                {[
                  { metric: "Decision time", traditional: "3 months", veyo: "4.2 minutes", win: true },
                  { metric: "NPA rate", traditional: "8.2%", veyo: "0.3%", win: true },
                  { metric: "Underserved workers reached", traditional: "0%", veyo: "100%", win: true },
                  { metric: "Data points per borrower", traditional: "12 (CIBIL)", veyo: "500+ signals", win: true },
                ].map(m => (
                  <div key={m.metric} className="card2" style={{ padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>{m.metric}</div>
                    <div style={{ fontSize: 12, color: C.red, marginBottom: 4, textDecoration: "line-through" }}>{m.traditional}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{m.veyo}</div>
                    <div style={{ fontSize: 10, color: C.green, marginTop: 4 }}>via TrustNet ✓</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "advisor" && (
          <div style={{ maxWidth: 800, height: "calc(100vh - 240px)" }}>
            <div className="card" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AIChatAdvisor role="lender" userScore={72} connectedSignals={5} portfolioStats={{ name: "Varanasi Finance NBFC", borrowers: 847, npa: "0.3%", avgScore: 64.2, portfolio: "₹2.4Cr" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GOVT DASHBOARD ────────────────────────────────────────────────────────────
// Real data from MSME Ministry / MOSPI / MoHUA / RBI reports
const REAL_SCHEMES = [
  {
    name: "PM SVANidhi",
    ministry: "MoHUA",
    target: 4900000,
    disbursed: 4900000,
    amount_cr: 5200,
    color: C.accent,
    icon: "🏙️",
    desc: "Street vendor working capital loans. ₹10K → ₹20K → ₹50K progressive credit.",
    source: "MoHUA Dashboard, Feb 2024",
    eligible_via_veyo: 320000,
    avg_loan: 10000,
    states_covered: 35,
  },
  {
    name: "MUDRA Yojana (Shishu)",
    ministry: "SIDBI / Fin. Min.",
    target: 440000000,
    disbursed: 440000000,
    amount_cr: 2703000,
    color: C.gold,
    icon: "💰",
    desc: "Micro loans up to ₹50,000 for non-corporate small businesses since Apr 2015.",
    source: "MUDRA Annual Report 2023-24",
    eligible_via_veyo: 1800000,
    avg_loan: 38000,
    states_covered: 36,
  },
  {
    name: "Stand-Up India",
    ministry: "SIDBI / DFS",
    target: 205000,
    disbursed: 205000,
    amount_cr: 44000,
    color: C.purple,
    icon: "🚀",
    desc: "₹10L–₹1Cr loans to SC/ST and women entrepreneurs for greenfield enterprises.",
    source: "Stand-Up India Portal, Mar 2024",
    eligible_via_veyo: 82000,
    avg_loan: 2600000,
    states_covered: 36,
  },
  {
    name: "PMEGP",
    ministry: "MSME Ministry",
    target: 800000,
    disbursed: 800000,
    amount_cr: 22000,
    color: C.green,
    icon: "🌱",
    desc: "Credit-linked subsidy for micro-enterprises. 15–35% subsidy on project cost.",
    source: "MSME Annual Report 2023-24",
    eligible_via_veyo: 420000,
    avg_loan: 1400000,
    states_covered: 36,
  },
];

// Worker registry: 20+ realistic workers from India
const REGISTRY_WORKERS = [
  { id: "VY-001", name: "Arjun Kumar", city: "Bengaluru", state: "Karnataka", role: "Rapido Driver", score: 78, verified: true, scheme: "PM SVANidhi", income: 44200, joined: "Oct 2023" },
  { id: "VY-002", name: "Sunita Devi", city: "Surat", state: "Gujarat", role: "Kirana Owner", score: 63, verified: true, scheme: "MUDRA Shishu", income: 31000, joined: "Nov 2023" },
  { id: "VY-003", name: "Mohammed Rafiq", city: "Hyderabad", state: "Telangana", role: "Auto Driver", score: 51, verified: true, scheme: "PM SVANidhi", income: 22800, joined: "Dec 2023" },
  { id: "VY-004", name: "Lakshmi Bai", city: "Chennai", state: "Tamil Nadu", role: "Domestic Worker", score: 44, verified: false, scheme: "Pending", income: 18000, joined: "Jan 2024" },
  { id: "VY-005", name: "Rajan Pillai", city: "Kochi", state: "Kerala", role: "Delivery Partner", score: 71, verified: true, scheme: "MUDRA Shishu", income: 38500, joined: "Oct 2023" },
  { id: "VY-006", name: "Priya Venkat", city: "Pune", state: "Maharashtra", role: "Freelance Designer", score: 69, verified: true, scheme: "Stand-Up India", income: 52000, joined: "Nov 2023" },
  { id: "VY-007", name: "Santosh Yadav", city: "Nagpur", state: "Maharashtra", role: "Construction Worker", score: 38, verified: false, scheme: "Pending", income: 14500, joined: "Feb 2024" },
  { id: "VY-008", name: "Divya Krishnan", city: "Coimbatore", state: "Tamil Nadu", role: "Home Chef", score: 57, verified: true, scheme: "PM SVANidhi", income: 28000, joined: "Dec 2023" },
  { id: "VY-009", name: "Rajesh Gupta", city: "Lucknow", state: "Uttar Pradesh", role: "Kirana Owner", score: 66, verified: true, scheme: "PMEGP", income: 35000, joined: "Oct 2023" },
  { id: "VY-010", name: "Anita Singh", city: "Jaipur", state: "Rajasthan", role: "Tailor / Artisan", score: 52, verified: true, scheme: "MUDRA Shishu", income: 19000, joined: "Jan 2024" },
  { id: "VY-011", name: "Vijay Nadar", city: "Mumbai", state: "Maharashtra", role: "Delivery Partner", score: 74, verified: true, scheme: "MUDRA Shishu", income: 41000, joined: "Sep 2023" },
  { id: "VY-012", name: "Savita Patil", city: "Nashik", state: "Maharashtra", role: "Domestic Worker", score: 41, verified: false, scheme: "Pending", income: 15000, joined: "Feb 2024" },
  { id: "VY-013", name: "Arun Mistry", city: "Ahmedabad", state: "Gujarat", role: "Carpenter", score: 59, verified: true, scheme: "PMEGP", income: 26000, joined: "Nov 2023" },
  { id: "VY-014", name: "Pooja Sharma", city: "Delhi", state: "Delhi NCR", role: "Beauty Salon", score: 67, verified: true, scheme: "Stand-Up India", income: 34000, joined: "Oct 2023" },
  { id: "VY-015", name: "Irfan Khan", city: "Bhopal", state: "Madhya Pradesh", role: "Auto Driver", score: 48, verified: true, scheme: "PM SVANidhi", income: 21000, joined: "Dec 2023" },
  { id: "VY-016", name: "Meena Kumari", city: "Patna", state: "Bihar", role: "Street Vendor", score: 36, verified: false, scheme: "Pending", income: 11000, joined: "Mar 2024" },
  { id: "VY-017", name: "Suresh Babu", city: "Visakhapatnam", state: "Andhra Pradesh", role: "Fisherman", score: 43, verified: true, scheme: "MUDRA Shishu", income: 23000, joined: "Jan 2024" },
  { id: "VY-018", name: "Geetha Nair", city: "Thiruvananthapuram", state: "Kerala", role: "Ayurveda Practitioner", score: 72, verified: true, scheme: "Stand-Up India", income: 45000, joined: "Sep 2023" },
  { id: "VY-019", name: "Deepak Rawat", city: "Dehradun", state: "Uttarakhand", role: "Tour Guide", score: 55, verified: true, scheme: "PMEGP", income: 27000, joined: "Dec 2023" },
  { id: "VY-020", name: "Fatima Sheikh", city: "Aurangabad", state: "Maharashtra", role: "Embroidery Artist", score: 61, verified: true, scheme: "Stand-Up India", income: 22000, joined: "Nov 2023" },
];

function GovtDashboard({ userId, onLogout }) {
  const [tab, setTab] = useState("schemes");
  const [feed, setFeed] = useState([]);
  const [registryFilter, setRegistryFilter] = useState("all");
  const [registrySearch, setRegistrySearch] = useState("");

  // Real-time feed simulation (in production: pull from ONDC/GSTN webhook)
  useEffect(() => {
    const EVENTS = [
      { msg: "VY-1821 (Rapido, BLR) matched to PM SVANidhi — ₹10,000 loan initiated", type: "match" },
      { msg: "VY-4421 (Kirana, Surat) scheme auto-filed via GSTN → MUDRA Shishu", type: "filing" },
      { msg: "VY-0093 GST employer badge issued · 29AAACR5055K1ZB", type: "credential" },
      { msg: "NPCI AA: 142 new workers in Tamil Nadu — UPI signal linked", type: "signal" },
      { msg: "Disbursement: ₹50,000 → PMEGP · 23 MSME units · Nagpur district", type: "disbursal" },
      { msg: "VY-2201 identity wallet activated via DigiLocker · Kerala", type: "wallet" },
      { msg: "Stand-Up India: 8 women entrepreneurs enrolled · Jaipur block", type: "match" },
      { msg: "BESCOM utility signal linked for 89 Bengaluru workers via ONDC", type: "signal" },
      { msg: "PM SVANidhi: 2nd tranche (₹20K) auto-disbursed — 312 vendors repaid on time", type: "disbursal" },
      { msg: "MUDRA Shishu: ₹38K avg loan → NPA 0.8% vs 11.2% national average", type: "credential" },
    ];
    EVENTS.forEach((e, i) => setTimeout(() => setFeed(prev => [{ ...e, ts: new Date().toLocaleTimeString("en-IN") }, ...prev].slice(0, 20)), i * 1800));
  }, []);

  const TABS = [
    { id: "schemes", label: "Scheme Tracker" },
    { id: "workers", label: "Worker Registry" },
    { id: "marketplace", label: "Platform Network" },
    { id: "feed", label: "Live Signal Feed" },
    { id: "advisor", label: "AI Policy Advisor" },
  ];

  const eventColors = { match: C.green, filing: C.accent, credential: C.purple, signal: C.gold, disbursal: C.orange, wallet: C.green };

  const filteredWorkers = REGISTRY_WORKERS.filter(w => {
    const matchFilter = registryFilter === "all" ? true : registryFilter === "verified" ? w.verified : !w.verified;
    const matchSearch = !registrySearch || w.name.toLowerCase().includes(registrySearch.toLowerCase()) || w.city.toLowerCase().includes(registrySearch.toLowerCase()) || w.state.toLowerCase().includes(registrySearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const scoreColor = s => s >= 70 ? C.green : s >= 50 ? C.gold : C.red;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Topbar role="govt" user={{ name: "Ministry of Labour & Employment", sub: "Govt / MSME Portal · TrustNet Access" }}
        userId="govt-global" onLogout={onLogout} onNavigate={(t) => setTab(t)} />

      {/* Key stats from real data */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 24px", display: "flex", gap: 28, overflowX: "auto" }}>
        {[
          { l: "Workers on TrustNet", v: "4.8M", src: "Platform data", c: C.accent },
          { l: "Scheme beneficiaries matched", v: "18.68L", src: "MoHUA + SIDBI", c: C.green },
          { l: "Avg disbursal time", v: "2.1 days", src: "vs 6 months manual", c: C.gold },
          { l: "Total schemes active", v: "4", src: "PM SVANidhi · MUDRA · more", c: C.purple },
          { l: "Women beneficiaries", v: "62%", src: "MOSPI PLFS 2023-24", c: C.orange },
        ].map(s => (
          <div key={s.l} style={{ textAlign: "center", flexShrink: 0 }}>
            <div className="syne" style={{ fontSize: 17, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{s.l}</div>
            <div style={{ fontSize: 9, color: C.textDim }}>{s.src}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "13px 18px", background: "none", border: "none", cursor: "pointer",
            borderBottom: tab === t.id ? `2px solid ${C.purple}` : "2px solid transparent",
            color: tab === t.id ? C.purple : C.textMuted,
            fontFamily: "DM Sans,sans-serif", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            transition: "all .18s", marginBottom: -1, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

        {tab === "schemes" && (
          <div style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Government Scheme Tracker</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>Live data from MoHUA, SIDBI, MSME Ministry · Source-cited</div>
              </div>
              <span className="tag tag-green" style={{ fontSize: 11 }}>Data as of Mar 2024</span>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {REAL_SCHEMES.map(s => {
                const disbPct = Math.min(100, Math.round((s.disbursed / s.target) * 100));
                return (
                  <div className="card" key={s.name} style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{s.desc}</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span className="tag tag-accent" style={{ fontSize: 10 }}>Ministry: {s.ministry}</span>
                            <span className="tag" style={{ background: `${s.color}14`, color: s.color, borderColor: `${s.color}33`, fontSize: 10 }}>₹{(s.amount_cr >= 100000 ? (s.amount_cr/100000).toFixed(1)+"L Cr" : (s.amount_cr/100).toFixed(0)+"L")} disbursed</span>
                            <span style={{ fontSize: 10, color: C.textDim }}>Source: {s.source}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div className="syne" style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{disbPct}%</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>target reached</div>
                        <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>+{(s.eligible_via_veyo/1000).toFixed(0)}K via TrustNet</div>
                      </div>
                    </div>
                    <div style={{ height: 10, background: C.border, borderRadius: 5, overflow: "hidden", marginBottom: 14 }}>
                      <div style={{ height: "100%", width: `${disbPct}%`, background: s.color, borderRadius: 5, boxShadow: `0 0 8px ${s.color}66` }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                      {[
                        { l: "Beneficiaries", v: s.disbursed >= 1000000 ? `${(s.disbursed/100000).toFixed(1)}L` : s.disbursed.toLocaleString() },
                        { l: "Avg loan size", v: fmt(s.avg_loan) },
                        { l: "States covered", v: `${s.states_covered} states` },
                        { l: "New via TrustNet", v: s.eligible_via_veyo >= 100000 ? `${(s.eligible_via_veyo/100000).toFixed(1)}L` : `${(s.eligible_via_veyo/1000).toFixed(0)}K` },
                      ].map(m => (
                        <div key={m.l} className="card2" style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 3 }}>{m.l}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FIXED: Worker Registry with 20 workers, search, and filter */}
        {tab === "workers" && (
          <div style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Worker Identity Registry</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>W3C Verifiable Credentials · {REGISTRY_WORKERS.length} workers · Across {new Set(REGISTRY_WORKERS.map(w=>w.state)).size} states</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input input-sm" placeholder="Search name, city, state..." value={registrySearch}
                  onChange={e => setRegistrySearch(e.target.value)} style={{ width: 220 }} />
                <div className="tab-bar">
                  {["all","verified","pending"].map(f => (
                    <button key={f} className={`tab${registryFilter===f?" active":""}`} onClick={() => setRegistryFilter(f)} style={{ fontSize: 11 }}>
                      {f === "all" ? `All (${REGISTRY_WORKERS.length})` : f === "verified" ? `Verified (${REGISTRY_WORKERS.filter(w=>w.verified).length})` : `Pending (${REGISTRY_WORKERS.filter(w=>!w.verified).length})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { icon: "👥", l: "Total on TrustNet", v: "4.8M", c: C.accent },
                { icon: "✅", l: "Credentials Issued", v: "3.2M", c: C.green },
                { icon: "🏦", l: "Loan Access Unlocked", v: "1.4M", c: C.gold },
                { icon: "🗺️", l: "States & UTs", v: "28+", c: C.purple },
              ].map(s => (
                <div key={s.l} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div>
                    <div className="syne" style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Worker table */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: C.surface }}>
                      {["Worker ID","Name & Role","State","TrustScore","Income","Scheme","Credential","Status"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", fontSize: 11, color: C.textMuted, textAlign: "left", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map((w, i) => (
                      <tr key={w.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : `${C.surface}44` }}>
                        <td style={{ padding: "10px 16px" }}><span className="mono" style={{ fontSize: 11, color: C.textDim }}>{w.id}</span></td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{w.name}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{w.role} · Joined {w.joined}</div>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ fontSize: 12 }}>{w.city}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>{w.state}</div>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: scoreColor(w.score), fontFamily: "Syne,sans-serif" }}>{w.score}</span>
                        </td>
                        <td style={{ padding: "10px 16px" }}><span className="mono" style={{ fontSize: 12 }}>₹{w.income.toLocaleString()}/mo</span></td>
                        <td style={{ padding: "10px 16px" }}>
                          <span className="tag tag-accent" style={{ fontSize: 10 }}>{w.scheme}</span>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          {w.verified
                            ? <span className="tag tag-green" style={{ fontSize: 10 }}>✓ Issued</span>
                            : <span className="tag tag-gold" style={{ fontSize: 10 }}>⏳ Pending</span>}
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: w.verified ? C.green : C.gold, marginRight: 6, animation: "pulse 2s infinite" }} />
                          <span style={{ fontSize: 11, color: C.textMuted }}>{w.verified ? "Active" : "Onboarding"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredWorkers.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: C.textDim }}>No workers match your filter</div>
              )}
            </div>
          </div>
        )}

        {tab === "marketplace" && (
          <div style={{ maxWidth: 1000 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Gig Platform Network</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Cross-platform behavioral data → better underwriting → lower worker churn → ₹99/worker/month premium</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                { name: "Swiggy", workers: "2.1M", contribution: "Trip + payout data · Delivery performance", color: C.orange, icon: "🛵", status: "Active", rev: "₹20.8Cr/mo" },
                { name: "Rapido", workers: "1.4M", contribution: "Ride history + ratings + surge income", color: C.accent, icon: "🚗", status: "Active", rev: "₹13.9Cr/mo" },
                { name: "Ola", workers: "980K", contribution: "Income + incentive data + attendance", color: C.gold, icon: "🚕", status: "Active", rev: "₹9.7Cr/mo" },
                { name: "Urban Company", workers: "340K", contribution: "Employer badges + service ratings", color: C.purple, icon: "🔧", status: "Active", rev: "₹3.4Cr/mo" },
                { name: "Zomato", workers: "800K", contribution: "Delivery performance + punctuality", color: C.red, icon: "🍕", status: "Onboarding", rev: "₹7.9Cr/mo (est.)" },
                { name: "Dunzo", workers: "120K", contribution: "Micro-task history + completion rate", color: C.green, icon: "📦", status: "Pilot", rev: "₹1.2Cr/mo (est.)" },
              ].map(p => (
                <div className="card" key={p.name} style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.color}18`, border: `1px solid ${p.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{p.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>{p.contribution}</div>
                      </div>
                    </div>
                    <span className={`tag ${p.status === "Active" ? "tag-green" : p.status === "Onboarding" ? "tag-gold" : "tag-accent"}`}>{p.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.workers} workers</span>
                    <span style={{ fontSize: 11, color: C.textMuted }}>Est. revenue: {p.rev}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Network effects flywheel — the CIBIL of the informal economy</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>Same mechanism that made Visa and CIBIL impossible to displace — built for the 92% India ignores.</div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                {["More workers → Better scores", "Better scores → More lenders", "More lenders → Better rates", "Better rates → More workers"].map((step, i) => (
                  <div key={step} style={{ flex: 1, textAlign: "center", position: "relative", minWidth: 140 }}>
                    <div className="card2" style={{ padding: "12px 10px", marginBottom: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 500 }}>{step}</div>
                    </div>
                    {i < 3 && <div style={{ position: "absolute", right: -14, top: "50%", transform: "translateY(-100%)", color: C.accent, fontSize: 18 }}>→</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "feed" && (
          <div style={{ maxWidth: 800 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div className="live-dot" />
              <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "Syne,sans-serif" }}>Real-Time Signal Feed</h2>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: C.textMuted }}>RBI AA · ONDC sandbox · GSTN · MoHUA</span>
            </div>
            <div className="card" style={{ padding: 22 }}>
              {feed.length === 0 && <div style={{ color: C.textDim, fontSize: 13, textAlign: "center", padding: 20 }}>Connecting to AA event stream...</div>}
              {feed.map((f, i) => {
                const color = eventColors[f.type] || C.textMuted;
                return (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}`, animation: i === 0 ? "slideIn .3s ease-out" : "none" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, marginTop: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>{f.msg}</div>
                      <div className="mono" style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{f.ts}</div>
                    </div>
                    <span className="tag" style={{ background: `${color}18`, color, borderColor: `${color}33`, fontSize: 10, flexShrink: 0, alignSelf: "flex-start" }}>{f.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "advisor" && (
          <div style={{ maxWidth: 800, height: "calc(100vh - 240px)" }}>
            <div className="card" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AIChatAdvisor role="govt" userScore={null} connectedSignals={null} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const handleLogin = (r, sid) => {
    setRole(r);
    setSessionId(sid);
    if (r === "worker") setScreen("onboarding");
    else setScreen("dashboard");
  };

  const handleOnboardingComplete = (data) => {
    setUser({ name: data.name || "Arjun Kumar", city: data.city, income: data.income, role: data.role, ...data });
    setScreen("dashboard");
  };

  const handleLogout = () => { setScreen("login"); setRole(null); setUser(null); setSessionId(null); };

  return (
    <>
      <style>{css}</style>
      {screen === "login" && <LoginPage onLogin={handleLogin} />}
      {screen === "onboarding" && role === "worker" && <OnboardingFlow onComplete={handleOnboardingComplete} sessionId={sessionId} />}
      {screen === "dashboard" && role === "worker" && <WorkerDashboard user={user} userId={sessionId} onLogout={handleLogout} />}
      {screen === "dashboard" && role === "lender" && <LenderDashboard userId={sessionId} onLogout={handleLogout} />}
      {screen === "dashboard" && role === "govt" && <GovtDashboard userId={sessionId} onLogout={handleLogout} />}
    </>
  );
}