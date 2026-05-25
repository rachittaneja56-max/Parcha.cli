"use client";

import React, { useState, useEffect } from "react";
import type { ThemeRendererProps } from "./TerminalRenderer";
import { Folder, FileText, HelpCircle, CheckSquare, List } from "lucide-react";

export function Windows95Renderer({
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
      return;
    }

    if (isPreview) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setAnswers({});
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

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case "single_select":
        return <List className="w-4 h-4 text-teal-900 shrink-0 mt-0.5" />;
      case "multiple_choice":
        return <CheckSquare className="w-4 h-4 text-teal-900 shrink-0 mt-0.5" />;
      case "long_text":
        return <Folder className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />;
      default:
        return <FileText className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />;
    }
  };

  const title = form?.title || formName || "Untitled Form";
  const description = form?.description || "";

  return (
    <div className="min-h-screen bg-teal-800 p-4 sm:p-10 flex flex-col font-sans select-none overflow-y-auto">
      <div className="w-full max-w-xl mx-auto bg-[#c0c0c0] border-4 border-t-white border-l-white border-b-slate-700 border-r-slate-700 p-1 shadow-2xl flex flex-col">
        
        {/* Title Bar */}
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

        {/* Outer Dialog Box / Window Workspace */}
        <div className="p-4 space-y-6">
          {isSubmitted ? (
            <div className="bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-teal-100 border border-teal-800 rounded-full flex items-center justify-center text-teal-800 text-2xl mx-auto font-bold">
                ✓
              </div>
              <h2 className="text-lg font-bold text-[#000080]">Information</h2>
              <p className="text-sm text-slate-800 font-sans">{successMessage}</p>
              <div className="pt-2">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-slate-700 border-r-slate-700 px-6 py-1 font-bold text-xs active:border-t-slate-700 active:border-l-slate-700 active:border-b-white active:border-r-white cursor-pointer focus:outline-none"
                >
                  OK
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form Intro Panel */}
              <div className="bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-4 space-y-2 select-text">
                <h1 className="text-xl font-bold text-[#000080]">{title}</h1>
                {description && <p className="text-xs text-slate-600 font-sans leading-normal">{description}</p>}
                <div className="text-[10px] text-slate-500 pt-2 font-mono">* Fields marked with an asterisk are required.</div>
              </div>

              {/* Form Questions */}
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
                      {/* Label with Folder/File Icon */}
                      <label className="flex items-start gap-2 text-sm font-bold text-slate-900 select-none mb-2 leading-tight">
                        {getFieldIcon(field.type)}
                        <span>
                          {field.prompt}
                          {field.required && <span className="text-red-700 ml-1 font-bold">*</span>}
                        </span>
                      </label>

                      <div className="w-full mt-2 pl-6">
                        {/* Text / Number / Email / Date Inputs */}
                        {(field.type === "short_text" || field.type === "email" || field.type === "number" || field.type === "date") && (
                          <input
                            type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text"}
                            value={answers[field.id] || ""}
                            onChange={(e) => handleAnswer(field.id, e.target.value)}
                            className="w-full bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-2 outline-none font-mono text-sm text-slate-900 focus:bg-white"
                          />
                        )}

                        {/* Long Text Input */}
                        {field.type === "long_text" && (
                          <textarea
                            value={answers[field.id] || ""}
                            onChange={(e) => handleAnswer(field.id, e.target.value)}
                            rows={3}
                            className="w-full bg-white border-2 border-t-slate-700 border-l-slate-700 border-b-white border-r-white p-2 outline-none font-mono text-sm text-slate-900 resize-y focus:bg-white"
                          />
                        )}

                        {/* Single Select */}
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

                        {/* Multiple Choice */}
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

                        {/* Error State */}
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

              {/* Submit Action */}
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
