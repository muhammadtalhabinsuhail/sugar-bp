import { sql } from '../../../lib/db';
import { getUserId } from '../../../lib/auth';
import { today } from '../../../lib/date';
import { SLOTS } from '../../../lib/slots';
import { validateSugar, validateBP } from '../../../lib/validate';

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');

// Rows start at the user's FIRST entry date and end at the LAST entry date
const QUERY = `
WITH days AS (
  SELECT reading_date FROM sugar_readings WHERE user_id = $1
  UNION
  SELECT reading_date FROM bp_readings WHERE user_id = $1
), b AS (
  SELECT GREATEST(MIN(reading_date), COALESCE($2::date, MIN(reading_date))) AS lo,
         LEAST(MAX(reading_date),    COALESCE($3::date, MAX(reading_date))) AS hi
  FROM days
), x AS (
  SELECT g::date AS d FROM b, generate_series(b.lo::timestamp, b.hi::timestamp, interval '1 day') g
)
SELECT to_char(x.d,'YYYY-MM-DD') AS iso,
       to_char(x.d,'DD Mon YYYY') AS date,
       MAX(s.value) FILTER (WHERE s.slot='before_breakfast') AS before_breakfast,
       MAX(s.value) FILTER (WHERE s.slot='after_breakfast')  AS after_breakfast,
       MAX(s.value) FILTER (WHERE s.slot='before_lunch')     AS before_lunch,
       MAX(s.value) FILTER (WHERE s.slot='after_lunch')      AS after_lunch,
       MAX(s.value) FILTER (WHERE s.slot='before_dinner')    AS before_dinner,
       MAX(s.value) FILTER (WHERE s.slot='after_dinner')     AS after_dinner,
       p.systolic, p.diastolic, p.pulse
FROM x
LEFT JOIN sugar_readings s ON s.user_id = $1 AND s.reading_date = x.d
LEFT JOIN bp_readings    p ON p.user_id = $1 AND p.reading_date = x.d
GROUP BY x.d, p.systolic, p.diastolic, p.pulse
ORDER BY x.d`;

export async function GET(req) {
  const uid = await getUserId();
  if (!uid) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const p = new URL(req.url).searchParams;
  const from = isDate(p.get('from')) ? p.get('from') : null;
  const to = isDate(p.get('to')) ? p.get('to') : null;
  const rows = await sql.query(QUERY, [uid, from, to]);
  return Response.json(rows);
}

export async function POST(req) {
  try {
    const uid = await getUserId();
    if (!uid) return Response.json({ error: 'Not logged in' }, { status: 401 });
    const b = await req.json();
    const date = today();

    if (b.type === 'sugar' || b.type === 'skip') {
      // The server decides which slot is next, so the order can never be broken
      const done = await sql.query('SELECT slot FROM sugar_readings WHERE user_id=$1 AND reading_date=$2', [uid, date]);
      const taken = new Set(done.map((r) => r.slot));
      const slot = SLOTS.find((s) => !taken.has(s.key))?.key;
      if (!slot) throw new Error('All sugar readings for today are already done');

      let value = null;
      if (b.type === 'sugar') {
        const err = validateSugar(b.value);
        if (err) throw new Error(err);
        value = parseInt(b.value, 10);
      }
      await sql.query(
        `INSERT INTO sugar_readings (user_id, reading_date, slot, value) VALUES ($1,$2,$3,$4)
         ON CONFLICT (user_id, reading_date, slot) DO NOTHING`,
        [uid, date, slot, value]
      );
    } else if (b.type === 'bp') {
      const err = validateBP(b.systolic, b.diastolic, b.pulse);
      if (err) throw new Error(err);
      const pulse = b.pulse === '' || b.pulse == null ? null : parseInt(b.pulse, 10);
      await sql.query(
        `INSERT INTO bp_readings (user_id, reading_date, systolic, diastolic, pulse) VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (user_id, reading_date) DO NOTHING`,
        [uid, date, parseInt(b.systolic, 10), parseInt(b.diastolic, 10), pulse]
      );
    } else throw new Error('Unknown request');

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}