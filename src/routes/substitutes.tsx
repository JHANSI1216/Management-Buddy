import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, Plus, Trash2, CalendarClock, Brain } from "lucide-react";

export const Route = createFileRoute("/substitutes")({
  head: () => ({
    meta: [
      { title: "Substitute Allocation · CPMS" },
      { name: "description", content: "Allot substitute teachers to classes when staff are on leave." },
    ],
  }),
  component: () => <AppShell><Substitutes /></AppShell>,
});

const TEACHERS = [
  { name: "Dr. R. Krishna", dept: "CSE", subjects: ["Machine Learning", "Compiler Design"] },
  { name: "Prof. S. Meena", dept: "CSE", subjects: ["Cloud Computing", "DBMS"] },
  { name: "Dr. A. Prakash", dept: "AI&DS", subjects: ["Machine Learning", "Cryptography"] },
  { name: "Prof. K. Ramya", dept: "CSE", subjects: ["Compiler Design", "DBMS"] },
  { name: "Dr. V. Suresh", dept: "AI&DS", subjects: ["Cloud Computing", "Cryptography"] },
  { name: "Prof. J. Anitha", dept: "CSE", subjects: ["Mentoring", "Soft Skills"] },
  { name: "Dr. M. Bhanu", dept: "MATH", subjects: ["Aptitude", "Discrete Maths"] },
  { name: "Prof. L. Deepak", dept: "CSE", subjects: ["Mini Project", "Tech Seminar"] },
];

const PERIODS = ["09:00-09:50", "09:50-10:40", "11:00-11:50", "11:50-12:40", "13:30-14:20", "14:20-15:10"];
const SECTIONS = ["IV-CSE-A", "IV-CSE-B", "III-CSE-A", "III-AI&DS-A", "II-CSE-A"];

type Sub = {
  id: string;
  date: string;
  day_of_week: string;
  period: string;
  class_section: string;
  subject: string;
  original_teacher: string;
  substitute_teacher: string;
  reason: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

function dayName(d: string) {
  return new Date(d).toLocaleDateString(undefined, { weekday: "long" });
}

function Substitutes() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    period: PERIODS[0],
    class_section: SECTIONS[0],
    subject: "",
    original_teacher: TEACHERS[0].name,
    substitute_teacher: "",
    reason: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("substitute_assignments")
      .select("*")
      .order("date", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setRows((data ?? []) as Sub[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // AI suggestion: rank teachers by subject overlap + dept match, excluding original
  const suggestions = (() => {
    const subject = form.subject.toLowerCase();
    return TEACHERS
      .filter((t) => t.name !== form.original_teacher)
      .map((t) => {
        const overlap = t.subjects.filter((s) => s.toLowerCase().includes(subject) || subject.includes(s.toLowerCase())).length;
        const score = overlap * 10 + (form.class_section.includes(t.dept) ? 3 : 0);
        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.substitute_teacher || !form.subject) return toast.error("Pick a substitute and enter the subject.");
    if (form.substitute_teacher === form.original_teacher) return toast.error("Substitute must be a different teacher.");
    const { error } = await supabase.from("substitute_assignments").insert({
      ...form,
      day_of_week: dayName(form.date),
      reason: form.reason || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Substitute allotted");
    setForm({ ...form, subject: "", substitute_teacher: "", reason: "" });
    load();
  };

  const setStatus = async (id: string, status: Sub["status"]) => {
    const { error } = await supabase.from("substitute_assignments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("substitute_assignments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs mb-2">
          <Users className="h-3.5 w-3.5 text-primary" /> Staff Operations
        </div>
        <h1 className="text-3xl font-bold">Substitute Teacher Allocation</h1>
        <p className="text-muted-foreground text-sm">Allot substitutes when teachers take leave — AI suggests best-fit replacements by subject and department.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> New Allocation</CardTitle>
            <CardDescription>Per period / per class</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Period</Label>
                  <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Class / Section</Label>
                  <Select value={form.class_section} onValueChange={(v) => setForm({ ...form, class_section: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Machine Learning" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Teacher on leave</Label>
                <Select value={form.original_teacher} onValueChange={(v) => setForm({ ...form, original_teacher: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEACHERS.map((t) => <SelectItem key={t.name} value={t.name}>{t.name} · {t.dept}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Substitute teacher</Label>
                <Select value={form.substitute_teacher} onValueChange={(v) => setForm({ ...form, substitute_teacher: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose substitute" /></SelectTrigger>
                  <SelectContent>
                    {TEACHERS.filter(t => t.name !== form.original_teacher).map((t) => (
                      <SelectItem key={t.name} value={t.name}>{t.name} · {t.dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Textarea rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Sick leave, conference, etc." />
              </div>
              <Button type="submit" className="w-full gradient-bg text-white"><CalendarClock className="h-4 w-4 mr-1" /> Allot Substitute</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Suggested Substitutes</CardTitle>
            <CardDescription>Best-fit teachers ranked by subject overlap and department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">#{i + 1} · {s.name} <Badge variant="outline" className="ml-1">{s.dept}</Badge></p>
                  <p className="text-xs text-muted-foreground">Teaches: {s.subjects.join(", ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={s.score >= 10 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted"}>
                    Fit {s.score}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setForm({ ...form, substitute_teacher: s.name })}>Pick</Button>
                </div>
              </div>
            ))}
            {!form.subject && <p className="text-xs text-muted-foreground">Enter the subject to get ranked suggestions.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Recent Allocations</CardTitle>
          <CardDescription>Last 100 entries</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>On Leave</TableHead>
                <TableHead>Substitute</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
              {!loading && rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No allocations yet.</TableCell></TableRow>}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{new Date(r.date).toLocaleDateString()}<div className="text-muted-foreground">{r.day_of_week}</div></TableCell>
                  <TableCell className="text-xs">{r.period}</TableCell>
                  <TableCell>{r.class_section}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell className="text-xs">{r.original_teacher}</TableCell>
                  <TableCell className="text-xs font-medium">{r.substitute_teacher}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => setStatus(r.id, v as Sub["status"])}>
                      <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
