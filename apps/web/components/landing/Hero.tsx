"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Sparkles } from "lucide-react";
import { inferRouterOutputs } from "@trpc/server";
import { ServerRouter } from "@repo/trpc/client";
import {
  HeroTerminalTheme,
  HeroCodeEditorTheme,
  HeroStandardTheme,
  HeroWindows95Theme,
} from "./HeroThemes";

type RouterOutputs = inferRouterOutputs<ServerRouter>;
type SessionData = RouterOutputs["auth"]["me"];

export function Hero({ sessionData }: { sessionData: SessionData | undefined | null }) {
  const isLoggedIn = !!sessionData?.user;

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

  const [activeTheme, setActiveTheme] = useState<
    "terminal" | "code_editor" | "standard" | "windows_95"
  >("standard");

  const [handle, setHandle] = useState("");
  const [env, setEnv] = useState<"prod" | "stage">("prod");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setHandle("");
    const defaultText = "rachit";

    let index = 0;
    let isActive = true;
    let interval: NodeJS.Timeout;

    const timer = setTimeout(() => {
      if (!isActive) return;
      interval = setInterval(() => {
        if (!isActive) {
          clearInterval(interval);
          return;
        }
        index++;
        setHandle(defaultText.substring(0, index));
        if (index >= defaultText.length) {
          clearInterval(interval);
        }
      }, 100);
    }, 800);

    return () => {
      isActive = false;
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [activeTheme]);

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

  const themeConfigs = {
    terminal: {
      aura: "bg-emerald-500/15 blur-[100px]",
      container:
        "bg-[#0A0A0A] border border-zinc-800 rounded-xl shadow-[0_0_60px_rgba(16,185,129,0.1)]",
      title: "Terminal prompt (~/parcha95/demo.sh)",
    },
    code_editor: {
      aura: "bg-blue-500/15 blur-[100px]",
      container:
        "bg-[#1e1e1e] border border-zinc-800 rounded-xl shadow-[0_0_60px_rgba(59,130,246,0.1)]",
      title: "VS Code Editor (survey.ts)",
    },
    standard: {
      aura: "bg-indigo-500/15 blur-[100px]",
      container:
        "bg-[#0B0F19] border border-zinc-800 rounded-xl shadow-[0_0_60px_rgba(99,102,241,0.15)]",
      title: "Standard (SaaS Form)",
    },
    windows_95: {
      aura: "bg-amber-500/10 blur-[100px]",
      container:
        "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-zinc-700 border-b-zinc-700 rounded shadow-2xl p-1",
      title: "Windows 95",
    },
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-[1.05]">
              Create forms your users will love.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-zinc-400 text-lg md:text-xl mt-2 max-w-xl leading-relaxed">
              Drop-dead gorgeous forms in seconds. Highly customizable, blazingly fast, and completely
              type-safe. Switch themes instantly to match your brand&apos;s vibe.
            </p>
          </motion.div>

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
          <div className="flex flex-wrap gap-2 mb-6 justify-center z-20">
            {[
              { id: "terminal", label: "Terminal (CLI)" },
              { id: "code_editor", label: "VS Code Editor" },
              { id: "standard", label: "Standard" },
              { id: "windows_95", label: "Windows 95" },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setActiveTheme(
                    theme.id as "terminal" | "code_editor" | "standard" | "windows_95",
                  );
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

          <div
            className={`absolute inset-0 ${themeConfigs[activeTheme].aura} rounded-full scale-90 pointer-events-none`}
          />

          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className={`relative w-full max-w-lg ${themeConfigs[activeTheme].container} overflow-hidden z-10 transition-all duration-300`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {activeTheme === "terminal" && (
                  <HeroTerminalTheme
                    handle={handle}
                    setHandle={setHandle}
                    env={env}
                    setEnv={setEnv}
                    submitting={submitting}
                    submitted={submitted}
                    handleSubmit={handleSubmit}
                    resetMockForm={resetMockForm}
                  />
                )}
                {activeTheme === "code_editor" && (
                  <HeroCodeEditorTheme
                    handle={handle}
                    setHandle={setHandle}
                    env={env}
                    setEnv={setEnv}
                    submitting={submitting}
                    submitted={submitted}
                    handleSubmit={handleSubmit}
                    resetMockForm={resetMockForm}
                  />
                )}
                {activeTheme === "standard" && (
                  <HeroStandardTheme
                    handle={handle}
                    setHandle={setHandle}
                    env={env}
                    setEnv={setEnv}
                    submitting={submitting}
                    submitted={submitted}
                    handleSubmit={handleSubmit}
                    resetMockForm={resetMockForm}
                  />
                )}
                {activeTheme === "windows_95" && (
                  <HeroWindows95Theme
                    handle={handle}
                    setHandle={setHandle}
                    env={env}
                    setEnv={setEnv}
                    submitting={submitting}
                    submitted={submitted}
                    handleSubmit={handleSubmit}
                    resetMockForm={resetMockForm}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
