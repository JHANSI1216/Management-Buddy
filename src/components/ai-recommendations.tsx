import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, CheckCircle2, Info, AlertOctagon } from "lucide-react";

type Rec = {
  id: string;
  module: string;
  title: string;
  description: string;
  severity: "info" | "success" | "warning" | "critical";
  impact: string | null;
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertOctagon,
};
const tones: Record<Rec["severity"], string> = {
  info: "border-blue-500/30 bg-blue-500/5",
  success: "border-emerald-500/30 bg-emerald-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  critical: "border-red-500/30 bg-red-500/5",
};
const badge: Record<Rec["severity"], string> = {
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  critical: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export function AIRecommendations({ module, limit = 6 }: { module?: string; limit?: number }) {
  const [recs, setRecs] = useState<Rec[]>([]);

  useEffect(() => {
    (async () => {
      let q = supabase.from("ai_recommendations").select("*").order("created_at", { ascending: false }).limit(limit);
      if (module) q = q.eq("module", module);
      const { data } = await q;
      setRecs((data ?? []) as Rec[]);
    })();
  }, [module, limit]);

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-bg text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recs.length === 0 && <p className="text-sm text-muted-foreground">No insights yet.</p>}
        {recs.map((r) => {
          const Icon = icons[r.severity];
          return (
            <div key={r.id} className={`rounded-lg border p-3 ${tones[r.severity]} animate-fade-in`}>
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold truncate">{r.title}</p>
                    <Badge variant="secondary" className={badge[r.severity]}>{r.severity}</Badge>
                    {r.impact && <Badge variant="outline" className="text-[10px]">Impact: {r.impact}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
