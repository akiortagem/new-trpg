# New TRPG

Design documents, combat rules, playtest material, and test tooling for a classless medieval-fantasy tabletop RPG.

## Repository layout

- `docs/` — current design and playtest documents.
- `apps/combat-solo-tester/` — dependency-free browser app for automated solo combat testing.
- `archive/workbooks/` — earlier workbook milestones retained for provenance.

## Solo combat tester

Play the hosted app at **https://akiortagem.github.io/new-trpg/**.

Open `apps/combat-solo-tester/index.html` in a modern desktop browser. It does not require a server or installation. Deterministic and manual play work offline; ChatGPT API control requires internet access and an OpenAI API key.

To run its executable rules-engine tests:

```bash
node apps/combat-solo-tester/tests/combat-engine.test.js
```

The app autosaves active tests in browser local storage. Its pre-encounter screen supports direct PC and NPC stat overrides, NPC defense policies, manual PC control, three deterministic PC doctrines, and optional ChatGPT API control. AI PC turns are player-triggered, AI NPC normal turns are batched into one request per enemy phase, and defensive reactions use local preset policies without API calls.

## Current rules artifacts

- `docs/COMBAT_RULES_V0.md` — player-facing combat rules.
- `docs/COMBAT_PLAYTEST_PACKET_V0.md` — encounters, pregenerated characters, procedures, and survey.
- `docs/05_COMBAT_PROTOTYPE_WORKBOOK_LATEST.md` — active combat-design workbook and decision record.
