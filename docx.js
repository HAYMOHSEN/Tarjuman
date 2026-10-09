/* Tarjuman — Word (.docx) helpers. DOM implementations are injected so the same
   code runs in the browser (DOMParser / XMLSerializer) and in the Node tests. */

export const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_NS = 'http://www.w3.org/XML/1998/namespace';

function nearestParagraph(node) {
  let n = node.parentNode;
  while (n) {
    if (n.namespaceURI === W_NS && n.localName === 'p') return n;
    n = n.parentNode;
  }
  return null;
}

/** Collect the text-bearing nodes (w:t, w:br, w:cr, w:tab) that belong to
 *  this paragraph directly, in document order, skipping nested paragraphs
 *  (text boxes) and deleted tracked changes. */
function tokenNodes(p) {
  const out = [];
  const walk = (node) => {
    for (let child = node.firstChild; child; child = child.nextSibling) {
      if (child.nodeType !== 1) continue;
      if (child.namespaceURI !== W_NS) {
        walk(child);
        continue;
      }
      const name = child.localName;
      if (name === 'p' || name === 'del' || name === 'instrText' || name === 'delText') continue;
      if (name === 't' || name === 'br' || name === 'cr' || name === 'tab') {
        out.push(child);
        continue;
      }
      walk(child);
    }
  };
  walk(p);
  return out.filter((n) => nearestParagraph(n) === p);
}

function tokenText(node) {
  switch (node.localName) {
    case 't': return node.textContent || '';
    case 'br':
    case 'cr': return '\n';
    case 'tab': return '\t';
    default: return '';
  }
}

/** Parse word/document.xml and list its paragraphs with their plain text. */
export function docxParagraphs(documentXml, { DOMParser }) {
  const doc = new DOMParser().parseFromString(documentXml, 'application/xml');
  const items = [];
  const all = doc.getElementsByTagNameNS(W_NS, 'p');
  for (let i = 0; i < all.length; i++) {
    const p = all[i];
    const tokens = tokenNodes(p);
    const text = tokens.map(tokenText).join('');
    items.push({ p, tokens, text });
  }
  return { doc, items };
}

const PPR_AFTER_BIDI = ['adjustRightInd', 'snapToGrid', 'spacing', 'ind', 'contextualSpacing', 'mirrorIndents',
  'suppressOverlap', 'jc', 'textDirection', 'textAlignment', 'textboxTightWrap', 'outlineLvl', 'divId', 'cnfStyle', 'rPr', 'sectPr', 'pPrChange'];
const RPR_AFTER_RTL = ['cs', 'em', 'lang', 'eastAsianLayout', 'specVanish', 'oMath', 'rPrChange'];

function childNS(parent, localName) {
  for (let c = parent.firstChild; c; c = c.nextSibling) {
    if (c.nodeType === 1 && c.namespaceURI === W_NS && c.localName === localName) return c;
  }
  return null;
}

function insertOrdered(parent, el, afterList, doc) {
  for (let c = parent.firstChild; c; c = c.nextSibling) {
    if (c.nodeType === 1 && c.namespaceURI === W_NS && afterList.includes(c.localName)) {
      parent.insertBefore(el, c);
      return;
    }
  }
  parent.appendChild(el);
}

function ensureFirstChild(parent, localName, doc) {
  let el = childNS(parent, localName);
  if (!el) {
    el = doc.createElementNS(W_NS, 'w:' + localName);
    parent.insertBefore(el, parent.firstChild);
  }
  return el;
}

function removeChild(parent, localName) {
  const el = childNS(parent, localName);
  if (el) parent.removeChild(el);
}

export function setParagraphDirection(p, rtl, doc) {
  const pPr = ensureFirstChild(p, 'pPr', doc);
  if (rtl) {
    if (!childNS(pPr, 'bidi')) insertOrdered(pPr, doc.createElementNS(W_NS, 'w:bidi'), PPR_AFTER_BIDI, doc);
  } else {
    removeChild(pPr, 'bidi');
  }
  if (!pPr.firstChild) p.removeChild(pPr);
}

function setRunDirection(run, rtl, doc) {
  if (rtl) {
    const rPr = ensureFirstChild(run, 'rPr', doc);
    if (!childNS(rPr, 'rtl')) insertOrdered(rPr, doc.createElementNS(W_NS, 'w:rtl'), RPR_AFTER_RTL, doc);
  } else {
    const rPr = childNS(run, 'rPr');
    if (rPr) {
      removeChild(rPr, 'rtl');
      if (!rPr.firstChild) run.removeChild(rPr);
    }
  }
}

function makeTextNodes(text, doc) {
  const nodes = [];
  const lines = text.split('\n');
  lines.forEach((line, li) => {
    if (li > 0) nodes.push(doc.createElementNS(W_NS, 'w:br'));
    const cells = line.split('\t');
    cells.forEach((cell, ci) => {
      if (ci > 0) nodes.push(doc.createElementNS(W_NS, 'w:tab'));
      if (cell) {
        const t = doc.createElementNS(W_NS, 'w:t');
        t.setAttributeNS(XML_NS, 'xml:space', 'preserve');
        t.textContent = cell;
        nodes.push(t);
      }
    });
  });
  return nodes;
}

/** Write translations back into the parsed document. `translations[i]` is
 *  the new text for items[i] (undefined keeps the original). Paragraph style,
 *  numbering and the first run's character formatting are preserved;
 *  formatting of later runs inside the paragraph is dropped. */
export function docxApplyTranslations(doc, items, translations, options = {}) {
  const rtl = !!options.rtl;
  items.forEach((item, i) => {
    const text = translations[i];
    if (text === undefined || text === null) return;
    const firstT = item.tokens.find((n) => n.localName === 't');
    if (!firstT) return;
    const run = firstT.parentNode;
    for (const node of item.tokens) {
      if (node === firstT) continue;
      node.parentNode.removeChild(node);
    }
    const fresh = makeTextNodes(text, doc);
    if (!fresh.length) {
      firstT.textContent = '';
      return;
    }
    for (const node of fresh) run.insertBefore(node, firstT);
    run.removeChild(firstT);
    if (options.setDirection !== false) {
      setParagraphDirection(item.p, rtl, doc);
      setRunDirection(run, rtl, doc);
    }
  });
  return doc;
}

export function docxSerialize(doc, { XMLSerializer }) {
  let xml = new XMLSerializer().serializeToString(doc);
  if (!/^\s*<\?xml/.test(xml)) xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + xml;
  return xml;
}

/* ---------- Build a new .docx from plain paragraphs ---------- */

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function runXml(text, bold, rtl) {
  const props = (bold ? '<w:b/><w:bCs/>' : '') + (rtl ? '<w:rtl/>' : '');
  const rPr = props ? `<w:rPr>${props}</w:rPr>` : '';
  const parts = [];
  text.split('\n').forEach((line, li) => {
    if (li > 0) parts.push('<w:br/>');
    line.split('\t').forEach((cell, ci) => {
      if (ci > 0) parts.push('<w:tab/>');
      if (cell) parts.push(`<w:t xml:space="preserve">${esc(cell)}</w:t>`);
    });
  });
  return `<w:r>${rPr}${parts.join('')}</w:r>`;
}

export function buildDocumentXml(paragraphs, options = {}) {
  const rtl = !!options.rtl;
  const body = paragraphs.map((para) => {
    let text = para;
    let bold = false;
    const heading = text.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      text = heading[1];
      bold = true;
    }
    const pPr = `<w:pPr>${rtl ? '<w:bidi/>' : ''}<w:spacing w:after="160"/></w:pPr>`;
    return `<w:p>${pPr}${runXml(text, bold, rtl)}</w:p>`;
  }).join('');
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + `<w:document xmlns:w="${W_NS}"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}

export const CONTENT_TYPES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
  + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
  + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
  + '<Default Extension="xml" ContentType="application/xml"/>'
  + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
  + '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
  + '</Types>';

export const RELS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
  + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
  + '</Relationships>';

export const DOCUMENT_RELS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
  + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
  + '</Relationships>';

export function stylesXml(options = {}) {
  const font = options.font || 'Calibri';
  const csFont = options.csFont || 'Arial';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + `<w:styles xmlns:w="${W_NS}"><w:docDefaults><w:rPrDefault><w:rPr>`
    + `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${csFont}" w:eastAsia="${font}"/>`
    + '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-US" w:bidi="ar-JO"/>'
    + '</w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>'
    + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>'
    + '</w:styles>';
}

/** Add the parts of a minimal .docx to a JSZip instance. */
export function fillDocxZip(zip, paragraphs, options = {}) {
  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', RELS_XML);
  zip.file('word/_rels/document.xml.rels', DOCUMENT_RELS_XML);
  zip.file('word/document.xml', buildDocumentXml(paragraphs, options));
  zip.file('word/styles.xml', stylesXml(options));
  return zip;
}
