// Real IV B.Tech CSM (CSE - AI&ML) — I Semester · AY 2026-27 · Room A-211
// Derived from individual faculty timetables provided by NEC Nellore.

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export type Day = (typeof DAYS)[number];

export const PERIODS = [
  "10:10-11:00",
  "11:00-11:50",
  "11:50-12:40",
  "13:30-14:20",
  "14:20-15:10",
  "15:10-16:00",
  "16:10-17:00",
] as const;

// Display labels (with lunch / short-break placeholders in the UI rendering layer)
export const PERIOD_LABELS = [
  "P1 · 10:10",
  "P2 · 11:00",
  "P3 · 11:50",
  "P4 · 13:30",
  "P5 · 14:20",
  "P6 · 15:10",
  "P7 · 16:10",
] as const;

export const SUBJECTS = {
  GAI:  { name: "Generative AI",         code: "23AM2009", teacher: "Mrs. V Kusuma Priya"  },
  AICS: { name: "AI in Cyber Security",  code: "23AM4014", teacher: "Mrs. D Sujitha"        },
  DW:   { name: "Data Wrangling",        code: "23AM4018", teacher: "Mrs. B Vijayalakshmi" },
  MS:   { name: "Management Science",    code: "23ES1015", teacher: "Mrs. B Meghana"        },
  ES:   { name: "Employability Skills",  code: "23HE3004", teacher: "Mr. Sk Karin Basha"   },
  SWM:  { name: "Solid Waste Management", code: "23CE3008", teacher: "Mrs. E Phani Teja"    },
  PE:   { name: "Prompt Engineering",    code: "23SC6122", teacher: "Dr. C Rajendra"       },
  PT:   { name: "Placement Training",    code: "—",        teacher: "Placement Cell"        },
} as const;

export type SubjectKey = keyof typeof SUBJECTS;

// 7 periods/day, Monday–Saturday — IV CSM class schedule
export const TIMETABLE: Record<Day, (SubjectKey | null)[]> = {
  Monday:    ["PT","PT","PT", null, "GAI","SWM","AICS"],
  Tuesday:   ["PT","PT","PT", "GAI","DW", "MS", "SWM"],
  Wednesday: ["PT","PT","PT", "MS", "AICS","GAI","ES"],
  Thursday:  ["PT","PT","PT", "SWM","PE", null, "PE"],
  Friday:    ["PT","PT","PT", "DW", "ES", "AICS","MS"],
  Saturday:  ["PT","PT","PT", "AICS","DW","GAI","ES"],
};

export const TEACHERS = [
  { name: "Mrs. V Kusuma Priya",  dept: "CSM", subjects: ["GAI"]  as SubjectKey[], role: "Class Counsellor" },
  { name: "Mrs. D Sujitha",       dept: "CSM", subjects: ["AICS"] as SubjectKey[] },
  { name: "Mrs. B Vijayalakshmi", dept: "CSM", subjects: ["DW"]   as SubjectKey[] },
  { name: "Mrs. B Meghana",       dept: "CSM", subjects: ["MS"]   as SubjectKey[] },
  { name: "Mr. Sk Karin Basha",   dept: "CSM", subjects: ["ES"]   as SubjectKey[] },
  { name: "Mrs. E Phani Teja",    dept: "CSM", subjects: ["SWM"]  as SubjectKey[] },
  { name: "Dr. C Rajendra",       dept: "CSM", subjects: ["PE"]   as SubjectKey[] },
] as const;

// Extra side-class commitments (DS I CSM A/B/C) outside the IV CSM timetable.
// period index 0..6 maps to PERIODS[].
type Commitment = { teacher: string; day: Day; period: number; label: string };
export const OTHER_COMMITMENTS: Commitment[] = [
  { teacher: "Dr. C Rajendra",       day: "Monday",  period: 1, label: "DS I CSM-A" },
  { teacher: "Dr. C Rajendra",       day: "Friday",  period: 1, label: "DS I CSM-A" },
  { teacher: "Mrs. V Kusuma Priya",  day: "Monday",  period: 1, label: "DS I CSM-C" },
  { teacher: "Mrs. V Kusuma Priya",  day: "Friday",  period: 0, label: "DS I CSM-C" },
  { teacher: "Mrs. D Sujitha",       day: "Monday",  period: 4, label: "DS I CSM-B" },
  { teacher: "Mrs. D Sujitha",       day: "Tuesday", period: 3, label: "DS I CSM-B" },
];

/** Returns { busy, reason } for a teacher at a given day+period across ALL their classes. */
export function teacherBusyAt(teacher: string, day: Day, periodIdx: number): { busy: boolean; reason?: string } {
  const sk = TIMETABLE[day][periodIdx];
  if (sk && sk !== "PT" && SUBJECTS[sk].teacher === teacher) {
    return { busy: true, reason: `IV CSM · ${sk}` };
  }
  const other = OTHER_COMMITMENTS.find(c => c.teacher === teacher && c.day === day && c.period === periodIdx);
  if (other) return { busy: true, reason: other.label };
  return { busy: false };
}

export function suggestSubstitutes(
  subject: SubjectKey | string,
  originalTeacher: string,
  day?: Day,
  periodIdx?: number,
) {
  const subj = String(subject).toUpperCase();
  const haveSlot = day != null && periodIdx != null && periodIdx >= 0;
  return TEACHERS
    .filter((t) => t.name !== originalTeacher)
    .map((t) => {
      const status = haveSlot ? teacherBusyAt(t.name, day!, periodIdx!) : { busy: false };
      const teaches = t.subjects.includes(subj as SubjectKey) ? 12 : 0;
      const adjacent = t.subjects.some((s) => ["GAI","AICS","DW","PE"].includes(s) && ["GAI","AICS","DW","PE"].includes(subj)) ? 4 : 0;
      const sameDept = 3;
      const freeBonus = haveSlot && !status.busy ? 10 : 0;
      return {
        ...t,
        isBusy: status.busy,
        busyReason: status.reason,
        score: teaches + adjacent + sameDept + freeBonus,
      };
    })
    .sort((a, b) => Number(a.isBusy) - Number(b.isBusy) || b.score - a.score);
}

export const CLASS_META = {
  institution: "Narayana Engineering College (Autonomous), Nellore",
  department: "CSM",
  programme: "IV B.Tech I Semester",
  section: "IV-CSM",
  room: "A-211",
  academicYear: "2026-2027",
  wef: "01-05-2026",
  classCounsellor: "Mrs. V Kusuma Priya",
} as const;
