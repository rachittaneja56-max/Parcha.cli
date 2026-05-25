"use client";

import { TerminalRenderer, type ThemeRendererProps } from "./TerminalRenderer";
import { StandardFormRenderer } from "./StandardFormRenderer";
import { Windows95Renderer } from "./Windows95Renderer";
import { CodeEditorRenderer } from "./CodeEditorRenderer";

export interface ThemeEngineProps extends Omit<ThemeRendererProps, "theme"> {
  theme: "terminal" | "windowsxp" | "standard" | "code_editor" | string;
}

export function ThemeEngine({ theme, ...props }: ThemeEngineProps) {

  if (theme === "terminal") {
    return <TerminalRenderer {...props} />;
  }

  if (theme === "standard") {
    return <StandardFormRenderer {...props} />;
  }

  if (theme === "windowsxp") {
    return <Windows95Renderer {...props} />;
  }

  if (theme === "code_editor") {
    return <CodeEditorRenderer {...props} />;
  }

  return <TerminalRenderer {...props} />;
}
