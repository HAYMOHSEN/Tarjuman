/* Tarjuman — application logic. The model engine (WebLLM) runs in llm-worker.js;
   text shaping lives in core.js; Word files in docx.js. */

import * as webllm from './vendor/web-llm.js';
import * as core from './core.js';
import * as docxlib from './docx.js';
import * as xlsxlib from './xlsx.js';
import * as ocr from './ocr.js';

const APP_VERSION = '1.4.0';

/* ---------- Interface strings ---------- */

const STRINGS = {
  en: {
    'tagline': 'Private translator. Nothing leaves this PC.',
    'engine.none': 'Set up the engine',
    'engine.loading': 'Loading engine',
    'engine.ready': 'On this PC',
    'engine.error': 'Engine failed',
    'engine.sleeping': 'Engine released — click to wake',
    'engine.waking': 'Waking the engine…',
    'settings': 'Settings',
    'from': 'From',
    'to': 'To',
    'register': 'Tone and register',
    'variety': 'Arabic variety',
    'address': 'Addressing the reader',
    'audience': 'Audience and purpose (optional)',
    'audience.ph': "e.g. Email to a bank's compliance team",
    'localize': 'Localize cultural references',
    'glossary': 'Glossary — one term per line',
    'glossary.ph': 'Tarjuman = keep\nboard of directors = مجلس الإدارة',
    'glossary.suggest': 'Suggest terms from the text',
    'translate': 'Translate',
    'rewrite': 'Rewrite the tone',
    'stop': 'Stop',
    'run.hint': 'Ctrl+Enter also starts the translation.',
    'open': 'Open file…',
    'clear': 'Remove file',
    'edit': 'Edit source',
    'copy.all': 'Copy result',
    'download': 'Download',
    'source.ph': 'Paste text here, or open a .docx, .pdf, .txt, .md or .srt file. Then pick the tone on the left and press Translate.',
    'col.source': 'Source',
    'col.result': 'Result',
    'status.idle': 'Ready.',
    'setup.title': 'Choose the translation engine',
    'setup.intro': "The engine is an AI language model that runs on this PC's graphics chip. It is downloaded once and never sends your text anywhere.",
    'setup.nogpu': 'This PC does not expose WebGPU, so the engine cannot run here. Update Windows and the graphics driver, or try another PC.',
    'setup.go': 'Download and start',
    'setup.start': 'Start',
    'later': 'Later',
    'settings.engine': 'Engine',
    'settings.change': 'Change engine…',
    'settings.delete': 'Delete downloaded engine',
    'settings.notes': 'Language of idiom notes',
    'settings.memory': 'Translation memory',
    'settings.memory.hint': 'Sentences you have already translated are reused instantly in later documents. Stored on this PC only.',
    'settings.memory.clear': 'Clear memory',
    'about': 'About',
    'close': 'Close',
    'cancel': 'Cancel',
    'ok': 'OK',
    'sys.gpu': 'Graphics',
    'sys.gpu.ok': 'WebGPU available',
    'sys.gpu.none': 'WebGPU not available',
    'sys.memory': 'Memory',
    'sys.memory.more': '8 GB or more',
    'sys.memory.unknown': 'unknown',
    'tier.download': 'download',
    'tier.gpu': 'graphics memory',
    'tier.cached': 'Downloaded',
    'tier.recommended': 'Recommended',
    'status.loading': 'Loading engine… {pct}%',
    'status.translating': 'Translating {done} of {total} paragraphs',
    'status.done': 'Done — {n} paragraphs in {s} s',
    'status.stopped': 'Stopped after {n} paragraphs.',
    'status.words': '{n} words/s',
    'row.redo': 'Redo',
    'row.explain': 'Explain idioms',
    'row.copy': 'Copy',
    'row.polish': 'Polish',
    'row.check': 'Check fidelity',
    'status.checking': 'Checking fidelity — paragraph {n} of {total}',
    'status.checked': 'Done — {n} paragraphs checked, {r} repaired, {f} still flagged',
    'fidelity.ok': 'Faithful to the source.',
    'fidelity.repaired': 'Repaired automatically. Remaining notes:',
    'fidelity.repaired.ok': 'Repaired automatically — now faithful to the source.',
    'fidelity.found': 'Fidelity check:',
    'fidelity.missing': 'Missing',
    'fidelity.added': 'Added',
    'fidelity.changed': 'Changed',
    'fidelity.note': 'Note',
    'settings.autocheck': 'After translating in the literary register, check fidelity and repair automatically',
    'settings.autocheck.hint': 'Two extra passes per paragraph: a reviewer lists what is missing, added or changed, then the translation is corrected. Slower, much safer for poetry and prose.',
    'status.polishing': 'Polishing paragraph {n}…',
    'settings.lowmem': 'Low-memory mode',
    'settings.lowmem.hint': 'Uses a shorter context window (3072 instead of 4096 tokens) and smaller chunks: less graphics memory, same engine, same quality. Takes effect the next time the engine loads.',
    'settings.idle': 'Release graphics memory after 10 minutes of inactivity',
    'settings.idle.hint': 'Frees the GPU for other programs; the engine reloads from disk in a few seconds when you translate again.',
    'notes.none': 'No idioms or cultural references found in this paragraph.',
    'notes.working': 'Reviewing idioms…',
    'file.loaded': '{name}: {n} paragraphs',
    'file.docx.note': 'Paragraph styles are kept. Headers, footers and footnotes are not translated.',
    'file.pdf.note': 'Text extracted from the PDF. You can tidy it before translating.',
    'file.srt.note': 'Subtitle timing is kept; only the text is translated.',
    'file.xlsx.note': 'Cells with text are translated; numbers, dates and formulas are kept.',
    'file.csv.note': 'Cells with text are translated; numbers are kept.',
    'file.ocr.note': 'Text recognized by OCR — check it before translating; recognition errors become translation errors.',
    'file.nothing': 'No translatable text was found in this file.',
    'ocr.title': 'Scanned document',
    'ocr.body': 'This file has no text layer. Recognize the text on this PC with OCR? It takes a few seconds per page. Recognition languages: {langs}.',
    'ocr.online': 'The OCR data for this language is not bundled with the app; it is downloaded once (internet needed).',
    'ocr.go': 'Recognize text',
    'ocr.loading': 'Preparing OCR… {what}',
    'status.ocr': 'Recognizing text — page {n} of {total}',
    'status.rendering': 'Rendering page {n} of {total}',
    'dl.xlsx': 'Excel (.xlsx)',
    'dl.csv': 'CSV (.csv)',
    'engine.menu.more': 'Download or change engine…',
    'engine.menu.current': 'current',
    'tier.delete': 'Delete',
    'confirm.tier.title': 'Delete this engine from the PC?',
    'confirm.tier.body': '{tier} will be removed from disk. You can download it again later.',
    'literary.warn': 'The literary register needs the Standard engine or better; the current engine is {tier}.',
    'file.error': 'Could not read this file.',
    'file.pdf.empty': 'This PDF has no text layer (it is scanned). Open it again and choose "Recognize text" to read it with OCR.',
    'file.locked': 'Remove the file to edit the text freely.',
    'words': '{n} words',
    'engine.needed': 'Set up the engine first.',
    'engine.busy': 'Wait for the current translation to finish or stop it.',
    'source.empty': 'There is nothing to translate yet.',
    'confirm.delete.title': 'Delete the downloaded engine?',
    'confirm.delete.body': 'The model files will be removed from this PC. You can download them again later.',
    'confirm.clear.title': 'Clear the translation memory?',
    'confirm.clear.body': 'Stored sentence translations will be deleted.',
    'confirm.edit.title': 'Edit the source?',
    'confirm.edit.body': 'The current result will be cleared.',
    'copied': 'Copied.',
    'dl.txt': 'Plain text (.txt)',
    'dl.md': 'Markdown (.md)',
    'dl.docx': 'Word (.docx)',
    'dl.srt': 'Subtitles (.srt)',
    'export.mismatch': 'The document structure changed, so the Word file cannot be rebuilt. Download as text instead.',
    'error.generic': 'Something went wrong: {msg}',
    'error.memory': 'This engine does not fit in this PC\'s graphics memory. Choose a lighter engine.',
    'about.text': 'Tarjuman {v}. Runs the open language model on your PC with WebLLM (Apache 2.0). Word and Excel files via JSZip; PDFs via pdf.js; OCR via Tesseract.js.',
    'tm.hit': 'from memory',
  },
  ar: {
    'tagline': 'مترجم خاص. لا شيء يغادر هذا الجهاز.',
    'engine.none': 'جهّز المحرّك',
    'engine.loading': 'جارٍ تحميل المحرّك',
    'engine.ready': 'على هذا الجهاز',
    'engine.error': 'تعذّر تشغيل المحرّك',
    'engine.sleeping': 'المحرّك في وضع الراحة — انقر لإيقاظه',
    'engine.waking': 'جارٍ إيقاظ المحرّك…',
    'settings': 'الإعدادات',
    'from': 'من',
    'to': 'إلى',
    'register': 'النبرة والأسلوب',
    'variety': 'نوع العربية',
    'address': 'مخاطبة القارئ',
    'audience': 'الجمهور والغرض (اختياري)',
    'audience.ph': 'مثال: رسالة إلى قسم الامتثال في بنك',
    'localize': 'توطين الإشارات الثقافية',
    'glossary': 'المسرد — مصطلح في كل سطر',
    'glossary.ph': 'Tarjuman = keep\nboard of directors = مجلس الإدارة',
    'glossary.suggest': 'اقتراح مصطلحات من النص',
    'translate': 'ترجم',
    'rewrite': 'أعد صياغة النبرة',
    'stop': 'إيقاف',
    'run.hint': 'يمكنك أيضاً الضغط على Ctrl+Enter لبدء الترجمة.',
    'open': 'فتح ملف…',
    'clear': 'إزالة الملف',
    'edit': 'تعديل النص',
    'copy.all': 'نسخ النتيجة',
    'download': 'تنزيل',
    'source.ph': 'ألصق النص هنا، أو افتح ملف ‎.docx أو ‎.pdf أو ‎.txt أو ‎.md أو ‎.srt. ثم اختر النبرة من اللوحة الجانبية واضغط «ترجم».',
    'col.source': 'النص الأصلي',
    'col.result': 'الترجمة',
    'status.idle': 'جاهز.',
    'setup.title': 'اختر محرّك الترجمة',
    'setup.intro': 'المحرّك نموذج ذكاء اصطناعي يعمل على بطاقة الرسوم في هذا الجهاز. يُنزَّل مرة واحدة ولا يرسل نصوصك إلى أي مكان.',
    'setup.nogpu': 'هذا الجهاز لا يوفّر WebGPU، لذا لا يمكن تشغيل المحرّك هنا. حدّث ويندوز وتعريف بطاقة الرسوم، أو جرّب جهازاً آخر.',
    'setup.go': 'تنزيل وتشغيل',
    'setup.start': 'تشغيل',
    'later': 'لاحقاً',
    'settings.engine': 'المحرّك',
    'settings.change': 'تغيير المحرّك…',
    'settings.delete': 'حذف المحرّك المنزَّل',
    'settings.notes': 'لغة ملاحظات التعابير',
    'settings.memory': 'ذاكرة الترجمة',
    'settings.memory.hint': 'الجمل التي ترجمتها سابقاً تُعاد فوراً في المستندات اللاحقة. تُحفظ على هذا الجهاز فقط.',
    'settings.memory.clear': 'مسح الذاكرة',
    'about': 'حول التطبيق',
    'close': 'إغلاق',
    'cancel': 'إلغاء',
    'ok': 'موافق',
    'sys.gpu': 'بطاقة الرسوم',
    'sys.gpu.ok': 'WebGPU متوفر',
    'sys.gpu.none': 'WebGPU غير متوفر',
    'sys.memory': 'الذاكرة',
    'sys.memory.more': '8 غيغابايت أو أكثر',
    'sys.memory.unknown': 'غير معروفة',
    'tier.download': 'تنزيل',
    'tier.gpu': 'ذاكرة رسوم',
    'tier.cached': 'منزَّل',
    'tier.recommended': 'موصى به',
    'status.loading': 'جارٍ تحميل المحرّك… {pct}%',
    'status.translating': 'جارٍ ترجمة {done} من {total} فقرة',
    'status.done': 'اكتملت — {n} فقرة خلال {s} ثانية',
    'status.stopped': 'توقفت بعد {n} فقرة.',
    'status.words': '{n} كلمة/ث',
    'row.redo': 'إعادة',
    'row.explain': 'شرح التعابير',
    'row.copy': 'نسخ',
    'row.polish': 'صقل',
    'row.check': 'فحص الأمانة',
    'status.checking': 'جارٍ فحص الأمانة — الفقرة {n} من {total}',
    'status.checked': 'اكتملت — فُحصت {n} فقرة، أُصلحت {r}، وبقيت {f} عليها ملاحظات',
    'fidelity.ok': 'مطابقة للأصل.',
    'fidelity.repaired': 'أُصلحت تلقائياً. ملاحظات متبقية:',
    'fidelity.repaired.ok': 'أُصلحت تلقائياً — صارت مطابقة للأصل.',
    'fidelity.found': 'فحص الأمانة:',
    'fidelity.missing': 'ناقص',
    'fidelity.added': 'زائد',
    'fidelity.changed': 'تغيّر',
    'fidelity.note': 'ملاحظة',
    'settings.autocheck': 'بعد الترجمة بالنبرة الأدبية، افحص الأمانة وأصلح تلقائياً',
    'settings.autocheck.hint': 'مروران إضافيان لكل فقرة: مراجع يعدّ ما ضاع وما أُضيف وما تغيّر، ثم تُصحَّح الترجمة. أبطأ، وأكثر أماناً للشعر والنثر.',
    'status.polishing': 'جارٍ صقل الفقرة {n}…',
    'settings.lowmem': 'وضع الذاكرة المنخفضة',
    'settings.lowmem.hint': 'يستخدم نافذة سياق أقصر (3072 بدل 4096 رمزاً) ومقاطع أصغر: ذاكرة رسوم أقل، بالمحرّك نفسه والجودة نفسها. يسري عند تحميل المحرّك في المرة التالية.',
    'settings.idle': 'تحرير ذاكرة الرسوم بعد 10 دقائق من عدم الاستخدام',
    'settings.idle.hint': 'يحرّر بطاقة الرسوم للبرامج الأخرى؛ يُعاد تحميل المحرّك من القرص خلال ثوانٍ عند الترجمة مجدداً.',
    'notes.none': 'لا توجد تعابير اصطلاحية أو إشارات ثقافية في هذه الفقرة.',
    'notes.working': 'جارٍ مراجعة التعابير…',
    'file.loaded': '{name}: {n} فقرة',
    'file.docx.note': 'تُحفظ أنماط الفقرات. لا تُترجم الترويسات والتذييلات والحواشي.',
    'file.pdf.note': 'استُخرج النص من ملف PDF. يمكنك تنقيحه قبل الترجمة.',
    'file.srt.note': 'يُحفظ توقيت الترجمة؛ يُترجم النص فقط.',
    'file.xlsx.note': 'تُترجم الخلايا النصية؛ وتُحفظ الأرقام والتواريخ والمعادلات.',
    'file.csv.note': 'تُترجم الخلايا النصية؛ وتُحفظ الأرقام.',
    'file.ocr.note': 'النص مستخرج بالتعرّف الضوئي — راجعه قبل الترجمة؛ أخطاء التعرّف تصبح أخطاء ترجمة.',
    'file.nothing': 'لا يوجد نص قابل للترجمة في هذا الملف.',
    'ocr.title': 'مستند ممسوح ضوئياً',
    'ocr.body': 'هذا الملف بلا طبقة نصية. هل تريد التعرّف على النص داخل الجهاز (OCR)؟ يستغرق بضع ثوانٍ لكل صفحة. لغات التعرّف: {langs}.',
    'ocr.online': 'بيانات التعرّف لهذه اللغة غير مضمّنة في التطبيق؛ تُنزَّل مرة واحدة (يلزم اتصال بالإنترنت).',
    'ocr.go': 'تعرّف على النص',
    'ocr.loading': 'جارٍ تجهيز التعرّف الضوئي… {what}',
    'status.ocr': 'جارٍ التعرّف على النص — الصفحة {n} من {total}',
    'status.rendering': 'جارٍ تحضير الصفحة {n} من {total}',
    'dl.xlsx': 'إكسل (.xlsx)',
    'dl.csv': 'CSV (.csv)',
    'engine.menu.more': 'تنزيل محرّك أو تغييره…',
    'engine.menu.current': 'الحالي',
    'tier.delete': 'حذف',
    'confirm.tier.title': 'حذف هذا المحرّك من الجهاز؟',
    'confirm.tier.body': 'سيُحذف {tier} من القرص. يمكنك تنزيله لاحقاً.',
    'literary.warn': 'النبرة الأدبية تحتاج المحرّك القياسي أو أعلى؛ المحرّك الحالي هو {tier}.',
    'file.error': 'تعذّر قراءة هذا الملف.',
    'file.pdf.empty': 'ملف PDF هذا بلا طبقة نصية (ممسوح ضوئياً). افتحه مجدداً واختر «تعرّف على النص» لقراءته بالتعرّف الضوئي.',
    'file.locked': 'أزل الملف لتعديل النص بحرية.',
    'words': '{n} كلمة',
    'engine.needed': 'جهّز المحرّك أولاً.',
    'engine.busy': 'انتظر انتهاء الترجمة الحالية أو أوقفها.',
    'source.empty': 'لا يوجد نص للترجمة بعد.',
    'confirm.delete.title': 'حذف المحرّك المنزَّل؟',
    'confirm.delete.body': 'ستُحذف ملفات النموذج من هذا الجهاز. يمكنك تنزيلها لاحقاً.',
    'confirm.clear.title': 'مسح ذاكرة الترجمة؟',
    'confirm.clear.body': 'ستُحذف ترجمات الجمل المحفوظة.',
    'confirm.edit.title': 'تعديل النص الأصلي؟',
    'confirm.edit.body': 'ستُمسح النتيجة الحالية.',
    'copied': 'تم النسخ.',
    'dl.txt': 'نص عادي (.txt)',
    'dl.md': 'ماركداون (.md)',
    'dl.docx': 'وورد (.docx)',
    'dl.srt': 'ترجمة فيديو (.srt)',
    'export.mismatch': 'تغيّرت بنية المستند فتعذّر إعادة بناء ملف وورد. نزّله كنص بدلاً من ذلك.',
    'error.generic': 'حدث خطأ: {msg}',
    'error.memory': 'هذا المحرّك لا يتّسع في ذاكرة الرسوم في هذا الجهاز. اختر محرّكاً أخف.',
    'about.text': 'ترجمان {v}. يشغّل النموذج اللغوي المفتوح على جهازك عبر WebLLM (رخصة Apache 2.0). ملفات وورد وإكسل عبر JSZip، وملفات PDF عبر pdf.js، والتعرّف الضوئي عبر Tesseract.js.',
    'tm.hit': 'من الذاكرة',
  },
};

/* ---------- State ---------- */

const state = {
  ui: localStorage.getItem('tarjuman.ui') || (navigator.language && navigator.language.startsWith('ar') ? 'ar' : 'en'),
  notesLang: localStorage.getItem('tarjuman.notes') || null,
  modelId: localStorage.getItem('tarjuman.model') || null,
  modelState: 'none', // none | loading | ready | sleeping | error
  lowMemory: localStorage.getItem('tarjuman.lowmem') === '1',
  idleRelease: localStorage.getItem('tarjuman.idle') === '1',
  autoCheck: localStorage.getItem('tarjuman.autocheck') !== '0',
  idleTimer: null,
  modelProgress: 0,
  engine: null,
  worker: null,
  running: false,
  abort: false,
  mode: 'compose',
  doc: { kind: 'text', name: '', text: '' },
  blocks: [],
  segments: [],
  translations: [],
  card: null,
  gpu: { available: false, vendor: '', architecture: '' },
};

const $ = (sel) => document.querySelector(sel);
const t = (key, vars) => {
  let s = (STRINGS[state.ui] && STRINGS[state.ui][key]) || STRINGS.en[key] || key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
};

/* ---------- Interface language ---------- */

function applyLanguage() {
  const ar = state.ui === 'ar';
  document.documentElement.lang = ar ? 'ar' : 'en';
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-ui]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ui === state.ui)));
  fillLanguageSelects();
  renderDial();
  fillVariety();
  fillAddress();
  fillDownloadFormats();
  updateRunLabel();
  updatePill();
  updateWordCount();
  $('#aboutText').textContent = t('about.text', { v: APP_VERSION });
  updateLiteraryWarning();
  $('#notesLang').value = state.notesLang || state.ui;
  $('#lowMem').checked = state.lowMemory;
  $('#idleRelease').checked = state.idleRelease;
  $('#autoCheck').checked = state.autoCheck;
  if (state.mode === 'review') renderRows();
}

function fillLanguageSelects() {
  const src = $('#srcLang');
  const tgt = $('#tgtLang');
  const prevSrc = src.value || (state.card && state.card.source) || 'auto';
  const prevTgt = tgt.value || (state.card && state.card.target) || 'ar';
  src.innerHTML = '';
  tgt.innerHTML = '';
  for (const l of core.LANGUAGES) {
    const o = document.createElement('option');
    o.value = l.code;
    o.textContent = state.ui === 'ar' ? l.ar : l.en;
    src.appendChild(o);
    if (l.code !== 'auto') tgt.appendChild(o.cloneNode(true));
  }
  src.value = prevSrc;
  tgt.value = prevTgt;
}

function renderDial() {
  const dial = $('#dial');
  const current = (state.card && state.card.register) || dial.dataset.value || 'corporate';
  dial.dataset.value = current;
  dial.innerHTML = '';
  for (const [key, r] of Object.entries(core.REGISTERS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.dataset.tone = key;
    b.setAttribute('aria-checked', String(key === current));
    b.innerHTML = `<span class="mark" aria-hidden="true"></span><span><span class="name"></span><span class="hint"></span></span>`;
    b.querySelector('.name').textContent = state.ui === 'ar' ? r.ar : r.en;
    b.querySelector('.hint').textContent = state.ui === 'ar' ? r.hint_ar : r.hint_en;
    b.addEventListener('click', () => {
      dial.dataset.value = key;
      dial.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      saveCard();
      updateLiteraryWarning();
    });
    dial.appendChild(b);
  }
}

function fillSelect(sel, entries, prev) {
  sel.innerHTML = '';
  for (const [key, v] of Object.entries(entries)) {
    const o = document.createElement('option');
    o.value = key;
    o.textContent = state.ui === 'ar' ? v.ar : v.en;
    sel.appendChild(o);
  }
  if (prev && entries[prev]) sel.value = prev;
}

function fillVariety() {
  fillSelect($('#variety'), core.VARIETIES, (state.card && state.card.variety) || $('#variety').value || 'msa');
  updateVarietyVisibility();
}

function fillAddress() {
  fillSelect($('#address'), core.ADDRESS, (state.card && state.card.address) || $('#address').value || 'auto');
}

function updateVarietyVisibility() {
  $('#varietyField').classList.toggle('hidden', $('#tgtLang').value !== 'ar');
}

function updateRunLabel() {
  const same = $('#srcLang').value !== 'auto' && $('#srcLang').value === $('#tgtLang').value;
  $('#runBtn').textContent = t(same ? 'rewrite' : 'translate');
}

/* ---------- Style card ---------- */

function parseGlossary(text) {
  return (text || '').split('\n').map((line) => {
    const l = line.trim();
    if (!l) return null;
    const m = l.match(/^(.+?)\s*(?:=|→|->|—|–)\s*(.*)$/);
    if (!m) return { term: l, rendering: '' };
    return { term: m[1].trim(), rendering: /^keep$/i.test(m[2].trim()) ? '' : m[2].trim() };
  }).filter(Boolean);
}

function readCard() {
  return {
    source: $('#srcLang').value,
    target: $('#tgtLang').value,
    register: $('#dial').dataset.value || 'corporate',
    variety: $('#variety').value || 'msa',
    address: $('#address').value || 'auto',
    localize: $('#localize').checked,
    audience: $('#audience').value,
    glossary: parseGlossary($('#glossary').value),
  };
}

function saveCard() {
  state.card = readCard();
  localStorage.setItem('tarjuman.card', JSON.stringify({ ...state.card, glossaryText: $('#glossary').value }));
}

function restoreCard() {
  try {
    const saved = JSON.parse(localStorage.getItem('tarjuman.card') || 'null');
    if (!saved) return;
    state.card = saved;
    $('#srcLang').value = saved.source || 'auto';
    $('#tgtLang').value = saved.target || 'ar';
    $('#dial').dataset.value = saved.register || 'corporate';
    $('#variety').value = saved.variety || 'msa';
    $('#address').value = saved.address || 'auto';
    $('#localize').checked = !!saved.localize;
    $('#audience').value = saved.audience || '';
    $('#glossary').value = saved.glossaryText || '';
  } catch (e) { /* ignore corrupt settings */ }
}

/* ---------- Status and pill ---------- */

function setStatus(text, { progress = null, indeterminate = false, rate = '' } = {}) {
  $('#statusText').textContent = text;
  const bar = $('#statusBar');
  bar.classList.toggle('hidden', progress === null && !indeterminate);
  bar.classList.toggle('indeterminate', indeterminate);
  if (progress !== null) bar.querySelector('i').style.width = `${Math.round(progress * 100)}%`;
  $('#statusRate').textContent = rate;
}

function tierOf(id) {
  return core.MODEL_TIERS.find((m) => m.id === id);
}

function tierLabel(id) {
  const m = tierOf(id);
  if (!m) return id || '';
  return state.ui === 'ar' ? m.ar : m.en;
}

function updateLiteraryWarning() {
  const box = $('#literaryWarn');
  if (!box) return;
  const register = $('#dial').dataset.value || 'corporate';
  const tier = tierOf(state.modelId);
  const weak = tier && (tier.key === 'mini' || tier.key === 'light');
  const show = register === 'literary' && weak;
  box.classList.toggle('hidden', !show);
  if (show) box.textContent = t('literary.warn', { tier: tierLabel(state.modelId) });
}

function updatePill() {
  updateLiteraryWarning();
  const pill = $('#modelPill');
  const text = $('#modelPillText');
  pill.classList.remove('ready', 'busy', 'error');
  if (state.modelState === 'ready') {
    pill.classList.add('ready');
    text.textContent = `${t('engine.ready')} · ${tierLabel(state.modelId)}`;
  } else if (state.modelState === 'loading') {
    pill.classList.add('busy');
    text.textContent = `${t('engine.loading')} ${Math.round(state.modelProgress * 100)}%`;
  } else if (state.modelState === 'sleeping') {
    text.textContent = t('engine.sleeping');
  } else if (state.modelState === 'error') {
    pill.classList.add('error');
    text.textContent = t('engine.error');
  } else {
    text.textContent = t('engine.none');
  }
  $('#settingsEngine').textContent = state.modelId ? `${tierLabel(state.modelId)} — ${state.modelId}` : t('engine.none');
}

/* ---------- Engine ---------- */

async function detectGpu() {
  const info = { available: false, vendor: '', architecture: '' };
  try {
    if (navigator.gpu) {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        info.available = true;
        const ai = adapter.info || (adapter.requestAdapterInfo ? await adapter.requestAdapterInfo() : null);
        if (ai) {
          info.vendor = ai.vendor || '';
          info.architecture = ai.architecture || '';
        }
      }
    }
  } catch (e) { /* no WebGPU */ }
  state.gpu = info;
  return info;
}

function onInitProgress(report) {
  state.modelProgress = report.progress || 0;
  updatePill();
  const pct = Math.round(state.modelProgress * 100);
  setStatus(t('status.loading', { pct }), { progress: state.modelProgress });
  const line = $('#setupProgress');
  if (!line.classList.contains('hidden')) {
    line.querySelector('i').style.width = `${pct}%`;
    $('#setupProgressText').textContent = report.text || '';
  }
}

async function loadModel(modelId) {
  if (state.modelState === 'loading') throw new Error('engine is still loading');
  state.modelState = 'loading';
  state.modelProgress = 0;
  updatePill();
  try {
    if (!state.worker) state.worker = new Worker(new URL('./llm-worker.js', import.meta.url), { type: 'module' });
    // 3072 leaves room for the literary-register reference (~1.4k tokens) plus a chunk and its translation.
    const chatOpts = state.lowMemory ? { context_window_size: 3072 } : { context_window_size: 4096 };
    if (!state.engine) {
      state.engine = await webllm.CreateWebWorkerMLCEngine(state.worker, modelId, { initProgressCallback: onInitProgress }, chatOpts);
    } else {
      state.engine.setInitProgressCallback(onInitProgress);
      await state.engine.reload(modelId, chatOpts);
    }
    state.modelId = modelId;
    state.modelState = 'ready';
    localStorage.setItem('tarjuman.model', modelId);
    setStatus(t('status.idle'));
    updatePill();
    touchIdle();
    return true;
  } catch (err) {
    console.error(err);
    state.modelState = 'error';
    updatePill();
    const msg = String(err && err.message || err);
    const memory = /memory|buffer|out of|allocat|device lost|exceeds/i.test(msg);
    setStatus(memory ? t('error.memory') : t('error.generic', { msg }));
    throw err;
  }
}

function touchIdle() {
  if (state.idleTimer) clearTimeout(state.idleTimer);
  state.idleTimer = null;
  if (!state.idleRelease || state.modelState !== 'ready') return;
  state.idleTimer = setTimeout(releaseEngine, 10 * 60 * 1000);
}

async function releaseEngine() {
  if (state.running || state.modelState !== 'ready' || !state.engine) { touchIdle(); return; }
  try {
    await state.engine.unload();
    state.modelState = 'sleeping';
    updatePill();
  } catch (e) { console.error(e); }
}

/** Make sure the engine can generate: wakes a released engine, opens setup when there is none. */
async function ensureEngine() {
  if (state.modelState === 'ready') return true;
  if (state.modelState === 'sleeping' && state.modelId) {
    setStatus(t('engine.waking'), { indeterminate: true });
    try { await loadModel(state.modelId); return true; } catch (e) { return false; }
  }
  if (state.modelState === 'loading') { setStatus(t('engine.loading')); return false; }
  openSetup();
  setStatus(t('engine.needed'));
  return false;
}

function temperatureFor(card) {
  return card.register === 'literary' ? 0.3 : 0.2;
}

/** The text actually sent to the engine: Arabic diacritics are dropped (far fewer tokens, same letters). */
function modelText(text, card) {
  if (core.detectScript(text) !== 'arabic') return text;
  return core.prepareForModel(text, { literary: !!card && card.register === 'literary' });
}

async function generate(messages, { onToken, maxTokens = 1024, temperature = 0.2 } = {}) {
  touchIdle();
  const stream = await state.engine.chat.completions.create({
    messages,
    stream: true,
    temperature,
    top_p: 0.9,
    max_tokens: maxTokens,
    extra_body: { enable_thinking: false },
  });
  let out = '';
  let interrupted = false;
  for await (const chunk of stream) {
    if (state.abort && !interrupted) {
      interrupted = true;
      // Ask the worker to stop, then keep draining until it yields its final chunk,
      // so the engine's request lock is released for the next call.
      try { await state.engine.interruptGenerate(); } catch (e) { /* ignore */ }
    }
    if (interrupted) continue;
    const delta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content;
    if (delta) {
      out += delta;
      if (onToken) onToken(out);
    }
  }
  touchIdle();
  return out;
}

function maxTokensFor(chars) {
  return Math.max(256, Math.min(2048, Math.ceil(chars * 1.1) + 160));
}

/* ---------- Translation memory (IndexedDB) ---------- */

const tm = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open('tarjuman', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('tm');
      req.onsuccess = () => { this.db = req.result; resolve(this.db); };
      req.onerror = () => resolve(null);
    });
  },
  async get(key) {
    const db = await this.open();
    if (!db) return null;
    return new Promise((resolve) => {
      const r = db.transaction('tm').objectStore('tm').get(key);
      r.onsuccess = () => resolve(r.result ? r.result.text : null);
      r.onerror = () => resolve(null);
    });
  },
  async put(key, text) {
    const db = await this.open();
    if (!db) return;
    try { db.transaction('tm', 'readwrite').objectStore('tm').put({ text, ts: Date.now() }, key); } catch (e) { /* ignore */ }
  },
  async clear() {
    const db = await this.open();
    if (!db) return;
    return new Promise((resolve) => {
      const r = db.transaction('tm', 'readwrite').objectStore('tm').clear();
      r.onsuccess = () => resolve();
      r.onerror = () => resolve();
    });
  },
};

/* ---------- Documents ---------- */

function setMode(mode) {
  state.mode = mode;
  const review = mode === 'review';
  $('#compose').classList.toggle('hidden', review);
  $('#review').classList.toggle('hidden', !review);
  $('#editBtn').classList.toggle('hidden', !review);
  $('#copyAllBtn').classList.toggle('hidden', !review);
  $('#downloadBtn').classList.toggle('hidden', !review);
  $('#downloadFormat').classList.toggle('hidden', !review);
  $('#suggestGlossary').disabled = review;
}

function sourceText() {
  return ['docx', 'srt', 'xlsx', 'csv'].includes(state.doc.kind) ? state.doc.text : $('#source').value;
}

function cellBody(text) {
  return (text || '').replace(/\r\n?/g, '\n').replace(/\n[ \t]*(\n[ \t]*)+/g, '\n').trim();
}

function updateWordCount() {
  const n = core.countWords(sourceText());
  $('#wordCount').textContent = n ? t('words', { n }) : '';
}

function showFile(name, note, locked) {
  const chip = $('#fileChip');
  chip.classList.toggle('hidden', !name);
  $('#fileChipText').textContent = name || '';
  $('#sourceNote').textContent = note || '';
  $('#source').readOnly = !!locked;
  $('#source').title = locked ? t('file.locked') : '';
}

function clearFile() {
  if (state.running) { setStatus(t('engine.busy')); return; }
  if (state.mode === 'review') { setMode('compose'); setStatus(t('status.idle')); }
  state.doc = { kind: 'text', name: '', text: '' };
  $('#source').value = '';
  showFile('', '', false);
  updateWordCount();
  fillDownloadFormats();
}

async function loadFile(file) {
  if (state.running) { setStatus(t('engine.busy')); return; }
  if (state.mode === 'review') { setMode('compose'); setStatus(t('status.idle')); }
  const name = file.name;
  const ext = (name.split('.').pop() || '').toLowerCase();
  try {
    if (ext === 'docx') await loadDocx(file);
    else if (ext === 'pdf') await loadPdf(file);
    else if (ext === 'srt') await loadSrt(file);
    else if (ext === 'xlsx') await loadXlsx(file);
    else if (ext === 'csv') await loadCsv(file);
    else if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tif', 'tiff'].includes(ext)) await loadImage(file);
    else await loadText(file);
    fillDownloadFormats();
    updateWordCount();
  } catch (err) {
    console.error(err);
    const msg = err && err.tarjumanMessage ? err.tarjumanMessage : t('file.error');
    await messageBox(t('file.error'), msg, { okOnly: true });
  }
}

async function loadText(file) {
  const text = await file.text();
  state.doc = { kind: 'text', name: file.name, text };
  $('#source').value = text;
  showFile(file.name, t('file.loaded', { name: file.name, n: core.segmentize(text).blocks.length }), false);
}

async function loadSrt(file) {
  const text = await file.text();
  const cues = core.parseSrt(text);
  const map = [];
  const texts = [];
  cues.forEach((c, i) => {
    const body = c.text.replace(/\n[ \t]*(\n[ \t]*)+/g, '\n').trim();
    if (body) { map.push(i); texts.push(body); }
  });
  state.doc = { kind: 'srt', name: file.name, cues, map, text: texts.join('\n\n') };
  $('#source').value = state.doc.text;
  showFile(file.name, `${t('file.loaded', { name: file.name, n: texts.length })} — ${t('file.srt.note')}`, true);
}

async function loadDocx(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entry = zip.file('word/document.xml');
  if (!entry) throw new Error('no document.xml');
  const xml = await entry.async('string');
  const { items } = docxlib.docxParagraphs(xml, { DOMParser: window.DOMParser });
  const map = [];
  const texts = [];
  items.forEach((it, i) => {
    const body = it.text.replace(/\n[ \t]*(\n[ \t]*)+/g, '\n').trim();
    if (body) { map.push(i); texts.push(body); }
  });
  state.doc = { kind: 'docx', name: file.name, zip, xml, itemCount: items.length, map, text: texts.join('\n\n') };
  $('#source').value = state.doc.text;
  showFile(file.name, `${t('file.loaded', { name: file.name, n: texts.length })} — ${t('file.docx.note')}`, true);
}

async function loadPdf(file) {
  const pdfjs = await import('./vendor/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.min.mjs', import.meta.url).href;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const lines = new Map();
    for (const item of content.items) {
      if (typeof item.str !== 'string' || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 2) * 2;
      const h = Math.abs(item.transform[3]) || item.height || 10;
      if (!lines.has(y)) lines.set(y, { y, height: h, parts: [], rtl: 0 });
      const line = lines.get(y);
      line.parts.push({ x: item.transform[4], str: item.str });
      if (item.dir === 'rtl') line.rtl++;
    }
    const ordered = [...lines.values()].sort((a, b) => b.y - a.y).map((l) => ({
      y: l.y,
      height: l.height,
      // pdf.js emits right-to-left runs as separate items; order them from the right edge.
      text: l.parts.sort((a, b) => (l.rtl > l.parts.length / 2 ? b.x - a.x : a.x - b.x)).map((pt) => pt.str).join(' ').replace(/\s+/g, ' ').trim(),
    }));
    const paras = core.linesToParagraphs(ordered);
    if (paras.length) pages.push(paras.join('\n\n'));
  }
  const text = pages.join('\n\n');
  if (!text.trim()) {
    const langs = ocr.ocrLanguages($('#srcLang').value);
    if (!(await askOcr(langs))) {
      const err = new Error('empty pdf');
      err.tarjumanMessage = t('file.pdf.empty');
      throw err;
    }
    const canvases = await ocr.renderPdfPages(pdf, { scale: 2.5, onPage: (n, total) => setStatus(t('status.rendering', { n, total }), { progress: n / total }) });
    const texts = await runOcr(canvases, langs);
    const recognized = texts.join('\n\n').trim();
    if (!recognized) {
      const err = new Error('nothing recognized');
      err.tarjumanMessage = t('file.nothing');
      throw err;
    }
    state.doc = { kind: 'pdf', name: file.name, text: recognized };
    $('#source').value = recognized;
    showFile(file.name, `${t('file.loaded', { name: file.name, n: core.segmentize(recognized).blocks.length })} — ${t('file.ocr.note')}`, false);
    setStatus(t('status.idle'));
    return;
  }
  state.doc = { kind: 'pdf', name: file.name, text };
  $('#source').value = text;
  showFile(file.name, `${t('file.loaded', { name: file.name, n: core.segmentize(text).blocks.length })} — ${t('file.pdf.note')}`, false);
}

async function askOcr(langs) {
  const names = langs.map((l) => l.toUpperCase()).join(' + ');
  const extra = ocr.isBundled(langs) ? '' : ' ' + t('ocr.online');
  return messageBox(t('ocr.title'), t('ocr.body', { langs: names }) + extra, { okLabel: t('ocr.go') });
}

async function runOcr(images, langs) {
  setStatus(t('ocr.loading', { what: '' }), { indeterminate: true });
  return ocr.recognize(images, langs, {
    onProgress: (m) => {
      if (m && m.status && m.status !== 'recognizing text') setStatus(t('ocr.loading', { what: m.status }), { indeterminate: true });
      else if (m && typeof m.progress === 'number') setStatus(t('status.ocr', { n: '…', total: images.length }), { progress: m.progress });
    },
    onPage: (n, total) => setStatus(t('status.ocr', { n, total }), { progress: n / total }),
  });
}

async function loadImage(file) {
  const langs = ocr.ocrLanguages($('#srcLang').value);
  if (!(await askOcr(langs))) return;
  const texts = await runOcr([file], langs);
  const text = texts.join('\n\n').trim();
  if (!text) {
    const err = new Error('nothing recognized');
    err.tarjumanMessage = t('file.nothing');
    throw err;
  }
  state.doc = { kind: 'image', name: file.name, text };
  $('#source').value = text;
  showFile(file.name, `${t('file.loaded', { name: file.name, n: core.segmentize(text).blocks.length })} — ${t('file.ocr.note')}`, false);
  setStatus(t('status.idle'));
}

async function loadXlsx(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const sharedEntry = zip.file('xl/sharedStrings.xml');
  const sharedXml = sharedEntry ? await sharedEntry.async('string') : '';
  const sheetFiles = Object.keys(zip.files).filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/.test(p)).sort();
  const sheets = [];
  for (const path of sheetFiles) sheets.push({ path, xml: await zip.file(path).async('string') });
  const map = [];
  const texts = [];
  if (sharedXml) {
    const { items } = xlsxlib.xlsxSharedStrings(sharedXml, { DOMParser: window.DOMParser });
    items.forEach((it) => {
      const body = cellBody(it.text);
      if (it.translatable && body) { map.push({ kind: 'shared', index: it.index }); texts.push(body); }
    });
  }
  sheets.forEach((sheet, s) => {
    const { items } = xlsxlib.xlsxInlineStrings(sheet.xml, { DOMParser: window.DOMParser });
    items.forEach((it) => {
      const body = cellBody(it.text);
      if (it.translatable && body) { map.push({ kind: 'inline', sheet: s, index: it.index }); texts.push(body); }
    });
  });
  if (!texts.length) {
    const err = new Error('no text');
    err.tarjumanMessage = t('file.nothing');
    throw err;
  }
  state.doc = { kind: 'xlsx', name: file.name, zip, sharedXml, sheets, map, text: texts.join('\n\n') };
  $('#source').value = state.doc.text;
  showFile(file.name, `${t('file.loaded', { name: file.name, n: texts.length })} — ${t('file.xlsx.note')}`, true);
}

async function loadCsv(file) {
  const raw = await file.text();
  const { rows, delimiter } = xlsxlib.parseCsv(raw);
  const cells = xlsxlib.csvTranslatableCells(rows);
  const map = [];
  const texts = [];
  cells.forEach((c) => {
    const body = cellBody(c.text);
    if (body) { map.push({ r: c.r, c: c.c }); texts.push(body); }
  });
  if (!texts.length) {
    const err = new Error('no text');
    err.tarjumanMessage = t('file.nothing');
    throw err;
  }
  state.doc = { kind: 'csv', name: file.name, rows, delimiter, map, text: texts.join('\n\n') };
  $('#source').value = state.doc.text;
  showFile(file.name, `${t('file.loaded', { name: file.name, n: texts.length })} — ${t('file.csv.note')}`, true);
}

/* ---------- Review rows ---------- */

function blockOutput(blockIndex, partial) {
  const block = state.blocks[blockIndex];
  if (partial && partial.whole) return { text: partial.text, done: false };
  const parts = block.segmentIds.map((id) => {
    if (partial && partial.id === id) return partial.text;
    const tr = state.translations[id];
    return tr === undefined || tr === null ? null : tr;
  });
  const done = parts.every((p) => p !== null);
  return { text: parts.filter((p) => p !== null && p !== '').join(block.joiner || ' '), done };
}

function renderRows() {
  const rows = $('#rows');
  rows.innerHTML = '';
  const srcDir = core.isRtl(state.card.source) ? 'rtl' : state.card.source === 'auto' ? core.textDirection(state.blocks[0] ? state.blocks[0].text : '') : 'ltr';
  const outDir = core.isRtl(state.card.target) ? 'rtl' : 'ltr';
  state.blocks.forEach((block, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.block = String(i);
    const src = document.createElement('div');
    src.className = 'cell src';
    src.dir = srcDir;
    src.textContent = block.text;
    const out = document.createElement('div');
    out.className = 'cell out pending';
    out.dir = outDir;
    const body = document.createElement('div');
    body.className = 'outbody';
    body.textContent = '…';
    out.appendChild(body);
    const tools = document.createElement('div');
    tools.className = 'rowtools';
    tools.dir = document.documentElement.dir || 'ltr';
    tools.innerHTML = `<button class="btn quiet" type="button" data-act="redo"></button><button class="btn quiet" type="button" data-act="polish"></button><button class="btn quiet" type="button" data-act="check"></button><button class="btn quiet" type="button" data-act="explain"></button><button class="btn quiet" type="button" data-act="copy"></button>`;
    tools.querySelector('[data-act="redo"]').textContent = t('row.redo');
    tools.querySelector('[data-act="polish"]').textContent = t('row.polish');
    tools.querySelector('[data-act="check"]').textContent = t('row.check');
    tools.querySelector('[data-act="explain"]').textContent = t('row.explain');
    tools.querySelector('[data-act="copy"]').textContent = t('row.copy');
    tools.addEventListener('click', (e) => {
      const act = e.target.dataset.act;
      if (act === 'redo') redoBlock(i);
      else if (act === 'polish') polishBlock(i);
      else if (act === 'check') checkBlockManual(i);
      else if (act === 'explain') explainBlock(i);
      else if (act === 'copy') copyText(blockOutput(i).text);
    });
    out.appendChild(tools);
    row.append(src, out);
    rows.appendChild(row);
    paintRow(i);
  });
}

function paintRow(i, partial, { error = false } = {}) {
  const row = $(`#rows .row[data-block="${i}"]`);
  if (!row) return;
  const out = row.querySelector('.cell.out');
  const body = row.querySelector('.outbody');
  const { text, done } = blockOutput(i, partial);
  out.classList.toggle('pending', !text && !done);
  out.classList.toggle('streaming', !!partial);
  out.classList.toggle('error', error);
  body.textContent = text || (error ? '' : '…');
  if (partial && !done) row.scrollIntoView({ block: 'nearest' });
}

/* ---------- Running a translation ---------- */

async function runTranslation() {
  if (state.running) return;
  const text = sourceText();
  if (!text.trim()) {
    setStatus(t('source.empty'));
    return;
  }
  if (!(await ensureEngine())) return;
  saveCard();
  const card = state.card;
  const dense = ['arabic', 'hebrew', 'cjk'].includes(core.detectScript(text)) || ['ar', 'ur', 'fa', 'he', 'zh', 'ja', 'ko', 'hi'].includes(card.target);
  let maxChars = dense ? 1000 : 1400;
  if (state.lowMemory) maxChars = Math.round(maxChars * 0.7);
  const { blocks, segments } = core.segmentize(text, { maxChars });
  state.blocks = blocks;
  state.segments = segments;
  state.translations = new Array(segments.length);
  if (state.doc.kind === 'text' || state.doc.kind === 'pdf') state.doc.text = text;
  setMode('review');
  renderRows();
  await runSegments(card, segments, { useMemory: true, temperature: temperatureFor(card) });
  if (card.register === 'literary' && state.autoCheck && !state.abort) await checkAllBlocks(card);
}

async function checkAllBlocks(card) {
  const total = state.blocks.length;
  state.running = true;
  state.abort = false;
  $('#runBtn').classList.add('hidden');
  $('#stopBtn').classList.remove('hidden');
  let repaired = 0;
  let flagged = 0;
  try {
    for (let i = 0; i < total; i++) {
      if (state.abort) break;
      setStatus(t('status.checking', { n: i + 1, total }), { progress: i / total });
      const r = await checkBlock(i, card, { repair: true });
      if (r && r.repaired) repaired++;
      if (r && core.hasIssues(r.remaining)) flagged++;
    }
  } catch (err) {
    console.error(err);
    setStatus(t('error.generic', { msg: String(err && err.message || err) }));
    return;
  } finally {
    state.running = false;
    $('#runBtn').classList.remove('hidden');
    $('#stopBtn').classList.add('hidden');
  }
  if (!state.abort) setStatus(t('status.checked', { n: total, r: repaired, f: flagged }));
}

/** Compare a block's translation with its source; optionally repair once and re-check. */
async function checkBlock(i, card, { repair = true } = {}) {
  const block = state.blocks[i];
  const { text: draft, done } = blockOutput(i);
  if (!done || !draft.trim()) return null;
  const notesLang = state.notesLang || state.ui;
  const src = modelText(block.text, card);
  const runCheck = async (translation) => core.parseCheck(await generate(
    core.buildCheckMessages(card, src, translation, notesLang),
    { temperature: 0.1, maxTokens: 500 },
  ));
  showFidelity(i, null, { working: true });
  let check = await runCheck(draft);
  let repaired = false;
  if (repair && core.hasIssues(check) && !state.abort) {
    const raw = await generate(core.buildRepairMessages(card, src, draft, check), {
      temperature: 0.2,
      maxTokens: maxTokensFor(block.text.length),
    });
    const fixed = core.cleanTranslation(raw, block.text);
    if (fixed && fixed !== draft && !state.abort) {
      block.segmentIds.forEach((id, k) => { state.translations[id] = k === 0 ? fixed : ''; });
      if (block.segmentIds.length === 1) tm.put(core.tmKey(card, state.segments[block.segmentIds[0]].text), fixed);
      paintRow(i);
      repaired = true;
      check = await runCheck(fixed);
    }
  }
  showFidelity(i, check, { repaired });
  return { repaired, remaining: check };
}

function showFidelity(i, check, { working = false, repaired = false } = {}) {
  const row = $(`#rows .row[data-block="${i}"]`);
  if (!row) return;
  const out = row.querySelector('.cell.out');
  let box = out.querySelector('.fidelity');
  if (!box) {
    box = document.createElement('div');
    box.className = 'fidelity';
    out.insertBefore(box, out.querySelector('.rowtools'));
  }
  box.dir = (state.notesLang || state.ui) === 'ar' ? 'rtl' : 'ltr';
  box.classList.remove('ok', 'warn');
  if (working) {
    box.innerHTML = `<span class="n-empty">${t('row.check')}…</span>`;
    return;
  }
  const issues = core.hasIssues(check);
  box.classList.add(issues ? 'warn' : 'ok');
  if (!issues) {
    box.textContent = repaired ? t('fidelity.repaired.ok') : t('fidelity.ok');
    return;
  }
  box.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'f-head';
  head.textContent = repaired ? t('fidelity.repaired') : t('fidelity.found');
  box.appendChild(head);
  const ul = document.createElement('ul');
  const add = (label, items) => items.forEach((x) => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = label + ': ';
    li.appendChild(b);
    li.appendChild(document.createTextNode(x));
    ul.appendChild(li);
  });
  add(t('fidelity.missing'), check.missing);
  add(t('fidelity.added'), check.added);
  add(t('fidelity.changed'), check.changed);
  add(t('fidelity.note'), check.other);
  box.appendChild(ul);
}

async function checkBlockManual(i) {
  if (state.running) { setStatus(t('engine.busy')); return; }
  if (!(await ensureEngine())) return;
  state.running = true;
  state.abort = false;
  setStatus(t('status.checking', { n: i + 1, total: state.blocks.length }), { indeterminate: true });
  try {
    await checkBlock(i, state.card, { repair: true });
    setStatus(t('status.idle'));
  } catch (err) {
    setStatus(t('error.generic', { msg: String(err && err.message || err) }));
  } finally {
    state.running = false;
  }
}

async function runSegments(card, segments, { useMemory = true, temperature = 0.2 } = {}) {
  state.running = true;
  state.abort = false;
  $('#runBtn').classList.add('hidden');
  $('#stopBtn').classList.remove('hidden');
  const total = state.blocks.length;
  const started = performance.now();
  let wordsOut = 0;
  const doneBlocks = () => state.blocks.filter((_, i) => blockOutput(i).done).length;
  const tick = () => {
    const secs = Math.max(0.5, (performance.now() - started) / 1000);
    setStatus(t('status.translating', { done: doneBlocks(), total }), {
      progress: doneBlocks() / Math.max(1, total),
      rate: wordsOut ? t('status.words', { n: (wordsOut / secs).toFixed(1) }) : '',
    });
  };
  tick();
  let failed = false;
  try {
    const requests = core.planRequests(segments);
    for (const req of requests) {
      if (state.abort) break;
      const segs = req.kind === 'single' ? [req.segment] : req.segments;
      const pending = [];
      for (const seg of segs) {
        const hit = useMemory ? await tm.get(core.tmKey(card, seg.text)) : null;
        if (hit) {
          state.translations[seg.id] = hit;
          paintRow(seg.blockIndex);
        } else {
          pending.push(seg);
        }
      }
      if (!pending.length) { tick(); continue; }
      if (pending.length > 1) {
        const ok = await translateBatch(card, pending, temperature);
        if (ok) {
          pending.forEach((seg) => { wordsOut += core.countWords(state.translations[seg.id]); });
          tick();
          continue;
        }
      }
      for (const seg of pending) {
        if (state.abort) break;
        await translateSingle(card, seg, temperature);
        wordsOut += core.countWords(state.translations[seg.id] || '');
        tick();
      }
    }
  } catch (err) {
    console.error(err);
    failed = true;
    setStatus(t('error.generic', { msg: String(err && err.message || err) }));
  } finally {
    const n = doneBlocks();
    const secs = ((performance.now() - started) / 1000).toFixed(0);
    if (state.abort) setStatus(t('status.stopped', { n }));
    else if (!failed) setStatus(t('status.done', { n, s: secs }));
    state.running = false;
    $('#runBtn').classList.remove('hidden');
    $('#stopBtn').classList.add('hidden');
  }
}

async function translateSingle(card, seg, temperature) {
  const messages = core.buildTranslateMessages(card, modelText(seg.text, card));
  let last = 0;
  const raw = await generate(messages, {
    temperature,
    maxTokens: maxTokensFor(seg.text.length),
    onToken: (partial) => {
      const now = performance.now();
      if (now - last < 60) return;
      last = now;
      paintRow(seg.blockIndex, { id: seg.id, text: core.stripThinking(partial) });
    },
  });
  if (state.abort) {
    paintRow(seg.blockIndex);
    return;
  }
  const cleaned = core.cleanTranslation(raw, seg.text) || seg.text;
  state.translations[seg.id] = cleaned;
  paintRow(seg.blockIndex);
  if (!state.abort) tm.put(core.tmKey(card, seg.text), cleaned);
}

async function translateBatch(card, segs, temperature) {
  const messages = core.buildBatchMessages(card, segs.map((s) => modelText(s.text, card)));
  const chars = segs.reduce((n, s) => n + s.text.length, 0);
  segs.forEach((s) => paintRow(s.blockIndex, { id: s.id, text: '' }));
  const raw = await generate(messages, { temperature, maxTokens: maxTokensFor(chars) + segs.length * 8 });
  if (state.abort) {
    segs.forEach((s) => paintRow(s.blockIndex));
    return true;
  }
  const parsed = core.parseNumbered(raw, segs.length);
  if (!parsed) {
    segs.forEach((s) => paintRow(s.blockIndex));
    return false;
  }
  segs.forEach((s, i) => {
    const cleaned = core.cleanTranslation(parsed[i], s.text) || s.text;
    state.translations[s.id] = cleaned;
    paintRow(s.blockIndex);
    tm.put(core.tmKey(card, s.text), cleaned);
  });
  return true;
}

async function redoBlock(i) {
  if (state.running) { setStatus(t('engine.busy')); return; }
  if (!(await ensureEngine())) return;
  const block = state.blocks[i];
  const segs = block.segmentIds.map((id) => state.segments[id]);
  segs.forEach((s) => { state.translations[s.id] = undefined; });
  paintRow(i);
  await runSegments(state.card, segs, { useMemory: false, temperature: Math.max(0.6, temperatureFor(state.card)) });
}

async function polishBlock(i) {
  if (state.running) { setStatus(t('engine.busy')); return; }
  if (!(await ensureEngine())) return;
  const block = state.blocks[i];
  const { text: draft, done } = blockOutput(i);
  if (!done || !draft.trim()) return;
  state.running = true;
  state.abort = false;
  setStatus(t('status.polishing', { n: i + 1 }), { indeterminate: true });
  try {
    const messages = core.buildPolishMessages(state.card, modelText(block.text, state.card), draft);
    let last = 0;
    const raw = await generate(messages, {
      temperature: temperatureFor(state.card),
      maxTokens: maxTokensFor(block.text.length),
      onToken: (partial) => {
        const now = performance.now();
        if (now - last < 60) return;
        last = now;
        paintRow(i, { id: block.segmentIds[0], text: core.stripThinking(partial), whole: true });
      },
    });
    const cleaned = core.cleanTranslation(raw, block.text);
    if (cleaned && !state.abort) {
      // The polished text replaces the whole block: keep it in the first segment, blank the others.
      block.segmentIds.forEach((id, k) => { state.translations[id] = k === 0 ? cleaned : ''; });
      if (block.segmentIds.length === 1) tm.put(core.tmKey(state.card, state.segments[block.segmentIds[0]].text), cleaned);
    }
    paintRow(i);
    setStatus(t('status.idle'));
  } catch (err) {
    setStatus(t('error.generic', { msg: String(err && err.message || err) }));
    paintRow(i);
  } finally {
    state.running = false;
  }
}

async function explainBlock(i) {
  if (state.running) { setStatus(t('engine.busy')); return; }
  if (!(await ensureEngine())) return;
  const row = $(`#rows .row[data-block="${i}"]`);
  const out = row.querySelector('.cell.out');
  let notes = out.querySelector('.notes');
  if (!notes) {
    notes = document.createElement('div');
    notes.className = 'notes';
    out.insertBefore(notes, out.querySelector('.rowtools'));
  }
  notes.dir = (state.notesLang || state.ui) === 'ar' ? 'rtl' : 'ltr';
  notes.innerHTML = `<span class="n-empty">${t('notes.working')}</span>`;
  state.running = true;
  state.abort = false;
  try {
    const { text } = blockOutput(i);
    const messages = core.buildExplainMessages(state.card, modelText(state.blocks[i].text, state.card), text, state.notesLang || state.ui);
    const raw = await generate(messages, { temperature: 0.2, maxTokens: 700 });
    const lines = core.parseNoteLines(raw);
    if (!lines.length) {
      notes.innerHTML = `<span class="n-empty">${t('notes.none')}</span>`;
    } else {
      const ul = document.createElement('ul');
      for (const line of lines) {
        const li = document.createElement('li');
        li.textContent = line;
        ul.appendChild(li);
      }
      notes.innerHTML = '';
      notes.appendChild(ul);
    }
  } catch (err) {
    notes.innerHTML = `<span class="n-empty">${t('error.generic', { msg: String(err && err.message || err) })}</span>`;
  } finally {
    state.running = false;
  }
}

async function suggestGlossary() {
  if (state.running) { setStatus(t('engine.busy')); return; }
  const text = modelText(sourceText(), readCard()).slice(0, 6000);
  if (!text.trim()) { setStatus(t('source.empty')); return; }
  if (!(await ensureEngine())) return;
  state.running = true;
  state.abort = false;
  $('#suggestGlossary').disabled = true;
  setStatus(t('glossary.suggest'), { indeterminate: true });
  try {
    const raw = await generate(core.buildGlossaryMessages(readCard(), text), { temperature: 0.1, maxTokens: 400 });
    const found = core.parseGlossaryLines(raw);
    const existing = parseGlossary($('#glossary').value).map((g) => g.term.toLowerCase());
    const add = found.filter((g) => !existing.includes(g.term.toLowerCase()));
    const lines = add.map((g) => `${g.term} = ${g.rendering || 'keep'}`);
    if (lines.length) $('#glossary').value = ($('#glossary').value.trim() + '\n' + lines.join('\n')).trim();
    saveCard();
    setStatus(t('status.idle'));
  } catch (err) {
    setStatus(t('error.generic', { msg: String(err && err.message || err) }));
  } finally {
    state.running = false;
    $('#suggestGlossary').disabled = false;
  }
}

/* ---------- Export ---------- */

function fillDownloadFormats() {
  const sel = $('#downloadFormat');
  const prev = sel.value;
  sel.innerHTML = '';
  const kinds = state.doc.kind === 'docx' ? ['docx', 'txt']
    : state.doc.kind === 'srt' ? ['srt', 'txt']
      : state.doc.kind === 'xlsx' ? ['xlsx', 'txt']
        : state.doc.kind === 'csv' ? ['csv', 'txt']
          : ['txt', 'md', 'docx'];
  for (const k of kinds) {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = t(`dl.${k}`);
    sel.appendChild(o);
  }
  if (kinds.includes(prev)) sel.value = prev;
}

function resultText() {
  return state.blocks.map((_, i) => blockOutput(i).text).join('\n\n');
}

function baseName() {
  const n = state.doc.name || 'tarjuman';
  return n.replace(/\.[^.]+$/, '') + '.' + (state.card ? state.card.target : 'out');
}

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

async function download() {
  const fmt = $('#downloadFormat').value;
  const rtl = core.isRtl(state.card.target);
  const name = baseName();
  if (fmt === 'txt' || fmt === 'md') {
    downloadBlob(new Blob([resultText()], { type: 'text/plain;charset=utf-8' }), `${name}.${fmt}`);
    return;
  }
  if (fmt === 'srt') {
    if (state.blocks.length !== state.doc.map.length) {
      await messageBox(t('download'), t('export.mismatch'), { okOnly: true });
      return;
    }
    const cues = state.doc.cues.map((c) => ({ ...c }));
    state.doc.map.forEach((cueIndex, k) => { if (state.blocks[k]) cues[cueIndex].text = blockOutput(k).text; });
    downloadBlob(new Blob([core.serializeSrt(cues)], { type: 'text/plain;charset=utf-8' }), `${name}.srt`);
    return;
  }
  if (fmt === 'csv') {
    if (state.blocks.length !== state.doc.map.length) {
      await messageBox(t('download'), t('export.mismatch'), { okOnly: true });
      return;
    }
    const rows = state.doc.rows.map((r) => r.slice());
    state.doc.map.forEach((m, k) => { rows[m.r][m.c] = blockOutput(k).text; });
    downloadBlob(new Blob(['\uFEFF' + xlsxlib.serializeCsv(rows, state.doc.delimiter)], { type: 'text/csv;charset=utf-8' }), `${name}.csv`);
    return;
  }
  if (fmt === 'xlsx') {
    if (state.blocks.length !== state.doc.map.length) {
      await messageBox(t('download'), t('export.mismatch'), { okOnly: true });
      return;
    }
    const zip = state.doc.zip;
    const sharedOut = [];
    const inlineOut = state.doc.sheets.map(() => []);
    state.doc.map.forEach((m, k) => {
      const text = blockOutput(k).text;
      if (m.kind === 'shared') sharedOut[m.index] = text;
      else inlineOut[m.sheet][m.index] = text;
    });
    if (state.doc.sharedXml) {
      const { doc, items } = xlsxlib.xlsxSharedStrings(state.doc.sharedXml, { DOMParser: window.DOMParser });
      xlsxlib.xlsxApplyStrings(doc, items, sharedOut);
      zip.file('xl/sharedStrings.xml', xlsxlib.xlsxSerialize(doc, { XMLSerializer: window.XMLSerializer }));
    }
    state.doc.sheets.forEach((sheet, s) => {
      const { doc, items } = xlsxlib.xlsxInlineStrings(sheet.xml, { DOMParser: window.DOMParser });
      xlsxlib.xlsxApplyStrings(doc, items, inlineOut[s]);
      xlsxlib.xlsxSetDirection(doc, rtl);
      zip.file(sheet.path, xlsxlib.xlsxSerialize(doc, { XMLSerializer: window.XMLSerializer }));
    });
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, `${name}.xlsx`);
    return;
  }
  const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (state.doc.kind === 'docx') {
    if (state.blocks.length !== state.doc.map.length) {
      await messageBox(t('download'), t('export.mismatch'), { okOnly: true });
      return;
    }
    // Parse the original XML afresh for every export so repeated downloads work.
    const { doc, items } = docxlib.docxParagraphs(state.doc.xml, { DOMParser: window.DOMParser });
    const perItem = new Array(items.length);
    state.doc.map.forEach((itemIndex, k) => { perItem[itemIndex] = blockOutput(k).text; });
    docxlib.docxApplyTranslations(doc, items, perItem, { rtl });
    const xml = docxlib.docxSerialize(doc, { XMLSerializer: window.XMLSerializer });
    const zip = state.doc.zip;
    zip.file('word/document.xml', xml);
    const blob = await zip.generateAsync({ type: 'blob', mimeType: mime });
    downloadBlob(blob, `${name}.docx`);
    return;
  }
  const zip = new JSZip();
  docxlib.fillDocxZip(zip, state.blocks.map((_, i) => blockOutput(i).text), { rtl });
  const blob = await zip.generateAsync({ type: 'blob', mimeType: mime });
  downloadBlob(blob, `${name}.docx`);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(t('copied'));
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    setStatus(t('copied'));
  }
}

/* ---------- Dialogs ---------- */

function messageBox(title, body, { okOnly = false, okLabel = null } = {}) {
  const dlg = $('#msgDlg');
  $('#msgTitle').textContent = title;
  $('#msgBody').textContent = body;
  $('#msgOk').textContent = okLabel || t('ok');
  $('#msgCancel').classList.toggle('hidden', okOnly);
  return new Promise((resolve) => {
    const done = (v) => { dlg.close(); $('#msgOk').onclick = null; $('#msgCancel').onclick = null; resolve(v); };
    $('#msgOk').onclick = () => done(true);
    $('#msgCancel').onclick = () => done(false);
    dlg.onclose = () => resolve(false);
    dlg.showModal();
  });
}

async function openSetup() {
  const dlg = $('#setupDlg');
  const gpu = state.gpu.available ? state.gpu : await detectGpu();
  const info = $('#sysinfo');
  info.innerHTML = '';
  const addRow = (k, v, bad) => {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    if (bad) dd.className = 'bad';
    info.append(dt, dd);
  };
  const vendor = [gpu.vendor, gpu.architecture].filter(Boolean).join(' · ');
  addRow(t('sys.gpu'), gpu.available ? `${t('sys.gpu.ok')}${vendor ? ' — ' + vendor : ''}` : t('sys.gpu.none'), !gpu.available);
  const mem = navigator.deviceMemory;
  addRow(t('sys.memory'), mem ? (mem >= 8 ? t('sys.memory.more') : `${mem} GB`) : t('sys.memory.unknown'));
  $('#noGpu').classList.toggle('hidden', gpu.available);
  $('#setupGo').disabled = !gpu.available;

  const tiers = $('#tiers');
  tiers.innerHTML = '';
  const recommended = core.recommendTier(mem, gpu.vendor);
  const chosen = state.modelId || core.MODEL_TIERS.find((m) => m.key === recommended).id;
  for (const m of core.MODEL_TIERS) {
    const label = document.createElement('label');
    label.className = 'tier' + (m.key === recommended ? ' recommended' : '');
    label.innerHTML = `<input type="radio" name="tier" value="${m.id}"><span><span class="t-name"></span><span class="t-note" style="display:block"></span></span><span class="t-size"><span class="t-sizetext"></span><button type="button" class="btn quiet small t-delete hidden"></button></span>`;
    label.querySelector('.t-name').dataset.rec = t('tier.recommended');
    label.querySelector('.t-sizetext').dataset.cached = t('tier.cached');
    label.querySelector('.t-name').textContent = state.ui === 'ar' ? m.ar : m.en;
    label.querySelector('.t-note').textContent = state.ui === 'ar' ? m.note_ar : m.note_en;
    label.querySelector('.t-sizetext').textContent = `${m.download_gb} GB ${t('tier.download')} · ${m.gpu_gb} GB ${t('tier.gpu')}`;
    label.querySelector('input').checked = m.id === chosen;
    const del = label.querySelector('.t-delete');
    del.textContent = t('tier.delete');
    del.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!(await messageBox(t('confirm.tier.title'), t('confirm.tier.body', { tier: state.ui === 'ar' ? m.ar : m.en })))) return;
      try { await webllm.deleteModelAllInfoInCache(m.id); } catch (err) { console.error(err); }
      if (state.modelId === m.id) {
        if (state.engine && state.modelState === 'ready') { try { await state.engine.unload(); } catch (err) { /* ignore */ } }
        state.modelState = 'none';
        state.modelId = null;
        localStorage.removeItem('tarjuman.model');
        updatePill();
      }
      label.classList.remove('cached');
      del.classList.add('hidden');
    });
    tiers.appendChild(label);
    webllm.hasModelInCache(m.id).then((cached) => { if (cached) { label.classList.add('cached'); del.classList.remove('hidden'); } }).catch(() => {});
  }
  $('#setupProgress').classList.add('hidden');
  $('#setupError').classList.add('hidden');
  if (!dlg.open) dlg.showModal();
}

async function startSetup() {
  const picked = $('#tiers input:checked');
  if (!picked) return;
  const modelId = picked.value;
  $('#setupGo').disabled = true;
  $('#setupCancel').disabled = true;
  $('#setupError').classList.add('hidden');
  $('#setupProgress').classList.remove('hidden');
  $('#setupProgress i').style.width = '0%';
  try {
    await loadModel(modelId);
    $('#setupDlg').close();
  } catch (err) {
    const msg = String(err && err.message || err);
    const memory = /memory|buffer|out of|allocat|device lost|exceeds/i.test(msg);
    $('#setupError').textContent = memory ? t('error.memory') : t('error.generic', { msg });
    $('#setupError').classList.remove('hidden');
  } finally {
    $('#setupGo').disabled = false;
    $('#setupCancel').disabled = false;
    $('#setupProgress').classList.add('hidden');
  }
}

async function toggleEngineMenu() {
  const menu = $('#engineMenu');
  if (!menu.classList.contains('hidden')) { menu.classList.add('hidden'); return; }
  menu.innerHTML = '';
  const cachedIds = [];
  for (const m of core.MODEL_TIERS) {
    let cached = false;
    try { cached = await webllm.hasModelInCache(m.id); } catch (e) { cached = false; }
    if (cached) cachedIds.push(m.id);
  }
  for (const id of cachedIds) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'menu-item' + (id === state.modelId ? ' current' : '');
    b.textContent = tierLabel(id) + (id === state.modelId ? ` · ${t('engine.menu.current')}` : '');
    b.addEventListener('click', async () => {
      menu.classList.add('hidden');
      if (id === state.modelId || state.running) return;
      try { await loadModel(id); } catch (e) { /* status already shows the error */ }
    });
    menu.appendChild(b);
  }
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'menu-item more';
  more.textContent = t('engine.menu.more');
  more.addEventListener('click', () => { menu.classList.add('hidden'); openSetup(); });
  menu.appendChild(more);
  menu.classList.remove('hidden');
}

/* ---------- Wiring ---------- */

function wire() {
  document.querySelectorAll('[data-ui]').forEach((b) => b.addEventListener('click', () => {
    state.ui = b.dataset.ui;
    localStorage.setItem('tarjuman.ui', state.ui);
    applyLanguage();
  }));
  $('#modelPill').addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.modelState === 'sleeping') { ensureEngine(); return; }
    if (state.modelState === 'loading') return;
    if (state.modelState !== 'ready') { openSetup(); return; }
    toggleEngineMenu();
  });
  document.addEventListener('click', () => $('#engineMenu').classList.add('hidden'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#engineMenu').classList.add('hidden'); });
  $('#settingsBtn').addEventListener('click', () => $('#settingsDlg').showModal());
  $('#settingsClose').addEventListener('click', () => $('#settingsDlg').close());
  $('#changeModel').addEventListener('click', () => { $('#settingsDlg').close(); openSetup(); });
  $('#deleteModel').addEventListener('click', async () => {
    if (!state.modelId) return;
    if (!(await messageBox(t('confirm.delete.title'), t('confirm.delete.body')))) return;
    try { await webllm.deleteModelAllInfoInCache(state.modelId); } catch (e) { console.error(e); }
    state.modelState = 'none';
    localStorage.removeItem('tarjuman.model');
    state.modelId = null;
    updatePill();
    $('#settingsDlg').close();
  });
  $('#clearTm').addEventListener('click', async () => {
    if (await messageBox(t('confirm.clear.title'), t('confirm.clear.body'))) await tm.clear();
  });
  $('#notesLang').addEventListener('change', (e) => {
    state.notesLang = e.target.value;
    localStorage.setItem('tarjuman.notes', state.notesLang);
  });
  $('#lowMem').addEventListener('change', (e) => {
    state.lowMemory = e.target.checked;
    localStorage.setItem('tarjuman.lowmem', state.lowMemory ? '1' : '0');
  });
  $('#autoCheck').addEventListener('change', (e) => {
    state.autoCheck = e.target.checked;
    localStorage.setItem('tarjuman.autocheck', state.autoCheck ? '1' : '0');
  });
  $('#idleRelease').addEventListener('change', (e) => {
    state.idleRelease = e.target.checked;
    localStorage.setItem('tarjuman.idle', state.idleRelease ? '1' : '0');
    touchIdle();
  });
  $('#setupGo').addEventListener('click', startSetup);
  $('#setupCancel').addEventListener('click', () => $('#setupDlg').close());
  $('#setupForm').addEventListener('submit', (e) => e.preventDefault());

  $('#srcLang').addEventListener('change', () => { updateRunLabel(); saveCard(); });
  $('#tgtLang').addEventListener('change', () => { updateVarietyVisibility(); updateRunLabel(); saveCard(); fillDownloadFormats(); });
  $('#swapBtn').addEventListener('click', () => {
    const s = $('#srcLang').value;
    const g = $('#tgtLang').value;
    if (s === 'auto') return;
    $('#srcLang').value = g;
    $('#tgtLang').value = s;
    updateVarietyVisibility();
    updateRunLabel();
    saveCard();
  });
  ['#variety', '#address', '#localize', '#audience', '#glossary'].forEach((sel) => $(sel).addEventListener('change', saveCard));
  $('#suggestGlossary').addEventListener('click', suggestGlossary);
  $('#runBtn').addEventListener('click', runTranslation);
  $('#stopBtn').addEventListener('click', () => { state.abort = true; });
  $('#source').addEventListener('input', updateWordCount);
  $('#source').addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runTranslation(); });

  $('#openBtn').addEventListener('click', () => $('#fileInput').click());
  $('#fileInput').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) await loadFile(f);
    e.target.value = '';
  });
  $('#clearFile').addEventListener('click', clearFile);
  const compose = $('#compose');
  compose.addEventListener('dragover', (e) => { e.preventDefault(); compose.classList.add('dragover'); });
  compose.addEventListener('dragleave', () => compose.classList.remove('dragover'));
  compose.addEventListener('drop', async (e) => {
    e.preventDefault();
    compose.classList.remove('dragover');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) await loadFile(f);
  });

  $('#editBtn').addEventListener('click', async () => {
    if (state.running) { setStatus(t('engine.busy')); return; }
    if (!(await messageBox(t('confirm.edit.title'), t('confirm.edit.body')))) return;
    setMode('compose');
    setStatus(t('status.idle'));
  });
  $('#copyAllBtn').addEventListener('click', () => copyText(resultText()));
  $('#downloadBtn').addEventListener('click', () => download().catch((err) => setStatus(t('error.generic', { msg: String(err && err.message || err) }))));
}

async function init() {
  wire();
  restoreCard();
  applyLanguage();
  setMode('compose');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  if ('launchQueue' in window && window.launchQueue.setConsumer) {
    window.launchQueue.setConsumer(async (params) => {
      if (params.files && params.files.length) {
        try { await loadFile(await params.files[0].getFile()); } catch (e) { console.error(e); }
      }
    });
  }
  await detectGpu();
  if (state.modelId && state.gpu.available) {
    let cached = false;
    try { cached = await webllm.hasModelInCache(state.modelId); } catch (e) { cached = false; }
    if (cached) {
      loadModel(state.modelId).catch(() => {});
      return;
    }
  }
  openSetup();
}

/* Debug hook: lets a test harness inspect state or plug in a fake engine. */
window.tarjuman = { state, runTranslation, loadFile, setMode, updatePill, releaseEngine, checkBlock };

init();
