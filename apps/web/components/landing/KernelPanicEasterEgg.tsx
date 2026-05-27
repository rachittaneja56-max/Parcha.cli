"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Terminal as TerminalIcon, Settings, RefreshCw } from "lucide-react";

interface Win95Dialog {
  id: number;
  title: string;
  message: string;
  x: number;
  y: number;
}

export const KernelPanicEasterEgg = () => {
  const [phase, setPhase] = useState<"idle" | "terminal" | "deleting" | "meltdown" | "restoring">("idle");
  const [terminalText, setTerminalText] = useState<string[]>([]);
  const [deletingProgress, setDeletingProgress] = useState(0);
  const [deletingLogs, setDeletingLogs] = useState<string[]>([]);
  const [dialogs, setDialogs] = useState<Win95Dialog[]>([]);
  const [restoringLogs, setRestoringLogs] = useState<string[]>([]);

  // Trigger keywords & keys
  useEffect(() => {
    let keyBuffer = "";
    let backtickCount = 0;
    let backtickTimer: NodeJS.Timeout;

    const triggerMeltdown = () => {
      setPhase("terminal");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const key = e.key;

      if (key === "`") {
        backtickCount++;
        clearTimeout(backtickTimer);
        backtickTimer = setTimeout(() => {
          backtickCount = 0;
        }, 1000);

        if (backtickCount >= 5) {
          triggerMeltdown();
          backtickCount = 0;
          return;
        }
      }

      keyBuffer += key.toLowerCase();
      if (keyBuffer.length > 30) {
        keyBuffer = keyBuffer.substring(keyBuffer.length - 30);
      }

      if (
        keyBuffer.endsWith("rm -rf") ||
        keyBuffer.endsWith("rm-rf") ||
        keyBuffer.endsWith("sudo rm -rf") ||
        keyBuffer.endsWith("crash") ||
        keyBuffer.endsWith("panic")
      ) {
        triggerMeltdown();
        keyBuffer = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(backtickTimer);
    };
  }, []);

  // Phase 1: Terminal text typing animation
  useEffect(() => {
    if (phase !== "terminal") return;

    setTerminalText([]);
    
    const fullText = "sudo rm -rf / --no-preserve-root";
    let typed = "";
    let idx = 0;
    
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        typed += fullText[idx];
        setTerminalText([`rachit@parcha95:~$ ${typed}`]);
        idx++;
      } else {
        clearInterval(interval);
        
        setTimeout(() => {
          setTerminalText(prev => [...prev, "[sudo] password for admin: *******"]);
          
          setTimeout(() => {
            setTerminalText(prev => [
              ...prev, 
              "[WARNING] CRITICAL ENVIRONMENT WIPE INITIATED."
            ]);
            
            setTimeout(() => {
              setTerminalText(prev => [...prev, "Are you absolutely sure? (y/n): "]);
              
              setTimeout(() => {
                setTerminalText(prev => {
                  const last = prev[prev.length - 1] || "";
                  return [...prev.slice(0, -1), last + "y"];
                });
                
                setTimeout(() => {
                  setPhase("deleting");
                }, 800);
              }, 400);
            }, 600);
          }, 600);
        }, 400);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase 2: Rapid Deletion scroll & gravity
  const deletionSteps = [
    "[-] Connecting to Upstash Redis database cluster... OK",
    "[-] Wiping form layout schemas from SQL database...",
    "[-] DELETING: apps/web/app/page.tsx ... SUCCESS",
    "[-] DELETING: apps/web/components/landing/Hero.tsx ... SUCCESS",
    "[-] DELETING: apps/web/components/landing/Features.tsx ... SUCCESS",
    "[-] DELETING: apps/web/components/landing/Pricing.tsx ... SUCCESS",
    "[-] DELETING: packages/database/schema.ts ... SUCCESS",
    "[-] DELETING: packages/services/response/index.ts ... SUCCESS",
    "[-] DELETING: packages/trpc/routes/form.ts ... SUCCESS",
    "[-] DELETING: packages/validators/src/form.ts ... SUCCESS",
    "[-] DELETING: railway.toml ... SUCCESS",
    "[-] DELETING: Upstash Redis Cache ... SUCCESS",
    "[-] DELETING: Railway Environment Vars ... SUCCESS",
    "[-] DELETING: User Session cookie token ... SUCCESS",
    "[-] DELETING: Honeypot Protection ... WET",
    "[-] DELETING: CSRF validation filters ... SUCCESS",
    "[-] Wiping /home/rachit/.parcha95/config.json ... SUCCESS",
    "[!] CRITICAL: HARDWARE OVERLOAD IN PROGRESS!",
    "[!] PROCESS SEGFAULT DETECTED AT MEMORY 0x00A381FC",
    "[!] EMERGENCY REBOOT INITIATED..."
  ];

  useEffect(() => {
    if (phase !== "deleting") return;

    setDeletingLogs([]);
    setDeletingProgress(0);
    document.body.classList.add("meltdown-active");

    let progress = 0;
    let logIdx = 0;

    const progressInterval = setInterval(() => {
      progress += 2.5;
      if (progress >= 100) {
        setDeletingProgress(100);
        clearInterval(progressInterval);
        
        setTimeout(() => {
          setPhase("meltdown");
        }, 600);
      } else {
        setDeletingProgress(Math.floor(progress));
      }
    }, 100);

    const logInterval = setInterval(() => {
      if (logIdx < deletionSteps.length) {
        const step = deletionSteps[logIdx] || "";
        setDeletingLogs(prev => [...prev, step]);
        logIdx++;
      } else {
        setDeletingLogs(prev => [
          ...prev, 
          `[!] SHREDDING MEMORY SECTOR 0x${Math.random().toString(16).substring(2, 10).toUpperCase()}... OK`
        ]);
      }
    }, 120);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [phase]);

  // Phase 3: Cascading Win95 Dialogs Meltdown
  const win95Titles = [
    "Fatal Exception 0E",
    "System Error",
    "Parcha95 Kernel Error",
    "Illegal Operation",
    "Form Builder Meltdown",
    "Honeypot Warning"
  ];

  const win95Messages = [
    "Fatal Exception 0E has occurred at 0x0028:C001C256 in VXD Parcha.",
    "Object [Parcha Form] is not response-ive. Re-route webhooks immediately.",
    "Warning: Honeypot field has attracted too much honey.",
    "Your browser is running out of CLI console memory.",
    "Error: Terminal theme has achieved sentience and is refusing to serialize.",
    "Windows 95 registry corruption. Please insert 3.5\" floppy diskette.",
    "Warning: Too much aesthetic. Terminal meltdown imminent.",
    "Parcha has performed an illegal operation and will be shut down.",
    "A process partition leak has flooded the Tailwind layout engine.",
    "Rachit's compiler is currently overheating. Please blow into your terminal."
  ];

  const spawnDialog = (count = 1) => {
    setDialogs(prev => {
      const newDialogs = [...prev];
      for (let i = 0; i < count; i++) {
        const id = Date.now() + Math.random();
        const title = win95Titles[Math.floor(Math.random() * win95Titles.length)] || "Fatal Exception 0E";
        const message = win95Messages[Math.floor(Math.random() * win95Messages.length)] || "An error occurred.";
        const x = 5 + Math.random() * 65; // percentage left
        const y = 10 + Math.random() * 60; // percentage top
        newDialogs.push({ id, title, message, x, y });
      }
      return newDialogs;
    });
  };

  useEffect(() => {
    if (phase !== "meltdown") {
      setDialogs([]);
      return;
    }

    spawnDialog(3);

    const interval = setInterval(() => {
      spawnDialog(1);
    }, 550);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPhase("restoring");
    }, 7000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase]);

  const handleDialogDismiss = (id: number) => {
    spawnDialog(3);
    setDialogs(prev => prev.filter(d => d.id !== id));
  };

  // Phase 4: System Restoration
  const restoreSteps = [
    "[RECOVERY] PARCHA IMMUNE SYSTEM DETECTED MELTDOWN ATTEMPT.",
    "[RECOVERY] ABORTING DELETE ACTIONS... SUCCESS.",
    "[RECOVERY] PULLING SECURITY ENVELOPE BACKUPS FROM UPSTASH CACHE...",
    "[RECOVERY] RESTORING DATABASE STATE: 100% HEALTHY.",
    "[RECOVERY] DE-FRAGMENTING DRIZZLE SCHEMA AND TRPC HANDLERS...",
    "[RECOVERY] RE-ALIGNING THEME SYSTEM STYLES... SUCCESS.",
    "[RECOVERY] RE-WARMING RAILWAY SERVER ENVIRONMENTS...",
    "[RECOVERY] BOOTING SYSTEM DEPLOYMENTS UNDER POCKET SHIELD...",
    "[RECOVERY] PARCHA IMMUNE RESTORE COMPLETED SUCCESSFULLY."
  ];

  useEffect(() => {
    if (phase !== "restoring") {
      setRestoringLogs([]);
      return;
    }

    document.body.classList.remove("meltdown-active");

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < restoreSteps.length) {
        const step = restoreSteps[idx] || "";
        setRestoringLogs(prev => [...prev, step]);
        idx++;
      } else {
        clearInterval(interval);
        
        setTimeout(() => {
          setPhase("idle");
        }, 1200);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black font-mono overflow-hidden select-none crt-static">
      {/* CRT Scanline styling injection */}
      <style>{`
        .crt-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
        }
        
        .crt-static {
          background-image: radial-gradient(circle, rgba(5, 10, 8, 0.15) 0%, rgba(0, 0, 0, 0.85) 100%);
        }

        @keyframes meltGravity {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; filter: blur(0px); }
          15% { transform: translateY(5px) rotate(0.5deg) skewX(1deg); opacity: 0.98; }
          40% { transform: translateY(20px) rotate(-1.5deg) skewY(-1deg) scale(0.97); opacity: 0.85; filter: blur(0.5px); }
          70% { transform: translateY(60px) rotate(3deg) skewX(2deg) scale(0.92); opacity: 0.6; filter: blur(2px); }
          100% { transform: translateY(140px) rotate(6deg) skewY(3deg) scale(0.85); opacity: 0.15; filter: blur(6px); }
        }

        .meltdown-active main {
          animation: meltGravity 7.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          pointer-events: none;
        }

        /* Win95 Retro styles */
        .win95-dialog {
          background: #c0c0c0;
          box-shadow: inset 1.5px 1.5px 0px 0px #ffffff,
                      inset -1.5px -1.5px 0px 0px #808080,
                      1.5px 1.5px 0px 0px #000000;
        }
        
        .win95-button {
          background: #c0c0c0;
          box-shadow: inset 1.5px 1.5px 0px 0px #ffffff,
                      inset -1.5px -1.5px 0px 0px #808080,
                      1.5px 1.5px 0px 0px #000000;
          outline: none;
          cursor: pointer;
        }
        
        .win95-button:active {
          box-shadow: inset 1.5px 1.5px 0px 0px #808080,
                      1.5px 1.5px 0px 0px #ffffff,
                      1.5px 1.5px 0px 0px #000000;
          padding-top: 5px;
          padding-left: 17px;
          padding-right: 15px;
        }

        .win95-titlebar {
          background: linear-gradient(90deg, #000080, #1084d0);
        }
      `}</style>

      {/* CRT Scanline layer */}
      <div className="absolute inset-0 crt-scanlines z-[10000] pointer-events-none" />

      {/* EMERGENCY Meltdown background flash under Windows 95 state */}
      {phase === "meltdown" && (
        <div className="absolute inset-0 bg-red-950/20 animate-pulse z-0" />
      )}

      {/* Content wrapper */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        
        {/* Terminals & Deletion Phases */}
        {(phase === "terminal" || phase === "deleting") && (
          <div className="w-full max-w-2xl border border-emerald-900 bg-[#050B06]/95 p-5 md:p-6 rounded-lg font-mono text-emerald-400 shadow-[0_0_55px_rgba(16,185,129,0.15)] flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-hidden relative z-10">
            {/* Window header */}
            <div className="flex items-center gap-2 border-b border-emerald-950 pb-2 text-xs text-emerald-600 font-bold select-none">
              <TerminalIcon className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>rachit@parcha95: ~/terminal-meltdown</span>
            </div>

            {/* Scrolling log text */}
            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto text-sm pr-2">
              {phase === "terminal" && terminalText.map((line, idx) => (
                <div key={idx} className={line.includes("[WARNING]") ? "text-red-400 font-bold" : ""}>
                  {line}
                </div>
              ))}

              {phase === "deleting" && (
                <>
                  <div className="text-zinc-500 mb-2">rachit@parcha95:~$ sudo rm -rf / --no-preserve-root [y]</div>
                  <div className="text-red-400 font-bold mb-2">[WARNING] CRITICAL ENVIRONMENT WIPE INITIATED.</div>
                  {deletingLogs.slice(-12).map((line, idx) => (
                    <div 
                      key={idx} 
                      className={
                        line.startsWith("[!") 
                          ? "text-red-500 animate-pulse font-bold" 
                          : line.includes("SUCCESS") 
                            ? "text-emerald-400/90" 
                            : "text-emerald-500/70"
                      }
                    >
                      {line}
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Deletion progress bar */}
            {phase === "deleting" && (
              <div className="border-t border-emerald-950 pt-3 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-bold text-red-400">
                  <span className="animate-pulse">SHREDDING PARCHA ASSETS</span>
                  <span>{deletingProgress}%</span>
                </div>
                <div className="w-full bg-emerald-950/40 border border-emerald-800 h-4 rounded overflow-hidden p-0.5">
                  <div 
                    className="bg-red-600 h-full rounded-sm transition-all duration-100 ease-out shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                    style={{ width: `${deletingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Cascading Win95 Dialogs */}
        {phase === "meltdown" && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            {/* Cascading Dialog Container */}
            {dialogs.map((d) => (
              <div 
                key={d.id} 
                className="win95-dialog absolute w-[330px] md:w-[380px] z-[1000] p-1 flex flex-col pointer-events-auto select-none"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {/* Titlebar */}
                <div className="win95-titlebar text-white font-sans text-[11px] font-bold px-1.5 py-0.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 text-zinc-300" />
                    {d.title}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDialogDismiss(d.id); }}
                    className="win95-button text-black text-[9px] w-4.5 h-4.5 flex items-center justify-center font-black pb-0.5"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Dialog Body */}
                <div className="text-black text-xs font-sans p-3 bg-[#c0c0c0] flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-8 h-8 text-amber-500 drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <p className="font-semibold leading-relaxed leading-[1.3] text-[#000000]">{d.message}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pr-1 mt-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDialogDismiss(d.id); }}
                      className="win95-button text-black px-5 py-0.5 text-xs font-medium border-t-white border-l-white border-r-zinc-800 border-b-zinc-800"
                    >
                      OK
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDialogDismiss(d.id); }}
                      className="win95-button text-black px-5 py-0.5 text-xs font-medium border-t-white border-l-white border-r-zinc-800 border-b-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Epic Big Glitch overlay text center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center select-none pointer-events-none opacity-45">
              <h1 className="text-red-600 text-6xl md:text-8xl font-sans font-black tracking-widest uppercase animate-pulse">
                FATAL MELTDOWN
              </h1>
              <p className="text-white text-lg font-mono tracking-widest mt-2 animate-bounce">
                OVERFLOW LEVEL: MAX
              </p>
            </div>
          </div>
        )}

        {/* Phase 4: Recovery Terminal */}
        {phase === "restoring" && (
          <div className="w-full max-w-2xl border border-blue-900 bg-[#04080F]/95 p-5 md:p-6 rounded-lg font-mono text-blue-400 shadow-[0_0_55px_rgba(59,130,246,0.15)] flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-hidden relative z-10 animate-pulse">
            <div className="flex items-center gap-2 border-b border-blue-950 pb-2 text-xs text-blue-500 font-bold select-none">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span>SYSTEM RECOVERY ENGINE v1.95</span>
            </div>

            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto text-sm pr-2">
              {restoringLogs.map((line, idx) => (
                <div key={idx} className="text-blue-400 font-bold">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
