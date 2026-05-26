"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Activity, Users, FileText, Database, ShieldAlert } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication & Role Check
  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
  } = trpc.auth.me.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (!sessionLoading && (sessionError || !session?.user || session.user.role !== "admin")) {
      router.push("/auth/login?redirect=/admin");
    }
  }, [session, sessionLoading, sessionError, router]);

  // Data Fetching
  const { data: telemetry, isLoading: telemetryLoading } = trpc.admin.getTelemetry.useQuery(
    undefined,
    { enabled: session?.user?.role === "admin" },
  );

  const {
    data: recentForms,
    isLoading: formsLoading,
    refetch: refetchForms,
  } = trpc.admin.getRecentForms.useQuery(undefined, {
    enabled: session?.user?.role === "admin",
  });

  const moderateMutation = trpc.admin.moderateForm.useMutation({
    onSuccess: () => {
      toast.success("Form unpublished successfully.");
      refetchForms();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to moderate form.");
    },
  });

  const handleUnpublish = (formId: string) => {
    if (confirm("Are you sure you want to unpublish this form?")) {
      moderateMutation.mutate({ formId, action: "unpublish" });
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse bg-zinc-800 rounded-lg w-16 h-16" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-emerald-500/30">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#0A0A0A]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-emerald-400 font-bold tracking-tight">
            Parcha95_Admin
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-500 font-mono">{session.user.email}</span>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Exit to App
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Telemetry Bento Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase font-mono">
              Platform Telemetry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Users"
              value={telemetry?.totalUsers}
              loading={telemetryLoading}
              icon={<Users className="w-4 h-4 text-zinc-500" />}
            />
            <MetricCard
              title="Active Forms"
              value={telemetry?.totalForms}
              loading={telemetryLoading}
              icon={<FileText className="w-4 h-4 text-zinc-500" />}
            />
            <MetricCard
              title="Global Submissions"
              value={telemetry?.totalSubmissions}
              loading={telemetryLoading}
              icon={<Database className="w-4 h-4 text-zinc-500" />}
            />
          </div>
        </section>

        {/* Form Moderation Data Table */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase font-mono">
              Recent Forms & Moderation
            </h2>
            {moderateMutation.isPending && (
              <span className="text-xs font-mono text-emerald-500 animate-pulse">
                Processing...
              </span>
            )}
          </div>

          <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/20 text-zinc-500 font-mono text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Form Title</th>
                    <th className="px-6 py-4 font-medium">Creator</th>
                    <th className="px-6 py-4 font-medium text-right">Submissions</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {formsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-40 bg-zinc-800 animate-pulse rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-8 bg-zinc-800 animate-pulse rounded ml-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-16 bg-zinc-800 animate-pulse rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-20 bg-zinc-800 animate-pulse rounded ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : recentForms?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No forms found.
                      </td>
                    </tr>
                  ) : (
                    recentForms?.map((form: any) => (
                      <tr key={form.id} className="hover:bg-zinc-900/20 transition-colors group">
                        <td className="px-6 py-4 font-medium text-zinc-200">{form.title}</td>
                        <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                          {form.creatorEmail}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-right font-mono">
                          {form.submissionCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              form.visibility === "public"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : form.visibility === "unpublished"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {form.visibility}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleUnpublish(form.id)}
                            disabled={
                              form.visibility === "unpublished" || moderateMutation.isPending
                            }
                            className="text-red-400 hover:bg-red-950/30 px-3 py-1 rounded-md text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            [ Unpublish ]
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  loading,
  icon,
}: {
  title: string;
  value?: number;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:border-zinc-700 transition-all relative overflow-hidden group">
      <div className="absolute top-6 right-6">
        <div className="w-2 h-2 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors animate-pulse" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="text-xs uppercase font-mono tracking-widest text-zinc-500">{title}</span>
      </div>
      {loading ? (
        <div className="h-10 w-24 bg-zinc-800 animate-pulse rounded-lg mt-2" />
      ) : (
        <div className="text-4xl font-extrabold text-white tracking-tight">
          {value?.toLocaleString() || "0"}
        </div>
      )}
    </div>
  );
}
