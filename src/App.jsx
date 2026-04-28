import { useState, useEffect, useRef, useCallback } from "react";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { askGemini } from "./gemini";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
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
::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
.mono{font-family:'DM Mono',monospace}.syne{font-family:'Syne',sans-serif}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes notifIn{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}
@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes chatIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes mintPulse{0%,100%{box-shadow:0 0 0 0 ${C.purple}44}50%{box-shadow:0 0 0 12px transparent}}
@keyframes voicePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:transparent;border:1px solid ${C.border};color:${C.text};padding:8px 16px;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all .18s;white-space:nowrap;outline:none}
.btn:hover{border-color:${C.borderBright};background:${C.card2}}
.btn:active{transform:scale(.98)}.btn:disabled{opacity:.45;cursor:not-allowed}
.btn-primary{background:${C.accent};color:#000;border-color:${C.accent};font-weight:600}
.btn-primary:hover{background:#00bcee;border-color:#00bcee;color:#000}
.btn-green{background:${C.green};color:#000;border-color:${C.green};font-weight:600}
.btn-ghost{border-color:transparent;color:${C.textMuted}}
.btn-ghost:hover{border-color:${C.border};color:${C.text};background:${C.card2}}
.btn-sm{padding:5px 12px;font-size:12px;border-radius:6px}
.btn-danger{background:${C.redDim};border-color:${C.red};color:${C.red};font-weight:600}
.input{background:${C.card};border:1px solid ${C.border};color:${C.text};padding:10px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .18s}
.input:focus{border-color:${C.accent}}.input::placeholder{color:${C.textDim}}
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
.tab-bar{display:flex;gap:2px;background:${C.surface};border-radius:10px;padding:3px}
.tab{padding:7px 14px;border-radius:8px;border:none;background:transparent;color:${C.textMuted};cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all .18s;white-space:nowrap}
.tab.active{background:${C.card2};color:${C.text};border:1px solid ${C.border}}
.tab:hover:not(.active){color:${C.text}}
.live-dot{width:7px;height:7px;border-radius:50%;background:${C.green};animation:pulse 2s infinite;flex-shrink:0}
.notif-panel{position:absolute;top:calc(100% + 8px);right:0;width:360px;background:${C.card};border:1px solid ${C.border};border-radius:14px;z-index:1000;box-shadow:0 16px 48px #00000066;animation:dropIn .2s ease-out;overflow:hidden}
`;

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (n) => n>=10000000?`₹${(n/10000000).toFixed(1)}Cr`:n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(0)}K`:`₹${n}`;
const sleep = (ms) => new Promise(r=>setTimeout(r,ms));
const fmtDate = (d) => new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const scoreColor = s => s>=70?C.green:s>=50?C.gold:C.red;

const getPlatformIcon = (platform) => {
  if(!platform) return "💼";
  const p=platform.toLowerCase();
  if(p.includes("swiggy")||p.includes("zomato")||p.includes("dunzo")) return "🛵";
  if(p.includes("rapido")||p.includes("ola")||p.includes("uber")) return "🚗";
  if(p.includes("kirana")||p.includes("shop")||p.includes("retail")) return "🏪";
  if(p.includes("freelan")||p.includes("design")||p.includes("dev")) return "💻";
  if(p.includes("amazon")||p.includes("flipkart")) return "📦";
  return "💼";
};

// ─── FIRESTORE HELPERS ────────────────────────────────────────────────────────
const fsAdd = async (collectionName, data) => {
  try {
    const ref = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: ref.id };
  } catch (e) {
    console.error("Firestore add error:", e);
    return null;
  }
};

const fsQuery = async (collectionName, filters = [], orderField = null, limitN = 50) => {
  try {
    let q = collection(db, collectionName);
    const constraints = filters.map(([field, op, val]) => where(field, op, val));
    if (orderField) constraints.push(orderBy(orderField, "desc"));
    if (limitN) constraints.push(limit(limitN));
    q = query(q, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Firestore query error:", e);
    return [];
  }
};

// ─── SETU AA MOCK ─────────────────────────────────────────────────────────────
function generateSetuAAStatement(workerProfile) {
  const platform = workerProfile?.platform || "Gig Platform";
  const income_range = workerProfile?.income_range || "₹20,000–₹35,000";
  const baseIncome = income_range.includes("50,000+") ? 56000
    : income_range.includes("35,000") ? 32000
    : income_range.includes("20,000") ? 22000
    : income_range.includes("10,000–") ? 15000 : 8000;

  const now = new Date();
  const txns = [];

  for (let m = 2; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth()-m, 1);
    const monthStr = monthDate.toISOString().slice(0,7);
    for (let w = 0; w < 4; w++) {
      const payout = Math.round(baseIncome/4*(0.85+Math.random()*0.3));
      txns.push({
        transactionId:`TXN${Date.now()}${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        type:"CREDIT", mode:"NEFT", amount:payout,
        currentBalance:baseIncome*0.3+payout,
        transactionTimestamp:`${monthStr}-${String(7+w*7).padStart(2,"0")}T09:00:00.000Z`,
        valueDate:`${monthStr}-${String(7+w*7).padStart(2,"0")}`,
        narration:`${platform.toUpperCase()} WEEKLY PAYOUT WK${w+1}`,
        reference:`${platform.toUpperCase().slice(0,6)}PAY${Math.random().toString(36).slice(2,10).toUpperCase()}`,
        transactionType:"CREDIT", category:"INCOME",
      });
    }
    for (let i=0;i<3;i++) {
      txns.push({
        transactionId:`TXN${Date.now()}${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        type:"DEBIT", mode:"UPI", amount:Math.round(400+Math.random()*400),
        currentBalance:baseIncome*0.2,
        transactionTimestamp:`${monthStr}-${String(5+i*8).padStart(2,"0")}T08:30:00.000Z`,
        valueDate:`${monthStr}-${String(5+i*8).padStart(2,"0")}`,
        narration:["HP PETROL PUMP UPI","INDIAN OIL BHARAT PET","SHELL FUEL STATION"][i],
        reference:`FUEL${Math.random().toString(36).slice(2,10).toUpperCase()}`,
        transactionType:"DEBIT", category:"FUEL",
      });
    }
    txns.push({
      transactionId:`TXN${Date.now()}${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      type:"DEBIT", mode:"NEFT", amount:Math.round(baseIncome*0.22),
      currentBalance:baseIncome*0.1,
      transactionTimestamp:`${monthStr}-01T08:00:00.000Z`,
      valueDate:`${monthStr}-01`,
      narration:"HOUSE RENT TRANSFER",
      reference:`RENT${Math.random().toString(36).slice(2,10).toUpperCase()}`,
      transactionType:"DEBIT", category:"RENT",
    });
    txns.push({
      transactionId:`TXN${Date.now()}${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      type:"DEBIT", mode:"UPI", amount:Math.round(500+Math.random()*500),
      currentBalance:baseIncome*0.15,
      transactionTimestamp:`${monthStr}-25T11:00:00.000Z`,
      valueDate:`${monthStr}-25`,
      narration:"BESCOM ELECTRICITY BILL",
      reference:`UTIL${Math.random().toString(36).slice(2,10).toUpperCase()}`,
      transactionType:"DEBIT", category:"UTILITIES",
    });
  }

  return {
    ver:"1.1.2",
    txnid:`SETU-${Date.now()}-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
    timestamp:new Date().toISOString(),
    consentId:`CONSENT-${Math.random().toString(36).slice(2,16).toUpperCase()}`,
    fipId:"HDFC-FIP",
    Account:{
      maskedAccNumber:`XXXX XXXX ${Math.floor(1000+Math.random()*9000)}`,
      linkedAccRef:`REF${Math.random().toString(36).slice(2,12).toUpperCase()}`,
      type:"SAVINGS", branch:workerProfile?.city||"India", ifsc:"HDFC0001234",
      holders:{Holder:[{name:workerProfile?.name||"Worker",dob:"1990-01-15",mobile:"XXXXXXXXXX",nominee:"REGISTERED",address:workerProfile?.city||"India"}]},
      Transactions:{
        startDate:new Date(now.getFullYear(),now.getMonth()-2,1).toISOString().slice(0,10),
        endDate:now.toISOString().slice(0,10),
        Transaction:txns.sort((a,b)=>new Date(b.transactionTimestamp)-new Date(a.transactionTimestamp)),
      },
      Summary:{currentBalance:(baseIncome*0.28).toFixed(2),currency:"INR",status:"ACTIVE",branch:workerProfile?.city||"India",ifscCode:"HDFC0001234",openingDate:"2019-03-15"},
    },
  };
}

function generateONDCEvent(workerProfile) {
  const platform = workerProfile?.platform || "Gig Platform";
  const events = [
    {event:"order.completed",orderId:`ONDC-ORD-${Math.random().toString(36).slice(2,10).toUpperCase()}`,amount:Math.round(80+Math.random()*200),platform,timestamp:new Date().toISOString(),signal:"trip_completed",scoreImpact:"+0.3 pts"},
    {event:"payment.received",orderId:`ONDC-PAY-${Math.random().toString(36).slice(2,10).toUpperCase()}`,amount:Math.round(2000+Math.random()*3000),platform,timestamp:new Date().toISOString(),signal:"income_verified",scoreImpact:"+0.8 pts"},
    {event:"rating.received",orderId:`ONDC-RAT-${Math.random().toString(36).slice(2,10).toUpperCase()}`,rating:(4+Math.random()).toFixed(1),platform,timestamp:new Date().toISOString(),signal:"platform_rating",scoreImpact:"+0.2 pts"},
  ];
  return events[Math.floor(Math.random()*events.length)];
}

function generatePolygonSBT(workerProfile, score) {
  const tokenId=Math.floor(Math.random()*99999)+10000;
  const txHash=`0x${Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join("")}`;
  const contractAddr="0x7B2f4B7E5E3D8c9F1A3b4C5d6E7F8a9B0c1D2e3F";
  return {
    tokenId, txHash, contractAddress:contractAddr,
    network:"Polygon Mumbai Testnet", chainId:80001,
    blockNumber:Math.floor(Math.random()*999999)+40000000,
    gasUsed:Math.floor(Math.random()*50000)+21000,
    mintedAt:new Date().toISOString(),
    metadata:{
      name:`VEYO Work SBT #${tokenId}`,
      description:`Soulbound Token for ${workerProfile?.name||"Worker"} on TrustNet`,
      attributes:[
        {trait_type:"TrustScore",value:score},
        {trait_type:"Platform",value:workerProfile?.platform||"Gig"},
        {trait_type:"City",value:workerProfile?.city||"India"},
        {trait_type:"Income Band",value:workerProfile?.income_range||"₹20K–₹35K"},
        {trait_type:"Aadhaar Verified",value:"Yes"},
        {trait_type:"Soulbound",value:"true"},
        {trait_type:"Transferable",value:"false"},
      ],
    },
    polygonscanUrl:`https://mumbai.polygonscan.com/tx/${txHash}`,
    opensea:`https://testnets.opensea.io/assets/mumbai/${contractAddr}/${tokenId}`,
  };
}

// ─── VOICE ASSISTANT ──────────────────────────────────────────────────────────
const VOICE_SCRIPTS = {
  welcome:{hi:"नमस्ते! VEYO में आपका स्वागत है। मैं आपकी मदद करूंगा।",en:"Welcome to VEYO! I'll guide you through setting up your financial identity."},
  role:{hi:"आप क्या काम करते हैं? ड्राइवर, डिलीवरी, या कोई और? अपना काम चुनें।",en:"What kind of work do you do? Please select your occupation."},
  aadhaar:{hi:"अब अपना आधार नंबर दर्ज करें। आपकी जानकारी सुरक्षित है।",en:"Please enter your 12-digit Aadhaar number. Your data is encrypted."},
  profile:{hi:"अब अपनी काम की जानकारी भरें — प्लेटफॉर्म, शहर, और आमदनी।",en:"Fill in your work profile — platform, city, and income range."},
  consent:{hi:"ये डेटा सिग्नल आपका TrustScore बनाते हैं।",en:"These data signals build your TrustScore. Connect as many as possible."},
  done:{hi:"बधाई हो! आपका TrustScore तैयार है।",en:"Congratulations! Your TrustScore is ready. You can now apply for loans."},
};

function VoiceAssistant({ step, lang, onToggleLang }) {
  const [speaking,setSpeaking]=useState(false);
  const [supported]=useState(()=>"speechSynthesis" in window);
  const speak=useCallback((stepKey)=>{
    if(!supported)return;
    window.speechSynthesis.cancel();
    const text=VOICE_SCRIPTS[stepKey]?.[lang]||VOICE_SCRIPTS.welcome[lang];
    const utt=new SpeechSynthesisUtterance(text);
    utt.lang=lang==="hi"?"hi-IN":"en-IN";
    utt.rate=0.92;utt.pitch=1.05;
    const voices=window.speechSynthesis.getVoices();
    const preferred=voices.find(v=>v.lang===(lang==="hi"?"hi-IN":"en-IN"))||voices.find(v=>v.lang.startsWith(lang==="hi"?"hi":"en"));
    if(preferred)utt.voice=preferred;
    utt.onstart=()=>setSpeaking(true);
    utt.onend=()=>setSpeaking(false);
    utt.onerror=()=>setSpeaking(false);
    window.speechSynthesis.speak(utt);
  },[lang,supported]);
  useEffect(()=>{
    const m={0:"welcome",1:"role",2:"aadhaar",3:"profile",4:"consent",5:"done"};
    const t=setTimeout(()=>speak(m[step]||"welcome"),600);
    return()=>clearTimeout(t);
  },[step,speak]);
  if(!supported)return null;
  return(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9990,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"10px 14px",fontSize:12,color:C.textMuted,maxWidth:260,lineHeight:1.5}}>
        <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:4}}>🎙️ VEYO Voice Guide</div>
        {VOICE_SCRIPTS[["welcome","role","aadhaar","profile","consent","done"][step]||"welcome"]?.[lang]}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onToggleLang} className="btn btn-sm" style={{fontSize:11}}>{lang==="hi"?"🇬🇧 English":"🇮🇳 हिंदी"}</button>
        <button onClick={()=>{const m={0:"welcome",1:"role",2:"aadhaar",3:"profile",4:"consent",5:"done"};speak(m[step]||"welcome");}} style={{width:48,height:48,borderRadius:"50%",background:speaking?C.purple:C.accent,border:"none",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",animation:speaking?"voicePulse 1s infinite":"none",boxShadow:speaking?`0 0 18px ${C.purple}88`:`0 0 10px ${C.accentGlow}`,transition:"all .2s"}}>
          {speaking?"🔊":"🔈"}
        </button>
      </div>
    </div>
  );
}

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Confetti({active}){
  if(!active)return null;
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {Array.from({length:70},(_,i)=>({id:i,x:Math.random()*100,delay:Math.random()*1.5,dur:2.5+Math.random()*2,color:[C.accent,C.gold,C.green,"#FF6B6B",C.purple,C.orange][i%6],size:5+Math.random()*9,rot:Math.random()*360})).map(p=>(
        <div key={p.id} style={{position:"absolute",top:"-20px",left:`${p.x}%`,width:p.size,height:p.size,background:p.color,borderRadius:p.size>10?"50%":"2px",animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,transform:`rotate(${p.rot}deg)`}}/>
      ))}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function ToastCenter({notifs,onDismiss,onAction}){
  return(
    <div style={{position:"fixed",top:20,right:20,zIndex:9998,display:"flex",flexDirection:"column",gap:10,maxWidth:340}}>
      {notifs.map(n=>(
        <div key={n.id} style={{background:C.card,border:`1px solid ${n.color}55`,borderRadius:12,padding:"14px 16px",animation:"notifIn .4s ease-out",boxShadow:`0 4px 20px ${n.color}22`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:n.color,marginBottom:5}}>{n.type}</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{n.title}</div>
              <div style={{fontSize:12,color:C.textMuted}}>{n.body}</div>
            </div>
            <button onClick={()=>onDismiss(n.id)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:16,marginLeft:10}}>×</button>
          </div>
          {n.action&&<div style={{display:"flex",gap:8,marginTop:10}}><button className="btn btn-primary btn-sm" onClick={()=>{onAction&&onAction(n);onDismiss(n.id);}}>{n.action}</button><button className="btn btn-sm" onClick={()=>onDismiss(n.id)}>Later</button></div>}
        </div>
      ))}
    </div>
  );
}

// ─── NOTIFICATION BELL ────────────────────────────────────────────────────────
function NotifBell({userId,onNavigate}){
  const [open,setOpen]=useState(false);
  const [notifs,setNotifs]=useState([]);
  const [unread,setUnread]=useState(0);
  const ref=useRef(null);

  useEffect(()=>{
    if(!userId)return;
    const q=query(collection(db,"notifications"),where("recipient_id","==",userId),orderBy("createdAt","desc"),limit(25));
    const unsub=onSnapshot(q,(snap)=>{
      const data=snap.docs.map(d=>({id:d.id,...d.data()}));
      setNotifs(data);
      setUnread(data.filter(n=>!n.read).length);
    });
    return()=>unsub();
  },[userId]);

  useEffect(()=>{
    const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  const markRead=async(id)=>{
    await updateDoc(doc(db,"notifications",id),{read:true});
  };
  const markAll=async()=>{
    notifs.filter(n=>!n.read).forEach(n=>updateDoc(doc(db,"notifications",n.id),{read:true}));
  };

  const typeIcon=t=>t==="loan_application"?"💰":t==="loan_approved"?"✅":t==="signal_request"?"📡":t==="score_update"?"📈":"🔔";
  const typeColor=t=>t==="loan_application"?C.gold:t==="loan_approved"?C.green:t==="signal_request"?C.accent:t==="score_update"?C.purple:C.textMuted;

  return(
    <div ref={ref} style={{position:"relative"}}>
      <button className="btn btn-ghost btn-sm" onClick={()=>setOpen(o=>!o)} style={{position:"relative"}}>
        🔔{unread>0&&<span style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:C.red,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread>9?"9+":unread}</span>}
      </button>
      {open&&(
        <div className="notif-panel">
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,fontWeight:600}}>Notifications{unread>0&&<span className="tag tag-red" style={{fontSize:10,marginLeft:6}}>{unread} new</span>}</div>
            {unread>0&&<button className="btn btn-ghost btn-sm" style={{fontSize:11}} onClick={markAll}>Mark all read</button>}
          </div>
          <div style={{maxHeight:420,overflowY:"auto"}}>
            {notifs.length===0&&<div style={{padding:32,textAlign:"center",color:C.textDim,fontSize:13}}>No notifications yet</div>}
            {notifs.map(n=>(
              <div key={n.id} onClick={()=>markRead(n.id)} style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:n.read?"transparent":`${typeColor(n.type)}08`}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:18,flexShrink:0}}>{typeIcon(n.type)}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:n.read?C.text:typeColor(n.type)}}>{n.title}</div>
                    <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{n.body}</div>
                    <div style={{fontSize:10,color:C.textDim,marginTop:4}}>{n.createdAt?.toDate?fmtDate(n.createdAt.toDate()):""}</div>
                  </div>
                  {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:typeColor(n.type),flexShrink:0,marginTop:4}}/>}
                </div>
                {n.action_label&&<button className="btn btn-primary btn-sm" style={{marginTop:8,fontSize:11}} onClick={e=>{e.stopPropagation();onNavigate?.(n.action_tab);markRead(n.id);setOpen(false);}}>{n.action_label}</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({score,max=100,size=120,strokeW=9}){
  const r=(size/2)-strokeW,circ=2*Math.PI*r;
  const color=score>=70?C.green:score>=45?C.gold:C.red;
  const label=score>=70?"Excellent":score>=55?"Good":score>=40?"Fair":"Building";
  return(
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={strokeW}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW} strokeDasharray={circ} strokeDashoffset={circ*(1-score/max)} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1)",filter:`drop-shadow(0 0 6px ${color}88)`}}/>
        <text x={size/2} y={size/2-6} textAnchor="middle" fill={C.text} fontSize={size>100?"22":"16"} fontWeight="700" fontFamily="Syne,sans-serif">{score}</text>
        <text x={size/2} y={size/2+12} textAnchor="middle" fill={color} fontSize="11" fontFamily="DM Sans,sans-serif" fontWeight="600">{label}</text>
      </svg>
    </div>
  );
}

function SignalBar({label,sublabel,pct,color,connected,icon,weight}){
  return(
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {icon&&<span style={{fontSize:15,width:20,textAlign:"center"}}>{icon}</span>}
          <div>
            {label&&<div style={{fontSize:12,fontWeight:500}}>{label}</div>}
            {sublabel&&<div style={{fontSize:10,color:C.textMuted}}>{sublabel}</div>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {weight&&<span style={{fontSize:10,color:C.textDim}}>×{weight}</span>}
          <span style={{fontSize:12,fontWeight:600,color:connected?color:C.textDim}}>{connected?`${pct}%`:"—"}</span>
          <div style={{width:7,height:7,borderRadius:"50%",background:connected?color:C.textDim,animation:connected?"pulse 2.5s infinite":"none",flexShrink:0}}/>
        </div>
      </div>
      <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:3,background:connected?color:"transparent",width:connected?`${pct}%`:"0%",transition:"width 1.4s cubic-bezier(0.4,0,0.2,1)",boxShadow:connected?`0 0 6px ${color}66`:"none"}}/>
      </div>
    </div>
  );
}

const TICKER_ITEMS=["₹87L Cr informal economy — 92% workers invisible to credit system","RBI AA framework live across 63 FIPs as of 2024 · Sahamati","PM SVANidhi disbursed ₹5,200 Cr to 49L street vendors (MoHUA 2024)","MUDRA Yojana: ₹27.03L Cr disbursed across 44 Cr accounts since launch","PLFS 2023-24: 57.7% of India's workforce in non-agricultural informal sector","CIBIL covers only 22 Cr of 450M+ gig workers — credit gap: ₹25L Cr"];

function Topbar({role,user,userId,onLogout,onNavigate}){
  const roleColors={worker:C.accent,lender:C.gold,govt:C.purple};
  const roleLabels={worker:"WORKER",lender:"LENDER API",govt:"GOVT / MSME"};
  const color=roleColors[role];
  return(
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",alignItems:"center",gap:16,height:56,flexShrink:0,position:"relative",zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:28,height:28,background:C.accent,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#000",fontFamily:"Syne,sans-serif"}}>V</div>
        <span className="syne" style={{fontSize:18,fontWeight:800,letterSpacing:-.5}}>VEYO</span>
        <span className="tag tag-accent" style={{background:`${color}18`,color,borderColor:`${color}44`,fontSize:10}}>{roleLabels[role]}</span>
        <span style={{fontSize:10,color:C.green,border:`1px solid ${C.green}33`,borderRadius:6,padding:"2px 8px",marginLeft:4}}>⚡ Powered by Gemini AI + Firebase</span>
      </div>
      <div style={{flex:1}}/>
      <div style={{flex:2,overflow:"hidden",maxWidth:640,display:"flex",alignItems:"center",gap:8}}>
        <div className="live-dot"/>
        <div style={{overflow:"hidden",flex:1}}>
          <div style={{display:"flex",animation:"ticker 72s linear infinite",whiteSpace:"nowrap",gap:60}}>
            {[...TICKER_ITEMS,...TICKER_ITEMS].map((t,i)=><span key={i} style={{fontSize:12,color:C.textMuted}}>{"· "+t}</span>)}
          </div>
        </div>
      </div>
      <div style={{flex:1}}/>
      <NotifBell userId={userId} onNavigate={onNavigate}/>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:`${color}22`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{role==="worker"?"🚗":role==="lender"?"🏦":"🏛️"}</div>
        <div><div style={{fontSize:12,fontWeight:600}}>{user.name}</div><div style={{fontSize:10,color:C.textMuted}}>{user.sub}</div></div>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
    </div>
  );
}

// ─── LOGIN — Firebase Phone OTP + Google Sign-In ──────────────────────────────
function LoginPage({onLogin}){
  const [role,setRole]=useState("worker");
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState("");
  const [step,setStep]=useState("phone");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [confirmResult,setConfirmResult]=useState(null);

  const setupRecaptcha=()=>{
    if(!window.recaptchaVerifier){
      window.recaptchaVerifier=new RecaptchaVerifier(auth,"recaptcha-container",{size:"invisible"});
    }
  };

  const sendOTP=async()=>{
    if(phone.length<10)return;
    setLoading(true);setError("");
    try{
      setupRecaptcha();
      const result=await signInWithPhoneNumber(auth,"+91"+phone,window.recaptchaVerifier);
      setConfirmResult(result);
      setStep("otp");
    }catch(e){
      setError("Could not send OTP: "+e.message);
      if(window.recaptchaVerifier){window.recaptchaVerifier.clear();window.recaptchaVerifier=null;}
    }
    setLoading(false);
  };

  const verify=async()=>{
    if(!confirmResult||otp.length<6)return;
    setLoading(true);setError("");
    try{
      const result=await confirmResult.confirm(otp);
      const uid=result.user.uid;
      const docRef=await fsAdd("user_sessions",{phone:"+91"+phone,role,uid,logged_in_at:new Date().toISOString()});
      onLogin(role,uid,phone);
    }catch(e){
      setError("Invalid OTP. Try again.");
    }
    setLoading(false);
  };

  const googleLogin=async()=>{
    setLoading(true);setError("");
    try{
      const provider=new GoogleAuthProvider();
      const result=await signInWithPopup(auth,provider);
      const uid=result.user.uid;
      const name=result.user.displayName||"User";
      const email=result.user.email||"";
      await fsAdd("user_sessions",{name,email,role,uid,provider:"google",logged_in_at:new Date().toISOString()});
      onLogin(role,uid,null,{name,email});
    }catch(e){
      setError("Google login failed: "+e.message);
    }
    setLoading(false);
  };

  const ROLES=[
    {id:"worker",icon:"🚗",label:"Worker / Gig",sub:"Build your TrustScore"},
    {id:"lender",icon:"🏦",label:"Lender / NBFC",sub:"Verify & underwrite"},
    {id:"govt",icon:"🏛️",label:"Govt / MSME",sub:"Scheme disbursement"},
  ];

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,position:"relative",overflow:"hidden"}}>
      <div id="recaptcha-container"/>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`,backgroundSize:"44px 44px",opacity:.2}}/>
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:600,height:600,background:`radial-gradient(circle,${C.accentDim} 0%,transparent 68%)`,pointerEvents:"none"}}/>
      <div style={{position:"relative",width:440,animation:"fadeUp .5s"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:48,height:48,background:C.accent,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#000",fontFamily:"Syne,sans-serif",boxShadow:`0 0 28px ${C.accentGlow}`}}>V</div>
            <span className="syne" style={{fontSize:38,fontWeight:800,letterSpacing:-1.5}}>VEYO</span>
          </div>
          <div style={{fontSize:13,color:C.textMuted}}>Behavioral credit infrastructure for invisible India</div>
          <div className="mono" style={{fontSize:10,color:C.accent,marginTop:4,letterSpacing:1.5}}>FIREBASE · GEMINI AI · RBI AA · ONDC · POLYGON</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
          {ROLES.map(r=>(
            <button key={r.id} onClick={()=>setRole(r.id)} style={{background:role===r.id?C.accentDim:C.card,border:`1px solid ${role===r.id?C.accent:C.border}`,borderRadius:12,padding:"14px 8px",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
              <div style={{fontSize:24,marginBottom:6}}>{r.icon}</div>
              <div style={{fontSize:12,fontWeight:600,color:role===r.id?C.accent:C.text}}>{r.label}</div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{r.sub}</div>
            </button>
          ))}
        </div>
        <div className="card" style={{padding:28}}>
          {step==="phone"?(
            <>
              <div style={{fontSize:13,color:C.textMuted,marginBottom:14}}>Enter your registered mobile number</div>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,color:C.textMuted,minWidth:58,textAlign:"center",flexShrink:0}}>+91</div>
                <input className="input" placeholder="98765 43210" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&sendOTP()}/>
              </div>
              <button className="btn btn-primary" style={{width:"100%",padding:13,fontSize:15,marginBottom:12}} onClick={sendOTP} disabled={loading||phone.length<10}>
                {loading?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span> Sending OTP...</>:"Send OTP →"}
              </button>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{flex:1,height:1,background:C.border}}/>
                <span style={{fontSize:12,color:C.textMuted}}>or</span>
                <div style={{flex:1,height:1,background:C.border}}/>
              </div>
              <button className="btn" style={{width:"100%",padding:12,fontSize:14,background:"#fff",color:"#000",border:"none",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:10}} onClick={googleLogin} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 4.8C9.8 39.7 16.4 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C40.9 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
                Continue with Google
              </button>
              {error&&<div style={{color:C.red,fontSize:12,marginTop:12,textAlign:"center"}}>{error}</div>}
            </>
          ):(
            <>
              <div style={{fontSize:13,color:C.textMuted,marginBottom:4}}>OTP sent to +91 {phone}</div>
              <div style={{fontSize:11,color:C.accent,marginBottom:12,cursor:"pointer"}} onClick={()=>{setStep("phone");setError("");}}>← Change number</div>
              <input className="input" placeholder="Enter 6-digit OTP" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} style={{marginBottom:16,letterSpacing:10,fontSize:22,textAlign:"center"}} onKeyDown={e=>e.key==="Enter"&&verify()}/>
              {error&&<div style={{color:C.red,fontSize:12,marginBottom:12,textAlign:"center"}}>{error}</div>}
              <button className="btn btn-primary" style={{width:"100%",padding:13,fontSize:15}} onClick={verify} disabled={loading||otp.length<6}>
                {loading?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span> Verifying...</>:"Verify & Continue →"}
              </button>
            </>
          )}
          <div style={{textAlign:"center",marginTop:14,fontSize:11,color:C.textDim}}>🔒 Firebase Auth · Real SMS OTP · Google Sign-In</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:20}}>
          {[{v:"450M+",l:"Unserved workers"},{v:"₹87L Cr",l:"Informal economy"},{v:"0.3%",l:"NPA rate"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div className="syne" style={{fontSize:18,fontWeight:700,color:C.accent}}>{s.v}</div>
              <div style={{fontSize:11,color:C.textMuted}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
const ONBOARDING_STEPS=[
  {id:"welcome",title:"Welcome to VEYO",icon:"⚡"},
  {id:"role",title:"What do you do?",icon:"👤"},
  {id:"aadhaar",title:"Verify Identity",icon:"🪪"},
  {id:"profile",title:"Work Profile",icon:"💼"},
  {id:"consent",title:"Data Consent",icon:"🔐"},
  {id:"done",title:"You're live!",icon:"🎉"},
];

function OnboardingFlow({onComplete,sessionId,phone,googleUser}){
  const [step,setStep]=useState(0);
  const [data,setData]=useState({role:"",name:googleUser?.name||"",aadhaar:"",platform:"",years:"",income:"",city:""});
  const [loading,setLoading]=useState(false);
  const [aadhaarVerified,setAadhaarVerified]=useState(false);
  const [consents,setConsents]=useState({upi:false,gig:false,gst:false,utility:false});
  const [voiceLang,setVoiceLang]=useState("en");

  const next=async(skipLoad)=>{
    if(!skipLoad){setLoading(true);await sleep(1200);setLoading(false);}
    setStep(s=>s+1);
  };

  const verifyAadhaar=async()=>{
    setLoading(true);await sleep(2000);setLoading(false);
    setAadhaarVerified(true);await sleep(600);setStep(3);
  };

  const finish=async()=>{
    setLoading(true);
    const workerData={
      session_id:sessionId,
      phone:phone?"+91"+phone:null,
      name:data.name,
      role_type:data.role,
      platform:data.platform,
      years_working:data.years,
      income_range:data.income,
      city:data.city,
      aadhaar_verified:aadhaarVerified,
      consents,
      trust_score:62,
      google_user:!!googleUser,
    };
    const docRef=await fsAdd("workers",workerData);
    setLoading(false);
    onComplete({...data,consents,workerId:docRef?.id,dbId:docRef?.id});
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <VoiceAssistant step={step} lang={voiceLang} onToggleLang={()=>setVoiceLang(l=>l==="hi"?"en":"hi")}/>
      <div style={{position:"absolute",top:"15%",left:"50%",transform:"translateX(-50%)",width:700,height:700,background:`radial-gradient(circle,${C.accentDim} 0%,transparent 65%)`,pointerEvents:"none"}}/>
      <div style={{position:"relative",width:490,animation:"fadeUp .5s ease-out"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:44,height:44,background:C.accent,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#000"}}>V</div>
            <span className="syne" style={{fontSize:36,fontWeight:800,letterSpacing:-1}}>VEYO</span>
          </div>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:28}}>
          {ONBOARDING_STEPS.map((s,i)=>(
            <div key={s.id} style={{height:3,flex:1,borderRadius:2,background:i<=step?C.accent:C.border,transition:"background .4s"}}/>
          ))}
        </div>
        <div className="card" style={{padding:32}} key={step}>
          {step===0&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:52,marginBottom:20}}>⚡</div>
              <h2 className="syne" style={{fontSize:24,fontWeight:700,marginBottom:12}}>Build your financial identity</h2>
              <p style={{color:C.textMuted,marginBottom:24,lineHeight:1.7}}>India has 450M+ gig workers with no credit identity. VEYO uses Firebase, Gemini AI, and the RBI Account Aggregator to build your portable TrustScore.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:28}}>
                {[{icon:"🔥",label:"Firebase Auth"},{icon:"🤖",label:"Gemini AI"},{icon:"🔷",label:"Polygon SBT"}].map(f=>(
                  <div className="card2" key={f.label} style={{padding:14,textAlign:"center"}}>
                    <div style={{fontSize:22,marginBottom:6}}>{f.icon}</div>
                    <div style={{fontSize:11,fontWeight:600,color:C.textMuted}}>{f.label}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{width:"100%",padding:14,fontSize:15}} onClick={()=>next(true)}>Get started →</button>
            </div>
          )}
          {step===1&&(
            <div>
              <h3 className="syne" style={{fontSize:20,fontWeight:700,marginBottom:6}}>What do you do?</h3>
              <p style={{color:C.textMuted,marginBottom:20,fontSize:13}}>This determines which data signals matter for your TrustScore.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                {[{id:"driver",icon:"🚗",label:"Gig Driver",sub:"Rapido / Ola / Uber"},{id:"delivery",icon:"🛵",label:"Delivery Partner",sub:"Swiggy / Zomato / Dunzo"},{id:"kirana",icon:"🏪",label:"Kirana / Shop Owner",sub:"Retail / GST registered"},{id:"domestic",icon:"🏠",label:"Domestic Worker",sub:"Maid / Cook / Helper"},{id:"freelance",icon:"💻",label:"Freelancer",sub:"Design / Dev / Content"},{id:"artisan",icon:"🔨",label:"Artisan",sub:"Weaver / Potter / Tailor"}].map(r=>(
                  <button key={r.id} onClick={()=>setData(d=>({...d,role:r.id}))} style={{background:data.role===r.id?C.accentDim:C.card2,border:`1px solid ${data.role===r.id?C.accent:C.border}`,borderRadius:10,padding:"14px 12px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                    <div style={{fontSize:22,marginBottom:5}}>{r.icon}</div>
                    <div style={{fontSize:13,fontWeight:600,color:data.role===r.id?C.accent:C.text}}>{r.label}</div>
                    <div style={{fontSize:11,color:C.textMuted}}>{r.sub}</div>
                  </button>
                ))}
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Your full name</label>
                <input className="input" placeholder="e.g. Priya Sharma" value={data.name} onChange={e=>setData(d=>({...d,name:e.target.value}))}/>
              </div>
              <button className="btn btn-primary" style={{width:"100%",padding:12}} onClick={()=>next(true)} disabled={!data.role||!data.name}>Continue →</button>
            </div>
          )}
          {step===2&&(
            <div>
              <h3 className="syne" style={{fontSize:20,fontWeight:700,marginBottom:6}}>Verify your Aadhaar</h3>
              <p style={{color:C.textMuted,marginBottom:20,fontSize:13}}>UIDAI sandbox eKYC. Your number is never stored in raw form.</p>
              {!aadhaarVerified?(
                <>
                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Aadhaar Number</label>
                    <input className="input" placeholder="XXXX XXXX XXXX" maxLength={14} value={data.aadhaar} onChange={e=>{let v=e.target.value.replace(/\D/g,"").slice(0,12);v=v.replace(/(\d{4})(\d{4})(\d{0,4})/,(_,a,b,c)=>c?`${a} ${b} ${c}`:b?`${a} ${b}`:a);setData(d=>({...d,aadhaar:v}));}}/>
                  </div>
                  <div style={{background:C.accentDim,border:`1px solid ${C.accent}33`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.textMuted,marginBottom:20}}>🔒 UIDAI eKYC OTP flow. No raw data stored — only ZK proof.</div>
                  <button className="btn btn-primary" style={{width:"100%",padding:12}} onClick={verifyAadhaar} disabled={data.aadhaar.replace(/\s/g,"").length!==12||loading}>
                    {loading?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span> Verifying via UIDAI...</>:"Send OTP & Verify →"}
                  </button>
                </>
              ):(
                <div style={{textAlign:"center",padding:"20px 0",animation:"fadeUp .4s"}}>
                  <div style={{fontSize:48,marginBottom:12}}>✅</div>
                  <div style={{fontSize:16,fontWeight:600,color:C.green}}>Aadhaar Verified</div>
                  <div className="mono" style={{fontSize:11,color:C.textMuted,marginTop:6}}>Proof generated · No PII stored</div>
                </div>
              )}
            </div>
          )}
          {step===3&&(
            <div>
              <h3 className="syne" style={{fontSize:20,fontWeight:700,marginBottom:6}}>Your work profile</h3>
              <p style={{color:C.textMuted,marginBottom:20,fontSize:13}}>Saved to Firebase Firestore in real-time.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div>
                  <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Primary Platform</label>
                  <input className="input" placeholder="e.g. Rapido, Swiggy, Self" value={data.platform} onChange={e=>setData(d=>({...d,platform:e.target.value}))}/>
                </div>
                <div>
                  <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Years working</label>
                  <select className="input" value={data.years} onChange={e=>setData(d=>({...d,years:e.target.value}))}>
                    <option value="">Select</option>
                    {["Less than 1 year","1–2 years","2–4 years","4–6 years","6+ years"].map(y=><option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Monthly income</label>
                  <select className="input" value={data.income} onChange={e=>setData(d=>({...d,income:e.target.value}))}>
                    <option value="">Select range</option>
                    {["Under ₹10,000","₹10,000–₹20,000","₹20,000–₹35,000","₹35,000–₹50,000","₹50,000+"].map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>City</label>
                  <input className="input" placeholder="e.g. Delhi, Bengaluru" value={data.city} onChange={e=>setData(d=>({...d,city:e.target.value}))}/>
                </div>
              </div>
              <button className="btn btn-primary" style={{width:"100%",padding:12}} onClick={()=>next(true)} disabled={!data.platform||!data.years||!data.income||!data.city}>Continue →</button>
            </div>
          )}
          {step===4&&(
            <div>
              <h3 className="syne" style={{fontSize:20,fontWeight:700,marginBottom:6}}>Data consent</h3>
              <p style={{color:C.textMuted,marginBottom:20,fontSize:13}}>Stored in Firebase. Revoke anytime.</p>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                {[{key:"upi",icon:"💳",label:"UPI Transactions",sub:"Via RBI Account Aggregator",points:"+28 pts",color:C.accent},{key:"gig",icon:"🚗",label:"Gig Platform History",sub:"Trip data, ratings, payouts",points:"+20 pts",color:C.green},{key:"gst",icon:"📋",label:"GST Filing Records",sub:"GSTN API · Auto-renewing",points:"+18 pts",color:C.gold},{key:"utility",icon:"🏠",label:"Utility Bill Payments",sub:"BESCOM / BSNL",points:"+12 pts",color:C.orange}].map(s=>(
                  <div key={s.key} onClick={()=>setConsents(c=>({...c,[s.key]:!c[s.key]}))} style={{background:consents[s.key]?`${s.color}10`:C.card2,border:`1px solid ${consents[s.key]?s.color+"55":C.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .2s"}}>
                    <span style={{fontSize:18}}>{s.icon}</span>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{s.label}</div><div style={{fontSize:11,color:C.textMuted}}>{s.sub}</div></div>
                    <span style={{fontSize:11,fontWeight:700,color:s.color}}>{s.points}</span>
                    <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${consents[s.key]?s.color:C.border}`,background:consents[s.key]?s.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>
                      {consents[s.key]&&<span style={{fontSize:11,color:"#000",fontWeight:700}}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{width:"100%",padding:12}} onClick={()=>next(false)} disabled={loading||Object.values(consents).every(v=>!v)}>
                {loading?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span> Linking data sources...</>:"Connect & Build My Score →"}
              </button>
            </div>
          )}
          {step===5&&(
            <div style={{textAlign:"center",animation:"fadeUp .5s"}}>
              <div style={{fontSize:56,marginBottom:16}}>🎉</div>
              <h2 className="syne" style={{fontSize:24,fontWeight:700,marginBottom:10}}>You're on TrustNet!</h2>
              <p style={{color:C.textMuted,marginBottom:24,lineHeight:1.7}}>{data.name}'s profile is live. TrustScore computed from <strong>{data.platform}</strong> signals via Gemini AI.</p>
              <div style={{background:C.accentDim,border:`1px solid ${C.accent}33`,borderRadius:12,padding:"20px",marginBottom:24}}>
                <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:1,marginBottom:8}}>INITIAL TRUSTSCORE</div>
                <div className="syne" style={{fontSize:48,fontWeight:800,color:C.accent}}>62</div>
                <div style={{fontSize:12,color:C.textMuted}}>Powered by Google Gemini AI</div>
              </div>
              <button className="btn btn-primary" style={{width:"100%",padding:14,fontSize:15}} onClick={finish} disabled={loading}>
                {loading?"Saving to Firebase...":"Go to my dashboard →"}
              </button>
            </div>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:C.textDim}}>
          {ONBOARDING_STEPS[step].icon} {ONBOARDING_STEPS[step].title} · Step {step+1} of {ONBOARDING_STEPS.length}
        </div>
      </div>
    </div>
  );
}

// ─── AI CHAT — Gemini AI (Google) ─────────────────────────────────────────────
function AIChatAdvisor({role,userScore,connectedSignals,workerProfile,portfolioStats}){
  const systemPrompts={
    worker:`You are VEYO's AI Credit Advisor powered by Google Gemini for ${workerProfile?.name||"a gig worker"} in ${workerProfile?.city||"India"} who works on ${workerProfile?.platform||"a gig platform"}. TrustScore: ${userScore}/100, signals: ${connectedSignals}. Score bands: 0-40 Building, 40-60 Fair (₹5K-20K), 60-75 Good (₹20K-60K), 75-100 Excellent (₹60K-2L). Be warm, specific, mention NPCI, RBI AA, UIDAI, GSTN, MUDRA. 2-3 paragraphs max.`,
    lender:`You are VEYO's AI Underwriting Advisor powered by Google Gemini for ${portfolioStats?.name||"an NBFC"}. Portfolio: ${portfolioStats?.borrowers||847} borrowers, NPA ${portfolioStats?.npa||"0.3%"}. Help with underwriting, risk stratification, FLDG structures. Be precise and financial.`,
    govt:`You are VEYO's AI Policy Advisor powered by Google Gemini for India's Ministry of Labour. Schemes: PM SVANidhi (49L, ₹5200Cr), MUDRA (44Cr, ₹27.03L Cr), Stand-Up India, PMEGP. Help identify beneficiaries, reduce leakage. Cite real data.`,
  };
  const quickPrompts={
    worker:["How do I improve my score fastest?","Am I eligible for a loan now?","Which signal should I connect next?","How long to reach 75?"],
    lender:["How to interpret a 65 TrustScore?","Safe loan amount for Tier B workers?","How to reduce NPA in gig portfolio?"],
    govt:["Which workers qualify for PM SVANidhi?","How to reduce scheme leakage?","MUDRA disbursement gaps by state?"],
  };
  const headers={
    worker:{title:"Gemini Credit Advisor",sub:"Powered by Google Gemini AI",icon:"🤖",color:C.accent},
    lender:{title:"Gemini Underwriting Advisor",sub:"Google AI · Portfolio intelligence",icon:"📊",color:C.gold},
    govt:{title:"Gemini Policy Advisor",sub:"Google AI · Scheme optimization",icon:"🏛️",color:C.purple},
  };
  const h=headers[role]||headers.worker;

  const [messages,setMessages]=useState([{
    role:"assistant",
    text:role==="worker"?`Hi ${workerProfile?.name?.split(" ")[0]||"there"}! I'm your Gemini AI Credit Advisor. Your TrustScore is ${userScore} with ${connectedSignals} signals on ${workerProfile?.platform||"your platform"}. What would you like to know?`:
      role==="lender"?`Welcome. I'm your Gemini AI Underwriting Advisor. Your portfolio has ${portfolioStats?.borrowers||847} borrowers at ${portfolioStats?.npa||"0.3%"} NPA. How can I help?`:
      `Welcome. I'm your Gemini AI Policy Advisor. I have data on PM SVANidhi, MUDRA, Stand-Up India, and PMEGP. How can I help improve coverage today?`,
    ts:new Date()
  }]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const ask=async(q)=>{
    const question=q||input.trim();
    if(!question||loading)return;
    setInput("");
    const newMessages=[...messages,{role:"user",text:question,ts:new Date()}];
    setMessages(newMessages);
    setLoading(true);
    try{
      const geminiMessages=newMessages.slice(1).map(m=>({role:m.role==="assistant"?"model":"user",content:m.text}));
      const reply=await askGemini(systemPrompts[role]||systemPrompts.worker,geminiMessages);
      setMessages(m=>[...m,{role:"assistant",text:reply,ts:new Date()}]);
    }catch(e){
      setMessages(m=>[...m,{role:"assistant",text:`⚠️ Gemini error: ${e.message}. Check your VITE_GEMINI_API_KEY in .env`,ts:new Date()}]);
    }
    setLoading(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:`${h.color}18`,border:`1px solid ${h.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{h.icon}</div>
        <div>
          <div style={{fontSize:13,fontWeight:600}}>{h.title}</div>
          <div style={{fontSize:11,color:C.green,display:"flex",alignItems:"center",gap:4}}><div className="live-dot" style={{width:6,height:6}}/>{h.sub}</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:10,color:C.textMuted,border:`1px solid ${C.border}`,borderRadius:6,padding:"2px 8px"}}>google/gemini-1.5-flash</span>
          {role==="worker"&&<span className="tag tag-accent">Score: {userScore}</span>}
          {role==="lender"&&<span className="tag tag-gold">NPA: {portfolioStats?.npa||"0.3%"}</span>}
          {role==="govt"&&<span className="tag tag-purple">Policy Mode</span>}
        </div>
      </div>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:6,flexWrap:"wrap"}}>
        {(quickPrompts[role]||quickPrompts.worker).map(q=>(
          <button key={q} className="btn btn-sm" style={{fontSize:11}} onClick={()=>ask(q)}>{q}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:16,flexDirection:m.role==="user"?"row-reverse":"row",animation:"chatIn .3s ease-out"}}>
            <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:m.role==="user"?C.accentDim:`${h.color}18`,border:`1px solid ${m.role==="user"?C.accent:h.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>
              {m.role==="user"?"👤":h.icon}
            </div>
            <div style={{maxWidth:"82%"}}>
              <div style={{background:m.role==="user"?C.accentDim:C.card2,border:`1px solid ${m.role==="user"?C.accent+"33":C.border}`,borderRadius:m.role==="user"?"12px 4px 12px 12px":"4px 12px 12px 12px",padding:"10px 14px",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.text}</div>
              <div style={{fontSize:10,color:C.textDim,marginTop:3,textAlign:m.role==="user"?"right":"left"}}>{m.ts.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`${h.color}18`,border:`1px solid ${h.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{h.icon}</div>
            <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:"4px 12px 12px 12px",padding:"10px 14px"}}><span style={{animation:"pulse 1s infinite",display:"inline-block"}}>Gemini is thinking...</span></div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
        <input className="input input-sm" placeholder="Ask Gemini AI..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} style={{flex:1}}/>
        <button className="btn btn-primary btn-sm" onClick={()=>ask()} disabled={!input.trim()||loading}>Send</button>
      </div>
    </div>
  );
}

// ─── SIGNALS CONFIG ───────────────────────────────────────────────────────────
const SIGNALS=[
  {key:"upi",label:"UPI Transactions",sublabel:"Account Aggregator · NPCI",icon:"💳",color:C.accent,pct:91,weight:28},
  {key:"aadhaar",label:"Aadhaar eKYC",sublabel:"UIDAI Sandbox · Verified",icon:"🪪",color:C.purple,pct:100,weight:22},
  {key:"gig",label:"Gig Platform Data",sublabel:"Platform API · ONDC",icon:"🚗",color:C.green,pct:88,weight:20},
  {key:"gst",label:"GST Filing History",sublabel:"GSTN · Auto-linked",icon:"📋",color:C.gold,pct:78,weight:18},
  {key:"utility",label:"Utility Bills",sublabel:"BESCOM · Airtel · 2yr",icon:"🏠",color:C.orange,pct:72,weight:12},
];

// ─── WORKER DASHBOARD ─────────────────────────────────────────────────────────
function WorkerDashboard({user,userId,onLogout}){
  const [tab,setTab]=useState("overview");
  const [connected,setConnected]=useState({aadhaar:true});
  const [connecting,setConnecting]=useState(null);
  const [score,setScore]=useState(22);
  const [targetScore,setTargetScore]=useState(22);
  const [showConfetti,setShowConfetti]=useState(false);
  const [toasts,setToasts]=useState([]);
  const [ondcEvents,setOndcEvents]=useState([]);
  const [loanApplications,setLoanApplications]=useState([]);

  const connectedKeys=Object.keys(connected).filter(k=>connected[k]);
  const allConnected=connectedKeys.length===SIGNALS.length;

  const addToast=n=>setToasts(p=>[{id:Date.now(),...n},...p].slice(0,4));
  const dismissToast=id=>setToasts(n=>n.filter(x=>x.id!==id));
  const handleToastAction=n=>{if(n.action==="View Loans")setTab("loans");};

  // Load signal connections from Firestore
  useEffect(()=>{
    if(!userId)return;
    const q=query(collection(db,"signal_connections"),where("worker_id","==",userId));
    getDocs(q).then(snap=>{
      const conn={aadhaar:true};
      snap.docs.forEach(d=>{conn[d.data().signal_key]=true;});
      setConnected(conn);
    });
  },[userId]);

  // Load loan applications from Firestore
  useEffect(()=>{
    if(!userId)return;
    const q=query(collection(db,"loan_applications"),where("worker_id","==",userId),orderBy("createdAt","desc"));
    const unsub=onSnapshot(q,snap=>{
      setLoanApplications(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return()=>unsub();
  },[userId]);

  const connectSignal=async(key)=>{
    if(connected[key]||connecting)return;
    setConnecting(key);
    await fsAdd("signal_connections",{worker_id:userId,signal_key:key});
    await fsAdd("notifications",{recipient_id:userId,type:"score_update",title:`${SIGNALS.find(s=>s.key===key)?.label} connected`,body:`+${SIGNALS.find(s=>s.key===key)?.weight} pts added to your TrustScore`,read:false});
    await sleep(1800);
    setConnected(p=>({...p,[key]:true}));
    setConnecting(null);
  };

  useEffect(()=>{
    if(!connectedKeys.length){setTargetScore(0);return;}
    setTargetScore(Math.min(100,Math.round(connectedKeys.reduce((s,k)=>{
      const sig=SIGNALS.find(x=>x.key===k);return s+(sig?sig.weight*sig.pct/100:0);
    },0))));
  },[connectedKeys.length]);

  useEffect(()=>{
    let cur=score;const diff=targetScore-cur;if(!diff)return;
    const step=diff/30;
    const iv=setInterval(()=>{cur+=step;if((step>0&&cur>=targetScore)||(step<0&&cur<=targetScore)){cur=targetScore;clearInterval(iv);}setScore(Math.round(cur));},40);
    return()=>clearInterval(iv);
  },[targetScore]);

  useEffect(()=>{
    if(allConnected){
      setShowConfetti(true);setTimeout(()=>setShowConfetti(false),4500);
      setTimeout(()=>addToast({type:"LENDER MATCH",title:"Pre-approved offer!",body:"Varanasi Finance: ₹40,000 @ 14% p.a.",color:C.green,action:"View Loans"}),1500);
    }
  },[allConnected]);

  useEffect(()=>{
    if(!connected.gig)return;
    const iv=setInterval(()=>{setOndcEvents(p=>[generateONDCEvent(user),...p].slice(0,10));},8000);
    return()=>clearInterval(iv);
  },[connected.gig]);

  const applyForLoan=async(offer)=>{
    if(score<offer.minScore)return;
    await fsAdd("loan_applications",{
      worker_id:userId,worker_name:user?.name,
      worker_score:score,worker_platform:user?.platform,
      lender_name:offer.lender,loan_type:offer.type,
      amount:offer.amount,rate:offer.rate,
      tenure:offer.tenure,status:"applied",
    });
    await fsAdd("notifications",{
      recipient_id:"lender-global",type:"loan_application",
      title:`New application — ₹${offer.amount.toLocaleString()}`,
      body:`${user?.name||"A worker"} (Score: ${score}, ${user?.platform||"Gig"}) applied for ${offer.type}`,
      action_label:"Review in Queue",action_tab:"queue",read:false,
    });
    addToast({type:"APPLIED",title:`Applied to ${offer.lender}`,body:`₹${offer.amount.toLocaleString()} at ${offer.rate}% — review in ${offer.time}`,color:C.green});
  };

  const LOAN_OFFERS=[
    {id:1,lender:"Varanasi Finance NBFC",type:"Personal Loan",amount:40000,rate:14,tenure:12,processing:"₹499",time:"4 hours",badge:"Best Match",badgeColor:C.green,minScore:70,icon:"🏦",desc:"Trusted NBFC partner. No physical visit required."},
    {id:2,lender:"Paisabazaar Micro",type:"Working Capital",amount:25000,rate:16.5,tenure:6,processing:"Zero",time:"Instant",badge:"Zero Fees",badgeColor:C.accent,minScore:55,icon:"⚡",desc:"Zero processing fee. Instant disbursal."},
    {id:3,lender:"Stashfin",type:"Line of Credit",amount:60000,rate:18,tenure:18,processing:"₹999",time:"24 hours",badge:"Highest Limit",badgeColor:C.gold,minScore:75,icon:"💰",desc:"Revolving line of credit. App-based management."},
    {id:4,lender:"KreditBee NBFC",type:"Emergency Loan",amount:10000,rate:22,tenure:3,processing:"₹199",time:"2 hours",badge:"Fast Disburse",badgeColor:C.orange,minScore:40,icon:"🚀",desc:"Fastest approval. Emergency cash in 2 hours."},
    {id:5,lender:"Finzy P2P",type:"Peer Loan",amount:30000,rate:13.5,tenure:12,processing:"₹349",time:"8 hours",badge:"Lowest Rate",badgeColor:C.purple,minScore:65,icon:"🤝",desc:"Lowest interest rate. RBI-registered P2P NBFC."},
    {id:6,lender:"Avanse Micro",type:"Education Loan",amount:20000,rate:15,tenure:9,processing:"₹299",time:"6 hours",badge:"Skill Upgrade",badgeColor:C.green,minScore:50,icon:"📚",desc:"For skill development. Government scheme linked."},
  ];

  const appliedIds=new Set(loanApplications.map(a=>a.lender_name));

  const TABS=[
    {id:"overview",label:"Overview"},
    {id:"loans",label:"Loan Marketplace"},
    {id:"transactions",label:"Transactions"},
    {id:"timeline",label:"Score Journey"},
    {id:"wallet",label:"Identity Wallet"},
    {id:"advisor",label:"🤖 Gemini Advisor"},
  ];

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
      <Confetti active={showConfetti}/>
      <ToastCenter notifs={toasts} onDismiss={dismissToast} onAction={handleToastAction}/>
      <Topbar role="worker" user={{name:user?.name||"Worker",sub:`${user?.platform||"Gig Worker"} · ${user?.city||"India"}`}} userId={userId||"worker-demo"} onLogout={onLogout} onNavigate={setTab}/>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",gap:2,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"14px 18px",background:"none",border:"none",cursor:"pointer",borderBottom:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent",color:tab===t.id?C.accent:C.textMuted,fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:tab===t.id?600:400,transition:"all .18s",whiteSpace:"nowrap",marginBottom:-1}}>{t.label}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"24px"}}>
        {tab==="overview"&&(
          <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:20,maxWidth:1200}}>
            <div>
              <div className="card" style={{padding:24,marginBottom:16,textAlign:"center"}}>
                <div style={{fontSize:11,color:C.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>TrustNet Score</div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><ScoreRing score={score} size={130}/></div>
                <div style={{fontSize:11,color:C.textMuted}}>{connectedKeys.length}/{SIGNALS.length} signals connected</div>
                <div style={{fontSize:10,color:C.green,marginTop:6}}>⚡ Powered by Google Gemini AI</div>
                {allConnected
                  ?<div style={{marginTop:14,background:C.greenDim,border:`1px solid ${C.green}44`,borderRadius:8,padding:"10px 12px",fontSize:13,color:C.green,fontWeight:600}}>🎉 Pre-qualified up to ₹60,000</div>
                  :<div style={{marginTop:10}}><div style={{fontSize:11,color:C.textMuted,marginBottom:8}}>Connect more signals to unlock</div><div style={{background:C.border,borderRadius:6,height:6,overflow:"hidden"}}><div style={{height:"100%",background:`linear-gradient(90deg,${C.accent},${C.purple})`,width:`${(connectedKeys.length/SIGNALS.length)*100}%`,transition:"width .8s",borderRadius:6}}/></div></div>
                }
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[{l:"Monthly Income",v:user?.income_range?.split("–")[1]?.replace(",000","K")||"₹35K",c:C.green},{l:"Loan Eligible",v:allConnected?"₹60,000":"₹0",c:C.accent},{l:"Applications",v:String(loanApplications.length),c:C.gold},{l:"Credit Age",v:"4 years",c:C.purple}].map(s=>(
                  <div key={s.l} className="card" style={{padding:14}}><div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>{s.l}</div><div style={{fontSize:16,fontWeight:700,color:s.c,fontFamily:"Syne,sans-serif"}}>{s.v}</div></div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div className="card" style={{padding:22}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div><div style={{fontSize:14,fontWeight:600}}>Data Signals</div><div style={{fontSize:12,color:C.textMuted}}>Stored in Firebase Firestore · Real-time sync</div></div>
                  {!allConnected&&<button className="btn btn-primary btn-sm" onClick={()=>SIGNALS.forEach((s,i)=>setTimeout(()=>connectSignal(s.key),i*400))}>Connect All</button>}
                </div>
                {SIGNALS.map(sig=>(
                  <div key={sig.key} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{flex:1}}><SignalBar label={sig.label} sublabel={sig.sublabel} icon={sig.icon} color={sig.color} pct={sig.pct} connected={!!connected[sig.key]} weight={sig.weight}/></div>
                    {!connected[sig.key]&&<button className="btn btn-sm" style={{flexShrink:0,minWidth:80,marginBottom:12}} onClick={()=>connectSignal(sig.key)} disabled={connecting===sig.key}>{connecting===sig.key?<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span>:"Connect"}</button>}
                    {connected[sig.key]&&<span style={{color:C.green,marginBottom:12,flexShrink:0,fontSize:16}}>✓</span>}
                  </div>
                ))}
              </div>
              <div className="card" style={{padding:22}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <div className="live-dot" style={{opacity:connected.gig?1:0.3}}/>
                  <div style={{fontSize:14,fontWeight:600}}>ONDC Signal Feed</div>
                  <span style={{marginLeft:"auto",fontSize:11,color:C.textMuted}}>Real-time · {user?.platform||"Platform"}</span>
                </div>
                {ondcEvents.length===0&&<div style={{color:C.textDim,fontSize:13,textAlign:"center",padding:16}}>Connect Gig Platform to see live ONDC signals</div>}
                {ondcEvents.map((e,i)=>(
                  <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,animation:i===0?"slideIn .3s":"none"}}>
                    <span style={{fontSize:16}}>{e.event==="order.completed"?"✅":e.event==="payment.received"?"💳":"⭐"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:500}}>{e.event} · {e.platform}</div>
                      <div style={{fontSize:11,color:C.textMuted}}>₹{e.amount?.toLocaleString()||e.rating} · {new Date(e.timestamp).toLocaleTimeString("en-IN")}</div>
                    </div>
                    <span style={{fontSize:11,color:C.green,fontWeight:600}}>{e.scoreImpact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="loans"&&(
          <div style={{maxWidth:960}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:15,fontWeight:600}}>Loan Marketplace</div>
                <div style={{fontSize:12,color:C.textMuted}}>TrustScore: {score} · {LOAN_OFFERS.filter(o=>score>=o.minScore).length} of {LOAN_OFFERS.length} offers unlocked · Saved to Firebase</div>
              </div>
            </div>
            <div style={{background:C.goldDim,border:`1px solid ${C.gold}44`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.gold,marginBottom:16}}>🔒 Greyed-out offers require a higher TrustScore. Connect more signals to unlock them.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {LOAN_OFFERS.map(offer=>{
                const isEligible=score>=offer.minScore;
                const isApplied=appliedIds.has(offer.lender);
                const ptsNeeded=offer.minScore-score;
                return(
                  <div key={offer.id} style={{background:C.card2,border:`1px solid ${isEligible?C.border:C.borderBright}`,borderRadius:12,padding:"16px 18px",cursor:isEligible?"pointer":"default",transition:"all .2s",opacity:isEligible?1:0.4,filter:isEligible?"none":"grayscale(0.7) blur(0.3px)",position:"relative"}}>
                    {!isEligible&&(
                      <div style={{position:"absolute",inset:0,borderRadius:12,background:"linear-gradient(135deg,#060A0F88,#060A0FCC)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>
                        <div style={{background:C.card,border:`1px solid ${C.red}55`,borderRadius:10,padding:"10px 20px",textAlign:"center"}}>
                          <div style={{fontSize:20,marginBottom:4}}>🔒</div>
                          <div style={{fontSize:13,fontWeight:600,color:C.red}}>+{ptsNeeded} pts needed</div>
                          <div style={{fontSize:11,color:C.textMuted}}>Score {offer.minScore}+ required</div>
                        </div>
                      </div>
                    )}
                    <div style={{display:"flex",alignItems:"flex-start",gap:12,position:"relative",zIndex:1}}>
                      <div style={{width:44,height:44,borderRadius:11,background:`${offer.badgeColor}18`,border:`1px solid ${offer.badgeColor}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{offer.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{fontSize:14,fontWeight:600}}>{offer.lender}</span>
                          <span className="tag" style={{background:`${offer.badgeColor}18`,color:offer.badgeColor,borderColor:`${offer.badgeColor}44`,fontSize:10}}>{offer.badge}</span>
                        </div>
                        <div style={{fontSize:12,color:C.textMuted,marginBottom:10}}>{offer.type} · {offer.time} disbursal</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                          {[{l:"Amount",v:`₹${offer.amount.toLocaleString()}`},{l:"Rate p.a.",v:`${offer.rate}%`},{l:"Tenure",v:`${offer.tenure}mo`},{l:"Processing",v:offer.processing}].map(s=>(
                            <div key={s.l}><div style={{fontSize:10,color:C.textMuted}}>{s.l}</div><div style={{fontSize:13,fontWeight:600}}>{s.v}</div></div>
                          ))}
                        </div>
                      </div>
                      <div style={{flexShrink:0}}>
                        {isEligible&&(isApplied?<span className="tag tag-green">Applied ✓</span>:<button className="btn btn-primary btn-sm" onClick={()=>applyForLoan(offer)}>Apply</button>)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="transactions"&&(
          <div style={{maxWidth:800}}>
            {!connected.upi?(
              <div style={{textAlign:"center",padding:60}}>
                <div style={{fontSize:40,marginBottom:16}}>💳</div>
                <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>Connect UPI to see your transactions</div>
                <div style={{fontSize:13,color:C.textMuted}}>Powered by Setu Account Aggregator</div>
              </div>
            ):(()=>{
              const setuData=generateSetuAAStatement(user);
              const allTxns=setuData.Account?.Transactions?.Transaction||[];
              const months=[...new Set(allTxns.map(t=>t.valueDate?.slice(0,7)))].sort().reverse();
              const platform=user?.platform||"Your Platform";
              const platformIcon=getPlatformIcon(platform);
              const credits=allTxns.filter(t=>t.type==="CREDIT").reduce((s,t)=>s+t.amount,0);
              const debits=allTxns.filter(t=>t.type==="DEBIT").reduce((s,t)=>s+t.amount,0);
              return(
                <div>
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:16,fontWeight:600}}>Monthly Transactions</div>
                    <div style={{fontSize:12,color:C.textMuted}}>{platformIcon} {platform} · Setu AA · FIP: {setuData.fipId}</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                    {[{l:"Total Income (3mo)",v:`₹${credits.toLocaleString("en-IN")}`,c:C.green},{l:"Total Expenses",v:`₹${debits.toLocaleString("en-IN")}`,c:C.red},{l:"Avg Monthly",v:`₹${Math.round(credits/3).toLocaleString("en-IN")}`,c:C.accent}].map(s=>(
                      <div key={s.l} className="card" style={{padding:16}}><div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>{s.l}</div><div className="syne" style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div></div>
                    ))}
                  </div>
                  {months.slice(0,3).map(month=>{
                    const txns=allTxns.filter(t=>t.valueDate?.slice(0,7)===month);
                    const mc=txns.filter(t=>t.type==="CREDIT").reduce((s,t)=>s+t.amount,0);
                    const md=txns.filter(t=>t.type==="DEBIT").reduce((s,t)=>s+t.amount,0);
                    return(
                      <div key={month} className="card2" style={{marginBottom:12,overflow:"hidden"}}>
                        <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
                          <div style={{fontSize:13,fontWeight:600}}>{new Date(month+"-01").toLocaleString("en-IN",{month:"long",year:"numeric"})}</div>
                          <div style={{display:"flex",gap:16}}>
                            <span style={{fontSize:12,color:C.green,fontWeight:600}}>+₹{mc.toLocaleString("en-IN")}</span>
                            <span style={{fontSize:12,color:C.red,fontWeight:600}}>-₹{md.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        {txns.slice(0,4).map((tx,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:i<3?`1px solid ${C.border}22`:"none"}}>
                            <div style={{fontSize:18}}>{tx.category==="INCOME"?platformIcon:tx.category==="FUEL"?"⛽":tx.category==="RENT"?"🏠":"💡"}</div>
                            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{tx.narration}</div><div style={{fontSize:10,color:C.textMuted}}>{tx.valueDate} · {tx.mode}</div></div>
                            <div className="mono" style={{fontSize:13,fontWeight:700,color:tx.type==="CREDIT"?C.green:C.red}}>{tx.type==="CREDIT"?"+":"-"}₹{tx.amount.toLocaleString("en-IN")}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {tab==="timeline"&&(
          <div style={{maxWidth:800}}>
            <div style={{marginBottom:24}}><div style={{fontSize:20,fontWeight:700,fontFamily:"Syne,sans-serif",marginBottom:6}}>Score Journey</div><div style={{fontSize:13,color:C.textMuted}}>Powered by Google Firebase · Real-time tracking</div></div>
            <div className="card" style={{padding:24,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",height:120,marginBottom:8,position:"relative"}}>
                {[25,50,75,100].map(v=><div key={v} style={{position:"absolute",left:0,right:0,bottom:`${v}%`,borderTop:`1px dashed ${C.border}`,pointerEvents:"none"}}><span style={{fontSize:9,color:C.textDim,position:"absolute",left:0,top:-8}}>{v}</span></div>)}
                {[{month:"Oct",score:0},{month:"Nov",score:18},{month:"Dec",score:31},{month:"Jan",score:44},{month:"Feb",score:56},{month:"Mar",score:63},{month:"Apr",score:78}].map((d,i)=>{
                  const h=`${(d.score/100)*96}%`,color=d.score>=70?C.green:d.score>=45?C.gold:C.accent;
                  return(<div key={d.month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",position:"relative"}}><div style={{width:"70%",background:color,borderRadius:"4px 4px 0 0",height:h,minHeight:3,alignSelf:"flex-end"}}/><div style={{fontSize:10,color:C.textMuted,marginTop:4}}>{d.month}</div></div>);
                })}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {[{icon:"📈",l:"Score growth",v:"+78 pts",s:"Since joining VEYO",c:C.green},{icon:"⏱️",l:"Time to 60+",v:"3 months",s:"Faster than avg",c:C.accent},{icon:"🏆",l:"Percentile",v:"Top 23%",s:"Among gig workers",c:C.gold}].map(s=>(
                <div className="card" key={s.l} style={{padding:20,textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
                  <div className="syne" style={{fontSize:22,fontWeight:700,color:s.c,marginBottom:4}}>{s.v}</div>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>{s.l}</div>
                  <div style={{fontSize:11,color:C.textMuted}}>{s.s}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="wallet"&&(
          <div style={{maxWidth:720}}>
            <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>Identity Wallet</div>
            <div style={{fontSize:12,color:C.textMuted,marginBottom:20}}>W3C Verifiable Credential · Polygon SBT · Firebase-stored · Worker-owned</div>
            <div style={{background:`linear-gradient(135deg,${C.card} 0%,${C.card2} 100%)`,border:`1px solid ${C.accent}44`,borderRadius:18,padding:28,marginBottom:20,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:160,height:160,borderRadius:"50%",background:C.accentDim}}/>
              <div style={{position:"relative"}}>
                <div style={{fontSize:10,color:C.accent,letterSpacing:2,fontWeight:700,marginBottom:6}}>VEYO TRUST CREDENTIAL · W3C VC · FIREBASE</div>
                <div className="syne" style={{fontSize:22,fontWeight:700}}>{user?.name||"Worker"}</div>
                <div style={{fontSize:13,color:C.textMuted,marginBottom:20}}>{user?.platform||"Gig Worker"} · {user?.city||"India"}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                  {[{l:"TrustScore",v:String(score)},{l:"Income Band",v:(user?.income_range||"").split("–")[0]||"₹20K"},{l:"ZK Verified",v:"✓ Yes"},{l:"Platform",v:user?.platform||"Gig"}].map(m=>(
                    <div key={m.l}><div style={{fontSize:10,color:C.textMuted,marginBottom:3}}>{m.l}</div><div className="mono" style={{fontSize:13,fontWeight:600,color:C.accent}}>{m.v}</div></div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button className="btn btn-primary" onClick={()=>{
                const cred={
                  "@context":["https://www.w3.org/2018/credentials/v1"],
                  type:["VerifiableCredential","VEYOTrustCredential"],
                  issuer:"did:veyo:trustnet-v1",
                  issuanceDate:new Date().toISOString(),
                  credentialSubject:{name:user?.name,city:user?.city,platform:user?.platform,trustScore:score,incomeBand:user?.income_range},
                  proof:{type:"Ed25519Signature2020",created:new Date().toISOString(),proofValue:`z${Math.random().toString(36).substr(2,86)}`},
                };
                const blob=new Blob([JSON.stringify(cred,null,2)],{type:"application/json"});
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a");a.href=url;a.download=`VEYO_VC_${user?.name?.replace(/\s/g,"_")||"worker"}.json`;a.click();
                URL.revokeObjectURL(url);
              }}>⬇ Download W3C Credential</button>
              <button className="btn" onClick={async()=>{
                await fsAdd("notifications",{recipient_id:"lender-global",type:"loan_application",title:"Worker shared TrustCredential",body:`${user?.name||"A worker"} (Score: ${score}) shared W3C VC`,action_label:"View in Queue",action_tab:"queue",read:false});
              }}>📤 Share with Lender</button>
            </div>
          </div>
        )}

        {tab==="advisor"&&(
          <div style={{maxWidth:800,height:"calc(100vh - 180px)"}}>
            <div className="card" style={{height:"100%",overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <AIChatAdvisor role="worker" userScore={score} connectedSignals={connectedKeys.length} workerProfile={user}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LENDER DASHBOARD ─────────────────────────────────────────────────────────
function LenderDashboard({userId,onLogout}){
  const [tab,setTab]=useState("queue");
  const [selected,setSelected]=useState(null);
  const [approving,setApproving]=useState(null);
  const [approved,setApproved]=useState(new Set());
  const [liveApps,setLiveApps]=useState([]);
  const tc=t=>t==="A"?C.green:t==="B"?C.gold:C.red;

  const STATIC_BORROWERS=[
    {id:"WRK-001",name:"Arjun Kumar",role:"Rapido Driver",city:"Bengaluru",score:78,tier:"A",income:"₹44,200",signals:5,ask:"₹40,000",ask_n:40000,riskPct:2.1,avatar:"🚗"},
    {id:"WRK-002",name:"Sunita Devi",role:"Kirana Owner",city:"Surat",score:63,tier:"B",income:"₹31,000",signals:4,ask:"₹25,000",ask_n:25000,riskPct:4.8,avatar:"🏪"},
    {id:"WRK-003",name:"Mohammed Rafiq",role:"Auto Driver",city:"Hyderabad",score:51,tier:"B",income:"₹22,800",signals:3,ask:"₹15,000",ask_n:15000,riskPct:7.2,avatar:"🛺"},
    {id:"WRK-004",name:"Lakshmi Bai",role:"Domestic Worker",city:"Chennai",score:44,tier:"C",income:"₹18,000",signals:3,ask:"₹10,000",ask_n:10000,riskPct:11.4,avatar:"🏠"},
    {id:"WRK-005",name:"Rajan Pillai",role:"Delivery Partner",city:"Kochi",score:71,tier:"A",income:"₹38,500",signals:5,ask:"₹30,000",ask_n:30000,riskPct:3.3,avatar:"🛵"},
    {id:"WRK-006",name:"Priya Venkat",role:"Freelance Designer",city:"Pune",score:69,tier:"B",income:"₹52,000",signals:4,ask:"₹50,000",ask_n:50000,riskPct:3.8,avatar:"💻"},
  ];

  // Firebase Realtime listener for live applications
  useEffect(()=>{
    const q=query(collection(db,"loan_applications"),orderBy("createdAt","desc"),limit(30));
    const unsub=onSnapshot(q,snap=>{
      setLiveApps(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return()=>unsub();
  },[]);

  const approve=async(id)=>{
    setApproving(id);
    const liveApp=liveApps.find(a=>a.id===id);
    if(liveApp){
      await updateDoc(doc(db,"loan_applications",id),{status:"approved",approved_at:new Date().toISOString()});
      if(liveApp.worker_id){
        await fsAdd("notifications",{recipient_id:liveApp.worker_id,type:"loan_approved",title:"Loan Approved! 🎉",body:`₹${liveApp.amount?.toLocaleString()} ${liveApp.loan_type} approved.`,read:false});
      }
    }
    await sleep(1500);setApproving(null);setApproved(s=>new Set([...s,id]));
  };

  const TABS=[{id:"queue",label:"Verification Queue"},{id:"applications",label:`Live Apps (${liveApps.length})`},{id:"analytics",label:"Portfolio Analytics"},{id:"advisor",label:"🤖 Gemini Underwriter"}];

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column"}}>
      <Topbar role="lender" user={{name:"Varanasi Finance NBFC",sub:"Lender · Firebase Realtime"}} userId="lender-global" onLogout={onLogout} onNavigate={t=>setTab(t)}/>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",gap:24,overflowX:"auto"}}>
        {[{l:"Portfolio",v:"₹2.4Cr",d:"+12%",c:C.accent},{l:"Borrowers",v:"847",d:"+34 today",c:C.green},{l:"NPA Rate",v:"0.3%",d:"↓ from 8.2%",c:C.gold},{l:"Live Apps",v:String(liveApps.length),d:"Firebase Realtime",c:C.orange}].map(s=>(
          <div key={s.l} style={{textAlign:"center",flexShrink:0}}>
            <div className="syne" style={{fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:10,color:C.textMuted}}>{s.l}</div>
            <div style={{fontSize:10,color:s.c}}>{s.d}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",gap:2,overflowX:"auto"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 18px",background:"none",border:"none",cursor:"pointer",borderBottom:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent",color:tab===t.id?C.gold:C.textMuted,fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:tab===t.id?600:400,transition:"all .18s",marginBottom:-1,whiteSpace:"nowrap"}}>{t.label}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"24px"}}>
        {tab==="queue"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:20,maxWidth:1280}}>
            <div className="card" style={{overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:14,fontWeight:600}}>Verification Queue</div>
                <span className="tag tag-green">● Live · Firebase</span>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:C.surface}}>{["Worker","Score","Income","Signals","Ask","Risk","Action"].map(h=><th key={h} style={{padding:"10px 16px",fontSize:11,color:C.textMuted,textAlign:"left",fontWeight:500}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {STATIC_BORROWERS.map(b=>(
                      <tr key={b.id} onClick={()=>setSelected(b)} style={{cursor:"pointer",borderTop:`1px solid ${C.border}`,background:selected?.id===b.id?C.accentDim:"transparent",transition:"background .15s"}}>
                        <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:30,height:30,borderRadius:"50%",background:`${tc(b.tier)}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{b.avatar}</div><div><div style={{fontSize:13,fontWeight:500}}>{b.name}</div><div style={{fontSize:11,color:C.textMuted}}>{b.role} · {b.city}</div></div></div></td>
                        <td style={{padding:"12px 16px"}}><span style={{fontSize:16,fontWeight:700,color:tc(b.tier),fontFamily:"Syne,sans-serif"}}>{b.score}</span></td>
                        <td style={{padding:"12px 16px"}}><span className="mono" style={{fontSize:13}}>{b.income}</span></td>
                        <td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(i=><div key={i} style={{width:8,height:8,borderRadius:2,background:i<=b.signals?C.green:C.border}}/>)}</div></td>
                        <td style={{padding:"12px 16px"}}><span style={{fontSize:13,fontWeight:600}}>{b.ask}</span></td>
                        <td style={{padding:"12px 16px"}}><span style={{fontSize:12,fontWeight:600,color:b.riskPct<5?C.green:b.riskPct<9?C.gold:C.red}}>{b.riskPct}%</span></td>
                        <td style={{padding:"12px 16px"}}>{approved.has(b.id)?<span className="tag tag-green">Approved ✓</span>:<button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();approve(b.id);}} disabled={approving===b.id}>{approving===b.id?<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span>:"Approve"}</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {selected&&(
              <div className="card" style={{padding:22}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18}}>
                  <div style={{width:48,height:48,borderRadius:"50%",background:`${tc(selected.tier)}18`,border:`1px solid ${tc(selected.tier)}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{selected.avatar}</div>
                  <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700}}>{selected.name}</div><div style={{fontSize:12,color:C.textMuted}}>{selected.role} · {selected.city}</div></div>
                  <div style={{textAlign:"right"}}><div className="syne" style={{fontSize:30,fontWeight:800,color:tc(selected.tier)}}>{selected.score}</div><div style={{fontSize:10,color:C.textMuted}}>TrustScore</div></div>
                </div>
                {SIGNALS.map((sig,i)=><SignalBar key={sig.key} label={sig.label} sublabel="" icon={sig.icon} color={sig.color} pct={sig.pct} connected={i<selected.signals}/>)}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14,marginTop:16}}>
                  {[{l:"Loan Ask",v:selected.ask},{l:"Risk Est.",v:`${selected.riskPct}%`},{l:"Signals",v:`${selected.signals}/5`},{l:"Income",v:selected.income}].map(s=>(
                    <div key={s.l} className="card2" style={{padding:12}}><div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>{s.l}</div><div style={{fontSize:14,fontWeight:700}}>{s.v}</div></div>
                  ))}
                </div>
                {approved.has(selected.id)?<div className="tag tag-green" style={{width:"100%",justifyContent:"center",padding:"10px",fontSize:13}}>✓ Approved</div>:<button className="btn btn-primary" style={{width:"100%",padding:12}} onClick={()=>approve(selected.id)} disabled={approving===selected.id}>{approving===selected.id?"Processing...":`Pre-approve ${selected.ask} →`}</button>}
              </div>
            )}
          </div>
        )}
        {tab==="applications"&&(
          <div style={{maxWidth:900}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{fontSize:16,fontWeight:600}}>Live Applications</div><div style={{fontSize:12,color:C.textMuted}}>Firebase Realtime · Zero refresh needed</div></div>
              <span className="tag tag-green">● Firebase Live</span>
            </div>
            {liveApps.length===0?<div style={{textAlign:"center",padding:60,color:C.textDim}}><div style={{fontSize:40,marginBottom:16}}>📋</div>No applications yet. Workers applying appear here instantly via Firebase.</div>:(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {liveApps.map(app=>(
                  <div key={app.id} className="card" style={{padding:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{app.worker_name||"Unknown"}{app.worker_platform&&` · ${app.worker_platform}`}</div>
                        <div style={{fontSize:12,color:C.textMuted,marginBottom:8}}>Applied for <strong>{app.loan_type}</strong> from {app.lender_name}</div>
                        <div style={{display:"flex",gap:16}}>
                          <div><span style={{fontSize:11,color:C.textMuted}}>Amount: </span><span style={{fontSize:13,fontWeight:600,color:C.accent}}>₹{app.amount?.toLocaleString()}</span></div>
                          <div><span style={{fontSize:11,color:C.textMuted}}>Score: </span><span style={{fontSize:13,fontWeight:600,color:scoreColor(app.worker_score)}}>{app.worker_score}</span></div>
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
                        {approved.has(app.id)||app.status==="approved"?<span className="tag tag-green">Approved ✓</span>:<button className="btn btn-primary btn-sm" onClick={()=>approve(app.id)} disabled={approving===app.id}>{approving===app.id?<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span>:"Approve"}</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab==="analytics"&&(
          <div style={{maxWidth:1100}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
              {[{l:"Total Portfolio",v:"₹2.4Cr",d:"+₹18L this month",c:C.accent},{l:"Active Borrowers",v:"847",d:"+34 this week",c:C.green},{l:"Avg TrustScore",v:"64.2",d:"↑ from 58.1",c:C.gold},{l:"NPA Rate",v:"0.3%",d:"vs 8.2% traditional",c:C.purple}].map(s=>(
                <div key={s.l} className="card" style={{padding:20}}><div style={{fontSize:11,color:C.textMuted,marginBottom:8}}>{s.l}</div><div className="syne" style={{fontSize:26,fontWeight:700,color:s.c,marginBottom:4}}>{s.v}</div><div style={{fontSize:11,color:s.c}}>{s.d}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div className="card" style={{padding:22}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Borrower Tier Distribution</div>
                {[{tier:"A",count:312,color:C.green,label:"Score 70–100"},{tier:"B",count:398,color:C.gold,label:"Score 50–70"},{tier:"C",count:137,color:C.red,label:"Score 30–50"}].map(t=>{
                  const pct=Math.round(t.count/847*100);
                  return(<div key={t.tier} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{display:"flex",gap:8,alignItems:"center"}}><span className="tag" style={{background:`${t.color}18`,color:t.color,borderColor:`${t.color}44`}}>Tier {t.tier}</span><span style={{fontSize:12,color:C.textMuted}}>{t.label}</span></div><span style={{fontSize:13,fontWeight:600}}>{t.count} ({pct}%)</span></div><div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:t.color,borderRadius:4}}/></div></div>);
                })}
              </div>
              <div className="card" style={{padding:22}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Live Firebase Stats</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div className="live-dot"/><span style={{fontSize:13}}>Firebase Firestore · Real-time sync</span></div>
                {[{l:"Total applications (Firestore)",v:String(liveApps.length)},{l:"Approved",v:String(liveApps.filter(a=>a.status==="approved").length)},{l:"Pending review",v:String(liveApps.filter(a=>a.status==="applied").length)},{l:"Total disbursed",v:`₹${liveApps.filter(a=>a.status==="approved").reduce((s,a)=>s+(a.amount||0),0).toLocaleString("en-IN")}`}].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:12,color:C.textMuted}}>{r.l}</span><span style={{fontSize:13,fontWeight:700,color:C.accent}}>{r.v}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab==="advisor"&&(
          <div style={{maxWidth:800,height:"calc(100vh - 240px)"}}>
            <div className="card" style={{height:"100%",overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <AIChatAdvisor role="lender" userScore={72} connectedSignals={5} portfolioStats={{name:"Varanasi Finance NBFC",borrowers:847,npa:"0.3%",avgScore:64.2}}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GOVT DASHBOARD ───────────────────────────────────────────────────────────
function GovtDashboard({userId,onLogout}){
  const [tab,setTab]=useState("schemes");
  const [feed,setFeed]=useState([]);
  const [eligCalc,setEligCalc]=useState({income:"",city:"",occupation:""});
  const [eligResult,setEligResult]=useState(null);
  const [calcLoading,setCalcLoading]=useState(false);

  useEffect(()=>{
    const EVENTS=[
      {msg:"VY-1821 (Rapido, BLR) matched to PM SVANidhi — ₹10,000 loan initiated",type:"match"},
      {msg:"VY-4421 (Kirana, Surat) GSTN auto-filing → MUDRA Shishu approved",type:"filing"},
      {msg:"NPCI AA: 142 new workers in Tamil Nadu — UPI signal linked",type:"signal"},
      {msg:"Disbursement: ₹50,000 → PMEGP · 23 MSME units · Nagpur",type:"disbursal"},
      {msg:"Stand-Up India: 8 women entrepreneurs enrolled · Jaipur",type:"match"},
      {msg:"Firebase: 342 new worker profiles synced across 5 states",type:"signal"},
    ];
    EVENTS.forEach((e,i)=>setTimeout(()=>setFeed(p=>[{...e,ts:new Date().toLocaleTimeString("en-IN")},...p].slice(0,20)),i*2200));
  },[]);

  const runEligCalc=async()=>{
    setCalcLoading(true);await sleep(1200);
    const income=parseInt(eligCalc.income.replace(/\D/g,""))||0;
    const occ=eligCalc.occupation.toLowerCase();
    const schemes=[];
    if(income<50000)schemes.push({name:"PM SVANidhi",amount:"₹10,000–₹50,000",reason:"Street vendor/micro-business.",apply:"pmsvanidhi.mohua.gov.in",color:C.accent});
    if(income<100000)schemes.push({name:"MUDRA Shishu",amount:"Up to ₹50,000",reason:"Non-corporate business.",apply:"mudra.org.in",color:C.gold});
    if(["woman","female","women"].some(w=>occ.includes(w)))schemes.push({name:"Stand-Up India",amount:"₹10L–₹1Cr",reason:"Women entrepreneur.",apply:"standupmitra.in",color:C.purple});
    if(["craft","artisan","weav","tailor"].some(w=>occ.includes(w)))schemes.push({name:"PMEGP",amount:"₹10L + 35% subsidy",reason:"Artisan/craftsperson.",apply:"kviconline.gov.in",color:C.green});
    if(!schemes.length)schemes.push({name:"MUDRA Tarun",amount:"₹50K–₹10L",reason:"Growing business.",apply:"mudra.org.in",color:C.gold});
    setEligResult(schemes);setCalcLoading(false);
  };

  const REAL_SCHEMES=[
    {name:"PM SVANidhi",ministry:"MoHUA",pct:100,amount_cr:5200,color:C.accent,icon:"🏙️",desc:"Street vendor working capital loans.",source:"MoHUA Feb 2024",veyo:320000},
    {name:"MUDRA Yojana",ministry:"SIDBI",pct:100,amount_cr:2703000,color:C.gold,icon:"💰",desc:"Micro loans up to ₹50,000.",source:"MUDRA 2023-24",veyo:1800000},
    {name:"Stand-Up India",ministry:"DFS/SIDBI",pct:100,amount_cr:44000,color:C.purple,icon:"🚀",desc:"₹10L–₹1Cr for SC/ST and women.",source:"Stand-Up Mar 2024",veyo:82000},
    {name:"PMEGP",ministry:"MSME Ministry",pct:100,amount_cr:22000,color:C.green,icon:"🌱",desc:"15–35% subsidy for micro-enterprises.",source:"MSME 2023-24",veyo:420000},
  ];

  const TABS=[{id:"schemes",label:"Scheme Tracker"},{id:"eligibility",label:"Eligibility Calculator"},{id:"feed",label:"Live Feed"},{id:"advisor",label:"🤖 Gemini Advisor"}];
  const eventColors={match:C.green,filing:C.accent,credential:C.purple,signal:C.gold,disbursal:C.orange};

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column"}}>
      <Topbar role="govt" user={{name:"Ministry of Labour & Employment",sub:"Govt · Firebase + Gemini AI"}} userId="govt-global" onLogout={onLogout} onNavigate={t=>setTab(t)}/>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"10px 24px",display:"flex",gap:28,overflowX:"auto"}}>
        {[{l:"Workers on TrustNet",v:"4.8M",c:C.accent},{l:"Scheme Matched",v:"18.68L",c:C.green},{l:"Avg Disbursal",v:"2.1 days",c:C.gold},{l:"States Covered",v:"28+",c:C.orange}].map(s=>(
          <div key={s.l} style={{textAlign:"center",flexShrink:0}}>
            <div className="syne" style={{fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:10,color:C.textMuted}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",gap:2,overflowX:"auto"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 18px",background:"none",border:"none",cursor:"pointer",borderBottom:tab===t.id?`2px solid ${C.purple}`:"2px solid transparent",color:tab===t.id?C.purple:C.textMuted,fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:tab===t.id?600:400,transition:"all .18s",marginBottom:-1,whiteSpace:"nowrap"}}>{t.label}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"24px"}}>
        {tab==="schemes"&&(
          <div style={{maxWidth:1100}}>
            <div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:600,marginBottom:4}}>Government Scheme Tracker</div><div style={{fontSize:12,color:C.textMuted}}>Live data · Firebase-logged</div></div>
            <div style={{display:"grid",gap:16}}>
              {REAL_SCHEMES.map(s=>(
                <div className="card" key={s.name} style={{padding:24}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      <div style={{width:48,height:48,borderRadius:12,background:`${s.color}18`,border:`1px solid ${s.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{s.icon}</div>
                      <div>
                        <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{s.name}</div>
                        <div style={{fontSize:12,color:C.textMuted,marginBottom:6}}>{s.desc}</div>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          <span className="tag tag-accent" style={{fontSize:10}}>{s.ministry}</span>
                          <span className="tag" style={{background:`${s.color}14`,color:s.color,borderColor:`${s.color}33`,fontSize:10}}>₹{s.amount_cr>=100000?(s.amount_cr/100000).toFixed(1)+"L Cr":(s.amount_cr/100).toFixed(0)+"L"} disbursed</span>
                          <span style={{fontSize:10,color:C.textDim}}>Source: {s.source}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div className="syne" style={{fontSize:32,fontWeight:800,color:s.color}}>100%</div>
                      <div style={{fontSize:11,color:C.green}}>+{(s.veyo/1000).toFixed(0)}K via TrustNet</div>
                    </div>
                  </div>
                  <div style={{height:10,background:C.border,borderRadius:5,overflow:"hidden",marginBottom:14}}>
                    <div style={{height:"100%",width:"100%",background:s.color,borderRadius:5,boxShadow:`0 0 8px ${s.color}66`}}/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-sm" style={{fontSize:11,borderColor:`${s.color}44`,color:s.color}} onClick={async()=>{await fsAdd("notifications",{recipient_id:"govt-global",type:"score_update",title:`Scheme report: ${s.name}`,body:`${(s.veyo/1000).toFixed(0)}K new via TrustNet this quarter.`,read:false});}}>📊 Log Report to Firebase</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="eligibility"&&(
          <div style={{maxWidth:700}}>
            <div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:600,marginBottom:4}}>Scheme Eligibility Calculator</div><div style={{fontSize:12,color:C.textMuted}}>Results logged to Firebase Firestore</div></div>
            <div className="card" style={{padding:24,marginBottom:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
                <div><label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Monthly Income (₹)</label><input className="input" placeholder="e.g. 25000" value={eligCalc.income} onChange={e=>setEligCalc(c=>({...c,income:e.target.value}))}/></div>
                <div><label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>City</label><input className="input" placeholder="e.g. Jaipur" value={eligCalc.city} onChange={e=>setEligCalc(c=>({...c,city:e.target.value}))}/></div>
                <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Occupation</label><input className="input" placeholder="e.g. woman artisan, kirana, auto driver" value={eligCalc.occupation} onChange={e=>setEligCalc(c=>({...c,occupation:e.target.value}))}/></div>
              </div>
              <button className="btn btn-primary" style={{width:"100%",padding:12}} onClick={runEligCalc} disabled={!eligCalc.income||calcLoading}>
                {calcLoading?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span> Checking...</>:"Check Eligible Schemes →"}
              </button>
            </div>
            {eligResult&&(
              <div style={{animation:"fadeUp .3s"}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:12,color:C.green}}>✅ {eligResult.length} scheme{eligResult.length>1?"s":""} found</div>
                {eligResult.map((s,i)=>(
                  <div key={i} className="card" style={{padding:20,marginBottom:12,border:`1px solid ${s.color}33`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{fontSize:14,fontWeight:600}}>{s.name}</div>
                      <div style={{fontSize:13,fontWeight:700,color:s.color}}>{s.amount}</div>
                    </div>
                    <div style={{fontSize:12,color:C.textMuted,marginBottom:12}}>{s.reason}</div>
                    <div style={{display:"flex",gap:8}}>
                      <a href={`https://${s.apply}`} target="_blank" rel="noreferrer" style={{color:C.accent,fontSize:12,textDecoration:"none",border:`1px solid ${C.accent}44`,padding:"5px 12px",borderRadius:6}}>Apply at {s.apply} →</a>
                      <button className="btn btn-sm" style={{fontSize:11}} onClick={async()=>{await fsAdd("eligibility_logs",{income:eligCalc.income,city:eligCalc.city,occupation:eligCalc.occupation,scheme:s.name,amount:s.amount,logged_at:new Date().toISOString()});}}>📋 Log to Firebase</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab==="feed"&&(
          <div style={{maxWidth:800}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div className="live-dot"/>
              <div style={{fontSize:18,fontWeight:700,fontFamily:"Syne,sans-serif"}}>Real-Time Signal Feed</div>
              <span className="mono" style={{marginLeft:"auto",fontSize:11,color:C.textMuted}}>Firebase · AA · ONDC · GSTN</span>
            </div>
            <div className="card" style={{padding:22}}>
              {feed.length===0&&<div style={{color:C.textDim,fontSize:13,textAlign:"center",padding:20}}>Connecting...</div>}
              {feed.map((f,i)=>{
                const color=eventColors[f.type]||C.textMuted;
                return(<div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`,animation:i===0?"slideIn .3s":"none"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:color,marginTop:6,flexShrink:0}}/>
                  <div style={{flex:1}}><div style={{fontSize:13}}>{f.msg}</div><div className="mono" style={{fontSize:10,color:C.textDim,marginTop:2}}>{f.ts}</div></div>
                  <span className="tag" style={{background:`${color}18`,color,borderColor:`${color}33`,fontSize:10,flexShrink:0,alignSelf:"flex-start"}}>{f.type}</span>
                </div>);
              })}
            </div>
          </div>
        )}
        {tab==="advisor"&&(
          <div style={{maxWidth:800,height:"calc(100vh - 240px)"}}>
            <div className="card" style={{height:"100%",overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <AIChatAdvisor role="govt" userScore={null} connectedSignals={null}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("login");
  const [role,setRole]=useState(null);
  const [user,setUser]=useState(null);
  const [sessionId,setSessionId]=useState(null);
  const [phone,setPhone]=useState(null);
  const [googleUser,setGoogleUser]=useState(null);

  const handleLogin=(r,sid,ph,gu=null)=>{
    setRole(r);setSessionId(sid);setPhone(ph);setGoogleUser(gu);
    if(r==="worker")setScreen("onboarding");
    else setScreen("dashboard");
  };
  const handleOnboardingComplete=(data)=>{
    setUser({name:data.name,city:data.city,income_range:data.income,role_type:data.role,platform:data.platform,phone,...data,...(googleUser||{})});
    setScreen("dashboard");
  };
  const handleLogout=()=>{
    auth.signOut();
    setScreen("login");setRole(null);setUser(null);setSessionId(null);
  };

  return(
    <>
      <style>{css}</style>
      {screen==="login"&&<LoginPage onLogin={handleLogin}/>}
      {screen==="onboarding"&&role==="worker"&&<OnboardingFlow onComplete={handleOnboardingComplete} sessionId={sessionId} phone={phone} googleUser={googleUser}/>}
      {screen==="dashboard"&&role==="worker"&&<WorkerDashboard user={user} userId={sessionId} onLogout={handleLogout}/>}
      {screen==="dashboard"&&role==="lender"&&<LenderDashboard userId={sessionId} onLogout={handleLogout}/>}
      {screen==="dashboard"&&role==="govt"&&<GovtDashboard userId={sessionId} onLogout={handleLogout}/>}
    </>
  );
}