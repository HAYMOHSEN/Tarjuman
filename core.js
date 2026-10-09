/* Nabra — core logic. No DOM, no browser APIs: this module is shared by the
   app and by the Node test suite. Everything that talks to the model engine
   lives in app.js; everything that only shapes text lives here. */

export const LANGUAGES = [
  { code: 'auto', name: 'the source language', en: 'Auto-detect', ar: 'تلقائي' },
  { code: 'ar', name: 'Arabic', en: 'Arabic', ar: 'العربية', rtl: true },
  { code: 'en', name: 'English', en: 'English', ar: 'الإنجليزية' },
  { code: 'fr', name: 'French', en: 'French', ar: 'الفرنسية' },
  { code: 'de', name: 'German', en: 'German', ar: 'الألمانية' },
  { code: 'es', name: 'Spanish', en: 'Spanish', ar: 'الإسبانية' },
  { code: 'it', name: 'Italian', en: 'Italian', ar: 'الإيطالية' },
  { code: 'pt', name: 'Portuguese', en: 'Portuguese', ar: 'البرتغالية' },
  { code: 'tr', name: 'Turkish', en: 'Turkish', ar: 'التركية' },
  { code: 'ru', name: 'Russian', en: 'Russian', ar: 'الروسية' },
  { code: 'zh', name: 'Chinese (Simplified)', en: 'Chinese (Simplified)', ar: 'الصينية (المبسطة)' },
  { code: 'ja', name: 'Japanese', en: 'Japanese', ar: 'اليابانية' },
  { code: 'ko', name: 'Korean', en: 'Korean', ar: 'الكورية' },
  { code: 'hi', name: 'Hindi', en: 'Hindi', ar: 'الهندية' },
  { code: 'ur', name: 'Urdu', en: 'Urdu', ar: 'الأردية', rtl: true },
  { code: 'fa', name: 'Persian', en: 'Persian', ar: 'الفارسية', rtl: true },
  { code: 'he', name: 'Hebrew', en: 'Hebrew', ar: 'العبرية', rtl: true },
  { code: 'nl', name: 'Dutch', en: 'Dutch', ar: 'الهولندية' },
  { code: 'pl', name: 'Polish', en: 'Polish', ar: 'البولندية' },
  { code: 'sv', name: 'Swedish', en: 'Swedish', ar: 'السويدية' },
  { code: 'el', name: 'Greek', en: 'Greek', ar: 'اليونانية' },
  { code: 'id', name: 'Indonesian', en: 'Indonesian', ar: 'الإندونيسية' },
  { code: 'ms', name: 'Malay', en: 'Malay', ar: 'الماليزية' },
];

export const REGISTERS = {
  corporate: {
    en: 'Formal — corporate', ar: 'رسمي — للشركات',
    hint_en: 'Clients, official letters, contracts', hint_ar: 'العملاء والخطابات الرسمية والعقود',
    rule: 'Formal, professional business register: courteous, precise, complete sentences, no slang, no contractions, no jokes. Suitable for corporate clients, official letters and contracts.',
  },
  academic: {
    en: 'Academic', ar: 'أكاديمي',
    hint_en: 'Papers, theses, reports', hint_ar: 'الأبحاث والرسائل والتقارير',
    rule: 'Academic register: objective, precise terminology, measured hedging, impersonal where the source is impersonal, no colloquialisms.',
  },
  neutral: {
    en: 'Neutral', ar: 'محايد',
    hint_en: 'Clear and plain, no strong tone', hint_ar: 'واضح وبسيط دون نبرة قوية',
    rule: 'Neutral, clear everyday register: plain words, natural sentences, neither stiff nor chatty.',
  },
  friendly: {
    en: 'Casual — friends', ar: 'ودّي — للأصدقاء',
    hint_en: 'Messages, chats, personal notes', hint_ar: 'الرسائل والمحادثات والملاحظات الشخصية',
    rule: 'Casual, warm, conversational register as between friends: relaxed phrasing, contractions where the language has them, friendly but not childish.',
  },
  marketing: {
    en: 'Marketing', ar: 'تسويقي',
    hint_en: 'Ads, posts, product copy', hint_ar: 'الإعلانات والمنشورات ونصوص المنتجات',
    rule: 'Energetic marketing register: short punchy sentences, direct address to the reader, vivid verbs, headline-friendly; persuasive but every claim stays faithful to the source.',
  },
  literary: {
    en: 'Literary — poetry and prose', ar: 'أدبي — شعر ونثر فني',
    hint_en: 'Verse, stories, lyrical prose', hint_ar: 'الشعر والقصص والنثر الشعري',
    rule: 'Literary register, as a published literary translator would write: every image, metaphor and symbol is carried across as an image, never explained, simplified or replaced by its plain meaning; keep the order of the images and the rhythm of the sentences; prefer one precise, evocative word to a safe paraphrase; keep the elevated or archaic diction where the source has it; keep ambiguity ambiguous; no clichés, no added connectors, no softening of grief, violence or desire. Fidelity comes first: never add an image, sound, colour, object or feeling the source lacks, and never drop the speaker, the tense, a verb or a clause — a beautiful line that says something else is a failed translation.',
  },
};

export const VARIETIES = {
  msa: { en: 'Modern Standard Arabic', ar: 'العربية الفصحى', rule: 'Use Modern Standard Arabic (الفصحى) with full grammatical agreement.' },
  msa_simple: { en: 'Simple Standard Arabic', ar: 'فصحى مبسّطة', rule: 'Use simple, modern Standard Arabic: short sentences, common words, easy to read for a general audience.' },
  levantine: { en: 'Levantine colloquial (experimental)', ar: 'عامية شامية (تجريبي)', rule: 'Use Levantine colloquial Arabic (Jordanian/Syrian/Lebanese/Palestinian) as spoken among friends.' },
  gulf: { en: 'Gulf colloquial (experimental)', ar: 'عامية خليجية (تجريبي)', rule: 'Use Gulf colloquial Arabic as spoken in Saudi Arabia, the UAE and Kuwait.' },
  egyptian: { en: 'Egyptian colloquial (experimental)', ar: 'عامية مصرية (تجريبي)', rule: 'Use Egyptian colloquial Arabic as spoken in Cairo.' },
};

export const ADDRESS = {
  auto: { en: 'Follow the register', ar: 'حسب النبرة', rule: '' },
  formal: { en: 'Formal address (vous / Sie / حضرتكم)', ar: 'مخاطبة رسمية (حضرتكم)', rule: 'Address the reader formally and respectfully (the polite or plural form of "you" where the language has one; titles and honorifics where customary).' },
  informal: { en: 'Informal address (tu / du / أنت)', ar: 'مخاطبة غير رسمية (أنت)', rule: 'Address the reader with the informal, familiar form of "you".' },
};

export const MODEL_TIERS = [
  { id: 'Qwen3.5-0.8B-q4f16_1-MLC', key: 'mini', download_gb: 0.6, gpu_gb: 1.7, ram_gb: 8,
    en: 'Mini', ar: 'مصغّر', note_en: 'Quick test on weak PCs. Translations are rough.', note_ar: 'للتجربة السريعة على الأجهزة الضعيفة. الترجمة تقريبية.' },
  { id: 'Qwen3.5-2B-q4f16_1-MLC', key: 'light', download_gb: 1.1, gpu_gb: 2.3, ram_gb: 8,
    en: 'Light', ar: 'خفيف', note_en: 'Runs on integrated graphics. Good for everyday text.', note_ar: 'يعمل على بطاقات الرسوم المدمجة. مناسب للنصوص اليومية.' },
  { id: 'Qwen3.5-4B-q4f16_1-MLC', key: 'standard', download_gb: 2.4, gpu_gb: 3.9, ram_gb: 16, recommended: true,
    en: 'Standard', ar: 'قياسي', note_en: 'Best balance of quality and speed. Recommended.', note_ar: 'أفضل توازن بين الجودة والسرعة. موصى به.' },
  { id: 'Qwen3.5-9B-q4f16_1-MLC', key: 'pro', download_gb: 5.0, gpu_gb: 6.5, ram_gb: 16,
    en: 'Pro', ar: 'احترافي', note_en: 'Highest quality for idioms and dialects. Needs a dedicated GPU.', note_ar: 'أعلى جودة للتعابير واللهجات. يحتاج بطاقة رسوم مستقلة.' },
];

export function languageByCode(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

export function isRtl(code) {
  return !!languageByCode(code).rtl;
}

/* ---------- Style card → prompts ---------- */

function glossaryLines(glossary) {
  const items = (glossary || []).filter((g) => g && g.term && g.term.trim());
  if (!items.length) return '';
  const lines = items.map((g) => {
    const term = g.term.trim();
    const rendering = (g.rendering || '').trim();
    return rendering && rendering.toUpperCase() !== 'KEEP'
      ? `"${term}" → "${rendering}"`
      : `"${term}" → keep exactly as written, do not translate or transliterate`;
  });
  return 'Glossary — apply these renderings exactly and consistently:\n' + lines.join('\n');
}

export function buildSystemPrompt(card, opts = {}) {
  const src = languageByCode(card.source);
  const tgt = languageByCode(card.target);
  const register = REGISTERS[card.register] || REGISTERS.neutral;
  const same = card.source !== 'auto' && card.source === card.target;
  const parts = [];
  parts.push('You are a professional translator and editor.');
  if (same) {
    parts.push(`Task: rewrite the text the user sends, in ${tgt.name}, changing only its tone and register. Keep the meaning identical.`);
  } else if (card.source === 'auto') {
    parts.push(`Task: translate the text the user sends into ${tgt.name}. The text may be in any language; detect it. The whole output must be in ${tgt.name}.`);
  } else {
    parts.push(`Task: translate the text the user sends from ${src.name} into ${tgt.name}. The whole output must be in ${tgt.name}.`);
  }
  parts.push(`Register: ${register.rule}`);
  const address = ADDRESS[card.address] || ADDRESS.auto;
  if (address.rule) parts.push(address.rule);
  if (card.target === 'ar') {
    const variety = VARIETIES[card.variety] || VARIETIES.msa;
    parts.push(variety.rule);
  }
  if (card.register === 'literary') {
    parts.push('Idioms and proverbs: use the closest idiom of the target language if one exists, otherwise translate the image itself. Fixed expressions built on a colour, a body part or an everyday object (a "yellow smile", a "white hand", a "black heart") are idioms, not images: render what they mean (a wan, forced smile; a generous deed; a cruel heart), never the colour or the object. Wordplay and paronomasia: keep the play if the target language allows it; if not, keep the dominant meaning and the sound-pattern where possible. Phrases that quote or echo scripture, hadith, classical poetry or a proverb carry a fixed meaning (wringing one\'s hands in regret, cooking stones for the hungry = feeding false hope): render that meaning, or keep the image only when it still says the same thing to the target reader. Transliterate only real proper names of people, places and brands; never turn ordinary words into an invented name, and never drop a noun that names or judges a person (the traitor, the liar, the beloved).');
    if (opts.verse) parts.push('The text is verse. Output exactly the same number of lines in the same order; never merge or split lines; keep hemistich separators and the punctuation of the source; do not add punctuation the source lacks.');
  } else {
    parts.push('Idioms, metaphors, proverbs and wordplay: render their meaning the way a native writer would say it; never translate them word for word.');
  }
  parts.push(card.localize
    ? `Cultural references (sports, food, holidays, institutions): replace them with equivalents familiar to ${tgt.name} readers when a literal reference would confuse them.`
    : 'Cultural references: keep them, and make them understandable in context without adding commentary.');
  parts.push('Keep every fact, number, date, name, URL, email address and the order of ideas unchanged. Do not add, omit, shorten or summarize anything.');
  parts.push('Keep the formatting exactly: line breaks, bullet markers, numbering, Markdown symbols, and placeholders such as {name}, %s or <tag>.');
  const gl = glossaryLines(card.glossary);
  if (gl) parts.push(gl);
  if (card.audience && card.audience.trim()) parts.push(`Audience and purpose: ${card.audience.trim()}`);
  parts.push(`Output only the ${tgt.name} text. No explanations, no quotation marks around the text, no labels such as "Translation:".`);
  return parts.join('\n');
}

export function buildTranslateMessages(card, text) {
  return [
    { role: 'system', content: buildSystemPrompt(card, { verse: looksLikeVerse(text) }) },
    { role: 'user', content: text },
  ];
}

export function buildBatchMessages(card, segments) {
  const numbered = segments.map((s, i) => `${i + 1}) ${s}`).join('\n');
  const relation = card.register === 'literary'
    ? 'The segments are consecutive lines of one text: let the sense run across them, but'
    : 'Treat each segment independently,';
  const system = buildSystemPrompt(card, { verse: card.register === 'literary' && segments.some(looksLikeVerse) })
    + `\nThe user sends ${segments.length} numbered segments. ${relation} output the same numbers in the same order, exactly one segment per line, in the form "1) text". Never merge, drop or renumber segments.`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: numbered },
  ];
}

export function buildExplainMessages(card, sourceText, translatedText, notesLang) {
  const tgt = languageByCode(card.target);
  const notes = notesLang === 'ar' ? 'Arabic' : 'English';
  const system = [
    'You are a translation reviewer and a philologist.',
    `The user gives a source paragraph and its translation into ${tgt.name}.`,
    'Find the idioms, metaphors, proverbs, allusions, culturally specific references and wordplay in the source paragraph.',
    'Wordplay includes paronomasia (jinās: words that look or sound alike with different meanings), double meanings (tawriya), puns and deliberate repetition of a root.',
    'For an allusion to scripture, hadith, classical poetry, a proverb or a well-known story, name the source in the note.',
    'For each finding write exactly one line in this form:',
    'original expression — literal meaning — how the translation renders it — one short note on the cultural or rhetorical context.',
    'For wordplay, the "literal meaning" part lists every distinct meaning of the repeated or look-alike words, and the note says what the translation kept and what no translation could keep.',
    `Write the notes in ${notes}. Keep the original expression in its own language.`,
    'Output only those lines. If there are none, reply with the single word NONE.',
  ].join('\n');
  const user = `Source:\n${sourceText}\n\nTranslation:\n${translatedText}`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export function buildPolishMessages(card, sourceText, draft) {
  const tgt = languageByCode(card.target);
  const register = REGISTERS[card.register] || REGISTERS.neutral;
  const system = [
    `You are a senior literary translator and editor revising a colleague's draft translation into ${tgt.name}.`,
    'The user gives the source text and the draft.',
    'Revise the draft so that it reads as if written by a native author in the target language while matching the source image for image and sentence for sentence.',
    `Register: ${register.rule}`,
    'Fix every place where the draft is literal, clumsy, over-explained, or loses an image, a nuance, a rhythm or an ambiguity of the source. Keep what is already good.',
    'Keep every fact, name, number and the line and paragraph structure unchanged.',
    `Output only the revised ${tgt.name} text, nothing else.`,
  ].join('\n');
  const user = `Source:\n${sourceText}\n\nDraft:\n${draft}`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export function buildCheckMessages(card, sourceText, translation, notesLang) {
  const tgt = languageByCode(card.target);
  const notes = notesLang === 'ar' ? 'Arabic' : 'English';
  const system = [
    'You are a strict translation quality checker.',
    `The user gives a source paragraph and its translation into ${tgt.name}. Compare them element by element: the speaker or person, the tense, every verb, every noun, every image, negations, quantities, and each clause.`,
    'Report only real problems, one per line, in exactly one of these forms:',
    'MISSING: <element of the source that the translation leaves out>',
    'ADDED: <element of the translation that has no basis in the source>',
    'CHANGED: <source element> → <what the translation turned it into>',
    'A common noun or phrase turned into a transliterated proper name counts as ADDED, and the words it replaced count as MISSING. A scriptural, classical or proverbial allusion rendered with the wrong sense counts as CHANGED. An idiom or fixed expression translated word for word so that it says something different in the target language (a colour, body-part or object idiom taken literally) counts as CHANGED. A verb replaced by a weaker or more generic one that loses the image (sip → swallow, shackled → constricted) counts as CHANGED.',
    `Quote the elements in their own language and write any short comment in ${notes}. Ignore word order, synonyms and stylistic choices that keep the meaning.`,
    'If the translation is faithful, reply with the single word OK.',
  ].join('\n');
  const user = `Source:\n${sourceText}\n\nTranslation:\n${translation}`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export function parseCheck(output) {
  const text = stripThinking(output).trim();
  const result = { missing: [], added: [], changed: [], other: [] };
  if (!text || /^ok[.!]?$/i.test(text) || /^(لا (يوجد|توجد)|سليمة|مطابقة)/.test(text)) return result;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/^\s*[-*•\d.)]+\s*/, '').trim();
    if (!line || /^ok[.!]?$/i.test(line)) continue;
    const m = line.match(/^\**\s*(missing|added|changed|ناقص|زائد|تغيّر|تغير)\s*\**\s*[:：]\s*(.+)$/i);
    if (!m) { result.other.push(line); continue; }
    const kind = m[1].toLowerCase();
    const body = m[2].trim();
    if (kind === 'missing' || kind === 'ناقص') result.missing.push(body);
    else if (kind === 'added' || kind === 'زائد') result.added.push(body);
    else result.changed.push(body);
  }
  return result;
}

export function hasIssues(check) {
  return !!(check && (check.missing.length || check.added.length || check.changed.length || check.other.length));
}

export function buildRepairMessages(card, sourceText, draft, check) {
  const tgt = languageByCode(card.target);
  const lines = [];
  check.missing.forEach((x) => lines.push(`MISSING from the draft: ${x}`));
  check.added.forEach((x) => lines.push(`ADDED by the draft without basis in the source: ${x}`));
  check.changed.forEach((x) => lines.push(`CHANGED meaning: ${x}`));
  check.other.forEach((x) => lines.push(`NOTE: ${x}`));
  const system = buildSystemPrompt(card, { verse: looksLikeVerse(sourceText) })
    + '\nA reviewer compared a draft translation with the source and found these problems:\n' + lines.join('\n')
    + `\nProduce a corrected ${tgt.name} translation that fixes every listed problem — restore what is missing, remove what was added, correct what was changed — and keeps everything else of the draft that was right. Output only the corrected translation.`;
  const user = `Source:\n${sourceText}\n\nDraft:\n${draft}`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export function buildGlossaryMessages(card, sampleText) {
  const tgt = languageByCode(card.target);
  const system = [
    'You are a terminologist preparing a translation.',
    `From the text the user sends, list up to 15 proper nouns, company and product names, titles, abbreviations and technical terms whose rendering must stay consistent in a ${tgt.name} translation.`,
    'One per line in the form: term — rendering',
    'Write KEEP as the rendering for names that should stay in their original script.',
    'Output only those lines, nothing else. If there are none, reply with the single word NONE.',
  ].join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: sampleText },
  ];
}

/* ---------- Model output clean-up ---------- */

export function stripThinking(text) {
  if (!text) return '';
  let out = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  out = out.replace(/^[\s\S]*?<\/think>/i, '');
  out = out.replace(/<think>[\s\S]*$/i, '');
  return out;
}

const LABEL_RE = /^\s*(translation|translated text|rewritten text|output|الترجمة|النص المترجم|النص)\s*[:：]\s*/i;

export function cleanTranslation(output, source) {
  let out = stripThinking(output).trim();
  out = out.replace(LABEL_RE, '');
  const src = (source || '').trim();
  const wrapped = (s, a, b) => s.length > 1 && s.startsWith(a) && s.endsWith(b);
  const pairs = [['"', '"'], ['“', '”'], ['«', '»'], ['„', '“'], ["'", "'"]];
  for (const [a, b] of pairs) {
    if (wrapped(out, a, b) && !wrapped(src, a, b)) {
      out = out.slice(1, -1).trim();
      break;
    }
  }
  return out;
}

export function parseNoteLines(output) {
  const text = stripThinking(output).trim();
  if (!text || /^none[.!]?$/i.test(text) || /^لا (يوجد|توجد)/.test(text)) return [];
  return text
    .split('\n')
    .map((l) => l.replace(/^\s*[-*•\d.)]+\s*/, '').trim())
    .filter((l) => l && !/^none$/i.test(l));
}

export function parseGlossaryLines(output) {
  return parseNoteLines(output)
    .map((line) => {
      const m = line.match(/^(.+?)\s*(?:—|–|->|→|:)\s*(.+)$/);
      if (!m) return null;
      const term = m[1].replace(/^["“'«]|["”'»]$/g, '').trim();
      const rendering = m[2].replace(/^["“'«]|["”'»]$/g, '').trim();
      if (!term) return null;
      return { term, rendering: /^keep$/i.test(rendering) ? '' : rendering };
    })
    .filter(Boolean);
}

/* ---------- Segmentation ---------- */

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const EXTENDED_INDIC = '۰۱۲۳۴۵۶۷۸۹';

export function asciiDigits(str) {
  return str.replace(/[٠-٩۰-۹]/g, (d) => {
    const i = ARABIC_INDIC.indexOf(d);
    return String(i >= 0 ? i : EXTENDED_INDIC.indexOf(d));
  });
}

const SENTENCE_END = /(?<=[.!?؟。！？])\s+/u;

function splitLong(text, maxChars) {
  if (text.length <= maxChars) return [{ text, joiner: '' }];
  if (text.includes('\n')) {
    const lines = text.split('\n');
    const parts = [];
    let buf = '';
    for (const line of lines) {
      const candidate = buf ? buf + '\n' + line : line;
      if (candidate.length > maxChars && buf) {
        parts.push(buf);
        buf = line;
      } else {
        buf = candidate;
      }
    }
    if (buf) parts.push(buf);
    return parts.flatMap((p) => splitLong(p, maxChars)).map((p) => ({ text: p.text, joiner: '\n' }));
  }
  const sentences = text.split(SENTENCE_END);
  const parts = [];
  let buf = '';
  for (const s of sentences) {
    const candidate = buf ? buf + ' ' + s : s;
    if (candidate.length > maxChars && buf) {
      parts.push(buf);
      buf = s;
    } else {
      buf = candidate;
    }
  }
  if (buf) parts.push(buf);
  const out = [];
  for (const p of parts) {
    if (p.length <= maxChars) {
      out.push({ text: p, joiner: ' ' });
    } else {
      const words = p.split(' ');
      let w = '';
      for (const word of words) {
        const candidate = w ? w + ' ' + word : word;
        if (candidate.length > maxChars && w) {
          out.push({ text: w, joiner: ' ' });
          w = word;
        } else {
          w = candidate;
        }
      }
      if (w) out.push({ text: w, joiner: ' ' });
    }
  }
  return out;
}

/** Split a document into translatable segments that can be re-assembled.
 *  Blocks are separated by blank lines; a long block is split further and
 *  re-joined with its joiner. Returns { blocks, segments }. */
export function segmentize(text, options = {}) {
  const maxChars = options.maxChars || 1400;
  const normalized = (text || '').replace(/\r\n?/g, '\n');
  const rawBlocks = normalized.split(/\n[ \t]*\n+/);
  const blocks = [];
  const segments = [];
  rawBlocks.forEach((raw) => {
    const block = raw.replace(/^\n+|\n+$/g, '');
    if (!block.trim()) return;
    const blockIndex = blocks.length;
    const parts = splitLong(block, maxChars);
    blocks.push({ text: block, joiner: parts.length > 1 ? parts[0].joiner : '', segmentIds: [] });
    parts.forEach((p, partIndex) => {
      const id = segments.length;
      segments.push({ id, blockIndex, partIndex, text: p.text });
      blocks[blockIndex].segmentIds.push(id);
    });
  });
  return { blocks, segments };
}

/** Group short, single-line segments into batched requests. */
export function planRequests(segments, options = {}) {
  const shortLimit = options.shortLimit || 220;
  const batchMaxChars = options.batchMaxChars || 900;
  const batchMaxItems = options.batchMaxItems || 10;
  const requests = [];
  let batch = [];
  let batchChars = 0;
  const flush = () => {
    if (batch.length === 1) requests.push({ kind: 'single', segment: batch[0] });
    else if (batch.length > 1) requests.push({ kind: 'batch', segments: batch });
    batch = [];
    batchChars = 0;
  };
  for (const seg of segments) {
    const batchable = seg.text.length <= shortLimit && !seg.text.includes('\n');
    if (!batchable) {
      flush();
      requests.push({ kind: 'single', segment: seg });
      continue;
    }
    if (batch.length && (batchChars + seg.text.length > batchMaxChars || batch.length >= batchMaxItems)) flush();
    batch.push(seg);
    batchChars += seg.text.length;
  }
  flush();
  return requests;
}

/** Parse "1) ..." lines back into an array of `count` strings, or null. */
export function parseNumbered(output, count) {
  const text = stripThinking(output);
  const map = new Map();
  let current = null;
  for (const rawLine of text.split('\n')) {
    const line = asciiDigits(rawLine.slice(0, 6)) + rawLine.slice(6);
    const m = line.match(/^\s*(\d{1,3})\s*[)\].:：\-–]\s*(.*)$/);
    if (m) {
      current = Number(m[1]);
      map.set(current, m[2].trim());
    } else if (current !== null && line.trim()) {
      map.set(current, (map.get(current) + ' ' + line.trim()).trim());
    }
  }
  if (map.size !== count) return null;
  const result = [];
  for (let i = 1; i <= count; i++) {
    if (!map.has(i)) return null;
    result.push(map.get(i));
  }
  return result;
}

/** Re-assemble translated segments into the document text. */
export function assemble(blocks, segments, translations) {
  return blocks
    .map((block) => {
      const parts = block.segmentIds.map((id) => {
        const t = translations[id];
        return t === undefined || t === null ? segments[id].text : t;
      });
      return parts.join(block.joiner || ' ');
    })
    .join('\n\n');
}

/* ---------- Subtitles (.srt) ---------- */

export function parseSrt(text) {
  const normalized = (text || '').replace(/\r\n?/g, '\n').replace(/^﻿/, '');
  const cues = [];
  for (const chunk of normalized.split(/\n\n+/)) {
    const lines = chunk.split('\n').filter((l, i, arr) => !(i === arr.length - 1 && !l.trim()));
    if (lines.length < 2) continue;
    let i = 0;
    let id = '';
    if (/^\d+$/.test(lines[0].trim())) {
      id = lines[0].trim();
      i = 1;
    }
    const time = lines[i] || '';
    if (!/-->/.test(time)) continue;
    cues.push({ id, time: time.trim(), text: lines.slice(i + 1).join('\n') });
  }
  return cues;
}

export function serializeSrt(cues) {
  return cues
    .map((c, i) => `${c.id || i + 1}\n${c.time}\n${c.text}`)
    .join('\n\n') + '\n';
}

/* ---------- PDF text lines → paragraphs ---------- */

/** lines: [{ text, y, height }] in reading order (top to bottom). */
export function linesToParagraphs(lines) {
  const paragraphs = [];
  let buf = '';
  let prev = null;
  const endsSentence = (s) => /[.!?؟:;。！？»”"]\s*$/.test(s);
  const startsNew = (s) => /^\s*([A-ZÀ-ÝА-Я؀-ۿ0-9•\-–—*]|\d+[.)])/.test(s);
  const gaps = [];
  let last = null;
  for (const line of lines) {
    if (!(line.text || '').trim()) continue;
    if (last) gaps.push(Math.abs(line.y - last.y));
    last = line;
  }
  gaps.sort((a, b) => a - b);
  const medianGap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0;
  for (const line of lines) {
    const text = (line.text || '').replace(/\s+/g, ' ').trim();
    if (!text) {
      if (buf) paragraphs.push(buf);
      buf = '';
      prev = null;
      continue;
    }
    let newPara = !buf;
    if (buf && prev) {
      const gap = Math.abs(line.y - prev.y);
      const pitch = medianGap || Math.max(line.height || 0, prev.height || 0, 1) * 1.2;
      if (gap > pitch * 1.5) newPara = true;
      else if (endsSentence(buf) && startsNew(text) && gap > pitch * 1.2) newPara = true;
    }
    if (newPara) {
      if (buf) paragraphs.push(buf);
      buf = text;
    } else if (/[A-Za-z]-$/.test(buf)) {
      buf = buf.slice(0, -1) + text;
    } else {
      buf = buf + ' ' + text;
    }
    prev = line;
  }
  if (buf) paragraphs.push(buf);
  return paragraphs;
}

/* ---------- Small utilities ---------- */

/** Remove Arabic diacritics (harakat, tanwin, shadda, sukun, superscript alef, Quranic marks) and tatweel.
 *  The letters are untouched, so the text stays readable and tokenizes far more compactly. */
export function stripTashkeel(text) {
  return (text || '').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0640]/g, '');
}

/** Text to send to the engine. Diacritics are dropped to save tokens — unless dropping them
 *  makes words collapse into each other (jinās: أَلَمٌ أَلَمَّ أَلَمْ أُلِمَّ), where the vocalization
 *  is the only thing that tells the meanings apart, so the original is kept. */
export function prepareForModel(text) {
  const stripped = stripTashkeel(text);
  if (stripped === text) return text;
  const words = (s) => s.split(/[\s،,.;:؛!?؟()«»"'…]+/).filter((w) => w.length > 1);
  const dupes = (ws) => {
    const seen = new Set();
    let d = 0;
    for (const w of ws) {
      if (seen.has(w)) d++;
      else seen.add(w);
    }
    return d;
  };
  return dupes(words(stripped)) > dupes(words(text)) ? text : stripped;
}

/** Heuristic: several short lines, or classical hemistichs marked with "…"/"...", read as verse. */
export function looksLikeVerse(text) {
  const lines = (text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return false;
  const avg = lines.reduce((n, l) => n + l.length, 0) / lines.length;
  if (lines.length >= 3 && avg <= 70) return true;
  if (lines.length >= 2 && lines.every((l) => /(\.{3}|…|\s{3,}|\*{2,})/.test(l))) return true;
  return lines.length === 1 && /(\.{3}|…)\s*\S/.test(lines[0]) && lines[0].length <= 160;
}

export function countWords(text) {
  const t = (text || '').trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function detectScript(text) {
  const t = text || '';
  const counts = { arabic: 0, hebrew: 0, cjk: 0, latin: 0, cyrillic: 0, greek: 0 };
  for (const ch of t) {
    const c = ch.codePointAt(0);
    if (c >= 0x0600 && c <= 0x06ff) counts.arabic++;
    else if (c >= 0x0590 && c <= 0x05ff) counts.hebrew++;
    else if ((c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3040 && c <= 0x30ff) || (c >= 0xac00 && c <= 0xd7af)) counts.cjk++;
    else if (c >= 0x0400 && c <= 0x04ff) counts.cyrillic++;
    else if (c >= 0x0370 && c <= 0x03ff) counts.greek++;
    else if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0xc0 && c <= 0x024f)) counts.latin++;
  }
  let best = 'latin';
  let max = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  return best;
}

export function textDirection(text) {
  const script = detectScript(text);
  return script === 'arabic' || script === 'hebrew' ? 'rtl' : 'ltr';
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function tmKey(card, text) {
  const glossary = (card.glossary || [])
    .map((g) => `${(g.term || '').trim().toLowerCase()}=${(g.rendering || '').trim()}`)
    .filter((g) => g !== '=')
    .sort()
    .join('|');
  const parts = [
    card.source, card.target, card.register,
    card.target === 'ar' ? card.variety : '',
    card.address || 'auto', card.localize ? 'L' : '',
    glossary, (card.audience || '').trim(),
    (text || '').trim(),
  ];
  const s = parts.join('\u0001');
  return hashString(s) + '-' + s.length.toString(36);
}

/** Chromium caps navigator.deviceMemory at 8, so "8" only means "8 or more". */
export function recommendTier(deviceMemoryGb, gpuVendor) {
  const mem = deviceMemoryGb || 0;
  if (mem && mem <= 4) return 'mini';
  if (mem && mem < 8) return 'light';
  const vendor = (gpuVendor || '').toLowerCase();
  if (vendor.includes('nvidia') || vendor.includes('amd')) return 'standard';
  return 'standard';
}
