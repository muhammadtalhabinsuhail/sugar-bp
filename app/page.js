'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { useUser } from '../components/useUser';
import { SLOTS } from '../lib/slots';
import { validateSugar, validateBP } from '../lib/validate';

const post = async (body) => {
  const r = await fetch('/api/readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: r.ok, d: await r.json() };
};

export default function Dashboard() {
  const [user] = useUser();
  const [t, setT] = useState(null);
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const [bp, setBp] = useState({ systolic: '', diastolic: '', pulse: '' });
  const [bpErr, setBpErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch('/api/today', { cache: 'no-store' });
    if (r.ok) setT(await r.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  async function saveSugar() {
    const e = validateSugar(val);
    if (e) return setErr(e);
    setBusy(true);
    const { ok, d } = await post({ type: 'sugar', value: val });
    setBusy(false);
    if (!ok) return setErr(d.error);
    setVal(''); setErr(''); load();
  }
  async function skipSugar() {
    setBusy(true);
    const { ok, d } = await post({ type: 'skip' });
    setBusy(false);
    if (!ok) return setErr(d.error);
    setVal(''); setErr(''); load();
  }
  async function saveBp() {
    const e = validateBP(bp.systolic, bp.diastolic, bp.pulse);
    if (e) return setBpErr(e);
    setBusy(true);
    const { ok, d } = await post({ type: 'bp', ...bp });
    setBusy(false);
    if (!ok) return setBpErr(d.error);
    setBp({ systolic: '', diastolic: '', pulse: '' }); setBpErr(''); load();
  }

  const nice = t ? new Date(t.date + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
  const current = t && SLOTS.find((s) => s.key === t.next);
  const step = t ? Object.keys(t.done).length + 1 : 1;

  return (
    <>
      <Header user={user} />
      <main className="page">
        <p className="date">{nice}</p>

        {!t ? (
          <div className="card"><p className="muted">Loading...</p></div>
        ) : current ? (
          <section className="card hero">
            <div className="steps">
              {SLOTS.map((s) => (
                <span key={s.key} className={'dot ' + (s.key in t.done ? (t.done[s.key] == null ? 'skip' : 'ok') : s.key === t.next ? 'now' : '')} />
              ))}
            </div>
            <p className="stepnum">Sugar test {Math.min(step, 6)} of 6</p>
            <h2>Enter your sugar {current.ask}</h2>
            <div className="bigrow">
              <input
                className="big"
                type="number"
                inputMode="numeric"
                value={val}
                placeholder="e.g. 140"
                onChange={(e) => { setVal(e.target.value); setErr(''); }}
              />
              <span className="unit">mg/dL</span>
            </div>
            {err && <p className="err">{err}</p>}
            <button className="btn" onClick={saveSugar} disabled={busy}>Save sugar</button>
            <button className="btn ghost" onClick={skipSugar} disabled={busy}>Skip this test</button>
          </section>
        ) : (
          <section className="card hero done">
            <div className="check">✓</div>
            <h2>All sugar tests are done for today</h2>
            <p className="muted">Come back tomorrow morning for the next one.</p>
          </section>
        )}

        {t && !t.bp && (
          <section className="card">
            <h2>Blood pressure</h2>
            <p className="muted">Enter once a day.</p>
            <div className="trio">
              {[['systolic', 'Upper', '120'], ['diastolic', 'Lower', '80'], ['pulse', 'Pulse', '72']].map(([k, l, ph]) => (
                <div key={k} className="field">
                  <label>{l}</label>
                  <input type="number" inputMode="numeric" placeholder={ph} value={bp[k]}
                    onChange={(e) => { setBp({ ...bp, [k]: e.target.value }); setBpErr(''); }} />
                </div>
              ))}
            </div>
            {bpErr && <p className="err">{bpErr}</p>}
            <button className="btn" onClick={saveBp} disabled={busy}>Save blood pressure</button>
          </section>
        )}

        {t && (
          <section className="card">
            <h2>Today</h2>
            <ul className="list">
              {SLOTS.map((s) => {
                const has = s.key in t.done;
                return (
                  <li key={s.key}>
                    <span>{s.label}</span>
                    <b className={!has ? 'pending' : t.done[s.key] == null ? 'na' : ''}>
                      {!has ? 'Pending' : t.done[s.key] ?? 'Skipped'}
                    </b>
                  </li>
                );
              })}
              {t.bp && (
                <li>
                  <span>Blood pressure</span>
                  <b>{t.bp.systolic}/{t.bp.diastolic}{t.bp.pulse ? ` · pulse ${t.bp.pulse}` : ''}</b>
                </li>
              )}
            </ul>
          </section>
        )}

        <Link href="/records" className="btn light">View all records</Link>
      </main>
    </>
  );
}