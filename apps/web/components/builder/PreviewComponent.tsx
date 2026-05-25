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
  theme: "terminal"; 
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
