"use client";

import React, { useState, useEffect } from "react";
import type { ThemeRendererProps } from "./TerminalRenderer";

export function StandardFormRenderer({
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
        newErrors[field.id] = "This is a required question";
        hasError = true;
      } else if (val) {
        if (field.type === "email" && typeof val === "string") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            newErrors[field.id] = "Invalid email format";
            hasError = true;
          }
        }
        if (field.type === "date" && typeof val === "string") {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            newErrors[field.id] = "Use YYYY-MM-DD format";
            hasError = true;
          }
        }
        if (field.type === "single_select" && typeof val === "string") {
          if (!field.options?.includes(val)) {
            newErrors[field.id] = "Please select a valid option";
            hasError = true;
          }
        }
        if (field.type === "multiple_choice" && Array.isArray(val)) {
          const isValid = val.every(v => field.options?.includes(v));
          if (!isValid) {
            newErrors[field.id] = "Please select valid options";
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F0EBF8] text-slate-900 font-sans p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-slate-200 border-t-8 border-t-purple-600 p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-medium mb-4 text-purple-900">Submission Received</h2>
            <p className="text-slate-600 leading-relaxed">Submission Received. You may close this window.</p>
          </div>
        </div>
      </div>
    );
  }

  if (appState === "error") {
    return (
      <div className="min-h-screen bg-[#F0EBF8] text-slate-900 font-sans p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-xl shadow-red-900/5 border border-red-100 border-t-8 border-t-red-500 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-48 h-48 text-red-500"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Form Unavailable</h2>
          <p className="text-slate-600 whitespace-pre-wrap">{globalErrorMsg || "An unexpected error occurred."}</p>
        </div>
      </div>
    );
  }

  if (appState === "auth_prompt") {
    return (
      <div className="min-h-screen bg-[#F0EBF8] text-slate-900 font-sans p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl shadow-purple-900/5 border border-slate-200 border-t-8 border-t-purple-600 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-48 h-48 text-purple-600"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="relative">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-purple-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-sm">You need to log in to your account to securely access and submit this form.</p>
            <div className="flex flex-col gap-3">
              <button onClick={onLoginClick} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm shadow-purple-600/20 transition-all hover:shadow-md hover:shadow-purple-600/30">
                Log In to Continue
              </button>
              <button onClick={() => window.location.href = '/'} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-medium px-6 py-2.5 rounded-lg transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === "password_prompt") {
    return (
      <div className="min-h-screen bg-[#F0EBF8] text-slate-900 font-sans p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl shadow-purple-900/5 border border-slate-200 border-t-8 border-t-purple-600 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-48 h-48 text-purple-600"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          </div>
          <div className="relative">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-purple-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Protected Form</h2>
            <p className="text-slate-600 mb-6 text-sm">This form is password protected. Please enter the password to access the contents.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = new FormData(e.currentTarget).get("pwd") as string;
              if (onPasswordSubmit) onPasswordSubmit(input);
            }}>
              <input
                type="password"
                name="pwd"
                placeholder="Enter password"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all font-medium"
                autoFocus
              />
              {globalErrorMsg && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-md border border-red-100">{globalErrorMsg}</p>}
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm shadow-purple-600/20 transition-all hover:shadow-md hover:shadow-purple-600/30">
                Unlock Form
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const title = form?.title || formName || "Untitled Form";
  const description = form?.description || "";

  return (
    <div className="h-full bg-slate-100 text-slate-800 font-sans py-12 px-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full">
        
        <div className="bg-white border-t-8 border-t-purple-600 rounded-lg p-8 shadow-sm border border-slate-200 mb-4">
          <h1 className="text-3xl font-normal text-slate-800">{title}</h1>
          {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
          <div className="text-xs text-red-600 mt-6">* Indicates required question</div>
        </div>

        {schema.map((field) => {
          const isError = !!errors[field.id];

          return (
            <div
              key={field.id}
              className={`bg-white rounded-lg p-6 mb-4 shadow-sm border transition-all ${
                isError ? 'border-red-500' : 'border-slate-200'
              }`}
            >
              <h3 className="text-base font-medium text-slate-700 mb-2">
                {field.prompt}
                {field.required && <span className="text-red-600 ml-1">*</span>}
              </h3>
              {field.description && (
                <p className="text-xs text-slate-500 mb-4">{field.description}</p>
              )}

              <div className="w-full">
                {((field.type === "short_text" || field.type === "file_upload" || field.type === "payment") || field.type === "email" || field.type === "number" || field.type === "date") && (
                  <input
                    type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text"}
                    value={answers[field.id] || ""}
                    onChange={(e) => handleAnswer(field.id, e.target.value)}
                    placeholder="Your answer"
                    className="w-full md:w-1/2 bg-transparent border-b border-slate-300 py-2 focus:border-b-2 focus:border-purple-600 focus:outline-none transition-all text-sm [color-scheme:light] min-h-[40px]"
                  />
                )}

                {field.type === "long_text" && (
                  <textarea
                    value={answers[field.id] || ""}
                    onChange={(e) => handleAnswer(field.id, e.target.value)}
                    placeholder="Your answer"
                    rows={3}
                    className="w-full bg-transparent border-b border-slate-300 py-2 focus:border-b-2 focus:border-purple-600 focus:outline-none transition-all text-sm resize-y"
                  />
                )}

                {/* Single Select (Standard Radio Inputs) */}
                {field.type === "single_select" && field.options && (
                  <div className="space-y-1">
                    {field.options.map((opt: string, index: number) => {
                      const isSelected = answers[field.id] === opt;
                      return (
                        <label key={index} className="flex items-center space-x-3 p-2 hover:bg-slate-50 cursor-pointer rounded transition-colors group">
                          <input 
                            type="radio" 
                            name={field.id}
                            checked={isSelected}
                            onChange={() => handleAnswer(field.id, opt)}
                            className="w-5 h-5 accent-purple-600 cursor-pointer"
                          />
                          <span className="text-slate-700 text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Multiple Choice (Standard Checkbox Inputs) */}
                {field.type === "multiple_choice" && field.options && (
                  <div className="space-y-1">
                    {field.options.map((opt: string, index: number) => {
                      const currentSelections = (answers[field.id] as string[]) || [];
                      const isSelected = currentSelections.includes(opt);
                      
                      return (
                        <label key={index} className="flex items-center space-x-3 p-2 hover:bg-slate-50 cursor-pointer rounded transition-colors group">
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
                            className="w-5 h-5 accent-purple-600 cursor-pointer rounded"
                          />
                          <span className="text-slate-700 text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Error State */}
                {isError && (
                  <div className="flex items-center gap-2 mt-3 text-red-600">
                    <svg focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                    </svg>
                    <span className="text-xs font-medium">{errors[field.id]}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Submit Section */}
        {schema.length > 0 && (
          <div className="flex justify-end mt-8 pb-12">
            <button
              onClick={validateAndSubmit}
              className="bg-purple-600 text-white font-medium px-6 py-2 rounded shadow hover:bg-purple-700 transition-colors"
            >
              Submit
            </button>
          </div>
        )}

        {schema.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            This form currently has no questions.
          </div>
        )}
      </div>
    </div>
  );
}
