import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AIRecommendations } from "@/components/ai-recommendations";
import { KpiCard } from "@/components/kpi-card";
import { Building2, TrendingUp, Users, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/infrastructure")({
  head: () => ({
    meta: [
      { title: "Infrastructure Analytics · CPMS" },
      { name: "description", content: "Predict classroom, laboratory and facility utilization trends across the campus." },
    ],
  }),
  component: () => <AppShell><Infra /></AppShell>,
});

function Infra() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from("facilities").select("*").order("utilization_pct", { ascending: false }).then(({ data }) => setRows(data ?? [])); }, []);

  const total = rows.length;
  const avg = total ? Math.round(rows.reduce((a, f) => a + f.utilization_pct, 0) / total) : 0;
  const capacity = rows.reduce((a, f) => a + f.capacity, 0);
  const overUtil = rows.filter((f) => f.utilization_pct >= 85).length;

  const trendBadge = (t: string) => ({
    up: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    down: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    stable: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  }[t] ?? "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-primary" /> Infrastructure Analytics</h1>
        <p className="text-sm text-muted-foreground">Predicted utilization for classrooms, labs and facilities.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Facilities" value={total} icon={Building2} tone="brand" />
        <KpiCard label="Avg Utilization" value={`${avg}%`} icon={TrendingUp} tone="violet" delta={{ value: "+3.4%", up: true }} />
        <KpiCard label="Total Capacity" value={capacity.toLocaleString()} icon={Users} tone="emerald" />
        <KpiCard label="Over-Utilized" value={overUtil} icon={Calendar} tone="amber" />
      </div>

      <Card className="glass">
        <CardHeader><CardTitle className="text-base">Utilization vs. Predicted (next term)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={rows.map((r) => ({ name: r.name, current: r.utilization_pct, predicted: r.predicted_next_pct }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="current" fill="#6366f1" name="Current %" radius={[6,6,0,0]} />
              <Bar dataKey="predicted" fill="#a855f7" name="Predicted %" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Facility Breakdown</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-48">Utilization</TableHead>
                    <TableHead className="text-right">Predicted</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{r.type}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={r.utilization_pct} className="h-2" />
                          <span className="text-xs w-10 text-right">{r.utilization_pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{r.predicted_next_pct}%</TableCell>
                      <TableCell className="text-right"><Badge className={trendBadge(r.trend)}>{r.trend}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <AIRecommendations module="infrastructure" />
      </div>
    </div>
  );
}
