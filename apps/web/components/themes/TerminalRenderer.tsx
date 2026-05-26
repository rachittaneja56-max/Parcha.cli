"use client";

import { useState, useEffect, useRef } from "react";
import type { SchemaField } from "../builder/constants";
import { TerminalSquare } from "lucide-react";

type AnswerState = Record<string, string>;

export interface ThemeRendererProps {
  schema: SchemaField[];
  formName: string;
  successMessage?: string;
  isPreview?: boolean;
  onTrackView?: () => void;
  onSubmit?: (answers: Record<string, string>, honeypot?: string) => Promise<void>;
  appState?: "live" | "error" | "auth_prompt" | "password_prompt";
  errorMsg?: string;
  onLoginClick?: () => void;
  onPasswordSubmit?: (password: string) => void;
}

export function TerminalRenderer({
  schema,
  formName,
  successMessage = "Response recorded successfully.",
  isPreview = false,
  onTrackView,
  onSubmit,
  appState = "live",
  errorMsg: globalErrorMsg,
  onLoginClick,
  onPasswordSubmit,
}: ThemeRendererProps) {
  const [bootPhase, setBootPhase] = useState<
    "booting" | "live" | "submitting" | "done"
  >(isPreview ? "live" : "booting");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentInput, setCurrentInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<React.ReactNode[]>([]);

  const addLine = (content: React.ReactNode) => {
    setLines((prev) => [...prev, content]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, currentInput, errorMsg, bootPhase, currentIndex, answers]);

  useEffect(() => {
    if (isPreview) {
      setCurrentIndex(0);
      setAnswers({});
      setCurrentInput("");
      setErrorMsg("");
      setBootPhase("live");
    }
  }, [schema, isPreview]);

  useEffect(() => {
    if (isPreview || bootPhase !== "booting") return;

    setLines([]);

    if (onTrackView) onTrackView();

    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;
    let timer4: NodeJS.Timeout;

    const timer1 = setTimeout(() => {
      addLine(<p key="boot-1" className="text-zinc-500">{`> parcha95 connect origin fld_`}</p>);
      timer2 = setTimeout(() => {
        addLine(<p key="boot-2" className="text-zinc-500">{`> Connection established.`}</p>);
        timer3 = setTimeout(() => {
          addLine(<p key="boot-3" className="text-emerald-400 font-bold mt-2 text-lg">{`> Form: "${formName}"`}</p>);
          timer4 = setTimeout(() => {
            addLine(
              <div key="instructions" className="text-zinc-500 mt-4 mb-6 text-sm bg-black/5 p-4 rounded-md border border-zinc-800">
                <p className="font-bold mb-2">{`> INSTRUCTIONS:`}</p>
                <p>{`> - Fields marked with [*] are mandatory.`}</p>
                <p>{`> - For multiple choice, enter comma-separated numbers.`}</p>
                <p>{`> - Type ':back' at any time to go to the previous question.`}</p>
                <p className="mt-3 text-emerald-400 animate-pulse font-bold">{`> Press [ENTER] to start...`}</p>
              </div>
            );
          }, 400);
        }, 400);
      }, 600);
    }, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [bootPhase, isPreview, formName, onTrackView]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = currentInput.trim();

      if (bootPhase === "booting") {
        setBootPhase("live");
        setCurrentInput("");
        return;
      }

      if (bootPhase === "done" && isPreview) {
        setCurrentIndex(0);
        setAnswers({});
        setBootPhase("live");
        return;
      }

      if (bootPhase === "live") {
        if (schema.length === 0) return;
        const active = schema[currentIndex];

        if (val.toLowerCase() === ":back") {
          if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setCurrentInput("");
            setErrorMsg("");
          }
          return;
        }

        if (!active) return;
        if (!val && active.required) {
          setErrorMsg("This field is required.");
          return;
        }

        let finalVal = val;

        if (val) {
          if (active.type === "email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
              setErrorMsg("Invalid email format.");
              return;
            }
          }
          if (active.type === "date") {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
              setErrorMsg("Use YYYY-MM-DD format.");
              return;
            }
          }
          if (active.type === "single_select") {
            const num = parseInt(val, 10);
            const max = active.options?.length || 0;
            if (isNaN(num) || num < 1 || num > max) {
              setErrorMsg(`Enter a valid option number (1-${max}).`);
              return;
            }
            finalVal = active.options![num - 1] || "";
          }
          if (active.type === "multiple_choice") {
            const parts = val.split(",").map((s) => s.trim());
            const max = active.options?.length || 0;
            const isValid = parts.every((p) => {
              const num = parseInt(p, 10);
              return !isNaN(num) && num >= 1 && num <= max;
            });
            if (!isValid || max === 0) {
              setErrorMsg(`Enter comma-separated valid numbers (1-${max}).`);
              return;
            }
            finalVal = parts.map(p => active.options![parseInt(p, 10) - 1]).join(", ");
          }
        }

        setErrorMsg("");
        setAnswers((prev) => ({ ...prev, [active.id]: finalVal }));
        setCurrentInput("");

        if (currentIndex + 1 >= schema.length) {
          if (isPreview) {
            setBootPhase("submitting");
            setTimeout(() => {
              setBootPhase("done");
              addLine(
                <div key="success" className="bg-emerald-950/20 border border-emerald-500/30 rounded-md text-emerald-400 p-6 mt-6 flex flex-col gap-4">
                  <div>
                    <p className="font-bold mb-2 text-emerald-400">✓ TRANSMISSION SUCCESSFUL (PREVIEW)</p>
                    <p className="font-normal text-emerald-300">{successMessage}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setBootPhase("live");
                        setAnswers({});
                        setCurrentIndex(0);
                        setLines([]);
                      }}
                      className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/50 hover:border-emerald-400 rounded transition-all cursor-pointer focus:outline-none"
                    >
                      [ OK ]
                    </button>
                  </div>
                </div>
              );
            }, 600);
            return;
          }

          setBootPhase("submitting");
          addLine(<p key="uploading" className="mt-6 text-zinc-500">{`> Uploading payload to server...`}</p>);

          if (onSubmit) {
            try {
              await onSubmit({ ...answers, [active.id]: finalVal }, honeypot);
              addLine(
                <div key="success" className="bg-emerald-950/20 border border-emerald-500/30 rounded-md text-emerald-400 p-6 mt-6 flex flex-col gap-4">
                  <div>
                    <p className="font-bold mb-2 text-emerald-400">✓ TRANSMISSION SUCCESSFUL</p>
                    <p className="font-normal text-emerald-300">{successMessage}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        window.location.href = '/';
                      }}
                      className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/50 hover:border-emerald-400 rounded transition-all cursor-pointer focus:outline-none"
                    >
                      [ OK ]
                    </button>
                  </div>
                </div>
              );
              setBootPhase("done");
            } catch (err: unknown) {
              addLine(<p key="error" className="text-rose-500 font-bold mt-4">{`> ERROR: ${err instanceof Error ? err.message : "Unknown error"}`}</p>);
              setBootPhase("done");
            }
          } else {
            setBootPhase("done");
          }
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }
    }
  };

  const liveLines: React.ReactNode[] = [];
  let activeFieldLabel = "Enter response";

  if ((bootPhase === "live" || bootPhase === "done") && schema.length > 0) {
    schema.forEach((field, index) => {
      const isPast = index < currentIndex || bootPhase === "done";
      const isActive = index === currentIndex && bootPhase === "live";

      if (isPast) {
        liveLines.push(
          <div key={`past-${field.id}`} className="text-zinc-500 mt-3 pl-2 opacity-70">
            <p>{`> ${field.prompt} [ ${answers[field.id] || ""} ]`}</p>
          </div>
        );
      } else if (isActive) {
        liveLines.push(
          <div key={`active-${field.id}`} className="border-l-2 border-emerald-500 pl-4 py-1 mt-6 mb-2">
            <p className="text-emerald-400 font-bold text-base">{`> ${field.prompt}${field.required ? " *" : ""}`}</p>
            {field.description && <p className="text-emerald-400/60 mt-1">{`> ${field.description}`}</p>}
            {(field.type === "single_select" || field.type === "multiple_choice") && field.options && (
              <div className="mt-3 pl-4 flex flex-col gap-1.5 text-zinc-200">
                {field.options.map((opt, optIdx) => (
                  <p key={`opt-${field.id}-${optIdx}`}>
                    {`  [${optIdx + 1}] ${opt}`}
                  </p>
                ))}
              </div>
            )}
          </div>
        );

        if (field.type === "single_select") activeFieldLabel = "Select an option";
        else if (field.type === "multiple_choice") activeFieldLabel = "Select option(s)";
        else if (field.type === "date") activeFieldLabel = "Enter date (YYYY-MM-DD)";
        else if (field.type === "email") activeFieldLabel = "Enter email address";
      }
    });
  }

  if (isPreview && schema.length === 0) {
    liveLines.push(
      <div key="empty" className="mb-4 pb-2 border-b border-[#0f1b2d]">
        <p className="text-emerald-400 font-bold tracking-wide">Form Simulator</p>
        <p className="text-zinc-500 text-xs font-mono">Waiting for fields to be added in the builder...</p>
      </div>
    );
  } else if (isPreview && currentIndex === 0 && bootPhase === "live") {
    liveLines.unshift(
      <div key="intro" className="mb-4 pb-2 border-b border-[#0f1b2d] select-none">
        <p className="text-emerald-400 font-bold tracking-wide">Form Simulator</p>
        <p className="text-zinc-500 text-xs font-mono">{formName || "Untitled Form"} — {schema.length} fields loaded.</p>
      </div>
    );
  }



  if (appState === "error") {
    return (
      <div className="relative flex items-center justify-center min-h-screen w-screen overflow-hidden p-4 sm:p-8 bg-black font-mono text-slate-200">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />
        <div className="flex flex-col max-w-lg w-full bg-[#0a0a0a] border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)] rounded-md p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
          <h2 className="text-rose-500 font-bold mb-4 flex items-center gap-2">
            <span className="animate-pulse">_</span> FATAL EXCEPTION
          </h2>
          <div className="text-rose-400/80 text-sm whitespace-pre-wrap mt-4 bg-rose-950/20 p-4 rounded border border-rose-900/30">
            {globalErrorMsg || "An error occurred."}
          </div>
        </div>
      </div>
    );
  }

  if (appState === "auth_prompt") {
    return (
      <div className="relative flex items-center justify-center min-h-screen w-screen bg-black font-mono text-slate-200">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />
        <div className="flex flex-col max-w-md w-full bg-[#050B14] border border-emerald-900/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] rounded-md p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse" />
          <h2 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <span className="animate-pulse">_</span> SECURITY ENFORCED
          </h2>
          <p className="text-emerald-400/70 text-sm mb-6 bg-emerald-950/30 p-3 border border-emerald-900/40 rounded">
            User authentication is required to access this node.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={onLoginClick} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/50 hover:border-emerald-400 py-2.5 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              INITIATE LOGIN SEQUENCE
            </button>
            <button onClick={() => window.location.href = '/'} className="w-full bg-transparent hover:bg-red-950/40 text-red-400/80 hover:text-red-400 border border-red-900/30 hover:border-red-500/50 py-2.5 transition-all">
              ABORT
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === "password_prompt") {
    return (
      <div className="relative flex items-center justify-center min-h-screen w-screen bg-black font-mono text-slate-200">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />
        <div className="flex flex-col max-w-md w-full bg-[#050B14] border border-emerald-900/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] rounded-md p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse" />
          <h2 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <span className="animate-pulse">_</span> SECURE TERMINAL
          </h2>
          <p className="text-emerald-400/70 text-sm mb-6 bg-emerald-950/30 p-3 border border-emerald-900/40 rounded">
            Enter password to decrypt form data:
          </p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const input = new FormData(e.currentTarget).get("pwd") as string;
            if (onPasswordSubmit) onPasswordSubmit(input);
          }}>
            <input
              type="password"
              name="pwd"
              placeholder="PASSWORD"
              className="w-full bg-black/50 border border-emerald-900/50 focus:border-emerald-500 text-emerald-400 outline-none px-4 py-3 mb-4 placeholder:text-emerald-900 tracking-widest transition-colors"
              autoFocus
            />
            {globalErrorMsg && <p className="text-rose-500 text-xs mb-4 bg-rose-950/20 p-2 border border-rose-900/30 rounded">{globalErrorMsg}</p>}
            <button type="submit" className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/50 hover:border-emerald-400 py-2.5 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              DECRYPT
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center h-full w-full overflow-hidden bg-black font-mono text-slate-200 selection:bg-emerald-900 selection:text-emerald-100 ${isPreview ? "" : "p-4 sm:p-8 min-h-screen"}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className={`flex flex-col w-full h-full max-w-4xl bg-[#050B14] ${isPreview ? "" : "border border-[#0f1b2d] shadow-2xl rounded-md max-h-[85vh] overflow-hidden"}`}>

        {/* Window Header */}
        <div className="bg-[#050B14] border-b border-[#0f1b2d] px-4 py-2 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <TerminalSquare className="h-4 w-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-widest font-bold opacity-80 text-emerald-400">
              {isPreview ? "Interactive Simulator" : formName || "Parcha95 Form"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold">
              {isPreview ? "simulating" : "secured"}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div ref={scrollRef} className={`p-6 h-full overflow-y-auto ${isPreview ? "" : "sm:p-12"} custom-scrollbar`}>
          {lines}
          {liveLines}

          {bootPhase === "live" && schema.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {errorMsg && (
                <p className="text-rose-500 font-bold">{`[!] ${errorMsg}`}</p>
              )}
              <div className="flex flex-wrap items-center text-emerald-400 font-bold">
                <span className="mr-2">{`> ${activeFieldLabel}:`}</span>
                <span className="whitespace-pre-wrap flex items-center">
                  [ <span className="text-zinc-100 tracking-wide mx-1">{currentInput}</span>
                  <span className="text-emerald-400 animate-pulse font-bold ml-1">█</span> ]
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {(bootPhase === "booting" || bootPhase === "live" || bootPhase === "done") && (
        <>
          <input
            ref={inputRef}
            type="text"
            className="opacity-0 absolute w-0 h-0 pointer-events-none"
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {!isPreview && (
            <input
              type="text"
              name="email_address_verify"
              className="opacity-0 absolute w-0 h-0 pointer-events-none"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          )}
        </>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}} />
    </div>
  );
}
