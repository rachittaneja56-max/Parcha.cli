"use client";

import { ToggleLeft, ToggleRight, SlidersHorizontal, Plus, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground select-none">
            Properties
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-5">
          <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-muted/30 px-3 py-2">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-mono text-xs text-muted-foreground capitalize">
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
              className="h-8 text-sm font-mono"
              placeholder="e.g. user_email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              CLI Prompt
            </label>
            <Input
              value={field.prompt}
              onChange={(e) => onChange({ prompt: e.target.value })}
              className="h-8 text-sm font-mono"
              placeholder="e.g. What is your email?"
            />
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              Shown to respondents in the terminal
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
                field.required ? "text-primary" : "text-muted-foreground/50"
              }`}
            >
              {field.required ? (
                <ToggleRight className="h-6 w-6" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Field ID
            </label>
            <p className="text-xs font-mono text-muted-foreground/70 bg-muted/30 rounded-sm px-2 py-1.5 border border-border/40 break-all select-all">
              {field.id}
            </p>
          </div>

          {(field.type === "single_select" || field.type === "multiple_choice") && (
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
                      className="h-7 text-xs font-mono"
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
      </ScrollArea>
    </div>
  );
}
