import screenshot from 'screenshot-desktop';
import sharp from 'sharp';
import { createWorker, type Worker } from 'tesseract.js';
import type { GameWindowInfo } from './game-window';
import {
  type InventoryCalibration,
  type InventorySlotHighlight,
  DEFAULT_INVENTORY_CALIBRATION,
  inventoryRectInGame,
  pointToSlot,
  slotRectInInventory,
  INV_COLS,
  INV_ROWS,
  HIGHLIGHT_CONFIDENCE_MIN,
} from './inventory-slots';

export interface OcrDebugBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface ScreenReaderConfig {
  items: string[];
  currentStepText: string;
  stepKeywords: string[];
  inventoryCalibration?: InventoryCalibration | null;
  completionChecks?: {
    chatContains?: string[];
    questJournalContains?: string[];
    inventoryContains?: string[];
    locationContains?: string[];
  };
}

export interface ScreenReaderResult {
  timestamp: string;
  detectedItems: string[];
  bankItems: string[];
  needGeItems: string[];
  suggestStepComplete: boolean;
  ocrSnippet: string;
  bankOpen: boolean;
  bankScanned: boolean;
  inventoryScanned: boolean;
  chatItemsAdded: string[];
  chatItemsRemoved: string[];
  inventorySlots: InventorySlotHighlight[];
  ocrDebugBoxes: OcrDebugBox[];
  gameBounds: { x: number; y: number; width: number; height: number } | null;
}

let worker: Worker | null = null;
let workerInit: Promise<Worker> | null = null;
let lastBankScanItems = new Set<string>();
let bankEverScanned = false;

async function getWorker(): Promise<Worker> {
  if (worker) return worker;
  if (!workerInit) {
    workerInit = (async () => {
      const w = await createWorker('eng', 1, { logger: () => {} });
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

  const parts = /\bor\b/i.test(base) ? base.split(/\bor\b/i).map((s) => s.trim()) : [base];
  for (const part of parts) {
    if (part.length >= 3) terms.add(normalize(part));
    for (const word of part.split(/\s+/)) {
      const w = normalize(word);
      if (w.length >= 3) terms.add(w);
    }
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

const PICKUP_PHRASES = [
  'you pick up',
  'you pick up a',
  'you pick up an',
  'you pick up the',
  'you pick up some',
  'you withdraw',
  'you take',
  'you get',
  'you obtain',
  'you receive',
  'you collect',
  'you take a',
  'you take an',
  'you take the',
  'you get a',
  'you get an',
  'you put aside',
  'you add',
  'you grab',
  'you take out',
  'you loot',
  'you found',
  'you retrieve',
  'added to your inventory',
  'you create',
];

const DROP_PHRASES = [
  'you drop',
  'you drop a',
  'you drop an',
  'you drop the',
  'you destroy',
  'you lose',
  'you sacrifice',
  'you remove',
  'you discard',
  'you bury',
];

const DEPOSIT_PHRASES = [
  'you deposit',
  'you deposit a',
  'you deposit an',
  'you deposit the',
  'you bank',
  'you put in your bank',
  'you store',
];

/** @deprecated use PICKUP_PHRASES */
const WITHDRAW_PHRASES = PICKUP_PHRASES;

const STEP_COMPLETE_PHRASES = [
  'quest complete',
  'you have completed',
  'well done',
  'congratulations',
  'you finish',
  'you complete',
  'quest journal updated',
  'journal has been updated',
  'your quest journal',
  'progress on your quest',
  'you have made progress',
  'you talk to',
  'you speak to',
  'you say',
  'you tell',
  'you answer',
];

const DIALOGUE_PHRASES = [
  'you talk to',
  'you speak to',
  'you have a conversation',
  'they say',
  'he says',
  'she says',
];

const LOCATION_PHRASES = [
  'you arrive',
  'you enter',
  'you walk to',
  'you travel to',
  'you teleport to',
  'you find yourself',
];

type CaptureRegion = 'full' | 'chat' | 'bank' | 'inventory';

interface CropResult {
  buffer: Buffer;
  crop: { left: number; top: number; width: number; height: number };
  scaledWidth: number;
}

async function captureRegion(
  bounds: GameWindowInfo['bounds'],
  region: CaptureRegion,
  calibration?: InventoryCalibration | null,
): Promise<CropResult | null> {
  if (!bounds) return null;

  try {
    const fullScreen = await screenshot({ format: 'png' });
    let crop = {
      left: Math.max(0, bounds.x),
      top: Math.max(0, bounds.y),
      width: bounds.width,
      height: bounds.height,
    };

    switch (region) {
      case 'chat':
        crop = {
          left: crop.left,
          top: crop.top + Math.floor(bounds.height * 0.72),
          width: crop.width,
          height: Math.floor(bounds.height * 0.26),
        };
        break;
      case 'bank':
        crop = {
          left: crop.left + Math.floor(bounds.width * 0.18),
          top: crop.top + Math.floor(bounds.height * 0.12),
          width: Math.floor(bounds.width * 0.64),
          height: Math.floor(bounds.height * 0.62),
        };
        break;
      case 'inventory': {
        const cal = calibration ?? DEFAULT_INVENTORY_CALIBRATION;
        crop = {
          left: crop.left + Math.floor(bounds.width * cal.left),
          top: crop.top + Math.floor(bounds.height * cal.top),
          width: Math.floor(bounds.width * cal.width),
          height: Math.floor(bounds.height * cal.height),
        };
        break;
      }
      default:
        break;
    }

    const maxWidth = region === 'bank' ? 900 : region === 'inventory' ? 500 : 800;
    const scaledWidth = Math.min(crop.width, maxWidth);
    const buffer = await sharp(fullScreen)
      .extract(crop)
      .resize({ width: scaledWidth })
      .sharpen()
      .png()
      .toBuffer();

    return { buffer, crop, scaledWidth };
  } catch {
    return null;
  }
}

async function ocrBuffer(buffer: Buffer): Promise<string> {
  const w = await getWorker();
  const { data } = await w.recognize(buffer);
  return data.text;
}

function termMatchesWord(term: string, word: string): boolean {
  const t = normalize(term);
  const w = normalize(word);
  if (t.length < 3 || w.length < 3) return false;
  return w.includes(t) || t.includes(w);
}

async function detectInventorySlots(
  invCapture: CropResult,
  gameBounds: NonNullable<GameWindowInfo['bounds']>,
  calibration: InventoryCalibration | null | undefined,
  itemMap: Map<string, string[]>,
  targetItems: string[],
): Promise<{ slots: InventorySlotHighlight[]; ocrBoxes: OcrDebugBox[] }> {
  const slots: InventorySlotHighlight[] = [];
  const ocrBoxes: OcrDebugBox[] = [];
  const invRect = inventoryRectInGame(gameBounds, calibration);
  const cols = calibration?.cols ?? INV_COLS;
  const rows = calibration?.rows ?? INV_ROWS;

  const w = await getWorker();
  const { data } = await w.recognize(invCapture.buffer);
  const scale = invCapture.crop.width / invCapture.scaledWidth;

  const ocrWords: Array<{ text: string; confidence: number; bbox: { x0: number; y1: number; x1: number; y0: number } }> = [];
  for (const block of data.blocks ?? []) {
    for (const para of block.paragraphs ?? []) {
      for (const line of para.lines ?? []) {
        for (const word of line.words ?? []) {
          if (word.text?.trim()) ocrWords.push(word);
        }
      }
    }
  }

  for (const word of ocrWords) {
    const conf = (word.confidence ?? 0) / 100;
    const text = word.text?.trim() ?? '';
    if (!text) continue;

    const bx0 = (word.bbox.x0 ?? 0) * scale;
    const by0 = (word.bbox.y0 ?? 0) * scale;
    const bx1 = (word.bbox.x1 ?? 0) * scale;
    const by1 = (word.bbox.y1 ?? 0) * scale;
    const localCx = (bx0 + bx1) / 2;
    const localCy = (by0 + by1) / 2;

    const screenX = invCapture.crop.left + bx0;
    const screenY = invCapture.crop.top + by0;
    const screenW = bx1 - bx0;
    const screenH = by1 - by0;

    ocrBoxes.push({
      x: screenX,
      y: screenY,
      width: screenW,
      height: screenH,
      label: text,
      confidence: conf,
    });

    if (conf < HIGHLIGHT_CONFIDENCE_MIN) continue;

    for (const itemLabel of targetItems) {
      const terms = itemMap.get(itemLabel) ?? [];
      const matched = terms.some((term) => termMatchesWord(term, text));
      if (!matched) continue;

      const localInInv = {
        x: localCx,
        y: localCy,
      };
      const invW = invCapture.crop.width;
      const invH = invCapture.crop.height;
      const slotPos = pointToSlot(localInInv.x, localInInv.y, invW, invH, cols, rows);
      if (!slotPos) continue;

      const slotRect = slotRectInInventory(invRect, slotPos.col, slotPos.row, cols, rows);
      const existing = slots.find((s) => s.item === itemLabel);
      if (existing && existing.confidence >= conf) continue;

      const entry: InventorySlotHighlight = {
        item: itemLabel,
        confidence: conf,
        slotIndex: slotPos.slotIndex,
        col: slotPos.col,
        row: slotPos.row,
        ...slotRect,
      };

      if (existing) {
        const idx = slots.indexOf(existing);
        slots[idx] = entry;
      } else {
        slots.push(entry);
      }
    }
  }

  return { slots, ocrBoxes };
}

function matchItemInBlob(
  blob: string,
  itemLabel: string,
  terms: string[],
): boolean {
  for (const term of terms) {
    if (term.length >= 3 && blob.includes(term)) return true;
  }
  return false;
}

/** Parse RS3 chat for pick-up, drop, and bank deposit events */
export function parseChatInventoryEvents(
  chatText: string,
  itemMap: Map<string, string[]>,
): { added: string[]; removed: string[] } {
  const added = new Set<string>();
  const removed = new Set<string>();
  const norm = normalize(chatText);
  const lines = chatText.split(/\r?\n/).map((l) => normalize(l)).filter(Boolean);

  const checkLine = (line: string, phrases: string[], target: Set<string>) => {
    for (const [itemLabel, terms] of itemMap) {
      if (!matchItemInBlob(line, itemLabel, terms)) continue;
      for (const phrase of phrases) {
        if (line.includes(phrase)) {
          target.add(itemLabel);
          break;
        }
      }
    }
  };

  for (const line of lines) {
    checkLine(line, PICKUP_PHRASES, added);
    checkLine(line, DROP_PHRASES, removed);
    checkLine(line, DEPOSIT_PHRASES, removed);
  }

  // Proximity match: pickup phrase within ~100 chars of item term in full chat
  for (const [itemLabel, terms] of itemMap) {
    for (const phrase of PICKUP_PHRASES) {
      let idx = 0;
      while ((idx = norm.indexOf(phrase, idx)) >= 0) {
        const window = norm.slice(idx, idx + 140);
        if (terms.some((t) => t.length >= 3 && window.includes(t))) added.add(itemLabel);
        idx += phrase.length;
      }
    }
    for (const phrase of [...DROP_PHRASES, ...DEPOSIT_PHRASES]) {
      let idx = 0;
      while ((idx = norm.indexOf(phrase, idx)) >= 0) {
        const window = norm.slice(idx, idx + 140);
        if (terms.some((t) => t.length >= 3 && window.includes(t))) removed.add(itemLabel);
        idx += phrase.length;
      }
    }
  }

  return { added: Array.from(added), removed: Array.from(removed) };
}

function matchItemsInText(
  text: string,
  itemMap: Map<string, string[]>,
): string[] {
  const norm = normalize(text);
  const found: string[] = [];
  for (const [itemLabel, terms] of itemMap) {
    for (const term of terms) {
      if (term.length >= 3 && norm.includes(term)) {
        found.push(itemLabel);
        break;
      }
    }
  }
  return found;
}

export async function scanGameScreen(
  gameInfo: GameWindowInfo,
  config: ScreenReaderConfig,
): Promise<ScreenReaderResult | null> {
  if (!gameInfo.found || !gameInfo.bounds) return null;

  const itemMap = buildItemSearchMap(config.items);
  const inventoryItems = new Set<string>();
  const bankItems = new Set<string>();

  const calibration = config.inventoryCalibration;
  const [fullCapture, chatCapture] = await Promise.all([
    captureRegion(gameInfo.bounds, 'full', calibration),
    captureRegion(gameInfo.bounds, 'chat', calibration),
  ]);

  if (!fullCapture) return null;

  const fullText = await ocrBuffer(fullCapture.buffer);
  const chatText = chatCapture ? await ocrBuffer(chatCapture.buffer) : '';
  const combined = normalize(fullText + ' ' + chatText);
  const chatNorm = normalize(chatText);

  const bankOpen =
    combined.includes('bank') ||
    combined.includes('withdraw') ||
    combined.includes('deposit') ||
    combined.includes('bank of');

  let bankScanned = false;

  if (bankOpen) {
    const bankCapture = await captureRegion(gameInfo.bounds, 'bank', calibration);
    if (bankCapture) {
      const bankText = await ocrBuffer(bankCapture.buffer);
      bankEverScanned = true;
      for (const item of matchItemsInText(bankText, itemMap)) {
        bankItems.add(item);
        lastBankScanItems.add(item);
      }
      bankScanned = true;
    }
  }

  let inventorySlots: InventorySlotHighlight[] = [];
  let ocrDebugBoxes: OcrDebugBox[] = [];

  let inventoryScanned = false;

  const invCapture = await captureRegion(gameInfo.bounds, 'inventory', calibration);
  if (invCapture) {
    inventoryScanned = true;
    const invText = await ocrBuffer(invCapture.buffer);
    for (const item of matchItemsInText(invText, itemMap)) {
      inventoryItems.add(item);
    }
    const slotResult = await detectInventorySlots(
      invCapture,
      gameInfo.bounds,
      calibration,
      itemMap,
      config.items,
    );
    inventorySlots = slotResult.slots;
    ocrDebugBoxes = slotResult.ocrBoxes;
    for (const slot of inventorySlots) {
      inventoryItems.add(slot.item);
    }
  }

  const chatEvents = parseChatInventoryEvents(chatText, itemMap);
  for (const item of chatEvents.added) inventoryItems.add(item);

  // Items confirmed in inventory
  const detectedItems = Array.from(inventoryItems);

  // GE needed: not in inventory, bank was scanned, not found in bank (current or last scan)
  const needGeItems: string[] = [];
  const allBankKnown = new Set([...bankItems, ...lastBankScanItems]);
  if (bankEverScanned) {
    for (const item of config.items) {
      if (inventoryItems.has(item)) continue;
      if (allBankKnown.has(item)) continue;
      needGeItems.push(item);
    }
  }

  const stepKeywords =
    config.stepKeywords.length > 0
      ? config.stepKeywords
      : extractStepKeywords(config.currentStepText);

  const keywordHits = stepKeywords.filter((kw) => combined.includes(kw)).length;
  const chatKeywordHits = stepKeywords.filter((kw) => chatNorm.includes(kw)).length;
  const hasCompletePhrase = STEP_COMPLETE_PHRASES.some((p) => chatNorm.includes(p));
  const hasDialogue = DIALOGUE_PHRASES.some((p) => chatNorm.includes(p));
  const hasLocation = LOCATION_PHRASES.some((p) => chatNorm.includes(p));
  const hasWithdraw = WITHDRAW_PHRASES.some((p) => chatNorm.includes(p));
  const hasJournalUpdate =
    chatNorm.includes('journal') &&
    (chatNorm.includes('updated') || chatNorm.includes('progress'));

  const checks = config.completionChecks;
  let completionCheckHit = false;
  if (checks) {
    const chatHits =
      (checks.chatContains ?? []).filter((p) => chatNorm.includes(p.toLowerCase())).length;
    const journalHits =
      (checks.questJournalContains ?? []).filter((p) => combined.includes(p.toLowerCase())).length;
    const invHits =
      (checks.inventoryContains ?? []).filter((p) => combined.includes(p.toLowerCase())).length;
    const locHits =
      (checks.locationContains ?? []).filter((p) => combined.includes(p.toLowerCase())).length;

    completionCheckHit =
      (checks.chatContains?.length ? chatHits >= 1 : false) ||
      (checks.questJournalContains?.length ? journalHits >= 1 : false) ||
      (checks.inventoryContains?.length ? invHits >= 1 : false) ||
      (checks.locationContains?.length ? locHits >= 1 : false) ||
      (chatHits >= 2) ||
      (chatHits >= 1 && journalHits >= 1);
  }

  const suggestStepComplete =
    hasCompletePhrase ||
    hasJournalUpdate ||
    completionCheckHit ||
    (chatKeywordHits >= 2 && (hasDialogue || hasWithdraw || hasLocation)) ||
    (chatKeywordHits >= 1 && hasCompletePhrase) ||
    (keywordHits >= 2 && (hasDialogue || hasWithdraw));

  return {
    timestamp: new Date().toISOString(),
    detectedItems,
    bankItems: Array.from(bankItems),
    needGeItems,
    suggestStepComplete,
    ocrSnippet: chatText.slice(0, 200).trim(),
    bankOpen,
    bankScanned,
    inventoryScanned,
    chatItemsAdded: chatEvents.added,
    chatItemsRemoved: chatEvents.removed,
    inventorySlots,
    ocrDebugBoxes,
    gameBounds: gameInfo.bounds,
  };
}

export function resetBankScanCache(): void {
  lastBankScanItems = new Set();
  bankEverScanned = false;
}

export async function disposeScreenReader(): Promise<void> {
  lastBankScanItems = new Set();
  if (worker) {
    await worker.terminate();
    worker = null;
    workerInit = null;
  }
}
