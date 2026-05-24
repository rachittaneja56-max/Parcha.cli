"use client";

import { useState, useEffect, useRef } from "react";
import { TerminalSquare } from "lucide-react";
import type { SchemaField } from "./constants";

type AnswerState = Record<string, string>;

function TerminalContent({
  schema,
  formName,
}: {
  schema: SchemaField[];
  formName: string;
}) {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentInput, setCurrentInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnswers((prev) => {
      const next = { ...prev };
      for (const key in next) {
        if (!schema.find((f) => f.id === key)) {
          delete next[key];
        }
      }
      return next;
    });
  }, [schema]);

  // Scroll to bottom whenever new lines are added or input changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [schema, answers, currentInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, activeField: SchemaField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      const val = currentInput.trim();
      if (!val && activeField.required) {
        setErrorMsg("[!] This field is required.");
        return;
      }
      
      if (val) {
        if (activeField.type === "email") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            setErrorMsg("[!] Invalid email format.");
            return;
          }
        }
        
        if (activeField.type === "date") {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            setErrorMsg("[!] Use YYYY-MM-DD format.");
            return;
          }
        }

        if (activeField.type === "single_select") {
          const num = parseInt(val, 10);
          if (isNaN(num) || num < 1 || num > (activeField.options?.length || 0)) {
            setErrorMsg(`[!] Enter a valid option number (1-${activeField.options?.length || 0}).`);
            return;
          }
        }

        if (activeField.type === "multiple_choice") {
          const parts = val.split(",").map(s => s.trim());
          const max = activeField.options?.length || 0;
          const isValid = parts.every(p => {
            const num = parseInt(p, 10);
            return !isNaN(num) && num >= 1 && num <= max;
          });
          if (!isValid) {
            setErrorMsg(`[!] Enter comma-separated valid numbers (e.g. 1,3).`);
            return;
          }
        }
      }

      setErrorMsg("");
      setAnswers((prev) => ({ ...prev, [activeField.id]: val }));
      setCurrentInput("");
    }
  };

  if (schema.length === 0) {
    return (
      <div className="flex flex-col gap-0.5 p-4 font-mono text-xs leading-relaxed select-none">
        <p className="text-zinc-500">
          <span className="text-emerald-400/70">parcha</span>
          <span className="text-zinc-600">@cli</span>
          <span className="text-zinc-600"> ~ $ </span>
          <span className="text-zinc-400">parcha init &quot;{formName}&quot;</span>
        </p>
        <p className="text-zinc-600">  Waiting for fields...</p>
      </div>
    );
  }

  const lines: React.ReactNode[] = [];
  
  lines.push(
    <p key="cmd" className="text-zinc-500">
      <span className="text-emerald-400/70">parcha</span>
      <span className="text-zinc-600">@cli</span>
      <span className="text-zinc-600"> ~ $ </span>
      <span className="text-zinc-400">parcha build &quot;{formName}&quot; --interactive</span>
    </p>
  );
  
  lines.push(
    <p key="success" className="text-emerald-500/80">
      {`  \u2713 Loaded ${schema.length} field${schema.length !== 1 ? "s" : ""}`}
    </p>
  );

  let activeFieldIndex = -1;

  for (let i = 0; i < schema.length; i++) {
    const field = schema[i];
    if (!field) continue;
    const promptText = field.name ? `[${field.name}] ${field.prompt || "Enter a value"}` : (field.prompt || "Enter a value");
    const req = field.required ? " *" : "";
    const isMultiOption = (field.type === "single_select" || field.type === "multiple_choice") && field.options && field.options.length > 0;

    const hasAnswer = answers[field.id] !== undefined;

    if (hasAnswer) {
      if (isMultiOption) {
        lines.push(
          <p key={`prompt-${field.id}`} className="text-cyan-400/90 mt-0.5">
            {`> ${promptText}${req}`}
          </p>
        );
        field.options!.forEach((opt, idx) => {
          lines.push(
            <p key={`opt-${field.id}-${idx}`} className="text-zinc-600">
              {`  [${idx + 1}] ${opt}`}
            </p>
          );
        });
        lines.push(
          <p key={`ans-${field.id}`} className="text-cyan-400/90">
            {`> Select option(s): `}<span className="text-white">{answers[field.id]}</span>
          </p>
        );
      } else {
        lines.push(
          <p key={`ans-${field.id}`} className="text-cyan-400/90 mt-0.5">
            {`> ${promptText}${req}: `}<span className="text-white">{answers[field.id]}</span>
          </p>
        );
      }
    } else {
      if (activeFieldIndex === -1) {
        activeFieldIndex = i;
        if (isMultiOption) {
          lines.push(
            <p key={`prompt-${field.id}`} className="text-cyan-400/90 mt-0.5">
              {`> ${promptText}${req}`}
            </p>
          );
          field.options!.forEach((opt, idx) => {
            lines.push(
              <p key={`opt-${field.id}-${idx}`} className="text-zinc-600">
                {`  [${idx + 1}] ${opt}`}
              </p>
            );
          });
        }
      } else {
        lines.push(
          <p key={`preview-prompt-${field.id}`} className="text-zinc-600/50 mt-0.5">
            {`> ${promptText}${req}${!isMultiOption ? ":" : ""}`}
          </p>
        );
        if (isMultiOption) {
          field.options!.forEach((opt, idx) => {
            lines.push(
              <p key={`preview-opt-${field.id}-${idx}`} className="text-zinc-600/50">
                {`  [${idx + 1}] ${opt}`}
              </p>
            );
          });
        }
      }
    }
  }

  const activeField = activeFieldIndex !== -1 ? schema[activeFieldIndex] : null;
  const isFinished = activeFieldIndex === -1 && schema.length > 0;

  if (isFinished) {
    lines.push(
      <p key="finished" className="text-emerald-500/80 mt-2">
        {`\u2713 Form completed successfully`}
      </p>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col gap-0.5 p-4 font-mono text-xs leading-relaxed h-full overflow-y-auto"
      onClick={() => inputRef.current?.focus()}
    >
      {lines}
      
      {errorMsg && (
        <p className="text-red-400 mt-1">{errorMsg}</p>
      )}
      {activeField && (
        <div className="flex text-cyan-400/90 mt-0.5">
          <span>
            {activeField.type === "multiple_choice" && activeField.options && activeField.options.length > 0
              ? `> Select options (comma-separated): `
              : activeField.type === "single_select" && activeField.options && activeField.options.length > 0
              ? `> Select an option: `
              : activeField.type === "date"
              ? `> ${activeField.name ? `[${activeField.name}] ${activeField.prompt || "Enter date (YYYY-MM-DD)"}` : (activeField.prompt || "Enter date (YYYY-MM-DD)")}${activeField.required ? " *" : ""}: `
              : `> ${activeField.name ? `[${activeField.name}] ${activeField.prompt || "Enter a value"}` : (activeField.prompt || "Enter a value")}${activeField.required ? " *" : ""}: `}
          </span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none border-none text-white ml-1 placeholder:text-zinc-600"
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            onKeyDown={(e) => handleKeyDown(e, activeField)}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

export function ResizableTerminal({
  schema,
  formName,
}: {
  schema: SchemaField[];
  formName: string;
}) {
  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden w-full">
      <div className="flex items-center justify-between border-b border-[#1c1c1c] px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-3.5 w-3.5 text-emerald-400/70" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            Terminal Preview
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-600">live</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <TerminalContent schema={schema} formName={formName} />
      </div>
    </div>
  );
}
