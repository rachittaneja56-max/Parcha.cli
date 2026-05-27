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
  appState = "live",
  errorMsg: globalErrorMsg,
  onLoginClick,
  onPasswordSubmit,
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
      if (field.required && field.type === "checkbox" && val !== "true") {
        newErrors[field.id] = "This field is required.";
        hasError = true;
      } else if (field.required && field.type !== "checkbox" && (!val || (typeof val === "string" && val.trim() === "") || (Array.isArray(val) && val.length === 0))) {
        newErrors[field.id] = "This field is required.";
        hasError = true;
      } else if (val) {
        if (field.type === "email" && typeof val === "string") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            newErrors[field.id] = "Invalid email format.";
            hasError = true;
          }
        }
        if (field.type === "date" && typeof val === "string") {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            newErrors[field.id] = "Use YYYY-MM-DD format.";
            hasError = true;
          }
        }
        if (field.type === "single_select" && typeof val === "string") {
          if (!field.options?.includes(val)) {
            newErrors[field.id] = "Please select a valid option.";
            hasError = true;
          }
        }
        if (field.type === "dropdown" && typeof val === "string") {
          if (!field.options?.includes(val)) {
            newErrors[field.id] = "Please select a valid option.";
            hasError = true;
          }
        }
        if (field.type === "rating" && typeof val === "string") {
          const num = parseInt(val, 10);
          if (isNaN(num) || num < 1 || num > 5) {
            newErrors[field.id] = "Please select a valid rating.";
            hasError = true;
          }
        }
        if (field.type === "multiple_choice" && Array.isArray(val)) {
          const isValid = val.every(v => field.options?.includes(v));
          if (!isValid) {
            newErrors[field.id] = "Please select valid options.";
            hasError = true;
          }
        }
      }
    });

    if (hasError) {
      setErrors(newErrors);
      const firstErrIndex = schema.findIndex((f) => newErrors[f.id]);
      if (firstErrIndex !== -1) {
        setActiveFieldIndex(firstErrIndex);
      }
      return;
    }

    if (isPreview) {
      setIsSubmitted(true);
      return;
    }

    if (onSubmit) {
      try {
        onSubmit(answers);
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

  if (isPreview) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-[#dcdcdc] font-mono p-8 text-center select-none min-h-[500px]">
        <div className="bg-[#252526] border border-[#3c3c3c] p-8 rounded max-w-md w-full shadow-2xl space-y-4">
          <div className="text-3xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-[#e5c07b]">Preview Not Available</h2>
          <p className="text-sm text-[#858585] leading-relaxed">
            The Code Editor theme is optimized for full-screen immersive experiences and cannot be previewed in this small pane.
          </p>
          <div className="pt-4 border-t border-[#3c3c3c] mt-4">
            <p className="text-xs text-[#6a9955]">
              {"// Please publish the form and view it via the public link."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (appState === "error") {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-[#D4D4D4] font-['Consolas',_'Courier_New',_monospace] p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-[#252526] border border-[#454545] rounded-md overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-[#323233] px-3 py-2 flex items-center gap-2 border-b border-[#454545] text-xs">
            <span className="text-[#E51400]">src</span>
            <span className="text-[#858585]">&gt;</span>
            <span className="text-[#E51400]">components</span>
            <span className="text-[#858585]">&gt;</span>
            <span className="text-[#cccccc]">ErrorBoundary.tsx</span>
          </div>
          <div className="p-6 flex flex-col">
            <div className="flex gap-4">
              <div className="flex flex-col text-right text-[#858585] text-sm select-none pr-4 border-r border-[#454545]">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
              </div>
              <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                <span className="text-[#569CD6]">throw new</span> <span className="text-[#4EC9B0]">Error</span><span className="text-[#cccccc]">(</span>
                <br/>
                <span className="text-[#CE9178] ml-4">{`"${globalErrorMsg || "An unexpected rendering error occurred."}"`}</span>
                <br/>
                <span className="text-[#cccccc]">);</span>
                <br/>
                <br/>
                <span className="text-[#6A9955] italic">{'// The application state could not be recovered.'}</span>
                <br/>
                <span className="text-[#6A9955] italic">{'// Please check your configuration.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === "auth_prompt") {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-[#D4D4D4] font-['Consolas',_'Courier_New',_monospace] p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-[#252526] border border-[#454545] rounded-md overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-[#323233] px-3 py-2 flex items-center gap-2 border-b border-[#454545] text-xs">
            <span className="text-[#DCDCAA]">auth</span>
            <span className="text-[#858585]">&gt;</span>
            <span className="text-[#cccccc]">middleware.ts</span>
          </div>
          <div className="p-6 flex flex-col">
            <div className="flex gap-4">
              <div className="flex flex-col text-right text-[#858585] text-sm select-none pr-4 border-r border-[#454545]">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
              </div>
              <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed flex-1">
                <span className="text-[#6A9955] italic">{'/**'}</span>
                <br/>
                <span className="text-[#6A9955] italic">{' * @route /f/' + formName.replace(/\s+/g, '-').toLowerCase()}</span>
                <br/>
                <span className="text-[#6A9955] italic">{' * @description This route is protected. Authentication is required.'}</span>
                <br/>
                <span className="text-[#6A9955] italic">{' */'}</span>
                <br/>
                <span className="text-[#569CD6]">if</span> <span className="text-[#cccccc]">(</span><span className="text-[#569CD6]">!</span><span className="text-[#9CDCFE]">session</span><span className="text-[#cccccc]">) {'{'}</span>
                <br/>
                <span className="ml-4 text-[#569CD6]">return</span> <span className="text-[#DCDCAA]">redirect</span><span className="text-[#cccccc]">(</span><span className="text-[#CE9178]">"/auth/login"</span><span className="text-[#cccccc]">);</span>
                <br/>
                <span className="text-[#cccccc]">{'}'}</span>
                <div className="mt-8 flex gap-3">
                  <button onClick={onLoginClick} className="bg-[#0E639C] hover:bg-[#1177BB] text-white px-4 py-1.5 rounded-sm text-sm transition-colors border border-transparent">
                    Execute Login
                  </button>
                  <button onClick={() => window.location.href = '/'} className="bg-[#3C3C3C] hover:bg-[#4A4A4A] text-[#CCCCCC] px-4 py-1.5 rounded-sm text-sm transition-colors border border-[#454545]">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === "password_prompt") {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-[#D4D4D4] font-['Consolas',_'Courier_New',_monospace] p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-[#252526] border border-[#454545] rounded-md overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-[#323233] px-3 py-2 flex items-center gap-2 border-b border-[#454545] text-xs">
            <span className="text-[#CE9178]">security</span>
            <span className="text-[#858585]">&gt;</span>
            <span className="text-[#cccccc]">decrypt.ts</span>
          </div>
          <div className="p-6 flex flex-col">
            <div className="flex gap-4">
              <div className="flex flex-col text-right text-[#858585] text-sm select-none pr-4 border-r border-[#454545]">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
              </div>
              <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed w-full">
                <span className="text-[#6A9955] italic">{'// Form payload is encrypted.'}</span>
                <br/>
                <span className="text-[#569CD6]">const</span> <span className="text-[#9CDCFE]">password</span> <span className="text-[#D4D4D4]">=</span> <span className="text-[#DCDCAA]">await</span> <span className="text-[#4EC9B0]">Prompt</span><span className="text-[#cccccc]">.</span><span className="text-[#DCDCAA]">ask</span><span className="text-[#cccccc]">(</span><span className="text-[#CE9178]">"Enter password:"</span><span className="text-[#cccccc]">);</span>
                <br/>
                <br/>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const input = new FormData(e.currentTarget).get("pwd") as string;
                  if (onPasswordSubmit) onPasswordSubmit(input);
                }} className="flex flex-col mt-2">
                  <div className="flex items-center">
                    <span className="text-[#CE9178]">"</span>
                    <input
                      type="password"
                      name="pwd"
                      className="bg-transparent border-none outline-none text-[#CE9178] px-0 py-0 flex-1 min-w-[200px]"
                      autoFocus
                    />
                    <span className="text-[#CE9178]">"</span><span className="animate-pulse text-[#D4D4D4]">_</span>
                  </div>
                  {globalErrorMsg && (
                    <div className="mt-2 text-[#F14C4C]">
                      <span className="text-[#F14C4C]">Error</span>: {globalErrorMsg}
                    </div>
                  )}
                  <button type="submit" className="mt-6 self-start bg-[#0E639C] hover:bg-[#1177BB] text-white px-4 py-1.5 rounded-sm text-sm transition-colors border border-transparent">
                    Run Decryption
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#1e1e1e] text-[#dcdcdc] font-mono flex flex-col select-none overflow-hidden min-h-[500px]">
      
      <div className="bg-[#3c3c3c] h-[35px] shrink-0 border-b border-[#252526] flex items-center justify-between px-3 text-xs text-[#a3a3a3]">
        <div className="flex items-center gap-2">
          <span className="text-[#007acc] text-sm">⎋</span>
          <span className="truncate">{title} - Visual Studio Code</span>
        </div>
        <div className="hidden md:flex items-center gap-1 bg-[#2d2d2d] border border-[#474747] px-8 py-0.5 rounded text-[11px] text-[#cccccc] max-w-[400px] truncate">
          🔎 {title} (Workspace)
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={validateAndSubmit}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#007acc] text-white hover:bg-[#0062a3] active:bg-[#004e82] rounded text-[11px] font-bold cursor-pointer transition-colors shadow-sm select-none"
            title="Deploy and Run Survey"
          >
            <span className="text-[10px]">▶</span> Run Survey
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        <div className="w-[48px] bg-[#333333] shrink-0 border-r border-[#252526] flex flex-col items-center py-4 gap-5 text-lg text-[#858585]">
          <div className="text-white cursor-pointer hover:text-white" title="Explorer">📂</div>
          <div className="cursor-pointer hover:text-white" title="Search">🔍</div>
          <div className="cursor-pointer hover:text-white" title="Source Control">🌿</div>
          <div className="cursor-pointer hover:text-white" title="Run & Debug">🐞</div>
          <div className="cursor-pointer hover:text-white" title="Extensions">🧩</div>
        </div>

        <div className="w-[220px] bg-[#252526] shrink-0 border-r border-[#1e1e1e] hidden lg:flex flex-col select-none">
          <div className="px-3 py-2 text-[10px] uppercase font-bold text-[#808080] tracking-wider border-b border-[#1e1e1e] flex justify-between items-center">
            <span>Explorer</span>
            <span>•••</span>
          </div>
          <div className="p-2 text-xs text-[#cccccc] font-bold flex items-center gap-1 select-none">
            <span>📂</span> <span className="truncate">{title.toLowerCase().replace(/\s+/g, "-")}</span>
          </div>
          
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
                      {field.type === "multiple_choice" || field.type === "single_select" || field.type === "dropdown" || field.type === "checkbox" || field.type === "rating" ? "🧩" : "📝"}
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

          <div className="flex-1 p-6 overflow-auto select-text font-mono text-sm leading-relaxed">
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
                  <span className="text-[#98c379]">"Submission Received. You may close this window."</span>
                  <span>;</span>
                </div>
                <div className="text-[#c678dd]">{"}"}</div>
              </div>
            ) : activeField ? (
              <div className="space-y-6">
                
                <div className="text-[#6a9955] leading-normal select-none whitespace-pre">
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

                <div className="bg-[#181818] border border-[#2d2d2d] rounded p-6 space-y-6 min-w-fit max-w-2xl shadow-inner font-mono text-sm leading-relaxed whitespace-pre">
                  <div>
                    <span className="text-[#6a9955]">{`// Prompt: ${activeField.prompt}`}</span>
                    {activeField.required && <span className="text-red-500 font-bold ml-1">*</span>}
                    {activeField.description && (
                      <div className="text-[#6a9955] mt-1">{`// Desc: ${activeField.description}`}</div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-wrap items-center gap-2 select-none w-full">
                      <span className="text-[#c678dd]">const</span>
                      <span className="text-[#e06c75]">answer</span>
                      <span>: </span>
                      <span className="text-[#abb2bf]">{activeField.type === "multiple_choice" ? "string[]" : activeField.type === "file_upload" ? "File" : activeField.type === "checkbox" ? "boolean" : activeField.type === "rating" ? "number" : "string"}</span>
                      <span> = </span>

                      {(activeField.type === "short_text" || activeField.type === "email" || activeField.type === "number" || activeField.type === "date") && (
                        <div className="flex items-center text-[#98c379] font-mono flex-1 min-w-[200px]">
                          <span>"</span>
                          <input
                            type={activeField.type === "number" ? "number" : activeField.type === "email" ? "email" : activeField.type === "date" ? "date" : "text"}
                            value={answers[activeField.id] || ""}
                            onChange={(e) => handleAnswer(activeField.id, e.target.value)}
                            className="bg-transparent border-none text-[#98c379] font-mono text-sm focus:outline-none focus:ring-0 caret-white select-text w-full px-0.5 py-0 [color-scheme:dark]"
                            placeholder="Type input here..."
                          />
                          <span>";</span>
                        </div>
                      )}

                      {activeField.type === "file_upload" && (
                        <div className="flex items-center flex-1 min-w-[200px] mt-2 sm:mt-0 w-full sm:w-auto">
                          <label className="cursor-pointer bg-[#3C3C3C] hover:bg-[#4A4A4A] text-[#CCCCCC] px-3 py-1.5 rounded-sm text-xs transition-colors border border-[#454545] font-sans flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                            BrowseFiles()
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAnswer(activeField.id, file.name);
                              }} 
                            />
                          </label>
                          {answers[activeField.id] && (
                            <span className="text-[#98c379] ml-3 text-xs italic">
                              // {answers[activeField.id]}
                            </span>
                          )}
                          <span className="text-[#cccccc] ml-1">;</span>
                        </div>
                      )}
                    </div>

                    <div className="pl-6 w-full">

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

                      {activeField.type === "dropdown" && activeField.options && (
                        <div className="text-[#abb2bf] space-y-2 select-none">
                          <span className="text-[#6a9955] block">// Click option to select value (Dropdown)</span>
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

                      {activeField.type === "checkbox" && (
                        <div className="text-[#abb2bf] space-y-2 select-none flex items-center gap-2">
                          <div
                            onClick={() => handleAnswer(activeField.id, answers[activeField.id] === "true" ? "false" : "true")}
                            className="cursor-pointer bg-[#3C3C3C] hover:bg-[#4A4A4A] text-[#CCCCCC] px-3 py-1 rounded-sm text-xs transition-colors border border-[#454545]"
                          >
                            {answers[activeField.id] === "true" ? "☑ checked = true" : "☐ checked = false"}
                          </div>
                        </div>
                      )}

                      {activeField.type === "rating" && (
                        <div className="text-[#abb2bf] space-y-2 select-none">
                          <span className="text-[#6a9955] block">// Assign rating (1-5)</span>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((num) => {
                              const isSelected = answers[activeField.id] === num.toString();
                              return (
                                <div 
                                  key={num}
                                  onClick={() => handleAnswer(activeField.id, num.toString())}
                                  className={`cursor-pointer hover:bg-white/5 px-3 py-1 rounded transition-colors border ${
                                    isSelected ? "border-[#007acc] text-[#98c379] font-bold" : "border-[#3c3c3c] text-[#abb2bf]"
                                  }`}
                                >
                                  <span>{num}</span>
                                </div>
                              );
                            })}
                          </div>
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
