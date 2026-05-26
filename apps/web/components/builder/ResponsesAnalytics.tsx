"use client";

import React from "react";
import { Download, Users, Activity } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export function ResponsesAnalytics({ formId }: { formId: string }) {
  const utils = trpc.useUtils();
  const formQuery = trpc.form.getFormById.useQuery({ formId });
  const responsesQuery = trpc.response.getResponses.useQuery({ formId });

  trpc.analytics.onNewSubmission.useSubscription(
    { formId },
    {
      onData: () => {
        utils.response.getResponses.invalidate({ formId });
        utils.form.getFormById.invalidate({ formId });
      },
    },
  );

  if (formQuery.isLoading || responsesQuery.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const form = formQuery.data;
  const responses = responsesQuery.data || [];

  const handleExportCSV = () => {
    if (!responses.length) return;

    const allKeys = new Set<string>(["Date", "Response ID"]);
    responses.forEach((r: any) => {
      Object.keys(r.payload || {}).forEach((k) => allKeys.add(k));
    });
    const headers = Array.from(allKeys);

    const rows = responses.map((r: any) => {
      const row: any = {
        Date: new Date(r.submittedAt).toISOString(),
        "Response ID": r.id,
        ...(r.payload || {}),
      };
      return headers.map((h) => `"${(row[h] || "").toString().replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `responses_${formId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const views = form?.views || 0;
  const totalResponses = responses.length;

  const chartDataMap = new Map<string, number>();
  responses.forEach((r: any) => {
    const date = format(new Date(r.submittedAt), "MMM dd");
    chartDataMap.set(date, (chartDataMap.get(date) || 0) + 1);
  });

  const chartData = [];
  const today = startOfDay(new Date());
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, "MMM dd");
    chartData.push({
      date: dateStr,
      count: chartDataMap.get(dateStr) || 0,
    });
  }

  const payloadKeys = new Set<string>();
  responses.forEach((r: any) => {
    Object.keys(r.payload || {}).forEach((k) => payloadKeys.add(k));
  });
  const dynamicCols = Array.from(payloadKeys).slice(0, 3);

  const schemaMap = new Map<string, string>();
  if (form?.schema && Array.isArray(form.schema)) {
    form.schema.forEach((field: any) => {
      schemaMap.set(field.id, field.name || field.prompt || field.id);
    });
  }

  const fields = Array.isArray(form?.schema) ? form.schema : [];

  const getChoiceInsights = (fieldId: string) => {
    const tally = new Map<string, number>();
    responses.forEach((r: any) => {
      const val = r.payload?.[fieldId];
      if (val) {
        const options = String(val)
          .split(",")
          .map((s) => s.trim());
        options.forEach((opt) => {
          if (opt) {
            tally.set(opt, (tally.get(opt) || 0) + 1);
          }
        });
      }
    });

    return Array.from(tally.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getNumberInsights = (fieldId: string) => {
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let count = 0;

    responses.forEach((r: any) => {
      if (r.payload?.[fieldId] !== undefined && r.payload?.[fieldId] !== "") {
        const val = Number(r.payload[fieldId]);
        if (!isNaN(val)) {
          sum += val;
          if (val < min) min = val;
          if (val > max) max = val;
          count++;
        }
      }
    });

    if (count === 0) return null;
    return {
      avg: (sum / count).toFixed(1),
      min,
      max,
    };
  };

  const getTextInsights = (fieldId: string) => {
    const textResponses: string[] = [];
    responses.forEach((r: any) => {
      const val = r.payload?.[fieldId];
      if (val && typeof val === "string") {
        textResponses.push(val);
      }
    });
    const unique = Array.from(new Set(textResponses));
    return unique;
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto p-8 gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Analytics</h2>
          <p className="text-sm text-zinc-400 mt-1 font-mono">Form: {form?.title || formId}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="gap-2 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <Users className="h-4 w-4" />
            <h3 className="text-sm font-medium">Total Views</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-100">{views}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <Activity className="h-4 w-4" />
            <h3 className="text-sm font-medium">Total Responses</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-100">{totalResponses}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[300px]">
        <h3 className="text-sm font-medium text-zinc-100 mb-6">Response Volume (Last 7 Days)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis
                dataKey="date"
                stroke="#52525b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#52525b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
                allowDecimals={false}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  color: "#f4f4f5",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#10b981" }}
                cursor={{ fill: "#27272a", opacity: 0.4 }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="flex flex-col gap-6 mt-4">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-100">Question Insights</h3>
          {responses.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
              Not enough data to generate insights.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field: any) => {
                const isChoice = field.type === "single_select" || field.type === "multiple_choice";
                const isNumber = field.type === "number" || field.type === "rating";

                return (
                  <div
                    key={field.id}
                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col"
                  >
                    <h4
                      className="text-sm font-medium text-zinc-200 mb-6 truncate"
                      title={field.prompt || field.name}
                    >
                      {field.prompt || field.name}
                    </h4>

                    {isChoice &&
                      (() => {
                        const data = getChoiceInsights(field.id);
                        const COLORS = ["#6366f1", "#10b981", "#0ea5e9", "#64748b", "#8b5cf6"];
                        return data.length > 0 ? (
                          <div className="h-[220px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={data}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {data.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  contentStyle={{
                                    backgroundColor: "#18181b",
                                    borderColor: "#27272a",
                                    color: "#f4f4f5",
                                    borderRadius: "8px",
                                  }}
                                  itemStyle={{ color: "#fff" }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 min-h-[220px]">
                            No responses for this question yet.
                          </div>
                        );
                      })()}

                    {isNumber &&
                      (() => {
                        const stats = getNumberInsights(field.id);
                        return stats ? (
                          <div className="flex flex-col gap-4 flex-1 justify-center min-h-[220px]">
                            <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                              <span className="text-sm text-zinc-400">Average</span>
                              <span className="text-xl font-bold text-zinc-100">{stats.avg}</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                              <span className="text-sm text-zinc-400">Minimum</span>
                              <span className="text-xl font-bold text-zinc-100">{stats.min}</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                              <span className="text-sm text-zinc-400">Maximum</span>
                              <span className="text-xl font-bold text-zinc-100">{stats.max}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 min-h-[220px]">
                            No numeric responses yet.
                          </div>
                        );
                      })()}

                    {!isChoice &&
                      !isNumber &&
                      (() => {
                        const texts = getTextInsights(field.id);
                        return texts.length > 0 ? (
                          <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[220px]">
                            {texts.map((t, idx) => (
                              <div
                                key={idx}
                                className="bg-zinc-950 border border-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300"
                              >
                                "{t}"
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 min-h-[220px]">
                            No text responses yet.
                          </div>
                        );
                      })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mt-4">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-100">Recent Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3 font-medium text-zinc-500 whitespace-nowrap">Date</th>
                <th className="px-6 py-3 font-medium text-zinc-500 whitespace-nowrap">
                  Response ID
                </th>
                {dynamicCols.map((col) => (
                  <th key={col} className="px-6 py-3 font-medium text-zinc-500 whitespace-nowrap">
                    {schemaMap.get(col) || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {responses.length > 0 ? (
                responses.slice(0, 50).map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      {format(new Date(r.submittedAt), "MMM dd, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-zinc-500">
                      {r.id.slice(0, 8)}...
                    </td>
                    {dynamicCols.map((col) => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap">
                        <span className="truncate max-w-[200px] inline-block">
                          {r.payload?.[col] !== undefined ? String(r.payload[col]) : "-"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2 + dynamicCols.length}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
