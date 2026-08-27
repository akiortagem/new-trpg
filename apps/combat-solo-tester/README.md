# Combat Rules V0 — Solo Test Rig

Open `index.html` in a modern desktop browser. No server, installation, internet connection, or build step is required.

The app autosaves the active test, completed encounter records, and survey answers to that browser's local storage. **Restart test** permanently clears that local record. There is deliberately no undo.

After choosing a test mode, the pre-encounter tweaking screen can directly override PC HP, stamina, mana, Inventory Points, AP, DEF, and defense-roll bonus. Each PC can remain under manual control or use the All-Out Attacker, Always Prepared, or Reactive Survivor doctrine. Manual and automated PCs can coexist in the same party.

The screen can also override every enemy archetype's count, HP, AP, ATK, DEF, Dodge, Threat, and defense-spending policy. These overrides deliberately ignore character-building and encounter-building rules.

After each doctrine-controlled PC finishes a turn, the app pauses on a dialog listing that character's movement, abilities, rolls, damage, healing, and retained AP. **Next** advances to the next automated character or returns control to a manual character. This pause is included in browser autosave and survives a refresh.

## Test modes

- **Bandit Camp** runs only the group encounter, followed by metrics and the player survey.
- **The Troll** runs only the boss encounter, including the investigation clue, followed by metrics and the player survey.
- **Full Session** runs Bandit Camp, resets all characters and supplies, then runs The Troll. The survey appears after both encounters.

## Programmed GM rulings

Open **Rigid GM Doctrine** in the app to see every deterministic priority and tie-breaker. These rulings cover choices that the written rules assign to the GM, including enemy targets, enemy defense spending, movement, and finishing blows.

The app reveals qualitative difficulty before commitments, but not exact enemy statistics or target numbers. After commitment, each percentile result and its exact target number appear in the combat log.

## Tests

If Node.js is installed, run `node tests/combat-engine.test.js` from this folder. The integration tests exercise the fourth-PC-to-enemy-phase transition, the Watchtower's two-Move connection, repeated bandit rounds, the troll's normal turn, Edge refresh, NPC defense policies, all three PC doctrines, revival, reaction choices, and a complete fully automated encounter.
