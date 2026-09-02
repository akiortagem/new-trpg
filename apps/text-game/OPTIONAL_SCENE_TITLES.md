# Scene Title Visibility

Adventure-level `title` remains required. Individual ordinary scenes, combat scenes, and endings may carry an authored `title` independently from whether that title is shown to the player.

Each scene object may optionally define:

```json
"showTitle": false
```

`showTitle` must be a boolean when present. If it is omitted, it defaults to `true`.

This separates the node's authoring label from its in-game presentation. An author can keep a descriptive title visible on the Adventure Author graph while suppressing the title interruption during play.

## Recommended usage

Keep a useful `title` on the node for authoring, then set `showTitle` to `false` when the scene should flow directly from the previous scene or outcome:

```json
{
  "type": "scene",
  "title": "Mira Takes the Lower Road",
  "showTitle": false,
  "text": [
    { "speaker": "Mira", "text": "Then we take the lower road." }
  ],
  "choices": [
    {
      "id": "continue",
      "label": "Continue",
      "resolution": "automatic",
      "reason": "Continue the conversation.",
      "outcome": {
        "text": "The party moves on.",
        "next": "lower-road"
      }
    }
  ]
}
```

Adventure Author exposes this as **Show title in game** on ordinary scenes, combats, and endings. Turning it off does not alter the title shown on the authoring graph.

Turning the toggle back on removes the explicit override and returns the scene to the default `showTitle: true` behavior.

## Runtime behavior

When `showTitle` is `true` or omitted and the scene has a non-empty title, existing title presentation is unchanged, including `{{main.name}}` substitution.

When `showTitle` is `false`:

- **Ordinary scene:** no separate Scene/title message is inserted into the visual-novel flow. Passages and choices continue normally.
- **Combat scene:** the battle title heading is omitted. The combat-start log uses neutral wording rather than leaking the authored title.
- **Ending:** the ending title heading is omitted. Outcome and ending text are still shown.

The authored `title` remains in adventure data and remains available to authoring tools. Scene ids also remain structural identifiers and are not promoted into a player-facing title.

## Titleless compatibility

The previous optional-title behavior remains valid for existing adventures. A scene may still omit `title`, use `"title": null`, or provide a blank title. Such a scene has nothing to display regardless of `showTitle`.

For new authored content, `showTitle: false` is preferred when the scene needs an editor-visible label but no in-game title.

## Compatibility

This is a backward-compatible extension of adventure schema version 2. Existing adventures omit `showTitle`, so they default to the same visible-title behavior they already had. Adventures that intentionally used omitted, `null`, or blank titles continue to suppress title presentation. The schema version does not change.
