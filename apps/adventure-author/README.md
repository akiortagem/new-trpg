# Adventure Author

Visual authoring tool for adventure JSON consumed by `../text-game`.

Open `index.html` through the same static server used for the repository apps. The editor supports creating and opening adventures, graph-based scene flow, structured scene/check editing, optional Success with a Twist per check, state and clocks, combat battlefields, enemy ability templates, validation, raw JSON editing, undo/redo, speaker visual-identity assignment, and direct file overwrite through the browser File System Access API when available.

On the main graph, single-click a node to select it. Narrative scenes open for editing only after a double-click. Press **Delete** to delete the selected node when focus is not inside an editable control or modal. Node selection is exposed as its own interaction state so additional selected-node actions can be added without changing the scene-open gesture. The main canvas scrollbars are hidden; navigate the extended canvas with middle-mouse dragging or other scrolling input.

To connect nodes, drag an outcome's output port to the input port on another node. Dragging an already connected output rewires it; use **Disconnect** beside the outcome in the inspector to remove its current destination.

Dialogue passages include a **Visual identity** dropdown. The choice belongs to the speaker name: assigning an identity to one `Mira` passage applies it to every `Mira` passage in the adventure. **Automatic** removes the authored override and lets the text game assign a stable palette entry at runtime.

Each ordinary-scene choice has an **Availability** section. Authors can make the choice available only while a flag, counter, quest value, or clock value matches an authored condition. The most direct form is `state path` **is** `required value`; multiple conditions may use All or Any. Removing every condition makes the choice always available.

Check choices expose **Offer Success with a Twist after a failed roll**. New checks keep it enabled by default. Turning it off hides the Twist preview, Twist outcome, and Twist graph output; saved JSON omits both `twistPreview` and `twist`. Turning it back on during the same editing session restores the previous authored twist when possible.

## File behavior

- `$main` is not embedded; the text-game player selects it when starting a run.
- Companion character JSON imported into the editor is copied into `party` so the finished adventure has no external companion dependency.
- Choice availability is stored in the existing optional `when` field. Hidden choices are not shown by the game and cannot be selected until their condition matches. Adventure schema version 2 does not change.
- Success with a Twist is controlled by the existing `twistPreview` and `twist` fields as a pair. Both present enables the existing offer after rolled failure; both omitted makes rolled failure resolve directly to `failure`. The editor never serializes its temporary compatibility placeholder or backup metadata. Adventure schema version 2 does not change.
- Ordinary scenes, combats, and endings expose **Show title in game** independently from the title text. The optional `showTitle` field defaults to `true`; turning the toggle off writes `showTitle: false` while keeping the authored `title` visible on the graph. Turning it back on removes the override. Existing raw JSON may still omit `title` or set it to `null`; the adventure-level title remains required.
- Speaker visual identities are stored as an optional `visualIdentity` property on existing dialogue passage objects, so adventure schema version 2 does not change and older adventures remain valid.
- Node coordinates are optional under top-level `editor` metadata.
- Existing adventures without coordinates are auto-laid out on open.
- Unsupported adventure schema versions or unknown top-level structural fields are rejected instead of being silently rewritten.
- Save overwrites the opened file when the browser provides a writable file handle. Other browsers receive an explicit download fallback.

## Validation

Validation never blocks saving. Runtime-invalid issues are Errors; design concerns such as multiple combat scenes are Warnings; graph observations such as unreachable nodes are Info.

The game is still designed around one substantial combat in an adventure, but the runtime accepts multiple combat nodes for authors who deliberately need them.

Choice conditions must name a safe state path under `flags`, `counters`, `quest`, or `clocks` and exactly one comparison. `equals` and `notEquals` accept scalar JSON values; `gte` and `lte` require finite numbers. For a check, `twist` and `twistPreview` must either both be present or both be omitted. `showTitle`, when present on a scene, combat, or ending, must be a boolean. Speaker VI values are validated by the shared text-game compatibility layer. Unknown palette tokens and conflicting authored identities for the same speaker are invalid.

## Tests

The authoring model and text-game compatibility layer have dependency-free Node regression tests. From the repository root, run:

```sh
node --test apps/adventure-author/tests/*.test.js
```

See [`SPEC.md`](SPEC.md) for the implementation contract and authoring decisions, [`../text-game/CHOICE_STATE_CONDITIONS.md`](../text-game/CHOICE_STATE_CONDITIONS.md) for state-gated choice behavior, [`../text-game/OPTIONAL_SCENE_TITLES.md`](../text-game/OPTIONAL_SCENE_TITLES.md) for scene-title visibility behavior, [`../text-game/OPTIONAL_CHECK_TWISTS.md`](../text-game/OPTIONAL_CHECK_TWISTS.md) for per-check Success with a Twist behavior, and [`../text-game/SPEAKER_VISUAL_IDENTITIES.md`](../text-game/SPEAKER_VISUAL_IDENTITIES.md) for dialogue visual identities.
