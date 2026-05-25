"use client";

import type { SchemaField } from "./constants";
import { ThemeEngine } from "../themes/ThemeEngine";

export function PreviewComponent({
  schema,
  formName,
  theme,
}: {
  schema: SchemaField[];
  formName: string;
  theme: "terminal" | "windows95" | "silicon_valley" | "gamified_3d" | string; 
}) {
  return (
    <div className="h-full w-full bg-black">
      <ThemeEngine
        theme={theme}
        schema={schema}
        formName={formName}
        isPreview={true}
      />
    </div>
  );
}
