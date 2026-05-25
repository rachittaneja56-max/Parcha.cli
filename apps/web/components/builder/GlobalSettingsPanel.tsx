"use client";

import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";


export type FormSettings = {
  title: string;
  status: "draft" | "published";
  visibility: "public" | "unlisted" | "unpublished";
  requireAuth: boolean;
  password?: string | null;
  successMessage: string;
  theme: "terminal" | "windowsxp" | "standard" | "code_editor";
};

export function GlobalSettingsPanel({
  settings,
  onChange,
}: {
  settings: FormSettings;
  onChange: (updates: Partial<FormSettings>) => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-zinc-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 select-none">
            GLOBAL SETTINGS
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Form Title
            </label>
            <Input
              value={settings.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="h-8 text-sm font-mono bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-500 text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-300">Published</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Make form accessible
              </p>
            </div>
            <Switch
              checked={settings.status === "published"}
              onCheckedChange={(checked) =>
                onChange({ status: checked ? "published" : "draft" })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-300">Public Visibility</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Show in public directories
              </p>
            </div>
            <Switch
              checked={settings.visibility === "public"}
              onCheckedChange={(checked) =>
                onChange({ visibility: checked ? "public" : "unlisted" })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-300">Require Login</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Restrict to logged-in users
              </p>
            </div>
            <Switch
              checked={settings.requireAuth}
              onCheckedChange={(checked) => onChange({ requireAuth: checked })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Password Protection
            </label>
            <Input
              type="password"
              placeholder="Leave blank for none"
              value={settings.password || ""}
              onChange={(e) => onChange({ password: e.target.value || null })}
              className="h-8 text-sm font-mono bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-500 text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Success Message
            </label>
            <Textarea
              value={settings.successMessage}
              onChange={(e) => onChange({ successMessage: e.target.value })}
              className="text-sm font-mono bg-zinc-950 border-zinc-800 resize-none focus-visible:ring-zinc-500 text-zinc-100"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Form Theme
            </label>
            <Select
              value={settings.theme}
              onValueChange={(val) => onChange({ theme: val as any })}
            >
              <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 focus:ring-zinc-500 text-zinc-100 h-9 font-mono text-sm">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100 font-mono">
                <SelectItem value="terminal">Terminal (Dark)</SelectItem>
                <SelectItem value="windowsxp">Windows XP</SelectItem>
                <SelectItem value="standard">Standard Form</SelectItem>
                <SelectItem value="code_editor">Code Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
