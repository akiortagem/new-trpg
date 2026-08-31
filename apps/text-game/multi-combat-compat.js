(() => {
  "use strict";

  const core = globalThis.TextGameCore;
  if (!core || typeof core.validateAdventure !== "function" || typeof core.createRun !== "function") return;

  const validateAdventure = core.validateAdventure;
  const createRun = core.createRun;
  const combatCountIssue = "adventure.scenes: must contain exactly one combat scene";
  const templateTextKeys = new Set(["title","text","speaker","label","description","reason","goal","approach","name","role","expression","twistPreview"]);
  const clone = value => JSON.parse(JSON.stringify(value));

  function materializeAdventure(value, mainName, key = null) {
    if (typeof value === "string") return templateTextKeys.has(key) ? value.replace(/\{\{\s*main\.name\s*\}\}/g, () => mainName) : value;
    if (Array.isArray(value)) return value.map(item => materializeAdventure(item, mainName, key));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, item]) => [childKey, materializeAdventure(item, mainName, childKey)]));
    return value;
  }

  function validateAdventureWithMultipleCombats(adventure) {
    return validateAdventure(adventure).filter(issue => issue !== combatCountIssue);
  }

  function validationSafeAdventure(adventure) {
    const safe = clone(adventure);
    const entries = Object.entries(safe.scenes || {});
    const combatIds = entries.filter(([, scene]) => scene.type === "combat").map(([id]) => id);
    if (combatIds.length === 1) return safe;

    if (combatIds.length === 0) {
      const id = "__compat_validation_combat__";
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
})();
