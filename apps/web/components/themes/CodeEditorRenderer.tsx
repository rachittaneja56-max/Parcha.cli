"use client";

import React, { useState, useEffect } from "react";
import type { ThemeRendererProps } from "./TerminalRenderer";

export function CodeEditorRenderer({
  schema,
  formName,
  form,
  successMessage = "Response recorded successfully.",
  isPreview = false,
  onTrackView,
  onSubmit,
}: ThemeRendererProps & { form?: any }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);

  useEffect(() => {
    if (!isPreview && onTrackView) {
      onTrackView();
    }
  }, [isPreview, onTrackView]);

  const handleAnswer = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[fieldId];
        return newErrs;
      });
    }
  };

  const validateAndSubmit = async () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    schema.forEach((field) => {
      const val = answers[field.id];
      if (field.required && (!val || (typeof val === "string" && val.trim() === "") || (Array.isArray(val) && val.length === 0))) {
        newErrors[field.id] = "This field is required.";
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      // Auto-focus the first field with an error in the sidebar
      const firstErrIndex = schema.findIndex((f) => newErrors[f.id]);
      if (firstErrIndex !== -1) {
        setActiveFieldIndex(firstErrIndex);
      }
      return;
    }

    if (isPreview) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setAnswers({});
        setActiveFieldIndex(0);
      }, 3000);
      return;
    }

    if (onSubmit) {
      try {
        await onSubmit(answers);
        setIsSubmitted(true);
      } catch (e: any) {
        alert(e.message || "An error occurred");
      }
    }
  };

  const title = form?.title || formName || "Untitled Form";
  const description = form?.description || "";
  const activeField = schema[activeFieldIndex];
  const numErrors = Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#dcdcdc] font-mono flex flex-col select-none overflow-hidden h-screen">
      
      {/* VS Code Title Bar */}
      <div className="bg-[#3c3c3c] h-[35px] shrink-0 border-b border-[#252526] flex items-center justify-between px-3 text-xs text-[#a3a3a3]">
        <div className="flex items-center gap-2">
          <span className="text-[#007acc] text-sm">⎋</span>
          <span className="truncate">{title} - Visual Studio Code</span>
        </div>
        <div className="hidden md:flex items-center gap-1 bg-[#2d2d2d] border border-[#474747] px-8 py-0.5 rounded text-[11px] text-[#cccccc] max-w-[400px] truncate">
          🔎 {title} (Workspace)
        </div>
        <div className="flex items-center gap-2.5">
          {/* play button / Run Action */}
          <button 
            onClick={validateAndSubmit}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#007acc] text-white hover:bg-[#0062a3] active:bg-[#004e82] rounded text-[11px] font-bold cursor-pointer transition-colors shadow-sm select-none"
            title="Deploy and Run Survey"
          >
            <span className="text-[10px]">▶</span> Run Survey
          </button>
        </div>
      </div>

      {/* Main VS Code Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        <div className="w-[48px] bg-[#333333] shrink-0 border-r border-[#252526] flex flex-col items-center py-4 gap-5 text-lg text-[#858585]">
          <div className="text-white cursor-pointer hover:text-white" title="Explorer">📂</div>
          <div className="cursor-pointer hover:text-white" title="Search">🔍</div>
          <div className="cursor-pointer hover:text-white" title="Source Control">🌿</div>
          <div className="cursor-pointer hover:text-white" title="Run & Debug">🐞</div>
          <div className="cursor-pointer hover:text-white" title="Extensions">🧩</div>
        </div>

        {/* Sidebar (File Explorer listing questions) */}
        <div className="w-[220px] bg-[#252526] shrink-0 border-r border-[#1e1e1e] hidden sm:flex flex-col select-none">
          <div className="px-3 py-2 text-[10px] uppercase font-bold text-[#808080] tracking-wider border-b border-[#1e1e1e] flex justify-between items-center">
            <span>Explorer</span>
            <span>•••</span>
          </div>
          <div className="p-2 text-xs text-[#cccccc] font-bold flex items-center gap-1 select-none">
            <span>📂</span> <span className="truncate">{title.toLowerCase().replace(/\s+/g, "-")}</span>
          </div>
          
          {/* Sidebar file listing */}
          <div className="flex-1 overflow-y-auto">
            {schema.map((field, idx) => {
              const isActive = idx === activeFieldIndex;
              const hasErr = !!errors[field.id];
              return (
                <div
                  key={field.id}
                  onClick={() => setActiveFieldIndex(idx)}
                  className={`group px-4 py-1 flex items-center justify-between text-xs cursor-pointer select-none transition-colors ${
                    isActive ? "bg-[#37373d] text-white" : "text-[#858585] hover:bg-[#2a2d2e] hover:text-[#cccccc]"
                  } ${hasErr ? "text-red-400 font-semibold" : ""}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={isActive ? "text-[#519aba]" : "text-[#519aba]/70"}>
                      {field.type === "multiple_choice" || field.type === "single_select" ? "🧩" : "📝"}
                    </span>
                    <span className="truncate">question_{idx + 1}.ts</span>
                  </div>
                  {hasErr && (
                    <span className="text-[10px] bg-red-600/30 text-red-400 px-1 rounded font-bold">!</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Editor Panel */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          
          {/* Tab Headers */}
          <div className="h-[35px] bg-[#2d2d2d] shrink-0 border-b border-[#252526] flex items-center overflow-x-auto select-none">
            {activeField && (
              <div className="bg-[#1e1e1e] px-4 py-2 text-xs text-white border-t-2 border-t-[#007acc] border-r border-[#252526] flex items-center gap-2 select-none shrink-0">
                <span className="text-[#519aba]">ts</span>
                <span>question_{activeFieldIndex + 1}.ts</span>
                <span className="text-[9px] text-[#858585]">●</span>
              </div>
            )}
            <div className="flex-1" />
          </div>

          {/* Active File Code Editor Body */}
          <div className="flex-1 p-6 overflow-y-auto select-text font-mono text-sm leading-relaxed">
            {isSubmitted ? (
              <div className="h-full flex flex-col justify-center max-w-lg mx-auto py-12 space-y-4">
                <div className="text-[#6a9955] font-normal">
                  <span>{"/**"}</span>
                  <br />
                  <span>{" * SUCCESS: Survey response successfully deployed to server."}</span>
                  <br />
                  <span>{" */"}</span>
                </div>
                <div className="text-[#c678dd]">
                  <span>{"class "}</span>
                  <span className="text-[#61afef]">DeploymentReport</span>
                  <span>{" {"}</span>
                </div>
                <div className="pl-6 text-[#dcdcdc]">
                  <span className="text-[#e5c07b]">status</span>
                  <span>: </span>
                  <span className="text-[#98c379]">"SUCCESS"</span>
                  <span>;</span>
                  <br />
                  <span className="text-[#e5c07b]">message</span>
                  <span>: </span>
                  <span className="text-[#98c379]">"{successMessage}"</span>
                  <span>;</span>
                </div>
                <div className="text-[#c678dd]">{"}"}</div>
                <div className="pt-6">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setAnswers({});
                      setActiveFieldIndex(0);
                    }}
                    className="px-4 py-1 bg-[#007acc] text-white hover:bg-[#0062a3] font-bold text-xs rounded border border-[#005c99] active:bg-[#004e82] cursor-pointer focus:outline-none"
                  >
                    Reset()
                  </button>
                </div>
              </div>
            ) : activeField ? (
              <div className="space-y-6">
                
                {/* Code Comments block explaining survey question */}
                <div className="text-[#6a9955] leading-normal select-none">
                  <span>{"/**"}</span>
                  <br />
                  <span>{` * SURVEY: ${title}`}</span>
                  <br />
                  {description && (
                    <>
                      <span>{` * DESC:   ${description}`}</span>
                      <br />
                    </>
                  )}
                  <span>{` * FIELD:  question_${activeFieldIndex + 1} (${activeField.type})`}</span>
                  <br />
                  <span>{` * REQ:    ${activeField.required ? "true" : "false"}`}</span>
                  <br />
                  <span>{" */"}</span>
                </div>

                {/* The Code block input rendering */}
                <div className="bg-[#181818] border border-[#2d2d2d] rounded p-6 space-y-6 max-w-xl shadow-inner font-mono text-sm leading-relaxed">
                  <div>
                    <span className="text-[#6a9955]">{`// Prompt: ${activeField.prompt}`}</span>
                    {activeField.required && <span className="text-red-500 font-bold ml-1">*</span>}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-[#c678dd]">const</span>
                      <span className="text-[#e06c75]">answer</span>
                      <span>: </span>
                      <span className="text-[#abb2bf]">{activeField.type === "multiple_choice" ? "string[]" : "string"}</span>
                      <span> = </span>
                    </div>

                    {/* Inputs */}
                    <div className="pl-6 w-full">
                      {(activeField.type === "short_text" || activeField.type === "email" || activeField.type === "number" || activeField.type === "date") && (
                        <div className="flex items-center text-[#98c379] font-mono w-full">
                          <span>"</span>
                          <input
                            type={activeField.type === "number" ? "number" : activeField.type === "email" ? "email" : activeField.type === "date" ? "date" : "text"}
                            value={answers[activeField.id] || ""}
                            onChange={(e) => handleAnswer(activeField.id, e.target.value)}
                            className="bg-transparent border-none text-[#98c379] font-mono text-sm focus:outline-none focus:ring-0 caret-white select-text w-full max-w-md px-0.5 py-0"
                            placeholder="Type input here..."
                          />
                          <span>";</span>
                        </div>
                      )}

                      {activeField.type === "long_text" && (
                        <div className="flex items-start text-[#98c379] font-mono w-full">
                          <span className="mt-0.5">`</span>
                          <textarea
                            value={answers[activeField.id] || ""}
                            onChange={(e) => handleAnswer(activeField.id, e.target.value)}
                            rows={3}
                            className="bg-transparent border-none text-[#98c379] font-mono text-sm focus:outline-none focus:ring-0 caret-white select-text w-full resize-y px-0.5 py-0"
                            placeholder="Type multi-line input here..."
                          />
                          <span className="mt-auto">`;</span>
                        </div>
                      )}

                      {activeField.type === "single_select" && activeField.options && (
                        <div className="text-[#abb2bf] space-y-2 select-none">
                          <span className="text-[#6a9955] block">// Click option to select value</span>
                          <span>{"["}</span>
                          <div className="space-y-1.5 pl-6">
                            {activeField.options.map((opt: string, index: number) => {
                              const isSelected = answers[activeField.id] === opt;
                              return (
                                <div 
                                  key={index}
                                  onClick={() => handleAnswer(activeField.id, opt)}
                                  className={`cursor-pointer hover:bg-white/5 px-2 py-0.5 rounded transition-colors flex items-center gap-2 ${
                                    isSelected ? "text-[#98c379] font-bold" : "text-[#abb2bf]"
                                  }`}
                                >
                                  <span>{isSelected ? "●" : "○"}</span>
                                  <span>{`"${opt}"`}</span>
                                  {isSelected && <span className="text-[#6a9955] text-xs font-normal">// [Selected]</span>}
                                </div>
                              );
                            })}
                          </div>
                          <span>{"];"}</span>
                        </div>
                      )}

                      {activeField.type === "multiple_choice" && activeField.options && (
                        <div className="text-[#abb2bf] space-y-2 select-none">
                          <span className="text-[#6a9955] block">// Click options to select array elements</span>
                          <span>{"["}</span>
                          <div className="space-y-1.5 pl-6">
                            {activeField.options.map((opt: string, index: number) => {
                              const currentSelections = (answers[activeField.id] as string[]) || [];
                              const isSelected = currentSelections.includes(opt);
                              
                              return (
                                <div 
                                  key={index}
                                  onClick={() => {
                                    const newSelections = isSelected 
                                      ? currentSelections.filter((s: string) => s !== opt)
                                      : [...currentSelections, opt];
                                    handleAnswer(activeField.id, newSelections);
                                  }}
                                  className={`cursor-pointer hover:bg-white/5 px-2 py-0.5 rounded transition-colors flex items-center gap-2 ${
                                    isSelected ? "text-[#98c379] font-bold" : "text-[#abb2bf]"
                                  }`}
                                >
                                  <span>{isSelected ? "☑" : "☐"}</span>
                                  <span>{`"${opt}"`}</span>
                                  {isSelected && <span className="text-[#6a9955] text-xs font-normal">// [Array Element]</span>}
                                </div>
                              );
                            })}
                          </div>
                          <span>{"];"}</span>
                        </div>
                      )}
                    </div>

                    {/* Problem / Error inline block */}
                    {errors[activeField.id] && (
                      <div className="pl-6 pt-3 text-red-400 flex items-start gap-1.5 select-none leading-snug">
                        <span>❌</span>
                        <div>
                          <div className="underline decoration-wavy decoration-red-500 font-bold">
                            {`Error: ${errors[activeField.id]}`}
                          </div>
                          <div className="text-[11px] text-red-400/70 font-mono mt-1">// Value is required for compiler execution</div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Sidebar Navigation Helpers */}
                <div className="flex gap-4 select-none pt-4">
                  <button
                    onClick={() => {
                      if (activeFieldIndex > 0) {
                        setActiveFieldIndex((prev) => prev - 1);
                      }
                    }}
                    disabled={activeFieldIndex === 0}
                    className="px-4 py-1.5 bg-[#333333] hover:bg-[#3c3c3c] border border-[#474747] text-white disabled:opacity-40 rounded text-xs cursor-pointer font-bold select-none focus:outline-none transition-colors"
                  >
                    ◀ Prev Question
                  </button>
                  <button
                    onClick={() => {
                      if (activeFieldIndex < schema.length - 1) {
                        setActiveFieldIndex((prev) => prev + 1);
                      }
                    }}
                    disabled={activeFieldIndex === schema.length - 1}
                    className="px-4 py-1.5 bg-[#333333] hover:bg-[#3c3c3c] border border-[#474747] text-white disabled:opacity-40 rounded text-xs cursor-pointer font-bold select-none focus:outline-none transition-colors"
                  >
                    Next Question ▶
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#858585] text-xs">
                This workspace contains no active questions.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* VS Code Bottom Status Bar */}
      <div className="bg-[#007acc] h-[25px] shrink-0 flex items-center justify-between px-3 text-xs text-white select-none leading-none z-20">
        <div className="flex items-center gap-3">
          <span className="font-bold">✓ Ready</span>
          <span>|</span>
          <span>Parcha.cli v1.0.0</span>
          <span>|</span>
          <button 
            onClick={validateAndSubmit}
            className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 active:bg-white/30 px-2 py-0.5 rounded cursor-pointer border-none font-bold"
          >
            ▶ Run Survey
          </button>
        </div>

        <div className="flex items-center gap-3">
          {numErrors > 0 ? (
            <span className="bg-red-600 px-2 py-0.5 rounded font-bold animate-pulse text-[11px] flex items-center gap-1">
              ⚠️ {numErrors} Problem{numErrors > 1 ? "s" : ""}
            </span>
          ) : (
            <span>0 Problems</span>
          )}
          <span>|</span>
          <span>UTF-8</span>
          <span>|</span>
          <span>TypeScript</span>
        </div>
      </div>

    </div>
  );
}
