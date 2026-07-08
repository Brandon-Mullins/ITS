/** Parse dialogue and combat hints from quest step text */

const OPTION_PATTERNS = [
  /(?:choose|select|pick)\s+(?:the\s+)?(first|second|third|fourth|1st|2nd|3rd|4th|\d+)\s+option/gi,
  /(?:option|choice)\s*#?\s*(\d+)/gi,
  /'''([^']+)'''/g,
];

const ORDINAL_MAP: Record<string, string> = {
  first: '1', '1st': '1', second: '2', '2nd': '2',
  third: '3', '3rd': '3', fourth: '4', '4th': '4',
};

export function parseDialogueHints(rawWikitext: string, cleanText: string): string[] {
  const hints: string[] = [];
  const seen = new Set<string>();

  for (const pattern of OPTION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(rawWikitext + ' ' + cleanText)) !== null) {
      const val = match[1];
      if (/^\d+$/.test(val) || ORDINAL_MAP[val.toLowerCase()]) {
        const num = ORDINAL_MAP[val.toLowerCase()] ?? val;
        const hint = `Select option ${num}`;
        if (!seen.has(hint)) { seen.add(hint); hints.push(hint); }
      } else if (val.length > 3 && val.length < 80) {
        const hint = `Say: "${val.trim()}"`;
        if (!seen.has(hint)) { seen.add(hint); hints.push(hint); }
      }
    }
  }

  // "Answer X" / "Tell him X" patterns from clean text
  const sayMatch = cleanText.match(/(?:answer|reply|tell (?:him|her|them)|say)\s+["""']?([^"""'.]+)/i);
  if (sayMatch?.[1] && sayMatch[1].length > 3) {
    const hint = `Say: "${sayMatch[1].trim()}"`;
    if (!seen.has(hint)) hints.push(hint);
  }

  // Yes/No dialogue
  if (/\b(yes|no)\b/i.test(cleanText) && /(?:choose|select|option|answer)/i.test(cleanText)) {
    const yesNo = cleanText.match(/\b(Yes|No)\b/);
    if (yesNo) hints.push(`Choose "${yesNo[1]}"`);
  }

  return hints.slice(0, 4);
}

const COMBAT_PATTERNS: Array<{ pattern: RegExp; warning: string }> = [
  { pattern: /protect from magic/i, warning: 'Activate Protect from Magic prayer' },
  { pattern: /protect from melee/i, warning: 'Activate Protect from Melee prayer' },
  { pattern: /protect from (?:missiles|ranged)/i, warning: 'Activate Protect from Missiles prayer' },
  { pattern: /antipoison|anti-poison|poison/i, warning: 'Bring antipoison potions' },
  { pattern: /antifire|anti-fire|dragonfire/i, warning: 'Bring antifire or super antifire potion' },
  { pattern: /bring food/i, warning: 'Bring food for healing' },
  { pattern: /safespot|safe spot|safe-spot/i, warning: 'Use a safespot if possible' },
  { pattern: /level \d{2,}/i, warning: 'Combat encounter — check gear and prayers' },
  { pattern: /(?:defeat|kill|fight|combat|battle)\s/i, warning: 'Combat step — prepare gear and prayers' },
  { pattern: /multi-combat|multicombat/i, warning: 'Multi-combat area — watch for aggro' },
  { pattern: /pray(?:er)?/i, warning: 'Prayer may be needed for this fight' },
];

export function parseCombatWarnings(cleanText: string, questKills: string[]): string[] {
  const warnings: string[] = [];
  const seen = new Set<string>();

  for (const { pattern, warning } of COMBAT_PATTERNS) {
    if (pattern.test(cleanText) && !seen.has(warning)) {
      seen.add(warning);
      warnings.push(warning);
    }
  }

  // Add relevant quest-level combat notes
  for (const kill of questKills.slice(0, 2)) {
    const short = kill.replace(/\([^)]*\)/g, '').trim();
    if (short.length > 5 && cleanText.toLowerCase().includes(short.split(' ')[0].toLowerCase())) {
      const w = `Fight: ${short}`;
      if (!seen.has(w)) { seen.add(w); warnings.push(w); }
    }
  }

  return warnings.slice(0, 3);
}

/** Items from the quest list mentioned in this step */
export function itemsMentionedInStep(stepText: string, allItems: string[]): string[] {
  const norm = stepText.toLowerCase();
  return allItems.filter((item) => {
    const base = item.replace(/\([^)]*\)/g, '').trim().toLowerCase();
    return base.length > 3 && norm.includes(base);
  });
}
