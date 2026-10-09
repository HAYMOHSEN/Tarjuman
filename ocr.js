/* Tarjuman — on-device OCR with Tesseract (WebAssembly). Everything runs in the browser; the
   recognizer and the language data are served from this app's own folder. */

const BUNDLED = ['ara', 'eng', 'fra', 'deu', 'spa', 'tur'];

const TESS_CODES = {
  ar: 'ara', en: 'eng', fr: 'fra', de: 'deu', es: 'spa', tr: 'tur', it: 'ita', pt: 'por', ru: 'rus',
  zh: 'chi_sim', ja: 'jpn', ko: 'kor', hi: 'hin', ur: 'urd', fa: 'fas', he: 'heb', nl: 'nld', pl: 'pol',
  sv: 'swe', el: 'ell', id: 'ind', ms: 'msa',
};

/** Tesseract language list for a source-language code ('auto' → Arabic + English). */
export function ocrLanguages(sourceCode) {
  const code = TESS_CODES[sourceCode];
  if (!code) return ['ara', 'eng'];
  return code === 'eng' ? ['eng'] : [code, 'eng'];
}

export function isBundled(langs) {
  return langs.every((l) => BUNDLED.includes(l));
}

let tesseractModule = null;

async function loadTesseract() {
  if (!tesseractModule) tesseractModule = (await import('./vendor/tesseract/tesseract.esm.min.js')).default;
  return tesseractModule;
}

/** Render every page of a PDF (pdf.js document) to a canvas. */
export async function renderPdfPages(pdf, { scale = 2.5, onPage } = {}) {
  const canvases = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    canvases.push(canvas);
    if (onPage) onPage(p, pdf.numPages);
  }
  return canvases;
}

/** Recognize a list of images (File, Blob or canvas). Returns the page texts. */
export async function recognize(images, langs, { onProgress, onPage } = {}) {
  const Tesseract = await loadTesseract();
  const base = new URL('./vendor/tesseract/', import.meta.url).href;
  const langPath = isBundled(langs)
    ? base + 'lang'
    : 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/' + langs[0] + '/4.0.0_best_int';
  const worker = await Tesseract.createWorker(langs, Tesseract.OEM.LSTM_ONLY, {
    workerPath: base + 'worker.min.js',
    corePath: base + 'tesseract-core-simd-lstm.wasm.js',
    langPath,
    logger: (m) => { if (onProgress) onProgress(m); },
  });
  const texts = [];
  try {
    for (let i = 0; i < images.length; i++) {
      const { data } = await worker.recognize(images[i]);
      texts.push(cleanOcrText(data.text || ''));
      if (onPage) onPage(i + 1, images.length);
    }
  } finally {
    await worker.terminate();
  }
  return texts;
}

/** Tidy OCR output: strip bidi marks, collapse runs of blank lines, trim line ends. */
export function cleanOcrText(text) {
  return (text || '')
    .replace(/[‎‏‪-‮⁦-⁩]/g, '')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/g, '').replace(/^[ \t]+/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
