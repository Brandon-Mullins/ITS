# Contributing Quest Guides

Thank you for helping build the best RS3 Quest Helper! This guide explains how to author, validate, and submit quest data.

---

## Quick Start

1. Copy `schemas/quest.schema.json` as your reference
2. Create a file in `src/data/quests/your-quest.ts` (or JSON for editor)
3. Use the `questStep()` helper from `src/data/quests/helpers.ts`
4. Run validation in the Quest Editor (`Editor` tab in app)
5. Submit a pull request

---

## Quest File Structure

```typescript
import type { StructuredQuestDefinition } from '../../types/quest-data';
import { questStep } from './helpers';

const quest: StructuredQuestDefinition = {
  id: 'my-quest',
  name: 'My Quest',
  pageName: 'My Quest',          // Must match Wiki page name
  members: true,
  length: 'Medium',
  requirements: ['Quest A', 'Skill 50 Farming'],
  skillRequirements: [{ skill: 'Farming', level: 50 }],
  requiredItems: ['Rake'],
  recommendedItems: ['Food'],
  enemies: ['Level 80 boss'],
  rewards: ['Quest point', '10,000 Farming XP'],
  unlocks: ['Access to new area'],
  itemBrain: { /* see below */ },
  steps: [ /* see below */ ],
};

export default quest;
```

Register in `src/data/quests/index.ts`.

---

## Step Quality Checklist

Every step **must** include:

| Field | Required | Example |
|-------|----------|---------|
| `instruction` | ✅ | "Talk to Martin in Draynor Village." |
| `location` | ✅ | "Draynor Village" |
| `travelRoutes` | ✅ | 4 route types (see below) |
| `npc` or `markers.object` | ✅ | "Martin the Master Gardener" |
| `completionChecks` | ✅ | chat/journal/inventory/location |
| `markers` | ✅ | npc, area, tile placeholder |
| `dialogueOptions` | If applicable | "Say: Yes" |
| `combatWarnings` | If applicable | "Bring antifire" |
| `areaWarning` | If applicable | "Don't leave instance" |
| `puzzleHints` | If applicable | "Rotate pipes clockwise" |

---

## Travel Routes (4 types)

```typescript
travelRoutes: [
  {
    type: 'fastest',
    label: 'Fastest',
    description: 'Draynor lodestone → run north-west into market.',
    requiredUnlocks: ['Draynor lodestone'],
  },
  {
    type: 'cheapest',
    label: 'Cheapest',
    description: 'Walk from Lumbridge → west past cows (~2 min).',
    requiredUnlocks: [],
  },
  {
    type: 'ironman',
    label: 'Ironman',
    description: 'Home Teleport Lumbridge → walk west.',
    requiredUnlocks: [],
  },
  {
    type: 'no-teleport',
    label: 'No teleport',
    description: 'Run from current location via world gate.',
    requiredUnlocks: [],
  },
],
```

---

## Item Brain

```typescript
itemBrain: {
  required: ['Vial of water'],
  recommended: ['Food'],
  obtainableDuring: ['Logs (chop nearby)'],
  consumed: ['Vial of water'],
  kept: ['Dramen staff'],
  geBuyable: ['Vial of water', 'Pestle and mortar'],
  ironmanNotes: {
    'Vial of water': 'Buy from general store or make at fountain',
  },
},
```

---

## Validation Rules

The Quest Editor checks:

- [ ] Quest has at least 1 step
- [ ] Every step has `instruction` and `completionChecks`
- [ ] Every step with a `location` has `travelRoutes` (≥2)
- [ ] Every step with combat text has `combatWarnings`
- [ ] `pageName` matches Wiki
- [ ] All `requiredItems` appear in `itemBrain`
- [ ] No empty `dialogueOptions` arrays with placeholder text

---

## JSON Schema

For non-TypeScript contributors, export quests as JSON validated against `schemas/quest.schema.json`. The editor can import JSON and show validation errors.

---

## Report Bad Step

In-app "Report bad step" (v0.5.0 placeholder) will eventually link to GitHub issues with:
- Quest name + step ID
- What was wrong
- Suggested correction

---

## Review Process

1. PR must pass `npm run typecheck`
2. Demo quests require 4 travel routes per location step
3. Steps tested against Wiki quick guide
4. No automation features in quest data
