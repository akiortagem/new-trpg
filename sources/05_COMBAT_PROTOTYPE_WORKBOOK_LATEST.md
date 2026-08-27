# Combat Prototype Workbook

Companion to `02_GAME_DESIGN_WORKBOOK_COMPLETE.md`.

Status values: `Unknown`, `Hypothesis`, `Testing`, `Provisional`, `Locked`.

Completed entries record the combat interview so far. Blank prompts and tables are intentional: they define the remaining design interview and prototyping work.

## Progress checklist

**Next session starts by creating a versioned combat-rules artifact from the completed combat design interview.** Do not run paper checks, microtests, or either full encounter until that artifact has been created and reviewed.

### Interview completed for now

- [x] Section 1 — Prototype promise and scope
- [x] Section 2 — Round and turn structure
- [x] Section 3 — Basic AP and reaction economy
- [x] Section 4 — Zone, range, movement, and transit foundation
- [x] Section 5 — Percentile combat resolution foundation
- [x] Section 6 — Single-target attack and Defend procedure
- [x] Section 7 — Multi-target attack procedure
- [x] Section 8 — Ability architecture
- [x] Section 9 — Universal ability set
- [x] Section 10 — Attribute list and derived-pool direction
- [x] Section 11 — Damage, DEF, weaknesses, and secondary-effect foundation
- [x] Section 12 — Healing, defeat interaction, and Inventory Point foundation
- [x] Section 13 — Prototype skills and rating scale
- [x] Section 14 — Prototype equipment and numerical chassis
- [x] Section 15 — Four pregenerated characters
- [x] Section 16 — Prototype ability set
- [x] Section 17 — Prototype conditions and Recover
- [x] Section 18 — NPC and adversary architecture
- [x] Section 19 — Ten-enemy medium encounter
- [x] Section 20 — Solo troll boss and Edge structure

Checked sections are sufficiently decided to support the next interview stage. Their remaining prompts are edge cases, numerical values, or questions that should be answered while constructing and testing the prototype—not blockers that require restarting the section.

### Rules artifact

- [ ] Create a versioned combat-rules artifact as the playable rules reference for the first prototype.
- [ ] Record the artifact filename and version in this workbook.
- [ ] Review rules artifact against paper checks before playtesting.

### Construction and testing not yet performed

- [ ] Section 21 — Paper, probability, durability, and resource checks
- [ ] Section 22 — Focused microtests
- [ ] Section 23 — Full prototype playtest
- [ ] Section 24 — Stress tests

### Deferred issues already recorded

- [ ] Final PC-ambush benefit
- [ ] In-transit targeting and interaction
- [ ] Advanced protection against multi-target attacks
- [ ] How future magical skills that lack an offensive Touch should function
- [ ] Exact extreme-roll effects beyond current damage results
- [ ] Long-term pool values beyond the prototype
- [ ] HP-powered abilities at 0 HP and any penalty after recovery from 0 HP
- [ ] Long-term rating limits and practical percentile soft cap

## 1. Prototype promise

- Status: Testing
- Design question: Can flexible AP turns, skill-anchored abilities, limited resource pools, theatre-of-the-mind zone positioning, and exploitable enemy mechanics produce expressive tactical decisions without becoming confusing or collapsing into one repeated best action?
- Characters included: Four pregenerated PCs—offensive martial, defensive martial, magical offense/control, and support. These are test configurations, not prescribed party roles.
- Encounters included:
  1. A group fight against approximately ten simple enemies.
  2. A boss fight with a visible exploitable mechanic and one actionable fact supplied as prior investigation.
- Expected duration: 30–45 minutes per encounter.
- Reset between encounters: HP, stamina, mana, Inventory Points, and temporary conditions.

### What this prototype must test

- Do players compose materially different turns?
- Does retaining AP for reactions compete meaningfully with offense?
- Do resources create timing decisions without removing useful options?
- Can zones express range, movement, hazards, and protection clearly?
- Can the GM operate ten structurally complete enemies quickly enough?
- Do shared generic abilities remain distinct through different skills and fictionalizations?
- Does investigation information help without dictating one solution?

### Outside this prototype

- Character creation and Character Point pricing
- Advancement
- Full skill, ability, equipment, condition, and adversary catalogues
- General out-of-combat resolution
- The complete quest loop

## 2. Round and turn structure

- Status: Provisional
- Round start: Every combatant refreshes to maximum AP.
- Default side order: All PCs act, then all enemies act.
- Order within each side: Freely chosen by the players or GM each round.
- Complete turns: Once a combatant begins, they finish before another combatant acts. Turns cannot be interleaved.
- End of turn: The combatant cannot resume ordinary actions. Unspent AP remains for reactions.
- End of round: Remaining AP disappears.
- Ability repetition: Allowed whenever costs, range, and prerequisites permit. No universal once-per-turn restriction.

### Ambush

- NPC ambush: Enemies take the first phase of round one; PC-first order resumes in round two.
- PC ambush: Hypothesis—PCs receive +1 AP. Not committed.

### Questions still to answer

- Does an ambushed side refresh AP normally before the first phase?
- Can bosses insert actions between turns without replacing side initiative?
- How are simultaneous end-of-round effects ordered?

## 3. AP and reactions

- Status: Testing
- Provisional PC maximum AP: 3
- Minimum AP for the weakest NPC type: 2
- Default cost of Move, Strike, Defend, Protect, Use Consumable, and Interact: 1 AP unless stated otherwise
- Reactions: Actions performed outside the combatant's turn.
- A spontaneous reaction must be labelled as a reaction ability.
- Reactions before one's own turn are allowed and reduce AP available on that turn.
- Repeated reactions are allowed while AP and prerequisites permit.

### Prepared actions

- Declared for free at the end of the combatant's turn.
- Declaration names an observable trigger and an ability.
- AP and other resources are spent only if the trigger occurs.
- Range and prerequisites are checked when triggered.
- If never triggered, unspent AP disappears normally at round end.

### AP worksheet

| Combatant type | Maximum AP | Evidence/reason | Status |
|---|---:|---|---|
| PC | 3 | Supports three basic actions or offense plus reactions. | Testing |
| Lowest ordinary NPC | 2 | Designer accepts up to twenty actions from ten such enemies initially. | Testing |
| Trained NPC |  |  | Unknown |
| Elite NPC |  |  | Unknown |
| Boss |  |  | Unknown |

### Questions still to answer

- Can AP costs ever become zero?
- How many actions may one combatant prepare at once?
- Can one trigger activate several prepared actions?
- What effects may alter maximum AP?

## 4. Zones, range, and movement

- Status: Provisional
- Battlefield model: Named zones connected as a network.
- Range: Integer equal to the minimum number of zone transitions.
- Range 0: Same zone. Range 1: Adjacent zone. Range 2+: Additional transitions.
- All occupants of one zone are at Range 0 from one another.
- Basic Move: 1 AP for one transition.
- Terrain/connections: May require additional Moves or prerequisites.
- Zone properties: May modify access, range, line of sight, hazards, or occupancy.
- Opportunity attacks: None by default. Explicit or prepared reactions may trigger on movement.

### Examples—not equipment commitments

- A Range 0 slingshot attacks only within its zone.
- A Range 1 bow attacks an adjacent zone with line of sight.
- A Bell Tower may extend effective range because of elevation.

### Multi-round transit

- Movement progress may persist across rounds when the cost exceeds current AP.
- An in-transit combatant cannot take ordinary actions or reactions.
- On their turn, they may abandon travel and immediately return to the origin zone without calculating reverse progress.

### Battlefield worksheet

| Zone | Connections | Move cost | Occupancy | Line of sight | Special properties |
|---|---|---:|---:|---|---|
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

### Questions still to answer

- How can in-transit combatants be targeted or affected?
- Can combatants intercept one another in transit?
- What happens when a destination is full?
- How does the zone map translate to an optional grid?

## 5. Percentile combat resolution

- Status: Provisional
- Randomizer: Percentile dice, committed for the game.
- Direction: Roll equal to or below the target number.
- Who rolls: Players only; the GM does not roll attacks or defenses.
- Exceptional-success band: 01–05.
- Catastrophic-failure band: 96–00.
- Attributes and effective skill values contribute to odds 1:1. Each skill rank is worth +5.
- Attributes increase one point at a time; skills advance through five progressively more expensive ranks.
- Every attribute begins at 1 before allocation.
- Skills begin unpurchased and contribute 0.

### Soft-cap hypothesis

Target numbers are not clipped. They may exceed 95 or fall below 5, but 01–05 and 96–00 retain their fixed meanings. Overflow matters because penalties apply to the uncapped total.

### Information disclosure

- Exact ATK, Dodge, Threat, and final percentages: GM discretion.
- Investigation may reveal exact or actionable numerical information.
- Players must still understand difficulty clearly enough to commit knowingly.

### Probability worksheet

| PC competence | NPC tier | Dodge/Threat | Attribute 1 | Attribute 2 | Skill | Modifier | Final target | Intended result |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Weak | Small fry |  |  |  |  |  |  |  |
| Typical | Small fry |  |  |  |  |  |  | 70–80% full ATK when attacking |
| Strong | Small fry |  |  |  |  |  |  |  |
| Typical | Trained |  |  |  |  |  |  |  |
| Typical | Elite |  |  |  |  |  |  |  |
| Typical | Boss |  |  |  |  |  |  |  |

### Questions still to answer

- What modifier sizes represent minor, substantial, and overwhelming circumstances?
- Does 01–05 add anything when a PC attacks?
- Does 96–00 add anything when a PC defends?
- How does this connect to out-of-combat percentile resolution?

## 6. Single-target attacks and Defend

- Status: Testing
- Undefended attack: Deals full modified ATK automatically.
- Defend: Universal 1-AP reaction.
- DEF applies only when Defend or another rule grants mitigation.
- Damage after DEF may become 0.

### PC attacks a defending NPC

Target number:

> NPC Dodge + two attributes named by the attacking ability + its anchored skill

| Result | Damage |
|---|---|
| 01–05 | Full ATK; no extra exceptional effect defined. |
| At or below target | Full ATK. |
| Above target through 95 | `max(0, ATK − NPC DEF)`. |
| 96–00 | Miss; 0 damage. |

### NPC attacks a defending PC

Target number:

> NPC Threat + AGI + DEX + applicable held-implement skill + Implement DEF

| Result | Damage |
|---|---|
| 01–05 | Completely avoided; 0 damage. |
| At or below target | `max(0, NPC ATK − PC DEF)`. |
| Above target through 95 | Full NPC ATK. |
| 96–00 | Full NPC ATK; no worse universal result defined. |

### NPC values

| Example type | Dodge | Threat | Status |
|---|---:|---:|---|
| Goblin | 35 | 30 | Illustrative/provisional; untested |
| Knight Captain | 20 | 20 | Illustrative/provisional; untested |
|  |  |  |  |

Each standard member of one NPC type shares its values. Lower values mean harder opposition.

### Questions still to answer

- Can NPC variants alter type-wide Dodge or Threat?
- Can an ability replace Dodge or Threat temporarily?
- When must the target decide to Defend relative to ATK disclosure?
- How do unseen attacks change Defend?

## 7. Multi-target attacks

- Status: Testing
- Must specify a minimum and maximum number of targets; normal minimum is at least 2.
- Cannot be converted into a single-target attack.
- Causes no percentile roll.
- Basic Protect cannot be used.

### Resolution

For each target independently:

- Spend 1 AP: Automatically receive `max(0, modified ATK − DEF)` damage.
- Do not or cannot spend 1 AP: Receive full modified ATK.

Advanced defensive abilities may override this procedure.

### Multi-target worksheet

| Ability | Cost | Targets | ATK | Target DEF | AP spent mitigating | Damage each | Total damage | Time |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |

### Known risks and questions

- Does one ability drain too much aggregate AP?
- Does high DEF nullify multi-target abilities?
- Are dodge-focused characters disadvantaged?
- Is requiring two targets too restrictive late in combat?
- May targets span several zones?
- How should advanced group protection work?
- How are repeated strikes against one target distinguished from multi-target attacks?

## 8. Ability architecture

- Status: Provisional
- Abilities are complete active combat modes, not passive modifier packages.
- Every ability names two percentile attributes in advance.
- Purchased abilities are anchored to one openly qualifying skill.
- `Skill` in a formula means the chosen anchoring skill.
- Equipment appears explicitly in formulas, Range, or permission.
- Abilities may alter final ATK or situational DEF but have no universal modifier value.

### Ability template

- Generic ability name:
- Character-specific name:
- Type: Ordinary / Reaction
- Damage category: Physical / Magical / None
- Qualifying skills:
- Anchored skill:
- Equipment/fictional requirement:
- AP cost:
- Stamina / mana / HP / IP cost:
- Range:
- Minimum and maximum targets:
- Percentile attributes:
- ATK / healing / DEF / other formula:
- Trigger or prerequisites:
- Effect:
- Does the secondary effect require damage?
- Multi-target exception:
- Example in play:

### Illustrations—not decisions

- Sword Bash as Power Attack: `2 × (DEX + STR) + Swordsmanship`, then Stunned after damage.
- Strike: `DEX + AGI + Swordsmanship + Weapon ATK`.

### Questions still to answer

- Which additional formula shapes are safe beyond flat additions and subtractions?
- How complex may a full-catalogue ability formula become?
- Which future magical traditions grant Touch?

## 9. Universal abilities

- Status: Provisional

| Ability | Type | AP | Range/target | Procedure | Missing design |
|---|---|---:|---|---|---|
| Move | Ordinary | 1 | One transition | Advance; may continue across rounds. | Transit interactions |
| Strike | Ordinary | 1 | Equipment-defined | Deterministic weapon ATK; target may Defend. | Additional weapon categories |
| Touch | Ordinary | 1 | Range 0 | Costs 2 mana; available through prototype magical skills. | Future non-offensive magical skills |
| Defend | Reaction | 1 | Self | Single target rolls; multi-target mitigates automatically. | Fixed attributes/equipment |
| Protect | Reaction | 1 | Ally in same zone | Become target of a single-target attack; may then Defend. | Advanced group protection |
| Use Consumable | Ordinary | 1 | Normally self | Spend 1 IP; restore 50 HP, 5 stamina, or 6 mana. | Full-game non-recovery IP uses |
| Interact | Ordinary | 1 unless stated | Fiction-defined | Meaningful environmental interaction. | Examples/boundaries |
| Recover | Ordinary | 1 | Self or one character in same zone | Remove one condition; helping requires a plausible method, possibly enabled by 1 IP. | Condition-specific exceptions |

Prepared action is a free procedure, not an ability. Finishing Blow is an enemy-side defeat procedure, not a PC ability.

### Protect sequence

1. An ally in the same zone is targeted by a single-target attack.
2. Spend 1 AP and become the new target.
3. Redirect all damage and secondary effects.
4. Optionally spend another 1 AP to Defend.

Protect may intercept a finishing blow. It cannot affect multi-target attacks by default.

### Completeness prompts

- What ordinary combat intention cannot currently be expressed?
- Does any universal ability invalidate a purchased ability?
- Is every listed ability meaningful for every character?

## 10. Attributes and derived pools

- Status: Provisional

| Attribute | Meaning | Combat uses to design | Dominance risk |
|---|---|---|---|
| STR | Raw force and lifting |  |  |
| END | Sustained effort and stamina | Stamina |  |
| VIT | Bodily toughness and HP | HP |  |
| MND | Willpower, awareness, and mana | Mana |  |
| AGI | Speed, balance, reflexes, whole-body movement |  |  |
| DEX | Precision, technical coordination, fine control |  |  |
| INT | Knowledge, reasoning, magical effectiveness |  |  |

### Starting ratings

- Attribute starting floor: 1
- Prototype Character Point budget:
- Weak prototype attribute: 5
- Typical prototype attribute: 10
- Strong prototype attribute: 15
- Prototype maximum: 20

### Pools

| Pool | Current formula | Base | Typical value | Empty effect | Recovery |
|---|---|---:|---:|---|---|
| HP | `200 + (VIT × 5)` | 200 | 250 | Collapse at 0 | Full after ten safe minutes |
| Stamina | `5 + END` | 5 | 15 | Stamina abilities unavailable | Full after ten safe minutes |
| Mana | `5 + MND` after any magical skill is purchased | 5 | 15 | Mana abilities unavailable | Full after ten safe minutes |
| Inventory Points | Fixed capacity | 3 | 3 | No consumable recovery | Repurchased; resets between prototype encounters |

- Durability target: An equal-tier ordinary opponent needs 5–6 undefended Strikes to reduce a PC from full HP to 0.

### Questions still to answer

- Do the drafted pool formulas create the intended pressure in play?
- Does VIT × 5 make VIT investment meaningful without dominating?
- Do equal-total prototype attributes conceal unequal practical value?

## 11. Damage, DEF, and effects

- Status: Provisional
- Character-wide DEF: Clothing/armor DEF + defensive-implement DEF, with possible ability or skill changes.
- DEF applies to Physical and Magical damage when mitigation occurs unless stated otherwise.
- Formal damage categories: Physical and Magical.
- Specific qualities such as fire or silver: Case-by-case fictional rulings, not an exhaustive taxonomy.
- Weaknesses/resistances: Flat ATK modifiers before DEF.

> Damage = max(0, ATK + weakness − resistance − applicable DEF)

### Secondary effects

- Default: Apply only if the ability deals at least 1 HP damage.
- Explicit exceptions: Likely allowed, but rule text is unresolved.

### Interaction worksheet

| Source | Category | Fictional quality | Target trait | ATK modifier | DEF? | Result |
|---|---|---|---|---:|---|---|
| Firebolt | Magical | Fire | Treant vulnerable to fire |  | Yes unless stated |  |
|  |  |  |  |  |  |  |

### Questions still to answer

- What values represent minor and major weaknesses?
- When must a case-specific ruling be disclosed?
- Can an attack be both Physical and Magical?
- Which effects may apply without damage?
- Which conditions does the prototype require?

## 12. Healing, defeat, and Inventory Points

- Status: Provisional
- Healing abilities restore their formula automatically; no roll.
- Use Consumable costs 1 AP and 1 IP.
- The user chooses HP, stamina, or mana.
- Each pool has a different fixed restoration number, not a formula.
- Administering one's IP to an ally: GM discretion.
- Healing a PC above 0 HP immediately restores action access using their existing AP state.

### Inventory Point worksheet

| Use | IP | AP | Fixed restoration | Target restrictions | Notes |
|---|---:|---:|---:|---|---|
| Restore HP | 1 | 1 | 50 | Self normally |  |
| Restore stamina | 1 | 1 | 5 | Self normally |  |
| Restore mana | 1 | 1 | 6 | Self normally |  |

- Restore HP fixed value: 50.
- Starting IP: 3.
- Reset between prototype encounters: Yes.
- May abilities spend or restore IP?
- Can full-game IP represent non-recovery consumables?

### Defeat checklist

- [x] PC at 0 HP collapses and cannot act meaningfully.
- [x] Healing above 0 returns the PC to action.
- [x] PC death requires a deliberate finishing blow.
- [x] Protect can intercept a single-target finishing blow.
- [x] NPC at 0 HP dies unless the attacker declares otherwise.
- [ ] Draft the prototype finishing-blow attack.
- [ ] Test revival loops.
- [ ] Decide whether recovery from 0 HP imposes a temporary penalty.
- [ ] Decide whether HP-powered abilities may reduce their user to 0.

## 13. Skills

- Status: Provisional

### Scope choice

- [x] Design only skills required by the four prototype characters.
- [ ] Establish the complete fixed skill list now.

Reason: The combat prototype should test the skill-and-ability architecture without prematurely constructing the complete fixed list.

### Skill principles

- A skill measures how good a character is at doing or using its subject. Skills are not classified as offensive, defensive, or supportive.
- An unpurchased skill contributes 0. Its first purchased rank is rank 1.
- Each rank contributes +5 to every formula that uses the skill and +5 percentage points when it contributes to a percentile target.
- Successive skill ranks cost progressively more Character Points. This revises the earlier flat-cost advancement hypothesis for skills; attribute increases remain flat-cost for now.
- Skill ranks are capped at 5.

| Rank | Label | Formula value |
|---:|---|---:|
| 1 | Novice | +5 |
| 2 | Trained | +10 |
| 3 | Skilled | +15 |
| 4 | Expert | +20 |
| 5 | Master | +25 |

- Character sheets should show the label and effective value, such as `Polearms — Skilled (+15)`.
- Any magical skill grants one shared mana pool. Additional magical skills do not create additional pools.
- Skills describe broad disciplines or magical traditions; abilities describe specific combat functions. Narrow effect labels such as Restoration Magic are avoided when they behave like ability categories disguised as skills.
- Each ability lists a curated set of qualifying skills. The possible combination space is intentionally large, but combinations share the generic ability's mechanical chassis rather than becoming separately authored catalogue entries.
- A skill-ability expression may receive case-specific fictional rulings when obvious, but bespoke numerical exceptions should not be required for most combinations.

### Skill worksheet

| Skill | Covers | Combat permissions | Qualifying abilities | Defensive implements | Grants mana? | Trap/overlap risk |
|---|---|---|---|---|---|---|
| Polearms | Competence with polearms | Polearm Strike and anchored techniques | Power Attack, Area Attack, Mobile Attack, others later | A held polearm may supply the skill to Defend | No | Broad weapon category; reach cases remain fictional |
| Swordsmanship | Competence with one-handed swords | Sword Strike and anchored techniques | Counterattack, others later | A held sword may supply the skill to Defend | No | Must remain distinct from Shieldcraft |
| Shieldcraft | Competence with shields | Shield use, shield attacks, protection expressions | Enhanced Protect, Forced Move, others later | Shield | No | Strong interaction with armor and retained AP |
| Storm Magic | A broad storm magical tradition | Touch and qualifying purchased magic | Bolt, Ward, Forced Move, others later | None through universal Defend | Yes | Fictional advantages must not require bespoke rules for every use |
| Holy Magic | A broad holy magical tradition | Touch and qualifying purchased magic | Bolt, Heal, Area Healing, Ward, others later | None through universal Defend | Yes | Broad offense/healing access may become efficient |

### Defend and skills

Universal Defend uses:

> NPC Threat + AGI + DEX + applicable held-implement skill + Implement DEF

- A combatant may Defend bare-handed with AGI + DEX and no skill or Implement DEF unless another rule applies.
- Any mundane held implement may supply an applicable skill. A sword may use Swordsmanship; a polearm may use Polearms; a shield may use Shieldcraft.
- Magical skills and magical implements do not contribute to universal Defend.
- Magical defense is instead expressed through a purchased reaction such as Ward, anchored to a qualifying magical skill and paid for with mana.

### Questions remaining for later catalogue work

- Which additional broad disciplines belong on the complete fixed list?
- What are the exact progressive Character Point costs for ranks 1–5?
- Do any skill-ability combinations create traps or mandatory purchases?

## 14. Equipment

- Status: Provisional

### Equipment principles

- Every conventional weapon enables Strike.
- Strike uses the two attributes, skill, ATK bonus, range, and damage category prescribed by the weapon.
- Equipment bonuses use increments of 5 in the prototype.
- Magical implements are not required to cast. Each implement grants only the specific bonuses written in its description.
- A particular item may serve several functions when explicitly stated; this is not a universal entitlement for all items of that kind.
- Hand requirements apply. Changing a held item uses Interact for 1 AP; dropping an item is free.
- A character may carry and equip up to 20 ordinary items, outside Inventory Points. Each ordinary item uses one slot; trivial objects may be bundled or ignored at GM discretion.
- A character may carry a number of Heavy-tagged items equal to STR. Heavy armor is Heavy.
- Medium armor requires STR 8. Heavy armor requires STR 15.

### Attack equipment template

- Name:
- Fictional form:
- Qualifying skill:
- Weapon ATK:
- Range:
- Physical/Magical:
- Compatible abilities:
- Special property:

### Defensive equipment template

- Name:
- Armor/clothing DEF:
- Implement DEF:
- Defend skill:
- Capacity/hands required:
- Special property:

### Prototype equipment

| Character | Attack item | Weapon ATK | Range | Armor | Implement | Total DEF | Property |
|---|---|---:|---:|---|---|---:|---|
| Offensive martial | Two-handed polearm | 10 | 0 | Medium armor, DEF 10 | Polearm, Implement DEF 0 | 10 | Polearm Strike uses STR + DEX |
| Defensive martial | One-handed sword | 5 | 0 | Heavy armor, DEF 15 | Shield, Implement DEF 5 | 20 | Sword Strike uses DEX + AGI; prototype shield enables Shield Bash |
| Magic offense/control | Touch / purchased Bolt | General magic +10; storm implement +5 to compatible attacks | 0 / 0–1 | Light clothing, DEF 5 | Storm implement | 5 | Implement is one-handed but never required to cast |
| Support | Touch / purchased Bolt | General magic +10; no attack bonus from holy implement | 0 / 0–1 | Light clothing, DEF 5 | Holy implement, +5 to compatible healing | 5 | Implement is one-handed but never required to cast |

### Basic attack formulas

- Polearm Strike: `STR + DEX + (Polearms rank × 5) + Weapon ATK`.
- One-handed sword Strike: `DEX + AGI + (Swordsmanship rank × 5) + Weapon ATK`.
- Magical Touch/Bolt: `MND + INT + (anchored magical skill rank × 5) + 10 general Magic ATK + any specifically applicable implement bonus`.
- Touch is Range 0 and costs 2 mana. It is available through Storm Magic and Holy Magic in the prototype.
- Bolt is a purchased ability, Range 0–1, and costs 2 mana. It is intentionally superior to Touch in targeting because it requires an ability purchase.
- A mage with no mana and no mundane weapon has no attack available. This is intentional prototype resource pressure, not an omission to repair.

### Questions remaining for testing or later catalogue work

- Are the +5/+10 weapon bonuses and 5/10/15 armor scale balanced?
- Does a 20-item inventory remain manageable in full play?
- Which additional items explicitly contribute to several functions?

## 15. Pregenerated characters

- Status: Provisional

These are test configurations, not classes. At least two must share a generic ability anchored to different skills and expressed as different techniques.

### PC A — Offensive martial

- Concept: Straightforward polearm mercenary.
- Intended decisions: Repeated Strike, concentrated burst damage, multi-target pressure, compressed movement, or retained AP.
- Attributes: STR 15, END 15, VIT 10, MND 5, AGI 10, DEX 15, INT 5.
- Skills: Polearms — Skilled (+15).
- HP / stamina / mana / IP: 250 / 20 / none / 3.
- AP / DEF: 3 / 10.
- Equipment: Two-handed polearm (+10 ATK), medium armor (10 DEF).
- Universal-ability formulas: Polearm Strike is 55 ATK; defended target is 80% against Dodge 35. Defend contribution is AGI 10 + DEX 15 + Polearms 15 + Implement DEF 0.
- Purchased abilities: Impaling Thrust, Sweeping Arc, Lancer's Rush, Lacerating Strike.
- Shared generic ability and fictionalization: Area Attack becomes Sweeping Arc.
- Resource pressure: Stamina converts directly into stronger or more AP-efficient turns.
- Strongest expected turn: Lancer's Rush into two Strikes, or Impaling Thrust plus one remaining AP.
- Unlimited fallback: Polearm Strike.
- What this PC tests: Offensive AP composition, repeated actions, two-handed equipment, area pressure, and mobility compression.

### PC B — Defensive martial

- Concept: Straightforward sword-and-shield guardian.
- Intended decisions: Spend AP offensively, retain it for rescue or retaliation, and choose between sword and shield techniques.
- Attributes: STR 15, END 15, VIT 15, MND 5, AGI 10, DEX 10, INT 5.
- Skills: Swordsmanship — Trained (+10); Shieldcraft — Skilled (+15).
- HP / stamina / mana / IP: 275 / 20 / none / 3.
- AP / DEF: 3 / 20.
- Equipment: One-handed sword (+5 ATK), shield (5 Implement DEF), heavy armor (15 DEF, STR 15, Heavy).
- Purchased abilities: Shielded Intercession, Riposte, Shield Bash.
- Protect/Defend specialization: Shielded Intercession compresses Protect and Defend into one reaction. Shield Defend contributes AGI 10 + DEX 10 + Shieldcraft 15 + Implement DEF 5, for 70% against Threat 30.
- Shared generic ability and fictionalization: Forced Move becomes Shield Bash; the Storm Mage expresses the same generic ability as Gust.
- Strongest expected turn: Retain enough AP for Shielded Intercession and Riposte, or repeat Shield Bash while stamina permits.
- Unlimited fallback: Sword Strike at 35 ATK; 65% against Dodge 35.
- What this PC tests: Retained AP, protection, high DEF, counterattacks, forced movement, and unequal skill investment.

### PC C — Magical offense/control

- Concept: Straightforward storm mage.
- Intended decisions: Spend mana on superior range, retain AP and mana for Galeshield, or reposition enemies with Gust.
- Attributes: STR 5, END 10, VIT 10, MND 15, AGI 10, DEX 10, INT 15.
- Skills: Storm Magic — Skilled (+15).
- HP / stamina / mana / IP: 250 / 15 / 20 / 3.
- AP / DEF: 3 / 5.
- Equipment: Storm implement, +5 ATK specifically to Touch, Bolt, and compatible Storm Magic attacks; light clothing, 5 DEF.
- Basic magical attack decision: Touch is granted by Storm Magic and costs 2 mana; Lightning Bolt is purchased for superior Range 0–1 targeting.
- Purchased abilities: Lightning Bolt, Galeshield, Gust.
- Conditions introduced: None; Gust resolves forced movement immediately.
- Shared generic ability and fictionalization: Forced Move becomes Gust; Ward becomes Galeshield.
- Strongest expected turn: Any three 1-AP magical actions if enough mana remains, balanced against retaining AP and mana for Galeshield.
- Unlimited fallback: None. Exhaustion removing attack access is intentional.
- What this PC tests: Mana pressure, purchased ranged superiority, magical reactions, skill-ability fictionalization, and case-specific advantage against arrows.

### PC D — Support

- Concept: Straightforward holy mage and healer.
- Intended decisions: Spend mana on attack, concentrated healing, or efficient group recovery; use IP to preserve mana.
- Attributes: STR 5, END 10, VIT 10, MND 15, AGI 10, DEX 10, INT 15.
- Skills: Holy Magic — Skilled (+15).
- HP / stamina / mana / IP: 250 / 15 / 20 / 3.
- AP / DEF: 3 / 5.
- Equipment: Holy implement, +5 specifically to compatible healing; light clothing, 5 DEF.
- Healing/support abilities: Mend restores 50 HP; Renewing Wave restores 40 HP each to two or three targets.
- Shared generic ability and fictionalization: Bolt becomes Radiant Bolt. Bolt is shared with Storm Magic through a different anchored skill and expression.
- Strongest expected turn: Radiant Bolt plus Mend, or Renewing Wave while retaining 1 AP.
- Unlimited fallback: None. Exhaustion removing attack access is intentional.
- What this PC tests: Automatic healing, multi-target scaling, resource allocation between offense and recovery, and a broad magical tradition supporting several combat functions.

### Roster comparison

| Axis | Offensive martial | Defensive martial | Magic/control | Support |
|---|---|---|---|---|
| Primary attributes | STR, DEX, END | STR, END, VIT | MND, INT | MND, INT |
| Primary skill | Polearms | Shieldcraft; Swordsmanship secondary | Storm Magic | Holy Magic |
| Single-target option | Strike / Impaling Thrust / Lacerating Strike | Strike / Shield Bash | Touch / Lightning Bolt / Gust | Touch / Radiant Bolt |
| Multi-target option | Sweeping Arc | — | — | Renewing Wave |
| Defensive option | Defend | Shielded Intercession / Riposte | Galeshield | Defend only |
| Ally-facing option | — | Protect / Shielded Intercession | — | Mend / Renewing Wave |
| Unlimited fallback | Strike | Strike | None intentionally | None intentionally |
| Limited resource | Stamina | Stamina | Mana | Mana |
| Shared generic ability | Area Attack | Forced Move | Bolt, Ward, Forced Move | Bolt |

## 16. Prototype ability set

- Status: Provisional

Do not create a full catalogue. Include only what tests offensive variety, protection, multiple targets, resource use, control, healing, shared effects, and boss interaction.

| Generic ability | Specific name | Owner | Skill | AP | Pool cost | Range | Targets | Formula | Effect | Test purpose |
|---|---|---|---|---:|---:|---:|---|---|---|---|
| Power Attack | Impaling Thrust | Polearm mercenary | Polearms | 2 | 3 stamina | 0 | 1 | 75 ATK; Strike +20 | Single-target attack | AP-for-damage tradeoff |
| Area Attack | Sweeping Arc | Polearm mercenary | Polearms | 2 | 4 stamina | 0 | 2–3 | 45 ATK; Strike −10 | Uses multi-target attack procedure | Aggregate damage and AP pressure |
| Mobile Attack | Lancer's Rush | Polearm mercenary | Polearms | 1 | 3 stamina | One transition, then 0 | 1 | 55 ATK | Move through one normal connection, then attack in destination | AP compression and zone use |
| Persistent Attack | Lacerating Strike | Polearm mercenary | Polearms | 2 | 3 stamina | 0 | 1 | 55 ATK; normal Strike | If damage is dealt, apply Bleeding; Persistent Damage equals weapon ATK (10) | Condition pressure and troll counter |
| Enhanced Protect | Shielded Intercession | Guardian | Shieldcraft | 1 | 2 stamina | Same zone | 1 ally | Normal shield Defend | Protect and immediately Defend as one reaction | Rescue economy |
| Counterattack | Riposte | Guardian | Swordsmanship | 1 | 2 stamina | 0 | 1 | 35 ATK | After Defend produces the better result, immediately Strike attacker | Retained AP chains |
| Forced Move | Shield Bash | Guardian | Shieldcraft | 1 | 3 stamina | 0 | 1 | 45 ATK; STR + END + Shieldcraft | If damage is dealt, push target one connected zone | Control through martial expression |
| Bolt | Lightning Bolt | Storm Mage | Storm Magic | 1 | 2 mana | 0–1 | 1 | 60 Magical ATK | Superior-range magical attack | Purchased ranged access |
| Ward | Galeshield | Storm Mage | Storm Magic | 1 | 2 mana | Self | 1 incoming attack | MND + INT + Storm Magic; +15 Ward DEF on better result | Replaces Defend; +10 further Ward DEF against arrows or similar airborne projectiles | Magical reaction and fictional advantage |
| Forced Move | Gust | Storm Mage | Storm Magic | 1 | 3 mana | 0–1 | 1 | 60 Magical ATK | If damage is dealt, push target one connected zone | Same generic ability through a different skill |
| Bolt | Radiant Bolt | Holy Mage | Holy Magic | 1 | 2 mana | 0–1 | 1 | 55 Magical ATK | Superior-range magical attack | Shared generic magic ability |
| Heal | Mend | Holy Mage | Holy Magic | 1 | 3 mana | 0–1 | 1 | 50 healing; MND + INT + Holy Magic + implement 5 | Automatically restore HP, not above maximum | Concentrated healing and revival |
| Area Healing | Renewing Wave | Holy Mage | Holy Magic | 2 | 5 mana | 0–1 | 2–3 | 40 healing each; Mend −10 | Automatically restore HP to each target, not above maximum | Aggregate healing scaling |

### Checks

- [x] Both martial PCs have a useful unlimited fallback; both mages intentionally lose attack access when mana is exhausted.
- [x] Every limited pool creates a timing decision on paper; testing remains required.
- [x] At least two PCs share a generic ability through different skills.
- [x] At least one ability is multi-target.
- [x] At least one ability changes protection.
- [x] At least one ability heals or restores an ally.
- [ ] At least one ability interacts with the boss mechanic.
- [x] Forced Move states that its movement requires damage; Galeshield does not deal damage.

### Combination-space risk

- Large numbers of possible ability-skill pairings are desirable only while they remain possibility space rather than separately authored content.
- Each ability must list a curated qualifying-skill set. Not every magical ability qualifies for every magical skill.
- Revisit the architecture if players cannot predict what an expression permits or if the GM must invent bespoke mechanical benefits for most uses.

## 17. Conditions

- Status: Provisional

Only create conditions used by prototype abilities or enemies.

| Condition | Applied by | Effect | Duration | Removal | Stacking | Decision created |
|---|---|---|---|---|---|---|
| Incapacitated | Concussive Blow and future effects | Maximum AP becomes 1; that AP may only be spent on Recover. A boss immediately loses all remaining Edges. | Until Recovered | Recover, 1 AP | Reapplication does nothing | Tests severe action denial and ally rescue. |
| Persistent Damage | Lacerating Strike expressed as Bleeding; other expressions such as Burning may qualify | At the start of the affected character's normal turn, take the amount specified by the source, ignoring DEF. The prototype troll replaces this damage with suppression of Regeneration. | Until Recovered | Recover, 1 AP | Reapplication does nothing | Tests ongoing pressure and the troll counter. |
| Rallied | Rallying Order | +10 ATK and +5 DEF while sustained by the invoker. | Sustained | Ends when the invoker does not Sustain; Recover may remove it | Does not stack | Tests positive conditions and sustained support. |

Forced Move is an immediate control effect, not a persistent condition.

### Recover

> **Recover — 1 AP, Range 0:** Remove one condition from oneself or another character. Helping another character requires a plausible method. If the method is otherwise unavailable but could reasonably be supplied, spend 1 IP to make it possible.

- Negative conditions have no timer; they persist until Recovered.
- A positive condition is sustained by its invoker. Invocation covers the initial turn; on later turns the invoker normally spends 1 AP at the start of their turn to sustain all targets created by that invocation.
- A condition attached to a damaging attack normally applies only if at least 1 HP damage gets through.
- Persistent Damage can reduce a character to 0 HP. Whether it counts as a finishing blow is up to the GM.

## 18. NPC/adversary template

- Status: Provisional

NPCs use the same AP-and-ability structure as PCs but simplified type-based statblocks. The GM never rolls their attacks or defenses.

- Name/type:
- Encounter role:
- Motive and targeting behavior:
- HP / AP / ATK / DEF:
- Dodge / Threat:
- Range and movement:
- Equipment/fiction:
- Abilities:
- Pools:
- Weaknesses/resistances:
- Exploitable trait:
- Finishing-blow behavior:
- Group-handling notes:

### Tier worksheet

| Tier | AP | HP | ATK | DEF | Dodge | Threat | Intended danger |
|---|---:|---:|---:|---:|---:|---:|---|
| Small fry | 2 | 70–80 | 35 | 5 | 35 | 30 | Individually fragile; dangerous in numbers. |
| Trained |  |  |  |  |  |  |  |
| Elite | 3 | 140–160 | 45–50 | 10 | 20 | 20 | Tougher encounter piece with several abilities. |
| Boss | 3 plus 3 Edges in this prototype | 1,200 | 60 | 20 | 10 | 15 | Solo medium encounter; numbers are troll-specific. |

### Handling decisions

- Soft ability-count guideline: small fry have Strike plus one distinctive ability; trained enemies add roughly two abilities; elites roughly three; bosses use only what their mechanic needs.
- Ordinary NPCs use simple fixed usage limits. Named elites and bosses may use explicit pools when useful. NPCs never have Inventory Points.
- For crowds of five or more identical enemies, the GM may track retained AP and limited uses as shared tallies. This is sage advice, not a hard rule.
- Defend choices, targeting, morale, and finishing blows remain up to the GM. Optional behavior notes are useful when consistent tactics reduce handling or improve a test.

## 19. Group encounter

- Status: Ready for paper checks

- Enemy type/count: Ten bandits—four melee bandits, four archers, one bruiser, and one leader.
- Battlefield premise: The party assaults a bandit camp after peaceful avoidance is no longer available.
- Zone map: Approach → Gate → Camp → Command Tent. The Watchtower connects to the Camp by a two-transition connection.
- Starting positions: PCs at Approach; melee bandits at Gate; bruiser at Camp; archers at Watchtower; leader at Command Tent.
- Enemy motive: Defeat the party. For this combat test, the bandits fight to the end rather than using realistic morale.
- Targeting priorities: GM discretion. Optional behavior notes may keep the test consistent.
- Environmental features: Watchtower increases bow range from 1 to 2; it grants no defensive bonus. Other zones have no special rule in the baseline.
- Expected rounds: Three to four; five rounds is the maximum target.
- Expected difficulty: Medium. Competent play should achieve total victory with every PC conscious.
- Retreat/defeat state: Test ends when one side is defeated.

### Adversaries

| Enemy | Count | HP | AP | ATK | DEF | Dodge | Threat |
|---|---:|---:|---:|---:|---:|---:|---:|
| Melee bandit | 4 | 80 | 2 | 35 | 5 | 35 | 30 |
| Archer | 4 | 70 | 2 | 35 | 5 | 35 | 30 |
| Bruiser | 1 | 160 | 3 | 50 | 10 | 20 | 20 |
| Leader | 1 | 140 | 3 | 45 | 10 | 20 | 20 |

- **Reckless Assault — 1 AP, once per encounter:** Melee Strike at +10 ATK; the bandit cannot retain AP that turn.
- **Aimed Shot — 2 AP:** Ranged attack at +15 ATK. Bows are Range 1 on the ground and Range 2 from the Watchtower.
- **Concussive Blow — 2 AP:** The bruiser makes a normal-ATK melee attack. If at least 1 HP damage gets through, the target becomes Incapacitated.
- **Rallying Order — 3 AP, same zone, 2–4 allies:** Targets become Rallied. Invocation sustains the condition until the leader's next turn. On subsequent turns, 1 AP sustains every original target. By default, targets need not remain in the leader's zone; the GM may rule otherwise from the fiction.

| Question | Supporting evidence | Refuting evidence | Measurement |
|---|---|---|---|
| Can the GM operate ten enemies quickly? |  |  | Enemy-phase duration |
| Do multi-target attacks save time? |  |  | Resolution time/AP spent |
| Do PCs vary turns? |  |  | Ability-use counts |
| Is careless play dangerous? |  |  | Damage/defeats |
| Does DEF nullify multi-target attacks? |  |  | Zero-damage instances |

## 20. Boss encounter

- Status: Ready for paper checks

- Boss concept and motive: A lone troll; simple enough for a new GM to operate.
- Battlefield zones: Cave Mouth, Troll's Den, Rocky Ledge. Cave Mouth connects to the Den; Den connects to the Ledge.
- Starting position: PCs at Cave Mouth; troll in its Den.
- HP / AP / ATK / DEF / Dodge / Threat: 1,200 / 3 / 60 / 20 / 10 / 15.
- Edges: 3 per round because the troll has 3 AP.
- Ordinary abilities: Crushing Strike and Hurl Debris.
- Multi-target ability: Sweeping Blow.
- Reactions: Ordinary reactions paid from the troll's normal AP pool.
- Visible mechanic: Regeneration restores 50 HP at the start of the troll's normal turn.
- Investigation-derived fact: Persistent Damage reliably suppresses troll regeneration.
- Advantage created: Persistent Damage does not deal its stated recurring damage to this troll; instead Regeneration remains inactive until the troll Recovers from the condition.
- Other valid solutions: Any ability, item, or plausible improvisation that applies Persistent Damage. The scenario does not prescribe how the party produces it.
- Environmental pressure: Hurl Debris keeps the Rocky Ledge from being completely safe.
- Escalation: At 600 HP or lower, the troll becomes Enraged: +10 ATK and −10 DEF for the rest of the encounter.
- Defeat/retreat behavior: Fight until defeated for the test.
- Expected rounds/duration: No more than five rounds; medium difficulty and total party victory under competent play.

### Edge procedure

- At round start, a boss gains Edges equal to its maximum AP in addition to refreshing its normal AP pool.
- After a PC completes their turn, the boss must spend one Edge if any remain. An Edge permits any one ability the boss can perform for 1 AP.
- An unused Edge expires; Edges cannot be retained, combined, or used as reactions.
- Players may order their turns to draw out the boss's limited Edges.
- After all PCs and ordinary NPCs have acted, the boss takes its normal turn using whatever remains of its normal AP pool after reactions.
- Start-of-turn effects resolve only at the start of the normal turn, never on an Edge.
- Incapacitated immediately removes all remaining Edges. On the normal turn, the boss receives only 1 AP and must use Recover.

### Troll abilities and guide

- **Crushing Strike — 1 AP:** Range 0, one target, 60 ATK.
- **Sweeping Blow — 2 AP:** Range 0, two or three targets, 50 ATK using multi-target resolution.
- **Hurl Debris — 1 AP:** Range 1, one target, 50 ATK.
- The troll may spend an Edge to Recover from Persistent Damage. If it does so before its normal turn, Regeneration functions normally at the start of that turn. Applying Persistent Damage after the final Edge guarantees suppression for that normal turn.
- Beginner guide: On an Edge, Strike if possible; otherwise Move or Hurl Debris. Recover when preserving Regeneration is worthwhile. On the normal turn, Sweep two or more targets; otherwise Strike. Retain AP to Defend after taking heavy damage. Once Enraged, favor offense.

### Checks

- [x] Observable before irreversible punishment.
- [x] Investigation helps without scripting one solution.
- [x] Ignoring it is possible but costly.
- [x] More than one build can respond.
- [x] GM handling is reasonable on paper.
- [x] It changes decisions, especially PC order and boss Edge use.

## 21. Paper and probability checks

- Status: Unknown

### Durability

| Attacker | Target | ATK | Defended damage | Target HP | Undefended hits to 0 | Defended hits to 0 | Intended? |
|---|---|---:|---:|---:|---:|---:|---|
| Equal-tier NPC | PC |  |  |  | Target: 5–6 |  |  |
|  |  |  |  |  |  |  |  |

### Resource loops

| Character | Pool | Maximum | Costs | Uses before empty | Unlimited fallback | Recovery | Risk |
|---|---|---:|---|---:|---|---|---|
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

### Degenerate strategies

- [ ] Three Strikes every turn
- [ ] Save all AP for Defend
- [ ] Protect then Defend loops
- [ ] Multi-target AP draining
- [ ] Healing repeatedly from 0 HP
- [ ] DEF stacking to zero all damage
- [ ] Extreme specialization
- [ ] Resource hoarding
- [ ] Prepared-trigger abuse

## 22. Microtests

- Status: Unknown

### A — Single-target AP tradeoff

- Question:
- Setup:
- Fixed variables:
- Supporting evidence:
- Refuting evidence:
- Repetitions/results:

### B — Protect and finishing blow

- Question:
- Setup:
- Fixed variables:
- Supporting evidence:
- Refuting evidence:
- Repetitions/results:

### C — Multi-target resolution

- Question:
- Setup:
- Fixed variables:
- Supporting evidence:
- Refuting evidence:
- Repetitions/results:

### D — Zones and transit

- Question:
- Setup:
- Fixed variables:
- Supporting evidence:
- Refuting evidence:
- Repetitions/results:

## 23. Full prototype playtest

- Build/version:
- Date:
- Facilitator:
- Players:
- Encounter:
- Duration:
- Rules interventions:

| Metric | Measurement |
|---|---:|
| Time per PC phase |  |
| Time per enemy phase |  |
| Attacks requiring no roll |  |
| Single-target defense rolls |  |
| Multi-target abilities |  |
| AP spent mitigating multi-target attacks |  |
| Multi-target damage reduced to zero |  |
| Prepared actions declared/triggered |  |
| Protect reactions |  |
| Finishing blows/interceptions |  |
| All-offense turns |  |
| Abilities never used |  |
| Repeated actions |  |
| Resources spent/remaining |  |
| Rules consultations |  |

### Findings

| Observation | Interpretation | Smallest change | Risk | Next test |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |

## 24. Stress-test queue

- [ ] One PC against five or six ordinary NPCs
- [ ] Strike spam
- [ ] Multi-target AP-drain optimization
- [ ] Resource hoarding
- [ ] Fallen PC and finishing blow
- [ ] Repeated revival
- [ ] Ignored boss mechanic
- [ ] Specialist versus generalist
- [ ] Maximum DEF
- [ ] Percentile overflow
- [ ] Multi-round transit
- [ ] Ten NPCs retaining reaction AP

## 25. Decision log

| Date | Decision | Status | Evidence/reason | Revisit when |
|---|---|---|---|---|
| 2026-08-25 | PC phase then NPC phase; free order within sides; complete turns. | Provisional | Avoids rolled initiative and supports coordination. | Alpha strikes/downtime appear. |
| 2026-08-25 | AP refreshes each round; unused AP becomes reaction capacity and then disappears. | Provisional | Creates offense-versus-defense decisions. | Reaction timing fails. |
| 2026-08-25 | Abilities may repeat without a universal turn limit. | Provisional | Enables flexible turns. | Spam dominates. |
| 2026-08-25 | Prepared actions are free end-of-turn declarations and pay only when triggered. | Provisional | Supports deliberate reactions. | Trigger handling slows play. |
| 2026-08-25 | PCs start testing at 3 AP; weakest NPCs at 2 AP. | Testing | Plausible initial action economy. | First microtests. |
| 2026-08-25 | NPC ambush reverses round-one sides; PC ambush remains a +1 AP hypothesis. | Provisional/Hypothesis | Compact surprise rule. | Ambush testing. |
| 2026-08-25 | Named zones use integer transition range. | Provisional | Theatre-of-the-mind compatible. | Zone tests fail. |
| 2026-08-25 | Movement costs 1 AP per transition and may continue across rounds. | Provisional | Supports meaningful battlefield distance. | Transit causes problems. |
| 2026-08-25 | No automatic opportunity attacks. | Provisional | Explicit reactions handle interception. | Melee control is too weak. |
| 2026-08-25 | Undefended attacks are deterministic; single targets may spend AP to Defend. | Testing | Eliminates routine rolls. | Damage lacks tension. |
| 2026-08-25 | Players make all combat rolls. | Provisional | Reduces GM handling. | Orientation confuses players. |
| 2026-08-25 | Percentile roll-under with fixed 01–05 and 96–00 bands. | Locked for current design | Explicit odds with infrequent rolling. | Strong contrary evidence. |
| 2026-08-25 | Attributes contribute 1:1 and start at 1; skills are unpurchased at 0 and each rank contributes +5. | Provisional | Keeps attribute growth granular and skill advancement chunky. | Construction/advancement tests. |
| 2026-08-25 | Target numbers overflow rather than clipping. | Provisional | Excess absorbs penalties. | Ratings erase difficulty. |
| 2026-08-25 | NPC types use shared Dodge and Threat. | Provisional | Simple statblocks. | NPC math tests. |
| 2026-08-25 | Abilities are complete active modes with named attributes, skill, equipment, costs, formula, and effects. | Provisional | Implements prior architecture. | Formula overload. |
| 2026-08-25 | Universal abilities include Move, Strike, Defend, Protect, Use Consumable, and Interact; prototype magical skills also grant Touch. | Provisional | Establishes mundane and magical basic actions while preserving resource pressure. | Future non-offensive magic or missing actions emerge. |
| 2026-08-25 | Protect redirects a single-target attack in the same zone and may be followed by Defend. | Provisional | Supports rescues. | Protection loops. |
| 2026-08-25 | Multi-target attacks require multiple targets; 1 AP grants automatic ATK−DEF mitigation without rolling. | Testing | Preserves AP choice and limits rolls. | Aggregate AP drain/DEF nullification. |
| 2026-08-25 | Basic Protect cannot affect multi-target attacks. | Provisional | Avoids duplication complexity. | Group protection design. |
| 2026-08-25 | One DEF value comes primarily from armor/clothing and defensive implements. | Provisional | Legible mitigation. | Equipment/magic requires separation. |
| 2026-08-25 | Damage categories are Physical and Magical; specific interactions use case-by-case flat ATK changes. | Provisional | Avoids exhaustive types. | Inconsistent rulings. |
| 2026-08-25 | Secondary effects normally require at least 1 HP damage. | Provisional | Absorbed attacks do not add riders. | Exceptions are needed. |
| 2026-08-25 | Attributes are STR, END, VIT, MND, AGI, DEX, INT. | Provisional | Intended character axes. | Dominance/redundancy appears. |
| 2026-08-25 | Prototype pools are HP `200 + VIT × 5`, stamina `5 + END`, and mana `5 + MND` after any magical skill; PCs should withstand 5–6 equal-tier undefended hits. | Testing | Makes pool attributes visible while supporting the durability and resource targets. | Numerical checks or playtests fail. |
| 2026-08-25 | Consumables use Inventory Points; 1 AP and 1 IP restore one pool by a pool-specific fixed value. | Provisional | Abstract recovery without item tracking. | Values/capacity are tested. |
| 2026-08-25 | Healing above 0 restores action access with the existing AP state. | Provisional | Rescue without free AP. | Revival loops. |
| 2026-08-25 | Prototype skills are Polearms, Swordsmanship, Shieldcraft, Storm Magic, and Holy Magic; Restoration Magic is dropped. | Provisional | Skills describe broad disciplines or traditions rather than narrow ability functions. | The complete skill catalogue is designed. |
| 2026-08-25 | Skill ranks are Novice through Master, capped at 5, worth +5 each, and progressively more expensive at higher ranks. | Provisional | Makes each rank materially significant and constrains specialization. | Character Point pricing is designed or advancement testing fails. |
| 2026-08-25 | Ability-skill combinations use curated qualifying lists and share generic mechanical chassis. | Provisional | Creates broad expression without authoring the full cross-product. | Most combinations demand bespoke rulings or become unpredictable. |
| 2026-08-25 | Universal Defend uses AGI + DEX + applicable mundane implement skill + Implement DEF; magical defense requires a purchased Ward expression. | Provisional | Anything may be used practically to defend, while magical defense remains an invested, mana-powered technique. | Defense options become mandatory or conceptually incoherent. |
| 2026-08-25 | Conventional weapons grant Strike; prototype magical skills grant 2-mana Touch, while purchased Bolt is deliberately superior in range. | Provisional | Separates free martial fallback from resource-powered magical offense. | Mage exhaustion is unfun or Bolt becomes mandatory. |
| 2026-08-25 | Prototype equipment uses +5 increments, STR-gated armor, 20 ordinary item slots, and Heavy capacity equal to STR. | Testing | Provides a simple first equipment scale and meaningful strength gates. | Equipment tests or inventory handling fail. |
| 2026-08-25 | Prototype IP capacity is 3; one IP and AP restore 50 HP, 5 stamina, or 6 mana; IP resets between prototype encounters. | Testing | Creates emergency recovery choices with fixed values. | Recovery dominates or is ignored. |
| 2026-08-25 | Each initial pregen had three purchased abilities; the offensive martial later gained Lacerating Strike for the condition test. Exhausted mages intentionally have no attack fallback. | Testing | Keeps interfaces compact while covering required mechanics and making mana exhaustion consequential. | The fourth martial ability overloads that sheet or mages become non-participants too readily. |
| 2026-08-26 | Conditions have no countdown. Recover costs 1 AP and removes one condition; an ally may help when the method is plausible or made possible with 1 IP. | Provisional | Makes harmful conditions an AP tax without duration bookkeeping. | Recovery becomes trivial or too punitive. |
| 2026-08-26 | Incapacitated restricts the victim to 1 AP usable only for Recover and removes a boss's remaining Edges. | Provisional | Severe for ordinary characters while scaling coherently against bosses. | Turn denial proves excessive. |
| 2026-08-26 | Persistent Damage triggers at the start of the affected character's normal turn, ignores DEF, and is specified by its source. | Provisional | Guarantees pressure until Recovered. | Damage or timing is oppressive. |
| 2026-08-26 | Lacerating Strike is a fourth offensive-martial ability: 2 AP, 3 stamina, normal damage, then Bleeding equal to weapon ATK if damage gets through. | Testing | Gives the martial a dedicated Persistent Damage expression. | It dominates Impaling Thrust or is ignored. |
| 2026-08-26 | Positive conditions are sustained by their invoker for 1 AP on later turns; Rallied grants +10 ATK and +5 DEF without stacking. | Provisional | Gives support effects an ongoing action-economy cost. | Sustaining is automatic or never worthwhile. |
| 2026-08-26 | NPC ability counts are soft guidelines; NPCs have no IP; crowd tracking is optional sage advice; tactical and finishing-blow choices remain with the GM. | Provisional | Keeps NPC operation light without overformalizing GM judgment. | Ten-enemy handling is slow. |
| 2026-08-26 | The first group encounter uses eight small fry and two tougher bandits across five zones and targets medium difficulty, total victory, and no more than five rounds. | Testing | Establishes a clean baseline before hard stress tests. | Paper checks or playtest miss the target. |
| 2026-08-26 | Bosses gain Edges equal to maximum AP; each remaining Edge forces one 1-AP action after a PC turn, while the normal AP pool still pays reactions and the final normal turn. | Testing | Gives solo bosses presence throughout the PC phase without abandoning AP. | Boss handling or output is excessive. |
| 2026-08-26 | The prototype troll replaces Persistent Damage's recurring damage with suppression of Regeneration until Recover; it may Recover using an Edge. | Testing | Investigation produces a tactical action-economy counter rather than a scripted damage key. | The counter is too easy or too obscure. |

## 26. Resume point

The design interview is complete through the two prototype encounters. A playable combat-rules artifact has not yet been created.

Next session:

1. Create a versioned combat-rules artifact from the decisions in Sections 1–20.
2. Record its filename and version in the checklist and decision log.
3. Review that artifact against this workbook.
4. Complete Section 21 paper and probability checks for both encounters.
5. Run Section 22 focused microtests.
6. Only then run the full bandit and troll encounters in Section 23.
7. Record later rules corrections as new versions rather than silently changing the tested artifact.
