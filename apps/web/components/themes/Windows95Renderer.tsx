"use client";

import React, { useState, useEffect } from "react";
import type { ThemeRendererProps } from "./TerminalRenderer";
import { Folder, FileText, CheckSquare, List } from "lucide-react";

export function Windows95Renderer({
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
}: ThemeRendererProps & { form?: { title?: string; description?: string } }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isPreview && onTrackView) {
      onTrackView();
    }
  }, [isPreview, onTrackView]);

  const handleAnswer = (fieldId: string, val: string | string[]) => {
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
      return;
    }

    if (isPreview) {
      setIsSubmitted(true);
      return;
    }

    if (onSubmit) {
      try {
        onSubmit(answers as unknown as Record<string, string>);
        setIsSubmitted(true);
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "An error occurred");
      }
    }
  };

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case "single_select":
        return <List className="w-4 h-4 text-teal-900 shrink-0 mt-0.5" />;
      case "multiple_choice":
        return <CheckSquare className="w-4 h-4 text-teal-900 shrink-0 mt-0.5" />;
      case "long_text":
      case "file_upload":
      case "payment":
        return <Folder className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />;
      default:
        return <FileText className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />;
    }
  };

  const title = form?.title || formName || "Untitled Form";
  const description = form?.description || "";

  if (appState === "error") {
    return (
      <div className="min-h-screen bg-teal-800 p-4 sm:p-10 flex flex-col items-center justify-center font-['Tahoma',_'Verdana',_'sans-serif'] select-none overflow-hidden relative">
        <div className="w-full max-w-sm bg-[#c0c0c0] border-4 border-t-white border-l-white border-b-slate-700 border-r-slate-700 p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col relative z-10">
          <div className="bg-[#000080] text-white font-bold px-2 py-1 flex justify-between items-center mb-2 select-none">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="text-xs">❌</span>
              <span className="truncate">Application Error</span>
            </div>
            <button onClick={() => window.location.href = '/'} className="bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black w-4 h-4 flex items-center justify-center font-bold text-[10px] active:border-t-black active:border-l-black active:border-b-white active:border-r-white cursor-pointer select-none focus:outline-none">
              X
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl select-none shrink-0 shadow-sm border border-slate-700">
                X
              </div>
              <p className="text-sm text-slate-800 font-sans whitespace-pre-wrap leading-tight mt-1">{globalErrorMsg || "A fatal exception has occurred in FormRenderer.vxd."}</p>
            </div>
            <div className="flex justify-center pt-4">
              <button onClick={() => window.location.href = '/'} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-8 py-1 font-bold text-xs active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-pointer focus:outline-none outline-none focus-visible:ring-1 focus-visible:ring-black border-dotted focus-visible:border-black">
                OK
              </button>
            </div>
          </div>
        </div>
        {/* Fake Taskbar */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-[#c0c0c0] border-t-2 border-t-white flex items-center px-1 z-50">
          <button className="flex items-center gap-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-2 py-0.5 font-bold text-xs active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-default">
            <span className="text-blue-700 italic font-serif">P</span> Start
          </button>
          <div className="ml-2 border-l border-slate-500 border-r border-white h-5"></div>
          <div className="ml-2 flex items-center gap-1 bg-[#c0c0c0] border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white px-2 py-0.5 font-bold text-xs">
            <span className="text-xs">❌</span> Error
          </div>
        </div>
      </div>
    );
  }

  if (appState === "auth_prompt") {
    return (
      <div className="min-h-screen bg-teal-800 p-4 sm:p-10 flex flex-col items-center justify-center font-['Tahoma',_'Verdana',_'sans-serif'] select-none overflow-hidden relative">
        <div className="w-full max-w-sm bg-[#c0c0c0] border-4 border-t-white border-l-white border-b-slate-700 border-r-slate-700 p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col relative z-10">
          <div className="bg-[#000080] text-white font-bold px-2 py-1 flex justify-between items-center mb-2 select-none">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="text-xs">⚠️</span>
              <span className="truncate">Security Warning</span>
            </div>
            <button onClick={() => window.location.href = '/'} className="bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black w-4 h-4 flex items-center justify-center font-bold text-[10px] active:border-t-black active:border-l-black active:border-b-white active:border-r-white cursor-pointer select-none focus:outline-none">
              X
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-400 border border-slate-700 shadow-sm flex items-center justify-center text-black font-bold text-xl select-none shrink-0" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}>
                !
              </div>
              <p className="text-sm text-slate-800 font-sans leading-tight mt-1">You must be logged in to view this form. Would you like to log in now?</p>
            </div>
            <div className="flex justify-center gap-2 pt-4">
              <button onClick={onLoginClick} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-6 py-1 font-bold text-xs active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-pointer focus:outline-none outline-none focus-visible:ring-1 focus-visible:ring-black border-dotted focus-visible:border-black">
                Log In
              </button>
              <button onClick={() => window.location.href = '/'} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-6 py-1 font-bold text-xs active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-pointer focus:outline-none">
                Cancel
              </button>
            </div>
          </div>
        </div>
        {/* Fake Taskbar */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-[#c0c0c0] border-t-2 border-t-white flex items-center px-1 z-50">
          <button className="flex items-center gap-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-2 py-0.5 font-bold text-xs active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-default">
            <span className="text-blue-700 italic font-serif">P</span> Start
          </button>
          <div className="ml-2 border-l border-slate-500 border-r border-white h-5"></div>
          <div className="ml-2 flex items-center gap-1 bg-[#c0c0c0] border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white px-2 py-0.5 font-bold text-xs">
            <span className="text-xs">⚠️</span> Warning
          </div>
        </div>
      </div>
    );
  }

  if (appState === "password_prompt") {
    return (
      <div className="min-h-screen bg-teal-800 p-4 sm:p-10 flex flex-col items-center justify-center font-['Tahoma',_'Verdana',_'sans-serif'] select-none overflow-hidden relative">
        <div className="w-full max-w-sm bg-[#c0c0c0] border-4 border-t-white border-l-white border-b-slate-700 border-r-slate-700 p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col relative z-10">
          <div className="bg-[#000080] text-white font-bold px-2 py-1 flex justify-between items-center mb-2 select-none">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="text-xs">🔑</span>
              <span className="truncate">Enter Password</span>
            </div>
            <button onClick={() => window.location.href = '/'} className="bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black w-4 h-4 flex items-center justify-center font-bold text-[10px] active:border-t-black active:border-l-black active:border-b-white active:border-r-white cursor-pointer select-none focus:outline-none">
              X
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded bg-[#c0c0c0] border border-slate-500 shadow-sm flex items-center justify-center text-slate-800 font-bold text-lg select-none shrink-0">
                🔑
              </div>
              <div className="w-full">
                <p className="text-sm text-slate-800 font-sans leading-tight mb-3">Please enter the password to access this form:</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const input = new FormData(e.currentTarget).get("pwd") as string;
                  if (onPasswordSubmit) onPasswordSubmit(input);
                }}>
                  <input
                    type="password"
                    name="pwd"
                    className="w-full bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-1 outline-none font-['Tahoma',_'Verdana',_'sans-serif'] text-sm text-slate-900 focus:bg-white mb-2 shadow-sm"
                    autoFocus
                  />
                  {globalErrorMsg && <p className="text-red-700 text-xs font-bold mb-2">{globalErrorMsg}</p>}
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-6 py-1 font-bold text-xs active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-pointer focus:outline-none outline-none focus-visible:ring-1 focus-visible:ring-black border-dotted focus-visible:border-black">
                      OK
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* Fake Taskbar */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-[#c0c0c0] border-t-2 border-t-white flex items-center px-1 z-50">
          <button className="flex items-center gap-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-2 py-0.5 font-bold text-xs active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-default">
            <span className="text-blue-700 italic font-serif">P</span> Start
          </button>
          <div className="ml-2 border-l border-slate-500 border-r border-white h-5"></div>
          <div className="ml-2 flex items-center gap-1 bg-[#c0c0c0] border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white px-2 py-0.5 font-bold text-xs">
            <span className="text-xs">🔑</span> Security
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-800 p-4 sm:p-10 flex flex-col font-['Tahoma',_'Verdana',_'sans-serif'] select-none overflow-y-auto">
      <div className="w-full max-w-xl mx-auto bg-[#c0c0c0] border-4 border-t-white border-l-white border-b-slate-700 border-r-slate-700 p-1 shadow-2xl flex flex-col">
        
        <div className="bg-[#000080] text-white font-bold px-2 py-1 flex justify-between items-center mb-2 select-none">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <span className="text-xs">💾</span>
            <span className="truncate">{title}</span>
          </div>
          <button 
            onClick={() => { if (isPreview) alert("Close window simulation in preview mode."); }}
            className="bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black w-4 h-4 flex items-center justify-center font-bold text-[10px] active:border-t-black active:border-l-black active:border-b-white active:border-r-white cursor-pointer select-none focus:outline-none"
          >
            X
          </button>
        </div>

        <div className="p-4 space-y-6">
          {isSubmitted ? (
            <div className="bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-teal-100 border border-teal-800 rounded-full flex items-center justify-center text-teal-800 text-2xl mx-auto font-bold">
                ✓
              </div>
              <h2 className="text-lg font-bold text-[#000080]">Submission Received</h2>
              <p className="text-sm text-slate-800 font-sans">Submission Received. You may close this window.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-4 space-y-2 select-text shadow-sm">
                <h1 className="text-xl font-bold text-[#000080]">{title}</h1>
                {description && <p className="text-xs text-slate-600 font-['Tahoma',_'Verdana',_'sans-serif'] leading-normal">{description}</p>}
                <div className="text-[10px] text-slate-500 pt-2 font-['Tahoma',_'Verdana',_'sans-serif']">* Fields marked with an asterisk are required.</div>
              </div>

              <div className="space-y-5">
                {schema.map((field) => {
                  const isError = !!errors[field.id];

                  return (
                    <div 
                      key={field.id} 
                      className={`p-4 border-2 border-t-white border-l-white border-b-slate-600 border-r-slate-600 bg-[#c0c0c0] relative ${
                        isError ? "bg-red-50/15" : ""
                      }`}
                    >
                      <div className="flex flex-col mb-2">
                        <label className="flex items-start gap-2 text-sm font-bold text-slate-900 select-none leading-tight">
                          {getFieldIcon(field.type)}
                          <span>
                            {field.prompt}
                            {field.required && <span className="text-red-700 ml-1 font-bold">*</span>}
                          </span>
                        </label>
                        {field.description && (
                          <div className="text-xs text-slate-700 mt-1 pl-6">
                            {field.description}
                          </div>
                        )}
                      </div>

                      <div className="w-full mt-2 pl-6">
                        {((field.type === "short_text" || field.type === "file_upload" || field.type === "payment") || field.type === "email" || field.type === "number" || field.type === "date") && (
                          <input
                            type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text"}
                            value={answers[field.id] || ""}
                            onChange={(e) => handleAnswer(field.id, e.target.value)}
                            className="w-full bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-2 outline-none font-['Tahoma',_'Verdana',_'sans-serif'] text-sm text-slate-900 focus:bg-white [color-scheme:light] min-h-[36px]"
                          />
                        )}

                        {field.type === "long_text" && (
                          <textarea
                            value={answers[field.id] || ""}
                            onChange={(e) => handleAnswer(field.id, e.target.value)}
                            rows={3}
                            className="w-full bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-2 outline-none font-['Tahoma',_'Verdana',_'sans-serif'] text-sm text-slate-900 resize-y focus:bg-white"
                          />
                        )}

                        {field.type === "single_select" && field.options && (
                          <div className="space-y-1.5 mt-1 select-none">
                            {field.options.map((opt: string, index: number) => {
                              const isSelected = answers[field.id] === opt;
                              return (
                                <label key={index} className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-900">
                                  <input 
                                    type="radio" 
                                    name={field.id}
                                    checked={isSelected}
                                    onChange={() => handleAnswer(field.id, opt)}
                                    className="accent-[#000080] w-4 h-4 cursor-pointer"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {field.type === "multiple_choice" && field.options && (
                          <div className="space-y-1.5 mt-1 select-none">
                            {field.options.map((opt: string, index: number) => {
                              const currentSelections = (answers[field.id] as string[]) || [];
                              const isSelected = currentSelections.includes(opt);
                              
                              return (
                                <label key={index} className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-900">
                                  <input 
                                    type="checkbox" 
                                    name={`${field.id}-${index}`}
                                    checked={isSelected}
                                    onChange={() => {
                                      const newSelections = isSelected 
                                        ? currentSelections.filter((s: string) => s !== opt)
                                        : [...currentSelections, opt];
                                      handleAnswer(field.id, newSelections);
                                    }}
                                    className="accent-[#000080] w-4 h-4 cursor-pointer"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                    
                        {isError && (
                          <div className="text-red-700 text-xs font-bold mt-2 flex items-center gap-1.5">
                            <span>❌</span>
                            <span>{errors[field.id]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {schema.length > 0 && (
                <div className="flex justify-end mt-6 pt-4 border-t border-slate-400">
                  <button
                    onClick={validateAndSubmit}
                    className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-6 py-1 font-bold text-sm text-slate-900 active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-pointer select-none focus:outline-none"
                  >
                    Submit
                  </button>
                </div>
              )}

              {schema.length === 0 && (
                <div className="bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-6 text-center text-xs text-slate-500 font-mono">
                  There are no questions in this dialog.
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
