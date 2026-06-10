import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Check, X, Calendar as CalendarIcon } from "lucide-react";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Student Attendance · CPMS" },
      { name: "description", content: "Linked attendance module for the College Predictive Management System." },
    ],
  }),
  component: () => (
    <AppShell>
      <AttendancePage />
    </AppShell>
  ),
});

type Student = { htno: string; sno: number; name: string; tp_percent: number | null };
type Mark = { student_htno: string; status: "present" | "absent" };

function AttendancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, "present" | "absent">>({});

  const loadStudents = async () => {
    const { data, error } = await supabase.from("students").select("*").order("sno");
    if (error) return toast.error(error.message);
    setStudents((data ?? []) as Student[]);
  };
  const loadMarks = async (d: string) => {
    const { data } = await supabase.from("attendance_marks").select("student_htno,status").eq("date", d);
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

  const saveEdit = async (htno: string) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0 || val > 100) return toast.error("0-100 only");
    const { error } = await supabase.from("students").update({ tp_percent: val, updated_at: new Date().toISOString() }).eq("htno", htno);
    if (error) return toast.error(error.message);
    setStudents((prev) => prev.map((s) => (s.htno === htno ? { ...s, tp_percent: val } : s)));
    setEditing(null);
    toast.success("Updated");
  };

  const mark = async (htno: string, status: "present" | "absent") => {
    const { error } = await supabase.from("attendance_marks").upsert({ student_htno: htno, date, status }, { onConflict: "student_htno,date" });
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

  const tpBadge = (p: number | null) => {
    const v = p ?? 0;
    if (v >= 75) return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">{v}%</Badge>;
    if (v >= 65) return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">{v}%</Badge>;
    return <Badge className="bg-red-500/15 text-red-700 dark:text-red-300">{v}%</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Attendance</h1>
        <p className="text-sm text-muted-foreground">Linked module · Dept. of CSE · BTech IV · Sem-I</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total students", stats.total, ""],
          ["Average TP%", `${stats.avg}%`, ""],
          ["Below 65%", stats.low, "warn"],
        ].map(([l, v, t]) => (
          <Card key={l as string} className="glass">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className={`mt-1 text-3xl font-bold ${t === "warn" ? "text-amber-600 dark:text-amber-400" : "gradient-text"}`}>{v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Overall Avg</TabsTrigger>
          <TabsTrigger value="mark" disabled={!user}>{user ? "Mark Daily" : "Mark Daily (sign in)"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card className="glass">
            <CardHeader className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <CardTitle className="text-base">Attendance Report</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8 w-56" placeholder="Search name or roll no…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Button variant={filter === "low" ? "default" : "outline"} size="sm" onClick={() => setFilter(filter === "low" ? "all" : "low")}>Low only</Button>
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
                            <Input autoFocus type="number" min={0} max={100} value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(s.htno); if (e.key === "Escape") setEditing(null); }}
                              className="w-20 ml-auto" />
                          ) : tpBadge(s.tp_percent)}
                        </TableCell>
                        {user && (
                          <TableCell className="text-right">
                            {editing === s.htno ? (
                              <div className="flex gap-1 justify-end">
                                <Button size="icon" variant="ghost" onClick={() => saveEdit(s.htno)}><Check className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => { setEditing(s.htno); setEditValue(String(s.tp_percent ?? "")); }}>Edit</Button>
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
          {!user && <p className="text-center text-sm text-muted-foreground"><Link to="/auth" className="underline">Sign in</Link> to edit TP% and mark daily attendance.</p>}
        </TabsContent>

        <TabsContent value="mark" className="space-y-4">
          <Card className="glass">
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
                              <Button size="sm" variant={status === "present" ? "default" : "outline"} onClick={() => mark(s.htno, "present")}><Check className="h-3 w-3" /> P</Button>
                              <Button size="sm" variant={status === "absent" ? "destructive" : "outline"} onClick={() => mark(s.htno, "absent")}><X className="h-3 w-3" /> A</Button>
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
    </div>
  );
}
