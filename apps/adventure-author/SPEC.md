# Adventure Author App Specification

## Purpose

`apps/adventure-author` is a browser-based visual editor for the adventure JSON consumed by `apps/text-game`.

The adventure JSON remains the source of truth. The editor does not introduce a second intermediate format. Editor-only node positions are stored as optional presentation metadata in the same JSON and are ignored by the text-game runtime.

## Product boundaries

- Authors create adventures as directed node graphs.
- `$main` remains selected by the player at run time.
- Required companions are embedded as complete character objects in the adventure.
- Character creation is outside this app. Character JSON can be imported from the existing library and becomes an embedded copy.
- The app authors every scene type already understood by the text game: ordinary scenes, checks, automatic choices, endings, combat, state effects, conditions, clocks, and combat interactions.
- Multiple combat scenes are valid. The editor warns when an adventure has more than one because the game is designed around one substantial combat per adventure.
- No integrated playtest mode is required.

## New adventure flow

A New Adventure wizard collects:

1. adventure id and title;
2. quest-day budget;
3. required companion characters, imported from character JSON files;
4. initial flags and counters.

The wizard then creates an initial ordinary scene and opens the graph.

## Main graph

The main workspace is a freeform directed graph.

### Node types

- **Scene** — narration/dialogue and choices.
- **Combat** — battlefield, enemy placements, interactions, victory and defeat outputs.
- **Ending** — authored terminal node. Many incoming edges are allowed.

There is no privileged main path. Any branch may be valid. Ordinary narrative loops are legal. A combat must not be wired so that one of its outcomes eventually returns to itself; the validator reports this as an error.

### Edges

Edges are derived from runtime `next` fields:

- automatic choice: one output;
- check: success, failure, twist outputs;
- combat: victory and defeat outputs.

Each node has an input port, and each authored outcome has its own output port. Authors connect nodes by dragging a wire from an outcome's output port to the destination node's input port. Dropping a connected output onto another input rewires that outcome. The inspector reports the current destination and can disconnect it, but it does not provide an alternate node selector.

Connecting an Ending node writes `next` to the ending scene id rather than inventing a separate editor-only ending reference. Existing direct `end` outcomes remain readable and can be disconnected or replaced by a graph connection.

### Layout metadata

Optional top-level editor metadata:

```json
"editor": {
  "nodes": {
    "briefing": { "x": 120, "y": 80 },
    "fight": { "x": 560, "y": 240 }
  }
}
```

This metadata is presentation-only. Adventures without it are automatically laid out when opened.

## Selection and inspectors

Selecting a graph node opens a right-hand inspector. Editing is structured rather than raw JSON by default.

### Scene inspector

- id and title;
- ordered passage list;
- Add Narration;
- Add Dialogue;
- passage reorder and delete;
- choice list;
- click a choice to edit it in a dedicated choice inspector;
- add automatic choice;
- add check choice.

### Choice inspector

Common:

- id;
- label;
- description;
- visibility condition builder;
- outcomes and structured effects;
- current destination display and disconnect action; new destinations are wired on the graph.

Automatic choice:

- reason;
- one outcome.

Check choice:

- fixed or selectable actor;
- eligible characters;
- goal and approach;
- Base TN;
- exactly two attributes;
- skill;
- situational modifiers;
- optional progress clock;
- success, failure and twist outcomes;
- twist preview.

The app does not warn merely because `$main` may lack a skill. Instead, author guidance warns against making an irreplaceable path depend on a skill that an arbitrary main character may not possess, and recommends including a companion with the required capability when that capability must matter.

## Adventure state

Flags and counters are declared centrally so choice editors can select them rather than repeatedly typing paths.

Supported structured effects match the runtime contract:

- set a writable path;
- add to a writable numeric path;
- advance a clock.

`quest.elapsedDays` is always available as a normal state path. There is no special day-consumption mechanic.

Visibility conditions support the runtime comparison operators:

- equals;
- notEquals;
- gte;
- lte;

and `all` / `any` grouping.

## Progress clocks

Clocks are managed in adventure metadata. Authors define label and size (2, 4, or 6). Check editors select a clock by id.

## Combat editor

Selecting **Edit Battlefield** on a Combat node opens a battlefield sub-editor.

### Battlefield graph

Zones are nodes. Connections are wires and carry a Move cost. The editor writes the runtime `battlefield.zones` and `battlefield.links` arrays.

PC and enemy starting positions are represented as chips associated with zones. The UI may implement this as drag/drop or a zone selector, but the visual result must clearly show starting placement.

## Enemy NPC subflow

Enemy NPCs are authored independently of combat scenes. The main navigation includes an **Enemies** button that opens a modal containing the adventure-level enemy roster and the structured enemy editor.

Each enemy NPC definition contains its stable id, name, runtime combat stats, deterministic AI preset, and abilities. Enemy definitions do not contain a starting zone. Definitions may be duplicated and reused in any combat scene in the adventure. Renaming a definition updates every placement that refers to it. Deleting a referenced definition also removes its combat placements and interaction effects that target those placements, after confirmation.

Enemy NPC definitions are stored in the top-level `enemies` array:

```json
"enemies": [
  {
    "id": "bandit",
    "name": "Bandit",
    "preset": "optimal_killer",
    "hp": 150,
    "stamina": 10,
    "mana": 0,
    "maxAp": 2,
    "atk": 35,
    "def": 5,
    "dodge": 30,
    "threat": 30,
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
        "attackBonus": 25,
        "tags": ["Physical"]
      }
    ]
  }
]
```

### Combat placement

The battlefield zone inspector does not edit enemy stat blocks. It provides a dropdown of adventure-level enemy NPCs. Adding an enemy creates a placement with a combat-local instance id, an `enemyId` reference, and a starting zone:

```json
"enemies": [
  { "id": "bandit", "enemyId": "bandit", "zone": "camp" },
  { "id": "bandit-2", "enemyId": "bandit", "zone": "gate" }
]
```

Combat-local instance ids remain the targets used by battlefield interactions. The same enemy NPC definition may therefore appear more than once in one combat without sharing runtime state.

When an older adventure is opened, each complete enemy object embedded in a combat scene is moved into the adventure-level roster and replaced with a placement reference. Conflicting definition ids receive deterministic numeric suffixes.

### Ability templates

The editor provides agnostic ability presets as starting points. They are copied into the enemy and may then be renamed and tuned. Initial presets should cover at least:

- weak melee;
- strong melee;
- weak ranged;
- strong ranged;
- weak magical melee;
- strong magical melee;
- weak magical ranged;
- strong magical ranged;
- multi-target attack;
- push attack;
- persistent-damage attack.

The presets are conveniences, not new runtime ability kinds.

Enemy editor fields include existing runtime stats, deterministic AI preset, and abilities. Starting zones belong only to combat placements.

### Enemy AI

The current runtime presets are exposed as a dropdown with explanations:

- `optimal_killer`;
- `self_preserving`;
- `dramatic_gm`.

### Interactions

Interactions are authored from a battlefield zone and expose:

- id;
- name;
- description;
- text;
- AP cost;
- once/repeatable;
- structured effects.

Combat-specific effects remain those supported by the runtime (`damage-enemy`, `condition-enemy`, `move-unit`) plus ordinary adventure state effects.

## Validation

Validation is continuous and non-blocking. Saving incomplete or invalid work is allowed.

Issues are grouped into:

### Errors

Runtime-invalid or structurally broken material, including:

- missing required fields;
- duplicate ids;
- dangling destinations;
- invalid referenced clocks/zones/actors;
- missing PC starting zones;
- combat cycles that return to the same combat;
- invalid ability data.

### Warnings

Valid but contrary to intended game structure or likely author mistakes, including:

- more than one combat scene;
- no combat scene;
- no ending nodes;
- quest day budget never consumed when a deadline is presented;
- fixed `$main` skill gate with no alternate route (guidance only where detectable).

### Info

Potentially intentional graph facts, including:

- unreachable nodes;
- nodes with no incoming edges other than start;
- endings with no incoming edge.

None prevent Save.

## Opening and schema compatibility

The editor accepts only the exact adventure schema version it understands. It must refuse to open an adventure when:

- `kind` is not `adventure`;
- `schemaVersion` is unsupported;
- the file contains structural fields the editor cannot safely round-trip.

The error should explain that the adventure schema or authoring app may be out of date. It must not silently drop unknown data.

## Raw JSON mode

Authors may open a raw JSON editor. Applying raw changes reparses and validates the complete adventure, then reconstructs the visual graph. Invalid JSON remains in the raw editor until corrected or cancelled.

## File persistence

When supported by the browser, **Open** uses the File System Access API and retains the file handle. **Save** writes back to that same JSON file.

For browsers without direct file handles, the app may fall back to downloading the current JSON. The UI must make the fallback explicit because it cannot truly overwrite the original file.

Autosave is not required.

## Undo and redo

Undo/redo covers all document-changing editor operations, including:

- node creation/deletion;
- node movement;
- edge rewiring;
- inspector edits;
- passage/choice edits;
- state and clock changes;
- battlefield changes;
- raw JSON application.

File open/new resets history.

## Integration with text-game

The authoring app should reuse `TextGameCore.validateAdventure` for runtime errors where practical. It adds author-only warnings and infos on top.

The text-game validator must allow multiple combat scenes. The one-combat design expectation moves from a hard runtime validation error to an authoring warning.

## Initial delivery acceptance criteria

- New Adventure wizard creates a valid draft and enters the graph.
- Existing supported adventure JSON can be opened and visually reconstructed.
- Scene, Combat and Ending nodes can be created, moved, selected and deleted.
- Choice destinations can be wired through structured destination controls and visibly render as edges.
- Scene passages and automatic/check choices can be authored without raw JSON.
- State declarations, conditions, effects and clocks have structured controls.
- Combat battlefield zones/links, PC starts, enemies, agnostic ability presets and interactions can be authored.
- Multiple combats save successfully but produce a warning.
- Save overwrites the opened file when the browser grants a writable file handle.
- Raw JSON can be viewed, edited and reapplied.
- Unsupported schema is rejected before editing.
- Undo/redo works for document edits.
- `SPEC.md` remains in the app directory as the implementation contract.
