# Speaker Visual Identities

Dialogue speakers may optionally declare a `visualIdentity` on any dialogue passage object:

```json
{
  "speaker": "Mira",
  "text": "You heard that too, right?",
  "visualIdentity": "teal"
}
```

Supported identities are `teal`, `amber`, `rose`, `violet`, `green`, `blue`, `coral`, and `mint`.

The identity is semantic to the speaker name, not to one passage. If any passage for `Mira` declares `teal`, every `Mira` dialogue line is presented with the teal identity. Declaring two different identities for the same speaker is invalid. Authors should use the Adventure Author dropdown rather than editing these values by hand.

When no identity is authored, the text game assigns one deterministically from the same palette. Explicit author choices reserve their colors first; automatic speakers receive unused colors where possible and only reuse colors after the palette is exhausted.

Speaker identity changes affect the dialogue nameplate, border/accent rail, textbox tint, and message history. A short emphasis animation runs only when the visible speaker changes. Reduced-motion preferences disable that animation.

## Compatibility

`visualIdentity` is optional and remains inside an existing dialogue passage object, so adventure schema version 2 does not change.

- Older adventures contain no `visualIdentity` and receive automatic identities in the enhanced text game.
- Older text-game builds ignore the extra dialogue property and continue to render styled adventures normally without the new styling.
- Older Adventure Author builds preserve the extra property because dialogue passage objects are edited in place.

Narration strings, GM narration, party choices, rules messages, and scene titles do not consume character visual identities.
