---
name: text-game-author
description: Author adventures and characters for the text-game engine at apps/text-game/. Use when the user wants to create, edit, or fix adventure JSON files, character JSON files, combat encounters, companion definitions, or skill checks for the text-game. Trigger on phrases like "write an adventure", "create a character", "author a quest", "fix the adventure", "add a scene", "design a combat encounter", or any mention of text-game authoring.
---

# Text-Game Adventure Authoring Skill

You are authoring content for a browser-based, zero-network, no-AI-GM adventure runner at `apps/text-game/`. The engine handles narration, skill checks, state tracking, and tactical combat. Presentation is visual-novel style (character-by-character text reveal, click-to-advance).

## Key Files

| File | Purpose |
|---|---|
| `apps/text-game/AUTHORING.md` | Canonical format reference. **Always re-read this before authoring.** |
| `apps/text-game/core.js` | Engine source. Validation and runtime logic. |
| `apps/text-game/multi-combat-compat.js` | Compat layer for 0 or multiple combat scenes. |
| `apps/text-game/characters/` | Reusable main-character JSON files. |
| `apps/text-game/tests/text-game.test.js` | Test suite. Run after any changes. |

## Before You Start

1. **Re-read `AUTHORING.md`** every time. The format evolves. Do not rely solely on this skill.
2. **Interview the user** before writing. Gather: setting, tone, party size, quest type, combat style, companion details, themes, scope expectations.
3. **Plan with TodoWrite**. Break the work into: character file(s), adventure structure, scene-by-scene writing, validation, testing.

## Character File Format (schemaVersion: 1)

```json
{
  "schemaVersion": 1,
  "kind": "character",
  "id": "unique-id",
  "name": "Display Name",
  "role": "Descriptive Role",
  "attributes": { "str": 0, "end": 0, "vit": 0, "mnd": 0, "agi": 0, "dex": 0, "int": 0 },
  "skills": { "SkillName": 0 },
  "combat": {
    "hp": 0, "stamina": 0, "mana": 0,
    "inventoryPoints": 3, "maxAp": 3,
    "def": 0, "defenseBonus": 0
  },
  "abilities": [],
  "reactions": []
}
```

### Character Rules

- All 7 attributes required, all >= 0.
- Skill ranks: 0-5. Engine converts to `rank * 5` for out-of-combat checks.
- All combat fields required and >= 0.
- At least one ability required.
- Ability IDs must be unique within a character.
- `defenseBonus` = full contribution when Defending (AGI + DEX + skill + implement DEF).

### Ability Kinds

| Kind | Description | Extra Required Fields |
|---|---|---|
| `attack` | Single-target attack | `attackBonus` |
| `multi` | Multi-target attack | `attackBonus`, `minTargets`, `maxTargets` (>= 2) |
| `push` | Attack + forced movement | `attackBonus` |
| `persistent` | Attack + condition | `attackBonus`, `condition` object |
| `rush` | Move 1 zone + attack | `attackBonus` |
| `heal` | Heal one target | -- |
| `multiheal` | Heal several targets | `minTargets`, `maxTargets` |
| `rally` | Apply Rallied to allies | `minTargets`, `maxTargets` |

**Every attack-type ability (attack, multi, push, persistent, rush) requires `attackBonus` >= 0.** This is the most common validation error.

Standard ability fields: `id`, `name`, `kind`, `ap`, `stamina`, `mana`, `power`, `minRange`, `maxRange`, `tags` (string array).

### Reactions (Optional)

Ward-style reactions: `id`, `name`, `kind: "ward"`, `ap`, `mana`, `defBonus`, `threatBonus`, `tagBonus`.

`tagBonus` can be a `{ "tagName": bonusValue }` object.

## Adventure File Format (schemaVersion: 2)

```json
{
  "schemaVersion": 2,
  "kind": "adventure",
  "id": "unique-adventure-id",
  "title": "Adventure Title",
  "startScene": "scene-id",
  "questDays": 3,
  "initialState": { "flags": {}, "counters": {} },
  "clocks": {},
  "party": [],
  "enemies": [],
  "scenes": {}
}
```

### Hard Constraints

- **Exactly one `type: "combat"` scene** per adventure (unless using multi-combat-compat.js).
- `startScene` must reference an existing scene.
- All `next` references must point to existing scenes.
- **Main character is always `$main`**. Adventures cannot restrict character choice.
- Companion IDs must be unique and cannot be `$main`.
- `party` contains full character objects for companions. Never the main character.
- `enemies` is a top-level array of enemy definitions (not inside the combat scene).

### Main Character Placeholder

Use `{{main.name}}` in display text. Substituted at run creation. Works in: titles, narration, dialogue, choice labels, check wording, outcome text, twist previews, ending copy.

**NOT substituted in**: `id`, `next`, `path`, actor references, zone references, skill names, effect values. Use `$main` for structural references.

## Scene Types

### Ordinary Scene

```json
{
  "type": "scene",
  "title": "Scene Title",
  "text": [
    "Narration string.",
    { "speaker": "Character Name", "text": "Dialogue." }
  ],
  "choices": []
}
```

- Title and opening text play **only on first visit**. Returning skips to choices.
- Use this for conversation hubs: choices set flags and return `"next"` to the same scene. Use `when` conditions to hide exhausted options and reveal new ones.

### Combat Scene

```json
{
  "type": "combat",
  "title": "Fight Title",
  "ambush": false,
  "battlefield": {
    "zones": [{ "id": "zone-id", "name": "Zone Name" }],
    "links": [{ "from": "zone-a", "to": "zone-b", "cost": 1 }]
  },
  "pcStarts": { "$main": "zone-id", "companion-id": "zone-id" },
  "enemies": [
    { "id": "placement-id", "enemyId": "definition-id", "zone": "zone-id" }
  ],
  "interactions": [],
  "victory": { "text": "...", "next": "scene-id" },
  "defeat": { "text": "...", "next": "scene-id" }
}
```

Every companion ID must appear in `pcStarts` along with `$main`.

### Ending Scene

```json
{
  "type": "ending",
  "title": "Title",
  "outcome": "victory" | "defeat",
  "text": "Ending narration."
}
```

## Choices

### Automatic (No Roll)

```json
{
  "id": "unique-id",
  "label": "Action text",
  "resolution": "automatic",
  "reason": "Why no roll is needed",
  "outcome": { "text": "Result text", "next": "scene-id", "effects": [] }
}
```

### Check (Rolled)

```json
{
  "id": "unique-id",
  "label": "Action text",
  "resolution": "check",
  "actor": { "mode": "select", "eligible": ["*"] },
  "check": {
    "goal": "...",
    "approach": "...",
    "baseTN": 40,
    "attributes": ["attr1", "attr2"],
    "skill": "SkillName",
    "situationalModifiers": [],
    "clock": "optional-clock-id"
  },
  "success": { "text": "...", "next": "..." },
  "failure": { "text": "...", "next": "..." },
  "twistPreview": "Vague hint shown after failure.",
  "twist": { "text": "Full complication.", "next": "...", "effects": [] }
}
```

**Check rules:**
- `baseTN`: 25-60 (60 = Challenging, 40 = Heroic, 25 = Extremely Heroic).
- Exactly 2 attributes, 1 skill.
- Every rolled check **must** have `success`, `failure`, `twist`, and `twistPreview`.
- TN formula: `baseTN + attr1 + attr2 + (skillRank * 5) + sum(situationalModifiers)`.
- TN >= 100: auto-success. TN <= 0: auto-failure (no twist offered).

### Conditional Visibility

```json
"when": { "path": "flags.x", "equals": true }
```
Or complex:
```json
"when": {
  "all": [{ "path": "flags.x", "equals": true }],
  "any": [{ "path": "counters.y", "gte": 3 }]
}
```

Operators: `equals`, `notEquals`, `gte`, `lte`. Paths: `flags.*`, `counters.*`, `quest.*`, `clocks.*`.

## State Effects

| Type | Fields | Description |
|---|---|---|
| `set` | `path`, `value` | Set a state value |
| `add` | `path`, `value` | Add to a number |
| `advance-clock` | `id`, `segments` (default 1) | Fill clock segments |

Writable paths must begin with `flags`, `counters`, `quest`, or `clocks`.

## Progress Clocks

Declared top-level with 2, 4, or 6 segments:
```json
"clocks": { "search": { "label": "Search the Manor", "size": 4 } }
```

Link to checks via `check.clock`. Success fills 1 segment; natural 01-05 fills 2.

## Enemy Definitions

Top-level `enemies` array. Each enemy defined once, referenced by placements in combat scenes.

```json
{
  "id": "enemy-def-id",
  "name": "Enemy Name",
  "preset": "optimal_killer",
  "hp": 120, "maxAp": 2, "atk": 40, "def": 5,
  "dodge": 30, "threat": 25, "stamina": 0, "mana": 0,
  "abilities": []
}
```

Enemy abilities use the same format as PC abilities but **do not require `attackBonus`**.

### Presets

| Preset | Behavior |
|---|---|
| `optimal_killer` | Focus lowest-HP PC, highest-impact ability, Defend against dangerous attacks |
| `self_preserving` | Nearest threat, Defend often, retain last AP when HP <= 50% |
| `dramatic_gm` | Spread pressure (least-targeted first), varied defense |

### Combat Placements

```json
"enemies": [
  { "id": "raider-1", "enemyId": "enemy-def-id", "zone": "zone-id" }
]
```

Each placement gets independent HP/conditions/turns.

### Authored Interactions

```json
"interactions": [{
  "id": "interact-id", "name": "Display Name",
  "description": "Tooltip text.", "text": "Result narration.",
  "zone": "zone-id", "ap": 1, "once": true,
  "effects": [
    { "type": "damage-enemy", "targetId": "placement-id", "amount": 50 },
    { "type": "condition-enemy", "targetId": "placement-id", "condition": { "id": "Persistent Damage", "amount": 10, "expression": "Burning" } },
    { "type": "move-unit", "side": "pc"|"npc", "targetId": "id", "zone": "zone-id" },
    { "type": "set", "path": "flags.x", "value": true }
  ]
}]
```

## Design Guidelines

These are authoring preferences gathered from the project owner. Follow them unless the user explicitly overrides.

### Story & Narrative
- **Villains are MC-agnostic.** Do not create "dark mirror" villains that reflect the main character's specific abilities or backstory. The adventure must work with ANY valid main-character file. Villains have their own independent motivations.
- **Theme is optional.** Don't force thematic connections to the MC. If a theme emerges naturally from the story, great. Don't manufacture one.

### Characters & Dialogue
- **Main character is a silent protagonist.** Use `{{main.name}}` in narration (actions, reactions, expressions) but minimize direct dialogue lines. Companions carry the conversation. The MC's "voice" comes through player choices.
- **Companion conversation scenes.** Scatter "talk to companion" choices throughout the adventure. Use conversation-hub scenes where choices like "Ask Lira about X" / "Talk to Gideon" branch to dialogue subscenes and return. Use `when` conditions to track which conversations have happened.
- **Rich roleplay.** Each scene should have substantial dialogue (5-15+ lines). Companions should bounce off each other, not just deliver exposition.

### Ability Design
- **Keep ability sets small and distinct.** 3 abilities per character is the sweet spot:
  - 1 standard/basic attack
  - 1 ranged or utility option
  - 1 signature/powerful move
- Healers/supports can swap one attack for a heal or rally.
- Don't give everyone 4+ abilities. Simplicity makes tactical choices clearer.

### Player Agency
- **Multiple choices per scene.** Aim for 2-3 choices in most scenes, not just one "continue" button.
- **More branching.** Choices should lead to different content, not just flavor text on the same railroad.
- **More skill checks.** Give players reasons to roll. Investigation scenes, obstacle scenes, and social scenes should all offer check options alongside automatic ones.
- **Conversation hubs.** Scenes where the player can talk to multiple people or explore multiple topics before moving on.

### Scope
- For a 1-2 hour adventure: target 12-15 scenes (excluding endings) with 4-5 skill checks and 1 combat.
- Each scene should have enough text to be satisfying but not so much it drags.

## Writing Guide

The engine's visual-novel delivery (character-by-character reveal, click-to-advance) means every line is read slowly and in isolation. Write accordingly.

### Tone & Register

- **Terse, restrained, low-fantasy realism.** No melodrama, no exclamation marks, no heightened emotion. The narrator is taciturn — closer to a scout's field report than a bard's tale.
- **Flat affect for high stakes.** Even defeat and death are stated plainly. Let the situation carry the weight, not the prose. ("No word returns to the village before nightfall." — not "All hope was lost as darkness consumed them!")
- **No humor unless the user requests it.** Default tone is serious and grounded.

### Sentence Craft

- **Short, declarative sentences.** 6–15 words is the sweet spot. One independent clause per sentence is the norm.
- **Simple connectors only.** Join clauses with "and" or "but" — never semicolons, em-dashes, or nested subordinate clauses.
- **One beat per text array element.** Each string in a `text` array is a single narrative beat: one new piece of information, one image, one action. Don't cram multiple beats into one entry.
- **No second person.** Use third person or impersonal constructions ("The party reaches the ridge," "Smoke rises from the far bank"). Refer to the main character with `{{main.name}}`.

### Vocabulary

- **Plain, concrete, Anglo-Saxon-leaning words.** "Ruts," "ditch," "ridge," "dawn," "mud" — not "furrows," "ravine," "precipice," "aurora," "mire."
- **No Latinate abstractions.** No "commenced," "approximately," "facilitate." Use "began," "about," "help."
- **No archaisms.** No "whilst," "thrice," "ere," "betwixt." This isn't Tolkien pastiche.
- **No invented jargon.** If the setting has unique terms, introduce them through context, not glossaries.

### Sensory Detail

- **One concrete image per scene.** "Rain runs from the gatehouse roof." That's enough. Trust the reader.
- **Visual and physical only, by default.** Stick to what can be seen and felt. Sound, smell, and taste are reserved for moments where they matter to the fiction.
- **No emotional interiority for the MC.** The main character is a silent protagonist. Describe their actions, expressions, and reactions — never their thoughts or feelings. ("{{main.name}} tightens their grip on the hilt" — not "{{main.name}} feels a surge of determination.")

### Narration vs. Dialogue

- **Narration advances the situation.** Every narration line delivers new information or moves the scene forward. No atmospheric padding, no restating what the player already knows.
- **Dialogue carries character.** Companions do the talking. Give each companion a distinct speech pattern: one might be terse and practical, another verbose and nervous. Consistency matters more than cleverness.
- **Dialogue is declarative and clipped.** Characters say what they mean. No filler words, no "Well, I suppose..." hedging unless it defines the character. One to two sentences per dialogue line is typical.
- **No dialogue tags in narration.** The `speaker` field handles attribution. Don't write narration entries like "Toma says nervously:" — use the dialogue object and let the words convey the tone.

### Action Description

- **Report results, not processes.** "The trunk rolls into the ditch and clears the road" — not "You heave the trunk with all your might and it tumbles over the edge, crashing down into the ditch below."
- **Past tense or present tense, pick one and stick with it.** Present tense is the default ("The eastern road has been silent since yesterday"). Don't mix freely.
- **Outcomes over blow-by-blow.** Combat narration (victory/defeat text, interaction results) describes what happened, not each swing. The tactical engine handles the blow-by-blow.

### Choice Labels

- **Active, specific, and brief.** "Search the overturned wagon" — not "Look around for clues" or "Investigate."
- **Frame the action, not the outcome.** The player should know what they're attempting but not whether it will succeed.
- **Use `{{main.name}}` sparingly in labels.** It works ("{{main.name}} opens the letter") but most labels read better as imperative-style actions ("Open the letter").

### Skill Check Text

- **`goal` and `approach` are player-facing.** Write them as clear, natural descriptions. "Determine where the raiders are waiting" (goal), "Read the trail signs left in the mud" (approach).
- **`twistPreview`: vague but honest.** One sentence hinting at the complication without revealing specifics. "The crossing succeeds, but something important is lost." Use "but" as the pivot.
- **`twist` text: concrete and immediate.** The full complication, stated plainly. "The party crosses, but the supply case tears free and vanishes downstream."
- **Success/failure: state the result.** Don't editorialize. "The party spots the raiders on the ridge and approaches ready for battle" (success). "The trail leads into a dead hollow" (failure).

### Endings

- **One sentence that implies the aftermath.** Victory shows normalcy restored or the goal achieved. Defeat shows absence or silence.
- **Never name emotions.** "By evening, wagons are moving along the eastern road again" — not "Everyone feels relieved that the ordeal is finally over."
- **Avoid superlatives.** No "greatest victory" or "darkest hour." State what happened and let the player feel it.

### Companion Dialogue Scenes

- **Substantial but not bloated.** 5–15 dialogue lines per conversation scene. Enough to reveal character, not so much it becomes a novel.
- **Companions bounce off each other.** When two companions are present, have them react to each other's statements, disagree, joke, or build on ideas. Avoid sequential monologues.
- **Reveal character through opinion, not exposition.** "I don't trust anything that bleeds black" tells you more about the speaker than "The creature is a shadow-wraith from the Darklands, known for their deceptive nature."
- **Use conversation hubs.** Let the player choose who to talk to and what to ask. Track conversations with flags so exhausted topics disappear and new ones unlock.

## Validation Workflow

**Always validate before declaring the work done.**

```js
// Run from apps/text-game/
node -e "
const Core = require('./core.js');
const fs = require('fs');

const char = JSON.parse(fs.readFileSync('./characters/CHARACTER.json', 'utf8'));
console.log('Character:', Core.validateCharacter(char));

const adv = JSON.parse(fs.readFileSync('./ADVENTURE.json', 'utf8'));
console.log('Adventure:', Core.validateAdventure(adv));

// Test run creation
if (Core.validateCharacter(char).length === 0 && Core.validateAdventure(adv).length === 0) {
  const run = Core.createRun(char, adv);
  console.log('Run OK:', run.status, '| Party:', run.characters.map(c => c.name));
}
"
```

Then run the full test suite:
```bash
node --test tests/text-game.test.js
```

## Common Validation Errors

1. **Missing `attackBonus` on attack-type abilities** (attack, multi, push, persistent, rush). Always include it, even as 0.
2. **Missing `minTargets`/`maxTargets` on multi/multiheal/rally abilities.**
3. **`next` pointing to non-existent scene ID.**
4. **`baseTN` outside 25-60 range.**
5. **Missing `twistPreview` or `twist` on check choices.**
6. **Companion ID missing from `pcStarts` in combat scene.**
7. **No combat scene** (exactly one required).

## Author Checklist

Before delivering:

- [ ] Works with any valid main-character file; refers to MC only as `$main` / `{{main.name}}`
- [ ] Every companion has a unique ID and complete character definition
- [ ] Every certain action is explicitly `automatic` with a `reason`
- [ ] Every check: baseTN 25-60, exactly 2 attributes, 1 skill, all situational modifiers
- [ ] Every rolled check has `success`, `failure`, `twist`, and `twistPreview`
- [ ] Failed investigation never removes info required to continue
- [ ] Quest delays state their time cost before the player chooses
- [ ] Exactly one combat scene
- [ ] Every PC has a starting zone, every enemy has a preset, every combatant has >= 1 ability
- [ ] Both combat outcomes lead to authored endings
- [ ] JSON validates via `Core.validateCharacter()` and `Core.validateAdventure()`
- [ ] `Core.createRun()` succeeds
- [ ] Full test suite passes (`node --test tests/text-game.test.js`)
