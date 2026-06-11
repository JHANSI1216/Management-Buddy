import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Megaphone, GraduationCap, Briefcase, Sparkles, Brain, Lightbulb, Target } from "lucide-react";

export const Route = createFileRoute("/outreach")({
  head: () => ({
    meta: [
      { title: "Outreach & Applicant Growth · CPMS" },
      { name: "description", content: "AI-driven suggestions for teaching and non-teaching staff to increase applicants to the college." },
    ],
  }),
  component: () => <AppShell><Outreach /></AppShell>,
});

const funnel = [
  { stage: "Enquiries", count: 12400 },
  { stage: "Applications", count: 5820 },
  { stage: "Counselling", count: 2410 },
  { stage: "Admitted", count: 871 },
];

const channels = [
  { ch: "Referrals", score: 88 },
  { ch: "Social Media", score: 74 },
  { ch: "Open House", score: 69 },
  { ch: "School Visits", score: 62 },
  { ch: "Print/News", score: 35 },
  { ch: "Web SEO", score: 58 },
];

const teachingActions = [
  { title: "Faculty Research Showcase", impact: 18, effort: "Medium", text: "Publish 1 short video per faculty highlighting research/projects — boosts trust signals to parents." },
  { title: "Mentor a School Pilot", impact: 22, effort: "Low", text: "Each department adopts 5 nearby schools for monthly STEM workshops. Strongest funnel-top driver historically." },
  { title: "Alumni Industry Talks", impact: 15, effort: "Low", text: "Monthly LinkedIn Live with placed alumni — drives Tier-2 city applications." },
  { title: "Industry-Certified Electives", impact: 25, effort: "High", text: "Add 2 NPTEL/AWS/Google co-branded electives per dept. Listed in brochure ⇒ +25% applications." },
];

const nonTeachingActions = [
  { title: "WhatsApp Counselling Bot", impact: 20, effort: "Medium", text: "Auto-respond to enquiries within 2 min. Current 6-hour gap loses ~28% of leads." },
  { title: "Open-Campus Saturdays", impact: 17, effort: "Low", text: "Front office hosts walk-in tours every Saturday — converts ~3x better than online sessions." },
  { title: "Scholarship Calculator on Website", impact: 14, effort: "Low", text: "Transparent fee/scholarship tool reduces drop-off at the application stage by 11%." },
  { title: "Regional Language Brochures", impact: 12, effort: "Low", text: "Tier-3 applicants up 22% — Telugu/Hindi/Tamil collateral closes the gap." },
  { title: "Alumni Referral Rewards", impact: 19, effort: "Medium", text: "Referrals are your #1 channel; formalize with a small tuition credit per successful admission." },
];

function ActionCard({ a }: { a: { title: string; impact: number; effort: string; text: string } }) {
  return (
    <div className="rounded-lg border p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{a.title}</p>
        <Badge variant="outline">{a.effort} effort</Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{a.text}</p>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Predicted applicant lift</span>
          <span className="font-semibold text-primary">+{a.impact}%</span>
        </div>
        <Progress value={a.impact * 4} />
      </div>
    </div>
  );
}

function Outreach() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6 text-primary" /> Outreach & Applicant Growth</h1>
        <p className="text-sm text-muted-foreground">AI-generated actions for teaching and non-teaching staff to grow the applicant pipeline.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { l: "Enquiries (YTD)", v: "12.4K", sub: "+9% YoY" },
          { l: "Application Rate", v: "47%", sub: "Target 55%" },
          { l: "Conversion", v: "15.0%", sub: "Counselling → Admitted" },
          { l: "Predicted Lift", v: "+28%", sub: "If top 5 actions executed" },
        ].map((k) => (
          <Card key={k.l} className="glass">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.l}</p>
              <p className="mt-1 text-3xl font-bold gradient-text">{k.v}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Applicant Funnel</CardTitle>
            <CardDescription>Drop-off between enquiry and admission</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Channel Effectiveness</CardTitle>
            <CardDescription>AI score (0-100) per acquisition channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={channels}>
                <PolarGrid />
                <PolarAngleAxis dataKey="ch" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teaching">
        <TabsList>
          <TabsTrigger value="teaching"><GraduationCap className="h-4 w-4 mr-1" /> Teaching Staff</TabsTrigger>
          <TabsTrigger value="non"><Briefcase className="h-4 w-4 mr-1" /> Non-Teaching Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="teaching">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Suggested Actions — Faculty</CardTitle>
              <CardDescription>Ranked by predicted applicant lift</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {teachingActions.map((a) => <ActionCard key={a.title} a={a} />)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="non">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Suggested Actions — Admin / Office</CardTitle>
              <CardDescription>Ranked by predicted applicant lift</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {nonTeachingActions.map((a) => <ActionCard key={a.title} a={a} />)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If the top 5 ranked actions (Industry electives, School pilot, WhatsApp bot, Alumni referrals,
            Faculty showcase) are executed before the next admission cycle, the model predicts a
            <span className="font-semibold text-primary"> +28% lift in applications</span> and a
            <span className="font-semibold text-primary"> +14% improvement in counselling-to-admit conversion</span>.
            Estimated marginal cost: ₹4.8L; estimated additional intake: 240 students.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
