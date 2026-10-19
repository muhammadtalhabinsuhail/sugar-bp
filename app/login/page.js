'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Field from '../../components/Field';
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
    <main className="authpage">
      <div className="authcard">
        <div className="logo">🩸</div>
        <h1>Welcome back</h1>
        <p className="sub">Log in to continue your health diary</p>
        {serverErr && <div className="alert">{serverErr}</div>}
        <form onSubmit={submit} noValidate>
          <Field label="Email" type="email" value={f.email} onChange={set('email')} onBlur={blur('email')} error={show('email')} placeholder="you@example.com" autoComplete="email" />
          <Field label="Password" type="password" value={f.password} onChange={set('password')} onBlur={blur('password')} error={show('password')} placeholder="Your password" autoComplete="current-password" />
          <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        </form>
        <p className="switch">New here? <Link href="/signup">Create an account</Link></p>
      </div>
    </main>
  );
}