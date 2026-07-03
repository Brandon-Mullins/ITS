import screenshot from 'screenshot-desktop';
import sharp from 'sharp';
import { createWorker, type Worker } from 'tesseract.js';
import type { GameWindowInfo } from './game-window';

export interface ScreenReaderConfig {
  items: string[];
  currentStepText: string;
  stepKeywords: string[];
}

export interface ScreenReaderResult {
  timestamp: string;
  detectedItems: string[];
  bankVisibleItems: string[];
  suggestStepComplete: boolean;
  ocrSnippet: string;
  bankOpen: boolean;
}

let worker: Worker | null = null;
let workerInit: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (worker) return worker;
  if (!workerInit) {
    workerInit = (async () => {
      const w = await createWorker('eng', 1, {
        logger: () => {},
      });
      worker = w;
      return w;
    })();
  }
  return workerInit;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseItemSearchTerms(itemLabel: string): string[] {
  const base = itemLabel.replace(/\([^)]*\)/g, '').trim();
  const terms = new Set<string>();
  if (base.length >= 3) terms.add(normalize(base));
  // Also add individual significant words
  for (const word of base.split(/\s+/)) {
    const w = normalize(word);
    if (w.length >= 4) terms.add(w);
  }
  return Array.from(terms);
}

export function buildItemSearchMap(items: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const item of items) {
    map.set(item, parseItemSearchTerms(item));
  }
  return map;
}

export function extractStepKeywords(stepText: string): string[] {
  const words = normalize(stepText).split(' ');
  return words
    .filter((w) => w.length >= 5)
    .filter((w) => !['speak', 'talk', 'return', 'quest', 'click', 'start'].includes(w))
    .slice(0, 6);
}

const WITHDRAW_PHRASES = [
  'you withdraw',
  'you take',
  'you get',
  'you obtain',
  'you receive',
  'you collect',
  'you pick up',
  'you put aside',
  'you add',
  'you grab',
];

const STEP_COMPLETE_PHRASES = [
  'quest complete',
  'you have completed',
  'well done',
  'congratulations',
  'you finish',
  'you complete',
  'step complete',
];

async function captureRegion(bounds: GameWindowInfo['bounds'], region: 'full' | 'chat'): Promise<Buffer | null> {
  if (!bounds) return null;

  try {
    const fullScreen = await screenshot({ format: 'png' });
    let crop = {
      left: Math.max(0, bounds.x),
      top: Math.max(0, bounds.y),
      width: bounds.width,
      height: bounds.height,
    };

    if (region === 'chat') {
      crop = {
        left: crop.left,
        top: crop.top + Math.floor(bounds.height * 0.72),
        width: crop.width,
        height: Math.floor(bounds.height * 0.28),
      };
    }

    return sharp(fullScreen)
      .extract(crop)
      .resize({ width: Math.min(crop.width, 800) })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

async function ocrBuffer(buffer: Buffer): Promise<string> {
  const w = await getWorker();
  const { data } = await w.recognize(buffer);
  return data.text;
}

export async function scanGameScreen(
  gameInfo: GameWindowInfo,
  config: ScreenReaderConfig,
): Promise<ScreenReaderResult | null> {
  if (!gameInfo.found || !gameInfo.bounds) return null;

  const itemMap = buildItemSearchMap(config.items);
  const detectedItems = new Set<string>();
  const bankVisibleItems = new Set<string>();

  const fullBuffer = await captureRegion(gameInfo.bounds, 'full');
  const chatBuffer = await captureRegion(gameInfo.bounds, 'chat');

  if (!fullBuffer) return null;

  const [fullText, chatText] = await Promise.all([
    ocrBuffer(fullBuffer),
    chatBuffer ? ocrBuffer(chatBuffer) : Promise.resolve(''),
  ]);

  const combined = normalize(fullText + ' ' + chatText);
  const chatNorm = normalize(chatText);
  const bankOpen = combined.includes('bank') || combined.includes('withdraw') || combined.includes('deposit');

  for (const [itemLabel, terms] of itemMap) {
    for (const term of terms) {
      if (term.length < 3) continue;

      const inScreen = combined.includes(term);
      if (!inScreen) continue;

      if (bankOpen) {
        bankVisibleItems.add(itemLabel);
      }

      const withdrawn = WITHDRAW_PHRASES.some(
        (p) => chatNorm.includes(p) && chatNorm.includes(term),
      );
      const inChat = chatNorm.includes(term);
      const hasAction = WITHDRAW_PHRASES.some((p) => chatNorm.includes(p));

      if (withdrawn || (inChat && hasAction) || (!bankOpen && inScreen && term.length >= 5)) {
        detectedItems.add(itemLabel);
      }
    }
  }

  const stepKeywords = config.stepKeywords.length > 0
    ? config.stepKeywords
    : extractStepKeywords(config.currentStepText);

  const keywordHits = stepKeywords.filter((kw) => chatNorm.includes(kw)).length;
  const hasCompletePhrase = STEP_COMPLETE_PHRASES.some((p) => chatNorm.includes(p));
  const hasAction = WITHDRAW_PHRASES.some((p) => chatNorm.includes(p)) || chatNorm.includes('you talk') || chatNorm.includes('you speak');

  const suggestStepComplete =
    hasCompletePhrase ||
    (keywordHits >= 2 && hasAction) ||
    (keywordHits >= 1 && hasCompletePhrase);

  return {
    timestamp: new Date().toISOString(),
    detectedItems: Array.from(detectedItems),
    bankVisibleItems: Array.from(bankVisibleItems),
    suggestStepComplete,
    ocrSnippet: chatText.slice(0, 120).trim(),
    bankOpen,
  };
}

export async function disposeScreenReader(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
    workerInit = null;
  }
}
