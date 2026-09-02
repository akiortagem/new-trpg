# Adventure Author

Visual authoring tool for adventure JSON consumed by `../text-game`.

Open `index.html` through the same static server used for the repository apps. The editor supports creating and opening adventures, graph-based scene flow, structured scene/check editing, state and clocks, combat battlefields, enemy ability templates, validation, raw JSON editing, undo/redo, speaker visual-identity assignment, and direct file overwrite through the browser File System Access API when available.

To connect nodes, drag an outcome's output port to the input port on another node. Dragging an already connected output rewires it; use **Disconnect** beside the outcome in the inspector to remove its current destination.

Dialogue passages include a **Visual identity** dropdown. The choice belongs to the speaker name: assigning an identity to one `Mira` passage applies it to every `Mira` passage in the adventure. **Automatic** removes the authored override and lets the text game assign a stable palette entry at runtime.

## File behavior

- `$main` is not embedded; the text-game player selects it when starting a run.
- Companion character JSON imported into the editor is copied into `party` so the finished adventure has no external companion dependency.
- Speaker visual identities are stored as an optional `visualIdentity` property on existing dialogue passage objects, so adventure schema version 2 does not change and older adventures remain valid.
- Node coordinates are optional under top-level `editor` metadata.
- Existing adventures without coordinates are auto-laid out on open.
- Unsupported adventure schema versions or unknown top-level structural fields are rejected instead of being silently rewritten.
- Save overwrites the opened file when the browser provides a writable file handle. Other browsers receive an explicit download fallback.

## Validation

Validation never blocks saving. Runtime-invalid issues are Errors; design concerns such as multiple combat scenes are Warnings; graph observations such as unreachable nodes are Info.

The game is still designed around one substantial combat in an adventure, but the runtime accepts multiple combat nodes for authors who deliberately need them.

Speaker VI values are validated by the shared text-game compatibility layer. Unknown palette tokens and conflicting authored identities for the same speaker are invalid.

## Tests

The authoring model and text-game compatibility layer have dependency-free Node regression tests. From the repository root, run:

```sh
node --test apps/adventure-author/tests/*.test.js
```

See [`SPEC.md`](SPEC.md) for the implementation contract and authoring decisions, and [`../text-game/SPEAKER_VISUAL_IDENTITIES.md`](../text-game/SPEAKER_VISUAL_IDENTITIES.md) for the dialogue property and compatibility details.
