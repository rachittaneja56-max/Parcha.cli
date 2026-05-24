import {
  Type,
  AtSign,
  CheckSquare,
  Hash,
  AlignLeft,
  List,
  Calendar,
  LucideIcon,
  Blocks,
  Settings,
  Share2,
} from "lucide-react";

export type SchemaField = {
  id: string;
  type: string;
  name: string;
  prompt: string;
  required: boolean;
  options?: string[];
};

export type PaletteItem = {
  icon: LucideIcon;
  label: string;
  type: string;
  defaultPrompt: string;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const FIELD_PALETTE: PaletteItem[] = [
  { icon: Type, label: "Short Text", type: "short_text", defaultPrompt: "Enter your answer" },
  { icon: AlignLeft, label: "Long Text", type: "long_text", defaultPrompt: "Describe in detail" },
  { icon: AtSign, label: "Email", type: "email", defaultPrompt: "Enter your email" },
  { icon: Hash, label: "Number", type: "number", defaultPrompt: "Enter a number" },
  { icon: List, label: "Single Select", type: "single_select", defaultPrompt: "Select one option" },
  { icon: CheckSquare, label: "Multiple Choice", type: "multiple_choice", defaultPrompt: "Choose your options" },
  { icon: Calendar, label: "Date", type: "date", defaultPrompt: "Pick a date" },
];

export const ACTIVITY_ITEMS = [
  { icon: Blocks, label: "Components", id: "components" },
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: Share2, label: "Share", id: "share" },
] as const;

export function generateFieldId() {
  return `fld_${Math.random().toString(36).slice(2, 9)}`;
}

export function iconForType(type: string): LucideIcon {
  return FIELD_PALETTE.find((f) => f.type === type)?.icon ?? Type;
}
