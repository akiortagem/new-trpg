# Optional Success with a Twist

Adventure schema version 2 permits each authored check to decide whether a failed rolled check offers **Success with a Twist**.

The contract is determined by the presence of the existing twist fields. No new public flag is required.

## Check with Success with a Twist

A check offers Success with a Twist when it contains both `twistPreview` and `twist`:

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
    "next": "far-bank"
  }
}
```

After a rolled failure, the game pauses and lets the player keep `failure` or accept `twist`. The full `twist.text` remains hidden until acceptance.

## Check without Success with a Twist

Omit both `twistPreview` and `twist` when failure should be final:

```json
{
  "id": "hold-the-gate",
  "label": "Hold the gate before the riders break through.",
  "resolution": "check",
  "actor": { "mode": "fixed", "id": "$main" },
  "check": {
    "goal": "Keep the gate closed.",
    "approach": "Brace the damaged crossbar.",
    "baseTN": 40,
    "attributes": ["str", "end"],
    "skill": "Athletics",
    "situationalModifiers": []
  },
  "success": {
    "text": "The crossbar holds until the riders turn away.",
    "next": "courtyard"
  },
  "failure": {
    "text": "The crossbar splits and the riders flood into the courtyard.",
    "next": "courtyard-overrun"
  }
}
```

A rolled failure immediately applies `failure`. The game does not open a twist decision, create a pending twist, or emit twist-offer events.

Automatic failure at TN 0 or lower continues to apply `failure` immediately whether or not the check authors a twist.

## Validation

`twist` and `twistPreview` are a pair:

- both present: Success with a Twist is enabled;
- both omitted: Success with a Twist is disabled;
- only one present: the adventure is invalid.

Existing adventures remain valid because their authored `twist` and `twistPreview` fields preserve the previous three-outcome behavior. Adventure schema version remains 2.

## Adventure Author

Every newly created check begins with Success with a Twist enabled, preserving the previous authoring default.

While editing a check, use **Offer Success with a Twist after a failed roll** to control the third outcome:

- enabled: the Twist preview and Twist outcome editors are shown;
- disabled: those editors and the Twist graph output are hidden;
- saving while disabled omits both `twistPreview` and `twist` from the adventure JSON;
- re-enabling before saving restores the check's previous authored twist when possible; a check loaded without a twist receives a fresh default twist to edit.

The editor's temporary compatibility data is never serialized into the adventure file.
