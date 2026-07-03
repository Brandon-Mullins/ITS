# RS3 Quest Helper — Jagex Plugin Submission Notes

## Overview

This project is designed to become an **official RuneScape 3 Quest Helper plugin** for Jagex's plugin/API contest. It follows the same design philosophy as **OSRS RuneLite Quest Helper**: step-by-step guidance, travel hints, item tracking, and map markers — with **zero gameplay automation**.

The current **Electron overlay** is a **prototype** that validates UX, quest data structure, and helper logic before a native RS3 plugin build.

## Design principles

| Principle | Implementation |
|-----------|----------------|
| No botting | Never clicks, types, walks, or interacts with the client |
| No unfair advantage | Guidance only — same information a player could get from the Wiki |
| No client modification | External overlay today; native plugin uses approved APIs only |
| No memory injection | No reading game memory or packets |
| No key sending | No simulated input |
| Approved APIs (target) | Quest state, inventory, bank, NPCs, objects, map markers via Jagex plugin API |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Prototype (current)          │  Target (native plugin)   │
├───────────────────────────────┼───────────────────────────┤
│  Electron transparent overlay │  RS3 approved plugin host │
│  Wiki + curated quest data    │  Same quest data format    │
│  Screen OCR (read-only)       │  Official game state APIs  │
│  Manual "Done" fallback       │  Quest journal API events  │
│  Travel hint engine           │  World map marker API      │
└─────────────────────────────────────────────────────────┘
```

## Quest data format

Curated quests live in `src/data/quests/` as TypeScript modules. Each quest defines:

- **Metadata** — requirements, items, enemies, rewards, unlocks
- **Steps** — instruction, location, NPC, travel routes, dialogue, combat warnings
- **Completion checks** — chat/journal/inventory/location signals (OCR today, API tomorrow)
- **Markers** — NPC, object, tile, and area placeholders for native map overlay

Example step structure:

```typescript
{
  id: "fairy-tale-2-step-1",
  instruction: "Talk to Martin the Master Gardener in Draynor Village.",
  location: "Draynor Village",
  npc: "Martin the Master Gardener",
  fastestRoutes: [
    "Draynor lodestone → run north-west into Draynor market.",
    "Amulet of glory → Draynor Village → run north.",
    "Explorer's ring cabbage teleport → run west/north-west."
  ],
  completionChecks: {
    chatContains: ["Martin", "Fairy Tale"],
    locationContains: ["Draynor"]
  },
  markers: {
    npc: "Martin the Master Gardener",
    area: "Draynor Village market"
  }
}
```

## Curated launch quests

The prototype ships with official-style guides for:

1. Meet Naressa in Senntisten
2. Twilight of the Gods
3. Aftermath
4. Fairy Tale II - Cure a Queen
5. Elemental Workshop II
6. Elemental Workshop III
7. Elemental Workshop IV

Additional quests fall back to RuneScape Wiki parsing until curated.

## Native plugin migration path

When Jagex plugin APIs are available, replace prototype layers as follows:

| Prototype | Native replacement |
|-----------|-------------------|
| Screen OCR for items | `inventory` + `bank` API |
| OCR chat for step advance | `questJournal` + `dialogue` API |
| OCR location text | `playerLocation` + `area` API |
| Marker placeholders | `worldMap.addMarker(npc/object/area)` |
| RuneMetrics quest status | `questState` API |
| Manual Done button | Automatic on `questStepComplete` event |

No changes to quest data files are required — only the **state reader** and **marker renderer** adapters.

## Travel hint engine

`src/data/travel-hints.ts` provides fastest-route suggestions for common RS3 locations. In the native plugin, routes could be ranked by player's unlocked teleports (lodestones, achievements, items).

## Item helper

Item states (prototype via OCR):

- **Green** — in inventory (ready)
- **Yellow** — seen in bank
- **Red** — missing; link to Wiki/GE page

Native plugin would use real inventory/bank APIs with no OCR latency.

## Compliance statement

This Quest Helper provides **informational guidance only**. It does not:

- Automate any game action
- Provide information unavailable to diligent players
- Modify game files or network traffic
- Give combat/mechanical advantages beyond convenience

It is equivalent to following a Wiki quest guide with integrated checklists — the same category as OSRS Quest Helper.

## Contest submission checklist

- [x] Structured quest data schema
- [x] Curated quest guides (7 launch quests)
- [x] Travel hint engine
- [x] Step panel (route → items → dialogue → combat)
- [x] Item tracking with GE/Wiki links
- [x] RSN quest planner with status filters
- [x] OCR-based progress hints (prototype only)
- [x] Manual step completion fallback
- [x] Map/NPC marker metadata placeholders
- [ ] Native Jagex plugin adapter (pending API access)
- [ ] World map marker rendering (pending API access)

## Running the prototype

```bash
npm install
npm run electron:dev
```

Requirements: Windows, RS3 in windowed/borderless mode for overlay attach and OCR.
