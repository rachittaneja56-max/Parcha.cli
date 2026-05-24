"use client";

import { ChevronDown } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { ScrollArea } from "~/components/ui/scroll-area";
import { FIELD_PALETTE, type PaletteItem } from "./constants";

function PaletteDraggable({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.type,
  });

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-4 w-full px-4 py-3 text-sm hover:bg-[#111] transition-colors cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#1c1c1c] text-zinc-400 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <span className="font-mono text-xs text-zinc-400 group-hover:text-zinc-300">
        {item.label}
      </span>
    </div>
  );
}

export function PaletteSidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-[#1c1c1c] bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-transparent">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 select-none">
          COMPONENTS
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1.5 p-2">
          {FIELD_PALETTE.map((item) => (
            <PaletteDraggable key={item.type} item={item} />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
