import { SLOTS, flag, summarize } from './slots';

const TEAL = [15, 118, 110];

export async function buildPdf({ user, rows, from, to }) {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const first = rows[0]?.date ?? '-';
  const last = rows[rows.length - 1]?.date ?? '-';

  // Header band
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, W, 30, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text('Sugar & Blood Pressure Report', 12, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Patient: ${user.username}     Period: ${first}  to  ${last}`, 12, 23);
  if (user.photo) {
    try {
      doc.setFillColor(255);
      doc.roundedRect(W - 30, 3, 24, 24, 3, 3, 'F');
      doc.addImage(user.photo, 'JPEG', W - 29, 4, 22, 22);
    } catch {}
  }

  // Summary cards
  const s = summarize(rows);
  const cards = [
    ['Days recorded', s.days],
    ['Average sugar', s.avg ?? 'N/A'],
    ['Highest sugar', s.max ?? 'N/A'],
    ['Lowest sugar', s.min ?? 'N/A'],
    ['Average BP', s.avgBp ?? 'N/A'],
  ];
  const gap = 4, cw = (W - 24 - gap * 4) / 5;
  cards.forEach(([label, val], i) => {
    const x = 12 + i * (cw + gap);
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(x, 36, cw, 18, 3, 3, 'FD');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(label, x + 4, 42);
    doc.setTextColor(...TEAL);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(String(val), x + 4, 50);
    doc.setFont('helvetica', 'normal');
  });

  // Table
  autoTable(doc, {
    startY: 60,
    margin: { top: 14, left: 12, right: 12, bottom: 16 },
    head: [['Date', ...SLOTS.map((x) => x.pdf), 'Blood\nPressure', 'Pulse']],
    body: rows.map((r) => [
      r.date,
      ...SLOTS.map((x) => r[x.key] ?? 'N/A'),
      r.systolic ? `${r.systolic}/${r.diastolic}` : 'N/A',
      r.pulse ?? 'N/A',
    ]),
    theme: 'grid',
    styles: { fontSize: 10.5, halign: 'center', valign: 'middle', cellPadding: 2.6, lineColor: [226, 232, 240], textColor: [15, 23, 42] },
    headStyles: { fillColor: TEAL, textColor: 255, fontStyle: 'bold', fontSize: 9.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 32 } },
    didParseCell: (d) => {
      if (d.section !== 'body') return;
      const row = rows[d.row.index];
      const raw = d.cell.raw;
      if (raw === 'N/A') { d.cell.styles.textColor = [148, 163, 184]; return; }
      let f = null;
      if (d.column.index >= 1 && d.column.index <= 6) f = flag(SLOTS[d.column.index - 1].key, row[SLOTS[d.column.index - 1].key]);
      if (d.column.index === 7 && row.systolic) f = row.systolic >= 140 || row.diastolic >= 90 ? 'high' : row.systolic < 90 ? 'low' : null;
      if (f === 'high') { d.cell.styles.fillColor = [254, 226, 226]; d.cell.styles.textColor = [185, 28, 28]; d.cell.styles.fontStyle = 'bold'; }
      if (f === 'low')  { d.cell.styles.fillColor = [219, 234, 254]; d.cell.styles.textColor = [29, 78, 216]; d.cell.styles.fontStyle = 'bold'; }
    },
  });

  // Footer on every page
  const pages = doc.getNumberOfPages();
  const stamp = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Karachi' });
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(12, H - 12, W - 12, H - 12);
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Red = high, Blue = low, N/A = not recorded. Sugar in mg/dL, BP in mmHg. For personal tracking only; consult your doctor.', 12, H - 7);
    doc.text(`Generated ${stamp}  |  Page ${i} of ${pages}`, W - 12, H - 7, { align: 'right' });
  }

  doc.save(`sugar-bp-report-${user.username}.pdf`);
}