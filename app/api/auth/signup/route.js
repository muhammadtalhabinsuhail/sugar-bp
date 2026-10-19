import bcrypt from 'bcryptjs';
import { sql } from '../../../../lib/db';
import { createSession } from '../../../../lib/auth';
import { validateUsername, validateEmail, validatePassword } from '../../../../lib/validate';

export async function POST(req) {
  try {
    const b = await req.json();
    const username = String(b.username ?? '').trim();
    const email = String(b.email ?? '').trim().toLowerCase();
    const password = String(b.password ?? '');
    const err = validateUsername(username) || validateEmail(email) || validatePassword(password);
    if (err) return Response.json({ error: err }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);
    try {
      const rows = await sql.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3) RETURNING id',
        [username, email, hash]
      );
      await createSession(rows[0].id);
      return Response.json({ ok: true });
    } catch (e) {
      if (e.code === '23505' || /duplicate key/i.test(e.message || '')) {
        const msg = /email/i.test(e.message || '') ? 'This email is already registered' : 'This username is already taken';
        return Response.json({ error: msg }, { status: 409 });
      }
      throw e;
    }
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}