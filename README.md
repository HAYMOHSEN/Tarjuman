# Nabra (نبرة) — private, offline AI translator

A PWA for Windows (Microsoft Store via PWABuilder) that translates between 22 languages, adapts the
tone and register (corporate, academic, neutral, casual, marketing), explains idioms and cultural
references, and translates whole `.docx`, `.pdf`, `.txt`, `.md` and `.srt` files — entirely on the
user's PC. The language model runs on the graphics chip through WebGPU (WebLLM); nothing is uploaded.

## Folder layout

```
nabra/
  index.html            interface and styles
  app.js                application logic (engine, files, review, export)
  core.js               prompts, segmentation, parsers — pure functions, Node-testable
  docx.js               Word round-trip helpers
  llm-worker.js         Web Worker that hosts the model
  sw.js                 service worker (offline app shell)
  manifest.webmanifest  PWA manifest (id "/nabra/")
  privacy.html          privacy policy page for the Store listing
  icons/                app icons (192, 256, 512, maskable)
  vendor/               self-hosted libraries: WebLLM 0.2.85, JSZip 3.10, pdf.js 6.4
```

## Deploy (same pipeline as the other apps)

1. Upload the whole `nabra/` folder to the `haymohsen.github.io` repository so the app is served at
   `https://haymohsen.github.io/nabra/`.
2. Open that URL in Edge once and run a short translation: the first run downloads the chosen engine
   (0.6–5 GB) from the model repository and caches it in the browser.
3. Package with PWABuilder (Windows), app version `1.0.0` / classic `1.0.0`, and submit in Partner
   Center. The listing text and system requirements are in `STORE-LISTING.md`; the privacy policy URL
   is `https://haymohsen.github.io/nabra/privacy.html`.

## Updating

* Bump `APP_VERSION` in `app.js` and `VERSION` in `sw.js` (the service worker only refreshes the
  cached shell when its version string changes), re-upload, then repackage with a higher package
  version in PWABuilder.
* To change the engine list, edit `MODEL_TIERS` in `core.js`. The IDs must exist in WebLLM's
  `prebuiltAppConfig` for the bundled version (`vendor/web-llm.js`).

## How it works

* **Style card** — the language pair, register, Arabic variety, form of address, audience note and
  glossary are turned into one system prompt (`core.buildSystemPrompt`) that is sent with every
  paragraph, which keeps long documents consistent.
* **Segmentation** — text is split on blank lines; blocks over 1,400 characters are split at sentence
  boundaries and re-joined after translation. Short lines (headings, bullets) are batched ten at a time
  with numbered markers and fall back to one-by-one if the model breaks the numbering.
* **Translation memory** — every translated segment is stored in IndexedDB keyed by text + style card,
  so repeated sentences are reused instantly.
* **Word files** — `docx.js` replaces the text of each paragraph in `word/document.xml` while keeping
  paragraph styles, numbering and the first run's formatting, and sets right-to-left properties when
  the target language needs them. Headers, footers and footnotes are left untouched.
* **PDF** — pdf.js extracts the text layer; lines are grouped into paragraphs by vertical spacing.
  Scanned PDFs (no text layer) are rejected with a message.
* **Subtitles** — cue numbers and timecodes are preserved; only the text lines are translated.

## Testing the pure logic

```
npm install @xmldom/xmldom   # once, for the Word tests
node tests/test-core.mjs
```
