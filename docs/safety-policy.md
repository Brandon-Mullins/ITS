# RS3 Quest Helper — Safety & Compliance Policy

## Purpose

This document defines the **non-negotiable safety boundaries** for the RS3 Quest Helper prototype and any future official Jagex plugin. These rules exist to protect game integrity and ensure fair play.

---

## What We Do (Allowed)

| Feature | Description |
|---------|-------------|
| Quest guidance | Step-by-step instructions from curated data or Wiki |
| Travel hints | Suggest teleports and routes the player executes manually |
| Item tracking | Show what items are needed (read-only detection) |
| Quest planning | Recommend quest order based on goals and requirements |
| Map markers | Highlight NPCs/objects/locations (visual guidance only) |
| Dialogue hints | Tell the player what to say (player clicks themselves) |
| Progress detection | Read quest journal/chat to suggest step completion |

---

## What We Never Do (Forbidden)

| Prohibited | Reason |
|------------|--------|
| **Automation / botting** | Violates game rules |
| **Auto-clicking** | Plays the game for the user |
| **Key sending / input simulation** | Plays the game for the user |
| **Walking for the player** | Plays the game for the user |
| **Memory reading** | Unfair data access, against ToS |
| **Packet reading/injection** | Unfair data access, against ToS |
| **Client modification** | Breaks game integrity |
| **PvP advantage** | Unfair in competitive contexts |
| **Boss automation** | Automates mechanical gameplay |
| **AFK combat assistance** | Botting-adjacent |

---

## Prototype vs Production

### Electron Prototype (Current)
- Uses **screen OCR** (read-only screenshots) for item/chat detection
- Uses **RuneMetrics API** (public player quest data) for RSN planner
- Uses **RuneScape Wiki API** for quest metadata fallback
- **No interaction** with the game client whatsoever

### Native Jagex Plugin (Target)
- Uses **approved Jagex plugin APIs** only
- Quest state, inventory, bank, location from official read-only endpoints
- Map markers via official overlay API
- Same guidance-only feature set — no new capabilities

---

## Fair Play Statement

The Quest Helper provides **informational guidance equivalent to following a Wiki quest guide** with integrated checklists. It does not:

- Perform actions faster than a human could manually
- Reveal hidden information unavailable through normal gameplay
- Modify game state in any way
- Provide combat/mechanical advantages beyond convenience

---

## Data Sources

| Source | Access | Automation |
|--------|--------|------------|
| Curated quest data | Local/bundled | None |
| RuneScape Wiki API | Public HTTP | None |
| Jagex RuneMetrics | Public HTTP (opt-in) | None |
| Screen OCR | Read-only capture | None |
| Jagex Plugin API | Approved read-only | None |

---

## Audit Checklist

Before any release, verify:

- [ ] No `robotjs`, `nut.js`, or input simulation libraries
- [ ] No game process attachment or memory APIs
- [ ] No network interception
- [ ] All user actions remain manual (click, type, walk)
- [ ] OCR/API only **reads** state, never **writes**
- [ ] Documentation accurately describes capabilities
- [ ] Demo mode clearly labeled as simulated data

---

## Reporting

Players who find guidance errors can use the "Report bad step" button (placeholder in v0.5.0). Security concerns should be reported to the project maintainer immediately.

---

## Alignment with OSRS Quest Helper

This project follows the same ethical model as **RuneLite Quest Helper** for Old School RuneScape: pure overlay guidance with zero gameplay automation. If a feature would be rejected from OSRS Quest Helper, it is rejected here too.
