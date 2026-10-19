import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sql } from './db';

const key = () => {
  if (!process.env.AUTH_SECRET) throw new Error('AUTH_SECRET is not set');
  return new TextEncoder().encode(process.env.AUTH_SECRET);
};

export async function createSession(uid) {
  const token = await new SignJWT({ uid })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(key());
  (await cookies()).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete('session');
}

export async function getUserId() {
  try {
    const token = (await cookies()).get('session')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, key());
    return payload.uid ?? null;
  } catch {
    return null;
  }
}

export async function getUser() {
  const uid = await getUserId();
  if (!uid) return null;
  const rows = await sql.query('SELECT id, username, email, photo FROM users WHERE id = $1', [uid]);
  return rows[0] || null;
}