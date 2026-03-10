import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES & KEYFRAMES
═══════════════════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes shimmer {
      0%   { background-position: -800px 0; }
      100% { background-position:  800px 0; }
    }
    @keyframes lineExpand {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @keyframes fadeScaleIn {
      from { opacity: 0; transform: scale(0.88) translateY(24px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);    }
    }
    @keyframes floatDot {
      0%,100% { transform: translateY(0);     }
      50%     { transform: translateY(-10px); }
    }
    @keyframes rotateSlow  { to { transform: rotate(360deg);  } }
    @keyframes rotateSlowR { to { transform: rotate(-360deg); } }
    @keyframes glowPulse {
      0%,100% { box-shadow: 0 6px 28px rgba(180,100,30,0.14); }
      50%     { box-shadow: 0 12px 44px rgba(180,100,30,0.34); }
    }
    @keyframes iconBounce {
      0%,100% { transform: translateY(0)   scale(1);    }
      40%     { transform: translateY(-7px) scale(1.14); }
    }

    .nav-dot { transition: all 0.3s ease; cursor: pointer; }
    .nav-dot:hover { transform: scale(1.4); }

    .nav-btn {
      transition: all 0.25s ease; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .nav-btn:hover { transform: scale(1.12); }
    .nav-btn:disabled { opacity: 0.3; cursor: default; transform: none !important; }

    .quad-card {
      transition: transform 0.35s cubic-bezier(.23,1,.32,1),
                  box-shadow 0.35s ease, border-color 0.35s ease,
                  background 0.3s ease !important;
    }
    .quad-card:hover { transform: translateY(-7px) scale(1.022) !important; }

    .member-row { transition: all 0.22s ease !important; }
    .member-row:hover {
      background: rgba(180,100,30,0.06) !important;
      border-color: rgba(180,100,30,0.35) !important;
      transform: translateX(6px) !important;
    }

    .prezi-canvas {
      transition: transform 0.95s cubic-bezier(0.77, 0, 0.175, 1);
      will-change: transform;
    }
    .overview-slide:hover {
      filter: brightness(1.04) !important;
      transform: scale(1.04) !important;
      cursor: pointer !important;
    }
    .overview-slide { transition: filter 0.3s ease, transform 0.3s ease !important; }

    @keyframes barGrow {
      from { width: 0; }
      to   { width: 100%; }
    }
    @keyframes scaleIn {
      from { opacity:0; transform: scale(0.72) translateY(30px); }
      to   { opacity:1; transform: scale(1)   translateY(0); }
    }
    @keyframes floatCard {
      0%,100% { transform: translateY(0px); }
      50%     { transform: translateY(-9px); }
    }
    .company-card {
      transition: transform 0.38s cubic-bezier(.23,1,.32,1),
                  box-shadow 0.38s ease, border-color 0.38s ease !important;
    }
    .company-card:hover {
      transform: translateY(-12px) scale(1.04) !important;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */
function Orb({ style }) {
  return <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(90px)", pointerEvents:"none", ...style }} />;
}

function DotGrid({ visible, color="#b4641e", cols=7, rows=5 }) {
  return (
    <div style={{
      position:"absolute", top:28, right:36,
      display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:10,
      opacity:visible?0.28:0, transition:"opacity 0.8s ease",
      pointerEvents:"none", zIndex:0,
    }}>
      {Array.from({length:cols*rows}).map((_,i)=>(
        <div key={i} style={{
          width:5, height:5, borderRadius:"50%", background:color,
          animation:`floatDot ${2.4+(i%4)*0.35}s ease-in-out ${(i%5)*0.25}s infinite`,
        }}/>
      ))}
    </div>
  );
}

function CornerBrackets({ visible, color="rgba(180,100,30,0.28)" }) {
  return (
    <>
      {[
        { top:18, left:18,   borderTop:`2px solid ${color}`, borderLeft:`2px solid ${color}` },
        { top:18, right:18,  borderTop:`2px solid ${color}`, borderRight:`2px solid ${color}` },
        { bottom:18, left:18,  borderBottom:`2px solid ${color}`, borderLeft:`2px solid ${color}` },
        { bottom:18, right:18, borderBottom:`2px solid ${color}`, borderRight:`2px solid ${color}` },
      ].map((s,i)=>(
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20, opacity:visible?0.75:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </>
  );
}

function HeaderRule({ visible }) {
  return (
    <div style={{ margin:"14px 72px 0", height:3, background:"#e8e2d9", borderRadius:2, overflow:"hidden", position:"relative", zIndex:2, opacity:visible?1:0, transition:"opacity 0.4s ease" }}>
      {visible && <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,#b4641e,#e76f51 55%,#d4a017)", transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
    </div>
  );
}

function SlideEyebrow({ text, visible }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:16, opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(-18px)", transition:"all 0.7s cubic-bezier(.23,1,.32,1)" }}>
      <div style={{ width:3, height:30, borderRadius:2, background:"linear-gradient(to bottom,#b4641e,rgba(180,100,30,0.15))" }}/>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, letterSpacing:5, color:"#b4641e", textTransform:"uppercase", fontWeight:600 }}>{text}</span>
    </div>
  );
}

function ShimmerText({ children }) {
  return (
    <span style={{
      backgroundImage:"linear-gradient(90deg,#b4641e 0%,#e76f51 40%,#d4a017 80%,#b4641e 100%)",
      backgroundSize:"700px auto",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
      animation:"shimmer 4s linear infinite", display:"inline-block",
    }}>{children}</span>
  );
}

function FooterRule({ visible }) {
  return (
    <div style={{ padding:"0 72px 20px", display:"flex", alignItems:"center", gap:12, opacity:visible?1:0, transition:"opacity 0.8s ease 0.3s", zIndex:2 }}>
      <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.09)" }}/>
      <span style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:"#c0b0a4", letterSpacing:3, textTransform:"uppercase" }}>Strategic Convergence · Global FMCG Sector</span>
      <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.09)" }}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 1 — GROUP INTRODUCTION
═══════════════════════════════════════════════════════════════════════════ */
const MEMBERS = [
  { id:"25183", name:"Akhil P Chandrasekhar", role:"Strategic Lead" },
  { id:"25191", name:"Arvind Kumar Mishra",   role:"Research Analyst" },
  { id:"25198", name:"Likith Yadav S",        role:"Data Strategist" },
  { id:"25200", name:"Gokul K",                role:"Operations Analyst" },
  { id:"25204", name:"Kiran N M",              role:"Market Analyst" },
  { id:"25219", name:"S D Yashika",            role:"Sustainability Lead" },
];
const MEMBER_COLORS  = ["#2d7d46","#0077b6","#c1121f","#1b3a4b","#7b2d8b","#b5541b"];
const MEMBER_AVATARS = ["🌿","📊","💡","⚙️","📈","🌱"];

function Slide1({ active }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(()=>setPhase(1), 150),
      setTimeout(()=>setPhase(2), 550),
      setTimeout(()=>setPhase(3), 950),
      setTimeout(()=>setPhase(4), 1300),
      setTimeout(()=>setPhase(5), 1650),
    ];
    return ()=>t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{ width:"100%", height:"100%", background:"#f5f3ef", display:"flex", alignItems:"stretch", position:"relative", overflow:"hidden" }}>
      <Orb style={{ width:620, height:620, background:"rgba(45,125,70,0.07)",  top:-180, left:-180, animation:"rotateSlow 42s linear infinite" }}/>
      <Orb style={{ width:480, height:480, background:"rgba(180,100,30,0.09)", bottom:-120, right:-120, animation:"rotateSlowR 30s linear infinite" }}/>
      <Orb style={{ width:320, height:320, background:"rgba(0,119,182,0.06)",  top:"30%", left:"45%" }}/>
      <DotGrid visible={phase>=5}/>

      {/* Vertical separator */}
      <div style={{ position:"absolute", left:"56%", top:"7%", height:"86%", width:1.5, zIndex:1, background:"linear-gradient(to bottom,transparent,rgba(180,100,30,0.22) 25%,rgba(180,100,30,0.15) 75%,transparent)" }}/>

      {/* ── LEFT PANEL ── */}
      <div style={{ flex:"0 0 56%", display:"flex", flexDirection:"column", justifyContent:"center", padding:"52px 60px 52px 72px", position:"relative", zIndex:2 }}>
        <SlideEyebrow text="Slide 01 · Organizational Dynamics · SDMIMD" visible={phase>=1}/>

        {/* Main title */}
        <div style={{ opacity:phase>=2?1:0, transform:phase>=2?"translateY(0)":"translateY(38px)", transition:"all 0.9s cubic-bezier(.23,1,.32,1)" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:58, fontWeight:900, lineHeight:1.08, color:"#1a1a1a", letterSpacing:-2 }}>
            Strategic <ShimmerText>Convergence</ShimmerText>
          </h1>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:58, fontWeight:900, lineHeight:1.08, color:"#1a1a1a", letterSpacing:-2, marginTop:2 }}>in the Global</h1>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:58, fontWeight:900, lineHeight:1.08, color:"#1a1a1a", letterSpacing:-2, marginTop:2 }}>FMCG Sector</h1>
        </div>

        {/* Divider */}
        <div style={{ marginTop:28, marginBottom:22, height:3, background:"#e8e2d9", borderRadius:2, overflow:"hidden", position:"relative", opacity:phase>=3?1:0, transition:"opacity 0.5s" }}>
          {phase>=3 && <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,#b4641e,#e76f51 60%,#d4a017)", transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
        </div>

        {/* Subtitle */}
        <div style={{ opacity:phase>=3?1:0, transform:phase>=3?"translateY(0)":"translateY(20px)", transition:"all 0.7s ease 0.1s", marginBottom:32 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:18.5, lineHeight:1.7, color:"#6b6055", maxWidth:460, fontWeight:300 }}>
            Exhaustive Comparative Analysis of Management Frameworks at{" "}
            <strong style={{ color:"#3a3330", fontWeight:700 }}>Dabur, Marico, Reckitt &amp; Nestlé</strong>
          </p>
        </div>

      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"52px 56px 52px 44px", position:"relative", zIndex:2 }}>
        {/* Member cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {MEMBERS.map((m,i)=>(
            <div key={m.id} className="member-row" style={{
              display:"flex", alignItems:"center", gap:16,
              padding:"11px 18px", background:"#fff",
              border:"1px solid rgba(0,0,0,0.07)", borderRadius:12,
              boxShadow:"0 2px 10px rgba(0,0,0,0.05)", cursor:"default",
              opacity:phase>=4?1:0,
              transform:phase>=4?"translateX(0)":"translateX(28px)",
              transition:`all 0.55s cubic-bezier(.23,1,.32,1) ${0.15+i*0.07}s`,
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:18.5, fontWeight:700, color:"#1a1a1a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.name}</div>
              </div>
              <div style={{ fontFamily:"'Courier New',monospace", fontSize:16.5, color:"#b4641e", background:"rgba(180,100,30,0.09)", border:"1px solid rgba(180,100,30,0.2)", padding:"4px 11px", borderRadius:6, flexShrink:0, fontWeight:600 }}>{m.id}</div>
            </div>
          ))}
        </div>

        {/* Bottom rule */}
        <div style={{ marginTop:22, display:"flex", alignItems:"center", gap:12, opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.2s" }}>
          <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.09)" }}/>
          <span style={{ fontFamily:"'Courier New',monospace", fontSize:13.5, color:"#c0b0a4", letterSpacing:3, textTransform:"uppercase" }}>SDMIMD · 2025-27</span>
          <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.09)" }}/>
        </div>
      </div>

      <CornerBrackets visible={phase>=5}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 2 — PROJECT OVERVIEW
═══════════════════════════════════════════════════════════════════════════ */
const QUADRANTS = [
  {
    id:"objective", icon:"🎯", label:"01", title:"Objective",
    color:"#2d7d46", lightColor:"rgba(45,125,70,0.08)", borderColor:"rgba(45,125,70,0.22)",
    points:[
      "Analyze management frameworks of Dabur, Marico, Reckitt & Nestlé",
      "Balance profitability, sustainability & operational efficiency",
      "Uncover emerging best practices in FMCG leadership",
    ],
  },
  {
    id:"context", icon:"🌐", label:"02", title:"Industry Context",
    color:"#0077b6", lightColor:"rgba(0,119,182,0.07)", borderColor:"rgba(0,119,182,0.2)",
    points:[
      "Digital disruption & shifting consumer behaviour",
      "Supply chain volatility & rising sustainability expectations",
      "Shift: shareholder → multi-capital value creation",
    ],
  },
  {
    id:"framework", icon:"🔬", label:"03", title:"Analytical Framework",
    color:"#b4641e", lightColor:"rgba(180,100,30,0.07)", borderColor:"rgba(180,100,30,0.2)",
    points:[
      "Strategic Architecture — vision & growth frameworks",
      "Operational Excellence — tech & process optimization",
      "Human Capital — culture, leadership & talent",
      "Supply Chain Sustainability — resilience & ethics",
    ],
  },
  {
    id:"insight", icon:"💡", label:"04", title:"Expected Insight",
    color:"#7b2d8b", lightColor:"rgba(123,45,139,0.07)", borderColor:"rgba(123,45,139,0.2)",
    points:[
      "Common patterns in modern FMCG management",
      "How digital, sustainability & culture drive competitive advantage",
    ],
  },
];

function Slide2({ active }) {
  const [phase, setPhase] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(()=>setPhase(1), 100),
      setTimeout(()=>setPhase(2), 480),
      setTimeout(()=>setPhase(3), 820),
      setTimeout(()=>setPhase(4), 1100),
    ];
    return ()=>t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{ width:"100%", height:"100%", background:"#f5f3ef", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      <Orb style={{ width:520, height:520, background:"rgba(45,125,70,0.06)",  top:-150, left:-130, animation:"rotateSlow 45s linear infinite" }}/>
      <Orb style={{ width:400, height:400, background:"rgba(180,100,30,0.07)", bottom:-90, right:-90, animation:"rotateSlowR 32s linear infinite" }}/>
      <Orb style={{ width:260, height:260, background:"rgba(0,119,182,0.05)",  top:"35%", left:"48%" }}/>
      <Orb style={{ width:220, height:220, background:"rgba(123,45,139,0.05)", bottom:"20%", left:"22%" }}/>
      <DotGrid visible={phase>=4}/>

      {/* Header */}
      <div style={{ padding:"28px 72px 0", display:"flex", alignItems:"flex-end", justifyContent:"space-between", position:"relative", zIndex:2, opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-22px)", transition:"all 0.7s cubic-bezier(.23,1,.32,1)" }}>
        <div>
          <SlideEyebrow text="Slide 02 · Project Overview" visible={phase>=1}/>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900, letterSpacing:-1.2, color:"#1a1a1a", lineHeight:1.1 }}>
            Study <ShimmerText>Framework</ShimmerText> & Context
          </h1>
        </div>
        {/* Company pills */}
        <div style={{ display:"flex", gap:10, paddingBottom:6 }}>
          {[{name:"Dabur",color:"#2d7d46"},{name:"Marico",color:"#0077b6"},{name:"Reckitt",color:"#c1121f"},{name:"Nestlé",color:"#1b3a4b"}].map(c=>(
            <div key={c.name} style={{ padding:"7px 16px", background:"#fff", border:`2px solid ${c.color}44`, borderRadius:24, fontFamily:"'DM Sans',sans-serif", fontSize:18.5, fontWeight:700, color:c.color, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>{c.name}</div>
          ))}
        </div>
      </div>

      <HeaderRule visible={phase>=2}/>

      {/* 2×2 Grid */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:18, padding:"18px 72px 26px", position:"relative", zIndex:2 }}>
        {QUADRANTS.map((q,i)=>(
          <div key={q.id} className="quad-card"
            onMouseEnter={()=>setHovered(q.id)}
            onMouseLeave={()=>setHovered(null)}
            style={{
              background:hovered===q.id?"#fff":q.lightColor,
              border:`2px solid ${hovered===q.id?q.color+"77":q.borderColor}`,
              borderRadius:18, padding:"24px 28px",
              boxShadow:hovered===q.id?`0 24px 56px rgba(0,0,0,0.12),0 0 0 1px ${q.color}22`:"0 4px 18px rgba(0,0,0,0.06)",
              cursor:"default",
              opacity:phase>=3?1:0,
              animation:phase>=3?`fadeScaleIn 0.65s cubic-bezier(.23,1,.32,1) ${i*0.12}s both`:"none",
              display:"flex", flexDirection:"column", gap:14,
              position:"relative", overflow:"hidden",
            }}
          >
            {/* Watermark number */}
            <div style={{ position:"absolute", bottom:-12, right:10, fontFamily:"'Playfair Display',serif", fontSize:110, fontWeight:900, color:q.color, opacity:0.04, lineHeight:1, pointerEvents:"none", userSelect:"none" }}>{q.label}</div>

            {/* Icon + title row */}
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:13, flexShrink:0, background:`${q.color}18`, border:`2px solid ${q.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:23.5, animation:hovered===q.id?"iconBounce 0.6s ease":"none" }}>{q.icon}</div>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4, textTransform:"uppercase", color:q.color, fontWeight:700, marginBottom:3 }}>{q.label} ·</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:23.5, fontWeight:700, color:"#1a1a1a" }}>{q.title}</div>
              </div>
            </div>

            {/* Accent line */}
            <div style={{ height:2, borderRadius:2, background:`linear-gradient(to right,${q.color}77,transparent)` }}/>

            {/* Points */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {q.points.map((pt,j)=>(
                <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:q.color, marginTop:7, flexShrink:0, opacity:0.85 }}/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, lineHeight:1.55, color:"#4a3f38", fontWeight:400 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <FooterRule visible={phase>=4}/>
      <CornerBrackets visible={phase>=4}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 3 — COMPANY INTRODUCTIONS
═══════════════════════════════════════════════════════════════════════════ */
const COMPANIES_DATA = [
  {
    id:"dabur",
    name:"Dabur",
    tagline:"The Heritage Modernizer",
    desc:"Ayurvedic roots. Global brands. INR 12,000+ Cr revenue.",
    icon:"🌿",
    color:"#2d7d46",
    lightBg:"rgba(45,125,70,0.07)",
    borderColor:"rgba(45,125,70,0.25)",
    stats:[{ val:"INR 12K Cr", label:"Revenue" },{ val:"250+", label:"Products" },{ val:"120+", label:"Countries" }],
    keyword:"Ayurveda & Heritage",
  },
  {
    id:"marico",
    name:"Marico",
    tagline:"The Agile Challenger",
    desc:"Digital-first challenger scaling via the 4D Framework.",
    icon:"📱",
    color:"#0077b6",
    lightBg:"rgba(0,119,182,0.07)",
    borderColor:"rgba(0,119,182,0.22)",
    stats:[{ val:"4D", label:"Framework" },{ val:"82", label:"Inclusion Index" },{ val:"25+", label:"Brands" }],
    keyword:"Innovation & Digital",
  },
  {
    id:"reckitt",
    name:"Reckitt",
    tagline:"The Purpose-Led Giant",
    desc:"Hygiene & health leader guided by purpose-driven strategy.",
    icon:"🛡️",
    color:"#c1121f",
    lightBg:"rgba(193,18,31,0.06)",
    borderColor:"rgba(193,18,31,0.2)",
    stats:[{ val:"60+", label:"Countries" },{ val:"200 bps", label:"Cost Target" },{ val:"Net Zero", label:"By 2040" }],
    keyword:"Hygiene & Health",
  },
  {
    id:"nestle",
    name:"Nestlé",
    tagline:"The Global Standard",
    desc:"World's largest F&B company. 185+ countries. Creating Shared Value.",
    icon:"🌍",
    color:"#1b3a4b",
    lightBg:"rgba(27,58,75,0.07)",
    borderColor:"rgba(27,58,75,0.2)",
    stats:[{ val:"185+", label:"Countries" },{ val:"2,000+", label:"Brands" },{ val:"CSV", label:"Strategy" }],
    keyword:"Scale & Sustainability",
  },
];

function Slide3({ active }) {
  const [phase, setPhase] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(()=>{
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(()=>setPhase(1), 120),
      setTimeout(()=>setPhase(2), 500),
      setTimeout(()=>setPhase(3), 800),
      setTimeout(()=>setPhase(4), 1100),
      setTimeout(()=>setPhase(5), 1400),
    ];
    return ()=>t.forEach(clearTimeout);
  },[active]);

  return (
    <div style={{ width:"100%", height:"100%", background:"#f5f3ef", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      {/* Ambient orbs */}
      <Orb style={{ width:600, height:600, background:"rgba(45,125,70,0.06)",  top:-200, left:-150, animation:"rotateSlow 50s linear infinite" }}/>
      <Orb style={{ width:500, height:500, background:"rgba(0,119,182,0.06)", bottom:-150, right:-150, animation:"rotateSlowR 38s linear infinite" }}/>
      <Orb style={{ width:350, height:350, background:"rgba(193,18,31,0.05)", top:"40%", left:"38%" }}/>
      <DotGrid visible={phase>=5} color="#1b3a4b" cols={8} rows={4}/>

      {/* ── HEADER ── */}
      <div style={{
        padding:"30px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-22px)",
        transition:"all 0.7s cubic-bezier(.23,1,.32,1)",
      }}>
        <SlideEyebrow text="Slide 03 · Company Introductions" visible={phase>=1}/>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:46, fontWeight:900, letterSpacing:-1.5, color:"#1a1a1a", lineHeight:1.1 }}>
            The Four <ShimmerText>Titans</ShimmerText> of FMCG
          </h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5, color:"#8a7a6e", fontWeight:300, maxWidth:320, textAlign:"right", lineHeight:1.5, paddingBottom:4 }}>
            Bridging heritage &amp; future readiness across discontinuous geographies
          </p>
        </div>
      </div>

      <HeaderRule visible={phase>=2}/>

      {/* ── FOUR COMPANY CARDS ── */}
      <div style={{
        flex:1, display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:14, padding:"14px 72px 18px", position:"relative", zIndex:2,
      }}>
        {COMPANIES_DATA.map((c,i)=>{
          const isHov = hovered===c.id;
          return (
            <div key={c.id} className="company-card"
              onMouseEnter={()=>setHovered(c.id)}
              onMouseLeave={()=>setHovered(null)}
              style={{
                background: isHov ? "#fff" : c.lightBg,
                border:`2px solid ${isHov ? c.color+"88" : c.borderColor}`,
                borderRadius:20,
                boxShadow: isHov
                  ? `0 28px 64px rgba(0,0,0,0.14), 0 0 0 1px ${c.color}22`
                  : "0 4px 20px rgba(0,0,0,0.06)",
                display:"flex", flexDirection:"column",
                position:"relative", overflow:"hidden",
                opacity: phase>=3 ? 1 : 0,
                animation: phase>=3 ? `scaleIn 0.6s cubic-bezier(.23,1,.32,1) ${i*0.13}s both` : "none",
                cursor:"default",
              }}
            >
              {/* Top colour band */}
              <div style={{ height:5, background:`linear-gradient(to right,${c.color},${c.color}88)`, borderRadius:"20px 20px 0 0",
                overflow:"hidden", position:"relative" }}>
                {phase>=3 && (
                  <div style={{ position:"absolute", inset:0, background:`linear-gradient(to right,${c.color},${c.color}88)`,
                    animation:`barGrow 0.8s cubic-bezier(.23,1,.32,1) ${i*0.13+0.2}s both` }}/>
                )}
              </div>

              {/* Card body */}
              <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"18px 18px 14px" }}>

                {/* Icon circle */}
                <div style={{
                  width:52, height:52, borderRadius:14, marginBottom:12,
                  background:`${c.color}15`, border:`2px solid ${c.color}33`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:25.5,
                  animation: isHov ? "floatCard 2s ease-in-out infinite" : "none",
                }}>{c.icon}</div>

                {/* Company name */}
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:4, textTransform:"uppercase", color:c.color, fontWeight:700, marginBottom:3 }}>
                  {c.keyword}
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:27.5, fontWeight:900, color:"#1a1a1a", lineHeight:1, marginBottom:3, letterSpacing:-0.5 }}>
                  {c.name}
                </h2>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5, color:c.color, fontWeight:600, marginBottom:10, letterSpacing:0.3 }}>
                  {c.tagline}
                </div>

                {/* Thin accent rule */}
                <div style={{ height:1.5, background:`linear-gradient(to right,${c.color}66,transparent)`, marginBottom:10, borderRadius:2 }}/>

                {/* Description */}
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5, lineHeight:1.55, color:"#5a4f48", fontWeight:300, flex:1, marginBottom:12 }}>
                  {c.desc}
                </p>

                {/* Stats row */}
                <div style={{ display:"flex", gap:6 }}>
                  {c.stats.map((s,j)=>(
                    <div key={j} style={{
                      flex:1, textAlign:"center", padding:"7px 4px",
                      background:`${c.color}0f`,
                      border:`1px solid ${c.color}22`, borderRadius:9,
                      opacity: phase>=4 ? 1 : 0,
                      transition:`opacity 0.5s ease ${0.3+i*0.1+j*0.06}s`,
                    }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18.5, fontWeight:900, color:c.color, lineHeight:1.1 }}>{s.val}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:"#9e8e82", letterSpacing:1, marginTop:2, textTransform:"uppercase" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom glow on hover */}
              {isHov && (
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(to right,transparent,${c.color},transparent)`, borderRadius:"0 0 20px 20px" }}/>
              )}
            </div>
          );
        })}
      </div>

      <FooterRule visible={phase>=5}/>
      <CornerBrackets visible={phase>=5}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 4 — NESTLÉ MANAGEMENT FRAMEWORKS
═══════════════════════════════════════════════════════════════════════════ */
const NESTLE_NAVY   = "#1b3a4b";
const NESTLE_TEAL   = "#2a7f7f";
const NESTLE_GOLD   = "#c9a84c";
const NESTLE_LIGHT  = "#e8f4f8";

const NESTLE_PILLARS = [
  {
    id:"strategic",
    icon:"🏛️",
    label:"Strategic Architecture",
    color: NESTLE_NAVY,
    accent: NESTLE_GOLD,
    bg:"rgba(27,58,75,0.08)",
    border:"rgba(27,58,75,0.22)",
    points:[
      { heading:"Creating Shared Value (CSV)", body:"Societal needs define business strategy — not philanthropy." },
      { heading:"Nutrition, Health & Wellness", body:"All brands aligned to consumer wellbeing." },
    ],
  },
  {
    id:"operational",
    icon:"⚙️",
    label:"Operational Excellence",
    color: NESTLE_TEAL,
    accent: "#4fb8b8",
    bg:"rgba(42,127,127,0.07)",
    border:"rgba(42,127,127,0.22)",
    points:[
      { heading:"SAP S/4HANA Digital Core", body:"Global AI-powered ERP with Joule copilots for real-time insights." },
      { heading:"AI-Based Digital Twins", body:"Virtual factory simulations eliminate wasteful capex decisions." },
    ],
  },
  {
    id:"human",
    icon:"🌍",
    label:"Human Capital",
    color:"#2e6b3e",
    accent:"#5cb87a",
    bg:"rgba(46,107,62,0.07)",
    border:"rgba(46,107,62,0.22)",
    points:[
      { heading:"Gender Balance Acceleration", body:"Structured push for women in senior & board-level roles." },
      { heading:"Global Youth Initiative", body:"10M young people reached via apprenticeships & empowerment." },
    ],
  },
  {
    id:"supply",
    icon:"🌱",
    label:"Supply Chain Sustainability",
    color:"#7b4e1e",
    accent:"#c9843a",
    bg:"rgba(123,78,30,0.07)",
    border:"rgba(123,78,30,0.22)",
    points:[
      { heading:"Regenerative Agriculture", body:"Satellite tech ensures 100% no-deforestation compliance." },
      { heading:"50% Regenerative by 2030", body:"Half of key ingredients from nature-positive farms by 2030." },
    ],
  },
];

function Slide4({ active }) {
  const [phase, setPhase] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(()=>{
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(()=>setPhase(1), 100),
      setTimeout(()=>setPhase(2), 450),
      setTimeout(()=>setPhase(3), 750),
      setTimeout(()=>setPhase(4), 1000),
      setTimeout(()=>setPhase(5), 1300),
    ];
    return ()=>t.forEach(clearTimeout);
  },[active]);

  return (
    <div style={{
      width:"100%", height:"100%",
      background:`linear-gradient(145deg, #0d2233 0%, #1b3a4b 45%, #0f2a38 100%)`,
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
      fontFamily:"'Georgia',serif",
    }}>
      {/* Nestlé-themed deep navy orbs */}
      <Orb style={{ width:700, height:700, background:"rgba(201,168,76,0.06)",  top:-250, left:-200, animation:"rotateSlow 55s linear infinite" }}/>
      <Orb style={{ width:500, height:500, background:"rgba(42,127,127,0.08)", bottom:-180, right:-180, animation:"rotateSlowR 40s linear infinite" }}/>
      <Orb style={{ width:300, height:300, background:"rgba(255,255,255,0.03)", top:"45%", left:"40%" }}/>

      {/* Subtle grid texture */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize:"40px 40px",
      }}/>

      {/* Nestlé brand stripe top */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:4, zIndex:10,
        background:`linear-gradient(to right, ${NESTLE_GOLD}, #e8c96c, ${NESTLE_TEAL}, ${NESTLE_GOLD})`,
        backgroundSize:"400% auto",
        animation:"shimmer 5s linear infinite",
        opacity: phase>=1 ? 1 : 0, transition:"opacity 0.8s ease",
      }}/>

      {/* ── HEADER ── */}
      <div style={{
        padding:"32px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-24px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)",
      }}>
        {/* Eyebrow */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ width:3, height:28, borderRadius:2, background:`linear-gradient(to bottom,${NESTLE_GOLD},rgba(201,168,76,0.2))` }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:5, color:NESTLE_GOLD, textTransform:"uppercase", fontWeight:600 }}>
            Slide 04 · Nestlé · Management Frameworks
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            {/* Nestlé badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 16px", background:"rgba(201,168,76,0.12)", border:`1px solid ${NESTLE_GOLD}44`, borderRadius:24, marginBottom:12 }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:700, color:NESTLE_GOLD, letterSpacing:2 }}>NESTLÉ S.A.</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:"rgba(201,168,76,0.6)", letterSpacing:1 }}>The Global Standard</span>
            </div>
            <h1 style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:46, fontWeight:900, letterSpacing:-1.5, lineHeight:1.08,
              color:"#fff",
            }}>
              Management{" "}
              <span style={{
                backgroundImage:`linear-gradient(90deg,${NESTLE_GOLD} 0%,#f0de8a 40%,${NESTLE_TEAL} 80%,${NESTLE_GOLD} 100%)`,
                backgroundSize:"600px auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                animation:"shimmer 5s linear infinite", display:"inline-block",
              }}>Frameworks</span>
            </h1>
          </div>

          {/* 4 pillar icons summary */}
          <div style={{ display:"flex", gap:10, paddingBottom:4, opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            {NESTLE_PILLARS.map(p=>(
              <div key={p.id} style={{ width:44, height:44, borderRadius:12, background:`${p.color}33`, border:`1.5px solid ${p.color}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:21.5 }}>{p.icon}</div>
            ))}
          </div>
        </div>
      </div>


      {/* ── TOP-RIGHT COMPANY LOGO ── */}
      <div style={{
        position:"absolute", top:24, right:28, zIndex:20,
        opacity:phase>=1?1:0, transition:"opacity 0.8s ease 0.2s",
      }}>
        <div style={{
          background:"rgba(255,255,255,0.94)",
          borderRadius:12, padding:"8px 18px",
          boxShadow:`0 4px 24px ${NESTLE_GOLD}33, 0 1px 6px rgba(0,0,0,0.18)`,
          border:`1.5px solid ${NESTLE_GOLD}44`,
          display:"flex", alignItems:"center", justifyContent:"center",
          minWidth:160, height:68,
        }}>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJP3CUB-TxSeysL1z-Ux5t5GZSnQSj1QRFmA&s" alt="logo"
            style={{ width:160, height:68, objectFit:"contain" }}/>
        </div>
      </div>

      {/* Animated divider — gold */}
      <div style={{ margin:"16px 72px 0", height:2, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden", position:"relative", zIndex:2, opacity:phase>=2?1:0, transition:"opacity 0.4s ease" }}>
        {phase>=2 && <div style={{ position:"absolute", inset:0, background:`linear-gradient(to right,${NESTLE_GOLD},${NESTLE_TEAL} 60%,${NESTLE_GOLD})`, transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
      </div>

      {/* ── 4 PILLARS GRID ── */}
      <div style={{
        flex:1, display:"grid",
        gridTemplateColumns:"repeat(4,1fr)",
        gap:16, padding:"16px 72px 24px",
        position:"relative", zIndex:2,
      }}>
        {NESTLE_PILLARS.map((p,i)=>{
          const isHov = hovered===p.id;
          return (
            <div key={p.id} className="company-card"
              onMouseEnter={()=>setHovered(p.id)}
              onMouseLeave={()=>setHovered(null)}
              style={{
                background: isHov
                  ? `linear-gradient(160deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))`
                  : `linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))`,
                border:`1.5px solid ${isHov ? p.accent+"99" : "rgba(255,255,255,0.1)"}`,
                borderRadius:18,
                boxShadow: isHov
                  ? `0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px ${p.accent}33, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : "0 6px 24px rgba(0,0,0,0.25)",
                backdropFilter:"blur(12px)",
                display:"flex", flexDirection:"column",
                position:"relative", overflow:"hidden",
                cursor:"default",
                opacity:phase>=3?1:0,
                animation:phase>=3?`scaleIn 0.65s cubic-bezier(.23,1,.32,1) ${i*0.13}s both`:"none",
              }}
            >
              {/* Top accent bar */}
              <div style={{ height:4, background:`linear-gradient(to right,${p.accent},${p.accent}44)`, overflow:"hidden", position:"relative", borderRadius:"18px 18px 0 0" }}>
                {phase>=3 && <div style={{ position:"absolute", inset:0, background:`linear-gradient(to right,${p.accent},${p.accent}88)`, animation:`barGrow 0.8s cubic-bezier(.23,1,.32,1) ${i*0.13+0.2}s both` }}/>}
              </div>

              {/* Body */}
              <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"20px 20px 16px" }}>

                {/* Pillar icon */}
                <div style={{
                  width:56, height:56, borderRadius:14, marginBottom:14,
                  background:`${p.color}44`, border:`1.5px solid ${p.accent}55`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:23.5,
                  animation: isHov ? "floatCard 2.2s ease-in-out infinite" : "none",
                  boxShadow: isHov ? `0 8px 24px ${p.accent}44` : "none",
                  transition:"box-shadow 0.3s ease",
                }}>{p.icon}</div>

                {/* Pillar number + label */}
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:4, textTransform:"uppercase", color:p.accent, fontWeight:700, marginBottom:4 }}>
                  {String(i+1).padStart(2,"0")} ·
                </div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:19.5, fontWeight:700, color:"#fff", lineHeight:1.2, marginBottom:14, letterSpacing:-0.3 }}>
                  {p.label}
                </h3>

                {/* Divider */}
                <div style={{ height:1, background:`linear-gradient(to right,${p.accent}55,transparent)`, marginBottom:14, borderRadius:1 }}/>

                {/* Points */}
                <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1 }}>
                  {p.points.map((pt,j)=>(
                    <div key={j} style={{
                      padding:"12px 14px",
                      background: isHov ? `rgba(255,255,255,0.06)` : `rgba(255,255,255,0.03)`,
                      border:`1px solid rgba(255,255,255,0.07)`,
                      borderRadius:10,
                      opacity:phase>=4?1:0,
                      transform:phase>=4?"translateY(0)":"translateY(12px)",
                      transition:`all 0.5s ease ${0.3+i*0.1+j*0.1}s`,
                    }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700, color:p.accent, marginBottom:5, lineHeight:1.2 }}>{pt.heading}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5, lineHeight:1.55, color:"rgba(255,255,255,0.6)", fontWeight:300 }}>{pt.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover bottom glow */}
              {isHov && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(to right,transparent,${p.accent},transparent)` }}/>}

              {/* Corner number watermark */}
              <div style={{ position:"absolute", bottom:-8, right:8, fontFamily:"'Playfair Display',serif", fontSize:100, fontWeight:900, color:"rgba(255,255,255,0.025)", lineHeight:1, pointerEvents:"none", userSelect:"none" }}>{String(i+1).padStart(2,"0")}</div>
            </div>
          );
        })}
      </div>

      {/* Footer — dark themed */}
      <div style={{
        padding:"0 72px 18px", display:"flex", alignItems:"center", gap:12, zIndex:2,
        opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.3s",
      }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:12.5, color:"rgba(201,168,76,0.5)", letterSpacing:3, textTransform:"uppercase" }}>
          Nestlé S.A. · Strategic Convergence · Global FMCG Sector
        </span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
      </div>

      {/* Corner brackets — gold */}
      {[
        { top:18, left:18,   borderTop:`2px solid ${NESTLE_GOLD}55`, borderLeft:`2px solid ${NESTLE_GOLD}55` },
        { top:18, right:18,  borderTop:`2px solid ${NESTLE_GOLD}55`, borderRight:`2px solid ${NESTLE_GOLD}55` },
        { bottom:18, left:18,  borderBottom:`2px solid ${NESTLE_GOLD}55`, borderLeft:`2px solid ${NESTLE_GOLD}55` },
        { bottom:18, right:18, borderBottom:`2px solid ${NESTLE_GOLD}55`, borderRight:`2px solid ${NESTLE_GOLD}55` },
      ].map((s,i)=>(
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20, opacity:phase>=5?0.8:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 5 — NESTLÉ CASE STUDY: NESPRESSO AAA PROGRAM
═══════════════════════════════════════════════════════════════════════════ */
const AAA_STEPS = [
  {
    phase: "Objective",
    icon: "🎯",
    color: NESTLE_GOLD,
    title: "Sustainable Coffee Sourcing",
    body: "Secure quality coffee supply while protecting farming communities.",
    tag: "Core Mission",
  },
  {
    phase: "Key Actions",
    icon: "⚡",
    color: NESTLE_TEAL,
    title: "Farmer Empowerment",
    body: "Quality-linked incentives + agronomist support for farmers.",
    tag: "On-Ground Execution",
  },
  {
    phase: "Key Actions",
    icon: "🌱",
    color: "#3a9a5c",
    title: "Regenerative Support",
    body: "Soil health & water coaching — farms become net-positive.Planting millions of trees to create microclimates to protect coffee bushes from natural climate changes",
    tag: "Technical Support",
  },
];

const AAA_IMPACT = [
  { value: "150,000+", label: "Farmers Enrolled", icon: "👩‍🌾", color: NESTLE_GOLD },
  { value: "94%",      label: "Coffee via Program", icon: "☕", color: NESTLE_TEAL },
  { value: "30–40%",   label: "Income Premium", icon: "📈", color: "#3a9a5c" },
  
];

function Slide5({ active }) {
  const [phase, setPhase] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [impactHov, setImpactHov] = useState(null);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 450),
      setTimeout(() => setPhase(3), 750),
      setTimeout(() => setPhase(4), 1050),
      setTimeout(() => setPhase(5), 1350),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(145deg, #0a1c2b 0%, #112233 55%, #0d2035 100%)",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient orbs */}
      <Orb style={{ width:650, height:650, background:"rgba(201,168,76,0.07)",  top:-220, right:-180, animation:"rotateSlow 60s linear infinite" }}/>
      <Orb style={{ width:450, height:450, background:"rgba(42,127,127,0.09)",  bottom:-160, left:-160, animation:"rotateSlowR 44s linear infinite" }}/>
      <Orb style={{ width:280, height:280, background:"rgba(58,154,92,0.06)",   top:"50%", left:"42%" }}/>

      {/* Dot grid texture */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize:"36px 36px" }}/>

      
      {/* ── TOP-RIGHT COMPANY LOGO ── */}
     

      {/* Gold top stripe */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, zIndex:10, background:`linear-gradient(to right,${NESTLE_TEAL},${NESTLE_GOLD},#3a9a5c,${NESTLE_GOLD})`, backgroundSize:"400% auto", animation:"shimmer 5s linear infinite", opacity:phase>=1?1:0, transition:"opacity 0.8s ease" }}/>

      {/* ── HEADER ── */}
      <div style={{
        padding: "32px 72px 0", position: "relative", zIndex: 2,
        opacity: phase>=1?1:0, transform: phase>=1?"translateY(0)":"translateY(-24px)",
        transition: "all 0.8s cubic-bezier(.23,1,.32,1)",
      }}>
        {/* Eyebrow */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ width:3, height:28, borderRadius:2, background:`linear-gradient(to bottom,${NESTLE_GOLD},rgba(201,168,76,0.15))` }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, letterSpacing:5, color:NESTLE_GOLD, textTransform:"uppercase", fontWeight:600 }}>
            Slide 05 · Nestlé · Case Study
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            {/* Programme badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 18px", background:"rgba(201,168,76,0.1)", border:`1px solid ${NESTLE_GOLD}44`, borderRadius:24, marginBottom:12 }}>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700, color:NESTLE_GOLD, letterSpacing:2 }}>NESPRESSO AAA PROGRAM</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900, letterSpacing:-1.5, lineHeight:1.08, color:"#fff" }}>
              Sustainable{" "}
              <span style={{ backgroundImage:`linear-gradient(90deg,${NESTLE_GOLD} 0%,#f0de8a 40%,${NESTLE_TEAL} 80%,${NESTLE_GOLD} 100%)`, backgroundSize:"600px auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 5s linear infinite", display:"inline-block" }}>Quality</span>
              {" "}Programme
            </h1>
          </div>

          {/* Live impact counter pill */}
          <div style={{ display:"flex", gap:10, paddingBottom:4, opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            {AAA_IMPACT.slice(0,2).map((stat,i) => (
              <div key={i} style={{ padding:"8px 18px", background:"rgba(255,255,255,0.05)", border:`1px solid ${stat.color}44`, borderRadius:14, textAlign:"center" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:27.5, fontWeight:900, color:stat.color }}>{stat.value}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:"rgba(255,255,255,0.45)", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div style={{ margin:"14px 72px 0", height:2, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden", position:"relative", zIndex:2, opacity:phase>=2?1:0, transition:"opacity 0.4s ease" }}>
        {phase>=2 && <div style={{ position:"absolute", inset:0, background:`linear-gradient(to right,${NESTLE_GOLD},${NESTLE_TEAL} 60%,${NESTLE_GOLD})`, transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, padding:"16px 72px 0", position:"relative", zIndex:2 }}>

        {/* LEFT — Journey cards (vertical flow) */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:2, opacity:phase>=2?1:0, transition:"opacity 0.5s ease" }}>
            Programme Journey
          </div>

          {AAA_STEPS.map((s, i) => {
            const isHov = hovered===i;
            return (
              <div key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display:"flex", gap:16, alignItems:"flex-start",
                  padding:"18px 20px",
                  background: isHov ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
                  border:`1.5px solid ${isHov ? s.color+"88" : "rgba(255,255,255,0.08)"}`,
                  borderRadius:14,
                  boxShadow: isHov ? `0 12px 36px rgba(0,0,0,0.3), 0 0 0 1px ${s.color}22` : "none",
                  backdropFilter:"blur(10px)",
                  cursor:"default",
                  opacity:phase>=3?1:0,
                  transform:phase>=3?"translateX(0)":"translateX(-30px)",
                  transition:`all 0.55s cubic-bezier(.23,1,.32,1) ${i*0.13}s, box-shadow 0.35s ease, border-color 0.35s ease`,
                }}
              >
                {/* Step icon */}
                <div style={{ width:50, height:50, borderRadius:13, flexShrink:0, background:`${s.color}22`, border:`1.5px solid ${s.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:25.5, animation: isHov ? "floatCard 2s ease-in-out infinite":"none" }}>{s.icon}</div>

                <div style={{ flex:1 }}>
                  {/* Phase + tag */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:3, textTransform:"uppercase", color:s.color, fontWeight:700 }}>{s.phase}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.06)", padding:"2px 8px", borderRadius:20, letterSpacing:1 }}>{s.tag}</span>
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21.5, fontWeight:700, color:"#fff", marginBottom:6, lineHeight:1.2 }}>{s.title}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, lineHeight:1.6, color:"rgba(255,255,255,0.55)", fontWeight:300 }}>{s.body}</div>
                </div>

                {/* Hover right accent */}
                {isHov && <div style={{ width:3, borderRadius:2, background:`linear-gradient(to bottom,${s.color},transparent)`, alignSelf:"stretch", flexShrink:0 }}/>}
              </div>
            );
          })}
        </div>

        {/* RIGHT — Impact dashboard */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:2, opacity:phase>=2?1:0, transition:"opacity 0.5s ease 0.1s" }}>
            Measurable Impact
          </div>

          {/* 2×2 impact stat grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {AAA_IMPACT.map((stat, i) => {
              const isH = impactHov===i;
              return (
                <div key={i}
                  onMouseEnter={() => setImpactHov(i)}
                  onMouseLeave={() => setImpactHov(null)}
                  style={{
                    padding:"22px 18px", borderRadius:16, textAlign:"center",
                    background: isH ? `linear-gradient(145deg,${stat.color}22,${stat.color}0a)` : "rgba(255,255,255,0.04)",
                    border:`1.5px solid ${isH ? stat.color+"88" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isH ? `0 16px 40px rgba(0,0,0,0.3),0 0 0 1px ${stat.color}22` : "none",
                    backdropFilter:"blur(8px)",
                    cursor:"default",
                    opacity:phase>=4?1:0,
                    transform:phase>=4?"scale(1) translateY(0)":"scale(0.85) translateY(20px)",
                    transition:`all 0.6s cubic-bezier(.23,1,.32,1) ${0.1+i*0.1}s, box-shadow 0.35s ease`,
                    animation: isH ? "floatCard 2.4s ease-in-out infinite" : "none",
                  }}
                >
                  <div style={{ fontSize:27.5, marginBottom:6 }}>{stat.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:27.5, fontWeight:900, color:stat.color, lineHeight:1, marginBottom:6 }}>{stat.value}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"rgba(255,255,255,0.45)", letterSpacing:2, textTransform:"uppercase", lineHeight:1.4 }}>{stat.label}</div>

                  {/* Glowing bottom line */}
                  <div style={{ marginTop:12, height:2, borderRadius:2, background:`linear-gradient(to right,transparent,${stat.color},transparent)`, opacity:isH?1:0.3, transition:"opacity 0.3s ease" }}/>
                </div>
              );
            })}
          </div>

          {/* Quote callout */}
          <div style={{
            flex:1, padding:"20px 22px", borderRadius:14,
            background:"rgba(201,168,76,0.07)",
            border:`1px solid ${NESTLE_GOLD}33`,
            backdropFilter:"blur(10px)",
            display:"flex", flexDirection:"column", justifyContent:"center",
            opacity:phase>=5?1:0,
            transform:phase>=5?"translateY(0)":"translateY(18px)",
            transition:"all 0.7s cubic-bezier(.23,1,.32,1) 0.2s",
          }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:27.5, color:NESTLE_GOLD, opacity:0.4, lineHeight:1, marginBottom:6 }}>"</div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18.5, fontStyle:"italic", color:"rgba(255,255,255,0.75)", lineHeight:1.7, marginBottom:10 }}>
              The AAA Program demonstrates that when you invest in farmers, you invest in the future of coffee — and in the business itself.
            </p>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, color:NESTLE_GOLD, letterSpacing:2, textTransform:"uppercase", fontWeight:600 }}>
              Nespresso Sustainability Report
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"12px 72px 16px", display:"flex", alignItems:"center", gap:12, zIndex:2, opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.3s" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:13.5, color:"rgba(201,168,76,0.45)", letterSpacing:3, textTransform:"uppercase" }}>
          Nestlé S.A. · Nespresso AAA · Strategic Convergence
        </span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
      </div>

      {/* Gold corner brackets */}
      {[
        { top:18, left:18,   borderTop:`2px solid ${NESTLE_GOLD}55`, borderLeft:`2px solid ${NESTLE_GOLD}55` },
        { top:18, right:18,  borderTop:`2px solid ${NESTLE_GOLD}55`, borderRight:`2px solid ${NESTLE_GOLD}55` },
        { bottom:18, left:18,  borderBottom:`2px solid ${NESTLE_GOLD}55`, borderLeft:`2px solid ${NESTLE_GOLD}55` },
        { bottom:18, right:18, borderBottom:`2px solid ${NESTLE_GOLD}55`, borderRight:`2px solid ${NESTLE_GOLD}55` },
      ].map((s,i) => (
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20, opacity:phase>=5?0.8:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 6 — MARICO MANAGEMENT FRAMEWORKS
═══════════════════════════════════════════════════════════════════════════ */
const MARICO_RED    = "#d0021b";
const MARICO_DARK   = "#1a0305";
const MARICO_CRIMSON= "#8b0000";
const MARICO_ROSE   = "#ff6b6b";
const MARICO_CANVAS = "#1a0408";

const MARICO_PILLARS = [
  {
    id:"strategic", icon:"🧭", label:"01", title:"Strategic Architecture",
    color:MARICO_RED, accent:"#ff4d5e", bg:"rgba(208,2,27,0.1)", border:"rgba(208,2,27,0.25)",
    points:[
      { tag:"4D Framework", body:"Four growth axes running simultaneously." },
    ],
  },
  {
    id:"operational", icon:"⚙️", label:"02", title:"Operational Excellence",
    color:"#e05c00", accent:"#ff8c42", bg:"rgba(224,92,0,0.1)", border:"rgba(224,92,0,0.22)",
    points:[
      { tag:"Industry 4.0", body:"IoT-enabled lines for real-time quality control." },
      { tag:"Sprinklr CXM", body:"AI social listening: 48h → <60 min response." },
    ],
  },
  {
    id:"human", icon:"🌟", label:"03", title:"Human Capital",
    color:"#9b59b6", accent:"#c39bd3", bg:"rgba(155,89,182,0.09)", border:"rgba(155,89,182,0.22)",
    points:[
      { tag:"Talent Value Prop", body:"Go Beyond · Grow Beyond · Be the Impact." },
      { tag:"Inclusion Index", body:"82/100 — real-time engagement & belonging score." },
    ],
  },
  {
    id:"supply", icon:"🌱", label:"04", title:"Supply Chain Sustainability",
    color:"#27ae60", accent:"#58d68d", bg:"rgba(39,174,96,0.09)", border:"rgba(39,174,96,0.22)",
    points:[
      { tag:"Sustainability 2.0", body:"Circular economy across all Tier-1 suppliers.It is focused on Water Stewardship " },
      { tag:"Water Stewardship", body:"It has created water savings potential of 3.73 billion litres·" },
    ],
  },
];

function Slide6({ active }) {
  const [phase, setPhase] = useState(0);
  const [hov, setHov] = useState(null);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 440),
      setTimeout(() => setPhase(3), 740),
      setTimeout(() => setPhase(4), 1000),
      setTimeout(() => setPhase(5), 1280),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width:"100%", height:"100%",
      background:"linear-gradient(150deg,#1a0305 0%,#2d0610 50%,#150205 100%)",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      {/* Orbs */}
<Orb style={{ width:700, height:700, background:"rgba(208,2,27,0.08)", top:-260, left:-200, animation:"rotateSlow 52s linear infinite" }}/>
<Orb style={{ width:500, height:500, background:"rgba(155,89,182,0.07)", bottom:-180, right:-180, animation:"rotateSlowR 38s linear infinite" }}/>
<Orb style={{ width:300, height:300, background:"rgba(39,174,96,0.05)", top:"45%", left:"40%" }}/>

{/* Grid texture */}
<div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize:"38px 38px" }}/>

{/* Marico red top stripe - FIXED CLOSING TAGS HERE */}
<div style={{ 
  position:"absolute", top:0, left:0, right:0, height:5, zIndex:10,
  background:`linear-gradient(to right,${MARICO_RED},#ff6b6b,#e05c00,${MARICO_RED})`,
  backgroundSize:"400% auto", animation:"shimmer 4s linear infinite",
  opacity:phase>=1?1:0, transition:"opacity 0.8s ease" 
}}/>

{/* ── TOP-RIGHT COMPANY LOGO ── */}
<div style={{
  position:"absolute", top:22, right:26, zIndex:20,
  opacity:phase>=1?1:0, transition:"opacity 0.8s ease 0.2s",
}}>
  <div style={{
    background:"rgba(255,255,255,0.95)", borderRadius:12,
    padding:"10px 24px", height:70,
    display:"flex", alignItems:"center", justifyContent:"center",
    boxShadow:`0 4px 24px ${MARICO_RED}44, 0 1px 8px rgba(0,0,0,0.2)`,
    border:`1.5px solid ${MARICO_RED}55`, minWidth:160,
  }}>
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcORqLcrh_3ZRjtYRiG6kWWqJp-pByc1o_mQ&s" alt="logo"
      style={{ width:160, height:70, objectFit:"contain" }}/>
  </div>
</div>
      {/* ── HEADER ── */}
      <div style={{ padding:"30px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-24px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)" }}>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ width:3, height:28, borderRadius:2, background:`linear-gradient(to bottom,${MARICO_RED},rgba(208,2,27,0.1))` }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:5, color:MARICO_ROSE, textTransform:"uppercase", fontWeight:600 }}>
            Slide 06 · Marico · Management Frameworks
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 18px",
              background:"rgba(208,2,27,0.12)", border:`1px solid ${MARICO_RED}44`,
              borderRadius:24, marginBottom:12 }}>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:700, color:MARICO_ROSE, letterSpacing:2 }}>MARICO LIMITED</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:"rgba(255,107,107,0.55)", letterSpacing:1 }}>The Agile Challenger</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:46, fontWeight:900, letterSpacing:-1.5, lineHeight:1.08, color:"#fff" }}>
              Management{" "}
              <span style={{ backgroundImage:`linear-gradient(90deg,${MARICO_RED} 0%,${MARICO_ROSE} 40%,#e05c00 80%,${MARICO_RED} 100%)`,
                backgroundSize:"600px auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                animation:"shimmer 4s linear infinite", display:"inline-block" }}>Frameworks</span>
            </h1>
          </div>
          <div style={{ display:"flex", gap:10, paddingBottom:4, opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            {MARICO_PILLARS.map(p => (
              <div key={p.id} style={{ width:44, height:44, borderRadius:12,
                background:`${p.color}33`, border:`1.5px solid ${p.color}66`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:21.5 }}>{p.icon}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin:"14px 72px 0", height:2, background:"rgba(255,255,255,0.06)", borderRadius:2,
        overflow:"hidden", position:"relative", zIndex:2,
        opacity:phase>=2?1:0, transition:"opacity 0.4s ease" }}>
        {phase>=2 && <div style={{ position:"absolute", inset:0,
          background:`linear-gradient(to right,${MARICO_RED},${MARICO_ROSE} 55%,#e05c00)`,
          transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
      </div>

      {/* ── PILLARS — unique asymmetric layout ── */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1.15fr 0.85fr 0.85fr 1.15fr",
        gap:14, padding:"14px 72px 22px", position:"relative", zIndex:2 }}>
        {MARICO_PILLARS.map((p, i) => {
          const isHov = hov===p.id;
          return (
            <div key={p.id} className="company-card"
              onMouseEnter={() => setHov(p.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: isHov
                  ? `linear-gradient(170deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))`
                  : `linear-gradient(170deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))`,
                border:`1.5px solid ${isHov ? p.accent+"99" : "rgba(255,255,255,0.09)"}`,
                borderRadius:18,
                boxShadow: isHov
                  ? `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${p.accent}33`
                  : "0 4px 20px rgba(0,0,0,0.3)",
                backdropFilter:"blur(14px)",
                display:"flex", flexDirection:"column",
                position:"relative", overflow:"hidden",
                opacity:phase>=3?1:0,
                animation:phase>=3?`scaleIn 0.65s cubic-bezier(.23,1,.32,1) ${i*0.13}s both`:"none",
                cursor:"default",
              }}
            >
              {/* Top bar */}
              <div style={{ height:4, overflow:"hidden", position:"relative", borderRadius:"18px 18px 0 0" }}>
                {phase>=3 && <div style={{ position:"absolute", inset:0,
                  background:`linear-gradient(to right,${p.color},${p.accent})`,
                  animation:`barGrow 0.8s cubic-bezier(.23,1,.32,1) ${i*0.13+0.2}s both` }}/>}
              </div>

              <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"22px 20px 18px" }}>
                {/* Icon */}
                <div style={{ width:58, height:58, borderRadius:15, marginBottom:16,
                  background:`${p.color}22`, border:`2px solid ${p.accent}44`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:23.5,
                  animation: isHov ? "floatCard 2.1s ease-in-out infinite" : "none",
                  boxShadow: isHov ? `0 8px 28px ${p.accent}33` : "none",
                  transition:"box-shadow 0.3s ease" }}>{p.icon}</div>

                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:4,
                  textTransform:"uppercase", color:p.accent, fontWeight:700, marginBottom:5 }}>{p.label} ·</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:19.5, fontWeight:700,
                  color:"#fff", lineHeight:1.2, marginBottom:14, letterSpacing:-0.3 }}>{p.title}</h3>

                <div style={{ height:1, background:`linear-gradient(to right,${p.accent}55,transparent)`,
                  marginBottom:14, borderRadius:1 }}/>

                <div style={{ display:"flex", flexDirection:"column", gap:10, flex:1 }}>
                  {p.points.map((pt, j) => (
                    <div key={j} style={{ padding:"12px 14px",
                      background: isHov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.07)", borderRadius:10,
                      opacity:phase>=4?1:0,
                      transform:phase>=4?"translateY(0)":"translateY(14px)",
                      transition:`all 0.5s ease ${0.3+i*0.1+j*0.1}s` }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700,
                        color:p.accent, marginBottom:5 }}>{pt.tag}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5, lineHeight:1.55,
                        color:"rgba(255,255,255,0.58)", fontWeight:300 }}>{pt.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {isHov && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                background:`linear-gradient(to right,transparent,${p.accent},transparent)` }}/>}
              <div style={{ position:"absolute", bottom:-10, right:8, fontFamily:"'Playfair Display',serif",
                fontSize:100, fontWeight:900, color:"rgba(255,255,255,0.025)", lineHeight:1,
                pointerEvents:"none", userSelect:"none" }}>{p.label}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding:"0 72px 18px", display:"flex", alignItems:"center", gap:12, zIndex:2,
        opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.3s" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:12.5, color:`rgba(208,2,27,0.5))`,
          letterSpacing:3, textTransform:"uppercase" }}>Marico Limited · Strategic Convergence · Global FMCG</span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
      </div>

      {/* Red corner brackets */}
      {[
        { top:18, left:18,   borderTop:`2px solid ${MARICO_RED}55`, borderLeft:`2px solid ${MARICO_RED}55` },
        { top:18, right:18,  borderTop:`2px solid ${MARICO_RED}55`, borderRight:`2px solid ${MARICO_RED}55` },
        { bottom:18, left:18,  borderBottom:`2px solid ${MARICO_RED}55`, borderLeft:`2px solid ${MARICO_RED}55` },
        { bottom:18, right:18, borderBottom:`2px solid ${MARICO_RED}55`, borderRight:`2px solid ${MARICO_RED}55` },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20,
          opacity:phase>=5?0.8:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 7 — MARICO CASE STUDY: DIGITAL & DIVERSITY INTEGRATION
═══════════════════════════════════════════════════════════════════════════ */
const MARICO_ACTIONS = [
  { icon:"🏗️", color:MARICO_RED,    accent:"#ff4d5e", title:"Separate Digital Operating Models",
    body:"Dedicated P&L & agile teams for digital brands." },
  { icon:"📡", color:"#e05c00",     accent:"#ff8c42", title:"Sprinklr Social Intelligence",
    body:"AI listening across 30+ channels. Sentiment in <60 min." },
  { icon:"📊", color:"#9b59b6",     accent:"#c39bd3", title:"Inclusion Index Implementation",
    body:"82/100 belonging score — identifies inequities early." },
];

const MARICO_RESULTS = [
  { value:"<1 hr",   label:"Consumer Response Time", icon:"⚡", color:MARICO_RED,  prev:"48 hrs" },
  { value:"+92%",    label:"Social Brand Mentions",  icon:"📈", color:"#e05c00",   prev:"Baseline" },
  { value:"82 / 100",label:"Inclusion Index Score",  icon:"🌟", color:"#9b59b6",   prev:"Industry avg: 68" },
  { value:"28%",     label:"Women in Leadership",    icon:"👩‍💼", color:"#27ae60",  prev:"↑ from 22%" },
];

function Slide7({ active }) {
  const [phase, setPhase] = useState(0);
  const [hov, setHov] = useState(null);
  const [resHov, setResHov] = useState(null);
  const [countUp, setCountUp] = useState(false);

  useEffect(() => {
    if (!active) { setPhase(0); setCountUp(false); return; }
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 430),
      setTimeout(() => setPhase(3), 720),
      setTimeout(() => setPhase(4), 1020),
      setTimeout(() => setPhase(5), 1300),
      setTimeout(() => setCountUp(true), 1500),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width:"100%", height:"100%",
      background:"linear-gradient(150deg,#150104 0%,#250508 55%,#120103 100%)",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      <Orb style={{ width:600, height:600, background:"rgba(208,2,27,0.09)", top:-220, right:-180, animation:"rotateSlow 56s linear infinite" }}/>
      <Orb style={{ width:420, height:420, background:"rgba(224,92,0,0.07)",  bottom:-150, left:-150, animation:"rotateSlowR 40s linear infinite" }}/>
      <Orb style={{ width:260, height:260, background:"rgba(155,89,182,0.06)",top:"50%",  left:"42%" }}/>

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize:"36px 36px" }}/>

      
      {/* ── TOP-RIGHT COMPANY LOGO ── */}
     

      {/* Red shimmer stripe */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:5, zIndex:10,
        background:`linear-gradient(to right,${MARICO_RED},${MARICO_ROSE},#e05c00,${MARICO_RED})`,
        backgroundSize:"400% auto", animation:"shimmer 4s linear infinite",
        opacity:phase>=1?1:0, transition:"opacity 0.8s ease" }}/>

      {/* ── HEADER ── */}
      <div style={{ padding:"28px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-24px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)" }}>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:3, height:28, borderRadius:2, background:`linear-gradient(to bottom,${MARICO_RED},rgba(208,2,27,0.1))` }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, letterSpacing:5,
            color:MARICO_ROSE, textTransform:"uppercase", fontWeight:600 }}>
            Slide 07 · Marico · Case Study
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 18px",
              background:"rgba(208,2,27,0.12)", border:`1px solid ${MARICO_RED}44`,
              borderRadius:24, marginBottom:10 }}>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700,
                color:MARICO_ROSE, letterSpacing:2 }}>DIGITAL & DIVERSITY INTEGRATION</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:900,
              letterSpacing:-1.5, lineHeight:1.08, color:"#fff" }}>
              The{" "}
              <span style={{ backgroundImage:`linear-gradient(90deg,${MARICO_RED} 0%,${MARICO_ROSE} 40%,#e05c00 80%,${MARICO_RED} 100%)`,
                backgroundSize:"600px auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                animation:"shimmer 4s linear infinite", display:"inline-block" }}>Agile Challenger</span>
              {" "}in Action
            </h1>
          </div>
          {/* Live metric pill */}
          <div style={{ display:"flex", gap:10, paddingBottom:4, opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            <div style={{ padding:"8px 18px", background:"rgba(255,255,255,0.05)",
              border:`1px solid ${MARICO_RED}44`, borderRadius:14, textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:29.5, fontWeight:900, color:MARICO_RED }}>4D</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:"rgba(255,255,255,0.4)", letterSpacing:1, marginTop:2 }}>FRAMEWORK</div>
            </div>
            <div style={{ padding:"8px 18px", background:"rgba(255,255,255,0.05)",
              border:`1px solid ${MARICO_ROSE}44`, borderRadius:14, textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:29.5, fontWeight:900, color:MARICO_ROSE }}>82</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:"rgba(255,255,255,0.4)", letterSpacing:1, marginTop:2 }}>INCLUSION IDX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin:"12px 72px 0", height:2, background:"rgba(255,255,255,0.06)", borderRadius:2,
        overflow:"hidden", position:"relative", zIndex:2,
        opacity:phase>=2?1:0, transition:"opacity 0.4s ease" }}>
        {phase>=2 && <div style={{ position:"absolute", inset:0,
          background:`linear-gradient(to right,${MARICO_RED},${MARICO_ROSE} 55%,#e05c00)`,
          transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
      </div>

      {/* ── BODY: left actions (60%) + right results (40%) ── */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1.4fr 1fr",
        gap:16, padding:"12px 72px 0", position:"relative", zIndex:2, minHeight:0 }}>

        {/* LEFT — Action cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4,
            textTransform:"uppercase", color:"rgba(255,255,255,0.3)", flexShrink:0,
            opacity:phase>=2?1:0, transition:"opacity 0.5s ease" }}>Strategic Actions Taken</div>

          {MARICO_ACTIONS.map((a, i) => {
            const isHov = hov===i;
            return (
              <div key={i}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  display:"flex", gap:14, alignItems:"center",
                  padding:"14px 16px", flex:1,
                  background: isHov ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
                  border:`1.5px solid ${isHov ? a.accent+"88" : "rgba(255,255,255,0.07)"}`,
                  borderRadius:12,
                  boxShadow: isHov ? `0 14px 36px rgba(0,0,0,0.4),0 0 0 1px ${a.accent}22` : "none",
                  backdropFilter:"blur(10px)", cursor:"default",
                  opacity:phase>=3?1:0,
                  transform:phase>=3?"translateX(0)":"translateX(-28px)",
                  transition:`all 0.55s cubic-bezier(.23,1,.32,1) ${i*0.14}s, box-shadow 0.3s ease`,
                }}
              >
                <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                  background:`${a.color}25`, border:`1.5px solid ${a.accent}55`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:25.5,
                  animation: isHov ? "floatCard 2s ease-in-out infinite" : "none" }}>{a.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:2.5,
                    textTransform:"uppercase", color:a.accent, fontWeight:700, marginBottom:4 }}>
                    Action {String(i+1).padStart(2,"0")}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21.5, fontWeight:700,
                    color:"#fff", marginBottom:5, lineHeight:1.2 }}>{a.title}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, lineHeight:1.55,
                    color:"rgba(255,255,255,0.55)", fontWeight:300 }}>{a.body}</div>
                </div>
                {isHov && <div style={{ width:3, borderRadius:2, alignSelf:"stretch", flexShrink:0,
                  background:`linear-gradient(to bottom,${a.accent},transparent)` }}/>}
              </div>
            );
          })}
        </div>

        {/* RIGHT — Results */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4,
            textTransform:"uppercase", color:"rgba(255,255,255,0.3)", flexShrink:0,
            opacity:phase>=2?1:0, transition:"opacity 0.5s ease 0.1s" }}>Measurable Results</div>

          {MARICO_RESULTS.map((r, i) => {
            const isH = resHov===i;
            return (
              <div key={i}
                onMouseEnter={() => setResHov(i)}
                onMouseLeave={() => setResHov(null)}
                style={{
                  flex:1, padding:"12px 14px", borderRadius:12,
                  background: isH ? `linear-gradient(145deg,${r.color}22,${r.color}0a)` : "rgba(255,255,255,0.04)",
                  border:`1.5px solid ${isH ? r.color+"88" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: isH ? `0 14px 36px rgba(0,0,0,0.35),0 0 0 1px ${r.color}22` : "none",
                  backdropFilter:"blur(8px)", cursor:"default",
                  display:"flex", alignItems:"center", gap:12,
                  opacity:phase>=4?1:0,
                  transform:phase>=4?"translateX(0)":"translateX(24px)",
                  transition:`all 0.55s cubic-bezier(.23,1,.32,1) ${0.1+i*0.12}s, box-shadow 0.3s ease`,
                }}
              >
                <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
                  background:`${r.color}22`, border:`1.5px solid ${r.color}44`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:23.5,
                  animation: isH ? "floatCard 2.3s ease-in-out infinite":"none" }}>{r.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:27.5, fontWeight:900,
                    color:r.color, lineHeight:1, marginBottom:3 }}>
                    {countUp ? r.value : "—"}
                  </div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, color:"rgba(255,255,255,0.5)",
                    marginBottom:2 }}>{r.label}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:r.color,
                    opacity:0.6 }}>prev: {r.prev}</div>
                </div>
                {isH && <div style={{ width:3, height:"55%", borderRadius:2,
                  background:`linear-gradient(to bottom,${r.color},transparent)`, flexShrink:0 }}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"10px 72px 14px", display:"flex", alignItems:"center", gap:12, zIndex:2,
        opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.3s" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:13.5, color:`rgba(208,2,27,0.45)`,
          letterSpacing:3, textTransform:"uppercase" }}>Marico Limited · Digital & Diversity · Strategic Convergence</span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
      </div>

      {/* Corner brackets */}
      {[
        { top:18, left:18,   borderTop:`2px solid ${MARICO_RED}55`, borderLeft:`2px solid ${MARICO_RED}55` },
        { top:18, right:18,  borderTop:`2px solid ${MARICO_RED}55`, borderRight:`2px solid ${MARICO_RED}55` },
        { bottom:18, left:18,  borderBottom:`2px solid ${MARICO_RED}55`, borderLeft:`2px solid ${MARICO_RED}55` },
        { bottom:18, right:18, borderBottom:`2px solid ${MARICO_RED}55`, borderRight:`2px solid ${MARICO_RED}55` },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20,
          opacity:phase>=5?0.8:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 8 — RECKITT MANAGEMENT FRAMEWORKS
═══════════════════════════════════════════════════════════════════════════ */
const RKT_COBALT  = "#003087";
const RKT_BLUE    = "#0057b8";
const RKT_SKY     = "#4d9de0";
const RKT_GOLD    = "#f5a623";
const RKT_CANVAS  = "#00091a";

const RKT_PILLARS = [
  {
    id:"strategic", icon:"🧭", label:"01", title:"Strategic Architecture",
    color:RKT_COBALT, accent:RKT_SKY, bg:"rgba(0,48,135,0.12)", border:"rgba(0,87,184,0.28)",
    items:[
      { tag:"The Compass", body:"Every brand aligned to a purpose-led North Star." },
      { tag:"Purpose-Led Brands", body:"Dettol, Nurofen, Strepsils — health purpose over features." },
    ],
  },
  {
    id:"operational", icon:"⚙️", label:"02", title:"Operational Excellence",
    color:"#1a6b9a", accent:"#5bc4f5", bg:"rgba(26,107,154,0.1)", border:"rgba(91,196,245,0.2)",
    items:[
      { tag:"Fixed Cost Optimisation", body:"200 bps target via zero-based budgeting & AI spend analytics." },
      { tag:"Microsoft Dynamics 365", body:"Unified CRM, supply visibility & demand sensing in one platform." },
    ],
  },
  {
    id:"human", icon:"🌟", label:"03", title:"Human Capital",
    color:"#6a3d9a", accent:"#b39ddb", bg:"rgba(106,61,154,0.1)", border:"rgba(179,157,219,0.2)",
    items:[
      { tag:"Freedom to Succeed", body:"Trust-driven autonomy & radical ownership." },
      { tag:"The Four Cs", body:"Collaboration · Creation · Connection · Celebration." },
    ],
  },
  {
    id:"supply", icon:"🌱", label:"04", title:"Supply Chain Sustainability",
    color:"#1a7a4a", accent:"#4caf82", bg:"rgba(26,122,74,0.1)", border:"rgba(76,175,130,0.2)",
    items:[
      { tag:"Sustainable Sourcing", body:"50% net revenue from more sustainable products by 2030." },
      { tag:"Net Zero 2040", body:"Scope 1-2-3 targets · USD 1B+ climate commitment." },
    ],
  },
];

function Slide8({ active }) {
  const [phase, setPhase] = useState(0);
  const [hov, setHov]     = useState(null);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 440),
      setTimeout(() => setPhase(3), 740),
      setTimeout(() => setPhase(4), 1020),
      setTimeout(() => setPhase(5), 1300),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width:"100%", height:"100%",
      background:"linear-gradient(145deg,#00091a 0%,#001540 55%,#000d30 100%)",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      {/* Orbs */}
      <Orb style={{ width:700, height:700, background:"rgba(0,87,184,0.09)",  top:-260, left:-200, animation:"rotateSlow 55s linear infinite" }}/>
      <Orb style={{ width:520, height:520, background:"rgba(245,166,35,0.06)",bottom:-200, right:-180, animation:"rotateSlowR 42s linear infinite" }}/>
      <Orb style={{ width:300, height:300, background:"rgba(106,61,154,0.07)",top:"42%", left:"38%" }}/>

      {/* Grid texture */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)",
        backgroundSize:"40px 40px" }}/>

      {/* Reckitt cobalt top stripe - FIXED */}
<div style={{ 
  position:"absolute", 
  top:0, 
  left:0, 
  right:0, 
  height:5, 
  zIndex:10,
  background:`linear-gradient(to right,${RKT_COBALT},${RKT_SKY},${RKT_GOLD},${RKT_SKY},${RKT_COBALT})`,
  backgroundSize:"400% auto", 
  animation:"shimmer 5s linear infinite",
  opacity:phase>=1?1:0, 
  transition:"opacity 0.8s ease" 
}}/>

{/* ── TOP-RIGHT COMPANY LOGO ── */}
<div style={{
  position:"absolute", 
  top:22, 
  right:26, 
  zIndex:20,
  opacity:phase>=1?1:0, 
  transition:"opacity 0.8s ease 0.2s",
}}>
  <div style={{
    background:"rgba(255,255,255,0.95)", 
    borderRadius:12,
    padding:"10px 24px", 
    height:70,
    display:"flex", 
    alignItems:"center", 
    justifyContent:"center",
    boxShadow:`0 4px 24px ${RKT_SKY}44, 0 1px 8px rgba(0,0,0,0.2)`,
    border:`1.5px solid ${RKT_SKY}55`, 
    minWidth:160,
  }}>
    <img 
      src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Reckitt_logo.svg/1280px-Reckitt_logo.svg.png" 
      alt="logo"
      style={{ width:160, height:70, objectFit:"contain" }}
    />
  </div>
</div>
      {/* ── HEADER ── */}
      <div style={{ padding:"30px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-24px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)" }}>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ width:3, height:28, borderRadius:2,
            background:`linear-gradient(to bottom,${RKT_SKY},rgba(0,87,184,0.1))` }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:5,
            color:RKT_SKY, textTransform:"uppercase", fontWeight:600 }}>
            Slide 08 · Reckitt · Management Frameworks
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 18px",
              background:"rgba(0,87,184,0.14)", border:`1px solid ${RKT_BLUE}44`,
              borderRadius:24, marginBottom:12 }}>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:700,
                color:RKT_SKY, letterSpacing:2 }}>RECKITT BENCKISER</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                color:"rgba(77,157,224,0.55)", letterSpacing:1 }}>The Purpose-Led Giant</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:46, fontWeight:900,
              letterSpacing:-1.5, lineHeight:1.08, color:"#fff" }}>
              Management{" "}
              <span style={{ backgroundImage:`linear-gradient(90deg,${RKT_COBALT} 0%,${RKT_SKY} 35%,${RKT_GOLD} 70%,${RKT_SKY} 100%)`,
                backgroundSize:"600px auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                animation:"shimmer 5s linear infinite", display:"inline-block" }}>Frameworks</span>
            </h1>
          </div>

          {/* Pillar icon badges */}
          <div style={{ display:"flex", gap:10, paddingBottom:4,
            opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            {RKT_PILLARS.map(p => (
              <div key={p.id} style={{ width:44, height:44, borderRadius:12,
                background:`${p.color}33`, border:`1.5px solid ${p.accent}55`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:21.5 }}>{p.icon}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin:"14px 72px 0", height:2, background:"rgba(255,255,255,0.07)", borderRadius:2,
        overflow:"hidden", position:"relative", zIndex:2,
        opacity:phase>=2?1:0, transition:"opacity 0.4s ease" }}>
        {phase>=2 && <div style={{ position:"absolute", inset:0,
          background:`linear-gradient(to right,${RKT_COBALT},${RKT_SKY} 55%,${RKT_GOLD})`,
          transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
      </div>

      {/* ── PILLARS — 2 × 2 tall grid (unique layout: left pair + right pair) ── */}
      <div style={{ flex:1, display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gridTemplateRows:"1fr 1fr",
        gap:14, padding:"14px 72px 22px", position:"relative", zIndex:2 }}>

        {RKT_PILLARS.map((p, i) => {
          const isHov = hov===p.id;
          const isLeft = i % 2 === 0;
          return (
            <div key={p.id} className="company-card"
              onMouseEnter={() => setHov(p.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: isHov
                  ? "rgba(255,255,255,0.09)"
                  : "rgba(255,255,255,0.04)",
                border:`1.5px solid ${isHov ? p.accent+"88" : "rgba(255,255,255,0.09)"}`,
                borderRadius:18,
                boxShadow: isHov
                  ? `0 20px 56px rgba(0,0,0,0.45), 0 0 0 1px ${p.accent}33`
                  : "0 4px 20px rgba(0,0,0,0.3)",
                backdropFilter:"blur(14px)",
                display:"flex", gap:18, alignItems:"flex-start",
                padding:"22px 24px",
                position:"relative", overflow:"hidden",
                opacity:phase>=3?1:0,
                animation:phase>=3?`fadeScaleIn 0.6s cubic-bezier(.23,1,.32,1) ${i*0.12}s both`:"none",
                cursor:"default",
              }}
            >
              {/* Left accent strip */}
              <div style={{ width:4, borderRadius:2, alignSelf:"stretch", flexShrink:0,
                background:`linear-gradient(to bottom,${p.accent},${p.accent}22)`,
                opacity: isHov ? 1 : 0.5, transition:"opacity 0.3s ease" }}/>

              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10, minWidth:0 }}>
                {/* Icon + label row */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:50, height:50, borderRadius:13, flexShrink:0,
                    background:`${p.color}30`, border:`1.5px solid ${p.accent}44`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:23.5,
                    animation: isHov ? "floatCard 2s ease-in-out infinite" : "none",
                    boxShadow: isHov ? `0 6px 22px ${p.accent}33` : "none",
                    transition:"box-shadow 0.3s ease" }}>{p.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:4,
                      textTransform:"uppercase", color:p.accent, fontWeight:700, marginBottom:3 }}>{p.label} ·</div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:19.5, fontWeight:700,
                      color:"#fff", lineHeight:1.15, letterSpacing:-0.3 }}>{p.title}</h3>
                  </div>
                </div>

                <div style={{ height:1, background:`linear-gradient(to right,${p.accent}55,transparent)`, borderRadius:1 }}/>

                {/* Items side-by-side */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {p.items.map((it, j) => (
                    <div key={j} style={{
                      padding:"12px 14px",
                      background: isHov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.07)", borderRadius:10,
                      opacity:phase>=4?1:0,
                      transform:phase>=4?"translateY(0)":"translateY(14px)",
                      transition:`all 0.5s ease ${0.3+i*0.1+j*0.1}s`,
                    }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700,
                        color:p.accent, marginBottom:5 }}>{it.tag}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5, lineHeight:1.55,
                        color:"rgba(255,255,255,0.55)", fontWeight:300 }}>{it.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watermark */}
              <div style={{ position:"absolute", bottom:-12, right:10, fontFamily:"'Playfair Display',serif",
                fontSize:110, fontWeight:900, color:"rgba(255,255,255,0.022)", lineHeight:1,
                pointerEvents:"none", userSelect:"none" }}>{p.label}</div>
              {isHov && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                background:`linear-gradient(to right,transparent,${p.accent},transparent)` }}/>}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding:"0 72px 18px", display:"flex", alignItems:"center", gap:12, zIndex:2,
        opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.3s" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:12.5,
          color:`rgba(0,87,184,0.5)5)`, letterSpacing:3, textTransform:"uppercase" }}>
          Reckitt Benckiser · Strategic Convergence · Global FMCG
        </span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
      </div>

      {/* Cobalt corner brackets */}
      {[
        { top:18, left:18,   borderTop:`2px solid ${RKT_SKY}55`, borderLeft:`2px solid ${RKT_SKY}55` },
        { top:18, right:18,  borderTop:`2px solid ${RKT_SKY}55`, borderRight:`2px solid ${RKT_SKY}55` },
        { bottom:18, left:18,  borderBottom:`2px solid ${RKT_SKY}55`, borderLeft:`2px solid ${RKT_SKY}55` },
        { bottom:18, right:18, borderBottom:`2px solid ${RKT_SKY}55`, borderRight:`2px solid ${RKT_SKY}55` },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20,
          opacity:phase>=5?0.8:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 9 — RECKITT CASE STUDY: DETTOL BANEGA SWASTH INDIA
═══════════════════════════════════════════════════════════════════════════ */
const DBSI_ACTIVITIES = [
  { icon:"🏫", color:RKT_BLUE,   accent:RKT_SKY,  title:"School Programmes",
    body:"Hygiene curriculum for 50M+ schoolchildren nationwide." },
  { icon:"📢", color:"#1a6b9a",  accent:"#5bc4f5", title:"Public Health Campaigns",
    body:"TV, digital & on-ground activations at health centres." },
  { icon:"🤝", color:"#6a3d9a",  accent:"#b39ddb", title:"Government Partnerships",
    body:"Co-branded with Ministry of Health in national hygiene schemes." },
];

const DBSI_IMPACT = [
  { value:"116M",     icon:"👥", label:"People Reached",         color:RKT_SKY,     sub:"Across 26 states" },
  { value:"₹78.8B",  icon:"💰", label:"Economic Contribution",   color:RKT_GOLD,    sub:"GDP impact (INR)" },
  { value:"69,000",  icon:"💼", label:"Jobs Created",             color:"#4caf82",   sub:"Direct & indirect" },
  { value:"2.5×",    icon:"📈", label:"Social ROI Multiplier",    color:"#b39ddb",   sub:"For every ₹1 invested" },
];

function Slide9({ active }) {
  const [phase, setPhase] = useState(0);
  const [hov,   setHov]   = useState(null);
  const [impHov, setImpHov] = useState(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (!active) { setPhase(0); setReveal(false); return; }
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 420),
      setTimeout(() => setPhase(3), 720),
      setTimeout(() => setPhase(4), 1020),
      setTimeout(() => setPhase(5), 1300),
      setTimeout(() => setReveal(true), 1600),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width:"100%", height:"100%",
      background:"linear-gradient(150deg,#000814 0%,#001030 55%,#000c25 100%)",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      <Orb style={{ width:650, height:650, background:"rgba(0,87,184,0.1)",  top:-230, right:-190, animation:"rotateSlow 58s linear infinite" }}/>
      <Orb style={{ width:440, height:440, background:"rgba(245,166,35,0.07)",bottom:-160, left:-160, animation:"rotateSlowR 44s linear infinite" }}/>
      <Orb style={{ width:270, height:270, background:"rgba(76,175,130,0.06)",top:"50%", left:"40%" }}/>

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)",
        backgroundSize:"36px 36px" }}/>

      
      {/* ── TOP-RIGHT COMPANY LOGO ── */}

      {/* Cobalt shimmer stripe */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:5, zIndex:10,
        background:`linear-gradient(to right,${RKT_COBALT},${RKT_SKY},${RKT_GOLD},${RKT_SKY},${RKT_COBALT})`,
        backgroundSize:"400% auto", animation:"shimmer 5s linear infinite",
        opacity:phase>=1?1:0, transition:"opacity 0.8s ease" }}/>

      {/* ── HEADER ── */}
      <div style={{ padding:"28px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-24px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)" }}>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:3, height:28, borderRadius:2,
            background:`linear-gradient(to bottom,${RKT_SKY},rgba(0,87,184,0.1))` }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, letterSpacing:5,
            color:RKT_SKY, textTransform:"uppercase", fontWeight:600 }}>
            Slide 09 · Reckitt · Case Study
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 18px",
              background:"rgba(0,87,184,0.14)", border:`1px solid ${RKT_BLUE}44`,
              borderRadius:24, marginBottom:10 }}>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700,
                color:RKT_SKY, letterSpacing:2 }}>DETTOL BANEGA SWASTH INDIA</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:900,
              letterSpacing:-1.5, lineHeight:1.08, color:"#fff" }}>
              Purpose in{" "}
              <span style={{ backgroundImage:`linear-gradient(90deg,${RKT_COBALT} 0%,${RKT_SKY} 35%,${RKT_GOLD} 70%,${RKT_SKY} 100%)`,
                backgroundSize:"600px auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                animation:"shimmer 5s linear infinite", display:"inline-block" }}>Action</span>
            </h1>
          </div>

          {/* Goal pill */}
          <div style={{ maxWidth:280, padding:"12px 18px",
            background:"rgba(255,255,255,0.05)", border:`1px solid ${RKT_SKY}33`,
            borderRadius:14, backdropFilter:"blur(8px)",
            opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:3,
              textTransform:"uppercase", color:RKT_SKY, marginBottom:5, fontWeight:600 }}>Campaign Goal</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, color:"rgba(255,255,255,0.7)",
              lineHeight:1.5 }}>Improve nationwide hygiene awareness through scaled community action</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin:"12px 72px 0", height:2, background:"rgba(255,255,255,0.07)", borderRadius:2,
        overflow:"hidden", position:"relative", zIndex:2,
        opacity:phase>=2?1:0, transition:"opacity 0.4s ease" }}>
        {phase>=2 && <div style={{ position:"absolute", inset:0,
          background:`linear-gradient(to right,${RKT_COBALT},${RKT_SKY} 55%,${RKT_GOLD})`,
          transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
      </div>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1.1fr 0.9fr",
        gap:16, padding:"12px 72px 0", position:"relative", zIndex:2, minHeight:0 }}>

        {/* LEFT — Activity cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4,
            textTransform:"uppercase", color:"rgba(255,255,255,0.3)", flexShrink:0,
            opacity:phase>=2?1:0, transition:"opacity 0.5s ease" }}>Campaign Activities</div>

          {DBSI_ACTIVITIES.map((a, i) => {
            const isHov = hov===i;
            return (
              <div key={i}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  display:"flex", gap:14, alignItems:"center",
                  padding:"14px 16px", flex:1,
                  background: isHov ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
                  border:`1.5px solid ${isHov ? a.accent+"88" : "rgba(255,255,255,0.07)"}`,
                  borderRadius:12,
                  boxShadow: isHov ? `0 14px 36px rgba(0,0,0,0.4),0 0 0 1px ${a.accent}22` : "none",
                  backdropFilter:"blur(10px)", cursor:"default",
                  opacity:phase>=3?1:0,
                  transform:phase>=3?"translateX(0)":"translateX(-28px)",
                  transition:`all 0.55s cubic-bezier(.23,1,.32,1) ${i*0.14}s, box-shadow 0.3s ease`,
                }}
              >
                {/* Vertical left accent */}
                <div style={{ width:3, borderRadius:2, alignSelf:"stretch", flexShrink:0,
                  background:`linear-gradient(to bottom,${a.accent},${a.accent}22)`,
                  opacity: isHov?1:0.4 }}/>

                <div style={{ width:44, height:44, borderRadius:11, flexShrink:0,
                  background:`${a.color}25`, border:`1.5px solid ${a.accent}55`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:25.5,
                  animation: isHov ? "floatCard 2s ease-in-out infinite" : "none" }}>{a.icon}</div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:3,
                    textTransform:"uppercase", color:a.accent, fontWeight:700, marginBottom:4 }}>
                    Activity {String(i+1).padStart(2,"0")}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21.5, fontWeight:700,
                    color:"#fff", marginBottom:5, lineHeight:1.2 }}>{a.title}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, lineHeight:1.55,
                    color:"rgba(255,255,255,0.55)", fontWeight:300 }}>{a.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT — Impact metrics */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4,
            textTransform:"uppercase", color:"rgba(255,255,255,0.3)", flexShrink:0,
            opacity:phase>=2?1:0, transition:"opacity 0.5s ease 0.1s" }}>Measured Impact</div>

          {DBSI_IMPACT.map((r, i) => {
            const isH = impHov===i;
            return (
              <div key={i}
                onMouseEnter={() => setImpHov(i)}
                onMouseLeave={() => setImpHov(null)}
                style={{
                  flex:1, padding:"12px 14px", borderRadius:12,
                  background: isH ? `linear-gradient(145deg,${r.color}22,${r.color}08)` : "rgba(255,255,255,0.04)",
                  border:`1.5px solid ${isH ? r.color+"88" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: isH ? `0 14px 40px rgba(0,0,0,0.4),0 0 0 1px ${r.color}22` : "none",
                  backdropFilter:"blur(8px)", cursor:"default",
                  display:"flex", alignItems:"center", gap:12,
                  opacity:phase>=4?1:0,
                  transform:phase>=4?"translateX(0)":"translateX(24px)",
                  transition:`all 0.55s cubic-bezier(.23,1,.32,1) ${0.1+i*0.12}s, box-shadow 0.3s ease`,
                }}
              >
                <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
                  background:`${r.color}22`, border:`1.5px solid ${r.color}44`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:23.5,
                  animation: isH ? "floatCard 2.4s ease-in-out infinite" : "none" }}>{r.icon}</div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:29.5, fontWeight:900,
                    color:r.color, lineHeight:1, marginBottom:3 }}>
                    {reveal ? r.value : "—"}
                  </div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5,
                    color:"rgba(255,255,255,0.55)", marginBottom:2 }}>{r.label}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                    color:r.color, opacity:0.65 }}>{r.sub}</div>
                </div>

                <div style={{ width:3, height:"55%", borderRadius:2, flexShrink:0,
                  background:`linear-gradient(to bottom,${r.color},${r.color}22)`,
                  opacity: isH ? 1 : 0.3, transition:"opacity 0.3s ease" }}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"10px 72px 14px", display:"flex", alignItems:"center", gap:12, zIndex:2,
        opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.3s" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:13.5,
          color:`rgba(0,87,184,0.5))`, letterSpacing:3, textTransform:"uppercase" }}>
          Reckitt · Dettol Banega Swasth India · Strategic Convergence
        </span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
      </div>

      {/* Corner brackets */}
      {[
        { top:18, left:18,   borderTop:`2px solid ${RKT_SKY}55`, borderLeft:`2px solid ${RKT_SKY}55` },
        { top:18, right:18,  borderTop:`2px solid ${RKT_SKY}55`, borderRight:`2px solid ${RKT_SKY}55` },
        { bottom:18, left:18,  borderBottom:`2px solid ${RKT_SKY}55`, borderLeft:`2px solid ${RKT_SKY}55` },
        { bottom:18, right:18, borderBottom:`2px solid ${RKT_SKY}55`, borderRight:`2px solid ${RKT_SKY}55` },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20,
          opacity:phase>=5?0.8:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 10 — DABUR MANAGEMENT FRAMEWORKS
   Palette: deep forest green #1a4a1a, emerald #2d6a2d, saffron #e8850a,
            gold #f5c518, warm ivory slide bg
═══════════════════════════════════════════════════════════════════════════ */
const DAB_GREEN    = "#1a5c1a";
const DAB_EMERALD  = "#2d8a2d";
const DAB_SAFFRON  = "#d4770a";
const DAB_GOLD     = "#f0b429";
const DAB_CANVAS   = "#0a1a08";

const DAB_PILLARS = [
  {
    id:"strategic", icon:"🏛️", label:"01", title:"Strategic Architecture",
    color:DAB_GREEN, accent:DAB_GOLD,
    items:[
      { tag:"Seven Strategic Pillars", body:"Power Brands · International · Health · OTC · Rural." },
      { tag:"Focus on Power Brands", body:"Top 8 brands = 70%+ revenue. Disproportionate A&P focus." },
    ],
  },
  {
    id:"operational", icon:"⚡", label:"02", title:"Operational Excellence",
    color:DAB_SAFFRON, accent:"#ffcc44",
    items:[
      { tag:"Project Lakshya", body:"Inventory 38→31 days · Availability 78→93% · OTIF 95%." },
      { tag:"Project Samriddhi", body:"Zero-based cost reset — INR 86 Cr savings." },
    ],
  },
  {
    id:"human", icon:"🌟", label:"03", title:"Human Capital",
    color:"#7b5ea7", accent:"#c4a8e8",
    items:[
      { tag:"Performance-Potential Grid", body:"9-box talent map across 3,000+ managers." },
      { tag:"70-20-10 Learning Model", body:"70% on-job · 20% mentoring · 10% formal training." },
    ],
  },
  {
    id:"supply", icon:"🌿", label:"04", title:"Supply Chain Sustainability",
    color:DAB_EMERALD, accent:"#7ed07e",
    items:[
      { tag:"Contract Farming", body:"10,000+ acres · Ashwagandha, Tulsi, Aloe Vera." },
      { tag:"Biodiversity Conservation", body:"Seed banks preserving 150+ rare Ayurvedic species." },
    ],
  },
];

function Slide10({ active }) {
  const [phase, setPhase] = useState(0);
  const [hov,   setHov]   = useState(null);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 430),
      setTimeout(() => setPhase(3), 730),
      setTimeout(() => setPhase(4), 1010),
      setTimeout(() => setPhase(5), 1280),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width:"100%", height:"100%",
      background:"linear-gradient(150deg,#050e04 0%,#0c1f0a 55%,#081508 100%)",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      {/* Orbs */}
      <Orb style={{ width:680, height:680, background:"rgba(45,138,45,0.09)",  top:-260, left:-210, animation:"rotateSlow 52s linear infinite" }}/>
      <Orb style={{ width:500, height:500, background:"rgba(212,119,10,0.08)", bottom:-190, right:-180, animation:"rotateSlowR 40s linear infinite" }}/>
      <Orb style={{ width:280, height:280, background:"rgba(123,94,167,0.07)", top:"44%", left:"40%" }}/>

      {/* Leaf-vein subtle grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize:"38px 38px" }}/>

      
      {/* ── TOP-RIGHT COMPANY LOGO ── */}
      <div style={{
        position:"absolute", top:22, right:26, zIndex:20,
        opacity:phase>=1?1:0, transition:"opacity 0.8s ease 0.2s",
      }}>
        <div style={{
          background:"rgba(255,255,255,0.95)", borderRadius:12,
          padding:"10px 24px", height:70,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 4px 24px ${DAB_GOLD}44, 0 1px 8px rgba(0,0,0,0.2)`,
          border:`1.5px solid ${DAB_GOLD}55`, minWidth:160,
        }}>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQZvzfbc3Rj0T78YN8TrmafAOPBQYOol_bRw&s" alt="logo"
            style={{ width:160, height:70, objectFit:"contain" }}/>
        </div>
      </div>

      {/* Dabur saffron-green shimmer stripe */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:5, zIndex:10,
        background:`linear-gradient(to right,${DAB_GREEN},${DAB_GOLD},${DAB_SAFFRON},${DAB_GOLD},${DAB_GREEN})`,
        backgroundSize:"400% auto", animation:"shimmer 5s linear infinite",
        opacity:phase>=1?1:0, transition:"opacity 0.8s ease" }}/>

      {/* ── HEADER ── */}
      <div style={{ padding:"30px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-24px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)" }}>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ width:3, height:28, borderRadius:2,
            background:`linear-gradient(to bottom,${DAB_GOLD},rgba(240,180,41,0.1))` }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:5,
            color:DAB_GOLD, textTransform:"uppercase", fontWeight:600 }}>
            Slide 10 · Dabur · Management Frameworks
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 18px",
              background:"rgba(45,138,45,0.14)", border:`1px solid ${DAB_EMERALD}44`,
              borderRadius:24, marginBottom:12 }}>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:700,
                color:DAB_GOLD, letterSpacing:2 }}>DABUR INDIA LTD.</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                color:"rgba(240,180,41,0.55)", letterSpacing:1 }}>The Heritage Modernizer</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:46, fontWeight:900,
              letterSpacing:-1.5, lineHeight:1.08, color:"#fff" }}>
              Management{" "}
              <span style={{
                backgroundImage:`linear-gradient(90deg,${DAB_EMERALD} 0%,${DAB_GOLD} 35%,${DAB_SAFFRON} 70%,${DAB_GOLD} 100%)`,
                backgroundSize:"600px auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                animation:"shimmer 5s linear infinite", display:"inline-block",
              }}>Frameworks</span>
            </h1>
          </div>

          {/* Pillar icon row */}
          <div style={{ display:"flex", gap:10, paddingBottom:4,
            opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            {DAB_PILLARS.map(p => (
              <div key={p.id} style={{ width:44, height:44, borderRadius:12,
                background:`${p.color}33`, border:`1.5px solid ${p.accent}55`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:21.5 }}>{p.icon}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin:"14px 72px 0", height:2, background:"rgba(255,255,255,0.07)", borderRadius:2,
        overflow:"hidden", position:"relative", zIndex:2,
        opacity:phase>=2?1:0, transition:"opacity 0.4s ease" }}>
        {phase>=2 && <div style={{ position:"absolute", inset:0,
          background:`linear-gradient(to right,${DAB_GREEN},${DAB_GOLD} 55%,${DAB_SAFFRON})`,
          transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
      </div>

      {/* ── PILLARS — unique staggered-height layout ── */}
      {/* Top row: Strategic (wider) + Operational (narrower) */}
      {/* Bottom row: Human Capital (narrower) + Supply Chain (wider) — creating a Z-flow */}
      <div style={{ flex:1, display:"grid",
        gridTemplateColumns:"1.2fr 0.8fr 0.8fr 1.2fr",
        gap:14, padding:"14px 72px 22px", position:"relative", zIndex:2 }}>

        {DAB_PILLARS.map((p, i) => {
          const isHov = hov===p.id;
          return (
            <div key={p.id} className="company-card"
              onMouseEnter={() => setHov(p.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: isHov
                  ? `linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))`
                  : `linear-gradient(160deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))`,
                border:`1.5px solid ${isHov ? p.accent+"99" : "rgba(255,255,255,0.09)"}`,
                borderRadius:18,
                boxShadow: isHov
                  ? `0 24px 60px rgba(0,0,0,0.5),0 0 0 1px ${p.accent}33`
                  : "0 4px 20px rgba(0,0,0,0.32)",
                backdropFilter:"blur(14px)",
                display:"flex", flexDirection:"column",
                position:"relative", overflow:"hidden",
                opacity:phase>=3?1:0,
                animation:phase>=3?`scaleIn 0.65s cubic-bezier(.23,1,.32,1) ${i*0.13}s both`:"none",
                cursor:"default",
              }}
            >
              {/* Top bar */}
              <div style={{ height:4, overflow:"hidden", position:"relative", borderRadius:"18px 18px 0 0" }}>
                {phase>=3 && <div style={{ position:"absolute", inset:0,
                  background:`linear-gradient(to right,${p.color},${p.accent})`,
                  animation:`barGrow 0.8s cubic-bezier(.23,1,.32,1) ${i*0.13+0.2}s both` }}/>}
              </div>

              <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"20px 20px 16px", gap:12 }}>
                {/* Icon */}
                <div style={{ width:56, height:56, borderRadius:14, flexShrink:0,
                  background:`${p.color}22`, border:`2px solid ${p.accent}44`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:23.5,
                  animation: isHov ? "floatCard 2.1s ease-in-out infinite" : "none",
                  boxShadow: isHov ? `0 8px 28px ${p.accent}33` : "none",
                  transition:"box-shadow 0.3s ease" }}>{p.icon}</div>

                <div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:4,
                    textTransform:"uppercase", color:p.accent, fontWeight:700, marginBottom:4 }}>{p.label} ·</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:19.5, fontWeight:700,
                    color:"#fff", lineHeight:1.2, letterSpacing:-0.3 }}>{p.title}</h3>
                </div>

                <div style={{ height:1.5, background:`linear-gradient(to right,${p.accent}66,transparent)`, borderRadius:1 }}/>

                {/* Items */}
                <div style={{ display:"flex", flexDirection:"column", gap:9, flex:1 }}>
                  {p.items.map((it, j) => (
                    <div key={j} style={{
                      padding:"11px 13px",
                      background: isHov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.07)", borderRadius:10,
                      opacity:phase>=4?1:0,
                      transform:phase>=4?"translateY(0)":"translateY(14px)",
                      transition:`all 0.5s ease ${0.3+i*0.1+j*0.1}s`,
                    }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700,
                        color:p.accent, marginBottom:4 }}>{it.tag}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5, lineHeight:1.55,
                        color:"rgba(255,255,255,0.55)", fontWeight:300 }}>{it.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {isHov && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                background:`linear-gradient(to right,transparent,${p.accent},transparent)` }}/>}
              <div style={{ position:"absolute", bottom:-10, right:8, fontFamily:"'Playfair Display',serif",
                fontSize:110, fontWeight:900, color:"rgba(255,255,255,0.023)", lineHeight:1,
                pointerEvents:"none", userSelect:"none" }}>{p.label}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding:"0 72px 18px", display:"flex", alignItems:"center", gap:12, zIndex:2,
        opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.3s" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:12.5,
          color:`rgba(45,138,45,0.5)5)`, letterSpacing:3, textTransform:"uppercase" }}>
          Dabur India Ltd. · Strategic Convergence · Global FMCG
        </span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
      </div>

      {/* Gold corner brackets */}
      {[
        { top:18, left:18,   borderTop:`2px solid ${DAB_GOLD}55`, borderLeft:`2px solid ${DAB_GOLD}55` },
        { top:18, right:18,  borderTop:`2px solid ${DAB_GOLD}55`, borderRight:`2px solid ${DAB_GOLD}55` },
        { bottom:18, left:18,  borderBottom:`2px solid ${DAB_GOLD}55`, borderLeft:`2px solid ${DAB_GOLD}55` },
        { bottom:18, right:18, borderBottom:`2px solid ${DAB_GOLD}55`, borderRight:`2px solid ${DAB_GOLD}55` },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20,
          opacity:phase>=5?0.8:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 11 — DABUR CASE STUDY: PROJECT LAKSHYA
═══════════════════════════════════════════════════════════════════════════ */
const LAKSHYA_ACTIONS = [
  {
    icon:"🔄", color:DAB_GREEN,   accent:DAB_GOLD,
    title:"Continuous Replenishment System",
    body:"POS data from 6,000+ stockists flows upstream in real time.",
    phase:"Action 01",
  },
  {
    icon:"🚚", color:DAB_SAFFRON,  accent:"#ffcc44",
    title:"Optimised Logistics Network",
    body:"Hub-and-spoke redesign cut last-mile transit by 22%.",
    phase:"Action 02",
  },
  {
    icon:"📡", color:DAB_EMERALD,  accent:"#7ed07e",
    title:"Demand Sensing Technology",
    body:"AI forecasting cut error from 28% to 11%.",
    phase:"Action 03",
  },
];

const LAKSHYA_KPIS = [
  {
    before:"38 days", after:"31 days", label:"Inventory Days",
    icon:"📦", color:DAB_GOLD, pct:82,
    desc:"18% less working capital locked up.",
  },
  {
    before:"78%", after:"93%", label:"Range Availability",
    icon:"✅", color:DAB_EMERALD, pct:93,
    desc:"15pp jump, led by rural markets.",
  },
  {
    before:"82%", after:"95%", label:"OTIF Delivery",
    icon:"🎯", color:DAB_SAFFRON, pct:95,
    desc:"Best-ever OTIF across all SKUs.",
  },
];

function Slide11({ active }) {
  const [phase,   setPhase]   = useState(0);
  const [hov,     setHov]     = useState(null);
  const [kpiHov,  setKpiHov]  = useState(null);
  const [reveal,  setReveal]  = useState(false);

  useEffect(() => {
    if (!active) { setPhase(0); setReveal(false); return; }
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 420),
      setTimeout(() => setPhase(3), 720),
      setTimeout(() => setPhase(4), 1010),
      setTimeout(() => setPhase(5), 1300),
      setTimeout(() => setReveal(true), 1550),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width:"100%", height:"100%",
      background:"linear-gradient(150deg,#060e04 0%,#0e1f0c 55%,#08160a 100%)",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      <Orb style={{ width:620, height:620, background:"rgba(45,138,45,0.1)",   top:-230, right:-190, animation:"rotateSlow 56s linear infinite" }}/>
      <Orb style={{ width:440, height:440, background:"rgba(212,119,10,0.08)", bottom:-160, left:-150, animation:"rotateSlowR 42s linear infinite" }}/>
      <Orb style={{ width:260, height:260, background:"rgba(240,180,41,0.06)", top:"48%",  left:"42%" }}/>

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize:"36px 36px" }}/>

      
      {/* ── TOP-RIGHT COMPANY LOGO ── */}
      

      {/* Shimmer stripe */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:5, zIndex:10,
        background:`linear-gradient(to right,${DAB_GREEN},${DAB_GOLD},${DAB_SAFFRON},${DAB_GOLD},${DAB_GREEN})`,
        backgroundSize:"400% auto", animation:"shimmer 5s linear infinite",
        opacity:phase>=1?1:0, transition:"opacity 0.8s ease" }}/>

      {/* ── HEADER ── */}
      <div style={{ padding:"28px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-24px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)" }}>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:3, height:28, borderRadius:2,
            background:`linear-gradient(to bottom,${DAB_GOLD},rgba(240,180,41,0.1))` }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, letterSpacing:5,
            color:DAB_GOLD, textTransform:"uppercase", fontWeight:600 }}>
            Slide 11 · Dabur · Case Study
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 18px",
              background:"rgba(45,138,45,0.14)", border:`1px solid ${DAB_EMERALD}44`,
              borderRadius:24, marginBottom:10 }}>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700,
                color:DAB_GOLD, letterSpacing:2 }}>PROJECT LAKSHYA</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:900,
              letterSpacing:-1.5, lineHeight:1.08, color:"#fff" }}>
              Supply Chain{" "}
              <span style={{
                backgroundImage:`linear-gradient(90deg,${DAB_EMERALD} 0%,${DAB_GOLD} 35%,${DAB_SAFFRON} 70%,${DAB_GOLD} 100%)`,
                backgroundSize:"600px auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                animation:"shimmer 5s linear infinite", display:"inline-block",
              }}>Transformation</span>
            </h1>
          </div>

          {/* Objective pill */}
          <div style={{ maxWidth:290, padding:"12px 18px",
            background:"rgba(255,255,255,0.05)", border:`1px solid ${DAB_GOLD}33`,
            borderRadius:14, backdropFilter:"blur(8px)",
            opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:3,
              textTransform:"uppercase", color:DAB_GOLD, marginBottom:5, fontWeight:600 }}>Objective</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5,
              color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>
              Improve supply chain efficiency across India's Tier-2 and rural distribution network
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin:"12px 72px 0", height:2, background:"rgba(255,255,255,0.07)", borderRadius:2,
        overflow:"hidden", position:"relative", zIndex:2,
        opacity:phase>=2?1:0, transition:"opacity 0.4s ease" }}>
        {phase>=2 && <div style={{ position:"absolute", inset:0,
          background:`linear-gradient(to right,${DAB_GREEN},${DAB_GOLD} 55%,${DAB_SAFFRON})`,
          transformOrigin:"left center", animation:"lineExpand 0.9s cubic-bezier(.23,1,.32,1) forwards" }}/>}
      </div>

      {/* ── BODY: actions (left) + KPI before/after cards (right) ── */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1.15fr 1fr",
        gap:16, padding:"12px 72px 0", position:"relative", zIndex:2, minHeight:0 }}>

        {/* LEFT — Action cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4,
            textTransform:"uppercase", color:"rgba(255,255,255,0.3)", flexShrink:0,
            opacity:phase>=2?1:0, transition:"opacity 0.5s ease" }}>Key Actions</div>

          {LAKSHYA_ACTIONS.map((a, i) => {
            const isHov = hov===i;
            return (
              <div key={i}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  display:"flex", gap:14, alignItems:"center",
                  padding:"14px 16px", flex:1,
                  background: isHov ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
                  border:`1.5px solid ${isHov ? a.accent+"88" : "rgba(255,255,255,0.07)"}`,
                  borderRadius:12,
                  boxShadow: isHov ? `0 12px 32px rgba(0,0,0,0.35),0 0 0 1px ${a.accent}22` : "none",
                  backdropFilter:"blur(10px)", cursor:"default",
                  opacity:phase>=3?1:0,
                  transform:phase>=3?"translateX(0)":"translateX(-28px)",
                  transition:`all 0.55s cubic-bezier(.23,1,.32,1) ${i*0.13}s, box-shadow 0.3s ease`,
                }}
              >
                {/* Left accent strip */}
                <div style={{ width:3, borderRadius:2, alignSelf:"stretch", flexShrink:0,
                  background:`linear-gradient(to bottom,${a.accent},${a.accent}22)`,
                  opacity: isHov?1:0.4 }}/>

                {/* Icon */}
                <div style={{ width:44, height:44, borderRadius:11, flexShrink:0,
                  background:`${a.color}22`, border:`1.5px solid ${a.accent}55`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:25.5,
                  animation: isHov ? "floatCard 2s ease-in-out infinite" : "none" }}>{a.icon}</div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:3,
                    textTransform:"uppercase", color:a.accent, fontWeight:700, marginBottom:3 }}>{a.phase}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21.5, fontWeight:700,
                    color:"#fff", marginBottom:4, lineHeight:1.2 }}>{a.title}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, lineHeight:1.5,
                    color:"rgba(255,255,255,0.55)", fontWeight:300 }}>{a.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT — KPI before/after transformation cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:4,
            textTransform:"uppercase", color:"rgba(255,255,255,0.3)", flexShrink:0,
            opacity:phase>=2?1:0, transition:"opacity 0.5s ease 0.1s" }}>Results — Before → After</div>

          {LAKSHYA_KPIS.map((k, i) => {
            const isH = kpiHov===i;
            return (
              <div key={i}
                onMouseEnter={() => setKpiHov(i)}
                onMouseLeave={() => setKpiHov(null)}
                style={{
                  flex:1, padding:"12px 16px", borderRadius:12,
                  background: isH ? `linear-gradient(145deg,${k.color}1e,${k.color}08)` : "rgba(255,255,255,0.04)",
                  border:`1.5px solid ${isH ? k.color+"88" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: isH ? `0 14px 36px rgba(0,0,0,0.35),0 0 0 1px ${k.color}22` : "none",
                  backdropFilter:"blur(8px)", cursor:"default",
                  display:"flex", flexDirection:"column", gap:10,
                  opacity:phase>=4?1:0,
                  transform:phase>=4?"translateX(0)":"translateX(24px)",
                  transition:`all 0.55s cubic-bezier(.23,1,.32,1) ${0.1+i*0.12}s, box-shadow 0.3s ease`,
                }}
              >
                {/* Icon + label row */}
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
                    background:`${k.color}22`, border:`1.5px solid ${k.color}44`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:21.5,
                    animation: isH ? "floatCard 2.4s ease-in-out infinite" : "none" }}>{k.icon}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700,
                    color:"rgba(255,255,255,0.85)" }}>{k.label}</div>
                </div>

                {/* Before → After boxes */}
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ flex:1, textAlign:"center", padding:"6px 8px",
                    background:"rgba(255,255,255,0.04)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:"rgba(255,255,255,0.3)",
                      letterSpacing:2, textTransform:"uppercase", marginBottom:2 }}>Before</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:25.5, fontWeight:700,
                      color:"rgba(255,255,255,0.4)" }}>{k.before}</div>
                  </div>

                  <div style={{ fontSize:21.5, color:"rgba(255,255,255,0.3)", flexShrink:0 }}>→</div>

                  <div style={{ flex:1, textAlign:"center", padding:"6px 8px",
                    background:`${k.color}18`, borderRadius:8,
                    border:`1px solid ${k.color}44` }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:k.color,
                      letterSpacing:2, textTransform:"uppercase", marginBottom:2 }}>After</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:27.5, fontWeight:900,
                      color:k.color }}>{reveal ? k.after : "—"}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height:4, borderRadius:3, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3,
                    background:`linear-gradient(to right,${k.color},${k.color}88)`,
                    width: reveal ? `${k.pct}%` : "0%",
                    transition:"width 1.2s cubic-bezier(.23,1,.32,1)" }}/>
                </div>

                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:k.color,
                  opacity:0.65, lineHeight:1.3 }}>{k.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"10px 72px 14px", display:"flex", alignItems:"center", gap:12, zIndex:2,
        opacity:phase>=5?1:0, transition:"opacity 0.8s ease 0.3s" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:13.5,
          color:`rgba(45,138,45,0.5)`, letterSpacing:3, textTransform:"uppercase" }}>
          Dabur India · Project Lakshya · Strategic Convergence
        </span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
      </div>

      {/* Gold corner brackets */}
      {[
        { top:18, left:18,   borderTop:`2px solid ${DAB_GOLD}55`, borderLeft:`2px solid ${DAB_GOLD}55` },
        { top:18, right:18,  borderTop:`2px solid ${DAB_GOLD}55`, borderRight:`2px solid ${DAB_GOLD}55` },
        { bottom:18, left:18,  borderBottom:`2px solid ${DAB_GOLD}55`, borderLeft:`2px solid ${DAB_GOLD}55` },
        { bottom:18, right:18, borderBottom:`2px solid ${DAB_GOLD}55`, borderRight:`2px solid ${DAB_GOLD}55` },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:30, height:30, zIndex:20,
          opacity:phase>=5?0.8:0, transition:`opacity 0.5s ease ${i*0.07}s`, ...s }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 12 — KEY INDUSTRY INSIGHTS
   Returns to warm ivory theme — all 4 company colours woven together
═══════════════════════════════════════════════════════════════════════════ */
const INSIGHTS = [
  {
    num:"01", icon:"🌍", color:"#2d7d46", accent:"#5cb87a",
    title:"ESG is Becoming \"Glocal\"",
    sub:"Global Sustainability × Local Execution",
    body:"Global targets, local delivery. Dabur farms, Nestlé AAA, Reckitt DBSI — all prove it.",
    tag:"Macro Trend 01",
  },
  {
    num:"02", icon:"🤖", color:"#0077b6", accent:"#4db8f0",
    title:"Digital Intelligence Transforms Decisions",
    sub:"AI · Predictive Analytics · Digital Twins",
    body:"Nestlé's Joule AI + Marico's Sprinklr shift firms from reactive reporting to proactive sensing.",
    tag:"Macro Trend 02",
  },
  {
    num:"03", icon:"🧬", color:"#9b59b6", accent:"#c39bd3",
    title:"Culture is a Strategic Asset",
    sub:"Measured with the Rigour of Finance",
    body:"Marico's 82/100 Index, Reckitt's Four Cs, Dabur's 9-box — culture is now measured, not assumed.",
    tag:"Macro Trend 03",
  },
  {
    num:"04", icon:"💰", color:"#b4641e", accent:"#e8850a",
    title:"Sustainability Drives Financial Returns",
    sub:"Risk Reduction = Profitability",
    body:"Reckitt 200bps, Dabur ₹86 Cr savings, Nestlé CSV — sustainability is a profit lever.",
    tag:"Macro Trend 04",
  },
];

function Slide12({ active }) {
  const [phase, setPhase] = useState(0);
  const [hov,   setHov]   = useState(null);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(() => setPhase(1), 120),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 820),
      setTimeout(() => setPhase(4), 1100),
      setTimeout(() => setPhase(5), 1380),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width:"100%", height:"100%", background:"#f5f3ef",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      {/* Warm ambient orbs — all 4 company colours */}
      <Orb style={{ width:600, height:600, background:"rgba(45,125,70,0.07)",   top:-200, left:-160, animation:"rotateSlow 48s linear infinite" }}/>
      <Orb style={{ width:480, height:480, background:"rgba(180,100,30,0.07)",  bottom:-160, right:-140, animation:"rotateSlowR 36s linear infinite" }}/>
      <Orb style={{ width:320, height:320, background:"rgba(0,119,182,0.05)",   top:"38%", left:"46%" }}/>
      <Orb style={{ width:220, height:220, background:"rgba(155,89,182,0.05)",  bottom:"22%", left:"18%" }}/>

      {/* Subtle warm paper texture */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(180,100,30,0.04) 1px, transparent 1px)",
        backgroundSize:"44px 44px" }}/>

      <DotGrid visible={phase>=5} color="#b4641e" cols={8} rows={4}/>

      {/* ── HEADER ── */}
      <div style={{
        padding:"30px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-22px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)",
      }}>
        <SlideEyebrow text="Slide 12 · Key Industry Insights · Analysis" visible={phase>=1}/>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:46, fontWeight:900,
              letterSpacing:-1.5, lineHeight:1.08, color:"#1a1a1a" }}>
              Four{" "}<ShimmerText>Macro Trends</ShimmerText>{" "}Reshaping FMCG
            </h1>
          </div>
          {/* Four company colour dots */}
          <div style={{ display:"flex", gap:10, paddingBottom:6,
            opacity:phase>=2?1:0, transition:"opacity 0.6s ease 0.3s" }}>
            {[{name:"Dabur",c:"#2d7d46"},{name:"Marico",c:"#d0021b"},{name:"Reckitt",c:"#003087"},{name:"Nestlé",c:"#1b3a4b"}].map(b=>(
              <div key={b.name} style={{ padding:"5px 14px", background:"#fff",
                border:`2px solid ${b.c}44`, borderRadius:20,
                fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:700, color:b.c,
                boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>{b.name}</div>
            ))}
          </div>
        </div>
      </div>

      <HeaderRule visible={phase>=2}/>

      {/* ── INSIGHTS — 2×2 magazine-style layout ── */}
      {/* Top row: insight 1 (wide) | insight 2 (narrow) */}
      {/* Bottom row: insight 3 (narrow) | insight 4 (wide) — Z-diagonal weight */}
      <div style={{
        flex:1, display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gridTemplateRows:"1fr 1fr",
        gap:16, padding:"16px 72px 20px",
        position:"relative", zIndex:2,
      }}>
        {INSIGHTS.map((ins, i) => {
          const isHov = hov===i;
          return (
            <div key={i} className="quad-card"
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: isHov ? "#fff" : `${ins.color}09`,
                border:`2px solid ${isHov ? ins.accent+"88" : ins.color+"28"}`,
                borderRadius:18, padding:"0",
                boxShadow: isHov ? `0 24px 60px rgba(0,0,0,0.1),0 0 0 1px ${ins.accent}22` : "0 4px 18px rgba(0,0,0,0.06)",
                cursor:"default",
                opacity:phase>=3?1:0,
                animation:phase>=3?`fadeScaleIn 0.65s cubic-bezier(.23,1,.32,1) ${i*0.13}s both`:"none",
                display:"flex", overflow:"hidden", position:"relative",
              }}
            >
              {/* Left colour bar */}
              <div style={{ width:6, flexShrink:0, background:`linear-gradient(to bottom,${ins.accent},${ins.color}44)`, borderRadius:"18px 0 0 18px" }}/>

              <div style={{ flex:1, display:"flex", padding:"20px 22px 18px", gap:16 }}>
                {/* Icon block */}
                <div style={{ flexShrink:0 }}>
                  <div style={{ width:54, height:54, borderRadius:14,
                    background:`${ins.color}14`, border:`2px solid ${ins.color}33`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:23.5,
                    animation: isHov ? "floatCard 2.2s ease-in-out infinite" : "none",
                    transition:"box-shadow 0.3s ease",
                    boxShadow: isHov ? `0 8px 24px ${ins.accent}44` : "none",
                  }}>{ins.icon}</div>

                  {/* Number watermark below icon */}
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900,
                    color:ins.color, opacity:0.1, lineHeight:1, textAlign:"center",
                    marginTop:4, userSelect:"none" }}>{ins.num}</div>
                </div>

                {/* Content */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                  {/* Tag */}
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:3.5,
                      textTransform:"uppercase", color:ins.accent, fontWeight:700 }}>{ins.tag}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:23.5, fontWeight:700,
                    color:"#1a1a1a", lineHeight:1.2, letterSpacing:-0.3, margin:0 }}>{ins.title}</h3>

                  {/* Sub-headline */}
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:600,
                    color:ins.accent, letterSpacing:0.3 }}>{ins.sub}</div>

                  {/* Divider */}
                  <div style={{ height:1.5, background:`linear-gradient(to right,${ins.accent}66,transparent)`, borderRadius:1 }}/>

                  {/* Body */}
                  <p style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:16.5, lineHeight:1.65,
                    color:"#5a4f48", fontWeight:300, margin:0, flex:1,
                    opacity:phase>=4?1:0, transform:phase>=4?"translateY(0)":"translateY(8px)",
                    transition:`all 0.5s ease ${0.3+i*0.1}s`,
                  }}>{ins.body}</p>
                </div>
              </div>

              {isHov && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                background:`linear-gradient(to right,transparent,${ins.accent},transparent)` }}/>}
            </div>
          );
        })}
      </div>

      <FooterRule visible={phase>=5}/>
      <CornerBrackets visible={phase>=5}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 13 — FUTURE OF FMCG MANAGEMENT (CONCLUSION)
═══════════════════════════════════════════════════════════════════════════ */
const CONCLUSION_COMPANIES = [
  {
    name:"Dabur",   icon:"🌿", color:"#2d7d46", accent:"#5cb87a",
    label:"Heritage Modernizer",
    trait:"Heritage modernization through operational excellence",
    desc:"Ancient wisdom + modern supply chain = one edge.",
  },
  {
    name:"Marico",  icon:"📱", color:"#d0021b", accent:"#ff6b6b",
    label:"Agile Challenger",
    trait:"Digital agility supported by progressive culture",
    desc:"Digital speed and inclusive culture reinforce each other.",
  },
  {
    name:"Reckitt", icon:"🛡️", color:"#003087", accent:"#4d9de0",
    label:"Purpose-Led Giant",
    trait:"Purpose-driven brand leadership",
    desc:"A clear social purpose builds brands that command premiums.",
  },
  {
    name:"Nestlé",  icon:"🌐", color:"#1b3a4b", accent:"#4db8b8",
    label:"Global Standard",
    trait:"Global scale powered by sustainability & digitalization",
    desc:"At global scale, business and society's interests converge.",
  },
];

const FUTURE_PILLARS = [
  { icon:"🧭", label:"Strategy",      color:"#b4641e" },
  { icon:"♻️", label:"Sustainability", color:"#2d7d46" },
  { icon:"💡", label:"Technology",     color:"#0077b6" },
  { icon:"🌟", label:"People",         color:"#9b59b6" },
];

function Slide13({ active }) {
  const [phase, setPhase] = useState(0);
  const [hov,   setHov]   = useState(null);
  const [pillarHov, setPillarHov] = useState(null);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(() => setPhase(1), 120),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 820),
      setTimeout(() => setPhase(4), 1100),
      setTimeout(() => setPhase(5), 1380),
      setTimeout(() => setPhase(6), 1650),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{
      width:"100%", height:"100%", background:"#f5f3ef",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      {/* All 4 company orbs simultaneously — visual reunion */}
      <Orb style={{ width:500, height:500, background:"rgba(45,125,70,0.07)",  top:-160, left:-140, animation:"rotateSlow 44s linear infinite" }}/>
      <Orb style={{ width:420, height:420, background:"rgba(208,2,27,0.06)",   bottom:-140, right:-120, animation:"rotateSlowR 34s linear infinite" }}/>
      <Orb style={{ width:300, height:300, background:"rgba(0,48,135,0.05)",   top:"40%", right:"20%" }}/>
      <Orb style={{ width:240, height:240, background:"rgba(27,58,75,0.05)",   bottom:"28%", left:"28%" }}/>

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(180,100,30,0.04) 1px, transparent 1px)",
        backgroundSize:"44px 44px" }}/>

      <DotGrid visible={phase>=6} color="#b4641e" cols={9} rows={5}/>

      {/* ── HEADER ── */}
      <div style={{
        padding:"28px 72px 0", position:"relative", zIndex:2,
        opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-22px)",
        transition:"all 0.8s cubic-bezier(.23,1,.32,1)",
      }}>
        <SlideEyebrow text="Slide 13 · Conclusion · Future of FMCG Management" visible={phase>=1}/>

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:40 }}>
          <div style={{ flex:1 }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900,
              letterSpacing:-1.5, lineHeight:1.08, color:"#1a1a1a" }}>
              The{" "}<ShimmerText>Integrative</ShimmerText>{" "}Manager
            </h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5, lineHeight:1.65,
              color:"#6b6055", maxWidth:520, marginTop:10, fontWeight:300 }}>
              Four companies. One trajectory. Future FMCG leadership demands mastery across{" "}
              <strong style={{ color:"#3a3330", fontWeight:600 }}>strategy, sustainability, technology and people</strong>{" "}—
              simultaneously, not sequentially.
            </p>
          </div>

          {/* 4-pillar convergence badge */}
          <div style={{ flexShrink:0, opacity:phase>=2?1:0, transition:"opacity 0.7s ease 0.3s" }}>
            <div style={{ position:"relative", width:130, height:130 }}>
              {/* Centre circle */}
              <div style={{ position:"absolute", top:"50%", left:"50%",
                transform:"translate(-50%,-50%)",
                width:52, height:52, borderRadius:"50%",
                background:"linear-gradient(135deg,#b4641e,#e76f51)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:21.5, zIndex:2,
                boxShadow:"0 6px 24px rgba(180,100,30,0.4)",
                animation:"glowPulse 3s ease-in-out infinite",
              }}>✦</div>

              {/* 4 quadrant icons */}
              {FUTURE_PILLARS.map((fp, i) => {
                const positions = [
                  { top:0, left:0 }, { top:0, right:0 },
                  { bottom:0, left:0 }, { bottom:0, right:0 },
                ];
                return (
                  <div key={i} style={{ position:"absolute", ...positions[i],
                    width:48, height:48, borderRadius:12,
                    background:`${fp.color}18`, border:`2px solid ${fp.color}44`,
                    display:"flex", flexDirection:"column", alignItems:"center",
                    justifyContent:"center", gap:2,
                    animation:`floatCard ${2.2+i*0.3}s ease-in-out ${i*0.4}s infinite`,
                  }}>
                    <span style={{ fontSize:19.5 }}>{fp.icon}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                      color:fp.color, fontWeight:700, letterSpacing:0.5,
                      textTransform:"uppercase" }}>{fp.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <HeaderRule visible={phase>=2}/>

      {/* ── BODY: company trajectory cards (top) + key insight banner (bottom) ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column",
        gap:14, padding:"14px 72px 0", position:"relative", zIndex:2 }}>

        {/* 4 company trajectory cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, flex:1 }}>
          {CONCLUSION_COMPANIES.map((c, i) => {
            const isHov = hov===i;
            return (
              <div key={i} className="company-card"
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: isHov ? "#fff" : `${c.color}08`,
                  border:`2px solid ${isHov ? c.accent+"88" : c.color+"28"}`,
                  borderRadius:16,
                  boxShadow: isHov ? `0 22px 56px rgba(0,0,0,0.1),0 0 0 1px ${c.accent}22` : "0 4px 16px rgba(0,0,0,0.06)",
                  cursor:"default", display:"flex", flexDirection:"column",
                  position:"relative", overflow:"hidden",
                  opacity:phase>=3?1:0,
                  animation:phase>=3?`scaleIn 0.62s cubic-bezier(.23,1,.32,1) ${i*0.13}s both`:"none",
                }}
              >
                {/* Animated top bar */}
                <div style={{ height:4, overflow:"hidden", position:"relative", borderRadius:"16px 16px 0 0" }}>
                  {phase>=3 && <div style={{ position:"absolute", inset:0,
                    background:`linear-gradient(to right,${c.color},${c.accent})`,
                    animation:`barGrow 0.8s cubic-bezier(.23,1,.32,1) ${i*0.13+0.2}s both` }}/>}
                </div>

                <div style={{ flex:1, padding:"18px 18px 14px", display:"flex", flexDirection:"column", gap:10 }}>
                  {/* Icon + name */}
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:46, height:46, borderRadius:12,
                      background:`${c.color}14`, border:`2px solid ${c.color}33`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:23.5,
                      animation: isHov ? "floatCard 2s ease-in-out infinite" : "none",
                      boxShadow: isHov ? `0 6px 20px ${c.accent}44` : "none",
                      flexShrink:0, transition:"box-shadow 0.3s ease" }}>{c.icon}</div>
                    <div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:3.5,
                        textTransform:"uppercase", color:c.accent, fontWeight:700, marginBottom:2 }}>{c.label}</div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21.5, fontWeight:900,
                        color:"#1a1a1a", lineHeight:1 }}>{c.name}</div>
                    </div>
                  </div>

                  <div style={{ height:1.5, background:`linear-gradient(to right,${c.accent}66,transparent)`, borderRadius:1 }}/>

                  {/* Trajectory statement */}
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700,
                    color:c.color, lineHeight:1.4 }}>{c.trait}</div>

                  <p style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:17.5, lineHeight:1.6,
                    color:"#6b6055", fontWeight:300, flex:1, margin:0,
                    opacity:phase>=4?1:0, transform:phase>=4?"translateY(0)":"translateY(8px)",
                    transition:`all 0.5s ease ${0.3+i*0.1}s`,
                  }}>{c.desc}</p>
                </div>

                {isHov && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                  background:`linear-gradient(to right,transparent,${c.accent},transparent)` }}/>}
              </div>
            );
          })}
        </div>

        {/* ── KEY INSIGHT BANNER ── */}
        <div style={{
          padding:"18px 28px",
          background:"linear-gradient(135deg,rgba(180,100,30,0.08),rgba(45,125,70,0.06))",
          border:"2px solid rgba(180,100,30,0.2)",
          borderRadius:16,
          display:"flex", alignItems:"center", gap:22,
          opacity:phase>=5?1:0,
          transform:phase>=5?"translateY(0)":"translateY(20px)",
          transition:"all 0.7s cubic-bezier(.23,1,.32,1) 0.1s",
          backdropFilter:"blur(8px)",
        }}>
          {/* Key insight icon cluster */}
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            {FUTURE_PILLARS.map((fp, i) => (
              <div key={i}
                onMouseEnter={() => setPillarHov(i)}
                onMouseLeave={() => setPillarHov(null)}
                style={{ width:40, height:40, borderRadius:10,
                  background: pillarHov===i ? `${fp.color}22` : `${fp.color}12`,
                  border:`1.5px solid ${pillarHov===i ? fp.color+"66" : fp.color+"33"}`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:21.5,
                  transition:"all 0.25s ease", cursor:"default",
                  transform: pillarHov===i ? "scale(1.18)" : "scale(1)",
                }}>{fp.icon}</div>
            ))}
          </div>

          <div style={{ width:2, height:44, background:"rgba(180,100,30,0.2)", borderRadius:1, flexShrink:0 }}/>

          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:4,
              textTransform:"uppercase", color:"#b4641e", marginBottom:6, fontWeight:700 }}>
              Key Insight
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:17.5, fontStyle:"italic",
              color:"#1a1a1a", lineHeight:1.55, margin:0, fontWeight:400 }}>
              Future FMCG leaders must master{" "}
              <span style={{ fontWeight:700, color:"#b4641e" }}>strategy, sustainability, technology and people</span>
              {" "}—{" "}
              <span style={{ fontWeight:700, color:"#2d7d46" }}>not in silos, but as one integrated capability</span>.
            </p>
          </div>

          {/* Systemic intelligence label */}
          <div style={{ flexShrink:0, textAlign:"right" }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, letterSpacing:3,
              textTransform:"uppercase", color:"#9e8e82", marginBottom:4 }}>Era of the</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17.5, fontWeight:700,
              color:"#b4641e", lineHeight:1.1 }}>Integrative<br/>Manager</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"10px 72px 14px", display:"flex", alignItems:"center", gap:12, zIndex:2,
        opacity:phase>=6?1:0, transition:"opacity 0.8s ease 0.2s" }}>
        <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.08)" }}/>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:12.5, color:"#c0b0a4",
          letterSpacing:3, textTransform:"uppercase" }}>
          Strategic Convergence · Global FMCG · SDMIMD
        </span>
        <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.08)" }}/>
      </div>

      <CornerBrackets visible={phase>=6}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE 14 — THANK YOU
═══════════════════════════════════════════════════════════════════════════ */
function Slide14({ active }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 900),
      setTimeout(() => setPhase(4), 1300),
      setTimeout(() => setPhase(5), 1700),
    ];
    return () => t.forEach(clearTimeout);
  }, [active]);

  const companies = [
    { name:"Nestlé",  color:"#c9a84c", logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJP3CUB-TxSeysL1z-Ux5t5GZSnQSj1QRFmA&s" },
    { name:"Marico",  color:"#ff6b6b", logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcORqLcrh_3ZRjtYRiG6kWWqJp-pByc1o_mQ&s" },
    { name:"Reckitt", color:"#4d9de0", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Reckitt_logo.svg/1280px-Reckitt_logo.svg.png" },
    { name:"Dabur",   color:"#f0b429", logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQZvzfbc3Rj0T78YN8TrmafAOPBQYOol_bRw&s" },
  ];

  return (
    <div style={{
      width:"100%", height:"100%",
      background:"linear-gradient(135deg,#0a0a0f 0%,#111018 40%,#0d0f1a 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden",
    }}>

      {/* ── Ambient orbs ── */}
      <Orb style={{ width:700, height:700, background:"rgba(180,100,30,0.07)",  top:-280, left:-200,  animation:"rotateSlow 70s linear infinite" }}/>
      <Orb style={{ width:600, height:600, background:"rgba(45,125,70,0.06)",   bottom:-250, right:-200, animation:"rotateSlowR 60s linear infinite" }}/>
      <Orb style={{ width:400, height:400, background:"rgba(201,168,76,0.05)",  top:"40%", left:"45%", animation:"rotateSlow 80s linear infinite" }}/>

      {/* Dot grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)",
        backgroundSize:"40px 40px" }}/>

      {/* Top shimmer stripe */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:4, zIndex:10,
        background:"linear-gradient(to right,#b4641e,#c9a84c,#2d7d46,#4d9de0,#ff6b6b,#c9a84c,#b4641e)",
        backgroundSize:"600% auto", animation:"shimmer 6s linear infinite",
        opacity:phase>=1?1:0, transition:"opacity 1s ease",
      }}/>

      {/* ── MAIN CONTENT ── */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", zIndex:2, textAlign:"center" }}>

        {/* Top label */}
        <div style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:13.5, letterSpacing:6,
          textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:28,
          opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(-16px)",
          transition:"all 0.8s cubic-bezier(.23,1,.32,1)",
        }}>
          SDMIMD · Section D · Strategic Convergence
        </div>

        {/* THANK YOU */}
        <div style={{
          opacity:phase>=2?1:0,
          transform:phase>=2?"scale(1)":"scale(0.88)",
          transition:"all 1s cubic-bezier(.23,1,.32,1) 0.1s",
          marginBottom:16,
        }}>
          <h1 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:88, fontWeight:900, lineHeight:1,
            letterSpacing:-3,
            backgroundImage:"linear-gradient(120deg,#c9a84c 0%,#f0de8a 30%,#ffffff 50%,#f0de8a 70%,#c9a84c 100%)",
            backgroundSize:"400% auto",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            animation:"shimmer 5s linear infinite",
          }}>Thank You</h1>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily:"'Playfair Display',serif", fontSize:21.5, fontStyle:"italic",
          color:"rgba(255,255,255,0.55)", lineHeight:1.6, maxWidth:560, marginBottom:52,
          opacity:phase>=3?1:0, transform:phase>=3?"translateY(0)":"translateY(12px)",
          transition:"all 0.8s cubic-bezier(.23,1,.32,1) 0.2s",
        }}>
          Strategic Convergence in the Global FMCG Sector —<br/>
          A comparative study across four industry titans
        </p>

        {/* Divider */}
        <div style={{
          width:phase>=3?320:0, height:1.5, borderRadius:2, marginBottom:48,
          background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)",
          transition:"width 1s cubic-bezier(.23,1,.32,1) 0.4s",
        }}/>

        {/* Company logos row */}
        <div style={{
          display:"flex", alignItems:"center", gap:24,
          opacity:phase>=4?1:0,
          transform:phase>=4?"translateY(0)":"translateY(20px)",
          transition:"all 0.8s cubic-bezier(.23,1,.32,1) 0.3s",
          marginBottom:56,
        }}>
          {companies.map((c, i) => (
            <div key={i} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:10,
              opacity:phase>=4?1:0,
              transform:phase>=4?"translateY(0)":"translateY(24px)",
              transition:`all 0.7s cubic-bezier(.23,1,.32,1) ${0.35+i*0.1}s`,
            }}>
              <div style={{
                width:140, height:70, borderRadius:10, overflow:"hidden",
                background:"rgba(255,255,255,0.92)",
                border:`1.5px solid ${c.color}44`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 4px 20px ${c.color}22`,
                padding:"4px 8px",
              }}>
                <img src={c.logo} alt={c.name}
                  style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
              </div>
              <span style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:12.5, letterSpacing:3,
                textTransform:"uppercase", color:c.color, fontWeight:600,
              }}>{c.name}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Corner brackets */}
      {[
        { top:18, left:18,   borderTop:"2px solid rgba(201,168,76,0.3)", borderLeft:"2px solid rgba(201,168,76,0.3)" },
        { top:18, right:18,  borderTop:"2px solid rgba(201,168,76,0.3)", borderRight:"2px solid rgba(201,168,76,0.3)" },
        { bottom:18, left:18,  borderBottom:"2px solid rgba(201,168,76,0.3)", borderLeft:"2px solid rgba(201,168,76,0.3)" },
        { bottom:18, right:18, borderBottom:"2px solid rgba(201,168,76,0.3)", borderRight:"2px solid rgba(201,168,76,0.3)" },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:36, height:36, zIndex:20,
          opacity:phase>=5?0.9:0, transition:`opacity 0.6s ease ${i*0.08}s`, ...s }}/>
      ))}

      {/* Bottom shimmer stripe */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:4, zIndex:10,
        background:"linear-gradient(to right,#b4641e,#c9a84c,#2d7d46,#4d9de0,#ff6b6b,#c9a84c,#b4641e)",
        backgroundSize:"600% auto", animation:"shimmer 6s linear infinite",
        opacity:phase>=1?1:0, transition:"opacity 1s ease",
      }}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDE REGISTRY
═══════════════════════════════════════════════════════════════════════════ */
const SLIDES = [
  { id:0,  title:"Introduction",              label:"01", Component:Slide1,  accentColor:"#b4641e",   canvasBg:"#ece9e3",  dark:false },
  { id:1,  title:"Project Overview",          label:"02", Component:Slide2,  accentColor:"#2d7d46",   canvasBg:"#ece9e3",  dark:false },
  { id:2,  title:"Company Introductions",     label:"03", Component:Slide3,  accentColor:"#0077b6",   canvasBg:"#ece9e3",  dark:false },
  { id:3,  title:"Nestlé Frameworks",         label:"04", Component:Slide4,  accentColor:NESTLE_GOLD, canvasBg:"#0d1f2d",  dark:true  },
  { id:4,  title:"Nestlé Case Study",         label:"05", Component:Slide5,  accentColor:NESTLE_TEAL, canvasBg:"#0a1c2b",  dark:true  },
  { id:5,  title:"Marico Frameworks",         label:"06", Component:Slide6,  accentColor:MARICO_RED,  canvasBg:MARICO_CANVAS, dark:true },
  { id:6,  title:"Marico Case Study",         label:"07", Component:Slide7,  accentColor:MARICO_ROSE, canvasBg:"#150104",  dark:true  },
  { id:7,  title:"Reckitt Frameworks",        label:"08", Component:Slide8,  accentColor:RKT_SKY,     canvasBg:RKT_CANVAS, dark:true  },
  { id:8,  title:"Reckitt Case Study",        label:"09", Component:Slide9,  accentColor:RKT_GOLD,    canvasBg:"#000814",  dark:true  },
  { id:9,  title:"Dabur Frameworks",          label:"10", Component:Slide10, accentColor:DAB_GOLD,    canvasBg:DAB_CANVAS, dark:true  },
  { id:10, title:"Dabur Case Study",          label:"11", Component:Slide11, accentColor:DAB_SAFFRON, canvasBg:"#060e04",  dark:true  },
  { id:11, title:"Key Industry Insights",     label:"12", Component:Slide12, accentColor:"#b4641e",   canvasBg:"#ece9e3",  dark:false },
  { id:12, title:"Future of FMCG",            label:"13", Component:Slide13, accentColor:"#2d7d46",   canvasBg:"#ece9e3",  dark:false },
  { id:13, title:"Thank You",                 label:"14", Component:Slide14, accentColor:"#c9a84c",   canvasBg:"#0a0a0f",  dark:true  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PREZI SHELL
═══════════════════════════════════════════════════════════════════════════ */
const SLIDE_W = 1440;
const SLIDE_H = 860;
const GAP     = 320;

function getSlidePos(index) {
  const patterns = [
    { x:0,                   y:0    },
    { x:SLIDE_W + GAP,       y:-100 },
    { x:2*(SLIDE_W + GAP),   y:60   },
    { x:3*(SLIDE_W + GAP),   y:-80  },
    { x:4*(SLIDE_W + GAP),   y:40   },
    { x:5*(SLIDE_W + GAP),   y:-60  },
    { x:6*(SLIDE_W + GAP),   y:80   },
    { x:7*(SLIDE_W + GAP),   y:-40  },
    { x:8*(SLIDE_W + GAP),   y:60   },
    { x:9*(SLIDE_W + GAP),   y:-80  },
    { x:10*(SLIDE_W + GAP),  y:40   },
    { x:11*(SLIDE_W + GAP),  y:-100 },
    { x:12*(SLIDE_W + GAP),  y:0    },
    { x:13*(SLIDE_W + GAP),  y:0    },
  ];
  return patterns[index] || { x:index*(SLIDE_W+GAP), y:0 };
}

function getOverviewCamera(total, vpW, vpH) {
  const positions = Array.from({length:total},(_,i)=>getSlidePos(i));
  const minX = Math.min(...positions.map(p=>p.x));
  const maxX = Math.max(...positions.map(p=>p.x)) + SLIDE_W;
  const minY = Math.min(...positions.map(p=>p.y));
  const maxY = Math.max(...positions.map(p=>p.y)) + SLIDE_H;
  const cx = (minX+maxX)/2, cy = (minY+maxY)/2;
  const scaleX = (vpW*0.88)/(maxX-minX);
  const scaleY = (vpH*0.82)/(maxY-minY);
  return { cx, cy, scale:Math.min(scaleX,scaleY,0.55) };
}

export default function FMCGPresentation() {
  const [current, setCurrent]     = useState(0);
  const [overview, setOverview]   = useState(false);
  const [transitioning, setTrans] = useState(false);
  const vpRef = useRef(null);

  const vw = typeof window!=="undefined"?window.innerWidth:1440;
  const vh = typeof window!=="undefined"?window.innerHeight:900;

  const goTo = useCallback((idx)=>{
    if (transitioning) return;
    setOverview(false); setTrans(true); setCurrent(idx);
    setTimeout(()=>setTrans(false), 1000);
  },[transitioning]);

  const next = useCallback(()=>{ if(current<SLIDES.length-1) goTo(current+1); },[current,goTo]);
  const prev = useCallback(()=>{ if(current>0) goTo(current-1); },[current,goTo]);

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="ArrowRight"||e.key===" "){ e.preventDefault(); next(); }
      if(e.key==="ArrowLeft"){ e.preventDefault(); prev(); }
      if(e.key==="Escape") setOverview(v=>!v);
      if(e.key>="1"&&e.key<=String(SLIDES.length)) goTo(Number(e.key)-1);
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[next,prev,goTo]);

  let camX, camY, camScale;
  if (overview) {
    const ov=getOverviewCamera(SLIDES.length,vw,vh);
    camX=ov.cx; camY=ov.cy; camScale=ov.scale;
  } else {
    const pos=getSlidePos(current);
    camX=pos.x+SLIDE_W/2; camY=pos.y+SLIDE_H/2;
    camScale=Math.min(vw/SLIDE_W,vh/SLIDE_H)*0.97;
  }

  const tx=vw/2-camX*camScale;
  const ty=vh/2-camY*camScale;
  const accent    = SLIDES[current].accentColor;
  const canvasBg  = SLIDES[current].canvasBg;
  const isDark    = SLIDES[current].dark ?? false;

  return (
    <div ref={vpRef} style={{
      width:"100vw", height:"100vh", overflow:"hidden",
      background: canvasBg,
      transition:"background 1.1s cubic-bezier(.23,1,.32,1)",
      position:"relative", cursor:"default",
    }}>
      <GlobalStyles/>

      {/* ── CANVAS ── */}
      <div className="prezi-canvas" style={{ position:"absolute", top:0, left:0, transform:`translate(${tx}px,${ty}px) scale(${camScale})`, transformOrigin:"0 0" }}>
        {/* Connecting path */}
        <svg style={{ position:"absolute", top:0, left:0, overflow:"visible", pointerEvents:"none" }}>
          {SLIDES.slice(0,-1).map((_,i)=>{
            const a=getSlidePos(i), b=getSlidePos(i+1);
            const mx=(a.x+SLIDE_W/2+b.x+SLIDE_W/2)/2;
            const my=Math.min(a.y,b.y)-140;
            return (
              <path key={i}
                d={`M ${a.x+SLIDE_W/2} ${a.y+SLIDE_H/2} Q ${mx} ${my} ${b.x+SLIDE_W/2} ${b.y+SLIDE_H/2}`}
                fill="none" stroke="rgba(180,100,30,0.18)" strokeWidth={4} strokeDasharray="16 10"
              />
            );
          })}
        </svg>

        {/* Slides */}
        {SLIDES.map((slide,i)=>{
          const pos=getSlidePos(i), isActive=i===current;
          return (
            <div key={slide.id}
              className={overview?"overview-slide":""}
              onClick={()=>overview&&goTo(i)}
              style={{
                position:"absolute", left:pos.x, top:pos.y,
                width:SLIDE_W, height:SLIDE_H,
                borderRadius:22, overflow:"hidden",
                boxShadow:isActive&&!overview
                  ?`0 0 0 4px ${slide.accentColor}88,0 32px 90px rgba(0,0,0,0.2)`
                  :"0 12px 48px rgba(0,0,0,0.13)",
                transition:"box-shadow 0.4s ease",
                cursor:overview?"pointer":"default",
              }}
            >
              <slide.Component active={isActive&&!overview}/>
              {overview&&(
                <div style={{ position:"absolute", top:18, left:24, fontFamily:"'DM Sans',sans-serif", fontSize:33.5, fontWeight:700, color:slide.accentColor, background:"rgba(255,255,255,0.88)", padding:"5px 14px", borderRadius:9, backdropFilter:"blur(8px)" }}>
                  {slide.label} — {slide.title}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── TOP HUD ── */}
      <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 32px", background:`linear-gradient(to bottom,${canvasBg}f5,transparent)`, transition:"background 1.1s cubic-bezier(.23,1,.32,1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${accent},#e76f51)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:33.5, boxShadow:`0 4px 16px ${accent}44` }}>✦</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16.5, fontWeight:700, color:isDark?"#fff":"#1a1a1a", letterSpacing:1, transition:"color 1s ease" }}>FMCG</div>
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {SLIDES.map((s,i)=>(
            <div key={i} className="nav-dot" onClick={()=>goTo(i)} style={{
              width:i===current?32:10, height:10, borderRadius:100,
              background:i===current?accent:(isDark?"rgba(255,255,255,0.25)":"rgba(0,0,0,0.18)"),
              transition:"all 0.35s ease",
            }}/>
          ))}
        </div>

      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", gap:24, padding:"18px 32px", background:`linear-gradient(to top,${canvasBg}f5,transparent)`, transition:"background 1.1s cubic-bezier(.23,1,.32,1)" }}>
        <button className="nav-btn" onClick={prev} disabled={current===0||transitioning} style={{ width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.88)", boxShadow:"0 2px 14px rgba(0,0,0,0.1)", fontSize:33.5, color:"#3a3330" }}>←</button>
        <div style={{ fontFamily:"'Courier New',monospace", fontSize:17.5, color:isDark?"rgba(255,255,255,0.4)":"#9e8e82", letterSpacing:3, minWidth:64, textAlign:"center", transition:"color 1s ease" }}>
          {String(current+1).padStart(2,"0")} / {String(SLIDES.length).padStart(2,"0")}
        </div>
        <button className="nav-btn" onClick={next} disabled={current===SLIDES.length-1||transitioning} style={{ width:48, height:48, borderRadius:"50%", background:current===SLIDES.length-1?"rgba(255,255,255,0.5)":accent, boxShadow:current===SLIDES.length-1?"none":`0 4px 18px ${accent}55`, fontSize:33.5, color:current===SLIDES.length-1?"#9e8e82":"#fff", fontWeight:700 }}>→</button>
      </div>


    </div>
  );
}
