"use client";

import type { SchemaField } from "./constants";
import { ThemeEngine } from "../themes/ThemeEngine";

export function PreviewComponent({
  schema,
  formName,
  theme,
  appState,
  onLoginClick,
}: {
  schema: SchemaField[];
  formName: string;
  theme: "terminal" | "windowsxp" | "standard" | "code_editor" | string; 
  appState?: "live" | "auth_prompt" | "password_prompt";
  onLoginClick?: () => void;
}) {
  return (
    <div className="h-full w-full bg-black">
      <ThemeEngine
        theme={theme}
        schema={schema}
        formName={formName}
        isPreview={true}
        appState={appState}
        onLoginClick={onLoginClick}
      />
    </div>
  );
}
