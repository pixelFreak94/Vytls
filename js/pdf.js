// pdf.js — turns the doctor report sheet (built by report.js) into a real PDF file, in plain JavaScript.
// Why: on iPhone, window.print() does nothing in an app opened from the Home Screen, so the report is
// made here and handed to the share sheet like the CSV and the backup (DECISIONS 38). No library, no network.
// Sizes and colours come from the --rp-print-* tokens in tokens.css. Fonts are the PDF's built-in
// Helvetica, so nothing is embedded; text outside Latin-1 prints as "?".

// ---- text widths (Helvetica and Helvetica-Bold, 1/1000 em, characters 32..126) ----
const W_REG = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const W_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
// characters outside ASCII that WinAnsi has, as [code, width]
const WIN = { '–': [0x96, 556], '—': [0x97, 1000], '·': [0xb7, 278], '•': [0x95, 350], '’': [0x92, 222], '‘': [0x91, 222],
  '“': [0x93, 333], '”': [0x94, 333], '…': [0x85, 1000], '°': [0xb0, 400], '×': [0xd7, 584], ' ': [0x20, 278] };
const MARK = '▲';            // drawn as a small triangle, not a glyph (Helvetica has none)
const MARK_W = 600;

const charW = (c, bold) => {
  if (c === MARK) return MARK_W;
  const n = c.charCodeAt(0);
  if (n >= 32 && n <= 126) return (bold ? W_BOLD : W_REG)[n - 32];
  return WIN[c]?.[1] ?? 556;
};
const textW = (s, size, bold) => [...s].reduce((w, c) => w + charW(c, bold), 0) * size / 1000;

/** A string as WinAnsi bytes inside a PDF literal string. */
function pdfStr(s) {
  let out = '';
  for (const c of s) {
    const n = c.charCodeAt(0);
    let b = n >= 32 && n <= 126 ? n : WIN[c]?.[0] ?? (n >= 0xa0 && n <= 0xff ? n : 63);
    if (b === 40 || b === 41 || b === 92) out += '\\' + String.fromCharCode(b);
    else if (b < 32 || b > 126) out += '\\' + b.toString(8).padStart(3, '0');
    else out += String.fromCharCode(b);
  }
  return `(${out})`;
}

/** Break text into lines no wider than width. Long words are split. */
function wrap(text, width, size, bold) {
  const lines = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(/ +/)) {
      const tryLine = line ? `${line} ${word}` : word;
      if (textW(tryLine, size, bold) <= width) { line = tryLine; continue; }
      if (line) lines.push(line);
      line = word;
      while (textW(line, size, bold) > width && line.length > 1) {
        let i = line.length - 1;
        while (i > 1 && textW(line.slice(0, i), size, bold) > width) i--;
        lines.push(line.slice(0, i));
        line = line.slice(i);
      }
    }
    lines.push(line);
  }
  return lines;
}

// ---- tokens -------------------------------------------------------------------
function tokens() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n) => cs.getPropertyValue(`--rp-print-${n}`).trim();
  const len = (n) => { const s = v(n); const x = parseFloat(s); return s.endsWith('mm') ? x * 72 / 25.4 : s.endsWith('px') ? x * 0.75 : x; };
  const rgb = (n) => {
    let h = v(n).replace('#', '');
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    return [0, 2, 4].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255 || 0).toFixed(3)).join(' ');
  };
  return { ink: rgb('ink'), rule: rgb('rule'), soft: rgb('rule-soft'), fs: len('fs'), fsHead: len('fs-head'),
    fsTitle: len('fs-title'), padY: len('pad-y'), padX: len('pad-x'), margin: len('margin') };
}

// ---- pages ----------------------------------------------------------------------
const PAGE_W = 842, PAGE_H = 595;   // A4 landscape, in points (as the print layout was)

function makeDoc(t) {
  const pages = [];
  let ops = null, y = 0;
  const doc = {
    get y() { return y; },
    set y(v) { y = v; },
    left: t.margin, right: PAGE_W - t.margin, bottom: t.margin,
    newPage() { ops = []; pages.push(ops); y = PAGE_H - t.margin; },
    /** Make room for h points; start a new page if it does not fit. Returns true if a page was added. */
    room(h) { if (y - h < t.margin) { doc.newPage(); return true; } return false; },
    text(x, baseline, s, size, bold) {
      // runs of text, with the ▲ mark drawn as a filled triangle
      let cx = x;
      for (const part of String(s).split(/(▲)/)) {
        if (!part) continue;
        if (part === MARK) {
          const w = MARK_W * size / 1000, h = size * 0.62;
          ops.push(`${t.ink} rg ${(cx + w * 0.12).toFixed(2)} ${baseline.toFixed(2)} m ${(cx + w * 0.88).toFixed(2)} ${baseline.toFixed(2)} l ${(cx + w / 2).toFixed(2)} ${(baseline + h).toFixed(2)} l f`);
          cx += w;
        } else {
          ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${t.ink} rg ${cx.toFixed(2)} ${baseline.toFixed(2)} Td ${pdfStr(part)} Tj ET`);
          cx += textW(part, size, bold);
        }
      }
    },
    rect(x, top, w, h, color = t.rule) {
      ops.push(`${color} RG 0.25 w ${x.toFixed(2)} ${(top - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
    },
    line(x1, y1, x2, color = t.soft) { ops.push(`${color} RG 0.25 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y1.toFixed(2)} l S`); },
  };
  doc.newPage();
  doc.pages = pages;
  return doc;
}

/** The finished file as bytes. */
function serialise(pages) {
  const objs = [];   // index + 1 = object number
  objs.push('<< /Type /Catalog /Pages 2 0 R >>');
  objs.push(null);   // pages, filled below
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids = [];
  for (const ops of pages) {
    const stream = ops.join('\n');
    objs.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const contentNo = objs.length;
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNo} 0 R >>`);
    kids.push(`${objs.length} 0 R`);
  }
  objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${kids.length} >>`;
  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}

// ---- the report table -------------------------------------------------------------

/** Header rows as cells placed on a grid of leaf columns (handles colspan and rowspan). */
function headerGrid(thead) {
  const rows = [...thead.rows];
  const taken = rows.map(() => []);
  const cells = [];
  rows.forEach((tr, r) => {
    let c = 0;
    for (const th of tr.cells) {
      while (taken[r][c]) c++;
      const cs = th.colSpan || 1, rs = th.rowSpan || 1;
      for (let i = 0; i < rs; i++) for (let j = 0; j < cs; j++) if (taken[r + i]) taken[r + i][c + j] = true;
      cells.push({ r, c, cs, rs, text: th.textContent });
      c += cs;
    }
  });
  return { cells, rows: rows.length, cols: Math.max(...taken.map((x) => x.length)) };
}

function drawTable(doc, table, t) {
  const head = headerGrid(table.tHead);
  const body = [...table.tBodies[0].rows].map((tr) => [...tr.cells].map((td) => ({ text: td.textContent, wide: td.classList.contains('rp-foods') })));
  const n = head.cols;
  const avail = doc.right - doc.left;
  const pad = t.padX * 2;
  const lh = t.fs * 1.25, lhHead = t.fsHead * 1.25;

  // widths: short columns take what they need; the foods columns share the rest
  const wide = Array.from({ length: n }, (_, c) => body.some((r) => r[c]?.wide));
  const leafHead = head.cells.filter((h) => h.cs === 1);
  const natural = Array.from({ length: n }, (_, c) => {
    const texts = [...body.map((r) => r[c]?.text ?? ''), ...leafHead.filter((h) => h.c === c).map((h) => h.text)];
    return Math.min(Math.max(...texts.map((s) => textW(s, t.fs, false))) + pad, avail / 4);
  });
  const fixed = natural.reduce((s, w, c) => s + (wide[c] ? 0 : w), 0);
  const nWide = wide.filter(Boolean).length;
  const widths = nWide
    ? natural.map((w, c) => (wide[c] ? Math.max((avail - fixed) / nWide, 40) : w))
    : natural.map((w) => w * avail / natural.reduce((a, b) => a + b, 0));
  const xs = widths.reduce((a, w) => [...a, a.at(-1) + w], [doc.left]);

  const drawHead = () => {
    const rowH = lhHead + t.padY * 2;
    doc.room(rowH * head.rows + lh);
    const top = doc.y;
    for (const h of head.cells) {
      const x = xs[h.c], w = xs[h.c + h.cs] - x, cellTop = top - h.r * rowH, hh = rowH * h.rs;
      doc.rect(x, cellTop, w, hh);
      const lines = wrap(h.text, w - pad, t.fsHead, true);
      lines.slice(0, h.rs).forEach((l, i) => doc.text(x + t.padX, cellTop - t.padY - t.fsHead * 0.9 - i * lhHead, l, t.fsHead, true));
    }
    doc.y = top - rowH * head.rows;
  };

  drawHead();
  for (const row of body) {
    const lines = row.map((cell, c) => wrap(cell.text, widths[c] - pad, t.fs, false));
    const h = Math.max(...lines.map((l) => l.length)) * lh + t.padY * 2;
    if (doc.room(h)) drawHead();
    const top = doc.y;
    lines.forEach((ls, c) => {
      doc.rect(xs[c], top, widths[c], h);
      ls.forEach((l, i) => doc.text(xs[c] + t.padX, top - t.padY - t.fs * 0.9 - i * lh, l, t.fs, false));
    });
    doc.y = top - h;
  }
}

/** Paragraph-like text: wrapped, with a gap after. */
function drawText(doc, text, size, bold, t, { gapBefore = 0, indent = 0, bullet = false } = {}) {
  const lh = size * 1.3;
  const x = doc.left + indent;
  const lines = wrap(text, doc.right - x, size, bold);
  doc.y -= gapBefore;
  lines.forEach((l, i) => {
    if (doc.room(lh)) { /* carried to the next page */ }
    if (bullet && i === 0) doc.text(doc.left, doc.y - size, '•', size, false);
    doc.text(x, doc.y - size, l, size, bold);
    doc.y -= lh;
  });
}

/** The report sheet element → PDF bytes. */
export function reportPdf(sheet) {
  const t = tokens();
  const doc = makeDoc(t);
  for (const node of sheet.children) {
    const tag = node.tagName;
    if (tag === 'H2') drawText(doc, node.textContent, t.fsTitle, true, t);
    else if (tag === 'H3') drawText(doc, node.textContent, t.fs * 1.5, true, t, { gapBefore: t.fs * 1.2 });
    else if (tag === 'TABLE') { doc.y -= t.fs * 0.6; drawTable(doc, node, t); doc.y -= t.fs * 0.6; }
    else if (tag === 'UL') for (const li of node.children) drawText(doc, li.textContent, t.fs, false, t, { indent: t.fs * 1.2, bullet: true });
    else if (node.classList.contains('rp-summary')) {
      // kept on one page, as the print layout did
      const items = node.querySelectorAll('li').length;
      doc.room(t.fs * 1.5 * 1.3 + t.fs * 1.2 + items * t.fs * 1.3 * 2);
      for (const child of node.children) {
        if (child.tagName === 'H3') drawText(doc, child.textContent, t.fs * 1.5, true, t, { gapBefore: t.fs * 1.2 });
        else for (const li of child.children) drawText(doc, li.textContent, t.fs, false, t, { indent: t.fs * 1.2, bullet: true });
      }
    } else if (node.classList.contains('rp-foot')) {
      doc.y -= t.fs * 1.5;
      doc.room(t.fs * 2);
      doc.line(doc.left, doc.y, doc.right);
      drawText(doc, node.textContent, t.fs, false, t, { gapBefore: t.padY });
    } else drawText(doc, node.textContent, t.fs, false, t, { gapBefore: t.fs * 0.3 });
  }
  return serialise(doc.pages);
}
