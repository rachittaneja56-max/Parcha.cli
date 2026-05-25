"use client";

import { TerminalRenderer, type ThemeRendererProps } from "./TerminalRenderer";

export interface ThemeEngineProps extends Omit<ThemeRendererProps, "theme"> {
  theme: "terminal";
}

export function ThemeEngine({ theme, ...props }: ThemeEngineProps) {
  if (theme === "terminal") {
    return <TerminalRenderer {...props} />;
  }

  return <TerminalRenderer {...props} />;
}
