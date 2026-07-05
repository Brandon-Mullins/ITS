import type { QuestGuide, QuestProgress, QuestStep, ScreenReaderResult } from '../types/quest';
import { extractItemName } from './items';
import { listIncludesItem } from './item-match';
import type { ClickTargetCard, QuestAction } from './click-targets';
import { buildClickTargetCards } from './click-targets';

export interface ConfidenceSignal {
  id: string;
  label: string;
  status: 'detected' | 'waiting' | 'missing' | 'unknown';
  detail?: string;
}

export interface StepWarning {
  id: string;
  severity: 'danger' | 'caution' | 'info';
  title: string;
  message: string;
}

export interface StepDebugInfo {
  stepId: string;
  stepIndex: number;
  instruction: string;
  expectedCards: ClickTargetCard[];
  completionChecks: QuestStep['completionChecks'];
  scan: ScreenReaderResult | null;
  confidence: ConfidenceSignal[];
  completionReason: string;
  suggestStepComplete: boolean;
}

const ACTION_VERBS: Array<{ pattern: RegExp; action: QuestAction }> = [
  { pattern: /\b(?:talk|speak)\s+(?:to|with)\b/i, action: 'Talk-to' },
  { pattern: /\buse\b/i, action: 'Use' },
  { pattern: /\bsearch\b/i, action: 'Search' },
  { pattern: /\bclimb\b/i, action: 'Climb' },
  { pattern: /\benter\b/i, action: 'Enter' },
  { pattern: /\boperate\b/i, action: 'Operate' },
  { pattern: /\bequip\b|\bwield\b/i, action: 'Equip' },
  { pattern: /\bwithdraw\b|\btake\b.*\bbank\b/i, action: 'Withdraw' },
];

export function inferActionFromText(text: string): QuestAction {
  for (const { pattern, action } of ACTION_VERBS) {
    if (pattern.test(text)) return action;
  }
  return 'Click';
}

function ocrContains(ocr: string, phrases: string[] | undefined): boolean {
  if (!phrases?.length || !ocr) return false;
  const norm = ocr.toLowerCase();
  return phrases.some((p) => norm.includes(p.toLowerCase()));
}

export function buildConfidenceSignals(
  step: QuestStep,
  progress: QuestProgress,
  scan: ScreenReaderResult | null,
): ConfidenceSignal[] {
  const inv = progress.collectedItems ?? [];
  const bank = progress.bankItems ?? [];
  const ocr = scan?.ocrSnippet ?? '';
  const checks = step.completionChecks;

  const npcName = step.npc ?? step.markers?.npc ?? '';
  const npcDetected = npcName
    ? ocrContains(ocr, [npcName, ...npcName.split(' ').filter((w) => w.length >= 4)])
    : false;

  const stepItems = step.stepItems ?? [];
  const itemsReady = stepItems.length === 0
    || stepItems.every((item) => listIncludesItem(inv, item) || listIncludesItem(scan?.detectedItems ?? [], item));

  const locationOk = checks?.locationContains?.length
    ? ocrContains(ocr, checks.locationContains)
    : !step.location;

  const journalHit = ocrContains(ocr, checks?.questJournalContains);
  const chatHit = ocrContains(ocr, checks?.chatContains);
  const waitingJournal = Boolean(checks?.questJournalContains?.length) && !journalHit && !scan?.suggestStepComplete;

  return [
    {
      id: 'npc',
      label: 'NPC nearby',
      status: npcName ? (npcDetected || chatHit ? 'detected' : 'waiting') : 'unknown',
      detail: npcName || 'No NPC for this step',
    },
    {
      id: 'inventory',
      label: 'Items in inventory',
      status: stepItems.length === 0 ? 'unknown' : itemsReady ? 'detected' : 'missing',
      detail: stepItems.length ? `${stepItems.filter((i) => listIncludesItem(inv, i)).length}/${stepItems.length} ready` : undefined,
    },
    {
      id: 'area',
      label: 'Correct area',
      status: step.location || checks?.locationContains?.length
        ? locationOk ? 'detected' : 'waiting'
        : 'unknown',
      detail: step.location ?? checks?.locationContains?.join(', '),
    },
    {
      id: 'bank',
      label: 'Bank item available',
      status: scan?.bankOpen
        ? (bank.length > 0 ? 'detected' : 'waiting')
        : 'unknown',
      detail: scan?.bankOpen ? 'Bank interface open' : 'Open bank to scan',
    },
    {
      id: 'journal',
      label: 'Quest journal / chat',
      status: scan?.suggestStepComplete
        ? 'detected'
        : waitingJournal
          ? 'waiting'
          : chatHit || journalHit
            ? 'detected'
            : 'waiting',
      detail: scan?.suggestStepComplete ? 'Step completion suggested' : 'Watching chat & journal',
    },
  ];
}

export function buildStepWarnings(
  step: QuestStep,
  guide: QuestGuide,
  progress: QuestProgress,
  cards: ClickTargetCard[],
): StepWarning[] {
  const warnings: StepWarning[] = [];
  const inv = progress.collectedItems ?? [];
  const bank = progress.bankItems ?? [];
  const itemBrain = guide.itemBrain;
  const stepItems = step.stepItems?.length ? step.stepItems : guide.metadata.items;
  const currentIndex = progress.currentStepIndex;
  const nextStep = guide.steps[currentIndex + 1];

  for (const item of stepItems) {
    const hasInv = listIncludesItem(inv, item);
    const hasBank = listIncludesItem(bank, item);
    if (!hasInv && !hasBank) {
      warnings.push({
        id: `missing-${item}`,
        severity: 'danger',
        title: 'Missing required item',
        message: `You need ${extractItemName(item)} before continuing this step.`,
      });
    }
  }

  for (const item of itemBrain?.consumed ?? []) {
    if (stepItems.some((s) => listIncludesItem([s], item)) || step.text.toLowerCase().includes(extractItemName(item).toLowerCase())) {
      warnings.push({
        id: `consumed-${item}`,
        severity: 'caution',
        title: 'Item will be consumed',
        message: `${extractItemName(item)} may be used up during this step — bring extras if needed.`,
      });
    }
  }

  const combined = `${step.text} ${step.areaWarning ?? ''} ${(step.puzzleHints ?? []).join(' ')}`.toLowerCase();
  if (combined.includes('inventory space') || combined.includes('empty slot') || combined.includes('free slot')) {
    warnings.push({
      id: 'inventory-space',
      severity: 'caution',
      title: 'Free inventory slots needed',
      message: 'Make sure you have empty inventory slots before continuing.',
    });
  }
  if (combined.includes('spellbook') || combined.includes('prayer') || combined.includes('ancient') || combined.includes('lunar')) {
    warnings.push({
      id: 'spellbook',
      severity: 'caution',
      title: 'Check spellbook / prayer / book',
      message: 'This step may require a specific spellbook, prayer, or book — verify before continuing.',
    });
  }

  if (step.areaWarning) {
    warnings.push({
      id: 'area-warning',
      severity: 'caution',
      title: 'Area caution',
      message: step.areaWarning,
    });
  }

  if ((step.combatWarnings?.length ?? 0) > 0) {
    warnings.push({
      id: 'combat-now',
      severity: 'danger',
      title: 'Combat on this step',
      message: step.combatWarnings!.join(' · '),
    });
  } else if ((nextStep?.combatWarnings?.length ?? 0) > 0) {
    warnings.push({
      id: 'combat-next',
      severity: 'info',
      title: 'Combat coming next',
      message: `Next step: ${nextStep!.combatWarnings!.join(' · ')}`,
    });
  }

  if (combined.includes('reset') || combined.includes('leave') || combined.includes('do not leave')) {
    warnings.push({
      id: 'area-reset',
      severity: 'danger',
      title: 'Leaving may reset progress',
      message: 'Do not leave this area until the step is complete.',
    });
  }

  const missingCards = cards.filter((c) => c.aura === 'red');
  if (missingCards.length > 0 && !warnings.some((w) => w.id.startsWith('missing-'))) {
    warnings.push({
      id: 'missing-target',
      severity: 'danger',
      title: 'Missing click target',
      message: `Still need: ${missingCards.map((c) => c.name).join(', ')}`,
    });
  }

  return warnings;
}

function explainCompletion(step: QuestStep, scan: ScreenReaderResult | null): string {
  if (!scan) return 'No scan data yet — open RS3 with the helper running.';
  if (scan.suggestStepComplete) return 'OCR detected step-completion signals (chat, journal, or keywords).';

  const ocr = scan.ocrSnippet.toLowerCase();
  const checks = step.completionChecks;
  const hits: string[] = [];
  const misses: string[] = [];

  for (const p of checks?.chatContains ?? []) {
    (ocr.includes(p.toLowerCase()) ? hits : misses).push(`chat:"${p}"`);
  }
  for (const p of checks?.locationContains ?? []) {
    (ocr.includes(p.toLowerCase()) ? hits : misses).push(`location:"${p}"`);
  }
  for (const p of checks?.questJournalContains ?? []) {
    (ocr.includes(p.toLowerCase()) ? hits : misses).push(`journal:"${p}"`);
  }
  for (const p of checks?.inventoryContains ?? []) {
    const ok = (scan.detectedItems ?? []).some((d) => d.toLowerCase().includes(p.toLowerCase()));
    (ok ? hits : misses).push(`inventory:"${p}"`);
  }

  if (hits.length === 0 && misses.length === 0) return 'No completion checks defined for this step.';
  return `Matched: ${hits.join(', ') || 'none'}. Waiting on: ${misses.join(', ') || 'none'}.`;
}

export function buildStepDebugInfo(
  guide: QuestGuide,
  progress: QuestProgress,
  scan: ScreenReaderResult | null,
): StepDebugInfo {
  const stepIndex = Math.min(progress.currentStepIndex, guide.steps.length - 1);
  const step = guide.steps[stepIndex];
  const cards = buildClickTargetCards(step, progress, guide.itemBrain);

  return {
    stepId: step.id,
    stepIndex,
    instruction: step.text,
    expectedCards: cards,
    completionChecks: step.completionChecks,
    scan,
    confidence: buildConfidenceSignals(step, progress, scan),
    completionReason: explainCompletion(step, scan),
    suggestStepComplete: scan?.suggestStepComplete ?? false,
  };
}

export function getUseOnPairs(cards: ClickTargetCard[]): Array<{ item: string; target: string }> {
  return cards
    .filter((c) => c.useOnTarget && (c.kind === 'inventory-item' || c.action === 'Use'))
    .map((c) => ({ item: c.name, target: c.useOnTarget! }));
}

/** Which dialogue option to highlight as "next" based on OCR chat snippet */
export function getDialogueNextIndex(choices: string[], ocrSnippet: string): number {
  if (choices.length === 0) return 0;
  const norm = ocrSnippet.toLowerCase();
  for (let i = 0; i < choices.length; i++) {
    const words = choices[i].toLowerCase().split(/\s+/).filter((w) => w.length >= 4);
    const matched = words.length > 0 && words.some((w) => norm.includes(w));
    if (!matched) return i;
  }
  return choices.length - 1;
}
