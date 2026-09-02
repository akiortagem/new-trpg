(() => {
  "use strict";

  const core = globalThis.TextGameCore;
  if (!core || typeof core.validateAdventure !== "function" || typeof core.createRun !== "function" || typeof core.scene !== "function") return;

  const validateAdventure = core.validateAdventure;
  const createRun = core.createRun;
  const scene = core.scene;
  const templateTextKeys = new Set(["title","text","speaker","label","description","reason","goal","approach","name","role","expression","twistPreview"]);
  const runMutators = [
    "resolveChoice","resolveTwist","beginPcTurn","resolveRallySustain","movePc","abandonTransit",
    "performPcAbility","useConsumable","recover","performInteraction","prepare","endPcTurn","useCritical",
    "resolveReaction","resolvePrepared","continueEnemyPhase","checkCombatEnd"
  ];
  const blankPresentationTitle = Object.freeze({toString: () => ""});
  const clone = value => JSON.parse(JSON.stringify(value));
  const isObject = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);

  function isTitleless(value) {
    return value == null || (typeof value === "string" && !value.trim());
  }

  function shouldShowTitle(sceneValue) {
    return Boolean(sceneValue) && sceneValue.showTitle !== false && !isTitleless(sceneValue.title);
  }

  function titleVisibilityErrors(adventure) {
    const errors = [];
    for (const [sceneId, sceneValue] of Object.entries(isObject(adventure?.scenes) ? adventure.scenes : {})) {
      if (!isObject(sceneValue) || sceneValue.showTitle === undefined) continue;
      if (typeof sceneValue.showTitle !== "boolean") errors.push(`adventure.scenes.${sceneId}.showTitle: must be a boolean when present`);
    }
    return errors;
  }

  function materializeAdventure(value, mainName, key = null) {
    if (typeof value === "string") return templateTextKeys.has(key) ? value.replace(/\{\{\s*main\.name\s*\}\}/g, () => mainName) : value;
    if (Array.isArray(value)) return value.map(item => materializeAdventure(item, mainName, key));
    if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([childKey, item]) => [childKey, materializeAdventure(item, mainName, childKey)]));
    return value;
  }

  function validationSafeAdventure(adventure) {
    if (!isObject(adventure)) return adventure;
    const safe = clone(adventure);
    for (const [sceneId, sceneValue] of Object.entries(isObject(safe.scenes) ? safe.scenes : {})) {
      if (isObject(sceneValue) && isTitleless(sceneValue.title)) sceneValue.title = `Compatibility title for ${sceneId}`;
    }
    return safe;
  }

  function hiddenTitleData(entry, current) {
    return {
      ...(entry?.data || {}),
      titleHidden:true,
      ...(isTitleless(current?.title) ? {titleless:true} : {})
    };
  }

  function scrubHiddenCombatTitle(run) {
    const combat = run?.combat;
    const current = combat?.sceneId ? run.adventure?.scenes?.[combat.sceneId] : null;
    if (!combat || !current || shouldShowTitle(current)) return;

    combat.name = "";
    const message = `Combat begins. ${combat.ambush ? "Enemies" : "PCs"} act first.`;
    for (const entry of combat.log || []) {
      if (entry?.type !== "combat.started") continue;
      entry.message = message;
      entry.data = hiddenTitleData(entry, current);
    }

    const runEntry = [...(run.log || [])].reverse().find(entry => entry?.type === "combat.combat.started");
    if (runEntry) {
      runEntry.message = message;
      runEntry.data = {...hiddenTitleData(runEntry, current), sceneId:combat.sceneId};
    }
  }

  function suppressHiddenSceneEntries(run) {
    if (!run || !Array.isArray(run.log) || !isObject(run.adventure?.scenes)) return run;
    scrubHiddenCombatTitle(run);
    for (const entry of run.log) {
      if (entry?.type !== "scene.entered") continue;
      const sceneId = entry.data?.sceneId;
      const current = sceneId ? run.adventure.scenes[sceneId] : null;
      if (!current || shouldShowTitle(current)) continue;
      entry.type = "scene.entered.hidden";
      entry.message = `Entered ${sceneId}.`;
      entry.data = hiddenTitleData(entry, current);
    }
    return run;
  }

  function restoreRuntimeTitles(run, adventure, mainName) {
    run.adventure = materializeAdventure(adventure, mainName);
    const current = run.adventure?.scenes?.[run.sceneId];
    if (run.ending && current && !shouldShowTitle(current)) run.ending.title = null;
    return suppressHiddenSceneEntries(run);
  }

  core.validateAdventure = function validateAdventureWithOptionalSceneTitles(adventure) {
    return [...validateAdventure(validationSafeAdventure(adventure)), ...titleVisibilityErrors(adventure)];
  };

  core.createRun = function createRunWithOptionalSceneTitles(mainCharacter, adventure, random = Math.random) {
    const run = createRun(mainCharacter, validationSafeAdventure(adventure), random);
    return restoreRuntimeTitles(run, adventure, mainCharacter.name);
  };

  core.scene = function currentSceneWithOptionalTitle(run) {
    const current = scene(run);
    if (!current || shouldShowTitle(current)) return current;
    return {...current, title:blankPresentationTitle};
  };

  for (const name of runMutators) {
    const original = core[name];
    if (typeof original !== "function") continue;
    core[name] = function titleVisibilityAwareMutation(run, ...args) {
      const result = original(run, ...args);
      suppressHiddenSceneEntries(run);
      return result;
    };
  }

  globalThis.TextGameOptionalSceneTitles = {
    isTitleless,
    shouldShowTitle,
    suppressHiddenSceneEntries,
    scrubHiddenCombatTitle,
    suppressTitlelessSceneEntries:suppressHiddenSceneEntries,
    scrubTitlelessCombatStart:scrubHiddenCombatTitle
  };
})();
