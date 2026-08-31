# Adventure Authoring Guide

An adventure is a JSON file containing the entire scripted scenario. It supplies the companions, narration, choices, checks, consequences, state changes, and one combat encounter. A separate character JSON file supplies the player's main character.

JSON does not permit comments. Unknown presentation fields are ignored, but required rules fields are validated before play begins. Character files use `schemaVersion: 1`. Adventure files use `schemaVersion: 2`; version 2 introduces the required Base TN and is not compatible with adventures authored with the former difficulty-modifier field.

## Character files

A character file is both a reusable main-character format and the format used for companions embedded in an adventure.

```json
{
  "schemaVersion": 1,
  "kind": "character",
  "id": "rhea",
  "name": "Rhea",
  "role": "Caravan Guard",
  "attributes": {
    "str": 15,
    "end": 10,
    "vit": 10,
    "mnd": 5,
    "agi": 10,
    "dex": 15,
    "int": 5
  },
  "skills": {
    "Athletics": 2,
    "Awareness": 1,
    "Swordsmanship": 3
  },
  "combat": {
    "hp": 250,
    "stamina": 15,
    "mana": 0,
    "inventoryPoints": 3,
    "maxAp": 3,
    "def": 20,
    "defenseBonus": 40
  },
  "abilities": [
    {
      "id": "sword-strike",
      "name": "Sword Strike",
      "kind": "attack",
      "ap": 1,
      "stamina": 0,
      "mana": 0,
      "power": 55,
      "minRange": 0,
      "maxRange": 0,
      "attackBonus": 45,
      "tags": ["Physical"]
    }
  ]
}
```

Skill values are ranks from 0 to 5. Outside combat, the engine converts a rank to `rank × 5`. Combat fields are the finished values shown on the character sheet. `defenseBonus` is the character's full contribution after enemy Threat when the character Defends: AGI, DEX, applicable held-implement skill, and Implement DEF.

Every ability provides its final ATK as `power` and its attack-roll contribution as `attackBonus`. The supported ability kinds are:

| Kind | Resolution |
|---|---|
| `attack` | Single-target attack. |
| `multi` | Multi-target attack; requires `minTargets` and `maxTargets`. |
| `push` | Single-target attack with optional forced movement after damage. |
| `persistent` | Single-target attack; use `condition` to apply Persistent Damage. |
| `rush` | Move across one ordinary connection and attack a target in the destination. |
| `heal` | Heal one target automatically. |
| `multiheal` | Heal several targets; requires `minTargets` and `maxTargets`. |
| `rally` | Apply Rallied to several allies; requires `minTargets` and `maxTargets`. The invoker receives the start-of-turn sustain decision in later rounds. |

A condition attached to an ability is an object. Persistent Damage may include its damage amount:

```json
"condition": { "id": "Persistent Damage", "amount": 10, "expression": "Burning" }
```

Special Ward-style reactions can be listed separately. Universal Defend and Protect do not need to be listed.

```json
"reactions": [
  {
    "id": "galeshield",
    "name": "Galeshield",
    "kind": "ward",
    "ap": 1,
    "mana": 2,
    "defBonus": 15,
    "threatBonus": 25,
    "tagBonus": { "arrow": 10 }
  }
]
```

## Adventure structure

The top level has this shape:

```json
{
  "schemaVersion": 2,
  "kind": "adventure",
  "id": "unique-adventure-id",
  "title": "Adventure Title",
  "startScene": "briefing",
  "questDays": 3,
  "initialState": {
    "flags": {},
    "counters": {}
  },
  "clocks": {},
  "party": [],
  "scenes": {}
}
```

`party` contains the full character objects for every companion. It never contains the main character. Adventures refer to whatever main-character file the player selected as `$main`, so an adventure cannot restrict the player's main-character choice.

An adventure must contain exactly one scene with `type: "combat"`. It may contain any number of ordinary scenes and endings.

## Main-character name placeholder

Use `{{main.name}}` in displayed adventure text when the copy should name whichever main-character file the player selected. The app replaces the placeholder when a new run begins.

```json
{
  "type": "scene",
  "title": "A Contract for {{main.name}}",
  "text": [
    "The guildmaster pushes a sealed letter toward {{main.name}}.",
    { "speaker": "{{main.name}}", "text": "What is inside?" }
  ],
  "choices": [
    {
      "id": "open-letter",
      "label": "{{main.name}} opens the letter.",
      "resolution": "automatic",
      "reason": "Opening the letter requires no check.",
      "outcome": {
        "text": "{{main.name}} breaks the seal.",
        "next": "briefing"
      }
    }
  ]
}
```

The placeholder works in presentation fields such as adventure and scene titles, narration, dialogue speakers and text, choice copy, check wording, outcome text, twist previews, ending copy, zone labels, and combat names. It is not substituted in structural rules fields such as `id`, `next`, `path`, actor references, zone references, skill names, or effect values. Continue to use `$main` where the schema expects the main character's id, such as `actor.id` and `pcStarts`.

## Ordinary scenes and passages

An ordinary scene contains displayed passages and choices. A passage can be a plain string or attributed dialogue.

```json
{
  "type": "scene",
  "title": "At the East Gate",
  "text": [
    "Rain runs from the gatehouse roof.",
    { "speaker": "Toma", "text": "The wagon passed through before dawn." }
  ],
  "choices": []
}
```

Choices can represent dialogue, a particular character's action, or a broad party decision. Their labels and descriptions carry the fiction; `resolution` determines how the rules resolve them.

## Author-marked no-roll choices

Use `resolution: "automatic"` when the action requires no roll. This covers ordinary competence, impossible actions with an established consequence, abilities whose defined effect completely solves the task, and any other certain result.

```json
{
  "id": "move-tree-with-gust",
  "label": "Mira uses Gust to blow the fallen tree aside.",
  "description": "The ability's Forced Move effect completely resolves the obstruction.",
  "resolution": "automatic",
  "reason": "Gust completely resolves the task.",
  "outcome": {
    "text": "The trunk rolls into the ditch and clears the road.",
    "next": "road-cleared",
    "effects": [
      { "type": "set", "path": "flags.roadCleared", "value": true }
    ]
  }
}
```

The app does not infer automatic success from an ability name. The author decides that the defined effect resolves the task and marks the choice accordingly.

An ordinary scene's title and opening passages are presented only on its first visit. When several choices belong to the same conversation or investigation, outcomes may lead to subscenes and then set `next` back to the original scene. Returning to any previously visited ordinary scene goes directly to its currently available choices without repeating its opening. Use conditions and effects to hide questions that have already been asked or reveal new choices. If prose must play again later, place that prose in a new scene with a distinct id. Combat scenes are not subject to this rule and may start again when an outcome points back to them.

## Checks and actors

A check choice names its acting character policy, Base TN, two attributes, one skill, and every distinct situational modifier. The interface discloses all of these and the final TN before the player commits.

Use a fixed actor when the scenario determines who acts:

```json
"actor": { "mode": "fixed", "id": "$main" }
```

Use a selectable actor when the player may choose among eligible party members:

```json
"actor": { "mode": "select", "eligible": ["*"] }
```

`*` means the whole party. A list may instead contain `$main` and particular companion ids.

```json
"check": {
  "goal": "Reach the far bank before the pursuers arrive.",
  "approach": "Brace a rope and cross against the current.",
  "baseTN": 40,
  "attributes": ["str", "end"],
  "skill": "Athletics",
  "situationalModifiers": [
    { "label": "Secured rope", "value": 15 }
  ]
}
```

Use Base TN 60 for a Challenging task, 40 for a Heroic task, or 25 for an Extremely Heroic task. Values between 25 and 60 are valid. The final TN is calculated as written in the rules. A TN of 100 or more succeeds without rolling. A TN of 0 or less fails without rolling. The latter is not a failed check, so it does not offer Success with a Twist.

Every rolled check must provide three authored outcomes:

- `success`: the declared goal is achieved.
- `failure`: the goal is not achieved and the situation changes.
- `twist`: the goal is achieved and the authored complication occurs.

`twistPreview` is the vague disclosure shown after a failed roll. The full `twist.text` is not shown until the player accepts.

```json
{
  "id": "cross-river",
  "label": "Cross by the old ferry rope.",
  "resolution": "check",
  "actor": { "mode": "select", "eligible": ["*"] },
  "check": {
    "goal": "Get the party across the river.",
    "approach": "Brace and guide the ferry rope.",
    "baseTN": 40,
    "attributes": ["str", "end"],
    "skill": "Athletics",
    "situationalModifiers": []
  },
  "success": {
    "text": "The party reaches the far bank before the pursuit appears.",
    "next": "far-bank"
  },
  "failure": {
    "text": "The crossing fails, and the riders trap the party against the river.",
    "next": "captured"
  },
  "twistPreview": "The crossing succeeds, but something important is lost.",
  "twist": {
    "text": "The party crosses, but the supply case tears free and vanishes downstream.",
    "next": "far-bank",
    "effects": [
      { "type": "set", "path": "flags.suppliesLost", "value": true }
    ]
  }
}
```

An outcome may use `"end": "victory"` or `"end": "defeat"` instead of `next`. Ending scenes are usually clearer when several branches converge.

## State and conditional choices

Effects change adventure state after an outcome.

| Effect | Example |
|---|---|
| Set a value | `{ "type": "set", "path": "flags.guardAlerted", "value": true }` |
| Add to a number | `{ "type": "add", "path": "quest.elapsedDays", "value": 1 }` |
| Advance a clock | `{ "type": "advance-clock", "id": "search", "segments": 1 }` |

Writable paths begin with `flags`, `counters`, `quest`, or `clocks`.

A choice can be gated by state. Every condition in `all` must match; at least one condition in `any` must match.

```json
"when": {
  "all": [
    { "path": "flags.guardAlerted", "equals": false },
    { "path": "quest.elapsedDays", "lte": 2 }
  ]
}
```

Conditions support `equals`, `notEquals`, `gte`, and `lte`.

## Progress clocks

Declare two-, four-, or six-segment clocks at the top level.

```json
"clocks": {
  "search": { "label": "Search the Manor", "size": 4 }
}
```

Attach a contribution to a clock with `check.clock`:

```json
"check": {
  "baseTN": 40,
  "attributes": ["int", "dex"],
  "skill": "Investigation",
  "situationalModifiers": [],
  "clock": "search"
}
```

A successful contribution fills one segment. A natural 01–05 fills two. Failure does not remove segments unless the failure outcome explicitly changes the clock.

Use conditional choices to change scenes when a clock is complete:

```json
"when": { "path": "clocks.search.filled", "gte": 4 }
```

## Combat scenes

A combat scene defines a zone network, the starting zone for every PC, enemies, and binary outcomes.

```json
{
  "type": "combat",
  "title": "The Roadside Ambush",
  "ambush": false,
  "battlefield": {
    "zones": [
      { "id": "road", "name": "Road" },
      { "id": "ridge", "name": "Ridge" }
    ],
    "links": [
      { "from": "road", "to": "ridge", "cost": 1 }
    ]
  },
  "pcStarts": {
    "$main": "road",
    "toma": "road"
  },
  "enemies": [],
  "victory": {
    "text": "The last attacker falls back.",
    "next": "safe-return"
  },
  "defeat": {
    "text": "The party is overwhelmed.",
    "next": "fallen"
  }
}
```

Every companion id must appear in `pcStarts`, along with `$main`. A connection's `cost` is its number of Moves. Progress across a long connection persists between rounds. A combatant partway across is in transit, cannot use ordinary abilities or reactions, and may continue or abandon the crossing on their turn.

An enemy supplies finished combat statistics, abilities, and one deterministic preset:

```json
{
  "id": "raider-1",
  "name": "Road Raider",
  "preset": "optimal_killer",
  "zone": "ridge",
  "hp": 120,
  "maxAp": 2,
  "atk": 40,
  "def": 5,
  "dodge": 30,
  "threat": 25,
  "abilities": [
    {
      "id": "strike",
      "name": "Strike",
      "kind": "attack",
      "ap": 1,
      "stamina": 0,
      "mana": 0,
      "power": 40,
      "minRange": 0,
      "maxRange": 0,
      "tags": ["Physical"]
    }
  ]
}
```

The presets contain no randomness and make no network request:

| Preset | Deterministic priorities |
|---|---|
| `optimal_killer` | Focus the easiest PC to defeat and select the highest-impact legal attack. Defend against dangerous or fight-ending attacks. |
| `self_preserving` | Approach the nearest threat, Defend whenever possible, and retain the last AP while badly wounded. |
| `dramatic_gm` | Spread pressure among PCs before repeating targets and vary defense instead of applying perfect focus fire. |

The rules engine rechecks AP, range, targets, conditions, and costs before resolving any action. NPCs do not attempt finishing blows; combat ends in defeat when no PC remains conscious.

### Authored combat interactions

Use `interactions` when a battlefield offers a predetermined Interact action. An interaction appears only to a PC in its zone with enough AP.

```json
"interactions": [
  {
    "id": "drop-portcullis",
    "name": "Drop the Portcullis",
    "description": "Pull the gatehouse lever.",
    "text": "The portcullis crashes onto the raider.",
    "zone": "gatehouse",
    "ap": 1,
    "once": true,
    "effects": [
      { "type": "damage-enemy", "targetId": "raider-1", "amount": 50 },
      { "type": "set", "path": "flags.portcullisDropped", "value": true }
    ]
  }
]
```

Combat interactions support the ordinary state effects plus these explicit battlefield effects:

| Effect | Required fields |
|---|---|
| `damage-enemy` | `targetId`, `amount` |
| `condition-enemy` | `targetId`, `condition` |
| `move-unit` | `side` (`pc` or `npc`), `targetId`, `zone` |

An interaction is single-use unless `once` is `false`. Its consequences are authored rather than improvised by the engine.

## Complete miniature adventure

The following file is a format example, not an included playable adventure. It can be copied to a `.json` file and paired with any valid main-character file. The embedded companion id is `toma`, so the combat scene uses `$main` and `toma` in `pcStarts`.

```json
{
  "schemaVersion": 2,
  "kind": "adventure",
  "id": "miniature-road-test",
  "title": "The Broken Milestone",
  "startScene": "briefing",
  "questDays": 1,
  "initialState": {
    "flags": { "raidersWarned": false },
    "counters": {}
  },
  "clocks": {},
  "party": [
    {
      "schemaVersion": 1,
      "kind": "character",
      "id": "toma",
      "name": "Toma",
      "role": "Village Scout",
      "attributes": { "str": 10, "end": 10, "vit": 10, "mnd": 5, "agi": 15, "dex": 15, "int": 10 },
      "skills": { "Awareness": 3, "Archery": 3 },
      "combat": { "hp": 250, "stamina": 15, "mana": 0, "inventoryPoints": 3, "maxAp": 3, "def": 15, "defenseBonus": 45 },
      "abilities": [
        { "id": "bow-shot", "name": "Bow Shot", "kind": "attack", "ap": 1, "stamina": 0, "mana": 0, "power": 50, "minRange": 0, "maxRange": 1, "attackBonus": 45, "tags": ["Physical", "arrow"] }
      ]
    }
  ],
  "scenes": {
    "briefing": {
      "type": "scene",
      "title": "A Road Gone Quiet",
      "text": [
        "The eastern road has been silent since yesterday.",
        { "speaker": "Toma", "text": "The broken milestone is where the wagon tracks disappear." }
      ],
      "choices": [
        {
          "id": "depart",
          "label": "Travel to the broken milestone.",
          "resolution": "automatic",
          "reason": "Ordinary travel presents no meaningful uncertainty.",
          "outcome": { "text": "The party reaches the milestone before noon.", "next": "tracks" }
        }
      ]
    },
    "tracks": {
      "type": "scene",
      "title": "Tracks in the Ditch",
      "text": ["Fresh wheel ruts leave the road, but bootprints have churned the wet ground around them."],
      "choices": [
        {
          "id": "read-tracks",
          "label": "Determine where the raiders are waiting.",
          "description": "Choose who studies the confused trail.",
          "resolution": "check",
          "actor": { "mode": "select", "eligible": ["*"] },
          "check": {
            "goal": "Locate the raiders before entering their ambush.",
            "approach": "Separate the wagon trail from the newer bootprints.",
            "baseTN": 60,
            "attributes": ["int", "dex"],
            "skill": "Awareness",
            "situationalModifiers": []
          },
          "success": {
            "text": "The party spots the raiders on the ridge and approaches ready for battle.",
            "next": "ambush"
          },
          "failure": {
            "text": "The trail leads into a dead hollow. The raiders surround the party before weapons can be drawn.",
            "next": "lost"
          },
          "twistPreview": "The raiders are found, but they learn the party is coming.",
          "twist": {
            "text": "The party finds the ridge, but a lookout escapes and warns the raiders.",
            "next": "ambush",
            "effects": [
              { "type": "set", "path": "flags.raidersWarned", "value": true }
            ]
          }
        }
      ]
    },
    "ambush": {
      "type": "combat",
      "title": "The Roadside Ambush",
      "ambush": false,
      "battlefield": {
        "zones": [
          { "id": "road", "name": "Road" },
          { "id": "ditch", "name": "Ditch" },
          { "id": "ridge", "name": "Ridge" }
        ],
        "links": [
          { "from": "road", "to": "ditch", "cost": 1 },
          { "from": "ditch", "to": "ridge", "cost": 1 }
        ]
      },
      "pcStarts": { "$main": "road", "toma": "road" },
      "enemies": [
        {
          "id": "raider-1",
          "name": "Road Raider",
          "preset": "optimal_killer",
          "zone": "ridge",
          "hp": 120,
          "maxAp": 2,
          "atk": 40,
          "def": 5,
          "dodge": 30,
          "threat": 25,
          "abilities": [
            { "id": "strike", "name": "Strike", "kind": "attack", "ap": 1, "stamina": 0, "mana": 0, "power": 40, "minRange": 0, "maxRange": 0, "tags": ["Physical"] }
          ]
        }
      ],
      "victory": { "text": "The raider breaks and the road is safe again.", "next": "return" },
      "defeat": { "text": "The party is overwhelmed on the ridge road.", "next": "lost" }
    },
    "return": {
      "type": "ending",
      "title": "The Road Reopens",
      "outcome": "victory",
      "text": "By evening, wagons are moving along the eastern road again."
    },
    "lost": {
      "type": "ending",
      "title": "The Silent Road",
      "outcome": "defeat",
      "text": "No word returns to the village before nightfall."
    }
  }
}
```

## Author checklist

- The adventure works with any valid main-character file and refers to it only as `$main`.
- Every companion has a unique id and a complete character definition.
- Every certain action is explicitly marked `automatic`; the app is not expected to infer it.
- Every check exposes a Base TN from 25 to 60, exactly two attributes, one skill, and all situational modifiers.
- Every rolled check authors Success, Failure, Success with a Twist, and a vague twist preview.
- Failed investigation never removes the information required to continue unless that consequence ends the adventure intentionally.
- Quest delays state their time cost before the player chooses them.
- The adventure contains exactly one combat scene.
- Every PC has a combat starting zone, every enemy has a deterministic preset, and every combatant has at least one legal ability.
- Both combat outcomes lead to an authored victory or defeat ending.
- The file validates on the start screen before it is distributed to players.
