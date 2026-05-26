"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { Save, Check, Loader2, Share2, BarChart, Settings, PenTool, Download, Copy } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import QRCode from "react-qr-code";
import { trpc } from "~/trpc/client";

import {
  FIELD_PALETTE,
  generateFieldId,
  type SchemaField,
  type PaletteItem,
  type SaveStatus,
} from "./constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { PaletteSidebar } from "./PaletteSidebar";
import { CanvasDropZone } from "./CanvasDropZone";
import { PropertiesPanel } from "./PropertiesPanel";
import { CommandPalette } from "./CommandPalette";
import { PreviewComponent } from "./PreviewComponent";
import { FloatingPreviewWidget } from "./FloatingPreviewWidget";
import { GlobalSettingsPanel, type FormSettings } from "./GlobalSettingsPanel";
import { ResponsesAnalytics } from "./ResponsesAnalytics";

export default function BuilderLayout({ formId }: { formId: string }) {
  const router = useRouter();

  const [activeView, setActiveView] = useState<'build' | 'settings' | 'analytics'>('build');
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<PaletteItem | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<FormSettings>({
    title: "",
    status: "draft",
    visibility: "unlisted",
    requireAuth: false,
    password: null,
    successMessage: "Response recorded successfully.",
    theme: "terminal",
  });

  const initialLoadDone = useRef(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const me = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0 });
  const formQuery = trpc.form.getFormById.useQuery(
    { formId },
    { enabled: !!me.data?.user }
  );
  const updateSchema = trpc.form.updateSchema.useMutation();
  const updateSettings = trpc.form.updateSettings.useMutation();

  useEffect(() => {
    if (formQuery.data && !initialLoadDone.current) {
      if (Array.isArray(formQuery.data.schema)) {
        const loaded = formQuery.data.schema as any[];
        const mapped = loaded.map((f) => {
          const name = f.name || f.label || "untitled";
          let options = f.options;
          if ((f.type === "multiple_choice" || f.type === "single_select") && (!options || options.length < 2)) {
            options = ["Option 1", "Option 2"];
          }
          return { ...f, name, options };
        }) as SchemaField[];
        setSchema(mapped);
      }
      setGlobalSettings({
        title: formQuery.data.title ?? "",
        status: (formQuery.data.status as "draft" | "published") ?? "draft",
        visibility: (formQuery.data.visibility as "public" | "unlisted" | "unpublished") ?? "unlisted",
        requireAuth: formQuery.data.requireAuth ?? false,
        password: formQuery.data.password ?? null,
        successMessage: formQuery.data.successMessage ?? "Response recorded successfully.",
        theme: (formQuery.data.theme as FormSettings["theme"]) ?? "terminal",
      });
      initialLoadDone.current = true;
    }
  }, [formQuery.data]);

  useEffect(() => {
    if (!me.isLoading && (me.isError || !me.data?.user)) {
      router.replace("/auth/login");
    }
  }, [me.isLoading, me.isError, me.data, router]);

  const debouncedSave = useDebouncedCallback((currentSchema: SchemaField[]) => {
    setSaveStatus("saving");
    updateSchema.mutate(
      { formId, schema: currentSchema },
      {
        onSuccess: () => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        },
        onError: (err) => {
          console.error("[Auto-save Error]:", err);
          setSaveStatus("error");
          toast.error("Auto-save failed due to an unexpected error.");
        },
      }
    );
  }, 2000);

  const debouncedSaveSettings = useDebouncedCallback((settings: FormSettings) => {
    setSaveStatus("saving");
    updateSettings.mutate(
      { formId, updates: settings },
      {
        onSuccess: () => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        },
        onError: (err) => {
          console.error("[Settings Auto-save Error]:", err);
          setSaveStatus("error");
          toast.error("Settings auto-save failed.");
        },
      }
    );
  }, 2000);

  useEffect(() => {
    if (initialLoadDone.current && schema.length > 0 && autoSaveEnabled) {
      debouncedSave(schema);
    }
  }, [schema, debouncedSave, autoSaveEnabled]);

  useEffect(() => {
    if (initialLoadDone.current && autoSaveEnabled) {
      debouncedSaveSettings(globalSettings);
    }
  }, [globalSettings, debouncedSaveSettings, autoSaveEnabled]);

  const handleManualSave = useCallback(() => {
    debouncedSave.cancel();
    debouncedSaveSettings.cancel();
    setSaveStatus("saving");
    updateSchema.mutate(
      { formId, schema },
      {
        onSuccess: () => {
          updateSettings.mutate(
            { formId, updates: globalSettings },
            {
              onSuccess: () => {
                setSaveStatus("saved");
                toast.success("Form synced to database.");
                setTimeout(() => setSaveStatus("idle"), 2000);
              },
              onError: (err) => {
                console.error("[Manual Save Settings Error]:", err);
                setSaveStatus("error");
                toast.error("Settings save failed.");
              }
            }
          );
        },
        onError: (err) => {
          console.error("[Manual Save Error]:", err);
          setSaveStatus("error");
          toast.error("Save failed due to an unexpected error.");
        },
      }
    );
  }, [formId, schema, globalSettings, updateSchema, updateSettings, debouncedSave, debouncedSaveSettings]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const paletteItem = FIELD_PALETTE.find((f) => f.type === event.active.id);
    if (paletteItem) setActiveDragItem(paletteItem);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragItem(null);

    const palette = FIELD_PALETTE.find((f) => f.type === active.id);

    if (palette) {
      if (over) {
        addField(palette.type, over.id === "canvas-drop" ? null : String(over.id));
      }
      return;
    }

    if (over && active.id !== over.id) {
      setSchema((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function addField(type: string, insertAfterId: string | null = null) {
    const palette = FIELD_PALETTE.find((f) => f.type === type);
    if (!palette) return;
    const newField: SchemaField = {
      id: generateFieldId(),
      type: palette.type,
      name: palette.label,
      prompt: palette.defaultPrompt,
      required: false,
      ...(palette.type === "multiple_choice" || palette.type === "single_select" ? { options: ["Option 1", "Option 2"] } : {}),
    };
    setSchema((prev) => {
      if (insertAfterId) {
        const index = prev.findIndex((f) => f.id === insertAfterId);
        if (index !== -1) {
          const next = [...prev];
          next.splice(index + 1, 0, newField);
          return next;
        }
      }
      return [...prev, newField];
    });
    setSelectedId(newField.id);
  }

  function removeField(id: string) {
    setSchema((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateField(id: string, updates: Partial<SchemaField>) {
    setSchema((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }

  const selectedField = schema.find((f) => f.id === selectedId) ?? null;
  const formName = globalSettings.title || "Untitled Form";

  if (me.isLoading || formQuery.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }
  if (!me.data?.user) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
          <header className="flex-shrink-0 h-14 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4">
            <nav className="flex items-center gap-1.5 text-[12px] font-mono select-none">
              <Link href="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                Parcha95
              </Link>
              <span className="text-zinc-650">/</span>
              <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                Command Center
              </Link>
              <span className="text-zinc-650">/</span>
              <Link href="/dashboard/myforms" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                My Forms
              </Link>
              <span className="text-zinc-650">/</span>
              <span className="text-zinc-200 font-semibold truncate max-w-[200px]" title={formName}>
                {formName}
              </span>
            </nav>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  {saveStatus === "saving" && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500">Saved</span>
                    </>
                  )}
                </div>

              <div className="flex items-center gap-2 border-l border-zinc-800 pl-3 ml-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Auto-Save</span>
                <button
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${autoSaveEnabled ? "bg-emerald-500" : "bg-zinc-650"
                    }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoSaveEnabled ? "translate-x-3.5" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>

              <Button
                size="sm"
                variant="outline"
                className={`gap-2 text-xs font-mono rounded-sm border-zinc-800 h-7 px-3 transition-colors ${
                  isPreviewOpen 
                    ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" 
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${isPreviewOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                  Live Preview
                </div>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-xs font-mono rounded-sm border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 h-7 px-3"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
                  <DialogHeader>
                    <DialogTitle>Share your form</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center space-x-2 mt-4">
                    <Input 
                      readOnly 
                      value={origin ? `${origin}/f/${formQuery.data?.slug || formId}` : ""}
                      className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 font-mono text-xs" 
                    />
                    <Button 
                      size="sm" 
                      className="px-3 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                      onClick={() => {
                        navigator.clipboard.writeText(`${origin}/f/${formQuery.data?.slug || formId}`);
                        toast.success("Link copied to clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col items-center justify-center mt-6 p-4 bg-white rounded-lg">
                    <QRCode
                      value={origin ? `${origin}/f/${formQuery.data?.slug || formId}` : ""}
                      size={200}
                    />
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline" 
                      className="gap-2 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 bg-transparent text-zinc-300"
                      onClick={() => toast.success("QR Code downloaded (stub)")}
                    >
                      <Download className="h-4 w-4" />
                      Download QR
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                className="gap-2 text-xs font-mono rounded-sm bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-7 px-3"
                onClick={handleManualSave}
                disabled={updateSchema.isPending}
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            </div>
          </header>

          <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
            {/* Activity Bar (Leftmost Panel) */}
            <aside className="w-14 flex-shrink-0 h-full border-r border-zinc-800 bg-zinc-950 flex flex-col items-center py-4 gap-4 z-10">
              <button
                onClick={() => setActiveView('build')}
                className={`p-2 rounded-lg transition-colors ${activeView === 'build' ? 'bg-zinc-800/50 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                title="Build"
              >
                <PenTool className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveView('settings')}
                className={`p-2 rounded-lg transition-colors ${activeView === 'settings' ? 'bg-zinc-800/50 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`p-2 rounded-lg transition-colors ${activeView === 'analytics' ? 'bg-zinc-800/50 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                title="Analytics"
              >
                <BarChart className="h-5 w-5" />
              </button>
            </aside>

            {/* Main Center Area Conditional Rendering */}
            {activeView === 'build' && (
              <>
                <aside className="w-80 flex-shrink-0 h-full border-r border-zinc-800 bg-zinc-900 flex flex-col overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
                    <h3 className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Components</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto m-0 p-0 flex flex-col">
                    <PaletteSidebar />
                  </div>
                </aside>

                <main className="flex-1 flex flex-col h-full min-w-0 bg-zinc-950 overflow-y-auto relative">
                  <div className="flex min-h-full p-8 flex-col items-center">
                    <div className="w-full max-w-3xl">
                      <CanvasDropZone
                        schema={schema}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onRemove={removeField}
                      />
                    </div>
                  </div>
                </main>

                {selectedField && (
                  <aside className="w-80 shrink-0 border-l border-zinc-800 bg-zinc-900 flex flex-col overflow-hidden">
                    <PropertiesPanel
                      field={selectedField}
                      onChange={(updates) => updateField(selectedField.id, updates)}
                    />
                  </aside>
                )}
              </>
            )}

            {activeView === 'settings' && (
              <main className="flex-1 flex flex-col h-full min-w-0 bg-zinc-950 items-center justify-center p-6">
                <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl h-[600px] max-h-[calc(100vh-6rem)] flex flex-col">
                  <GlobalSettingsPanel
                    settings={globalSettings}
                    onChange={(updates) => setGlobalSettings(prev => ({ ...prev, ...updates }))}
                  />
                </div>
              </main>
            )}

            {activeView === 'analytics' && (
              <main className="flex-1 flex flex-col h-full min-w-0 bg-zinc-950 overflow-y-auto">
                <ResponsesAnalytics formId={formId} />
              </main>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeDragItem ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-sm border border-primary/40 bg-card shadow-lg opacity-90">
              <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-primary/10 text-primary shrink-0">
                <activeDragItem.icon className="h-4 w-4" />
              </div>
              <span className="font-mono text-xs text-foreground">
                {activeDragItem.label}
              </span>
            </div>
          ) : null}
        </DragOverlay>
        {isPreviewOpen && (
          <FloatingPreviewWidget
            schema={schema}
            formName={formName}
            theme={globalSettings.theme}
            requireAuth={globalSettings.requireAuth}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
      </DndContext>

      <CommandPalette
        onAddField={addField}
        onSave={handleManualSave}
        onGoToDashboard={() => router.push("/dashboard")}
      />
    </TooltipProvider>
  );
}
