/* Nabra — the language model runs inside this Web Worker so the interface
   stays responsive while a document is being translated. */
import { WebWorkerMLCEngineHandler } from './vendor/web-llm.js';

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => handler.onmessage(msg);
