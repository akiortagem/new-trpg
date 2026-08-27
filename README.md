# New TRPG

Design documents, combat rules, playtest material, and test tooling for a classless medieval-fantasy tabletop RPG.

## Repository layout

- `docs/` — current design and playtest documents.
- `apps/combat-solo-tester/` — dependency-free browser app for automated solo combat testing.
- `archive/workbooks/` — earlier workbook milestones retained for provenance.

## Solo combat tester

Open `apps/combat-solo-tester/index.html` in a modern desktop browser. It does not require a server, installation, or internet connection.

To run its executable rules-engine tests:

```bash
node apps/combat-solo-tester/tests/combat-engine.test.js
```

The app autosaves active tests in browser local storage. Its pre-encounter screen supports direct PC and NPC stat overrides, NPC defense policies, manual PC control, and three automated PC doctrines.

## Current rules artifacts

- `docs/COMBAT_RULES_V0.md` — player-facing combat rules.
- `docs/COMBAT_PLAYTEST_PACKET_V0.md` — encounters, pregenerated characters, procedures, and survey.
- `docs/05_COMBAT_PROTOTYPE_WORKBOOK_LATEST.md` — active combat-design workbook and decision record.
