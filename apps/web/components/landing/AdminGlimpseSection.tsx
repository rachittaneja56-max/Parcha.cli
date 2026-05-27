"use client";

import { Globe, Lock, Plus, FileText } from "lucide-react";

const MOCK_FORMS = [
  {
    id: "1",
    title: "Developer Waitlist 2026",
    status: "published",
    views: 8201,
    responseCount: 4120,
    updatedAt: "2026-05-25T10:00:00Z",
  },
  {
    id: "2",
    title: "Product Feedback Survey",
    status: "published",
    views: 2340,
    responseCount: 1190,
    updatedAt: "2026-05-27T08:30:00Z",
  },
  {
    id: "3",
    title: "Beta Access Form",
    status: "draft",
    views: 0,
    responseCount: 0,
    updatedAt: "2026-05-26T14:00:00Z",
  },
  {
    id: "4",
    title: "Community Interest Check",
    status: "published",
    views: 1909,
    responseCount: 532,
    updatedAt: "2026-05-24T19:00:00Z",
  },
];

const totalViews = MOCK_FORMS.reduce((acc, f) => acc + f.views, 0);
const totalResponses = MOCK_FORMS.reduce((acc, f) => acc + f.responseCount, 0);
const completionRate = totalViews > 0 ? ((totalResponses / totalViews) * 100).toFixed(1) : "0.0";
const numActiveForms = MOCK_FORMS.filter((f) => f.status === "published").length;

export const AdminGlimpseSection = () => {
  return (
    <section className="relative py-16 px-6 bg-[#050505] border-t border-zinc-900">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* Section Header — consistent with Features / Pricing */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 border border-emerald-900/50 bg-emerald-950/20 px-3 py-1 rounded-full w-fit">
            Command Center
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white">
            Manage every form.
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            One central dashboard to track views, responses, and active form performance across your entire account.
          </p>
        </div>

        {/* Dashboard chrome window */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

          {/* Nav bar mirroring actual dashboard */}
          <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
              <span className="text-zinc-500">Parcha95</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-100">Command Center</span>
            </div>
            <div className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 text-xs font-medium">
              R
            </div>
          </div>

          <div className="px-6 py-8 flex flex-col gap-8">
            {/* Page title + CTA row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Command Center</h1>
              <div className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium w-fit cursor-default select-none">
                <Plus className="h-4 w-4" />
                Create Form
              </div>
            </div>

            {/* 4-column stat cards — exact same style as real dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Views",
                  value: totalViews.toLocaleString(),
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ),
                },
                {
                  label: "Total Responses",
                  value: totalResponses.toLocaleString(),
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  label: "Completion Rate",
                  value: completionRate,
                  suffix: "%",
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ),
                },
                {
                  label: "Active Forms",
                  value: numActiveForms,
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 relative z-10">
                    {stat.icon}
                    <h3 className="text-sm font-medium">{stat.label}</h3>
                  </div>
                  <div className="flex items-baseline gap-1 relative z-10">
                    <p className="text-3xl font-bold tracking-tight text-zinc-100">{stat.value}</p>
                    {stat.suffix && <span className="text-zinc-500 font-medium">{stat.suffix}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Recently Active Forms header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-100">Recently Active Forms</h2>
              <span className="text-sm text-emerald-400 font-medium cursor-default">View All Forms &rarr;</span>
            </div>

            {/* Form cards — 2-col grid matching actual dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_FORMS.map((form) => {
                const isPublished = form.status === "published";
                return (
                  <div
                    key={form.id}
                    className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50 cursor-default group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h2 className="text-base font-medium line-clamp-1 text-zinc-100">{form.title}</h2>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                            isPublished
                              ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10"
                              : "border-zinc-700 text-zinc-400 bg-zinc-800"
                          }`}
                        >
                          {isPublished ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono mt-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-500">Views</span>
                          <span className="text-zinc-300 font-medium">{form.views.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-500">Responses</span>
                          <span className="text-zinc-300 font-medium">{form.responseCount.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                          <span className="text-zinc-500">Updated</span>
                          <span className="text-zinc-300">
                            {new Date(form.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors">
                        Analytics &rarr;
                      </span>
                      <div className="bg-zinc-800/80 text-zinc-300 group-hover:bg-zinc-700 group-hover:text-zinc-100 border border-zinc-700/50 text-xs font-medium px-4 py-1.5 rounded-md transition-colors">
                        Edit
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
