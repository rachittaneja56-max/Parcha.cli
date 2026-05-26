"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Lock, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";

export default function MyFormsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const me = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0 });
  const myForms = trpc.form.getMyForms.useQuery(undefined, {
    enabled: !!me.data?.user,
  });

  useEffect(() => {
    if (!me.isLoading && (me.isError || !me.data?.user)) {
      router.replace("/auth/login");
    }
  }, [me.isLoading, me.isError, me.data, router]);

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

  const filteredForms = forms.filter((f) =>
    (f.title || "Untitled Form").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <main className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-zinc-400 font-mono mb-8">
          <Link href="/" className="hover:text-zinc-100 transition-colors">
            Parcha95
          </Link>
          <span className="text-zinc-600">/</span>
          <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">
            Command Center
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-100">My Forms</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Form Library</h1>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <Input
            type="text"
            className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 w-full md:max-w-md h-11"
            placeholder="Search forms by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {myForms.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner />
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-28 text-center">
            <h3 className="text-lg font-semibold mb-2">No matching forms</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Try adjusting your search query or go back to the Command Center to create a new form.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map((form) => {
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
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(form.updatedAt).toLocaleDateString()}
                    </span>
                    <Link href={isVerified ? `/dashboard/builder/${form.id}` : "#"}>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!isVerified}
                        className="bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 border border-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed px-5"
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
    </div>
  );
}
