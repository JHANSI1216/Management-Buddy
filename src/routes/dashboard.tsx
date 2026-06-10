import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { AIRecommendations } from "@/components/ai-recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Zap, Package, Wrench, Activity, AlertTriangle, Brain, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · CPMS" },
      { name: "description", content: "Live predictive dashboard with KPIs, AI insights and trend analysis for campus operations." },
    ],
  }),
  component: () => <AppShell><Dashboard /></AppShell>,
});

function Dashboard() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [maint, setMaint] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [f, u, i, m] = await Promise.all([
        supabase.from("facilities").select("*"),
        supabase.from("resource_usage").select("*").order("period"),
        supabase.from("inventory_items").select("*"),
        supabase.from("maintenance_records").select("*"),
      ]);
      setFacilities(f.data ?? []);
      setUsage(u.data ?? []);
      setInventory(i.data ?? []);
      setMaint(m.data ?? []);
    })();
  }, []);

  const avgUtil = facilities.length ? Math.round(facilities.reduce((a, f) => a + f.utilization_pct, 0) / facilities.length) : 0;
  const lowStock = inventory.filter((i) => i.quantity < i.min_threshold).length;
  const highRisk = maint.filter((m) => m.risk_level === "high" || m.risk_level === "critical").length;
  const elecLatest = usage.filter((u) => u.resource_type === "electricity" && !u.forecast).slice(-1)[0]?.consumption ?? 0;

  // Build chart data: electricity monthly
  const elec = usage.filter((u) => u.resource_type === "electricity").map((u) => ({
    month: u.period.slice(5),
    actual: u.forecast ? null : u.consumption,
    forecast: u.forecast ? u.consumption : null,
  }));

  const facType = Object.entries(facilities.reduce((acc: any, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + f.utilization_pct;
    return acc;
  }, {})).map(([name, v]: any) => ({ name, value: Math.round(v / facilities.filter((f) => f.type === name).length || 0) }));

  const COLORS = ["#6366f1", "#a855f7", "#3b82f6", "#06b6d4", "#10b981"];

  const activities = [
    { t: "AI flagged Generator Backup at high risk", time: "2 min ago", icon: AlertTriangle, tone: "text-amber-500" },
    { t: "Inventory auto-reorder draft created", time: "1 hr ago", icon: Package, tone: "text-blue-500" },
    { t: "Resource forecast updated for Q3", time: "3 hr ago", icon: TrendingUp, tone: "text-violet-500" },
    { t: "HVAC Unit #1 scheduled for service", time: "Yesterday", icon: Wrench, tone: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Predictive Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">AI insights · live KPIs · trend forecasts</p>
        </div>
        <Badge variant="secondary" className="gradient-bg text-white">Live · AI Active</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Avg Utilization" value={`${avgUtil}%`} icon={Building2} tone="brand" delta={{ value: "+4.2% MoM", up: true }} />
        <KpiCard label="Electricity (kWh)" value={elecLatest.toLocaleString()} icon={Zap} tone="violet" delta={{ value: "+5.1%", up: true }} />
        <KpiCard label="Low Stock Items" value={lowStock} icon={Package} tone="amber" delta={{ value: "Needs reorder", up: false }} />
        <KpiCard label="High-Risk Assets" value={highRisk} icon={Wrench} tone="red" delta={{ value: "Action required", up: false }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Electricity Consumption · Trend + Forecast</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={elec}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Area type="monotone" dataKey="actual" stroke="#6366f1" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="forecast" stroke="#a855f7" fill="url(#g2)" strokeDasharray="4 4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="text-base">Facility Utilization by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={facType} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={3}>
                  {facType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Top Facility Utilization</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={facilities.slice(0, 8).map((f) => ({ name: f.name.split(" - ").pop()?.slice(0, 14) ?? f.name.slice(0, 14), util: f.utilization_pct, pred: f.predicted_next_pct }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="util" fill="#6366f1" name="Current %" radius={[6,6,0,0]} />
                <Bar dataKey="pred" fill="#a855f7" name="Predicted %" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Recent Activities</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/40 transition">
                <a.icon className={`h-4 w-4 mt-0.5 ${a.tone}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{a.t}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AIRecommendations />
    </div>
  );
}
