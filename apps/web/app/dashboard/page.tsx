"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Globe, Lock, User, LogOut } from "lucide-react";

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
import { clearSessionCookie } from "~/app/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

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
  const utils = trpc.useUtils();
  const [createOpen, setCreateOpen] = useState(false);

  const me = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0 });
  const myForms = trpc.form.getMyForms.useQuery(undefined, {
    enabled: !!me.data?.user,
  });

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await clearSessionCookie();
      await utils.auth.me.invalidate();
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!me.isLoading && (me.isError || !me.data?.user)) {
      router.replace("/auth/login");
    }
  }, [me.isLoading, me.isError, me.data, router]);

  useEffect(() => {
    if (me.data?.user && !me.data.user.emailVerified) {
      toast.warning("Please verify your email address to create or edit forms.", { duration: 5000, id: "verify-toast" });
    }
  }, [me.data?.user?.emailVerified]);

  if (me.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
        <Spinner />
      </div>
    );
  }
  if (!me.data?.user) return null;

  const isVerified = me.data.user.emailVerified;
  const forms: any[] = myForms.data ?? [];

  const totalViews = forms.reduce((acc, form) => acc + (form.views || 0), 0);
  const totalResponses = forms.reduce((acc, form) => acc + (form.responseCount || 0), 0);

  const activeForms = forms.slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <main className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
            <Link href="/" className="hover:text-zinc-100 transition-colors">
              Parcha95
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-100">Command Center</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-zinc-800 hover:bg-zinc-800">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-zinc-900 text-zinc-100 text-xs">
                    {me.data.user.fullName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-zinc-100" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{me.data.user.fullName || "User"}</p>
                  <p className="text-xs leading-none text-zinc-400">{me.data.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                disabled={loggingOut}
                className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={!isVerified}
            className="gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400">Total Views</h3>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">{totalViews}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400">Total Responses</h3>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">{totalResponses}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-zinc-100">Recently Active Forms</h2>
          {forms.length > 0 && (
            <Link href="/dashboard/myforms" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
              View All Forms &rarr;
            </Link>
          )}
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
              disabled={!isVerified}
              className="gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {activeForms.map((form) => {
              const isPublished = form.status === "published";
              const formViews = form.views || 0;
              const formResponses = form.responseCount || 0;

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
                    <div className="flex items-center gap-4 text-xs font-mono mt-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-500">Views</span>
                        <span className="text-zinc-300 font-medium">{formViews}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-500">Responses</span>
                        <span className="text-zinc-300 font-medium">{formResponses}</span>
                      </div>
                      <div className="flex flex-col border-l border-zinc-800 pl-4">
                        <span className="text-zinc-500">Updated</span>
                        <span className="text-zinc-300">{new Date(form.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                    <Link href={`/dashboard/builder/${form.id}/responses`} className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors">
                      Analytics &rarr;
                    </Link>
                    <Link href={isVerified ? `/dashboard/builder/${form.id}` : "#"}>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!isVerified}
                        className="bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 border border-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed px-6"
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
