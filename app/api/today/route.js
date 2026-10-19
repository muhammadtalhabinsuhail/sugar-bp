import { sql } from '../../../lib/db';
import { getUserId } from '../../../lib/auth';
import { today } from '../../../lib/date';
import { SLOTS } from '../../../lib/slots';

export async function GET() {
  const uid = await getUserId();
  if (!uid) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const date = today();
  const s = await sql.query('SELECT slot, value FROM sugar_readings WHERE user_id=$1 AND reading_date=$2', [uid, date]);
  const b = await sql.query('SELECT systolic, diastolic, pulse FROM bp_readings WHERE user_id=$1 AND reading_date=$2', [uid, date]);
  const done = {};
  s.forEach((r) => (done[r.slot] = r.value)); // null value = skipped
  const next = SLOTS.find((x) => !(x.key in done))?.key ?? null;
  return Response.json({ date, done, next, bp: b[0] || null });
}