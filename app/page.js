'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { useUser } from '../components/useUser';
import { ui } from '../components/ui';
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
  const dotColor = (s) =>
    s.key in t.done ? (t.done[s.key] == null ? 'bg-amber-400' : 'bg-blue-500') : s.key === t.next ? 'bg-blue-700' : 'bg-slate-200';

  return (
    <>
      <Header user={user} />
      <main className="mx-auto max-w-3xl px-4 pb-32 pt-5">
        <p className="mb-3 font-semibold text-slate-500">{nice}</p>

        {!t ? (
          <div className={ui.card}><p className="text-slate-500">Loading...</p></div>
        ) : current ? (
          <section className="mb-4 rounded-3xl bg-white p-6 shadow-lg shadow-blue-200/60 ring-1 ring-blue-100">
            <div className="mb-3 flex gap-2">
              {SLOTS.map((s) => <span key={s.key} className={`h-2.5 flex-1 rounded-full ${dotColor(s)}`} />)}
            </div>
            <p className="font-extrabold text-blue-600">Sugar test {Math.min(step, 6)} of 6</p>
            <h2 className="mb-5 text-2xl font-extrabold leading-snug text-slate-900">
               <b>Sugar:</b>{current.ask}
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="numeric"
                value={val}
                placeholder="e.g. 140"
                onChange={(e) => { setVal(e.target.value); setErr(''); }}
                className={`${ui.input} py-5 text-center text-4xl font-extrabold`}
              />
              <span className="font-bold text-slate-500">mg/dL</span>
            </div>
            {err && <p className="mt-2 text-base font-semibold text-red-600">{err}</p>}
            <button className={ui.btn} onClick={saveSugar} disabled={busy}>Save sugar</button>
            <button className={ui.ghost} onClick={skipSugar} disabled={busy}>Skip this test</button>
          </section>
        ) : (
          <section className="mb-4 rounded-3xl bg-gradient-to-br from-blue-50 to-sky-50 p-7 text-center shadow-md">
            <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-blue-600 text-4xl font-extrabold text-white shadow-lg shadow-blue-600/40">✓</div>
            <h2 className="text-2xl font-extrabold">All sugar tests are done for today</h2>
            <p className="mt-1 text-slate-500">Come back tomorrow morning for the next one.</p>
          </section>
        )}

        {t && !t.bp && (
          <section className={ui.card}>
            <h2 className="text-xl font-extrabold">Blood pressure</h2>
            <p className="mb-4 text-slate-500">Enter once a day.</p>
            <div className="grid grid-cols-3 gap-3">
              {[['systolic', 'Upper', '120'], ['diastolic', 'Lower', '80'], ['pulse', 'Pulse', '72']].map(([k, l, ph]) => (
                <div key={k}>
                  <label className="mb-1 block text-center text-base font-semibold text-slate-700">{l}</label>
                  <input type="number" inputMode="numeric" placeholder={ph} value={bp[k]}
                    onChange={(e) => { setBp({ ...bp, [k]: e.target.value }); setBpErr(''); }}
                    className={`${ui.input} px-2 text-center text-2xl font-bold`} />
                </div>
              ))}
            </div>
            {bpErr && <p className="mt-2 text-base font-semibold text-red-600">{bpErr}</p>}
            <button className={ui.btn} onClick={saveBp} disabled={busy}>Save blood pressure</button>
          </section>
        )}

        {t && (
          <section className={ui.card}>
            <h2 className="mb-2 text-xl font-extrabold">Today</h2>
            <ul className="divide-y divide-slate-100">
              {SLOTS.map((s) => {
                const has = s.key in t.done;
                const v = t.done[s.key];
                return (
                  <li key={s.key} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-slate-700">{s.label}</span>
                    <b className={`rounded-full px-3 py-1 text-lg ${
                      !has ? 'bg-slate-100 text-slate-400' : v == null ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {!has ? 'Pending' : v ?? 'Skipped'}
                    </b>
                  </li>
                );
              })}
              {t.bp && (
                <li className="flex items-center justify-between gap-3 py-3">
                  <span className="text-slate-700">Blood pressure</span>
                  <b className="rounded-full bg-blue-100 px-3 py-1 text-lg text-blue-700">
                    {t.bp.systolic}/{t.bp.diastolic}{t.bp.pulse ? ` · ${t.bp.pulse}` : ''}
                  </b>
                </li>
              )}
            </ul>
          </section>
        )}

        <Link href="/records" className={ui.light}>View all records</Link>
      </main>
    </>
  );
}