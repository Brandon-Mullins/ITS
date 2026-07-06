# RS3 Quest Helper — Product Roadmap

> **Vision:** The best RS3 Quest Helper possible — a serious Jagex plugin/API contest submission that brings OSRS RuneLite Quest Helper quality to RuneScape 3.

---

## North Star

A **pure guidance** quest companion that helps every player — newbies, ironmen, completionists — plan, prepare, and complete quests without any automation or unfair advantage.

| Principle | Commitment |
|-----------|------------|
| No botting | Never clicks, types, walks, or interacts |
| No unfair advantage | Same info a diligent Wiki reader would find |
| Native-ready | Prototype today, Jagex API plugin tomorrow |
| Judge-winning polish | Screenshot-ready UI, demo mode, accessibility |

---

## Phase 1 — Foundation (v0.4.0) ✅

- [x] Structured quest data (`src/data/quests/`)
- [x] Travel hint engine (`src/data/travel-hints.ts`)
- [x] 7 curated demo quests
- [x] Step panel: route → items → dialogue → combat
- [x] OCR read-only item/step detection
- [x] RSN quest planner (Ready / Started / Done / Locked)
- [x] Jagex submission architecture doc

---

## Phase 2 — Quest Helper Engine (v0.5.0) 🚧

### 2.1 True OSRS Quest Helper Feel
- [x] Sidebar quest/step list
- [x] Current step overlay panel
- [x] Minimap/world map marker placeholders
- [x] NPC/object/tile highlight placeholders
- [x] Required + recommended item panels
- [x] Dialogue choices + puzzle helpers
- [x] Combat warnings
- [x] Quest requirement planner

### 2.2 Smart Quest Routing
Every step shows:
- **Fastest route** — lodestones, jewellery, fairy rings
- **Cheapest route** — run/walk, no consumables
- **Ironman-friendly route** — no GE, self-obtainable teleports
- **No-teleport fallback** — always runnable
- **Required unlocks** per route (diaries, quests, items)

### 2.3 Quest Dependency Brain
When user enters RSN:
- Exact missing quests for a goal
- Exact missing skills
- Shortest unlock path
- Recommend next 5 quests
- Group by goal: Prifddinas, Curses, Senntisten, Fairy rings, Invention, Boss unlocks, Quest cape

### 2.4 Goal Mode
Goal selector generates ordered quest list:
- Fairy Rings · Prifddinas · Ancient Curses · City of Senntisten
- Quest Cape · PvM Unlocks · XP Rewards

### 2.5 Item Brain
Per quest: required, recommended, obtainable, consumed, kept, GE-buyable, ironman notes, bank/inventory status, **shopping list copy**.

### 2.6 Step Quality Standard
Each step: what/where/route/NPC-object/dialogue/items/warnings/combat/completion rule.

### 2.7 Demo Quest Polish
Insanely polished first: Fairy Tale II, Twilight of the Gods, Aftermath, Meet Naressa, Elemental Workshop II–IV.

### 2.8 Plugin API Readiness
`src/plugin-api/` adapter layer — OCR/mock today, Jagex APIs tomorrow.

### 2.9 Judge-Winning Polish
- First-run tutorial
- Demo mode (fake RSN)
- Screenshot-ready UI
- "Why this helps RS3" page
- Accessibility: large text, high contrast
- New player vs veteran UI modes

### 2.10 Contribution System
- Quest JSON schema
- Quest editor + validation
- "Report bad step" placeholder
- `docs/contributing-quests.md`

---

## Phase 3 — Native Plugin (v1.0.0)

- Jagex-approved `QuestStateProvider` adapter
- Real inventory/bank APIs (no OCR)
- World map + minimap markers via `MarkerProvider`
- NPC/object highlights via game API
- Quest journal event-driven step advance
- Plugin marketplace submission

---

## Phase 4 — Scale (v1.x)

- All 400+ quests curated (community contributions)
- Ironman-dedicated routing database
- Skill training recommendations between quests
- Quest cape optimizer (shortest path algorithm)
- Group quest / partner mode hints
- Mobile companion (read-only planner)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  Sidebar · StepPanel · GoalMode · Planner · ShoppingList    │
├─────────────────────────────────────────────────────────────┤
│                     Services Layer                           │
│  quest-engine · goal-planner · quest-planner · item-brain   │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  quests/ · travel-hints · goals · dependencies · schema     │
├─────────────────────────────────────────────────────────────┤
│                   Plugin API Layer                           │
│  QuestState · Inventory · Bank · Location · NPC · Marker  │
│         ┌──────────────┐    ┌──────────────────┐          │
│         │ OCR/Mock     │    │ Jagex Official   │          │
│         │ (prototype)  │    │ (production)     │          │
│         └──────────────┘    └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Metrics (Contest)

1. **Coverage** — 7 demo quests at 100% step quality
2. **Safety** — zero automation surface area
3. **API readiness** — all providers have interfaces + mock impl
4. **UX** — side-by-side comparison with OSRS Quest Helper features
5. **Contribution** — schema + editor enables community quest authoring
6. **Accessibility** — playable by new and veteran players alike

---

## File Map

| Path | Purpose |
|------|---------|
| `src/data/quests/` | Curated quest definitions |
| `src/data/travel-hints.ts` | Location → route database |
| `src/data/goals.ts` | Goal mode quest chains |
| `src/data/quest-dependencies.ts` | Prerequisite graph |
| `src/plugin-api/` | Provider interfaces + adapters |
| `src/services/goal-planner.ts` | Goal → quest order |
| `src/services/quest-planner.ts` | RSN → missing reqs + recommendations |
| `src/services/item-brain.ts` | Item categorization + shopping list |
| `schemas/quest.schema.json` | Contribution JSON schema |
| `docs/safety-policy.md` | Compliance |
| `docs/contributing-quests.md` | Author guide |
