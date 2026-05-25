"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Globe, Lock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";

function CreateFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");

  const createForm = trpc.form.create.useMutation({
    onSuccess: (newForm) => {
      onOpenChange(false);
      setTitle("");
      if (newForm?.id) {
        router.push(`/dashboard/builder/${newForm.id}`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form. Please try again.");
      console.error("Form creation error:", err);
    },
  });

  function handleCreate() {
    if (!title.trim()) return;
    createForm.mutate({ title: title.trim(), theme: "terminal" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Create a new form</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Give your form a name to get started. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="e.g. Waitlist Sign-up"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            autoFocus
            className="font-mono text-sm bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-700"
            disabled={createForm.isPending}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createForm.isPending}
            className="border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createForm.isPending}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
          >
            {createForm.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Create Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const me = trpc.auth.me.useQuery(undefined, { retry: false });
  const myForms = trpc.form.getMyForms.useQuery(undefined, {
    enabled: !!me.data?.user,
  });

  useEffect(() => {
    if (me.isError) router.replace("/auth/login");
  }, [me.isError, router]);

  if (me.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
        <Spinner />
      </div>
    );
  }
  if (!me.data?.user) return null;

  const forms: any[] = myForms.data ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-zinc-400 font-mono mb-8">
          <Link href="/" className="hover:text-zinc-100 transition-colors">
            Parcha
          </Link>
          <span className="text-zinc-600">/</span>
          <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">
            Dashboard
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-100">Your Forms</span>
        </nav>

        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Your Forms</h1>
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>

        {myForms.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner />
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-28 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 mb-4">
              <FileText className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-6">
              Create your first form to start collecting responses from your users.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {forms.map((form) => {
              const isPublished = form.status === "published";

              return (
                <div
                  key={form.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-base font-medium line-clamp-1 text-zinc-100">
                        {form.title || "Untitled Form"}
                      </h2>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          isPublished
                            ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10"
                            : "border-zinc-700 text-zinc-400 bg-zinc-800"
                        }`}
                      >
                        {isPublished ? (
                          <Globe className="h-2.5 w-2.5" />
                        ) : (
                          <Lock className="h-2.5 w-2.5" />
                        )}
                        {isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-3">
                      {form.id.split('-')[0]} • {new Date(form.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-800/60">
                    <Link href={`/dashboard/builder/${form.id}`} className="block">
                      <Button
                        variant="secondary"
                        className="w-full bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 border border-zinc-700/50"
                      >
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CreateFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
