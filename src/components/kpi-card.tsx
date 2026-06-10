import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export function KpiCard({
  label, value, icon: Icon, delta, tone = "brand",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: string; up?: boolean };
  tone?: "brand" | "violet" | "emerald" | "amber" | "red";
}) {
  const toneMap = {
    brand: "from-blue-500 to-indigo-600",
    violet: "from-violet-500 to-fuchsia-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    red: "from-rose-500 to-red-600",
  };
  return (
    <Card className="glass overflow-hidden relative group hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold truncate">{value}</p>
            {delta && (
              <p className={`mt-1 inline-flex items-center gap-1 text-xs ${delta.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {delta.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {delta.value}
              </p>
            )}
          </div>
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${toneMap[tone]} text-white shadow-md`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
