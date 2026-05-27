"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Blocks } from "lucide-react";
import { SortableFieldCard } from "./SortableFieldCard";
import type { SchemaField } from "./constants";

export function CanvasDropZone({
  schema,
  selectedId,
  onSelect,
  onRemove,
}: {
  schema: SchemaField[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop" });
  const isEmpty = schema.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 transition-all rounded-xl border-2 ${
        isOver && !isEmpty ? "border-emerald-500/20 bg-emerald-500/5" : "border-transparent bg-transparent"
      }`}
    >
      {isEmpty ? (
        <div className={`flex flex-col items-center justify-center h-full min-h-[400px] text-center pointer-events-none select-none rounded-xl border-2 border-dashed transition-all ${
          isOver ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-800 bg-zinc-950/50"
        }`}>
          <div
            className={`w-16 h-16 rounded-md flex items-center justify-center mb-5 border-2 border-dashed transition-all ${
              isOver
                ? "border-emerald-400 bg-emerald-950 text-emerald-400"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-600"
            }`}
          >
            <Blocks
              className={`w-7 h-7 transition-colors ${
                isOver ? "text-emerald-400 animate-pulse" : "text-zinc-600"
              }`}
            />
          </div>
          <p className="text-sm font-medium font-mono transition-colors">
            {isOver ? <span className="text-emerald-400">Release to add field</span> : <span className="text-zinc-400">Drag components here to build your form</span>}
          </p>
          <p className="text-xs text-zinc-600 mt-2 font-mono">
            Drop fields from the sidebar or press Ctrl+K
          </p>
        </div>
      ) : (
        <div className="mx-auto w-full py-4 px-2 pb-32">
          <SortableContext
            items={schema.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {schema.map((field) => (
                <SortableFieldCard
                  key={field.id}
                  field={field}
                  isSelected={selectedId === field.id}
                  onSelect={() =>
                    onSelect(selectedId === field.id ? null : field.id)
                  }
                  onRemove={() => onRemove(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
}
