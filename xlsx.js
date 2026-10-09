/* Nabra — Excel (.xlsx) helpers: translate the text of cells while numbers, dates and formulas
   stay untouched. DOM implementations are injected so the code runs in the browser and in Node. */

export const SS_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const XML_NS = 'http://www.w3.org/XML/1998/namespace';

function hasLetters(text) {
  return /\p{L}/u.test(text || '');
}

function textOf(container) {
  // All <t> descendants except those inside phonetic hints <rPh>.
  let out = '';
  const walk = (node) => {
    for (let c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType !== 1) continue;
      if (c.namespaceURI === SS_NS && c.localName === 'rPh') continue;
      if (c.namespaceURI === SS_NS && c.localName === 't') out += c.textContent || '';
      else walk(c);
    }
  };
  walk(container);
  return out;
}

function replaceWithText(container, text, doc) {
  while (container.firstChild) container.removeChild(container.firstChild);
  const t = doc.createElementNS(SS_NS, 't');
  t.setAttributeNS(XML_NS, 'xml:space', 'preserve');
  t.textContent = text;
  container.appendChild(t);
}

/** Shared strings: returns { doc, items: [{ index, node, text, translatable }] }. */
export function xlsxSharedStrings(xml, { DOMParser }) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const items = [];
  const list = doc.getElementsByTagNameNS(SS_NS, 'si');
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    const text = textOf(node);
    items.push({ index: i, node, text, translatable: hasLetters(text) });
  }
  return { doc, items };
}

/** Inline strings inside one worksheet: <c t="inlineStr"><is>…</is></c>. */
export function xlsxInlineStrings(xml, { DOMParser }) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const items = [];
  const list = doc.getElementsByTagNameNS(SS_NS, 'is');
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    const text = textOf(node);
    items.push({ index: i, node, text, translatable: hasLetters(text) });
  }
  return { doc, items };
}

/** Write translated texts back: translations[i] replaces items[i] (undefined keeps the original). */
export function xlsxApplyStrings(doc, items, translations) {
  items.forEach((item, i) => {
    const text = translations[i];
    if (text === undefined || text === null) return;
    replaceWithText(item.node, text, doc);
  });
  return doc;
}

/** Flip the sheet to right-to-left (or back) via <sheetView rightToLeft="1">. */
export function xlsxSetDirection(doc, rtl) {
  const views = doc.getElementsByTagNameNS(SS_NS, 'sheetView');
  for (let i = 0; i < views.length; i++) {
    if (rtl) views[i].setAttribute('rightToLeft', '1');
    else views[i].removeAttribute('rightToLeft');
  }
  return doc;
}

export function xlsxSerialize(doc, { XMLSerializer }) {
  let xml = new XMLSerializer().serializeToString(doc);
  if (!/^\s*<\?xml/.test(xml)) xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + xml;
  return xml;
}

/* ---------- CSV ---------- */

export function detectDelimiter(text) {
  const head = (text || '').split('\n').slice(0, 5).join('\n');
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const ch of head) if (ch in counts) counts[ch]++;
  let best = ',';
  for (const [d, n] of Object.entries(counts)) if (n > counts[best]) best = d;
  return best;
}

export function parseCsv(text, delimiter) {
  const d = delimiter || detectDelimiter(text);
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const src = (text || '').replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === d) { row.push(field); field = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return { rows, delimiter: d };
}

export function serializeCsv(rows, delimiter = ',') {
  const esc = (v) => {
    const s = String(v ?? '');
    return /["\n\r]/.test(s) || s.includes(delimiter) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return rows.map((r) => r.map(esc).join(delimiter)).join('\r\n') + '\r\n';
}

/** Cells worth translating: those containing letters. Returns [{ r, c, text }]. */
export function csvTranslatableCells(rows) {
  const out = [];
  rows.forEach((row, r) => row.forEach((cell, c) => {
    if (hasLetters(cell)) out.push({ r, c, text: cell });
  }));
  return out;
}
