import assert from 'node:assert/strict';
import * as core from '../core.js';
import * as docx from '../docx.js';
let DOMParser, XMLSerializer;
try { ({ DOMParser, XMLSerializer } = await import('@xmldom/xmldom')); } catch { console.log('(@xmldom/xmldom not installed — skipping docx tests; run: npm install @xmldom/xmldom)'); }

let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };

t('segmentize + assemble round trip', () => {
  const text = 'First paragraph.\n\nSecond paragraph line one\nline two.\n\n\n\nThird.';
  const { blocks, segments } = core.segmentize(text);
  assert.equal(blocks.length, 3);
  assert.equal(segments.length, 3);
  const out = core.assemble(blocks, segments, segments.map(s => s.text.toUpperCase()));
  assert.equal(out, 'FIRST PARAGRAPH.\n\nSECOND PARAGRAPH LINE ONE\nLINE TWO.\n\nTHIRD.');
});

t('long block splits by sentences and reassembles', () => {
  const sentence = 'This is a sentence that is fairly long for testing purposes. ';
  const text = sentence.repeat(60).trim();
  const { blocks, segments } = core.segmentize(text, { maxChars: 500 });
  assert.equal(blocks.length, 1);
  assert.ok(segments.length > 5, 'should split');
  for (const s of segments) assert.ok(s.text.length <= 500);
  const out = core.assemble(blocks, segments, segments.map(s => s.text));
  assert.equal(out, text);
});

t('long block with lines splits by lines', () => {
  const text = Array.from({ length: 40 }, (_, i) => `Item ${i} is here`).join('\n');
  const { blocks, segments } = core.segmentize(text, { maxChars: 200 });
  assert.ok(segments.length > 1);
  assert.equal(core.assemble(blocks, segments, segments.map(s => s.text)), text);
});

t('arabic text segmentation', () => {
  const text = 'هذه فقرة أولى؟ نعم. '.repeat(100).trim();
  const { segments } = core.segmentize(text, { maxChars: 300 });
  assert.ok(segments.length > 3);
});

t('planRequests batches short lines', () => {
  const segs = ['Title', 'Short one.', 'Another short.', 'x'.repeat(500), 'Last short'].map((text, id) => ({ id, text, blockIndex: id, partIndex: 0 }));
  const reqs = core.planRequests(segs);
  assert.deepEqual(reqs.map(r => r.kind), ['batch', 'single', 'single']);
  assert.equal(reqs[0].segments.length, 3);
});

t('parseNumbered handles arabic digits and wrapped lines', () => {
  const out = '<think>hmm</think>\n١) الأول\n2) الثاني\nتابع\n3) الثالث';
  assert.deepEqual(core.parseNumbered(out, 3), ['الأول', 'الثاني تابع', 'الثالث']);
  assert.equal(core.parseNumbered('1) only', 2), null);
});

t('cleanTranslation strips labels, quotes, thinking', () => {
  assert.equal(core.cleanTranslation('<think>x</think>Translation: "Hello"', 'مرحبا'), 'Hello');
  assert.equal(core.cleanTranslation('"Hi"', '"مرحبا"'), '"Hi"');
  assert.equal(core.cleanTranslation('الترجمة: أهلاً', 'Hi'), 'أهلاً');
});

t('prompts contain the key instructions', () => {
  const card = { source: 'en', target: 'ar', register: 'corporate', variety: 'levantine', address: 'formal', localize: true, audience: 'Email to a bank', glossary: [{ term: 'Nabra', rendering: '' }, { term: 'board', rendering: 'مجلس الإدارة' }] };
  const p = core.buildSystemPrompt(card);
  assert.ok(p.includes('from English into Arabic'));
  assert.ok(p.includes('Levantine'));
  assert.ok(p.includes('"Nabra" → keep'));
  assert.ok(p.includes('"board" → "مجلس الإدارة"'));
  assert.ok(p.includes('Email to a bank'));
  const same = core.buildSystemPrompt({ source: 'en', target: 'en', register: 'friendly', glossary: [] });
  assert.ok(same.includes('rewrite'));
  const auto = core.buildSystemPrompt({ source: 'auto', target: 'fr', register: 'neutral' });
  assert.ok(auto.includes('detect it'));
  const batch = core.buildBatchMessages(card, ['a', 'b']);
  assert.ok(batch[1].content === '1) a\n2) b');
});

t('notes and glossary parsing', () => {
  assert.deepEqual(core.parseNoteLines('NONE'), []);
  assert.deepEqual(core.parseNoteLines('- break a leg — good luck — حظاً موفقاً — theatre idiom\n• second'), ['break a leg — good luck — حظاً موفقاً — theatre idiom', 'second']);
  assert.deepEqual(core.parseGlossaryLines('GJU — KEEP\nboard of directors — مجلس الإدارة\nnonsense line'), [{ term: 'GJU', rendering: '' }, { term: 'board of directors', rendering: 'مجلس الإدارة' }]);
});

t('srt round trip', () => {
  const srt = '1\n00:00:01,000 --> 00:00:02,000\nHello\nworld\n\n2\n00:00:03,000 --> 00:00:04,000\nBye\n';
  const cues = core.parseSrt(srt);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].text, 'Hello\nworld');
  assert.equal(core.serializeSrt(cues), srt);
});

t('pdf lines to paragraphs', () => {
  const lines = [
    { text: 'The quick brown fox jumps over the', y: 700, height: 12 },
    { text: 'lazy dog. It was tired.', y: 686, height: 12 },
    { text: 'A new paragraph starts here after a gap.', y: 650, height: 12 },
    { text: 'Hyphen-', y: 636, height: 12 },
    { text: 'ated word.', y: 622, height: 12 },
  ];
  const paras = core.linesToParagraphs(lines);
  assert.deepEqual(paras, ['The quick brown fox jumps over the lazy dog. It was tired.', 'A new paragraph starts here after a gap. Hyphenated word.']);
});

t('direction, words, tm key', () => {
  assert.equal(core.textDirection('مرحبا بكم في التطبيق'), 'rtl');
  assert.equal(core.textDirection('Hello there'), 'ltr');
  assert.equal(core.countWords('  a b   c '), 3);
  const card = { source: 'en', target: 'ar', register: 'neutral', variety: 'msa' };
  assert.equal(core.tmKey(card, 'x '), core.tmKey(card, ' x'));
  assert.notEqual(core.tmKey(card, 'x'), core.tmKey({ ...card, register: 'corporate' }, 'x'));
  assert.equal(core.recommendTier(6), 'light');
  assert.equal(core.recommendTier(16), 'standard');
});

if (DOMParser) t('docx round trip keeps styles, replaces text, sets rtl', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${docx.W_NS}"><w:body>
<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Hello </w:t></w:r><w:r><w:t>world</w:t></w:r><w:r><w:br/><w:t>line2</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>
<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
</w:body></w:document>`;
  const { doc, items } = docx.docxParagraphs(xml, { DOMParser });
  assert.equal(items.length, 3);
  assert.equal(items[0].text, 'Hello world\nline2');
  assert.equal(items[1].text, '');
  assert.equal(items[2].text, 'Cell');
  docx.docxApplyTranslations(doc, items, ['مرحبا\tبالعالم\nسطر', undefined, 'خلية'], { rtl: true });
  const out = docx.docxSerialize(doc, { XMLSerializer });
  assert.ok(out.startsWith('<?xml'));
  assert.ok(out.includes('<w:pStyle w:val="Heading1"/>'));
  assert.ok(out.includes('<w:bidi/>'));
  assert.ok(/<w:pPr><w:pStyle w:val="Heading1"\/><w:bidi\/><w:jc w:val="both"\/><\/w:pPr>/.test(out), 'bidi ordered before jc');
  assert.ok(/<w:rPr><w:b\/><w:rtl\/><\/w:rPr>/.test(out), 'rtl in first run');
  assert.ok(out.includes('<w:t xml:space="preserve">مرحبا</w:t><w:tab/><w:t xml:space="preserve">بالعالم</w:t><w:br/><w:t xml:space="preserve">سطر</w:t>'));
  assert.ok(!out.includes('world') && !out.includes('line2'));
  assert.ok(out.includes('>خلية<'));
  // reverse: rtl → ltr removes bidi
  const r2 = docx.docxParagraphs(out, { DOMParser });
  docx.docxApplyTranslations(r2.doc, r2.items, ['Hi', undefined, 'Cell'], { rtl: false });
  const out2 = docx.docxSerialize(r2.doc, { XMLSerializer });
  assert.ok(!out2.includes('<w:bidi/>') && !out2.includes('<w:rtl/>'));
});

if (DOMParser) t('new docx xml is well formed', () => {
  const xml = docx.buildDocumentXml(['# Title & more', 'Body <b>\nsecond line'], { rtl: true });
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  assert.equal(doc.getElementsByTagNameNS(docx.W_NS, 'p').length, 2);
  assert.ok(xml.includes('&amp;') && xml.includes('&lt;b&gt;'));
  const s = new DOMParser().parseFromString(docx.stylesXml(), 'application/xml');
  assert.ok(s.documentElement.localName === 'styles');
});


t('literary register, verse detection, tashkeel', () => {
  const s = 'يَتَشَظَّى الوَقْتُ عَلَى رَصِيفِ الانْتِظَارِ';
  assert.equal(core.stripTashkeel(s), 'يتشظى الوقت على رصيف الانتظار');
  assert.ok(core.looksLikeVerse('أَلَمٌ أَلَمَّ أَلَمْ أُلِمَّ بِدَائِهِ ... إِنْ آنَ آنٌ آنَ آنُ أَوَانِهِ'));
  assert.ok(core.looksLikeVerse('a\nb\nc'));
  assert.ok(!core.looksLikeVerse('A long prose paragraph that goes on and on without any line breaks at all, so it is not verse.'));
  const card = { source: 'ar', target: 'en', register: 'literary' };
  const msgs = core.buildTranslateMessages(card, 'line one\nline two\nline three');
  assert.ok(msgs[0].content.includes('The text is verse'));
  assert.ok(msgs[0].content.includes('carried across as an image'));
  assert.ok(!core.buildSystemPrompt(card).includes('The text is verse'));
  assert.ok(core.buildBatchMessages(card, ['a', 'b'])[0].content.includes('consecutive lines'));
  assert.ok(core.buildBatchMessages({ ...card, register: 'neutral' }, ['a', 'b'])[0].content.includes('independently'));
  const ex = core.buildExplainMessages(card, 'x', 'y', 'ar')[0].content;
  assert.ok(ex.includes('jinās') && ex.includes('Arabic'));
  const po = core.buildPolishMessages(card, 'src', 'draft');
  assert.ok(po[0].content.includes('revising') && po[1].content.includes('Draft:\ndraft'));
  assert.ok(core.REGISTERS.literary && Object.keys(core.REGISTERS).length === 6);
  const jinas = 'أَلَمٌ أَلَمَّ أَلَمْ أُلِمَّ بِدَائِهِ ... إِنْ آنَ آنٌ آنَ آنُ أَوَانِهِ';
  assert.equal(core.prepareForModel(jinas), jinas, 'vocalization kept when words would collapse');
  assert.equal(core.prepareForModel(s), 'يتشظى الوقت على رصيف الانتظار');
  assert.ok(core.buildBatchMessages(card, [jinas, 'x'])[0].content.includes('The text is verse'));
});
console.log(`\n${n} tests passed`);

t('fidelity check parsing and repair prompt', () => {
  assert.ok(!core.hasIssues(core.parseCheck('OK')));
  assert.ok(!core.hasIssues(core.parseCheck('<think>..</think>\nok.')));
  const c = core.parseCheck('- MISSING: كلما حاولت\nADDED: melody\n**Changed**: واهٍ → futile\nsome free remark');
  assert.deepEqual(c.missing, ['كلما حاولت']);
  assert.deepEqual(c.added, ['melody']);
  assert.deepEqual(c.changed, ['واهٍ → futile']);
  assert.deepEqual(c.other, ['some free remark']);
  const card = { source: 'ar', target: 'en', register: 'literary' };
  const rep = core.buildRepairMessages(card, 'src', 'draft', c);
  assert.ok(rep[0].content.includes('MISSING from the draft: كلما حاولت') && rep[0].content.includes('ADDED by the draft'));
  assert.ok(rep[1].content === 'Source:\nsrc\n\nDraft:\ndraft');
  const chk = core.buildCheckMessages(card, 's', 't', 'ar')[0].content;
  assert.ok(chk.includes('MISSING:') && chk.includes('Arabic'));
  assert.ok(core.buildSystemPrompt(card).includes('Fidelity comes first'));
});
console.log(`${n} tests passed (incl. fidelity)`);
