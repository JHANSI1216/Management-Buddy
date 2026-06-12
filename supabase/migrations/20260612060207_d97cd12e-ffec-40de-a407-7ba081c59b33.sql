
-- 1) Tighten SELECT policies (drop public-readable, recreate authenticated-only)
DROP POLICY IF EXISTS "Students viewable by all" ON public.students;
DROP POLICY IF EXISTS "Marks viewable by all" ON public.attendance_marks;
DROP POLICY IF EXISTS "Facilities viewable by all" ON public.facilities;
DROP POLICY IF EXISTS "Inventory viewable by all" ON public.inventory_items;
DROP POLICY IF EXISTS "Maintenance viewable by all" ON public.maintenance_records;
DROP POLICY IF EXISTS "Resource usage viewable by all" ON public.resource_usage;
DROP POLICY IF EXISTS "AI recs viewable by all" ON public.ai_recommendations;

REVOKE SELECT ON public.students FROM anon;
REVOKE SELECT ON public.attendance_marks FROM anon;

CREATE POLICY "Students readable by auth" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Marks readable by auth" ON public.attendance_marks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Facilities readable by auth" ON public.facilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inventory readable by auth" ON public.inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maintenance readable by auth" ON public.maintenance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Resource usage readable by auth" ON public.resource_usage FOR SELECT TO authenticated USING (true);
CREATE POLICY "AI recs readable by auth" ON public.ai_recommendations FOR SELECT TO authenticated USING (true);

-- 2) Student PIN
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pin TEXT NOT NULL DEFAULT '1234';

-- 3) Secure student portal lookup (security definer, callable by anon)
CREATE OR REPLACE FUNCTION public.student_portal_login(p_htno TEXT, p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.students%ROWTYPE;
  marks JSONB;
BEGIN
  SELECT * INTO s FROM public.students WHERE htno = upper(trim(p_htno)) AND pin = p_pin;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object('date', date, 'status', status) ORDER BY date DESC), '[]'::jsonb)
    INTO marks
  FROM (
    SELECT date, status FROM public.attendance_marks
    WHERE student_htno = s.htno ORDER BY date DESC LIMIT 30
  ) m;
  RETURN jsonb_build_object(
    'htno', s.htno, 'sno', s.sno, 'name', s.name, 'tp_percent', s.tp_percent, 'marks', marks
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.student_portal_login(TEXT, TEXT) TO anon, authenticated;

-- 4) Substitute assignments
CREATE TABLE public.substitute_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  period TEXT NOT NULL,
  class_section TEXT NOT NULL,
  subject TEXT NOT NULL,
  original_teacher TEXT NOT NULL,
  substitute_teacher TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.substitute_assignments TO authenticated;
GRANT ALL ON public.substitute_assignments TO service_role;
ALTER TABLE public.substitute_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subs readable by auth" ON public.substitute_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Subs insertable by auth" ON public.substitute_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Subs updatable by auth" ON public.substitute_assignments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Subs deletable by auth" ON public.substitute_assignments FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_sub_date ON public.substitute_assignments(date);
