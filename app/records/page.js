'use client';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useUser } from '../../components/useUser';
import { ui } from '../../components/ui';
import { SLOTS, flag, summarize } from '../../lib/slots';
import { buildPdf } from '../../lib/pdf';

const cell = { high: 'bg-red-100 text-red-700 font-bold', low: 'bg-blue-100 text-blue-700 font-bold' };

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
    const th = 'whitespace-nowrap px-3 py-4 text-center text-sm font-bold uppercase tracking-wide text-blue-700';
    const td = 'px-3 py-4 text-center font-semibold';

    return (
        <>
            <Header user={user} />
            <main className="mx-auto max-w-6xl px-4 pb-32 pt-5">
                <h1 className="mb-4 text-3xl 
                font-bold">My records</h1>

              <section className={ui.card}>
    {/* Date inputs: 50/50 width */}
    <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
            <label className="mb-1.5 block text-base font-semibold text-slate-700">
                From
            </label>
            <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={ui.input}
            />
        </div>

        <div className="min-w-0">
            <label className="mb-1.5 block text-base font-semibold text-slate-700">
                To
            </label>
            <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={ui.input}
            />
        </div>
    </div>

    {/* Buttons: 50/50 width */}
    <div className="mt-3 flex w-full gap-3">
        <button
            className={`${ui.btn} mt-0 flex-1 min-w-0`}
            onClick={load}
        >
            Show records
        </button>

        <button
            className={`${ui.dark} mt-0 flex-1 min-w-0`}
            onClick={pdf}
            disabled={!rows?.length || making}
        >
            {making ? 'Preparing...' : 'Download PDF'}
        </button>
    </div>
</section>

                {s && rows.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                        {[['Average BP', s.avgBp], ['Average sugar', s.avg], ['Highest', s.max], ['Lowest', s.min], ].map(([l, v], i) => (
                            <div key={l} className={`rounded-2xl bg-white p-4 shadow-md shadow-slate-300/50 ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
                                <small className="block text-sm font-semibold text-slate-500">{l}</small>
                                <b className="text-3xl font-bold text-blue-600">{v ?? 'N/A'}</b>
                            </div>
                        ))}
                    </div>
                )}

                {rows && rows.length === 0 && (
                    <div className={`${ui.card} text-center`}>
                        <h2 className="text-xl font-bold">No records yet</h2>
                        <p className="text-slate-500">Your table will start from the day you enter your first test.</p>
                    </div>
                )}

                {rows && rows.length > 0 && (
                    <div className="overflow-x-auto rounded-3xl bg-white shadow-md shadow-slate-300/50">
                        <table className="w-full min-w-[950px] border-collapse">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className={`${th} sticky left-0 bg-blue-50 text-left`}>Date</th>
                                    {SLOTS.map((x) => <th key={x.key} className={th}>{x.label}</th>)}
                                    <th className={th}>Blood Pressure</th>
                                    <th className={th}>Pulse</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((r, i) => (
                                    <tr key={r.iso} className={i % 2 ? 'bg-slate-50/60' : ''}>
                                        <td className={`${td} sticky left-0 whitespace-nowrap bg-white text-left font-bold`}>{r.date}</td>
                                        {SLOTS.map((x) => {
                                            const v = r[x.key];
                                            return <td key={x.key} className={`${td} ${v == null ? 'text-slate-300' : cell[flag(x.key, v)] || ''}`}>{v ?? 'N/A'}</td>;
                                        })}
                                        <td className={`${td} ${!r.systolic ? 'text-slate-300' : cell[bpFlag(r)] || ''}`}>
                                            {r.systolic ? `${r.systolic}/${r.diastolic}` : 'N/A'}
                                        </td>
                                        <td className={`${td} ${r.pulse ? '' : 'text-slate-300'}`}>{r.pulse ?? 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><i className="inline-block h-3.5 w-3.5 rounded bg-red-200" /> High</span>
                    <span className="flex items-center gap-1.5"><i className="inline-block h-3.5 w-3.5 rounded bg-blue-200" /> Low</span>
                    <span>N/A = not recorded</span>
                </p>
            </main>
        </>
    );
}