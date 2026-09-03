# Choice State Conditions

Adventure schema version 2 supports conditional availability for ordinary-scene choices. This is a visibility and legality rule: a choice whose condition does not match the current adventure state is not shown to the player and cannot be resolved by id.

The simplest form compares one state path to one exact value:

```json
{
  "id": "ask-about-the-vault",
  "label": "Ask about the opened vault.",
  "resolution": "automatic",
  "when": {
    "path": "flags.vaultOpen",
    "equals": true
  },
  "reason": "The vault is already open.",
  "outcome": {
    "text": "The keeper finally agrees to discuss what was inside.",
    "next": "vault-conversation"
  }
}
```

If `flags.vaultOpen` is not exactly `true`, the choice is unavailable. If `when` is omitted, the choice is always available.

## State paths

Choice conditions may read:

- `flags.<name>`
- `counters.<name>`
- `quest.elapsedDays`
- `clocks.<clock-id>.filled`

Flags and counters are normally declared under `initialState`. Effects may change them during play. Clock conditions must reference a clock declared by the adventure.

## Comparisons

Each condition contains exactly one comparison:

| Field | Meaning |
|---|---|
| `equals` | The state value must exactly equal the authored value. |
| `notEquals` | The state value must not exactly equal the authored value. |
| `gte` | The numeric state value must be greater than or equal to the authored number. |
| `lte` | The numeric state value must be less than or equal to the authored number. |

`equals` and `notEquals` accept JSON strings, numbers, booleans, or `null`. Equality is type-sensitive: `1`, `"1"`, and `true` are different values. `gte` and `lte` require finite numbers.

## Multiple conditions

Use `all` when every condition must match:

```json
"when": {
  "all": [
    { "path": "flags.guardFriendly", "equals": true },
    { "path": "counters.reputation", "gte": 2 }
  ]
}
```

Use `any` when at least one condition must match:

```json
"when": {
  "any": [
    { "path": "flags.hasRoyalSeal", "equals": true },
    { "path": "counters.reputation", "gte": 5 }
  ]
}
```

For compatibility, an array of conditions is treated as `all`.

## Evaluation timing

Conditions are evaluated from the current run state whenever choices are presented. Outcome effects are applied before the destination scene's choices are evaluated. This allows one choice to set a flag or counter and immediately reveal or hide choices in the next scene, or in the same scene when an outcome returns there.

A hidden choice is not merely disabled. It is absent from the available-choice list, and attempts to resolve it programmatically are rejected as unavailable.

## Authoring app

Adventure Author exposes these rules in each choice's **Availability** section. Select the state path, comparison, and required value. Remove every condition to make the choice always available.

The existing `when` field remains optional and adventure schema version 2 is unchanged.
