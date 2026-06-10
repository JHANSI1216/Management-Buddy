import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BarChart3, Zap, Package, Wrench, Building2, Sparkles, ShieldCheck, Cpu, TrendingUp, ArrowRight } from "lucide-react";
import heroImg from "@/assets/ai-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CPMS · College Predictive Management System" },
      { name: "description", content: "AI-powered platform for college administrators — predict resource usage, infrastructure demand, equipment maintenance and operational trends." },
      { property: "og:title", content: "CPMS · AI-powered College Management" },
      { property: "og:description", content: "Data-driven decisions for campus infrastructure, resources, inventory and maintenance." },
    ],
  }),
  component: () => <AppShell><Home /></AppShell>,
});

const benefits = [
  { icon: Cpu, title: "AI-Powered Predictions", text: "ML-driven forecasts for usage, demand and risk across every department." },
  { icon: ShieldCheck, title: "Proactive Maintenance", text: "Detect equipment risks before failure and schedule service automatically." },
  { icon: TrendingUp, title: "Optimize Resources", text: "Cut electricity, water and internet waste with actionable suggestions." },
  { icon: Sparkles, title: "Decision Support", text: "Plain-English recommendations for administrators, not raw dashboards." },
];

const modules = [
  { icon: Building2, title: "Infrastructure Analytics", text: "Classroom, lab and facility utilization trends.", url: "/infrastructure" },
  { icon: Zap, title: "Resource Management", text: "Electricity, water and internet forecasts.", url: "/resources" },
  { icon: Package, title: "Inventory Management", text: "Stock tracking, low-stock alerts, predictions.", url: "/inventory" },
  { icon: Wrench, title: "Maintenance Prediction", text: "Equipment health and risk-driven scheduling.", url: "/maintenance" },
  { icon: BarChart3, title: "Reports & Analytics", text: "Historical comparisons and future forecasts.", url: "/reports" },
];

function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Final-year AI project · Enterprise grade</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="gradient-text">College Predictive</span><br />
            <span>Management System</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
            An AI-powered platform that helps administrators make data-driven decisions
            by predicting resource usage, infrastructure demand, equipment maintenance and operational trends.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gradient-bg text-white glow">
              <Link to="/dashboard">Launch Dashboard <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/infrastructure">Explore Modules</Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
            {[["98%","Accuracy"],["24/7","Monitoring"],["5","Modules"]].map(([v, l]) => (
              <div key={l} className="glass rounded-xl p-3 text-center">
                <p className="text-2xl font-bold gradient-text">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative animate-fade-in">
          <div className="absolute -inset-4 gradient-bg opacity-20 blur-3xl rounded-full" />
          <img src={heroImg} alt="AI analytics illustration showing predictive dashboards for campus management"
            className="relative rounded-2xl glass p-2 shadow-2xl w-full object-cover" />
        </div>
      </section>

      {/* Benefits */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Key Benefits</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <Card key={b.title} className="glass hover:glow transition-all hover-scale">
              <CardContent className="p-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl gradient-bg text-white mb-3">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{b.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Platform Modules</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.url} to={m.url} className="group">
              <Card className="glass h-full transition-all hover:-translate-y-1 hover:glow">
                <CardContent className="p-5">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white mb-4">
                    <m.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold flex items-center justify-between">
                    {m.title}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{m.text}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <Card className="glass overflow-hidden relative">
          <div className="absolute inset-0 gradient-bg opacity-10" />
          <CardContent className="relative p-8 sm:p-12 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to make data-driven decisions?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Open the predictive dashboard to see live AI insights across infrastructure, resources, inventory and maintenance.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="gradient-bg text-white glow">
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/reports">View Reports</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
