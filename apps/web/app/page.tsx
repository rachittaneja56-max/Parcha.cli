"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { 
  Github, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Lock, 
  Check, 
  Menu, 
  X, 
  ArrowRight,
  Terminal as TerminalIcon
} from "lucide-react";
import { trpc } from "~/trpc/client";
import { clearSessionCookie } from "~/app/actions/auth";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: sessionData, isLoading: sessionLoading } = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0 });

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-200 selection:bg-emerald-500/30 antialiased overflow-hidden font-sans">
      {/* Navigation Header */}
      <Navbar 
        sessionData={sessionData} 
        sessionLoading={sessionLoading}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero Section */}
      <Hero sessionData={sessionData} />

      {/* Bento Grid Features */}
      <Features />

      {/* Pricing Section */}
      <Pricing />

      {/* Footer */}
      <Footer />
    </main>
  );
}

// -------------------------------------------------------------
// Component: Navbar
// -------------------------------------------------------------
interface NavbarProps {
  sessionData: any;
  sessionLoading: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

function Navbar({ sessionData, sessionLoading, mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const isLoggedIn = !!sessionData?.user;

  // Logout handler
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await clearSessionCookie();
      await utils.auth.me.invalidate();
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#050505]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded border border-emerald-800 bg-emerald-950/30 flex items-center justify-center text-emerald-400 font-mono text-sm font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:border-emerald-500 transition-all duration-300">
            P
          </div>
          <span className="font-mono text-lg tracking-wider text-white font-bold">PARCHA95</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
          <Link href="#features" className="hover:text-emerald-400 transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link>
          <Link href="/explore" className="hover:text-emerald-400 transition-colors">Explore</Link>
        </nav>

        {/* Auth CTA / Actions */}
        <div className="hidden md:flex items-center gap-6">
          {sessionLoading ? (
            <div className="h-9 w-24 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="bg-emerald-500 text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                  Dashboard
                </button>
              </Link>
              <button 
                onClick={handleLogout} 
                disabled={loggingOut}
                className="text-sm text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register">
                <button className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-zinc-200 transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-zinc-400 hover:text-white p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-zinc-800 bg-[#050505] py-6 px-6 flex flex-col gap-4 text-base"
        >
          <Link 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-emerald-400 py-1 transition-colors"
          >
            Features
          </Link>
          <Link 
            href="#pricing" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-emerald-400 py-1 transition-colors"
          >
            Pricing
          </Link>
          <Link 
            href="/explore" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-emerald-400 py-1 transition-colors"
          >
            Explore
          </Link>
          <hr className="border-zinc-800/80 my-2" />
          {sessionLoading ? (
            <div className="h-10 w-full bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex flex-col gap-3">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full bg-emerald-500 text-black font-semibold rounded-lg py-2.5 text-center text-sm">
                  Dashboard
                </button>
              </Link>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }} 
                disabled={loggingOut}
                className="w-full text-zinc-400 hover:text-white py-2.5 text-center text-sm border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-1.5 font-medium text-center">
                Sign In
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full bg-white text-black font-semibold rounded-lg py-2.5 text-center text-sm">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
}

// -------------------------------------------------------------
// Component: Hero Section with 3D Terminal Form Preview
// -------------------------------------------------------------
function Hero({ sessionData }: { sessionData: any }) {
  const isLoggedIn = !!sessionData?.user;

  // 3D Tilt values using motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-200, 200], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(x, [-200, 200], [-12, 12]), springConfig);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Active theme tab state
  const [activeTheme, setActiveTheme] = useState<"terminal" | "code_editor" | "standard" | "windows_95">("standard");

  const [handle, setHandle] = useState("");
  const [env, setEnv] = useState<"prod" | "stage">("prod");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-typing developer handle on mount
  useEffect(() => {
    setHandle("");
    const defaultText = "rachit";
    let index = 0;
    let interval: NodeJS.Timeout;

    const timer = setTimeout(() => {
      interval = setInterval(() => {
        if (index < defaultText.length) {
          setHandle((prev) => prev + defaultText.charAt(index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 100);
    }, 800);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [activeTheme]); // re-run or type when theme is swapped to make it feel alive

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const resetMockForm = () => {
    setHandle("");
    setEnv("prod");
    setSubmitted(false);
  };

  // Theme-specific UI Configurations
  const themeConfigs = {
    terminal: {
      aura: "bg-emerald-500/15 blur-[100px]",
      container: "bg-[#0A0A0A] border border-zinc-800 rounded-xl shadow-[0_0_60px_rgba(16,185,129,0.1)]",
      title: "Terminal prompt (~/parcha95/demo.sh)"
    },
    code_editor: {
      aura: "bg-blue-500/15 blur-[100px]",
      container: "bg-[#1e1e1e] border border-zinc-800 rounded-xl shadow-[0_0_60px_rgba(59,130,246,0.1)]",
      title: "VS Code Editor (survey.ts)"
    },
    standard: {
      aura: "bg-indigo-500/15 blur-[100px]",
      container: "bg-[#0B0F19] border border-zinc-800 rounded-xl shadow-[0_0_60px_rgba(99,102,241,0.15)]",
      title: "Standard (SaaS Form)"
    },
    windows_95: {
      aura: "bg-amber-500/10 blur-[100px]",
      container: "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-zinc-700 border-b-zinc-700 rounded shadow-2xl p-1",
      title: "Windows 95/XP (Retro Wizard)"
    }
  };

  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 px-6 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Hero Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 flex flex-col gap-6"
        >
          {/* Tagline */}
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 border border-emerald-950/60 bg-emerald-950/20 px-3 py-1.5 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Beautiful Forms Lineup
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-[1.05]">
            Create forms your users will love.
          </h1>
          
          <p className="text-zinc-400 text-lg md:text-xl mt-2 max-w-xl leading-relaxed">
            Drop-dead gorgeous forms in seconds. Highly customizable, blazingly fast, and completely type-safe. Switch themes instantly to match your brand's vibe.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href={isLoggedIn ? "/dashboard" : "/auth/register"}>
              <button className="bg-white text-black font-semibold rounded-lg px-6 py-3 hover:bg-zinc-200 shadow-lg shadow-white/5 transition-all text-base">
                {isLoggedIn ? "Go to Dashboard" : "Start Building for Free"}
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="lg:col-span-6 flex flex-col items-center [perspective:1200px]"
        >
=          <div className="flex flex-wrap gap-2 mb-6 justify-center z-20">
            {[
                { id: "terminal", label: "Terminal (CLI)" },
                { id: "code_editor", label: "VS Code Editor" },
                { id: "standard", label: "Standard" },
                { id: "windows_95", label: "Windows 95" }
              ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setActiveTheme(theme.id as any);
                  resetMockForm();
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold border transition-all ${
                  activeTheme === theme.id 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-[#0A0A0A] border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>

          <div className={`absolute inset-0 ${themeConfigs[activeTheme].aura} rounded-full scale-90 pointer-events-none`} />

          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
              rotateX, 
              rotateY, 
              transformStyle: "preserve-3d" 
            }}
            className={`relative w-full max-w-lg ${themeConfigs[activeTheme].container} overflow-hidden z-10 transition-all duration-300`}
          >


            {activeTheme === "terminal" && (
              <>
                <div className="bg-[#111] px-4 py-3 flex items-center justify-between border-b border-zinc-800/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                  </div>
                  <div className="text-xs font-mono text-zinc-500 tracking-wider">~/parcha95/demo.sh</div>
                  <div className="w-14" />
                </div>

                <form onSubmit={handleSubmit} className="font-mono p-8 space-y-6 text-left">
                  {submitted ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-6">
                      <div className="text-emerald-400 font-bold text-sm">{`[SUCCESS] 201 CREATED`}</div>
                      <div className="text-zinc-400 text-xs leading-relaxed space-y-1">
                        <p className="text-emerald-300/80">{`+ synced handle: "${handle}"`}</p>
                        <p className="text-emerald-300/80">{`+ environment: "${env.toUpperCase()}"`}</p>
                        <p className="text-emerald-300/80">{`+ ping time: 14ms`}</p>
                      </div>
                      <div className="pt-4 border-t border-emerald-950/40">
                        <p className="text-zinc-500 text-xs">{`Press button below to simulate again:`}</p>
                        <button 
                          type="button"
                          onClick={resetMockForm}
                          className="bg-emerald-950/20 border border-emerald-900/50 hover:bg-emerald-950/40 text-emerald-400 px-3 py-1.5 rounded mt-3 text-xs transition-colors"
                        >
                          {`$ re-run demo`}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-emerald-500 text-sm font-semibold tracking-wide">
                          {`> ENTER DEVELOPER HANDLE *`}
                        </label>
                        <div className="relative mt-2 border-b border-emerald-900/50 focus-within:border-emerald-500 transition-colors pb-2">
                          <div className="flex items-center text-emerald-200 text-sm">
                            <span className="text-emerald-500/50 mr-2 select-none">{`$`}</span>
                            <input
                              type="text"
                              value={handle}
                              onChange={(e) => setHandle(e.target.value)}
                              className="bg-transparent border-none outline-none font-mono text-emerald-200 w-full placeholder-emerald-900/40"
                              placeholder="hacker_name"
                              required
                              autoComplete="off"
                            />
                            {handle.length === 0 && (
                              <span className="w-1.5 h-4 bg-emerald-500 animate-pulse ml-0.5" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="block text-emerald-500 text-sm font-semibold tracking-wide">
                          {`> CHOOSE ENVIRONMENT`}
                        </span>
                        <div className="flex items-center gap-6 mt-2 text-sm">
                          <button
                            type="button"
                            onClick={() => setEnv("prod")}
                            className={`flex items-center gap-2 font-mono transition-colors focus:outline-none ${
                              env === "prod" ? "text-emerald-400 font-bold" : "text-zinc-600 hover:text-zinc-400"
                            }`}
                          >
                            <span>{env === "prod" ? "[x]" : "[ ]"}</span> Production
                          </button>
                          <button
                            type="button"
                            onClick={() => setEnv("stage")}
                            className={`flex items-center gap-2 font-mono transition-colors focus:outline-none ${
                              env === "stage" ? "text-emerald-400 font-bold" : "text-zinc-600 hover:text-zinc-400"
                            }`}
                          >
                            <span>{env === "stage" ? "[x]" : "[ ]"}</span> Staging
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-emerald-950/30 border border-emerald-900 text-emerald-400 px-6 py-2.5 rounded font-mono text-xs tracking-wider font-bold transition-all hover:bg-emerald-900/20 hover:text-emerald-300 disabled:opacity-50 cursor-pointer w-full text-center flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                              {`SYNCING_RECORDS...`}
                            </>
                          ) : (
                            <>
                              {`[SUBMIT_REQUEST]`} <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </>
            )}

            {/* -------------------- THEME 2: VS CODE EDITOR -------------------- */}
            {activeTheme === "code_editor" && (
              <>
                {/* VS Code title bar */}
                <div className="bg-[#2d2d2d] h-[35px] border-b border-[#1e1e1e] flex items-center justify-between px-3 text-xs text-[#a3a3a3] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#007acc] text-sm">⎋</span>
                    <span className="truncate text-[11px] text-zinc-300">survey.ts - Visual Studio Code</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-500">v1.95</span>
                  </div>
                </div>

                {/* Main Workspace Layout */}
                <div className="flex flex-1 min-h-[300px]">
                  {/* Left Sidebar Strip */}
                  <div className="w-[45px] bg-[#333333] border-r border-[#191919] flex flex-col items-center py-4 gap-4 text-sm text-[#858585] select-none">
                    <div className="text-white hover:text-white cursor-pointer">📂</div>
                    <div className="hover:text-white cursor-pointer">🔍</div>
                    <div className="hover:text-white cursor-pointer">🌿</div>
                    <div className="hover:text-white cursor-pointer">🐞</div>
                    <div className="hover:text-white cursor-pointer">🧩</div>
                  </div>

                  {/* Active Editor Tab and Code window */}
                  <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="h-[30px] bg-[#2d2d2d] border-b border-[#191919] flex items-center select-none">
                      <div className="bg-[#1e1e1e] px-4 py-1.5 text-[11px] text-white border-t-2 border-t-[#007acc] border-r border-[#252526] flex items-center gap-2 font-mono shrink-0">
                        <span className="text-[#519aba]">ts</span>
                        <span>survey.ts</span>
                        <span className="text-[9px] text-[#858585]">●</span>
                      </div>
                    </div>

                    {/* Editor Form */}
                    <form onSubmit={handleSubmit} className="p-6 font-mono text-[12px] leading-relaxed text-[#dcdcdc] space-y-4 text-left flex-1 flex flex-col justify-between">
                      {submitted ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 py-4">
                          <div className="text-[#6a9955]">{`/**`}</div>
                          <div className="text-[#6a9955]">{` * STATUS: SUCCESS`}</div>
                          <div className="text-[#6a9955]">{` * Response compiled and synced.`}</div>
                          <div className="text-[#6a9955]">{` */`}</div>
                          <div className="text-[#c678dd] font-semibold">
                            <span>{`class `}</span>
                            <span className="text-[#61afef]">{`ResponseRecord`}</span>
                            <span>{` {`}</span>
                          </div>
                          <div className="pl-4 space-y-1">
                            <div><span className="text-[#e5c07b]">handle</span> = <span className="text-[#98c379]">{`"${handle}"`}</span>;</div>
                            <div><span className="text-[#e5c07b]">env</span> = <span className="text-[#98c379]">{`"${env}"`}</span>;</div>
                          </div>
                          <div className="text-[#c678dd]">{`}`}</div>
                          <button 
                            type="button" 
                            onClick={resetMockForm}
                            className="bg-[#333333] hover:bg-[#444] border border-[#555] text-zinc-300 px-3 py-1.5 rounded text-[11px] cursor-pointer mt-4"
                          >
                            {`survey.run()`}
                          </button>
                        </motion.div>
                      ) : (
                        <>
                          <div className="space-y-4 flex-1">
                            {/* Comments block */}
                            <div className="text-[#6a9955] select-none leading-normal">
                              <div>{`/**`}</div>
                              <div>{` * @prompt ENTER DEVELOPER HANDLE *`}</div>
                              <div>{` * @required true`}</div>
                              <div>{` */`}</div>
                            </div>

                            {/* Variable 1 */}
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[#c678dd]">const</span>
                              <span className="text-[#e06c75]">handle</span>
                              <span>:</span>
                              <span className="text-[#519aba]">string</span>
                              <span>=</span>
                              <span className="text-[#98c379]">"</span>
                              <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className="bg-transparent border-none outline-none text-[#98c379] caret-white p-0 m-0 w-32 focus:ring-0 text-[12px] font-mono h-auto"
                                placeholder="developer_id"
                                required
                                autoComplete="off"
                              />
                              <span className="text-[#98c379]">";</span>
                            </div>

                            <div className="text-[#6a9955] select-none leading-normal pt-2">
                              <div>{`/**`}</div>
                              <div>{` * @prompt CHOOSE ENVIRONMENT`}</div>
                              <div>{` */`}</div>
                            </div>

                            {/* Variable 2 Options */}
                            <div className="pl-4 space-y-1 text-[#abb2bf] select-none text-[11px]">
                              <span className="text-[#6a9955]">// Select value:</span>
                              <div className="flex gap-4">
                                <button
                                  type="button"
                                  onClick={() => setEnv("prod")}
                                  className={`flex items-center gap-1.5 focus:outline-none transition-colors ${
                                    env === "prod" ? "text-[#98c379] font-bold" : "text-[#858585] hover:text-[#abb2bf]"
                                  }`}
                                >
                                  <span>{env === "prod" ? "●" : "○"}</span> "Production"
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEnv("stage")}
                                  className={`flex items-center gap-1.5 focus:outline-none transition-colors ${
                                    env === "stage" ? "text-[#98c379] font-bold" : "text-[#858585] hover:text-[#abb2bf]"
                                  }`}
                                >
                                  <span>{env === "stage" ? "●" : "○"}</span> "Staging"
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-4 border-t border-[#2d2d2d] flex justify-between items-center">
                            <span className="text-zinc-500 text-[10px] select-none font-mono">UTF-8 | TypeScript</span>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="bg-[#007acc] text-white hover:bg-[#0062a3] px-4 py-2 rounded text-[11px] font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {submitting ? (
                                <>
                                  <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Compiling...</span>
                                </>
                              ) : (
                                <>
                                  <span>▶</span> Run compiler
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                </div>
              </>
            )}

            {/* -------------------- THEME 3: STANDARD -------------------- */}
            {activeTheme === "standard" && (
              <>
                {/* Browser-like Toolbar */}
                <div className="bg-[#0D1321] px-4 py-3 flex items-center border-b border-zinc-800/80">
                  <div className="flex gap-1.5 mr-4 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <div className="bg-[#1A2333] rounded-md px-3 py-1 flex items-center justify-between text-[10px] text-zinc-500 font-sans w-full select-none">
                    <span className="truncate">localhost:3000/survey/dev-feedback</span>
                    <span className="text-zinc-600">🔒</span>
                  </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="font-sans p-8 space-y-6 text-left">
                  {submitted ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-4 text-center">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                        ✓
                      </div>
                      <h4 className="text-lg font-bold text-white tracking-tight">Response Submitted</h4>
                      <p className="text-zinc-400 text-xs max-w-xs mx-auto leading-relaxed">
                        Your developer handle and environment choice have been saved to Parcha95.
                      </p>
                      <button
                        type="button"
                        onClick={resetMockForm}
                        className="bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-200 text-xs px-4 py-2 rounded-lg mt-2 font-medium transition-colors cursor-pointer"
                      >
                        Submit another response
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-extrabold text-white tracking-tight">Developer Onboarding</h3>
                        <p className="text-zinc-500 text-xs leading-normal">Please input your handle and stage config.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Developer Handle <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          className="w-full bg-[#0D1321] border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-sm text-white transition-all outline-none"
                          placeholder="e.g. rachit taneja"
                          required
                          autoComplete="off"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Choose Environment
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setEnv("prod")}
                            className={`py-2.5 rounded-lg border text-xs font-semibold font-mono tracking-wider transition-all focus:outline-none ${
                              env === "prod"
                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                : "bg-[#0D1321] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                            }`}
                          >
                            PRODUCTION
                          </button>
                          <button
                            type="button"
                            onClick={() => setEnv("stage")}
                            className={`py-2.5 rounded-lg border text-xs font-semibold font-mono tracking-wider transition-all focus:outline-none ${
                              env === "stage"
                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                : "bg-[#0D1321] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                            }`}
                          >
                            STAGING
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold rounded-lg py-3 text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              <span>Saving response...</span>
                            </>
                          ) : (
                            <>
                              <span>Complete Survey</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </>
            )}

            {/* -------------------- THEME 4: WINDOWS 95 RETRO -------------------- */}
            {activeTheme === "windows_95" && (
              <>
                {/* Vintage Blue Title Bar */}
                <div className="bg-[#000080] p-1 flex justify-between items-center select-none font-sans border border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
                  <div className="flex items-center gap-1.5 pl-1">
                    <span className="text-[11px] text-white font-bold tracking-wide">Parcha95 Wizard</span>
                  </div>
                  <button 
                    type="button"
                    onClick={resetMockForm}
                    className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-black border-b-black text-black font-bold text-[9px] flex items-center justify-center focus:outline-none font-sans"
                  >
                    X
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="font-mono p-6 space-y-5 text-left bg-[#c0c0c0] border-2 border-white select-none text-black">
                  {submitted ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-2">
                      <div className="bg-[#808080]/10 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-4 font-mono text-xs leading-relaxed space-y-2">
                        <p className="font-bold text-black">{`[ SUCCESS: RESPONSE_SYNCED ]`}</p>
                        <p className="text-zinc-700">{`* Handle: ${handle}`}</p>
                        <p className="text-zinc-700">{`* Config: ${env.toUpperCase()}`}</p>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={resetMockForm}
                          className="bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-r-black border-b-black active:border-black active:border-r-white active:border-b-white px-5 py-1 text-xs font-bold focus:outline-none"
                        >
                          OK
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="border border-t-black border-l-black border-r-white border-b-white p-3 space-y-1 bg-[#dcdcdc]/40">
                        <p className="text-[11px] font-bold text-black">{`Wizard Session: Setup Survey`}</p>
                        <p className="text-[10px] text-zinc-600 font-sans">{`Please enter required developer fields.`}</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-black">
                          {`Enter Developer Handle (*):`}
                        </label>
                        <div className="bg-white border-2 border-t-zinc-800 border-l-zinc-800 border-r-white border-b-white p-1">
                          <input
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="bg-transparent border-none outline-none font-mono text-xs text-black w-full"
                            placeholder="handle"
                            required
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-black">
                          {`Choose Target Environment:`}
                        </label>
                        <div className="flex gap-6 pl-1">
                          <button
                            type="button"
                            onClick={() => setEnv("prod")}
                            className="flex items-center gap-2 focus:outline-none text-[11px] font-bold text-black"
                          >
                            <span className="w-4 h-4 bg-white border-2 border-t-zinc-800 border-l-zinc-800 border-r-white border-b-white flex items-center justify-center font-bold text-[9px] text-black select-none">
                              {env === "prod" && "■"}
                            </span>
                            Production
                          </button>
                          <button
                            type="button"
                            onClick={() => setEnv("stage")}
                            className="flex items-center gap-2 focus:outline-none text-[11px] font-bold text-black"
                          >
                            <span className="w-4 h-4 bg-white border-2 border-t-zinc-800 border-l-zinc-800 border-r-white border-b-white flex items-center justify-center font-bold text-[9px] text-black select-none">
                              {env === "stage" && "■"}
                            </span>
                            Staging
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons Panel */}
                      <div className="pt-4 border-t border-zinc-500 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setHandle("")}
                          className="bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-r-black border-b-black active:border-black active:border-r-white active:border-b-white px-4 py-1 text-xs font-bold focus:outline-none"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-r-black border-b-black active:border-black active:border-r-white active:border-b-white px-5 py-1 text-xs font-bold focus:outline-none disabled:opacity-50"
                        >
                          {submitting ? "Wait..." : "Submit"}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </>
            )}

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Component: Form Builder Glimpse
// -------------------------------------------------------------
function BuilderGlimpse() {
  return (
    <div className="w-full bg-[#050505] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-zinc-800/80 p-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
        </div>
        <div className="text-xs font-mono text-zinc-500">Form Builder</div>
        <div className="w-12"></div>
      </div>
      
      <div className="flex h-[450px]">
        {/* Left Sidebar: BLOCKS */}
        <div className="w-56 border-r border-zinc-800/80 bg-[#0A0A0A] p-5 flex flex-col gap-4 hidden md:flex">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Blocks</div>
          
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-400 flex items-center gap-3 shadow-sm hover:border-zinc-700 transition-colors cursor-pointer">
            <span className="w-6 h-6 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded text-xs">T</span> 
            <span>Short Text</span>
          </div>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-400 flex items-center gap-3 shadow-sm hover:border-zinc-700 transition-colors cursor-pointer">
            <span className="w-6 h-6 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded text-xs">=</span> 
            <span>Long Text</span>
          </div>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-400 flex items-center gap-3 shadow-sm hover:border-zinc-700 transition-colors cursor-pointer">
            <span className="w-6 h-6 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded text-xs">@</span> 
            <span>Email</span>
          </div>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-400 flex items-center gap-3 shadow-sm hover:border-zinc-700 transition-colors cursor-pointer">
            <span className="w-6 h-6 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded text-xs">✓</span> 
            <span>Multiple Choice</span>
          </div>
        </div>
        
        {/* Center Canvas */}
        <div className="flex-1 bg-[#050505] p-10 relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="max-w-lg mx-auto bg-[#0a0a0a] border border-emerald-900/50 rounded-xl p-8 relative z-10">
            <div className="absolute -left-[1px] -top-3 bg-emerald-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-sm">Active Field</div>
            <h3 className="text-xl font-bold text-white mb-1.5 tracking-tight">Developer Handle</h3>
            <p className="text-zinc-500 text-sm mb-5">Please input your handle</p>
            <div className="w-full h-11 bg-[#050505] border border-zinc-800 rounded-lg"></div>
          </div>
          
          <div className="max-w-lg mx-auto bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-8 mt-6 relative z-10">
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Choose Environment</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="w-full h-11 bg-[#050505] border border-zinc-800/80 rounded-lg"></div>
              <div className="w-full h-11 bg-[#050505] border border-zinc-800/80 rounded-lg"></div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar: FIELD PROPERTIES */}
        <div className="w-72 border-l border-zinc-800/80 bg-[#0A0A0A] p-6 hidden lg:flex flex-col gap-6">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Field Properties</div>
          
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-medium">Label</label>
            <div className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 flex items-center">Developer Handle</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-medium">Required</label>
            <div className="flex items-center gap-3">
              <div className="w-9 h-5 bg-emerald-500 rounded-full relative shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <div className="w-3.5 h-3.5 bg-black rounded-full absolute right-0.5 top-0.5"></div>
              </div>
              <span className="text-sm text-zinc-300">Yes</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-medium">Validation (Zod)</label>
            <div className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2.5 text-sm text-emerald-400 font-mono">z.string().min(3)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Analytics Glimpse
// -------------------------------------------------------------
function AnalyticsGlimpse() {
  return (
    <div className="w-full bg-[#050505] border border-zinc-800/80 rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Command Center</h3>
          <p className="text-sm text-zinc-400 mt-1">Real-time insights on your active forms.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="w-4 h-4 rounded text-zinc-400 bg-zinc-800 flex items-center justify-center">+</span>
          Create Form
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-zinc-400">Total Views</h3>
          <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-100">12,450</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-zinc-400">Total Responses</h3>
          <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-100">5,842</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-zinc-400">Global Conversion</h3>
          <p className="mt-2 text-4xl font-bold tracking-tight text-emerald-400">46.9%</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium text-zinc-100">Recently Active Forms</h2>
        <span className="text-sm text-emerald-400 font-medium">View All Forms &rarr;</span>
      </div>
      
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-base font-medium text-zinc-100">Developer Waitlist 2026</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400 bg-emerald-500/10">
            <span className="w-2 h-2 rounded-full border border-emerald-400"></span> Published
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-mono mt-4">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs">Views</span>
            <span className="text-zinc-300">8,201</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs">Responses</span>
            <span className="text-zinc-300">4,120</span>
          </div>
          <div className="flex flex-col border-l border-zinc-800 pl-6">
            <span className="text-zinc-500 text-xs">Updated</span>
            <span className="text-zinc-300">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Features Section
// -------------------------------------------------------------
function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-[#050505] border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 md:text-center max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 border border-emerald-900/50 bg-emerald-950/20 px-3 py-1 rounded-full w-fit mb-4 md:mx-auto">
            System Specs
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
            Engineered for speed.<br className="hidden md:block" /> Crafted for growth.
          </h2>
          <p className="text-zinc-400 text-lg">
            High performance capabilities wrapped in a strictly optimized theme ecosystem. Build fast, analyze deep.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Builder Glimpse */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <BuilderGlimpse />
          </motion.div>

          {/* Analytics Glimpse */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AnalyticsGlimpse />
          </motion.div>

          {/* Mini Features Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
            <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl p-8 hover:border-zinc-700 transition-colors flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-8 right-8 text-emerald-500 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div className="z-10">
                <h3 className="text-lg font-bold text-white mb-2">Lightning Fast Performance</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Forms load instantly globally via edge networks, ensuring minimal drop-offs.
                </p>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl p-8 hover:border-zinc-700 transition-colors flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-8 right-8 text-emerald-500 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <div className="z-10">
                <h3 className="text-lg font-bold text-white mb-2">Zero-Trust Privacy</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Advanced encryption hashes and secure payload transmissions protect your data.
                </p>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl p-8 hover:border-zinc-700 transition-colors flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-8 right-8 text-emerald-500 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="z-10">
                <h3 className="text-lg font-bold text-white mb-2">Seamless Integrations</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Export to CSV instantly or pipe data to external webhooks in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Component: Pricing Section
// -------------------------------------------------------------
function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 border-t border-zinc-900 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 border border-emerald-900/50 bg-emerald-950/20 px-3 py-1 rounded-full w-fit mb-4 mx-auto">
            Scalability Plan
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-zinc-400 text-lg">
            Start gathering responses for free. Elevate production bounds when ready.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Tier 1: Free */}
          <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl p-8 flex flex-col hover:border-zinc-700 transition-all">
            <h3 className="text-lg font-medium text-white mb-1 font-mono">Free</h3>
            <p className="text-zinc-500 text-xs mb-4">Basic CLI prototyping</p>
            <div className="text-4xl font-bold text-white mb-6 font-mono">
              $0<span className="text-sm text-zinc-500 font-normal">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Unlimited mock forms", 
                "100 records per month", 
                "Standard terminal themes", 
                "Community Discord support"
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href="/auth/register" className="w-full mt-auto">
              <button className="w-full border border-zinc-800 text-white hover:bg-zinc-900 hover:border-zinc-700 rounded-lg py-2.5 text-sm font-semibold transition-all">
                Get Started
              </button>
            </Link>
          </div>

          {/* Tier 2: Pro (Highlighted) */}
          <div className="bg-[#0A0A0A] border border-emerald-500/50 rounded-2xl p-8 flex flex-col relative shadow-[0_0_50px_rgba(16,185,129,0.05)] transform md:-translate-y-2 hover:border-emerald-400 transition-all">
            {/* Recommended Tag */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              Recommended
            </div>
            
            <h3 className="text-lg font-medium text-emerald-400 mb-1 font-mono">Pro</h3>
            <p className="text-zinc-500 text-xs mb-4">Full production scale</p>
            <div className="text-4xl font-bold text-white mb-6 font-mono">
              $15<span className="text-sm text-zinc-500 font-normal">/mo</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Everything in Free", 
                "Unlimited records", 
                "Custom variables & metadata", 
                "Zod schema customization", 
                "Advanced response analytics"
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href="/auth/register" className="w-full mt-auto">
              <button className="w-full bg-emerald-500 text-black hover:bg-emerald-400 rounded-lg py-2.5 text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
                Get Started
              </button>
            </Link>
          </div>

          {/* Tier 3: Enterprise */}
          <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl p-8 flex flex-col hover:border-zinc-700 transition-all">
            <h3 className="text-lg font-medium text-white mb-1 font-mono">Enterprise</h3>
            <p className="text-zinc-500 text-xs mb-4">Custom setups & SLA</p>
            <div className="text-4xl font-bold text-white mb-6 font-mono">
              Custom
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Everything in Pro", 
                "Custom reverse domains", 
                "SSO & SAML authentication", 
                "Dedicated success handlers", 
                "99.9% uptime guarantees"
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href="/auth/register" className="w-full mt-auto">
              <button className="w-full border border-zinc-800 text-white hover:bg-zinc-900 hover:border-zinc-700 rounded-lg py-2.5 text-sm font-semibold transition-all">
                Contact Sales
              </button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Component: Footer
// -------------------------------------------------------------
function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-[#050505] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand */}
        <div className="flex items-center gap-2 font-bold text-white tracking-tight">
          <div className="w-6 h-6 rounded border border-emerald-800 bg-emerald-950/30 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
            P
          </div>
          <span className="font-mono text-base tracking-wider">PARCHA95</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-400">
          <Link href="/explore" className="hover:text-emerald-400 transition-colors">Explore</Link>
        </div>

        {/* Copyright */}
        <div className="text-zinc-600 text-sm font-mono">
          © {new Date().getFullYear()} PARCHA95. SECURE_BUILD.
        </div>
      </div>
    </footer>
  );
}
