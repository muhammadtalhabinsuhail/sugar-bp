import bcrypt from 'bcryptjs';
import { sql } from '../../../../lib/db';
import { createSession } from '../../../../lib/auth';
import { validateEmail } from '../../../../lib/validate';

const DUMMY = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.0yR1bXq5S1Q1Wc5n6o3m7o5E3gG2';

export async function POST(req) {
  try {
    const b = await req.json();
    const email = String(b.email ?? '').trim().toLowerCase();
    const password = String(b.password ?? '');
    if (validateEmail(email) || !password) {
      return Response.json({ error: 'Enter a valid email and password' }, { status: 400 });
    }
    const rows = await sql.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
    const ok = await bcrypt.compare(password, rows[0]?.password_hash ?? DUMMY);
    if (!rows[0] || !ok) return Response.json({ error: 'Incorrect email or password' }, { status: 401 });
    await createSession(rows[0].id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}