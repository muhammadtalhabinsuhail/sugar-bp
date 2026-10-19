export const SLOTS = [
  { key: 'before_breakfast', label: 'Before Breakfast',         ask: 'before breakfast',         pdf: 'Before\nBreakfast' },
  { key: 'after_breakfast',  label: 'After Breakfast',  ask: '2 hours after breakfast',  pdf: '2 Hrs After\nBreakfast' },
  { key: 'before_lunch',     label: 'Before Lunch',             ask: 'before lunch',             pdf: 'Before\nLunch' },
  { key: 'after_lunch',      label: 'After Lunch',      ask: '2 hours after lunch',      pdf: '2 Hrs After\nLunch' },
  { key: 'before_dinner',    label: 'Before Dinner',            ask: 'before dinner',            pdf: 'Before\nDinner' },
  { key: 'after_dinner',     label: 'After Dinner',     ask: '2 hours after dinner',     pdf: '2 Hrs After\nDinner' },
];

// 'high' / 'low' / null  (before meals: >130 high, after meals: >180 high, <70 low)
export function flag(key, v) {
  if (v == null) return null;
  if (v < 70) return 'low';
  return v > (key.startsWith('after') ? 180 : 130) ? 'high' : null;
}

export function summarize(rows) {
  const vals = [];
  rows.forEach((r) => SLOTS.forEach((s) => r[s.key] != null && vals.push(r[s.key])));
  const bps = rows.filter((r) => r.systolic);
  const avg = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);
  return {
    days: rows.length,
    readings: vals.length,
    avg: avg(vals),
    max: vals.length ? Math.max(...vals) : null,
    min: vals.length ? Math.min(...vals) : null,
    avgBp: bps.length ? `${avg(bps.map((r) => r.systolic))}/${avg(bps.map((r) => r.diastolic))}` : null,
  };
}