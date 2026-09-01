(() => {
  "use strict";

  const core = globalThis.TextGameCore;
  if (!core || typeof core.validateAdventure !== "function" || typeof core.createRun !== "function") return;

  const validateAdventure = core.validateAdventure;
  const validateCharacter = core.validateCharacter;
  const createRun = core.createRun;
  const performInteraction = core.performInteraction;
  const combatCountIssue = "adventure.scenes: must contain exactly one combat scene";
  const templateTextKeys = new Set(["title","text","speaker","label","description","reason","goal","approach","name","role","expression","twistPreview"]);
  const writableRoots = new Set(["flags","counters","quest","clocks"]);
  const unsafePathSegments = new Set(["__proto__","constructor","prototype"]);
  const outcomeEffectTypes = new Set(["set","add","advance-clock"]);
  const interactionEffectTypes = new Set([...outcomeEffectTypes,"damage-enemy","condition-enemy","move-unit"]);
  const clone = value => JSON.parse(JSON.stringify(value));
  const isObject = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const isFiniteNumber = value => typeof value === "number" && Number.isFinite(value);

  function materializeAdventure(value, mainName, key = null) {
    if (typeof value === "string") return templateTextKeys.has(key) ? value.replace(/\{\{\s*main\.name\s*\}\}/g, () => mainName) : value;
    if (Array.isArray(value)) return value.map(item => materializeAdventure(item, mainName, key));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, item]) => [childKey, materializeAdventure(item, mainName, childKey)]));
    return value;
  }

  function validateAbilityExtras(ability, path, issues) {
    if (!isObject(ability)) return;
    if (ability.tags != null) {
      if (!Array.isArray(ability.tags)) issues.push(`${path}.tags: must be an array when present`);
      else if (ability.tags.some(tag => typeof tag !== "string")) issues.push(`${path}.tags: must contain only strings`);
    }
    if (ability.condition != null) {
      if (typeof ability.condition !== "string" && !isObject(ability.condition)) {
        issues.push(`${path}.condition: must be a condition id string or object`);
      } else if (isObject(ability.condition)) {
        if (ability.condition.id != null && (typeof ability.condition.id !== "string" || !ability.condition.id.trim())) issues.push(`${path}.condition.id: must be a non-empty string when present`);
        if (ability.condition.amount != null && (!isFiniteNumber(ability.condition.amount) || ability.condition.amount < 0)) issues.push(`${path}.condition.amount: must be a nonnegative finite number when present`);
      }
    }
  }

  function validateCharacterExtras(character, path = "character") {
    const issues = [];
    if (isObject(character) && Array.isArray(character.abilities)) character.abilities.forEach((ability, index) => validateAbilityExtras(ability, `${path}.abilities[${index}]`, issues));
    return issues;
  }

  function validateStateEffectPath(effect, path, issues) {
    if (effect.type !== "set" && effect.type !== "add") return;
    if (typeof effect.path !== "string" || !effect.path.trim()) {
      issues.push(`${path}.path: ${effect.type} effects require a writable state path`);
      return;
    }
    const parts = effect.path.split(".");
    if (!writableRoots.has(parts[0]) || parts.some(part => unsafePathSegments.has(part))) issues.push(`${path}.path: unsafe or unsupported state effect path ${effect.path}`);
  }

  function validateConditionValue(condition, path, issues) {
    if (!isObject(condition)) {
      issues.push(`${path}: condition must be an object`);
      return;
    }
    if (typeof condition.path !== "string" || !condition.path.trim()) issues.push(`${path}.path: condition requires a state path`);
    else {
      const parts = condition.path.split(".");
      if (!writableRoots.has(parts[0]) || parts.some(part => unsafePathSegments.has(part))) issues.push(`${path}.path: unsafe or unsupported condition path ${condition.path}`);
    }
    if (Object.prototype.hasOwnProperty.call(condition, "gte") && !isFiniteNumber(condition.gte)) issues.push(`${path}.gte: must be a finite number`);
    if (Object.prototype.hasOwnProperty.call(condition, "lte") && !isFiniteNumber(condition.lte)) issues.push(`${path}.lte: must be a finite number`);
  }

  function validateWhen(when, path, issues) {
    if (when == null) return;
    if (Array.isArray(when)) {
      when.forEach((condition, index) => validateConditionValue(condition, `${path}[${index}]`, issues));
      return;
    }
    if (!isObject(when)) {
      issues.push(`${path}: must be a condition object or array`);
      return;
    }
    const hasAll = Object.prototype.hasOwnProperty.call(when, "all");
    const hasAny = Object.prototype.hasOwnProperty.call(when, "any");
    if (hasAll || hasAny) {
      if (hasAll && hasAny) issues.push(`${path}: cannot define both all and any condition groups`);
      for (const key of ["all","any"]) {
        if (!Object.prototype.hasOwnProperty.call(when, key)) continue;
        if (!Array.isArray(when[key])) issues.push(`${path}.${key}: must be an array`);
        else when[key].forEach((condition, index) => validateConditionValue(condition, `${path}.${key}[${index}]`, issues));
      }
      return;
    }
    validateConditionValue(when, path, issues);
  }

  function validateInteractionCondition(condition, path, issues) {
    if (typeof condition === "string") {
      if (!condition.trim()) issues.push(`${path}: condition id must not be blank`);
      return;
    }
    if (!isObject(condition)) {
      issues.push(`${path}: must be a condition id string or object`);
      return;
    }
    if (typeof condition.id !== "string" || !condition.id.trim()) issues.push(`${path}.id: must be a non-empty string`);
    if (condition.amount != null && (!isFiniteNumber(condition.amount) || condition.amount < 0)) issues.push(`${path}.amount: must be a nonnegative finite number when present`);
  }

  function validateEffect(effect, path, allowedTypes, context, issues) {
    if (!isObject(effect)) {
      issues.push(`${path}: effect must be an object`);
      return;
    }
    if (!allowedTypes.has(effect.type)) {
      const type = typeof effect.type === "string" && effect.type ? effect.type : "(missing)";
      issues.push(`${path}.type: effect type ${type} is not allowed in this container`);
      return;
    }

    validateStateEffectPath(effect, path, issues);
    if (effect.type === "add" && !isFiniteNumber(effect.value)) issues.push(`${path}.value: add effects require a finite numeric value`);

    if (effect.type === "advance-clock") {
      if (!context.validClocks.has(effect.id)) issues.push(`${path}.id: unknown progress clock ${effect.id || "(missing)"}`);
      if (effect.segments != null && (!Number.isInteger(effect.segments) || effect.segments < 1)) issues.push(`${path}.segments: advance-clock segments must be a finite numeric value and a positive whole number`);
    }

    if (effect.type === "damage-enemy") {
      if (!context.enemyIds?.has(effect.targetId)) issues.push(`${path}.targetId: unknown enemy ${effect.targetId || "(missing)"}`);
      if (!isFiniteNumber(effect.amount) || effect.amount < 0) issues.push(`${path}.amount: damage-enemy amount must be a nonnegative finite number`);
    }

    if (effect.type === "condition-enemy") {
      if (!context.enemyIds?.has(effect.targetId)) issues.push(`${path}.targetId: unknown enemy ${effect.targetId || "(missing)"}`);
      validateInteractionCondition(effect.condition, `${path}.condition`, issues);
    }

    if (effect.type === "move-unit") {
      if (!new Set(["pc","npc"]).has(effect.side)) issues.push(`${path}.side: move-unit side must be pc or npc`);
      const targetIds = effect.side === "pc" ? context.pcIds : effect.side === "npc" ? context.enemyIds : null;
      if (!targetIds?.has(effect.targetId)) issues.push(`${path}.targetId: unknown ${effect.side || "unit"} target ${effect.targetId || "(missing)"}`);
      if (!context.zoneIds?.has(effect.zone)) issues.push(`${path}.zone: unknown battlefield zone ${effect.zone || "(missing)"}`);
    }
  }

  function validateEffects(effects, path, allowedTypes, context, issues) {
    if (effects == null || !Array.isArray(effects)) return;
    effects.forEach((effect, index) => validateEffect(effect, `${path}[${index}]`, allowedTypes, context, issues));
  }

  function validateOutcomeEffects(outcome, path, context, issues) {
    if (!isObject(outcome)) return;
    validateEffects(outcome.effects, `${path}.effects`, outcomeEffectTypes, context, issues);
  }

  function validateCheckExtras(choice, path, context, issues) {
    validateWhen(choice.when, `${path}.when`, issues);
    if (choice.resolution !== "check" || !isObject(choice.check)) return;
    const modifiers = choice.check.situationalModifiers;
    if (Array.isArray(modifiers)) {
      modifiers.forEach((modifier, index) => {
        const modifierPath = `${path}.check.situationalModifiers[${index}]`;
        if (!isObject(modifier)) issues.push(`${modifierPath}: must be an object`);
        else {
          if (modifier.label != null && typeof modifier.label !== "string") issues.push(`${modifierPath}.label: must be a string when present`);
          if (!isFiniteNumber(modifier.value)) issues.push(`${modifierPath}.value: must be a finite number`);
        }
      });
    }
    if (choice.check.clock != null && !context.validClocks.has(choice.check.clock)) issues.push(`${path}.check.clock: references unknown clock ${choice.check.clock}`);
  }

  function validateAdventureExtras(adventure) {
    const issues = [];
    if (!isObject(adventure)) return issues;
    if (adventure.questDays != null && (!isFiniteNumber(adventure.questDays) || adventure.questDays < 0)) issues.push("adventure.questDays: must be a nonnegative finite number");

    const validClocks = new Set(Object.keys(isObject(adventure.clocks) ? adventure.clocks : {}));
    for (const [id, clock] of Object.entries(isObject(adventure.clocks) ? adventure.clocks : {})) {
      if (isObject(clock) && clock.filled != null) {
        if (!isFiniteNumber(clock.filled) || clock.filled < 0 || (isFiniteNumber(clock.size) && clock.filled > clock.size)) issues.push(`adventure.clocks.${id}.filled: must be between 0 and the clock size`);
      }
    }

    const companionIds = new Set((Array.isArray(adventure.party) ? adventure.party : []).map(character => character?.id).filter(Boolean));
    for (const [index, character] of (Array.isArray(adventure.party) ? adventure.party : []).entries()) {
      if (isObject(character) && Array.isArray(character.abilities)) character.abilities.forEach((ability, abilityIndex) => validateAbilityExtras(ability, `adventure.party[${index}].abilities[${abilityIndex}]`, issues));
    }

    const scenes = isObject(adventure.scenes) ? adventure.scenes : {};
    for (const [sceneId, scene] of Object.entries(scenes)) {
      const scenePath = `adventure.scenes.${sceneId}`;
      if (!isObject(scene)) continue;
      const baseContext = {validClocks,enemyIds:null,pcIds:null,zoneIds:null};
      if (scene.type === "scene") {
        for (const [choiceIndex, choice] of (Array.isArray(scene.choices) ? scene.choices : []).entries()) {
          if (!isObject(choice)) continue;
          const choicePath = `${scenePath}.choices[${choiceIndex}]`;
          validateCheckExtras(choice, choicePath, baseContext, issues);
          if (choice.resolution === "automatic") validateOutcomeEffects(choice.outcome, `${choicePath}.outcome`, baseContext, issues);
          if (choice.resolution === "check") {
            validateOutcomeEffects(choice.success, `${choicePath}.success`, baseContext, issues);
            validateOutcomeEffects(choice.failure, `${choicePath}.failure`, baseContext, issues);
            validateOutcomeEffects(choice.twist, `${choicePath}.twist`, baseContext, issues);
          }
        }
      }
      if (scene.type === "combat") {
        const zoneIds = new Set((Array.isArray(scene.battlefield?.zones) ? scene.battlefield.zones : []).map(zone => zone?.id).filter(Boolean));
        const enemyIds = new Set((Array.isArray(scene.enemies) ? scene.enemies : []).map(enemy => enemy?.id).filter(Boolean));
        const pcIds = new Set(["$main",...companionIds]);
        const combatContext = {validClocks,enemyIds,pcIds,zoneIds};
        validateOutcomeEffects(scene.victory, `${scenePath}.victory`, baseContext, issues);
        validateOutcomeEffects(scene.defeat, `${scenePath}.defeat`, baseContext, issues);
        for (const [enemyIndex, enemy] of (Array.isArray(scene.enemies) ? scene.enemies : []).entries()) {
          if (!isObject(enemy)) continue;
          const enemyPath = `${scenePath}.enemies[${enemyIndex}]`;
          for (const key of ["stamina","mana"]) if (enemy[key] != null && (!isFiniteNumber(enemy[key]) || enemy[key] < 0)) issues.push(`${enemyPath}.${key}: must be a nonnegative finite number when present`);
          if (Array.isArray(enemy.abilities)) enemy.abilities.forEach((ability, abilityIndex) => validateAbilityExtras(ability, `${enemyPath}.abilities[${abilityIndex}]`, issues));
        }
        for (const [interactionIndex, interaction] of (Array.isArray(scene.interactions) ? scene.interactions : []).entries()) {
          if (!isObject(interaction)) continue;
          validateEffects(interaction.effects, `${scenePath}.interactions[${interactionIndex}].effects`, interactionEffectTypes, combatContext, issues);
        }
      }
    }
    return issues;
  }

  function baseAdventureErrors(adventure) {
    try { return validateAdventure(adventure); }
    catch (error) { return [`adventure: base validator could not process this document (${error.message})`]; }
  }

  function validateAdventureWithMultipleCombats(adventure) {
    return [...baseAdventureErrors(adventure).filter(issue => issue !== combatCountIssue), ...validateAdventureExtras(adventure)];
  }

  function validateCharacterWithRuntimeExtras(character, path = "character") {
    let base = [];
    try { base = validateCharacter(character, path); }
    catch (error) { base = [`${path}: base validator could not process this character (${error.message})`]; }
    return [...base, ...validateCharacterExtras(character, path)];
  }

  function validationSafeAdventure(adventure) {
    const safe = clone(adventure);
    const entries = Object.entries(safe.scenes || {});
    const combatIds = entries.filter(([, scene]) => scene.type === "combat").map(([id]) => id);
    if (combatIds.length === 1) return safe;
    if (combatIds.length === 0) {
      const usedIds = new Set(Object.keys(safe.scenes || {}));
      let id = "__compat_validation_combat__", suffix = 2;
      while (usedIds.has(id)) id = `__compat_validation_combat__${suffix++}`;
      const companionIds = (safe.party || []).map(character => character.id);
      safe.scenes[id] = {
        type:"combat",title:"Compatibility validation combat",ambush:false,
        battlefield:{zones:[{id:"compat-zone",name:"Compatibility Zone"}],links:[]},
        pcStarts:Object.fromEntries(["$main",...companionIds].map(characterId=>[characterId,"compat-zone"])),
        enemies:[{id:"compat-enemy",name:"Compatibility Enemy",preset:"optimal_killer",zone:"compat-zone",hp:1,stamina:0,mana:0,maxAp:1,atk:1,def:0,dodge:0,threat:0,abilities:[{id:"compat-strike",name:"Compatibility Strike",kind:"attack",ap:1,stamina:0,mana:0,power:1,minRange:0,maxRange:0,attackBonus:0,tags:["Physical"]}]}],
        victory:{text:"Compatibility victory.",end:"victory"},defeat:{text:"Compatibility defeat.",end:"defeat"}
      };
      return safe;
    }
    const keepId = safe.scenes[safe.startScene]?.type === "combat" ? safe.startScene : combatIds[0];
    for (const id of combatIds) if (id !== keepId) { const original=safe.scenes[id]; safe.scenes[id]={type:"ending",title:original.title||"Compatibility placeholder",outcome:"victory",text:"Compatibility validation placeholder."}; }
    return safe;
  }

  core.validateCharacter = validateCharacterWithRuntimeExtras;
  core.validateAdventure = validateAdventureWithMultipleCombats;
  core.createRun = function createRunWithMultipleCombats(mainCharacter, adventure, random = Math.random) {
    const compatibilityErrors = [...validateCharacterWithRuntimeExtras(mainCharacter), ...validateAdventureWithMultipleCombats(adventure)];
    if (compatibilityErrors.length) throw new Error(compatibilityErrors.join("\n"));
    const safeAdventure = validationSafeAdventure(adventure);
    const run = createRun(mainCharacter, safeAdventure, random);
    run.adventure = materializeAdventure(adventure, mainCharacter.name);
    return run;
  };

  if (typeof performInteraction === "function") {
    core.performInteraction = function performInteractionWithMainAlias(run, pcId, interactionId, random = Math.random) {
      const interaction = run?.combat?.interactions?.find(item => item.id === interactionId);
      if (!interaction) return performInteraction(run, pcId, interactionId, random);
      const changed = [];
      for (const effect of interaction.effects || []) if (effect.type === "move-unit" && effect.side === "pc" && effect.targetId === "$main") { changed.push(effect); effect.targetId = run.mainCharacterId; }
      try { return performInteraction(run, pcId, interactionId, random); }
      finally { for (const effect of changed) effect.targetId = "$main"; }
    };
  }
})();
