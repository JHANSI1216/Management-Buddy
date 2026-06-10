import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { GraduationCap, Search, LogOut, Check, X, Calendar as CalendarIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Attendance · IV CSE" },
      { name: "description", content: "BTech IV-CSE student attendance dashboard with search, edit and daily marking." },
    ],
  }),
  component: AttendancePage,
});

type Student = {
  htno: string;
  sno: number;
  name: string;
  tp_percent: number | null;
};

type Mark = { student_htno: string; status: "present" | "absent" };

function AttendancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, "present" | "absent">>({});
  const [tab, setTab] = useState("list");

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("sno");
    if (error) return toast.error(error.message);
    setStudents((data ?? []) as Student[]);
  };

  const loadMarks = async (d: string) => {
    const { data, error } = await supabase
      .from("attendance_marks")
      .select("student_htno,status")
      .eq("date", d);
    if (error) return toast.error(error.message);
    const map: Record<string, "present" | "absent"> = {};
    (data as Mark[] | null)?.forEach((m) => (map[m.student_htno] = m.status));
    setMarks(map);
  };

  useEffect(() => { loadStudents(); }, []);
  useEffect(() => { loadMarks(date); }, [date]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (filter === "low" && (s.tp_percent ?? 0) >= 65) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.htno.toLowerCase().includes(q);
    });
  }, [students, search, filter]);

  const stats = useMemo(() => {
    const total = students.length;
    const avg = total ? Math.round(students.reduce((a, s) => a + (s.tp_percent ?? 0), 0) / total) : 0;
    const low = students.filter((s) => (s.tp_percent ?? 0) < 65).length;
    return { total, avg, low };
  }, [students]);

  const startEdit = (s: Student) => {
    setEditing(s.htno);
    setEditValue(String(s.tp_percent ?? ""));
  };

  const saveEdit = async (htno: string) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error("Enter a number between 0 and 100");
      return;
    }
    const { error } = await supabase
      .from("students")
      .update({ tp_percent: val, updated_at: new Date().toISOString() })
      .eq("htno", htno);
    if (error) return toast.error(error.message);
    setStudents((prev) => prev.map((s) => (s.htno === htno ? { ...s, tp_percent: val } : s)));
    setEditing(null);
    toast.success("Updated");
  };

  const mark = async (htno: string, status: "present" | "absent") => {
    const { error } = await supabase
      .from("attendance_marks")
      .upsert({ student_htno: htno, date, status }, { onConflict: "student_htno,date" });
    if (error) return toast.error(error.message);
    setMarks((m) => ({ ...m, [htno]: status }));
  };

  const markAll = async (status: "present" | "absent") => {
    const rows = students.map((s) => ({ student_htno: s.htno, date, status }));
    const { error } = await supabase.from("attendance_marks").upsert(rows, { onConflict: "student_htno,date" });
    if (error) return toast.error(error.message);
    const map: Record<string, "present" | "absent"> = {};
    students.forEach((s) => (map[s.htno] = status));
    setMarks(map);
    toast.success(`All marked ${status}`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const tpBadge = (p: number | null) => {
    const v = p ?? 0;
    if (v >= 75) return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20">{v}%</Badge>;
    if (v >= 65) return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20">{v}%</Badge>;
    return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/20">{v}%</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
      <header className="border-b bg-card/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Student Attendance</h1>
              <p className="text-xs text-muted-foreground">Dept. of CSE · BTech IV · Sem-I</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate({ to: "/auth" })}>Admin sign in</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total students" value={stats.total} />
          <StatCard label="Average TP%" value={`${stats.avg}%`} />
          <StatCard label="Below 65%" value={stats.low} tone="warn" />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="list">Overall Avg</TabsTrigger>
            <TabsTrigger value="mark" disabled={!user}>
              {user ? "Mark Daily" : "Mark Daily (sign in)"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <CardTitle className="text-base">Attendance Report · 01-May to 06-Jun-2026</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8 w-56"
                      placeholder="Search name or roll no…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button
                    variant={filter === "low" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(filter === "low" ? "all" : "low")}
                  >
                    Low only
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">S.No</TableHead>
                        <TableHead>Htno</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="text-right w-32">TP%</TableHead>
                        {user && <TableHead className="w-24" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((s) => (
                        <TableRow key={s.htno}>
                          <TableCell className="text-muted-foreground">{s.sno}</TableCell>
                          <TableCell className="font-mono text-xs">{s.htno}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell className="text-right">
                            {editing === s.htno ? (
                              <Input
                                autoFocus
                                type="number"
                                min={0}
                                max={100}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit(s.htno);
                                  if (e.key === "Escape") setEditing(null);
                                }}
                                className="w-20 ml-auto"
                              />
                            ) : (
                              tpBadge(s.tp_percent)
                            )}
                          </TableCell>
                          {user && (
                            <TableCell className="text-right">
                              {editing === s.htno ? (
                                <div className="flex gap-1 justify-end">
                                  <Button size="icon" variant="ghost" onClick={() => saveEdit(s.htno)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => startEdit(s)}>Edit</Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow><TableCell colSpan={user ? 5 : 4} className="text-center text-muted-foreground py-8">No students match.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {!user && (
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/auth" className="underline">Sign in</Link> to edit TP% and mark daily attendance.
              </p>
            )}
          </TabsContent>

          <TabsContent value="mark" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => markAll("present")}>Mark all present</Button>
                  <Button size="sm" variant="outline" onClick={() => markAll("absent")}>Mark all absent</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Htno</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => {
                        const status = marks[s.htno];
                        return (
                          <TableRow key={s.htno}>
                            <TableCell className="text-muted-foreground">{s.sno}</TableCell>
                            <TableCell className="font-mono text-xs">{s.htno}</TableCell>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex gap-1">
                                <Button
                                  size="sm"
                                  variant={status === "present" ? "default" : "outline"}
                                  onClick={() => mark(s.htno, "present")}
                                >
                                  <Check className="h-3 w-3" /> P
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === "absent" ? "destructive" : "outline"}
                                  onClick={() => mark(s.htno, "absent")}
                                >
                                  <X className="h-3 w-3" /> A
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="text-center text-xs text-muted-foreground py-4">
          Narayana Engineering College (Autonomous), Nellore · Dept. of CSE
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: "warn" }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${tone === "warn" ? "text-amber-600 dark:text-amber-400" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
