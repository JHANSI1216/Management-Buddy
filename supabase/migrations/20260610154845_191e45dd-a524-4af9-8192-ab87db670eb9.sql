
-- Facilities
CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- classroom | laboratory | auditorium | library | sports
  capacity integer NOT NULL,
  utilization_pct integer NOT NULL DEFAULT 0,
  trend text NOT NULL DEFAULT 'stable', -- up | down | stable
  predicted_next_pct integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.facilities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facilities TO authenticated;
GRANT ALL ON public.facilities TO service_role;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facilities viewable by all" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Auth can modify facilities" ON public.facilities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Resource usage
CREATE TABLE public.resource_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL, -- electricity | water | internet
  period text NOT NULL, -- e.g. 2026-01
  consumption numeric NOT NULL,
  unit text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  forecast boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resource_usage TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resource_usage TO authenticated;
GRANT ALL ON public.resource_usage TO service_role;
ALTER TABLE public.resource_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resource usage viewable by all" ON public.resource_usage FOR SELECT USING (true);
CREATE POLICY "Auth can modify resource usage" ON public.resource_usage FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inventory
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  min_threshold integer NOT NULL DEFAULT 10,
  predicted_need integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'units',
  last_restocked date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.inventory_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory viewable by all" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Auth can modify inventory" ON public.inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Maintenance
CREATE TABLE public.maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name text NOT NULL,
  location text NOT NULL,
  health_score integer NOT NULL DEFAULT 100,
  risk_level text NOT NULL DEFAULT 'low', -- low | medium | high | critical
  last_serviced date,
  next_due date,
  status text NOT NULL DEFAULT 'operational', -- operational | scheduled | overdue | in_repair
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.maintenance_records TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_records TO authenticated;
GRANT ALL ON public.maintenance_records TO service_role;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Maintenance viewable by all" ON public.maintenance_records FOR SELECT USING (true);
CREATE POLICY "Auth can modify maintenance" ON public.maintenance_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AI recommendations
CREATE TABLE public.ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL, -- infrastructure | resources | inventory | maintenance | general
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'info', -- info | success | warning | critical
  impact text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_recommendations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_recommendations TO authenticated;
GRANT ALL ON public.ai_recommendations TO service_role;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AI recs viewable by all" ON public.ai_recommendations FOR SELECT USING (true);
CREATE POLICY "Auth can modify AI recs" ON public.ai_recommendations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed: facilities
INSERT INTO public.facilities (name, type, capacity, utilization_pct, trend, predicted_next_pct) VALUES
('CSE Block - Room 101', 'classroom', 60, 82, 'up', 88),
('CSE Block - Room 102', 'classroom', 60, 74, 'stable', 75),
('AI/ML Laboratory', 'laboratory', 40, 91, 'up', 95),
('Networking Lab', 'laboratory', 40, 68, 'down', 62),
('Central Library', 'library', 250, 56, 'up', 64),
('Main Auditorium', 'auditorium', 500, 34, 'stable', 36),
('Sports Complex', 'sports', 200, 47, 'up', 52),
('Seminar Hall A', 'classroom', 120, 71, 'stable', 70),
('Hardware Lab', 'laboratory', 35, 88, 'up', 92),
('Conference Room', 'classroom', 30, 41, 'down', 38);

-- Seed: resource usage (last 6 months actual + 3 forecast)
INSERT INTO public.resource_usage (resource_type, period, consumption, unit, cost, forecast) VALUES
('electricity','2025-12', 42500, 'kWh', 382500, false),
('electricity','2026-01', 44800, 'kWh', 403200, false),
('electricity','2026-02', 46100, 'kWh', 414900, false),
('electricity','2026-03', 45200, 'kWh', 406800, false),
('electricity','2026-04', 48900, 'kWh', 440100, false),
('electricity','2026-05', 51200, 'kWh', 460800, false),
('electricity','2026-06', 53500, 'kWh', 481500, true),
('electricity','2026-07', 55200, 'kWh', 496800, true),
('water','2025-12', 18500, 'kL', 92500, false),
('water','2026-01', 19200, 'kL', 96000, false),
('water','2026-02', 19800, 'kL', 99000, false),
('water','2026-03', 20100, 'kL', 100500, false),
('water','2026-04', 21500, 'kL', 107500, false),
('water','2026-05', 22800, 'kL', 114000, false),
('water','2026-06', 23600, 'kL', 118000, true),
('water','2026-07', 24400, 'kL', 122000, true),
('internet','2025-12', 8400, 'GB', 25200, false),
('internet','2026-01', 9100, 'GB', 27300, false),
('internet','2026-02', 9650, 'GB', 28950, false),
('internet','2026-03', 10200, 'GB', 30600, false),
('internet','2026-04', 11400, 'GB', 34200, false),
('internet','2026-05', 12100, 'GB', 36300, false),
('internet','2026-06', 12900, 'GB', 38700, true),
('internet','2026-07', 13600, 'GB', 40800, true);

-- Seed: inventory
INSERT INTO public.inventory_items (name, category, quantity, min_threshold, predicted_need, unit, last_restocked) VALUES
('Desktop Computers', 'IT Equipment', 145, 20, 30, 'units', '2026-03-10'),
('Projectors', 'AV Equipment', 28, 5, 8, 'units', '2026-02-15'),
('Lab Microscopes', 'Lab Equipment', 42, 10, 6, 'units', '2026-01-20'),
('Whiteboard Markers', 'Stationery', 18, 50, 200, 'boxes', '2026-04-01'),
('A4 Paper', 'Stationery', 320, 100, 250, 'reams', '2026-05-05'),
('Network Cables', 'IT Equipment', 8, 25, 40, 'units', '2026-02-28'),
('Ethernet Switches', 'IT Equipment', 12, 4, 3, 'units', '2026-01-12'),
('Printer Toner', 'Office Supplies', 6, 15, 22, 'cartridges', '2026-04-22'),
('First Aid Kits', 'Safety', 14, 10, 5, 'units', '2026-03-30'),
('Lab Chemicals (set)', 'Lab Equipment', 25, 12, 18, 'sets', '2026-02-10'),
('Office Chairs', 'Furniture', 78, 20, 15, 'units', '2026-01-05'),
('LED Bulbs', 'Electrical', 35, 50, 120, 'units', '2026-04-18');

-- Seed: maintenance
INSERT INTO public.maintenance_records (equipment_name, location, health_score, risk_level, last_serviced, next_due, status, notes) VALUES
('HVAC Unit #1', 'CSE Block', 88, 'low', '2026-04-10', '2026-08-10', 'operational', 'Running within normal parameters'),
('HVAC Unit #2', 'Library', 62, 'medium', '2026-02-05', '2026-06-15', 'scheduled', 'Filter replacement recommended'),
('Generator Backup', 'Main Block', 45, 'high', '2025-11-20', '2026-06-12', 'overdue', 'Predicted failure window: next 30 days'),
('Elevator A', 'Admin Block', 78, 'low', '2026-03-22', '2026-09-22', 'operational', NULL),
('Elevator B', 'Hostel Block', 51, 'high', '2025-12-15', '2026-06-20', 'overdue', 'Vibration anomalies detected'),
('Water Pump', 'Utility Room', 72, 'medium', '2026-03-01', '2026-07-01', 'scheduled', 'Pressure dropping gradually'),
('CCTV Server', 'Security Room', 91, 'low', '2026-05-12', '2026-11-12', 'operational', NULL),
('Lab Fume Hood', 'Chemistry Lab', 38, 'critical', '2025-10-08', '2026-06-08', 'in_repair', 'Awaiting replacement parts'),
('Network Core Switch', 'Server Room', 84, 'low', '2026-04-05', '2026-10-05', 'operational', NULL),
('Fire Alarm Panel', 'Main Block', 69, 'medium', '2026-02-18', '2026-08-18', 'scheduled', 'Battery backup nearing EoL');

-- Seed: AI recommendations
INSERT INTO public.ai_recommendations (module, title, description, severity, impact) VALUES
('infrastructure', 'AI/ML Lab nearing capacity', 'Utilization is projected to hit 95% next term. Consider adding a 25-seat section or splitting batches.', 'warning', 'High'),
('resources', 'Electricity spike forecast', 'Predicted 12% rise next quarter driven by lab usage. Schedule HVAC tuning and switch to LED in CSE block.', 'warning', 'Medium'),
('inventory', 'Critical low stock alert', 'Network Cables, Whiteboard Markers and Printer Toner are below threshold. Auto-reorder recommended.', 'critical', 'High'),
('maintenance', 'Generator Backup failure risk', 'Sensor data suggests 78% probability of failure within 30 days. Prioritize service this week.', 'critical', 'Critical'),
('resources', 'Water savings opportunity', 'Restroom flow sensors indicate 8% waste. Installing aerators could save approx 1,800 kL/year.', 'success', 'Medium'),
('infrastructure', 'Auditorium underutilized', 'Only 34% utilization. Open for inter-department events to improve ROI.', 'info', 'Low'),
('maintenance', 'Lab Fume Hood out of service', 'Critical safety equipment in repair. Block scheduling for Chemistry Lab until cleared.', 'critical', 'Critical'),
('general', 'Energy compliance improving', 'Campus energy efficiency score improved by 6% YoY. On track to meet green-campus target.', 'success', 'Low');
