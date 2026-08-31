(() => {
  "use strict";

  const core = globalThis.TextGameCore;
  if (!core || typeof core.validateAdventure !== "function" || typeof core.createRun !== "function") return;

  const validateAdventure = core.validateAdventure;
  const createRun = core.createRun;
  const performInteraction = core.performInteraction;
  const combatCountIssue = "adventure.scenes: must contain exactly one combat scene";
  const templateTextKeys = new Set(["title","text","speaker","label","description","reason","goal","approach","name","role","expression","twistPreview"]);
  const writableRoots = new Set(["flags","counters","quest","clocks"]);
  const unsafePathSegments = new Set(["__proto__","constructor","prototype"]);
  const outcomeEffectTypes = new Set(["set","add","advance-clock"]);
  const interactionEffectTypes = new Set([...outcomeEffectTypes,"damage-enemy","condition-enemy","move-unit"]);
  const clone = value => JSON.parse(JSON.stringify(value));

  function materializeAdventure(value, mainName, key = null) {
    if (typeof value === "string") return templateTextKeys.has(key) ? value.replace(/\{\{\s*main\.name\s*\}\}/g, () => mainName) : value;
    if (Array.isArray(value)) return value.map(item => materializeAdventure(item, mainName, key));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, item]) => [childKey, materializeAdventure(item, mainName, childKey)]));
    return value;
  }

  function validateStateEffectPath(effect, path, issues) {
    if (effect.type !== "set" && effect.type !== "add") return;
    if (typeof effect.path !== "string" || !effect.path.trim()) {
      issues.push(`${path}.path: ${effect.type} effects require a writable state path`);
      return;
    }
    const parts = effect.path.split(".");
    if (!writableRoots.has(parts[0]) || parts.some(part => unsafePathSegments.has(part))) {
      issues.push(`${path}.path: unsafe or unsupported state effect path ${effect.path}`);
    }
  }

  function validateEffect(effect, path, allowedTypes, validClocks, issues) {
    if (!effect || typeof effect !== "object" || Array.isArray(effect)) {
      issues.push(`${path}: effect must be an object`);
      return;
    }
    if (!allowedTypes.has(effect.type)) {
      const type = typeof effect.type === "string" && effect.type ? effect.type : "(missing)";
      issues.push(`${path}.type: effect type ${type} is not allowed in this container`);
      return;
    }
    validateStateEffectPath(effect, path, issues);
    if (effect.type === "advance-clock") {
      if (!validClocks.has(effect.id)) issues.push(`${path}.id: unknown progress clock ${effect.id || "(missing)"}`);
      if (effect.segments != null && (typeof effect.segments !== "number" || !Number.isFinite(effect.segments))) {
        issues.push(`${path}.segments: advance-clock segments must be a finite numeric value`);
      }
    }
    if (effect.type === "add" && (typeof effect.value !== "number" || !Number.isFinite(effect.value))) {
      issues.push(`${path}.value: add effects require a finite numeric value`);
    }
  }

  function validateEffects(effects, path, allowedTypes, validClocks, issues) {
    if (effects == null) return;
    if (!Array.isArray(effects)) return;
    effects.forEach((effect, index) => validateEffect(effect, `${path}[${index}]`, allowedTypes, validClocks, issues));
  }

  function validateOutcomeEffects(outcome, path, validClocks, issues) {
    if (!outcome || typeof outcome !== "object" || Array.isArray(outcome)) return;
    validateEffects(outcome.effects, `${path}.effects`, outcomeEffectTypes, validClocks, issues);
  }

  function validateExtraEffects(adventure) {
    const validClocks = new Set(Object.keys(adventure?.clocks || {}));
    const issues = [];
    for (const [sceneId, scene] of Object.entries(adventure?.scenes || {})) {
      const scenePath = `adventure.scenes.${sceneId}`;
      if (!scene || typeof scene !== "object" || Array.isArray(scene)) continue;
      if (scene.type === "scene") {
        for (const [choiceIndex, choice] of (scene.choices || []).entries()) {
          if (!choice || typeof choice !== "object" || Array.isArray(choice)) continue;
          const choicePath = `${scenePath}.choices[${choiceIndex}]`;
          if (choice.resolution === "automatic") validateOutcomeEffects(choice.outcome, `${choicePath}.outcome`, validClocks, issues);
          if (choice.resolution === "check") {
            validateOutcomeEffects(choice.success, `${choicePath}.success`, validClocks, issues);
            validateOutcomeEffects(choice.failure, `${choicePath}.failure`, validClocks, issues);
            validateOutcomeEffects(choice.twist, `${choicePath}.twist`, validClocks, issues);
          }
        }
      }
      if (scene.type === "combat") {
        validateOutcomeEffects(scene.victory, `${scenePath}.victory`, validClocks, issues);
        validateOutcomeEffects(scene.defeat, `${scenePath}.defeat`, validClocks, issues);
        for (const [interactionIndex, interaction] of (scene.interactions || []).entries()) {
          if (!interaction || typeof interaction !== "object" || Array.isArray(interaction)) continue;
          validateEffects(interaction.effects, `${scenePath}.interactions[${interactionIndex}].effects`, interactionEffectTypes, validClocks, issues);
        }
      }
    }
    return issues;
  }

  function validateAdventureWithMultipleCombats(adventure) {
    return [
      ...validateAdventure(adventure).filter(issue => issue !== combatCountIssue),
      ...validateExtraEffects(adventure)
    ];
  }

  function validationSafeAdventure(adventure) {
    const safe = clone(adventure);
    const entries = Object.entries(safe.scenes || {});
    const combatIds = entries.filter(([, scene]) => scene.type === "combat").map(([id]) => id);
    if (combatIds.length === 1) return safe;

    if (combatIds.length === 0) {
      const usedIds = new Set(Object.keys(safe.scenes || {}));
      let id = "__compat_validation_combat__";
      let suffix = 2;
      while (usedIds.has(id)) id = `__compat_validation_combat__${suffix++}`;
      const companionIds = (safe.party || []).map(character => character.id);
      safe.scenes[id] = {
        type: "combat",
        title: "Compatibility validation combat",
        ambush: false,
        battlefield: { zones: [{ id: "compat-zone", name: "Compatibility Zone" }], links: [] },
        pcStarts: Object.fromEntries(["$main", ...companionIds].map(characterId => [characterId, "compat-zone"])),
        enemies: [{
          id: "compat-enemy",
          name: "Compatibility Enemy",
          preset: "optimal_killer",
          zone: "compat-zone",
          hp: 1,
          maxAp: 1,
          atk: 1,
          def: 0,
          dodge: 0,
          threat: 0,
          abilities: [{ id: "compat-strike", name: "Compatibility Strike", kind: "attack", ap: 1, stamina: 0, mana: 0, power: 1, minRange: 0, maxRange: 0, tags: ["Physical"] }]
        }],
        victory: { text: "Compatibility victory.", end: "victory" },
        defeat: { text: "Compatibility defeat.", end: "defeat" }
      };
      return safe;
    }

    const keepId = safe.scenes[safe.startScene]?.type === "combat" ? safe.startScene : combatIds[0];
    for (const id of combatIds) {
      if (id === keepId) continue;
      const original = safe.scenes[id];
      safe.scenes[id] = {
        type: "ending",
        title: original.title || "Compatibility placeholder",
        outcome: "victory",
        text: "Compatibility validation placeholder."
      };
    }
    return safe;
  }

  core.validateAdventure = validateAdventureWithMultipleCombats;
  core.createRun = function createRunWithMultipleCombats(mainCharacter, adventure, random = Math.random) {
    const compatibilityErrors = validateAdventureWithMultipleCombats(adventure);
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
      for (const effect of interaction.effects || []) {
        if (effect.type === "move-unit" && effect.side === "pc" && effect.targetId === "$main") {
          changed.push(effect);
          effect.targetId = run.mainCharacterId;
        }
      }
      try {
        return performInteraction(run, pcId, interactionId, random);
      } finally {
        for (const effect of changed) effect.targetId = "$main";
      }
    };
  }
})();
