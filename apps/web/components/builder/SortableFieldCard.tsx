"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { iconForType, type SchemaField } from "./constants";

export function SortableFieldCard({
  field,
  isSelected,
  onSelect,
  onRemove,
}: {
  field: SchemaField;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const Icon = iconForType(field.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-sm border transition-all group ${
        isSelected
          ? "border-zinc-100 bg-zinc-800 shadow-sm"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-100/50"
      }`}
    >
      <div 
        className="text-zinc-500 hover:text-zinc-300 shrink-0 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-zinc-950 border border-zinc-800/60 text-zinc-400 shrink-0">
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">
          {field.name}
        </p>
        <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
          {field.prompt}
          {field.required && (
            <span className="ml-2 text-zinc-100 font-semibold uppercase text-[9px] tracking-wider">required</span>
          )}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 z-10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
