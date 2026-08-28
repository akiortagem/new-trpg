# Combat Rules V0 — Solo Test Rig

Open `index.html` in a modern desktop browser. No server, installation, or build step is required. Manual and deterministic play work offline. ChatGPT API control requires internet access and an OpenAI API key.

The app autosaves the active test, completed encounter records, and survey answers to that browser's local storage. **Restart test** permanently clears that local record. There is deliberately no undo.

After choosing a test mode, the pre-encounter tweaking screen can directly override PC HP, stamina, mana, Inventory Points, AP, DEF, and defense-roll bonus. Each PC can remain under manual control or use the All-Out Attacker, Always Prepared, or Reactive Survivor doctrine. Manual and automated PCs can coexist in the same party.

The screen can also override every enemy archetype's count, HP, AP, ATK, DEF, Dodge, Threat, and defense-spending policy. These overrides deliberately ignore character-building and encounter-building rules.

## ChatGPT API control

Each PC can independently use one of five model behaviors: Inexperienced Player, Reckless Hero, Self-Preserving, Role-Faithful, or Optimal Tactician. Each enemy archetype can independently use Optimal Killer, Self-Preserving, or Dramatic GM. AI actors know the battlefield but pursue their own priorities rather than sharing one side-wide plan.

The model chooses one currently legal action or reaction per request. The rules engine supplies the complete legal-choice list and rejects invented or stale choices. Each accepted choice pauses on a dialog showing the action and a short reason; **Next** executes it. After five failed or illegal responses, the app offers retry, manual intervention where applicable, deterministic fallback, or ending the actor's turn.

The API key and editable model ID are configured on the tweak screen. The key is stored as plain text in the browser's local storage until **Clear key** is pressed. It is never included in encounter saves, prompts, combat logs, or reports. This mode is intended only for personal local testing; do not use it on a shared or untrusted browser profile.

Playtest records include each AI actor's behavior, chosen action, short reasoning, retry count, latency, and reported token usage. Raw prompts and API responses are not retained. Requests use the Responses API with storage disabled.

After each doctrine-controlled PC finishes a turn, the app pauses on a dialog listing that character's movement, abilities, rolls, damage, healing, and retained AP. **Next** advances to the next automated character or returns control to a manual character. This pause is included in browser autosave and survives a refresh.

## Test modes

- **Bandit Camp** runs only the group encounter, followed by metrics and the player survey.
- **The Troll** runs only the boss encounter, including the investigation clue, followed by metrics and the player survey.
- **Full Session** runs Bandit Camp, resets all characters and supplies, then runs The Troll. The survey appears after both encounters.

## Programmed GM rulings

Open **Rigid GM Doctrine** in the app to see every deterministic priority and tie-breaker. These rulings cover choices that the written rules assign to the GM, including enemy targets, enemy defense spending, movement, and finishing blows.

The app reveals qualitative difficulty before commitments, but not exact enemy statistics or target numbers. After commitment, each percentile result and its exact target number appear in the combat log.

## Tests

If Node.js is installed, run `node tests/combat-engine.test.js` from this folder. The tests exercise the deterministic combat engine plus mocked API retries, structured legal-choice validation, credential exclusion, information disclosure, behavior configuration, action dialogs, and AI telemetry. They never call the live API or consume tokens.
