# Combat Playtest Packet

**Rules reference:** `COMBAT_RULES_V0.md`  
**Date:** 26 August 2026

This packet contains everything needed to run the first combat playtest. It is divided into a player section and a GM section. Players should not read the GM section before play.

# Player Section

## What You Are Testing

This playtest consists of two independent battles using the same four characters:

1. an assault on a bandit camp; and
2. a fight against a lone troll.

Each battle should take approximately 30–45 minutes. The characters return to full HP, stamina, and mana between battles, clear all temporary conditions, and begin each battle with 3 Inventory Points. The battles are not part of a continuous adventure.

Play to win. Choose whatever appears most effective, repeat an ability if it remains useful, conserve resources if that seems wise, and exploit any interaction you discover. Do not use an ability merely because it has not appeared yet.

Ask when a rule or consequence is unclear. The GM will record rules questions and may answer them during play. There is no need to protect the game from mistakes.

## Before Combat

Choose one character. Read that character's abilities and the following rules in `COMBAT_RULES_V0.md`:

- The Shape of Combat
- Action Points
- Zones and Range
- Attacks and Defense
- Multi-Target Attacks
- Universal Abilities
- Conditions
- Hit Points, Defeat, and Death
- Resources and Recovery

Record starting resources where indicated. During combat, mark spent AP and resources directly on the sheet or on separate paper.

## Rules Shared by Every Character

Every character has Move, Strike, Defend, Protect, Use Consumable, Interact, and Recover. Magical characters also have Touch through their magical skill.

At the start of each round, refresh to 3 AP. Spend AP on your turn or retain it for reactions. All remaining AP expires at the end of the round.

When an enemy attacks you, you may spend 1 AP to Defend. When you attack an enemy, the GM decides whether that enemy spends 1 AP to Defend. Players make all percentile rolls.

One Inventory Point and 1 AP restore either 50 HP, 5 stamina, or 6 mana.

At the beginning of combat, roll a d6 to determine the first Critical Round. During that round, the party may spend one Critical for any PC:

- **Critical Attack:** `C-ATK = ATK + (DEX, AGI, STR, or INT × 2)`. Choose the attribute. The attack cannot be Defended and may be multi-target.
- **Invincibility Frame:** Declare at the beginning of the round or when the chosen PC faces a hostile effect. That PC is immune to all hostile effects, including attacks, damage, and conditions, for the rest of the round.
- **Critical Recovery:** One PC restores HP equal to half maximum HP and removes all conditions. This may revive a PC but does not restore AP.

The Critical expires at the end of the round. Whether it was spent or not, roll another d6 and add the result to the current round number to schedule the next Critical Round. Enemies do not receive Criticals.

## Ardan, Polearm Mercenary

Ardan combines strong basic attacks with stamina-powered bursts, sweeping attacks, and rapid advances.

**Attributes:** STR 15, END 15, VIT 10, MND 5, AGI 10, DEX 15, INT 5  
**Skill:** Polearms — Skilled (+15)  
**Equipment:** Two-handed polearm, medium armor

| Resource | Maximum | Current |
|---|---:|---:|
| HP | 250 | 250 |
| Stamina | 20 | 20 |
| Inventory Points | 3 | 3 |
| AP | 3 | 3 |
| DEF | 20 | 20 |

**Polearm Strike — 1 AP:** Range 0, one target, 55 Physical ATK. If the target Defends, roll against its Dodge + STR 15 + DEX 15 + Polearms 15.

**Impaling Thrust — 2 AP, 3 stamina:** Range 0, one target, 75 Physical ATK. If the target Defends, use the same target-number contributions as Polearm Strike.

**Sweeping Arc — 2 AP, 4 stamina:** Range 0, two or three targets, 45 Physical ATK. Each target may spend 1 AP to apply DEF; no percentile roll is made.

**Lancer's Rush — 1 AP, 3 stamina:** Move through one ordinary connection, then make a 55 ATK attack against one target in the destination zone.

**Lacerating Strike — 2 AP, 3 stamina:** Range 0, one target, 55 Physical ATK. If it deals damage, apply Bleeding. Bleeding is Persistent Damage 10.

**Defend:** Roll against enemy Threat + AGI 10 + DEX 15 + Polearms 15.

## Sera, Sword-and-Shield Guardian

Sera can attack with sword or shield, rescue nearby allies, and turn a successful defense into a counterattack.

**Attributes:** STR 15, END 15, VIT 15, MND 5, AGI 10, DEX 10, INT 5  
**Skills:** Swordsmanship — Trained (+10); Shieldcraft — Skilled (+15)  
**Equipment:** One-handed sword, shield, heavy armor

| Resource | Maximum | Current |
|---|---:|---:|
| HP | 275 | 275 |
| Stamina | 20 | 20 |
| Inventory Points | 3 | 3 |
| AP | 3 | 3 |
| DEF | 36 | 36 |

**Sword Strike — 1 AP:** Range 0, one target, 35 Physical ATK. If the target Defends, roll against its Dodge + DEX 10 + AGI 10 + Swordsmanship 10.

**Shielded Intercession — Reaction, 1 AP and 2 stamina:** Use when an ally in the same zone is targeted by a single-target attack. Become the target and immediately Defend with the shield as part of this reaction.

**Riposte — Reaction, 1 AP and 2 stamina:** Use immediately after Sera Defends and receives the mitigated or completely avoided result. Make a Sword Strike against the attacker, which must be at Range 0.

**Shield Bash — 1 AP, 3 stamina:** Range 0, one target, 45 Physical ATK. If the target Defends, roll against its Dodge + STR 15 + END 15 + Shieldcraft 15. If the attack deals damage, push the target into one connected zone.

**Defend:** Roll against enemy Threat + AGI 10 + DEX 10 + Shieldcraft 15 + shield Implement DEF 4.

## Mira, Storm Mage

Mira attacks at range, throws enemies out of position, and can preserve AP and mana for a powerful magical defense.

**Attributes:** STR 5, END 10, VIT 10, MND 15, AGI 10, DEX 10, INT 15  
**Skill:** Storm Magic — Skilled (+15)  
**Equipment:** Storm implement, light clothing

| Resource | Maximum | Current |
|---|---:|---:|
| HP | 250 | 250 |
| Stamina | 15 | 15 |
| Mana | 20 | 20 |
| Inventory Points | 3 | 3 |
| AP | 3 | 3 |
| DEF | 12 | 12 |

**Storm Touch — 1 AP, 2 mana:** Range 0, one target, 60 Magical ATK. If the target Defends, roll against its Dodge + MND 15 + INT 15 + Storm Magic 15.

**Lightning Bolt — 1 AP, 2 mana:** Range 0–1, one target, 60 Magical ATK. If the target Defends, use the same target-number contributions as Storm Touch.

**Galeshield — Reaction, 1 AP and 2 mana:** Use instead of Defend against one incoming attack. Roll against enemy Threat + MND 15 + INT 15 + Storm Magic 15. On a successful roll, reduce the attack by Mira's DEF and a further 15 Ward DEF. Against arrows and similar airborne projectiles, increase Ward DEF by another 10. On 01–05, avoid all damage. On a failed roll, take full ATK.

**Gust — 1 AP, 3 mana:** Range 0–1, one target, 60 Magical ATK. If the target Defends, use the same target-number contributions as Storm Touch. If the attack deals damage, push the target into one connected zone.

**Defend:** Roll against enemy Threat + AGI 10 + DEX 10. Storm Magic and the storm implement do not contribute.

## Elian, Holy Mage

Elian divides mana between magical attacks, concentrated healing, and efficient recovery for several allies.

**Attributes:** STR 5, END 10, VIT 10, MND 15, AGI 10, DEX 10, INT 15  
**Skill:** Holy Magic — Skilled (+15)  
**Equipment:** Holy implement, light clothing

| Resource | Maximum | Current |
|---|---:|---:|
| HP | 250 | 250 |
| Stamina | 15 | 15 |
| Mana | 20 | 20 |
| Inventory Points | 3 | 3 |
| AP | 3 | 3 |
| DEF | 12 | 12 |

**Holy Touch — 1 AP, 2 mana:** Range 0, one target, 55 Magical ATK. If the target Defends, roll against its Dodge + MND 15 + INT 15 + Holy Magic 15.

**Radiant Bolt — 1 AP, 2 mana:** Range 0–1, one target, 55 Magical ATK. If the target Defends, use the same target-number contributions as Holy Touch.

**Mend — 1 AP, 3 mana:** Range 0–1, one target. Restore 50 HP automatically. This may return a PC at 0 HP to combat.

**Renewing Wave — 2 AP, 5 mana:** Range 0–1, two or three targets. Restore 40 HP to each target automatically.

**Defend:** Roll against enemy Threat + AGI 10 + DEX 10. Holy Magic and the holy implement do not contribute.

## Player Debrief

Answer these after both battles. Describe particular moments whenever possible.

1. What decisions do you remember making?
2. Which decision was hardest? What information did you use?
3. When were you unsure what you were allowed to do?
4. Which option felt obviously best? Which felt useless?
5. When did you choose to retain AP instead of spending it on your turn?
6. When did you spend or conserve stamina, mana, or Inventory Points? Why?
7. Where did combat slow down?
8. Before a defense roll, what did you expect to happen? Did the result match that expectation?
9. Did your position on the battlefield change your decisions? Describe when.
10. What did the combat rules encourage your party to do together?

# GM Section

Do not share this section with players before the playtest.

## Purpose

The playtest asks whether flexible AP turns, skill-anchored abilities, limited resource pools, zone positioning, and exploitable enemy mechanics produce expressive tactical decisions without becoming confusing or collapsing into one repeated best action.

The bandit encounter tests group handling and the ordinary combat loop. The troll tests a solo boss, turn-order pressure, and an investigation-derived weakness. Character creation, advancement, travel, and the wider quest structure are outside the session.

## Test Record

- Rules reference and revision:
- Date:
- GM:
- Players and relevant experience:
- Encounter order:
- Start time:
- End time:
- Rules interventions:

## Before Play

1. Give each player only the Player Section and `COMBAT_RULES_V0.md`.
2. Ask each player to choose one character.
3. Explain that the two battles are independent and all resources reset between them.
4. Ask the players to pursue victory rather than demonstrate every ability.
5. Describe each battlefield and all visible properties before the first round.
6. Before the troll battle, tell the players: **“Your prior investigation established that Persistent Damage reliably stops a troll's regeneration.”** Do not prescribe how they should apply it.

The PCs act first unless the encounter says otherwise. Let the players choose their order freely each round.

When a player asks about an unclear rule, record the exact question before answering. Give the smallest ruling needed to continue. Do not revise rules during an encounter. If the same problem recurs, record each recurrence.

## What to Observe

Look for behavior rather than general approval or dislike.

| Question | Supporting evidence | Refuting evidence | Measurement |
|---|---|---|---|
| Do players compose materially different turns? | Different AP combinations arise in response to circumstances. | One sequence is repeated regardless of position, danger, or resources. | Ability use by round and character |
| Does retaining AP compete with immediate offense? | Players sometimes retain AP and later use meaningful reactions. | Players always spend everything or always hoard AP without consequence. | AP retained, expired, and spent on reactions |
| Do limited resources create timing decisions? | Spending and conservation change with the situation. | Resources are ignored, exhausted immediately without thought, or make a character unable to contribute for too long. | Pool totals after each round |
| Do zones create clear tactical choices? | Range, movement, and position alter chosen actions. | Position is forgotten, disputed, or irrelevant. | Moves, range questions, and corrections |
| Can the GM operate ten enemies quickly? | Enemy turns remain clear and brief. | Tracking and resolution dominate the session. | Enemy-phase duration and rules consultations |
| Do shared generic abilities remain distinct? | Shield Bash and Gust create different decisions and fictional effects. | Their different expressions feel arbitrary or confusing. | Uses, questions, and rulings |
| Does the troll's weakness create strategy? | Players change timing, order, or resources to suppress Regeneration. | The weakness is ignored, incomprehensible, trivial, or dictates one fixed sequence. | Regenerations allowed or suppressed; Recover uses |

## Encounter One: Bandit Camp

### Aim

This is a medium encounter. Competent play should produce total victory with every PC conscious. It should last three or four rounds and no more than five.

Run the bandits to defeat the party. Do not use morale or retreat in this encounter; consistent opposition makes repetitions easier to compare. Target selection remains the GM's choice.

### Battlefield

**Approach → Gate → Camp → Command Tent**  
**Camp → Watchtower** requires two Moves.

The PCs begin at the Approach. Four melee bandits begin at the Gate, the bruiser at the Camp, four archers in the Watchtower, and the leader in the Command Tent.

Bows have Range 1 on the ground and Range 2 from the Watchtower. The Watchtower grants no defensive bonus. Other zones have no special properties.

### Enemies

| Enemy | Number | HP | AP | ATK | DEF | Dodge | Threat |
|---|---:|---:|---:|---:|---:|---:|---:|
| Melee bandit | 4 | 80 | 2 | 35 | 5 | 35 | 30 |
| Archer | 4 | 70 | 2 | 35 | 5 | 35 | 30 |
| Bruiser | 1 | 160 | 3 | 50 | 10 | 20 | 20 |
| Leader | 1 | 140 | 3 | 45 | 10 | 20 | 20 |

Every enemy has Move, Strike, Defend, Protect, Interact, and Recover as applicable. For five or more identical enemies, retained AP and limited uses may be tracked as shared tallies.

**Reckless Assault — 1 AP, once per encounter:** A melee bandit makes a Range 0 Strike at 45 ATK. The bandit cannot retain AP that turn.

**Aimed Shot — 2 AP:** An archer makes a bow attack at 50 ATK.

**Concussive Blow — 2 AP:** The bruiser makes a Range 0 attack at 50 ATK. If it deals at least 1 HP damage, the target becomes Incapacitated.

**Rallying Order — 3 AP, Range 0, two to four allies:** The leader applies Rallied. On later turns, 1 AP sustains every original target. Targets need not remain in the leader's zone unless the fiction makes continued coordination impossible.

### Bandit Record

| Round | PC phase duration | Enemy phase duration | PCs at 0 HP | Enemies remaining | Notable AP or resource decision |
|---:|---:|---:|---:|---:|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |
| 4 |  |  |  |  |  |
| 5 |  |  |  |  |  |

## Encounter Two: The Troll

### Aim

This is a medium encounter. Competent play should produce total party victory in no more than five rounds.

The troll fights until defeated. Hurl Debris prevents the Rocky Ledge from becoming completely safe. The troll's behavior guide is intended to make its decisions quick and consistent, not mandatory when another action is plainly better.

### Battlefield

**Cave Mouth → Troll's Den → Rocky Ledge**

The PCs begin at the Cave Mouth. The troll begins in its Den. The zones have no additional properties.

### Troll

**HP 1,200; AP 3; DEF 20; Dodge 10; Threat 15; Edges 3**

**Crushing Strike — 1 AP:** Range 0, one target, 60 Physical ATK.

**Sweeping Blow — 2 AP:** Range 0, two or three targets, 50 Physical ATK. Use multi-target resolution.

**Hurl Debris — 1 AP:** Range 1, one target, 50 Physical ATK.

**Regeneration:** At the start of the troll's normal turn, restore 50 HP.

**Enraged:** At 600 HP or lower, the troll gains +10 ATK and loses 10 DEF for the rest of the encounter.

### Edges

At the start of each round, the troll gains three Edges in addition to refreshing its normal AP.

After each PC completes a turn, the troll must spend one Edge if any remain. An Edge permits one ability that normally costs 1 AP. It does not consume normal AP. Edges cannot be retained, combined, or used as reactions.

After the PC phase, the troll takes its normal turn. Start-of-turn effects occur only at the start of this normal turn. Reactions are paid from normal AP.

If the troll becomes Incapacitated, it immediately loses all remaining Edges. On its normal turn, it has only 1 AP and must Recover.

### Regeneration and Persistent Damage

Persistent Damage applied to the troll deals no recurring damage. Instead, Regeneration remains inactive until the troll Recovers from the condition.

Any ability, item, or plausible improvisation that applies Persistent Damage can exploit this trait. Burning is as valid as Bleeding if the method can produce it.

The troll may spend an Edge to Recover. If it removes Persistent Damage before its normal turn, Regeneration functions normally. Persistent Damage applied after the final Edge suppresses Regeneration for that normal turn.

### Troll Behavior

On an Edge, use Crushing Strike when possible; otherwise Move or Hurl Debris. Recover when preserving Regeneration is worthwhile.

On the normal turn, use Sweeping Blow against two or more targets; otherwise use Crushing Strike. Retain AP to Defend after taking heavy damage. Once Enraged, favor offense.

### Troll Record

| Round | PC phase duration | Troll phase duration | Troll HP at end | Regeneration | Edges used to Recover | PCs at 0 HP |
|---:|---:|---:|---:|---|---:|---:|
| 1 |  |  |  | Allowed / Suppressed |  |  |
| 2 |  |  |  | Allowed / Suppressed |  |  |
| 3 |  |  |  | Allowed / Suppressed |  |  |
| 4 |  |  |  | Allowed / Suppressed |  |  |
| 5 |  |  |  | Allowed / Suppressed |  |  |

## Session Metrics

| Metric | Measurement |
|---|---:|
| Attacks resolved without a roll |  |
| Single-target defense rolls |  |
| Multi-target abilities used |  |
| AP spent mitigating multi-target attacks |  |
| Multi-target damage reduced to 0 |  |
| Prepared actions declared / triggered |  |
| Protect reactions |  |
| Finishing blows / interceptions |  |
| All-offense turns |  |
| Repeated actions |  |
| Critical Rounds reached / Criticals spent |  |
| Critical benefits chosen |  |
| Rules consultations |  |

### Ability and Resource Record

| Character | Abilities used | Abilities never used | AP expired | Stamina/mana remaining | IP remaining |
|---|---|---|---:|---:|---:|
| Ardan |  |  |  |  |  |
| Sera |  |  |  |  |  |
| Mira |  |  |  |  |  |
| Elian |  |  |  |  |  |

## Rules Interventions

| Time | Situation | Exact question or confusion | Rule involved | Ruling given |
|---:|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## GM Debrief

1. Which rules did you have to explain before players could use them?
2. What did you have to invent without support?
3. What information was difficult to locate?
4. Which enemy decisions or records consumed the most attention?
5. When did you override, avoid, or forget a rule?
6. Could you operate the bandit group without losing track of AP or limited abilities?
7. Did the troll's Edges create useful pressure throughout the PC phase?
8. Did the troll's Regeneration change player order and tactics?
9. Which character appeared strongest, weakest, or most constrained? What happened that supports that judgment?
10. What would prevent another GM from running these encounters without explanation from the designer?

## Findings

Record what happened before deciding why it happened. Propose the smallest change that would distinguish between plausible explanations.

| Observation | Interpretation | Smallest change | Risk | Next test |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Stress Tests for Later Sessions

- One PC against five or six ordinary enemies
- Three Strikes every turn
- Saving all AP for Defend
- Protect and Defend loops
- Multi-target AP draining
- Repeated healing from 0 HP
- Maximum DEF
- Percentile overflow
- Resource hoarding
- Prepared-trigger abuse
- Ignoring the troll's regeneration
- Highly specialized characters against generalized characters
