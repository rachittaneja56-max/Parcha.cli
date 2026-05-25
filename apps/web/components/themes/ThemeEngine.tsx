"use client";

import { TerminalRenderer, type ThemeRendererProps } from "./TerminalRenderer";

export interface ThemeEngineProps extends Omit<ThemeRendererProps, "theme"> {
  theme: "terminal" | "windows95" | "silicon_valley" | "gamified_3d" | string;
}

export function ThemeEngine({ theme, ...props }: ThemeEngineProps) {
  if (theme === "terminal") {
    return <TerminalRenderer {...props} />;
  }

  return <TerminalRenderer {...props} />;
}
