import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

// ── tiny hook: is element in viewport ────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ── animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 60
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── noise texture overlay ─────────────────────────────────────────────────────
const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`

export default function HomePage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    const onMouse = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * 30)
      setMouseY((e.clientY / window.innerHeight - 0.5) * 30)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("mousemove", onMouse)
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse) }
  }, [])

  const features = useInView()
  const stats = useInView()
  const howItWorks = useInView()
  const cta = useInView()

  return (
    <div className="bg-[#080808] min-h-screen overflow-x-hidden" style={{ fontFamily: "'Georgia', serif" }}>
      {/* google fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400&display=swap');
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        .mono { font-family: 'DM Mono', monospace; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideRight { from{width:0} to{width:100%} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }
        .in-view { opacity:0; transform:translateY(24px); transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1); }
        .in-view.visible { opacity:1; transform:translateY(0); }
        .card-hover { transition: transform 0.3s cubic-bezier(.22,1,.36,1), border-color 0.3s; }
        .card-hover:hover { transform: translateY(-4px); border-color: #2a2a2a; }
        .glow { box-shadow: 0 0 80px 0 rgba(255,255,255,0.04); }
        .text-gradient { background: linear-gradient(135deg, #fff 0%, #666 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .marquee-track { display:flex; gap:48px; animation: marquee 20s linear infinite; white-space:nowrap; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .btn-primary { position:relative; overflow:hidden; }
        .btn-primary::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0.1); transform:translateX(-100%); transition:transform 0.3s; }
        .btn-primary:hover::after { transform:translateX(0); }
      `}</style>

      {/* noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025]" style={{ backgroundImage: noiseSvg, backgroundRepeat: "repeat", backgroundSize: "128px" }} />

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-8 py-5 border-b border-white/[0.04]"
        style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-[#080808]" />
          </div>
          <span className="text-white text-sm font-medium tracking-widest mono uppercase">Pollx</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")}
            className="text-[#555] hover:text-white text-sm transition-colors px-4 py-2 mono">
            Sign in
          </button>
          <button onClick={() => navigate("/register")}
            className="btn-primary bg-white text-[#080808] text-sm font-medium px-5 py-2.5 rounded-xl mono tracking-tight hover:bg-[#e5e5e5] transition-colors">
            Get started →
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">

        {/* background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.07]"
            style={{
              background: "radial-gradient(circle, #fff 0%, transparent 70%)",
              transform: `translate(${mouseX * 0.5}px, ${mouseY * 0.5}px)`,
              transition: "transform 0.1s",
              filter: "blur(40px)"
            }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.04]"
            style={{
              background: "radial-gradient(circle, #fff 0%, transparent 70%)",
              transform: `translate(${mouseX * -0.3}px, ${mouseY * -0.3}px)`,
              transition: "transform 0.1s",
              filter: "blur(60px)"
            }} />
        </div>

        {/* grid lines */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }} />

        {/* badge */}
        <div className="fade-up fade-up-1 flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-8 mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#666] text-xs tracking-widest uppercase">Real-time · Minimal · Powerful</span>
        </div>

        {/* headline */}
        <h1 className="serif text-center max-w-4xl mb-6" style={{ lineHeight: 1.05 }}>
          <span className="fade-up fade-up-1 block text-white" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            Polls that
          </span>
          <span className="fade-up fade-up-2 block text-gradient italic" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            actually work.
          </span>
        </h1>

        {/* sub */}
        <p className="fade-up fade-up-3 text-[#555] text-center max-w-lg text-lg leading-relaxed mono mb-10" style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300 }}>
          Create polls in seconds. Share a link. Watch responses arrive in real time. No signup required for respondents.
        </p>

        {/* cta buttons */}
        <div className="fade-up fade-up-4 flex items-center gap-3 flex-wrap justify-center mb-16">
          <button onClick={() => navigate("/register")}
            className="btn-primary bg-white text-[#080808] text-sm font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#e5e5e5] transition-colors mono">
            Create your first poll →
          </button>
          <button onClick={() => navigate("/login")}
            className="border border-white/10 text-[#777] hover:text-white text-sm px-7 py-3.5 rounded-2xl hover:border-white/20 transition-all mono">
            Sign in
          </button>
        </div>

        {/* floating poll preview */}
        <div className="fade-up fade-up-4 relative w-full max-w-sm mx-auto"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <div className="glow bg-[#111] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden"
            style={{ animation: "float 6s ease-in-out infinite" }}>
            {/* mock poll card */}
            <div className="flex items-center justify-between mb-4">
              <span className="mono text-[10px] text-[#444] uppercase tracking-widest">Live poll</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="mono text-[10px] text-[#22c55e]">42 responses</span>
              </span>
            </div>
            <p className="text-white text-sm font-medium mb-4 serif">What's your preferred tech stack?</p>
            {[
              { label: "MERN Stack", pct: 48, active: true },
              { label: "Next.js + Postgres", pct: 31, active: false },
              { label: "Django + React", pct: 14, active: false },
              { label: "Spring Boot", pct: 7, active: false },
            ].map((opt, i) => (
              <div key={i} className="mb-2.5 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: opt.active ? "#fff" : "#555" }} className="mono">{opt.label}</span>
                  <span className="mono" style={{ color: opt.active ? "#fff" : "#333" }}>{opt.pct}%</span>
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${opt.pct}%`,
                    background: opt.active ? "linear-gradient(90deg, #ffffff40, #fff)" : "#2a2a2a",
                    transition: "width 1s cubic-bezier(.22,1,.36,1)"
                  }} />
                </div>
              </div>
            ))}
          </div>
          {/* shadow */}
          <div className="absolute -bottom-6 inset-x-8 h-12 blur-2xl opacity-20 bg-white rounded-full" />
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────── */}
      <div className="border-y border-white/[0.04] py-4 overflow-hidden">
        <div className="marquee-track">
          {[...Array(2)].map((_, ri) => (
            ["Real-time updates", "Anonymous voting", "Expiry control", "Analytics dashboard", "Publish results", "Protected routes", "Mandatory questions", "Shareable links"].map((item, i) => (
              <span key={`${ri}-${i}`} className="mono text-[#2a2a2a] text-sm uppercase tracking-widest flex items-center gap-6">
                {item}
                <span className="w-1 h-1 rounded-full bg-[#2a2a2a]" />
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div ref={stats.ref} className={`max-w-4xl mx-auto grid grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden in-view ${stats.inView ? "visible" : ""}`}>
          {[
            { value: 0, suffix: "ms", label: "avg response time", display: "<100ms" },
            { value: 100, suffix: "%", label: "uptime on EC2" },
            { value: 0, suffix: "", label: "signups needed to vote", display: "Zero" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#0d0d0d] px-8 py-10 text-center"
              style={{ transitionDelay: `${i * 0.1}s` }}>
              <p className="serif text-5xl text-white mb-2">
                {stat.display ?? <Counter to={stat.value} suffix={stat.suffix} />}
              </p>
              <p className="mono text-[#444] text-xs uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div ref={features.ref} className="max-w-5xl mx-auto">
          <div className={`mb-14 in-view ${features.inView ? "visible" : ""}`}>
            <p className="mono text-[#333] text-xs uppercase tracking-widest mb-3">What you get</p>
            <h2 className="serif text-white text-5xl">Everything you need,<br /><em>nothing you don't.</em></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "◈",
                title: "Real-time updates",
                desc: "WebSocket-powered live vote counts. Your analytics dashboard updates the instant someone responds — no refresh needed.",
                delay: "0s"
              },
              {
                icon: "◎",
                title: "Anonymous or authenticated",
                desc: "Choose who can respond. Open it up to anyone anonymously, or require sign-in for verified responses.",
                delay: "0.1s"
              },
              {
                icon: "◐",
                title: "Smart expiry",
                desc: "Set a deadline. Polls auto-close when time runs out. Expired polls reject new submissions at the API level.",
                delay: "0.2s"
              },
              {
                icon: "◑",
                title: "Mandatory validation",
                desc: "Mark questions as required. Both frontend and backend enforce mandatory answers — no partial submissions slip through.",
                delay: "0.3s"
              },
              {
                icon: "◉",
                title: "Publish results",
                desc: "When you're done, publish. The same poll link transforms into a public results page anyone can view.",
                delay: "0.4s"
              },
              {
                icon: "◌",
                title: "Deep analytics",
                desc: "Per-question breakdowns, option vote counts, completion rates, and winner highlights — all in one dashboard.",
                delay: "0.5s"
              },
            ].map((f, i) => (
              <div key={i} className={`card-hover bg-[#0d0d0d] border border-white/[0.05] rounded-2xl p-6 in-view ${features.inView ? "visible" : ""}`}
                style={{ transitionDelay: f.delay }}>
                <div className="text-2xl text-[#333] mb-4 mono">{f.icon}</div>
                <h3 className="text-white text-base font-medium mb-2 serif">{f.title}</h3>
                <p className="text-[#444] text-sm leading-relaxed mono" style={{ fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div ref={howItWorks.ref} className="max-w-3xl mx-auto">
          <div className={`mb-14 in-view ${howItWorks.inView ? "visible" : ""}`}>
            <p className="mono text-[#333] text-xs uppercase tracking-widest mb-3">How it works</p>
            <h2 className="serif text-white text-5xl">Three steps.<br /><em>That's it.</em></h2>
          </div>

          <div className="space-y-0">
            {[
              { n: "01", title: "Create your poll", desc: "Add questions, set options, configure expiry and anonymous settings. Done in under a minute." },
              { n: "02", title: "Share the link", desc: "Copy the public poll link and send it anywhere — Slack, email, WhatsApp. No account needed to respond." },
              { n: "03", title: "Watch results live", desc: "Your analytics dashboard updates in real time. Publish when you're ready to make results public." },
            ].map((step, i) => (
              <div key={i}
                className={`flex gap-8 py-8 border-b border-white/[0.04] in-view ${howItWorks.inView ? "visible" : ""}`}
                style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="shrink-0 mono text-[#222] text-6xl font-light leading-none">{step.n}</div>
                <div className="pt-2">
                  <h3 className="text-white serif text-2xl mb-2">{step.title}</h3>
                  <p className="text-[#444] mono text-sm leading-relaxed" style={{ fontWeight: 300 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div ref={cta.ref} className={`max-w-2xl mx-auto text-center in-view ${cta.inView ? "visible" : ""}`}>
          <div className="relative">
            {/* glow bg */}
            <div className="absolute inset-0 blur-3xl opacity-10 rounded-full" style={{ background: "radial-gradient(circle, #fff, transparent)" }} />
            <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-3xl p-12">
              <p className="mono text-[#333] text-xs uppercase tracking-widest mb-4">Ready?</p>
              <h2 className="serif text-white mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}>
                Build your first poll<br /><em>in 60 seconds.</em>
              </h2>
              <p className="mono text-[#444] text-sm mb-8 leading-relaxed" style={{ fontWeight: 300 }}>
                No credit card. No setup. Just create, share, and collect.
              </p>
              <button onClick={() => navigate("/register")}
                className="btn-primary bg-white text-[#080808] text-sm font-semibold px-8 py-4 rounded-2xl hover:bg-[#e5e5e5] transition-colors mono">
                Get started for free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] px-8 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-sm bg-[#080808]" />
          </div>
          <span className="text-[#333] text-xs mono tracking-widest uppercase">Pollx</span>
        </div>
        <p className="mono text-[#222] text-xs">Built for HackWithInfy 2026</p>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/login")} className="mono text-[#333] hover:text-white text-xs transition-colors">Sign in</button>
          <button onClick={() => navigate("/register")} className="mono text-[#333] hover:text-white text-xs transition-colors">Register</button>
        </div>
      </footer>
    </div>
  )
}