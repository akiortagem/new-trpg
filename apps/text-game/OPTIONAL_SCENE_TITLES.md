# Optional Scene Titles

Adventure-level `title` remains required. Titles on individual objects under `scenes` are optional.

This applies to ordinary scenes, combat scenes, and endings. An author may:

- omit `title` entirely;
- set `"title": null`; or
- leave the title blank in Adventure Author.

A non-empty string keeps the existing title presentation, including `{{main.name}}` substitution.

## Runtime behavior

A titleless scene has no title presentation. The engine does not substitute the adventure title or the scene id as a player-facing title.

- **Ordinary scene:** no separate Scene/title message is inserted into the visual-novel flow. The scene's passages and choices continue normally, including the existing first-visit behavior.
- **Combat scene:** the battle title heading is omitted. The combat itself starts normally.
- **Ending:** the ending title heading is omitted. Outcome and ending text are still shown.

Scene ids remain structural identifiers. They may still appear in developer-facing information such as the event log or save metadata; they are not promoted into an in-game scene title.

## Authoring examples

A branching scene can omit the field so its prose flows directly from the preceding outcome:

```json
{
  "type": "scene",
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

The equivalent explicit form is:

```json
{
  "type": "scene",
  "title": null,
  "text": ["The conversation continues without a title card."],
  "choices": []
}
```

Adventure Author treats a cleared scene-title field as titleless, so authors do not need to edit raw JSON merely to suppress a title.

## Compatibility

This is a backward-compatible relaxation of adventure schema version 2. Existing adventures with titles behave as before, so the schema version does not change.
