import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { AIRecommendations } from "@/components/ai-recommendations";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Package, AlertTriangle, Boxes, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory Management · CPMS" },
      { name: "description", content: "Track equipment, generate low-stock alerts and predict future inventory needs." },
    ],
  }),
  component: () => <AppShell><Inv /></AppShell>,
});

function Inv() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from("inventory_items").select("*").order("name").then(({ data }) => setRows(data ?? [])); }, []);

  const total = rows.length;
  const low = rows.filter((r) => r.quantity < r.min_threshold);
  const totalUnits = rows.reduce((a, r) => a + r.quantity, 0);
  const predNeed = rows.reduce((a, r) => a + r.predicted_need, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Inventory Management</h1>
        <p className="text-sm text-muted-foreground">Stock tracking with AI-predicted demand and low-stock alerts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="SKUs Tracked" value={total} icon={Boxes} tone="brand" />
        <KpiCard label="Units in Stock" value={totalUnits.toLocaleString()} icon={Package} tone="violet" />
        <KpiCard label="Low Stock Alerts" value={low.length} icon={AlertTriangle} tone="red" />
        <KpiCard label="Predicted Demand" value={predNeed.toLocaleString()} icon={TrendingUp} tone="emerald" delta={{ value: "Next quarter", up: true }} />
      </div>

      {low.length > 0 && (
        <Card className="glass border-amber-500/40">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400"><AlertTriangle className="h-4 w-4" /> Low Stock Alerts</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {low.map((r) => (
              <div key={r.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{r.name}</p>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">{r.quantity}/{r.min_threshold}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">AI suggests reorder of {r.predicted_need} {r.unit}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Full Inventory</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="w-40">Level</TableHead>
                    <TableHead className="text-right">Predicted Need</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const pct = Math.min(100, Math.round((r.quantity / Math.max(r.min_threshold * 3, 1)) * 100));
                    const isLow = r.quantity < r.min_threshold;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                        <TableCell className={`text-right font-mono ${isLow ? "text-amber-600 dark:text-amber-400 font-bold" : ""}`}>{r.quantity} {r.unit}</TableCell>
                        <TableCell><Progress value={pct} className={`h-2 ${isLow ? "[&>div]:bg-amber-500" : ""}`} /></TableCell>
                        <TableCell className="text-right">{r.predicted_need}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <AIRecommendations module="inventory" />
      </div>
    </div>
  );
}
