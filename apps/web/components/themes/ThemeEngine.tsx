"use client";

import { TerminalRenderer, type ThemeRendererProps } from "./TerminalRenderer";
import { StandardFormRenderer } from "./StandardFormRenderer";
import { Windows95Renderer } from "./Windows95Renderer";

export interface ThemeEngineProps extends Omit<ThemeRendererProps, "theme"> {
  theme: "terminal" | "windowsxp" | "standard" | string;
}

export function ThemeEngine({ theme, ...props }: ThemeEngineProps) {
  const mappedTheme = 
    theme === "silicon_valley" 
      ? "standard"
      : ( theme === "windows_xp")
      ? "windowsxp"
      : theme;

  if (mappedTheme === "terminal") {
    return <TerminalRenderer {...props} />;
  }

  if (mappedTheme === "standard") {
    return <StandardFormRenderer {...props} />;
  }

  if (mappedTheme === "windowsxp") {
    return <Windows95Renderer {...props} />;
  }

  return <TerminalRenderer {...props} />;
}
