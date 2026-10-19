'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Field from '../../components/Field';
import { ui } from '../../components/ui';
import { validateEmail } from '../../lib/validate';

export default function Login() {
  const router = useRouter();
  const [f, setF] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);

  const errs = { email: validateEmail(f.email), password: f.password ? null : 'Password is required' };
  const show = (k) => touched[k] && errs[k];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const blur = (k) => () => setTouched({ ...touched, [k]: true });

  async function submit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errs.email || errs.password) return;
    setBusy(true);
    setServerErr('');
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(f),
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
        <h1 className="text-center text-3xl font-extrabold text-slate-900">Welcome back</h1>
        <p className="mb-6 mt-1 text-center text-slate-500">Log in to continue your health diary</p>
        {serverErr && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">{serverErr}</div>}
        <form onSubmit={submit} noValidate>
          <Field label="Email" type="email" value={f.email} onChange={set('email')} onBlur={blur('email')} error={show('email')} placeholder="you@example.com" autoComplete="email" />
          <Field label="Password" type="password" value={f.password} onChange={set('password')} onBlur={blur('password')} error={show('password')} placeholder="Your password" autoComplete="current-password" />
          <button className={ui.btn} disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        </form>
        <p className="mt-6 text-center text-slate-600">
          New here? <Link href="/signup" className="font-bold text-blue-600">Create an account</Link>
        </p>
      </div>
    </main>
  );
}