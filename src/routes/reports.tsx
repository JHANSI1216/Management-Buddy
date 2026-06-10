import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIRecommendations } from "@/components/ai-recommendations";
import { BarChart3, Download, FileText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics · CPMS" },
      { name: "description", content: "Historical comparisons, future forecasts and downloadable reports." },
    ],
  }),
  component: () => <AppShell><Reports /></AppShell>,
});

function downloadCSV(name: string, rows: any[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${name}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${name}.csv downloaded`);
}

function Reports() {
  const [usage, setUsage] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [maint, setMaint] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [u, f, i, m] = await Promise.all([
        supabase.from("resource_usage").select("*").order("period"),
        supabase.from("facilities").select("*"),
        supabase.from("inventory_items").select("*"),
        supabase.from("maintenance_records").select("*"),
      ]);
      setUsage(u.data ?? []); setFacilities(f.data ?? []); setInventory(i.data ?? []); setMaint(m.data ?? []);
    })();
  }, []);

  const monthly = Array.from(new Set(usage.map((u) => u.period))).sort().map((p) => {
    const e = usage.find((r) => r.period === p && r.resource_type === "electricity");
    const w = usage.find((r) => r.period === p && r.resource_type === "water");
    return { period: p.slice(5), electricity: e?.consumption ?? 0, water: w?.consumption ?? 0 };
  });

  const facByType = Object.entries(facilities.reduce((a: any, f) => { a[f.type] = (a[f.type] ?? 0) + 1; return a; }, {})).map(([type, count]: any) => ({ type, count }));

  const reports = [
    { name: "Resource Usage Report", desc: "8-month consumption & cost across all utilities", rows: usage, count: usage.length },
    { name: "Facility Utilization Report", desc: "Per-facility current and predicted utilization", rows: facilities, count: facilities.length },
    { name: "Inventory Stock Report", desc: "Live stock vs. thresholds and predicted demand", rows: inventory, count: inventory.length },
    { name: "Maintenance Register", desc: "Equipment health, risk scores and schedule", rows: maint, count: maint.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary" /> Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Historical comparisons, future forecasts and exports.</p>
        </div>
        <Badge variant="secondary" className="gradient-bg text-white">{reports.reduce((a, r) => a + r.count, 0)} records</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Resource Trend (Historical + Forecast)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="elec" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                  <linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="electricity" stroke="#f59e0b" fill="url(#elec)" strokeWidth={2} />
                <Area type="monotone" dataKey="water" stroke="#3b82f6" fill="url(#wat)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="text-base">Facilities by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={facByType}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Downloadable Reports</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reports.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-10 w-10 place-items-center rounded-lg gradient-bg text-white shrink-0"><FileText className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.desc} · {r.count} rows</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(r.name.replace(/\s+/g, "_").toLowerCase(), r.rows)}>
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <AIRecommendations limit={4} />
      </div>
    </div>
  );
}
