import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Users, Plus, Trash2, CalendarClock, Brain, Wand2 } from "lucide-react";
import { TEACHERS, SUBJECTS, TIMETABLE, PERIODS, DAYS, CLASS_META, suggestSubstitutes, type Day, type SubjectKey } from "@/lib/timetable";

export const Route = createFileRoute("/substitutes")({
  head: () => ({
    meta: [
      { title: "Substitute Allocation · CPMS" },
      { name: "description", content: "Allot substitute teachers to classes when staff are on leave." },
    ],
  }),
  component: () => <AppShell><Substitutes /></AppShell>,
});

const SECTIONS: string[] = [CLASS_META.section];

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

function dayName(d: string): Day {
  const name = new Date(d).toLocaleDateString(undefined, { weekday: "long" });
  return (DAYS as readonly string[]).includes(name) ? (name as Day) : "Monday";
}

function Substitutes() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: today,
    period: PERIODS[0] as string,
    class_section: SECTIONS[0],
    subject: "",
    original_teacher: "",
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

  // Auto-fill subject + original teacher based on the picked day + period
  const currentDay = dayName(form.date);
  const periodIdx = PERIODS.indexOf(form.period as typeof PERIODS[number]);
  const scheduled = periodIdx >= 0 ? TIMETABLE[currentDay][periodIdx] : null;

  const autoFill = () => {
    if (!scheduled) {
      toast.error("That period is free on the selected day.");
      return;
    }
    const s = SUBJECTS[scheduled];
    setForm((f) => ({ ...f, subject: scheduled, original_teacher: s.teacher }));
  };

  const suggestions = useMemo(
    () => suggestSubstitutes(form.subject || "", form.original_teacher, currentDay, periodIdx),
    [form.subject, form.original_teacher, currentDay, periodIdx],
  );
  const freeSuggestions = suggestions.filter((s) => !s.isBusy);
  const bestPick = freeSuggestions[0];

  // Auto-predict: whenever subject / teacher-on-leave / slot changes, snap the
  // substitute to the top-ranked free teacher (unless the user already picked
  // someone who is still free).
  useEffect(() => {
    if (!form.subject || !form.original_teacher || !bestPick) return;
    const currentIsValid =
      form.substitute_teacher &&
      freeSuggestions.some((s) => s.name === form.substitute_teacher);
    if (currentIsValid) return;
    setForm((f) => ({ ...f, substitute_teacher: bestPick.name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.subject, form.original_teacher, currentDay, periodIdx]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.original_teacher || !form.substitute_teacher) {
      return toast.error("Fill subject, on-leave teacher, and substitute.");
    }
    if (form.substitute_teacher === form.original_teacher) {
      return toast.error("Substitute must be a different teacher.");
    }
    const { error } = await supabase.from("substitute_assignments").insert({
      date: form.date,
      day_of_week: currentDay,
      period: form.period,
      class_section: form.class_section,
      subject: form.subject,
      original_teacher: form.original_teacher,
      substitute_teacher: form.substitute_teacher,
      reason: form.reason || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Substitute allotted");
    setForm({ ...form, subject: "", original_teacher: "", substitute_teacher: "", reason: "" });
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

  const subjectLabel = (key: string) => {
    const s = (SUBJECTS as Record<string, { name: string }>)[key];
    return s ? `${key} · ${s.name}` : key;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs mb-2">
          <Users className="h-3.5 w-3.5 text-primary" /> Staff Operations · {CLASS_META.programme}
        </div>
        <h1 className="text-3xl font-bold">Substitute Teacher Allocation</h1>
        <p className="text-muted-foreground text-sm">
          Pick a date + period and the schedule auto-fills the subject and the teacher on duty. AI suggests best-fit substitutes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> New Allocation</CardTitle>
            <CardDescription>{CLASS_META.section} · Room {CLASS_META.room}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  <p className="text-[10px] text-muted-foreground">{currentDay}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Period</Label>
                  <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((p, i) => <SelectItem key={p} value={p}>P{i + 1} · {p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border bg-muted/30 p-3 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="text-muted-foreground">Scheduled this period</p>
                  <p className="font-medium">
                    {scheduled ? subjectLabel(scheduled) : <span className="text-muted-foreground">Free / no class</span>}
                  </p>
                  {scheduled && <p className="text-[11px] text-muted-foreground">Faculty: {SUBJECTS[scheduled].teacher}</p>}
                </div>
                <Button type="button" size="sm" variant="outline" onClick={autoFill} disabled={!scheduled}>
                  <Wand2 className="h-3.5 w-3.5 mr-1" /> Auto-fill
                </Button>
              </div>

              {form.subject && form.original_teacher && (
                <div className="rounded-md border border-primary/40 bg-primary/5 p-3 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Brain className="h-3 w-3 text-primary" /> Predicted substitute
                    </p>
                    {bestPick ? (
                      <>
                        <p className="font-medium">{bestPick.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Free this period · Fit score {bestPick.score} · Teaches {bestPick.subjects.join(", ")}
                        </p>
                      </>
                    ) : (
                      <p className="font-medium text-destructive">No free teacher this slot</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="gradient-bg text-white"
                    disabled={!bestPick}
                    onClick={() => bestPick && setForm((f) => ({ ...f, substitute_teacher: bestPick.name }))}
                  >
                    <Wand2 className="h-3.5 w-3.5 mr-1" /> Use prediction
                  </Button>
                </div>
              )}


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
                <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose subject" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUBJECTS).filter(([k]) => k !== "PT").map(([k, v]) => (
                      <SelectItem key={k} value={k}>{k} · {v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Teacher on leave</Label>
                <Select value={form.original_teacher} onValueChange={(v) => setForm({ ...form, original_teacher: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose teacher" /></SelectTrigger>
                  <SelectContent>
                    {TEACHERS.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name} · {t.subjects.join(", ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Substitute teacher</Label>
                <Select value={form.substitute_teacher} onValueChange={(v) => setForm({ ...form, substitute_teacher: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose substitute" /></SelectTrigger>
                  <SelectContent>
                    {TEACHERS.filter((t) => t.name !== form.original_teacher).map((t) => (
                      <SelectItem key={t.name} value={t.name}>{t.name} · {t.subjects.join(", ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Textarea rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Sick leave, conference, etc." />
              </div>

              <Button type="submit" className="w-full gradient-bg text-white">
                <CalendarClock className="h-4 w-4 mr-1" /> Allot Substitute
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Suggested Substitutes</CardTitle>
            <CardDescription>
              Cross-checks every teacher's own schedule for {currentDay} · {form.period}.
              {form.subject && ` ${freeSuggestions.length} free of ${suggestions.length}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!form.subject && <p className="text-xs text-muted-foreground">Pick a subject (or auto-fill from the period) to see ranked suggestions.</p>}
            {form.subject && suggestions.map((s, i) => (
              <div key={s.name} className={`flex items-center justify-between rounded-lg border p-3 ${s.isBusy ? "opacity-60" : ""}`}>
                <div>
                  <p className="font-medium text-sm flex flex-wrap items-center gap-1">
                    #{i + 1} · {s.name} <Badge variant="outline">{s.dept}</Badge>
                    {s.isBusy
                      ? <Badge variant="destructive">Busy · {s.busyReason}</Badge>
                      : <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Free this period</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Teaches: {s.subjects.map((k) => `${k} (${SUBJECTS[k as SubjectKey].name})`).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={s.score >= 20 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted"}>
                    Fit {s.score}
                  </Badge>
                  <Button size="sm" variant="outline" disabled={s.isBusy} onClick={() => setForm({ ...form, substitute_teacher: s.name })}>Pick</Button>
                </div>
              </div>
            ))}
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
                  <TableCell className="text-xs">
                    {new Date(r.date).toLocaleDateString()}
                    <div className="text-muted-foreground">{r.day_of_week}</div>
                  </TableCell>
                  <TableCell className="text-xs">{r.period}</TableCell>
                  <TableCell>{r.class_section}</TableCell>
                  <TableCell className="text-xs">{subjectLabel(r.subject)}</TableCell>
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
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
