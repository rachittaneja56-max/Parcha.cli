import React from "react";
import { Terminal, Monitor, LayoutTemplate, Code } from "lucide-react";

interface ThemeBadgeProps {
  theme: string;
}

export function ThemeBadge({ theme }: ThemeBadgeProps) {
  switch (theme) {
    case "code_editor":
      return (
        <div className="flex items-center gap-1.5 rounded-md bg-[#1E1E1E] border border-zinc-700/50 px-2.5 py-1 text-[10px] font-mono tracking-wider text-[#4EC9B0]">
          <Code className="h-3 w-3" />
          VS_CODE_THEME
        </div>
      );
    case "windowsxp":
    case "windows95":
      return (
        <div className="flex items-center gap-1.5 rounded-sm bg-[#C0C0C0] border-t-white border-l-white border-b-[#808080] border-r-[#808080] border-[1.5px] px-2 py-0.5 text-[10px] font-bold tracking-tight text-black shadow-[1px_1px_0px_#000]">
          <Monitor className="h-3 w-3" />
          WINDOWS_95
        </div>
      );
    case "terminal":
      return (
        <div className="flex items-center gap-1.5 rounded bg-black/50 border border-green-500/30 px-2 py-1 text-[10px] font-mono text-green-500">
          <Terminal className="h-3 w-3" />
          TERMINAL_THEME
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
          <LayoutTemplate className="h-3 w-3" />
          STANDARD_THEME
        </div>
      );
  }
}
