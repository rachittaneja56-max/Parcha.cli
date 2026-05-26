"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { PreviewComponent } from "./PreviewComponent";
import type { SchemaField } from "./constants";

interface FloatingPreviewWidgetProps {
  schema: SchemaField[];
  formName: string;
  theme: "terminal" | string;
  requireAuth: boolean;
  onClose: () => void;
}

export function FloatingPreviewWidget({ schema, formName, theme, requireAuth, onClose }: FloatingPreviewWidgetProps) {

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      style={{
        position: "fixed",
        right: "2rem",
        bottom: "2rem",
        zIndex: 50,
      }}
      className="w-96 h-[500px] shadow-2xl rounded-lg overflow-hidden border border-zinc-700 flex flex-col bg-zinc-950"
    >
      <div className="bg-zinc-800 h-10 flex flex-shrink-0 items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-zinc-700">
        <span className="text-xs font-mono text-zinc-100 uppercase tracking-wider">Live Preview</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-black relative">
        <PreviewComponent 
          schema={schema} 
          formName={formName} 
          theme={theme} 
          appState="live"
        />
      </div>
    </motion.div>
  );
}
