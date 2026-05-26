"use client";

import { useEffect, useState } from "react";
import { Save, LayoutDashboard } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import { FIELD_PALETTE } from "./constants";

export function CommandPalette({
  onAddField,
  onSave,
  onGoToDashboard,
}: {
  onAddField: (type: string) => void;
  onSave: () => void;
  onGoToDashboard: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelect(action: () => void) {
    action();
    setOpen(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Add Fields">
          {FIELD_PALETTE.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.type}
                onSelect={() => handleSelect(() => onAddField(item.type))}
              >
                <Icon className="h-4 w-4" />
                <span>Add {item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect(onSave)}>
            <Save className="h-4 w-4" />
            <span>Save Form</span>
            <CommandShortcut>Ctrl+S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(onGoToDashboard)}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
