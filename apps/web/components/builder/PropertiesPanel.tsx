"use client";

import { ToggleLeft, ToggleRight, SlidersHorizontal, Plus, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { iconForType, type SchemaField } from "./constants";

export function PropertiesPanel({
  field,
  onChange,
}: {
  field: SchemaField;
  onChange: (updates: Partial<SchemaField>) => void;
}) {
  const Icon = iconForType(field.type);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 select-none">
            Properties
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2">
            <Icon className="h-4 w-4 text-zinc-450 shrink-0" />
            <span className="font-mono text-xs text-zinc-400 capitalize">
              {field.type.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Internal Name
            </label>
            <Input
              value={field.name}
              onChange={(e) => onChange({ name: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-8 text-sm font-mono bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-500 text-zinc-100"
              placeholder="e.g. user_email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Field Label
            </label>
            <Input
              value={field.prompt}
              onChange={(e) => onChange({ prompt: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-8 text-sm font-mono bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-500 text-zinc-100"
              placeholder="e.g. What is your email?"
            />
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              Shown to respondents as the main question
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Description (Optional)
            </label>
            <Input
              value={field.description || ""}
              onChange={(e) => onChange({ description: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-8 text-sm font-mono bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-500 text-zinc-100"
              placeholder="e.g. Please use your work email."
            />
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              Shown below the prompt as helper text
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Required</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Marks this field as mandatory
              </p>
            </div>
            <button
              onClick={() => onChange({ required: !field.required })}
              className={`transition-colors ${
                field.required ? "text-zinc-100" : "text-zinc-600"
              }`}
            >
              {field.required ? (
                <ToggleRight className="h-6 w-6" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
            </button>
          </div>

          {(field.type === "single_select" || field.type === "multiple_choice" || field.type === "dropdown") && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                Options
              </label>
              <div className="flex flex-col gap-1.5">
                {(field.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[i] = e.target.value;
                        onChange({ options: newOptions });
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="h-7 text-xs font-mono bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-500 text-zinc-100"
                      placeholder={`Option ${i + 1}`}
                    />
                    <button
                      onClick={() => {
                        if ((field.options || []).length <= 2) return;
                        const newOptions = (field.options || []).filter((_, idx) => idx !== i);
                        onChange({ options: newOptions });
                      }}
                      disabled={(field.options || []).length <= 2}
                      className={`transition-colors ${(field.options || []).length <= 2 ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground hover:text-red-400"}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...(field.options || []), "New Option"];
                    onChange({ options: newOptions });
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mt-1"
                >
                  <Plus className="h-3 w-3" /> Add Option
                </button>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
