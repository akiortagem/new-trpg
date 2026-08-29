# Combat Rules V0 — Solo Test Rig

Developer and agent documentation is in [SPEC.md](SPEC.md).

Open `index.html` in a modern desktop browser. No server, installation, or build step is required. Manual and deterministic play work offline. ChatGPT API control requires internet access and an OpenAI API key.

The app autosaves the active test, completed encounter records, and survey answers to that browser's local storage. **Restart test** permanently clears that local record. There is deliberately no undo.

After choosing a test mode, the pre-encounter tweaking screen can directly override PC HP, stamina, mana, Inventory Points, AP, DEF, and defense-roll bonus. Each PC can remain under manual control or use the All-Out Attacker, Always Prepared, or Reactive Survivor doctrine. Manual and automated PCs can coexist in the same party.

The screen can also override every enemy archetype's count, HP, AP, ATK, DEF, Dodge, Threat, and defense-spending policy. These overrides deliberately ignore character-building and encounter-building rules.

**Place Units** opens the pre-encounter placement dialog. Drag individual PCs and enemies into any zone, or select a unit and then select its destination zone. Changes remain drafts until **Apply Placement** is pressed; **Cancel** leaves the previously applied setup unchanged. Applying a placement locks enemy count fields because the saved positions refer to concrete unit instances. **Reset Placement** discards those positions and unlocks the counts. **Reset published values** resets both stats and placement.

## ChatGPT API control

Each PC can independently use one of five model behaviors: Inexperienced Player, Reckless Hero, Self-Preserving, Role-Faithful, or Optimal Tactician. Each enemy archetype can independently use Optimal Killer, Self-Preserving, or Dramatic GM. AI actors know the battlefield but pursue their own priorities rather than sharing one side-wide plan.

AI-controlled PCs remain under the player's turn-order control. Select a PC and press **Start AI turn**; the model chooses a legal action segment that combines deterministic setup such as movement with the first uncertain action. After that result is resolved, the model is called again only if the PC can continue. The enemy phase uses one request to plan every AI-controlled NPC's complete normal turn. The rules engine revalidates each planned action against current AP, position, targets, and conditions immediately before execution.

Defend and Protect never call the API. PC and NPC behavior presets resolve those reactions locally: aggressive presets conserve AP, survival presets defend readily, role-faithful Sera protects endangered allies, and optimal presets react when the expected mitigation or knockout prevention justifies it. Troll Boss Edges remain separate off-turn decisions.

After five failed or illegal API responses, the app offers retry, manual intervention where applicable, deterministic fallback, or ending the actor's turn.

The API key and editable model ID are configured on the tweak screen. The key is stored as plain text in the browser's local storage until **Clear key** is pressed. It is never included in encounter saves, prompts, combat logs, or reports. This mode is intended only for personal local testing; do not use it on a shared or untrusted browser profile.

Playtest records include each AI actor's behavior, chosen action, short reasoning, retry count, latency, and reported token usage. Raw prompts and API responses are not retained. Requests use the Responses API with storage disabled.

After each doctrine-controlled PC finishes a turn, the app pauses on a dialog listing that character's movement, abilities, rolls, damage, healing, and retained AP. **Next** advances to the next automated character or returns control to a manual character. This pause is included in browser autosave and survives a refresh.

## Test modes

- **Bandit Camp** runs only the group encounter, followed by metrics and the player survey.
- **The Troll** runs only the boss encounter, including the investigation clue, followed by metrics and the player survey.

## Programmed GM rulings

Open **Rigid GM Doctrine** in the app to see every deterministic priority and tie-breaker. These rulings cover choices that the written rules assign to the GM, including enemy targets, enemy defense spending, movement, and finishing blows.

The app reveals qualitative difficulty before commitments, but not exact enemy statistics or target numbers. After commitment, each percentile result and its exact target number appear in the combat log.

## Tests

If Node.js is installed, run `node tests/combat-engine.test.js` from this folder. The tests exercise placement application and reset, the deterministic combat engine, mocked API retries, structured legal-choice validation, credential exclusion, information disclosure, behavior configuration, action dialogs, and AI telemetry. They never call the live API or consume tokens.
