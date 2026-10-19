'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Field from '../../components/Field';
import { ui } from '../../components/ui';
import { validateUsername, validateEmail, validatePassword } from '../../lib/validate';

export default function Signup() {
  const router = useRouter();
  const [f, setF] = useState({ username: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);

  const errs = {
    username: validateUsername(f.username),
    email: validateEmail(f.email),
    password: validatePassword(f.password),
    confirm: !f.confirm ? 'Please confirm your password' : f.confirm !== f.password ? 'Passwords do not match' : null,
  };
  const show = (k) => touched[k] && errs[k];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const blur = (k) => () => setTouched({ ...touched, [k]: true });

  async function submit(e) {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true, confirm: true });
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    setServerErr('');
    const r = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: f.username, email: f.email, password: f.password }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setServerErr(d.error);
    router.replace('/');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 p-5">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-blue-100 text-4xl">🩸</div>
        <h1 className="text-center text-3xl font-extrabold text-slate-900">Create account</h1>
        <p className="mb-6 mt-1 text-center text-slate-500">Track your sugar and blood pressure easily</p>
        {serverErr && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">{serverErr}</div>}
        <form onSubmit={submit} noValidate>
          <Field label="Username" value={f.username} onChange={set('username')} onBlur={blur('username')} error={show('username')} placeholder="e.g. ali_khan" autoComplete="username" />
          <Field label="Email" type="email" value={f.email} onChange={set('email')} onBlur={blur('email')} error={show('email')} placeholder="you@example.com" autoComplete="email" />
          <Field label="Password" type="password" value={f.password} onChange={set('password')} onBlur={blur('password')} error={show('password')} placeholder="8+ chars, upper, lower, number" autoComplete="new-password" />
          <Field label="Confirm password" type="password" value={f.confirm} onChange={set('confirm')} onBlur={blur('confirm')} error={show('confirm')} placeholder="Repeat password" autoComplete="new-password" />
          <button className={ui.btn} disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
        </form>
        <p className="mt-6 text-center text-slate-600">
          Already have an account? <Link href="/login" className="font-bold text-blue-600">Log in</Link>
        </p>
      </div>
    </main>
  );
}