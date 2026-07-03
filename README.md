# RS3 Quest Helper Overlay

A **read-only desktop overlay** for RuneScape 3 that helps players complete quests step-by-step using [RuneScape Wiki](https://runescape.wiki) data.

> I want to build a RuneLite-style Quest Helper for RuneScape 3 as an external overlay. It uses RuneScape Wiki quest data to show step-by-step instructions, required items, dialogue options, map guidance, and visual highlights — but it **never** clicks, types, moves, interacts with the client, reads game memory, injects code, or automates gameplay.

## What it does (MVP 1)

- **Quest search** — browse all 391 RS3 quests and miniquests
- **Requirements & items** — skill reqs, quest reqs, required items with checkboxes
- **Step-by-step guide** — parsed walkthrough from the Wiki
- **Manual progress** — check off steps, next/previous navigation
- **Wiki link** — open the source guide on runescape.wiki
- **Always-on-top overlay** — transparent, frameless window that sits above RS3

## What it does NOT do

| Forbidden | Status |
|-----------|--------|
| Auto-clicking | Never |
| Key sending | Never |
| Walking for you | Never |
| Packet reading | Never |
| Memory injection | Never |
| Client modification | Never |
| Botting logic | Never |

## Tech stack

- **Electron** — transparent always-on-top overlay window (Alt1-style)
- **React + TypeScript + Vite** — UI
- **RuneScape Wiki Bucket API** — quest metadata (requirements, items, start location)
- **MediaWiki Parse API** — walkthrough sections parsed into steps
- **Local JSON cache** — fast loads, refreshable from Wiki

## Getting started

### Prerequisites

- Node.js 20+
- Windows 10/11 (target platform; dev works on Linux/macOS too)

### Install

```bash
npm install
npm run seed    # fetch quest index from Wiki (bundled data included)
```

### Development

```bash
npm run dev          # Vite dev server (browser preview)
npm run electron:dev # Electron overlay (requires display)
```

### Build for Windows

```bash
npm run build
npm run electron:build
```

Installer output goes to `release/`.

## Usage

1. Launch RS3 via the Jagex Launcher
2. Start **RS3 Quest Helper**
3. Search for a quest
4. Follow the step-by-step guide
5. Check off steps manually as you complete them
6. Pin the overlay (📌) to keep it above the game

## Roadmap

### MVP 1 — Quest Guide Overlay ✅
- [x] Search quest name
- [x] Show requirements/items
- [x] Show current step with next/back
- [x] Manual checkboxes
- [x] Wiki link/source
- [x] Always-on-top transparent overlay

### MVP 2 — Quest Planner
- [ ] Quest dependency planner from completed quests/stats
- [ ] Item checklist vs bank/preset data
- [ ] Dialogue helper overlay

### MVP 3 — Screen Recognition
- [ ] Safe OCR for progress hints
- [ ] NPC/object visual highlighting
- [ ] Bank-visible item detection

## Data sources

Quest metadata comes from the [Bucket:Quest](https://runescape.wiki/w/Bucket:Quest) table on the RuneScape Wiki. Walkthrough steps are parsed from each quest's Wiki page sections. All data is cached locally in `%APPDATA%/rs3-quest-helper-overlay/quest-data/`.

## License

MIT
