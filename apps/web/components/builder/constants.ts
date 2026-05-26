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
  UploadCloud,
  CreditCard,
} from "lucide-react";
import type { FieldSchemaType } from "@repo/validators";

export type SchemaField = FieldSchemaType;

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
  { icon: List, label: "Radio", type: "single_select", defaultPrompt: "Select one option" },
  { icon: CheckSquare, label: "Multiple Choice", type: "multiple_choice", defaultPrompt: "Choose your options" },
  { icon: Calendar, label: "Date", type: "date", defaultPrompt: "Pick a date" },
  { icon: UploadCloud, label: "File Upload", type: "file_upload", defaultPrompt: "Upload your file" },
  { icon: CreditCard, label: "Payment", type: "payment", defaultPrompt: "Secure Payment" },
];

export const ACTIVITY_ITEMS = [
  { icon: Blocks, label: "Components", id: "components" },
  { icon: Settings, label: "Settings", id: "settings" },
] as const;

export function generateFieldId() {
  return `fld_${Math.random().toString(36).slice(2, 9)}`;
}

export function iconForType(type: string): LucideIcon {
  return FIELD_PALETTE.find((f) => f.type === type)?.icon ?? Type;
}
