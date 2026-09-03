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

The app does not include a playable adventure or main character. See [AUTHORING.md](AUTHORING.md) for both formats and a complete miniature example. See [CHOICE_STATE_CONDITIONS.md](CHOICE_STATE_CONDITIONS.md) for the choice-availability state contract and [OPTIONAL_SCENE_TITLES.md](OPTIONAL_SCENE_TITLES.md) for the scene-title visibility contract.

Character files use schema version 1. Adventure files use schema version 2. Save slots from engine version 1 are rejected with an explicit unsupported-version message because their checks predate Base TN.

## What the first version supports

- Scripted narration, dialogue, individual actions, and party decisions.
- Fixed actors or player-selected eligible actors for checks.
- Full disclosure of Base TN, attributes, skill, modifiers, and final TN before rolling.
- A visual-novel presentation that shows one narration, dialogue, choice, roll, or outcome at a time in a fixed text box, with character-by-character text and click-to-reveal/advance controls.
- Independent scene-title presentation. Ordinary scenes, combat scenes, and endings may keep a descriptive `title` for authoring while `showTitle: false` suppresses it in-game; omitted `showTitle` defaults to `true`.
- Stable per-speaker visual identities for dialogue. Adventures may optionally author an identity; otherwise the game assigns one deterministically and avoids collisions while palette slots remain. Speaker changes receive a brief emphasis transition.
- Automatic success or failure when the final TN is at least 100 or at most 0.
- Author-marked no-roll outcomes.
- Failed checks followed by the choice to keep failure or accept a vaguely previewed Success with a Twist.
- Persistent flags, counters, quest time, state-gated choices, and progress clocks. A hidden choice is absent and cannot be resolved until its `when` condition matches the current state.
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
| `speaker-visuals.css` | Per-speaker palette and speaker-change transition styling. |
| `optional-scene-titles.css` | Hides title containers when scene-title presentation is disabled. |
| `core.js` | Validation, adventure resolution, state, combat rules, and deterministic NPC controller. |
| `choice-state-conditions.js` | Strict validation for choice state conditions and run-start enforcement. |
| `optional-scene-titles.js` | Backward-compatible optional-title handling and `showTitle` runtime behavior. |
| `speaker-visuals.js` | Speaker VI validation, deterministic assignment, save restoration, and DOM decoration. |
| `app.js` | File loading, rendering, player inputs, save slots, and log export. |
| `AUTHORING.md` | Character and adventure file reference. |
| `CHOICE_STATE_CONDITIONS.md` | Choice availability state contract and examples. |
| `OPTIONAL_SCENE_TITLES.md` | Scene title visibility contract and authoring examples. |
| `SPEAKER_VISUAL_IDENTITIES.md` | Optional authored VI format and compatibility behavior. |
| `characters/README.md` | Location and convention for reusable main-character files. |
| `tests/text-game.test.js` | Rules-engine and format regression tests. |
| `tests/choice-state-conditions.test.js` | State-gated choice and condition-validation regression tests. |
| `tests/optional-scene-titles.test.js` | Optional-title and title-visibility regression tests. |
| `tests/speaker-visuals.test.js` | Speaker identity assignment and validation tests. |

## Testing

From the repository root:

```sh
node --test apps/text-game/tests/*.test.js
```

The existing combat-simulator tests remain separate and should also continue to pass.
