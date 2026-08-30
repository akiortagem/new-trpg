# New TRPG Text Game

This browser app plays scripted adventures using `COMBAT_RULES_V0.md` and `OUT_OF_COMBAT_RULES_V0.md`. It has no AI GM and makes no network requests. The adventure file supplies all narration, choices, checks, outcomes, companions, enemy presets, and combat setup.

## Run the app

Open `index.html` directly in a browser, or serve the repository root locally:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/apps/text-game/`.

At the start screen:

1. Select a reusable main-character JSON file.
2. Select an adventure JSON file.
3. Start the adventure.

The app does not include a playable adventure or main character. See [AUTHORING.md](AUTHORING.md) for both formats and a complete miniature example.

## What the first version supports

- Scripted narration, dialogue, individual actions, and party decisions.
- Fixed actors or player-selected eligible actors for checks.
- Full disclosure of attributes, skill, modifiers, and final TN before rolling.
- Automatic success or failure when the final TN is at least 100 or at most 0.
- Author-marked no-roll outcomes.
- Failed checks followed by the choice to keep failure or accept a vaguely previewed Success with a Twist.
- Persistent flags, counters, quest time, conditional choices, and progress clocks.
- Exactly one combat encounter per adventure.
- Player control of every PC during combat.
- Text-and-button zones, long-connection transit, attacks, healing, Defend, Protect, Recover, consumables, authored Interact actions, prepared actions, conditions, Rallied sustain, forced movement, and Critical Rounds.
- Deterministic NPC turns using an author-selected preset.
- Binary combat victory or defeat.
- Three browser-local manual save slots.
- A structured, downloadable JSON event log.

## Files

| File | Purpose |
|---|---|
| `index.html` | Application shell. |
| `styles.css` | Responsive text-game and combat presentation. |
| `core.js` | Validation, adventure resolution, state, combat rules, and deterministic NPC controller. |
| `app.js` | File loading, rendering, player inputs, save slots, and log export. |
| `AUTHORING.md` | Character and adventure file reference. |
| `characters/README.md` | Location and convention for reusable main-character files. |
| `tests/text-game.test.js` | Rules-engine and format regression tests. |

## Testing

From the repository root:

```sh
node --test apps/text-game/tests/text-game.test.js
```

The existing combat-simulator tests remain separate and should also continue to pass.
