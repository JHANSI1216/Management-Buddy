import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { AIRecommendations } from "@/components/ai-recommendations";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Wrench, ShieldAlert, Activity, CalendarClock, HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance Prediction · CPMS" },
      { name: "description", content: "Monitor equipment health, predict maintenance needs and schedule activities." },
    ],
  }),
  component: () => <AppShell><Maint /></AppShell>,
});

const riskBadge = (r: string) => ({
  low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  critical: "bg-red-500/15 text-red-700 dark:text-red-300",
}[r] ?? "");

const statusBadge = (s: string) => ({
  operational: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  scheduled: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  overdue: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  in_repair: "bg-red-500/15 text-red-700 dark:text-red-300",
}[s] ?? "");

function Maint() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from("maintenance_records").select("*").order("risk_level", { ascending: false }).then(({ data }) => setRows(data ?? [])); }, []);

  const total = rows.length;
  const critical = rows.filter((r) => r.risk_level === "critical").length;
  const avgHealth = total ? Math.round(rows.reduce((a, r) => a + r.health_score, 0) / total) : 0;
  const upcoming = rows.filter((r) => r.next_due && new Date(r.next_due) > new Date()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" /> Maintenance Prediction</h1>
        <p className="text-sm text-muted-foreground">Equipment health, AI risk forecasts and scheduling.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Assets Monitored" value={total} icon={Activity} tone="brand" />
        <KpiCard label="Avg Health Score" value={`${avgHealth}%`} icon={HeartPulse} tone="emerald" delta={{ value: "+1.2%", up: true }} />
        <KpiCard label="Critical Risks" value={critical} icon={ShieldAlert} tone="red" delta={{ value: "Action required", up: false }} />
        <KpiCard label="Upcoming Services" value={upcoming} icon={CalendarClock} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Equipment Health Register</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-32">Health</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.equipment_name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{r.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={r.health_score} className={`h-2 ${r.health_score < 50 ? "[&>div]:bg-red-500" : r.health_score < 75 ? "[&>div]:bg-amber-500" : ""}`} />
                          <span className="text-xs w-8 text-right">{r.health_score}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={riskBadge(r.risk_level)}>{r.risk_level}</Badge></TableCell>
                      <TableCell><Badge className={statusBadge(r.status)}>{r.status.replace("_"," ")}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.next_due ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <AIRecommendations module="maintenance" />
      </div>
    </div>
  );
}
