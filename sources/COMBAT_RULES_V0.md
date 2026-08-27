# Combat Rules

**26 August 2026**

Combat begins when words, caution, and positioning give way to immediate violence. From that moment, time is measured in rounds, the battlefield is divided into zones, and every combatant must decide how much effort to spend now and how much to hold in reserve.

These rules assume that each player has a character sheet listing the character's attributes, skills, abilities, equipment, maximum Hit Points, stamina, mana, Inventory Points, Action Points, and Defense.

## The Shape of Combat

Combat is played in rounds. Each round has two phases:

1. **PC phase.** Every player character takes one turn.
2. **Enemy phase.** Every enemy takes one turn.

The players choose the order of their turns during each PC phase. The GM chooses the enemies' order during each enemy phase. The order may change from one round to the next.

Once a combatant begins a turn, that combatant finishes the entire turn before another begins. Turns cannot be interleaved.

At the start of each round, every combatant refreshes to maximum Action Points. Most player characters have **3 AP**. Simple enemies may have only **2 AP**.

On a turn, a combatant may use any abilities they can afford, in any order. An ability may be used more than once unless its own description says otherwise. When the combatant ends their turn, unspent AP remains available for reactions. All remaining AP disappears at the end of the round.

### Ambush

When enemies successfully ambush the party, the enemies take the first phase of the first round. The normal PC-first order resumes at the beginning of the second round.

An ambush changes who acts first. It does not give the ambushing side free attacks, extra turns, or automatic damage unless the circumstances provide a separate effect.

## Action Points

Action Points measure the time and attention available to a combatant during a round. Moving, attacking, helping an ally, and defending oneself all draw from the same supply.

This creates the central decision of combat: AP spent during your turn cannot be spent protecting yourself later in the round.

> **Example: Holding the Line**  
> Sera has 3 AP. She spends 1 AP to Strike and ends her turn with 2 AP. During the enemy phase, she may Defend twice, Protect an ally and then Defend, or use another combination of reactions she knows. If she had made three Strikes, she would have no AP left to react.

### Ordinary Abilities and Reactions

An **ordinary ability** is used during your turn. A **reaction** is used outside your turn when its trigger occurs. Each reaction states when it can be used.

You may react before your turn in the current round. Any AP spent this way is no longer available when your turn begins. You may also react more than once if you have enough AP and meet every trigger and requirement.

### Preparing an Action

At the end of your turn, you may prepare an ability. Name:

- an observable trigger; and
- the ability you intend to use when it occurs.

Declaring the preparation costs nothing. If the trigger occurs before the end of the round, you may use the named ability as a reaction. Pay its AP and other costs at that time, and check its range and requirements then. If the trigger never occurs, no resources are spent, but your unspent AP still expires at the end of the round.

The trigger must be something the character could perceive. “When the troll enters the Gate” is valid. “When the troll secretly decides to flee” is not.

> **Example: Covering the Gate**  
> Ardan ends his turn with 1 AP and prepares Strike with the trigger, “When an enemy enters my zone through the gate.” A bandit later enters the zone. Ardan spends the retained AP and resolves Strike immediately. If no enemy had entered, the AP would simply have expired at the end of the round.

## Zones and Range

A battlefield is a network of named **zones**. A zone is a distinct place where position matters: the gate of a fort, the floor of a cavern, a rocky ledge, a crowded bridge, or the deck of a ship.

Every combatant in the same zone is at **Range 0** from every other occupant. Adjacent zones are at **Range 1**. Count the fewest connections between two zones to find greater ranges.

```text
Approach → Gate → Camp → Command Tent
                   ↕
              Watchtower
```

In this battlefield, the Approach is Range 1 from the Gate and Range 2 from the Camp. The exact distance in feet is irrelevant.

### Moving

**Move** costs 1 AP and carries you across one ordinary connection into an adjacent zone. Difficult connections may require more than one Move or may demand a special method, such as climbing, swimming, or forcing a barred door.

No one makes an opportunity attack merely because a combatant moves. An explicit reaction or a prepared action may still trigger from movement.

### Long Movement and Transit

Some connections require several Moves. Record progress across rounds if the journey costs more AP than the combatant currently has.

A combatant partway between zones is **in transit**. While in transit, they cannot use ordinary abilities or reactions. On their turn, they may continue toward the destination or abandon the attempt and immediately return to the origin zone.

If an unusual interaction with an in-transit combatant becomes important, the GM decides what is possible from the established fiction before anyone commits AP or resources.

### Zone Properties

A zone or connection may alter:

- who may enter;
- the AP needed to cross a connection;
- line of sight;
- the range of particular attacks;
- how many combatants the area can hold; or
- hazards suffered by its occupants.

State relevant properties when the battlefield is introduced or as soon as the characters can perceive them.

> **Example: The Watchtower**  
> The Watchtower is connected to the Camp by a two-Move climb. A bow normally has Range 1, but an archer in the tower may shoot at Range 2. The elevation does not increase DEF unless the battlefield description expressly says it does.

## Attacks and Defense

Attacks do not normally require a roll. When an attack targets a combatant who does not Defend, it deals its full modified ATK automatically.

The uncertainty enters when the target spends AP to **Defend**. Players make every combat roll, including rolls made to defend against enemy attacks. The GM does not roll attacks or defenses.

### Percentile Dice

To make a percentile roll, roll d100 and compare the result with a target number. A result equal to or below the target number succeeds.

- **01–05** always uses the exceptional result listed by the procedure.
- **96–00** always uses the catastrophic result listed by the procedure. On percentile dice, 00 means 100.

Target numbers are not limited to the range from 5 to 95. A total above 95 can absorb penalties; a total below 5 can be improved by bonuses. The fixed exceptional bands still apply.

The GM may keep exact statistics hidden, but players must understand the practical difficulty before committing AP or limited resources. “This bandit looks easy to overwhelm,” “the captain is exceptionally hard to strike cleanly,” and exact percentages are all valid levels of disclosure, depending on the campaign and what the characters know.

### Defense

Every combatant has a single **DEF** value. Armor, clothing, shields, and other defensive equipment contribute to it. DEF is not deducted from every attack: it applies only when Defend or another rule grants mitigation.

Damage can never be reduced below 0.

### When a PC Attacks an Enemy

When a PC makes a single-target attack:

1. Determine the attack's modified ATK.
2. The GM decides whether the target spends 1 AP to Defend.
3. If the target does not Defend, it takes full ATK as damage.
4. If the target Defends, the attacking player rolls percentile dice.

The target number is:

> **Enemy Dodge + the attack's first attribute + its second attribute + anchored skill**

Use the skill's effective value, not its rank number.

| Player's roll | Damage to enemy |
|---|---:|
| 01–05 | Full ATK |
| Equal to or below the target number | Full ATK |
| Above the target number, up to 95 | ATK − enemy DEF |
| 96–00 | 0; the attack misses |

> **Example: Attacking a Defending Bandit**  
> Ardan's polearm Strike has 55 ATK and uses STR 15, DEX 15, and Polearms +15. The bandit has Dodge 35 and DEF 5. The target number is 35 + 15 + 15 + 15 = 80.  
>  
> On 01–80, the bandit takes the full 55 damage. On 81–95, it takes 50 damage after DEF. On 96–00, the Strike misses. If the bandit had not spent 1 AP to Defend, no roll would be made and it would take 55 damage.

### When an Enemy Attacks a PC

When an enemy makes a single-target attack:

1. Determine the attack's modified ATK.
2. The player decides whether to spend 1 AP to Defend.
3. If the PC does not Defend, the PC takes full ATK as damage.
4. If the PC Defends, that player rolls percentile dice.

The target number is:

> **Enemy Threat + AGI + DEX + applicable held-implement skill + Implement DEF**

A mundane held implement may contribute an applicable skill: Swordsmanship with a sword, Polearms with a polearm, or Shieldcraft with a shield. A bare-handed character uses only AGI and DEX. Magical skills and magical implements do not contribute to universal Defend; magical practitioners may purchase a Ward ability instead.

| Player's roll | Damage to PC |
|---|---:|
| 01–05 | 0; the attack is completely avoided |
| Equal to or below the target number | Enemy ATK − PC DEF |
| Above the target number, up to 95 | Full enemy ATK |
| 96–00 | Full enemy ATK |

> **Example: Defending Against a Bandit**  
> Sera is attacked for 35 ATK. She has AGI 10, DEX 10, Shieldcraft +15, a shield with 5 Implement DEF, and total DEF 20. The bandit has Threat 30. Her target number is 30 + 10 + 10 + 15 + 5 = 70.  
>  
> On 01–05, she avoids all damage. On 06–70, she takes 15 damage after DEF. On 71–00, she takes the full 35 damage. If she does not spend 1 AP to Defend, she takes 35 damage without rolling.

Lower Dodge and Threat values represent more dangerous opposition. Standard members of the same enemy type normally share these values.

## Multi-Target Attacks

A multi-target ability states the minimum and maximum number of targets it can affect. It cannot be used unless the minimum number of legal targets is present, and it cannot be converted into a single-target attack.

Multi-target attacks do not cause percentile rolls. Resolve each target separately:

- A target that spends 1 AP takes **ATK − DEF** damage.
- A target that does not or cannot spend 1 AP takes full ATK damage.

Basic Protect cannot redirect a multi-target attack. A specialized ability may provide another defense if its description says so.

> **Example: Sweeping Arc**  
> Ardan uses Sweeping Arc against three bandits for 45 ATK. Two bandits spend 1 AP each and have DEF 5, so each takes 40 damage. The third has no AP and takes the full 45. No one rolls.

## Damage and Healing

There are two broad damage categories: **Physical** and **Magical**. More specific qualities—fire, cold, arrows, silver, and so on—matter when the fiction or a rule makes them matter.

Weaknesses and resistances change ATK by a flat amount before DEF is applied:

> **Damage = ATK + weakness − resistance − applicable DEF**

The final damage cannot be lower than 0.

The GM judges specific interactions from the fiction and tells the players what their characters can reasonably anticipate. A treant may be vulnerable to fire; a gale may be especially effective against arrows. The game does not require an exhaustive list of damage types to recognize such cases.

Unless an ability says otherwise, a secondary effect attached to an attack applies only if the attack deals at least 1 HP damage.

Healing is automatic. No roll is made. A character cannot be healed above maximum HP.

## Universal Abilities

Every player character has the following abilities. Touch is gained through a magical skill rather than by every character.

### Move

**Ordinary — 1 AP**

Cross one ordinary connection into an adjacent zone. Difficult connections may require more than one use.

### Strike

**Ordinary — 1 AP — One target**

Attack with a conventional weapon at its listed range. The weapon supplies the attack's attributes, skill, ATK bonus, and damage category. The target may Defend.

### Touch

**Ordinary — 1 AP and 2 mana — Range 0 — One target**

Make a Magical attack using a magical skill that grants Touch.

> **Touch ATK = MND + INT + magical skill + 10 Magic ATK + applicable implement bonus**

Storm Magic and Holy Magic grant Touch. A character without enough mana cannot use it.

### Defend

**Reaction — 1 AP — Self**

Defend against one incoming attack. Against a single-target attack, make the appropriate percentile roll. Against a multi-target attack, apply DEF automatically.

### Protect

**Reaction — 1 AP — One ally in the same zone**

Use when the ally becomes the target of a single-target attack. You become the attack's target and receive all of its damage and secondary effects. After Protecting, you may spend another 1 AP to Defend if you are able.

Protect may intercept a finishing blow. It cannot affect a multi-target attack.

### Use Consumable

**Ordinary — 1 AP and 1 Inventory Point — Self**

Choose one benefit:

- restore 50 HP;
- restore 5 stamina; or
- restore 6 mana.

Inventory Points represent a personal supply of useful consumables rather than particular bottles or packages. Giving your supplies to another character requires a plausible method and the GM's approval.

### Interact

**Ordinary — Usually 1 AP**

Perform a meaningful interaction with the environment: pull a lever, open a reachable door, draw or stow an item, overturn a table, or take a similar action. Dropping a held item is free.

The GM states a different AP cost before commitment when an interaction demands more time or effort.

### Recover

**Ordinary — 1 AP — Self or one character at Range 0**

Remove one condition. Helping another character requires a plausible method. If the needed method could reasonably come from adventuring supplies, spend 1 Inventory Point to provide it.

## Conditions

Conditions have no countdown. They last until removed by Recover or until their own rule ends them. Reapplying a condition that does not stack has no additional effect.

An attack's condition applies only if the attack deals at least 1 HP damage, unless the ability expressly says otherwise.

### Incapacitated

Your maximum AP becomes 1, and that AP may be spent only on Recover. A boss immediately loses all remaining Edges when Incapacitated. Reapplication has no effect.

### Persistent Damage

At the start of your normal turn, take the amount of damage stated by the source. Persistent Damage ignores DEF and lasts until Recovered. Reapplication has no effect.

Persistent Damage can reduce a character to 0 HP. The GM decides whether a particular instance can serve as a finishing blow, based on its nature and the established fiction.

**Bleeding** and **Burning** are possible expressions of Persistent Damage. The expression may matter to a creature's traits even when the underlying condition is the same.

### Rallied

You gain +10 ATK and +5 DEF while the effect is sustained. Rallied does not stack.

The ability that applies Rallied covers its initial turn. At the start of each later turn, its invoker may spend 1 AP to sustain every original target of that invocation. If the invoker does not, the condition ends. Recover may also remove it from one target.

### Forced Movement

Forced movement is immediate, not a condition. When an ability pushes a target, move that target across one valid connection to an adjacent zone. If the route is impossible, the movement does not occur. Unless stated otherwise, forced movement attached to an attack requires at least 1 HP damage.

## Hit Points, Defeat, and Death

Hit Points represent bodily resilience, morale, luck, and the effort of avoiding a decisive wound. A character's HP cannot fall below 0.

At 0 HP, a PC collapses and cannot take actions or reactions. The character remains aware enough to utter no more than five to eight words at a time.

Healing that raises the PC above 0 restores the ability to act immediately. It does not refresh AP: the character returns with whatever AP remains from the current round.

### Finishing Blows

A PC does not die merely from reaching 0 HP. Death requires a deliberate finishing blow.

An enemy must be able to reach the fallen PC and spend a suitable combat action to deliver the blow. If no one defends the target, the finishing blow succeeds and the PC dies. An ally in the same zone may use Protect to become the target instead, then may Defend normally.

The GM decides whether enemies attempt finishing blows according to their motives, intelligence, and the situation.

NPCs reduced to 0 HP die unless the attacking player declares otherwise. A spared enemy is defeated and unable to continue fighting; the precise result follows the attack and the player's intent.

## Resources and Recovery

Every character has HP and stamina. A character who has purchased at least one magical skill also has mana. Multiple magical skills share one mana pool.

Calculate each resource maximum as follows:

| Resource | Maximum |
|---|---:|
| HP | 200 + (VIT × 5) |
| Stamina | 5 + END |
| Mana | 5 + MND |
| Inventory Points | 3 |

An ability that costs stamina or mana cannot be used without enough of that resource. A magical character who has exhausted their mana and carries no mundane weapon may have no attack available.

After **ten minutes in genuine safety**, every living PC—including a PC at 0 HP—returns to full HP. HP, stamina, and mana are fully restored, and ordinary temporary combat conditions end. The GM decides whether the group is genuinely safe; hiding behind a door while enemies batter it down is not enough.

Inventory Points represent expended supplies and do not return through rest. Replenishing them requires access to supplies.

## Skills and Abilities

A skill measures broad competence with a discipline or magical tradition. An ability is a particular way to act in combat.

Skills have five ranks:

| Rank | Label | Effective value |
|---:|---|---:|
| 1 | Novice | +5 |
| 2 | Trained | +10 |
| 3 | Skilled | +15 |
| 4 | Expert | +20 |
| 5 | Master | +25 |

An unpurchased skill contributes 0. Whenever a formula calls for a skill, add its effective value.

Purchased abilities list the skills that qualify for them. When buying an ability, anchor it to one qualifying skill, then name and describe how the character performs it. The anchored skill supplies every reference to “Skill” in the ability's rules.

The same generic ability may look entirely different when anchored to another skill. Forced Move anchored to Shieldcraft may be a crushing shield bash; anchored to Storm Magic, it may be a violent gust. Both use the same mechanical purpose, but their fiction, equipment, damage category, attributes, and situational interactions follow their expression.

A character may learn the same generic ability more than once through different skills.

## Equipment

Every conventional weapon enables Strike. Its description supplies:

- the attributes and skill used for the attack;
- Weapon ATK;
- range;
- damage category; and
- any special properties.

Magical implements are not required for spellcasting. An implement grants only the bonuses named in its description.

Changing a held item uses Interact for 1 AP. Dropping an item is free. A character may carry up to 20 ordinary items; trivial objects may be bundled or ignored at the GM's discretion. Each Heavy item uses one of a character's Heavy-item allowances, equal to STR.

Medium armor requires STR 8. Heavy armor requires STR 15.

### Equipment List

| Item | Rules |
|---|---|
| Two-handed polearm | +10 Weapon ATK; Range 0; Physical; Strike uses STR + DEX + Polearms; occupies both hands |
| One-handed sword | +5 Weapon ATK; Range 0; Physical; Strike uses DEX + AGI + Swordsmanship |
| Shield | +5 Implement DEF; uses Shieldcraft when held; one hand |
| Light clothing | 5 DEF |
| Medium armor | 10 DEF; requires STR 8 |
| Heavy armor | 15 DEF; requires STR 15; Heavy |
| Storm implement | One hand; +5 ATK to Touch, Lightning Bolt, and compatible Storm Magic attacks |
| Holy implement | One hand; +5 healing to compatible Holy Magic abilities |
