import { sql } from '../../../lib/db';
import { getUser, getUserId } from '../../../lib/auth';

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: 'Not logged in' }, { status: 401 });
  return Response.json({ user });
}

export async function PATCH(req) {
  const uid = await getUserId();
  if (!uid) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { photo } = await req.json();
  if (photo !== null) {
    if (typeof photo !== 'string' || !photo.startsWith('data:image/jpeg;base64,') || photo.length > 200000) {
      return Response.json({ error: 'Invalid or too large image' }, { status: 400 });
    }
  }
  await sql.query('UPDATE users SET photo = $1 WHERE id = $2', [photo, uid]);
  return Response.json({ ok: true });
}