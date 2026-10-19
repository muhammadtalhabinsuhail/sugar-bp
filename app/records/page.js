'use client';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useUser } from '../../components/useUser';
import { SLOTS, flag, summarize } from '../../lib/slots';
import { buildPdf } from '../../lib/pdf';

export default function Records() {
  const [user] = useUser();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState(null);
  const [making, setMaking] = useState(false);

  const load = useCallback(async () => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const r = await fetch('/api/readings?' + q, { cache: 'no-store' });
    if (r.ok) setRows(await r.json());
  }, [from, to]);
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function pdf() {
    setMaking(true);
    try { await buildPdf({ user, rows, from, to }); } finally { setMaking(false); }
  }

  const s = rows ? summarize(rows) : null;
  const bpFlag = (r) => r.systolic && (r.systolic >= 140 || r.diastolic >= 90 ? 'high' : r.systolic < 90 ? 'low' : null);

  return (
    <>
      <Header user={user} />
      <main className="page wide">
        <h1 className="title">My records</h1>

        <section className="card">
          <div className="filters">
            <div className="field"><label>From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div className="field"><label>To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
          <div className="btnrow">
            <button className="btn" onClick={load}>Show records</button>
            <button className="btn dark" onClick={pdf} disabled={!rows?.length || making}>
              {making ? 'Preparing...' : 'Download PDF'}
            </button>
          </div>
        </section>

        {s && rows.length > 0 && (
          <div className="stats">
            <div><small>Days</small><b>{s.days}</b></div>
            <div><small>Average sugar</small><b>{s.avg ?? 'N/A'}</b></div>
            <div><small>Highest</small><b>{s.max ?? 'N/A'}</b></div>
            <div><small>Lowest</small><b>{s.min ?? 'N/A'}</b></div>
            <div><small>Average BP</small><b>{s.avgBp ?? 'N/A'}</b></div>
          </div>
        )}

        {rows && rows.length === 0 && (
          <div className="card empty">
            <h2>No records yet</h2>
            <p className="muted">Your table will start from the day you enter your first test.</p>
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="tablebox">
            <table>
              <thead>
                <tr>
                  <th className="sticky">Date</th>
                  {SLOTS.map((x) => <th key={x.key}>{x.label}</th>)}
                  <th>Blood Pressure</th>
                  <th>Pulse</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.iso}>
                    <td className="sticky">{r.date}</td>
                    {SLOTS.map((x) => {
                      const v = r[x.key];
                      return <td key={x.key} className={v == null ? 'na' : flag(x.key, v) || ''}>{v ?? 'N/A'}</td>;
                    })}
                    <td className={!r.systolic ? 'na' : bpFlag(r) || ''}>{r.systolic ? `${r.systolic}/${r.diastolic}` : 'N/A'}</td>
                    <td className={r.pulse ? '' : 'na'}>{r.pulse ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="legend"><i className="high" /> High &nbsp; <i className="low" /> Low &nbsp; N/A = not recorded</p>
      </main>
    </>
  );
}