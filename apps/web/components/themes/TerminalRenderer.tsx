"use client";

import { useState, useEffect, useRef } from "react";
import type { SchemaField } from "../builder/constants";
import { TerminalSquare } from "lucide-react";

type AnswerState = Record<string, string>;

export interface ThemeRendererProps {
  schema: SchemaField[];
  formName: string;
  successMessage?: string;
  password?: string | null;
  isPreview?: boolean;
  onTrackView?: () => void;
  onSubmit?: (answers: Record<string, string>, honeypot?: string) => Promise<void>;
}

export function TerminalRenderer({
  schema,
  formName,
  successMessage = "Response recorded successfully.",
  password,
  isPreview = false,
  onTrackView,
  onSubmit,
}: ThemeRendererProps) {
  const [bootPhase, setBootPhase] = useState<
    "password_prompt" | "booting" | "live" | "submitting" | "done"
  >(password && !isPreview ? "password_prompt" : isPreview ? "live" : "booting");

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

      if (bootPhase === "password_prompt") {
        if (val === password) {
          addLine(<p key={Date.now()} className="text-emerald-400 font-bold mt-2">{`> ACCESS GRANTED.`}</p>);
          setCurrentInput("");
          setBootPhase("booting");
        } else {
          addLine(<p key={Date.now()} className="text-rose-500 font-bold mt-2">{`> ACCESS DENIED.`}</p>);
          setCurrentInput("");
        }
        return;
      }

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
            setBootPhase("done");
            return;
          }

          setBootPhase("submitting");
          addLine(<p key="uploading" className="mt-6 text-zinc-500">{`> Uploading payload to server...`}</p>);

          if (onSubmit) {
            try {
              await onSubmit({ ...answers, [active.id]: finalVal }, honeypot);
              addLine(
                <div key="success" className="bg-emerald-950/20 border border-emerald-500/30 rounded-md text-emerald-400 p-6 mt-6">
                  <p className="font-bold mb-2 text-emerald-400">✓ TRANSMISSION SUCCESSFUL</p>
                  <p className="font-normal text-emerald-300">{successMessage}</p>
                </div>
              );
              setBootPhase("done");
            } catch (err: any) {
              addLine(<p key="error" className="text-rose-500 font-bold mt-4">{`> ERROR: ${err.message}`}</p>);
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

  if (isPreview && bootPhase === "done" && schema.length > 0) {
    liveLines.push(
      <div key="preview-success" className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-emerald-400 pl-4 py-3 mt-4 select-none">
        <p className="font-bold">✓ Form completed successfully!</p>
        <p className="text-xs mt-1 font-normal font-mono text-zinc-500">Press Enter to restart the simulator session.</p>
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

          {bootPhase === "password_prompt" && (
            <div className="mt-4 flex items-center text-emerald-400 font-bold">
              <span className="mr-2">{`> Password:`}</span>
              <span className="text-zinc-100 tracking-wide">
                {"*".repeat(currentInput.length)}
              </span>
              <span className="text-emerald-400 animate-pulse font-bold ml-1">█</span>
            </div>
          )}

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

      {(bootPhase === "password_prompt" || bootPhase === "booting" || bootPhase === "live" || bootPhase === "done") && (
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
