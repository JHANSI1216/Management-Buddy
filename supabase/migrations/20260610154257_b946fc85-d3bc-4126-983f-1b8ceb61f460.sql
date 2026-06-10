
CREATE TABLE public.students (
  htno TEXT PRIMARY KEY,
  sno INT NOT NULL,
  name TEXT NOT NULL,
  tp_percent INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.students TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students viewable by all" ON public.students FOR SELECT USING (true);
CREATE POLICY "Auth can insert students" ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update students" ON public.students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth can delete students" ON public.students FOR DELETE TO authenticated USING (true);

CREATE TABLE public.attendance_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_htno TEXT NOT NULL REFERENCES public.students(htno) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_htno, date)
);
GRANT SELECT ON public.attendance_marks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_marks TO authenticated;
GRANT ALL ON public.attendance_marks TO service_role;
ALTER TABLE public.attendance_marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marks viewable by all" ON public.attendance_marks FOR SELECT USING (true);
CREATE POLICY "Auth can insert marks" ON public.attendance_marks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update marks" ON public.attendance_marks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth can delete marks" ON public.attendance_marks FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_marks_date ON public.attendance_marks(date);
CREATE INDEX idx_marks_student ON public.attendance_marks(student_htno);
