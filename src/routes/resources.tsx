import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { AIRecommendations } from "@/components/ai-recommendations";
import { Zap, Droplet, Wifi, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from "recharts";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Management · CPMS" },
      { name: "description", content: "Forecast electricity, water and internet consumption with optimization suggestions." },
    ],
  }),
  component: () => <AppShell><Resources /></AppShell>,
});

function Resources() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from("resource_usage").select("*").order("period").then(({ data }) => setRows(data ?? [])); }, []);

  const byType = (t: string) => rows.filter((r) => r.resource_type === t);
  const latestOf = (t: string) => byType(t).filter((r) => !r.forecast).slice(-1)[0]?.consumption ?? 0;
  const totalCost = rows.filter((r) => !r.forecast).reduce((a, r) => a + Number(r.cost), 0);

  const periods = Array.from(new Set(rows.map((r) => r.period))).sort();
  const chartData = periods.map((p) => {
    const e = rows.find((r) => r.period === p && r.resource_type === "electricity");
    const w = rows.find((r) => r.period === p && r.resource_type === "water");
    const i = rows.find((r) => r.period === p && r.resource_type === "internet");
    return {
      period: p.slice(5),
      electricity: e?.consumption ?? 0,
      water: w?.consumption ?? 0,
      internet: i?.consumption ?? 0,
      forecast: e?.forecast ? "yes" : "no",
    };
  });
  const firstForecastIdx = chartData.findIndex((d) => d.forecast === "yes");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-primary" /> Resource Management</h1>
        <p className="text-sm text-muted-foreground">Forecasts and optimization suggestions for electricity, water and internet.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Electricity (kWh)" value={latestOf("electricity").toLocaleString()} icon={Zap} tone="amber" delta={{ value: "+5.1%", up: true }} />
        <KpiCard label="Water (kL)" value={latestOf("water").toLocaleString()} icon={Droplet} tone="brand" delta={{ value: "+5.7%", up: true }} />
        <KpiCard label="Internet (GB)" value={latestOf("internet").toLocaleString()} icon={Wifi} tone="violet" delta={{ value: "+5.8%", up: true }} />
        <KpiCard label="6-mo Cost (₹)" value={(totalCost / 100000).toFixed(1) + "L"} icon={IndianRupee} tone="emerald" />
      </div>

      <Card className="glass">
        <CardHeader><CardTitle className="text-base">Consumption Trend & Forecast</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {firstForecastIdx > 0 && (
                <ReferenceLine x={chartData[firstForecastIdx].period} stroke="#a855f7" strokeDasharray="4 4" label={{ value: "Forecast", fill: "#a855f7", fontSize: 11 }} />
              )}
              <Line type="monotone" dataKey="electricity" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="internet" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Optimization Suggestions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { t: "Install motion-sensor LED lighting in CSE block", saving: "~₹4.2L / yr", icon: Zap },
              { t: "Replace restroom taps with low-flow aerators", saving: "~1,800 kL / yr", icon: Droplet },
              { t: "Throttle non-academic internet usage 11 PM–6 AM", saving: "~12% bandwidth", icon: Wifi },
              { t: "Schedule HVAC pre-cool only before peak classes", saving: "~7% electricity", icon: Zap },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-9 w-9 place-items-center rounded-lg gradient-bg text-white shrink-0"><s.icon className="h-4 w-4" /></div>
                  <p className="text-sm font-medium truncate">{s.t}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">{s.saving}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <AIRecommendations module="resources" />
      </div>
    </div>
  );
}
