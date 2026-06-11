import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Brain, Target, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admission Trends · CPMS" },
      { name: "description", content: "AI-driven admission forecasts and department-wise demand prediction." },
    ],
  }),
  component: () => <AppShell><Admissions /></AppShell>,
});

const history = [
  { year: "2019", actual: 612 },
  { year: "2020", actual: 548 },
  { year: "2021", actual: 671 },
  { year: "2022", actual: 742 },
  { year: "2023", actual: 798 },
  { year: "2024", actual: 836 },
  { year: "2025", actual: 871 },
];
const forecast = [
  ...history.map((h) => ({ ...h, predicted: null as number | null })),
  { year: "2026", actual: null, predicted: 912 },
  { year: "2027", actual: null, predicted: 958 },
  { year: "2028", actual: null, predicted: 1004 },
  { year: "2029", actual: null, predicted: 1052 },
];

const deptForecast = [
  { dept: "CSE", current: 240, next: 268, growth: 11.7 },
  { dept: "AI & DS", current: 120, next: 168, growth: 40.0 },
  { dept: "ECE", current: 180, next: 178, growth: -1.1 },
  { dept: "MECH", current: 120, next: 102, growth: -15.0 },
  { dept: "CIVIL", current: 90, next: 76, growth: -15.6 },
  { dept: "EEE", current: 121, next: 120, growth: -0.8 },
];

const fundingMix = [
  { y: "2023", scholarship: 38, full: 62 },
  { y: "2024", scholarship: 41, full: 59 },
  { y: "2025", scholarship: 44, full: 56 },
  { y: "2026*", scholarship: 47, full: 53 },
  { y: "2027*", scholarship: 50, full: 50 },
];

const insights = [
  { title: "AI & DS will exceed CSE intake by 2028", risk: "opportunity", text: "Add 2 more AI/DS sections by AY 2026-27; current lab capacity is the bottleneck." },
  { title: "MECH & CIVIL demand declining ~15% YoY", risk: "high", text: "Reposition as Mechatronics / Smart Infrastructure to recover applicant interest." },
  { title: "Scholarship dependency growing 3% per year", risk: "medium", text: "Plan a 12% rise in scholarship budget for FY 2026 to maintain conversion." },
  { title: "Tier-2 city applicants up 22%", risk: "opportunity", text: "Hostel demand will exceed supply by Q3 2026 — start expansion planning now." },
];

function Admissions() {
  const next = forecast.find((f) => f.year === "2026")!.predicted!;
  const last = history.at(-1)!.actual;
  const growth = (((next - last) / last) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" /> Admission Trends & Forecast</h1>
        <p className="text-sm text-muted-foreground">AI-driven prediction of future admissions, department-wise demand and funding mix.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { l: "2025 Intake", v: last, sub: "Actual", icon: Users },
          { l: "2026 Forecast", v: next, sub: `+${growth}% YoY`, icon: Target },
          { l: "Model Confidence", v: "92%", sub: "ARIMA + ML ensemble", icon: Brain },
          { l: "Capacity Utilization", v: "87%", sub: "Optimal range", icon: Sparkles },
        ].map((k) => (
          <Card key={k.l} className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.l}</p>
                <k.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-1 text-3xl font-bold gradient-text">{k.v}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="forecast">
        <TabsList>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="dept">By Department</TabsTrigger>
          <TabsTrigger value="funding">Funding Mix</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Historical vs Predicted Admissions</CardTitle>
              <CardDescription>Dashed line = AI-predicted future admissions (2026-2029)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--accent-foreground))" strokeDasharray="6 4" strokeWidth={2} name="Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dept">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Department-wise Forecast (Next Year)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={deptForecast}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="dept" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="hsl(var(--muted-foreground))" name="2025" />
                  <Bar dataKey="next" fill="hsl(var(--primary))" name="2026 (predicted)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {deptForecast.map((d) => (
                  <div key={d.dept} className="flex items-center justify-between rounded-md border p-2">
                    <span className="font-medium">{d.dept}</span>
                    <Badge className={d.growth >= 0 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-red-500/15 text-red-700 dark:text-red-300"}>
                      {d.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {d.growth > 0 ? "+" : ""}{d.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Scholarship vs Full-fee Mix (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={fundingMix}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="y" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="scholarship" stroke="hsl(var(--primary))" strokeWidth={2} name="Scholarship %" />
                  <Line type="monotone" dataKey="full" stroke="hsl(var(--accent-foreground))" strokeWidth={2} name="Full-fee %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Strategic Insights</CardTitle>
          <CardDescription>Decision-support recommendations for the admissions cell</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((i) => (
            <div key={i.title} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{i.title}</p>
                <Badge variant={i.risk === "high" ? "destructive" : i.risk === "opportunity" ? "default" : "secondary"}>{i.risk}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{i.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
