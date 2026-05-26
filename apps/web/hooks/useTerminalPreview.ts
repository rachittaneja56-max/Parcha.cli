import { useMemo } from "react";

export type SchemaField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
};

const PROMPTS: Record<string, string> = {
  short_text: "Enter your answer",
  email: "Enter your email",
  number: "Enter a number",
  long_text: "Describe in detail",
  multiple_choice: "Choose an option",
};

function fieldToPrompt(field: SchemaField): string {
  const base = PROMPTS[field.type] ?? "Enter a value";
  const prompt = field.label ? `> ${field.label}` : `> ${base}`;
  const required = field.required ? " *" : "";
  return `${prompt}${required}: `;
}

export function useTerminalPreview(schema: SchemaField[]) {
  const lines = useMemo(() => {
    if (schema.length === 0) {
      return [
        { text: "parcha95@cli ~ $ parcha95 build --interactive", type: "cmd" as const },
        { text: "  Waiting for fields…", type: "muted" as const },
      ];
    }

    const output: { text: string; type: "cmd" | "success" | "prompt" | "muted" }[] = [
      { text: "parcha95@cli ~ $ parcha95 build --interactive", type: "cmd" },
      {
        text: `  ✓ Loaded ${schema.length} field${schema.length !== 1 ? "s" : ""}`,
        type: "success",
      },
    ];

    schema.forEach((field) => {
      output.push({ text: fieldToPrompt(field), type: "prompt" });
    });

    return output;
  }, [schema]);

  return { lines };
}
