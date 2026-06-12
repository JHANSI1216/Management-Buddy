import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, LogIn, Calendar, BookOpen, ArrowLeft, Brain } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Portal · CPMS" },
      { name: "description", content: "Students can sign in with their roll number to view timetable and attendance." },
    ],
  }),
  component: StudentPortal,
});

type Student = { htno: string; sno: number; name: string; tp_percent: number | null };
type Mark = { date: string; status: "present" | "absent" };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = ["09:00-09:50", "09:50-10:40", "11:00-11:50", "11:50-12:40", "13:30-14:20", "14:20-15:10"];
const TIMETABLE: Record<string, string[]> = {
  Monday:    ["Machine Learning", "Compiler Design", "Cloud Computing", "DBMS Lab", "DBMS Lab", "Sports"],
  Tuesday:   ["Compiler Design", "Cryptography", "Machine Learning", "ML Lab", "ML Lab", "Library"],
  Wednesday: ["Cloud Computing", "Machine Learning", "Compiler Design", "Tech Seminar", "Mentoring", "—"],
  Thursday:  ["Cryptography", "Cloud Computing", "Compiler Design", "Cloud Lab", "Cloud Lab", "Yoga"],
  Friday:    ["Machine Learning", "Cryptography", "Cloud Computing", "Mini Project", "Mini Project", "—"],
  Saturday:  ["Aptitude", "Soft Skills", "Mentoring", "—", "—", "—"],
};

function StudentPortal() {
  const [htno, setHtno] = useState("");
  const [pin, setPin] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htno.trim() || !pin.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("student_portal_login", {
      p_htno: htno.trim(),
      p_pin: pin.trim(),
    });
    setLoading(false);
    if (error || !data) {
      return toast.error("Invalid roll number or PIN. Default PIN is 1234.");
    }
    const payload = data as { htno: string; sno: number; name: string; tp_percent: number | null; marks: Mark[] };
    setStudent({ htno: payload.htno, sno: payload.sno, name: payload.name, tp_percent: payload.tp_percent });
    setMarks(payload.marks ?? []);
  };

  const signOut = () => { setStudent(null); setMarks([]); setHtno(""); setPin(""); };


  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
        <Card className="w-full max-w-md shadow-xl glass">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Student Sign In</CardTitle>
            <CardDescription>Enter your roll number to view timetable & attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={signIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="htno">Roll Number (Htno)</Label>
                <Input id="htno" placeholder="e.g. 21B81A0501" value={htno} onChange={(e) => setHtno(e.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input id="pin" type="password" placeholder="4-digit PIN" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">Default PIN: <span className="font-mono">1234</span> · change with your class teacher.</p>
              </div>
              <Button type="submit" className="w-full gradient-bg text-white" disabled={loading}>
                <LogIn className="h-4 w-4 mr-1" /> {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <Link to="/auth" className="underline">Admin / staff sign in</Link>
            </div>

          </CardContent>
        </Card>
      </div>
    );
  }

  const present = marks.filter((m) => m.status === "present").length;
  const absent = marks.filter((m) => m.status === "absent").length;
  const recentPct = marks.length ? Math.round((present / marks.length) * 100) : null;
  const overall = student.tp_percent ?? 0;
  const tone = overall >= 75 ? "emerald" : overall >= 65 ? "amber" : "red";
  const toneCls = tone === "emerald" ? "text-emerald-600 dark:text-emerald-300" : tone === "amber" ? "text-amber-600 dark:text-amber-300" : "text-red-600 dark:text-red-300";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Student Portal</p>
            <h1 className="text-2xl font-bold">Hi, {student.name.split(" ")[0]} 👋</h1>
            <p className="text-sm text-muted-foreground font-mono">{student.htno}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}><ArrowLeft className="h-4 w-4 mr-1" /> Sign out</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="glass">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Attendance</p>
              <p className={`mt-1 text-3xl font-bold ${toneCls}`}>{overall}%</p>
              <p className="text-xs text-muted-foreground mt-1">Term Aggregate</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Last 30 days</p>
              <p className="mt-1 text-3xl font-bold gradient-text">{recentPct === null ? "—" : `${recentPct}%`}</p>
              <p className="text-xs text-muted-foreground mt-1">{marks.length} sessions marked</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Present</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-300">{present}</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Absent</p>
              <p className="mt-1 text-3xl font-bold text-red-600 dark:text-red-300">{absent}</p>
            </CardContent>
          </Card>
        </div>

        {overall < 75 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-4 flex items-start gap-3">
              <Brain className="h-5 w-5 text-amber-600 dark:text-amber-300 mt-0.5" />
              <div>
                <p className="font-medium">Attendance Advisory</p>
                <p className="text-sm text-muted-foreground">Your attendance is below 75%. Attending all remaining sessions this month is required to be exam-eligible.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="timetable">
          <TabsList>
            <TabsTrigger value="timetable"><Calendar className="h-4 w-4 mr-1" /> Timetable</TabsTrigger>
            <TabsTrigger value="history"><BookOpen className="h-4 w-4 mr-1" /> Attendance History</TabsTrigger>
          </TabsList>

          <TabsContent value="timetable">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base">Weekly Timetable</CardTitle>
                <CardDescription>BTech CSE · IV Year · Sem-I</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Day</TableHead>
                      {PERIODS.map((p) => <TableHead key={p} className="text-xs">{p}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DAYS.map((d) => (
                      <TableRow key={d}>
                        <TableCell className="font-medium">{d}</TableCell>
                        {TIMETABLE[d].map((cls, i) => (
                          <TableCell key={i} className="text-xs">
                            {cls === "—" ? <span className="text-muted-foreground">—</span> : cls}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base">Recent Attendance (last 30 marks)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marks.length === 0 && (
                      <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No daily marks yet.</TableCell></TableRow>
                    )}
                    {marks.map((m) => (
                      <TableRow key={m.date}>
                        <TableCell>{new Date(m.date).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                        <TableCell className="text-right">
                          {m.status === "present"
                            ? <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Present</Badge>
                            : <Badge className="bg-red-500/15 text-red-700 dark:text-red-300">Absent</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
