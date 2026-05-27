"use client";

import { Users, Activity, Download } from "lucide-react";

const MOCK_RESPONSES = [
  { id: "r1", submittedAt: "2026-05-27T12:10:00Z", timeToComplete: 38, payload: { handle: "rachit", env: "prod", rating: "5" } },
  { id: "r2", submittedAt: "2026-05-27T11:48:00Z", timeToComplete: 52, payload: { handle: "ankit_dev", env: "stage", rating: "4" } },
  { id: "r3", submittedAt: "2026-05-27T11:02:00Z", timeToComplete: 29, payload: { handle: "sarah.c", env: "prod", rating: "5" } },
  { id: "r4", submittedAt: "2026-05-27T10:30:00Z", timeToComplete: 61, payload: { handle: "wozniak", env: "prod", rating: "5" } },
  { id: "r5", submittedAt: "2026-05-26T22:15:00Z", timeToComplete: 44, payload: { handle: "torvalds", env: "stage", rating: "4" } },
];

// Simulate 7-day bar chart data
const CHART_DATA = [
  { date: "May 21", count: 3 },
  { date: "May 22", count: 7 },
  { date: "May 23", count: 5 },
  { date: "May 24", count: 12 },
  { date: "May 25", count: 9 },
  { date: "May 26", count: 16 },
  { date: "May 27", count: 8 },
];
const maxCount = Math.max(...CHART_DATA.map((d) => d.count));

const views = 12450;
const totalResponses = MOCK_RESPONSES.length;
const conversionRate = ((totalResponses / views) * 100).toFixed(1);
const avgTime = (
  MOCK_RESPONSES.reduce((acc, r) => acc + r.timeToComplete, 0) / MOCK_RESPONSES.length
).toFixed(0);

const DYNAMIC_COLS = ["handle", "env", "rating"];

export const AnalyticsGlimpseSection = () => {
  return (
    <section className="relative py-16 px-6 bg-[#050505] border-t border-zinc-900">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* Section Header */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 border border-emerald-900/50 bg-emerald-950/20 px-3 py-1 rounded-full w-fit">
            Response Analytics
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white">
            Understand your data.
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            Deep-dive into per-form response volumes, conversion rates, and completion times — visualized in real-time.
          </p>
        </div>

        {/* Analytics window chrome */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

          <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
              <span className="text-zinc-500">Parcha95</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-500">forms</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-100">Developer Waitlist 2026</span>
            </div>
            <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium cursor-default select-none">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </div>
          </div>

          <div className="px-6 py-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">

            {/* Page title matching ResponsesAnalytics.tsx */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Analytics</h2>
                <p className="text-sm text-zinc-400 mt-1 font-mono">Form: Developer Waitlist 2026</p>
              </div>
            </div>

            {/* 4-column stat cards — exact same as ResponsesAnalytics.tsx */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Users className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Total Views</h3>
                </div>
                <p className="text-3xl font-bold text-zinc-100">{views.toLocaleString()}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Activity className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Total Responses</h3>
                </div>
                <p className="text-3xl font-bold text-zinc-100">{totalResponses}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-sm font-medium">Conversion Rate</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-zinc-100">{conversionRate}</p>
                  <span className="text-zinc-500 font-medium">%</span>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-medium">Avg Completion Time</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-zinc-100">{avgTime}</p>
                  <span className="text-zinc-500 font-medium">sec</span>
                </div>
              </div>
            </div>

            {/* Bar chart — faithful recreation of the Recharts bar chart style */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-zinc-100 mb-6">Response Volume (Last 7 Days)</h3>

              <div className="h-48 flex items-end gap-2 px-2 pt-4">
                {CHART_DATA.map((d) => {
                  const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="relative w-full flex items-end justify-center" style={{ height: "140px" }}>
                        <div
                          className="w-full bg-emerald-500 rounded-t-[4px] transition-all duration-300 group-hover:bg-emerald-400"
                          style={{ height: `${Math.max(pct, 4)}%` }}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-[10px] font-mono text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {d.count}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">{d.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Submissions table — same as ResponsesAnalytics.tsx */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-100">Recent Submissions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-900/50 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium text-zinc-500 whitespace-nowrap">Date</th>
                      <th className="px-6 py-3 font-medium text-zinc-500 whitespace-nowrap">Time (s)</th>
                      <th className="px-6 py-3 font-medium text-zinc-500 whitespace-nowrap">Handle</th>
                      <th className="px-6 py-3 font-medium text-zinc-500 whitespace-nowrap">Environment</th>
                      <th className="px-6 py-3 font-medium text-zinc-500 whitespace-nowrap">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {MOCK_RESPONSES.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-zinc-300">
                          {new Date(r.submittedAt).toLocaleString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">{r.timeToComplete}s</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">{r.payload.handle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase ${
                            r.payload.env === "prod"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}>
                            {r.payload.env}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-amber-400">
                          {"★".repeat(Number(r.payload.rating))}{"☆".repeat(5 - Number(r.payload.rating))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
