(function(root,factory){
  const api=factory(root);
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.TextGameOptionalCheckTwists=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(root){
  "use strict";

  const core = root.TextGameCore;
  if (!core || typeof core.validateAdventure !== "function" || typeof core.createRun !== "function" || typeof core.resolveChoice !== "function") return {};

  const validateAdventure = core.validateAdventure;
  const createRun = core.createRun;
  const resolveChoice = core.resolveChoice;
  const resolveTwist = core.resolveTwist;
  const visibleChoices = core.visibleChoices;
  const clone = value => JSON.parse(JSON.stringify(value));
  const isObject = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const DISABLED_MARKER = "__optionalTwistDisabled";

  function hasOwn(value, key) {
    return Boolean(value) && Object.prototype.hasOwnProperty.call(value, key);
  }

  function twistMode(choice) {
    if (!isObject(choice) || choice.resolution !== "check") return "not-check";
    const hasTwist = hasOwn(choice, "twist") && choice.twist != null;
    const hasPreview = hasOwn(choice, "twistPreview") && choice.twistPreview != null;
    if (hasTwist && hasPreview) return "enabled";
    if (!hasTwist && !hasPreview) return "disabled";
    return "partial";
  }

  function optionalTwistErrors(adventure) {
    const errors = [];
    const scenes = isObject(adventure?.scenes) ? adventure.scenes : {};
    for (const [sceneId, scene] of Object.entries(scenes)) {
      if (!isObject(scene) || scene.type !== "scene" || !Array.isArray(scene.choices)) continue;
      scene.choices.forEach((choice, index) => {
        if (!isObject(choice) || choice.resolution !== "check") return;
        if (twistMode(choice) === "partial") {
          errors.push(`adventure.scenes.${sceneId}.choices[${index}]: twist and twistPreview must either both be present or both be omitted`);
        }
      });
    }
    return errors;
  }

  function validationSafeAdventure(adventure) {
    if (!isObject(adventure)) return adventure;
    const safe = clone(adventure);
    const scenes = isObject(safe.scenes) ? safe.scenes : {};
    for (const scene of Object.values(scenes)) {
      if (!isObject(scene) || scene.type !== "scene" || !Array.isArray(scene.choices)) continue;
      for (const choice of scene.choices) {
        if (!isObject(choice) || choice.resolution !== "check" || twistMode(choice) !== "disabled") continue;
        if (!isObject(choice.check)) choice.check = {};
        choice.check[DISABLED_MARKER] = true;
        choice.twistPreview = "Compatibility placeholder for an omitted Success with a Twist.";
        choice.twist = {text:"Compatibility twist placeholder.",end:"defeat"};
      }
    }
    return safe;
  }

  function removeSyntheticTwistEvents(run, choiceId) {
    if (!Array.isArray(run?.log)) return;
    run.log = run.log.filter(entry => !(
      (entry.type === "twist.offered" || entry.type === "twist.declined") && entry.data?.choiceId === choiceId
    ));
    run.log.forEach((entry, index) => { entry.sequence = index + 1; });
  }

  function disabledRuntimeChoice(choice) {
    return choice?.resolution === "check" && choice?.check?.[DISABLED_MARKER] === true;
  }

  core.validateAdventure = function validateAdventureWithOptionalTwists(adventure) {
    return [...validateAdventure(validationSafeAdventure(adventure)), ...optionalTwistErrors(adventure)];
  };

  core.createRun = function createRunWithOptionalTwists(mainCharacter, adventure, random = Math.random) {
    const pairErrors = optionalTwistErrors(adventure);
    if (pairErrors.length) throw new Error(pairErrors.join("\n"));
    return createRun(mainCharacter, validationSafeAdventure(adventure), random);
  };

  core.resolveChoice = function resolveChoiceWithOptionalTwist(run, choiceId, actorId = null, random = Math.random) {
    const choice = visibleChoices(run).find(item => item.id === choiceId);
    const disabled = disabledRuntimeChoice(choice);
    const result = resolveChoice(run, choiceId, actorId, random);
    if (!disabled || result?.result !== "failed-check" || !run.pendingTwist) return result;

    resolveTwist(run, false, random);
    removeSyntheticTwistEvents(run, choiceId);
    return {...result, result:"failure", twistOffered:false};
  };

  if (typeof document !== "undefined") {
    const decorateChoiceCards = choices => {
      queueMicrotask(() => {
        for (const choice of choices || []) {
          if (!disabledRuntimeChoice(choice)) continue;
          const button = document.querySelector(`[data-choice="${CSS.escape(choice.id)}"]`);
          const mechanics = button?.closest?.(".choice-card")?.querySelector?.(".mechanics");
          if (!mechanics) continue;
          mechanics.innerHTML = mechanics.innerHTML.replace(
            "Failure may be exchanged for a vaguely disclosed twist.",
            "Failure uses the authored failed result."
          );
        }
      });
    };
    core.visibleChoices = function visibleChoicesWithOptionalTwistPresentation(run) {
      const choices = visibleChoices(run);
      decorateChoiceCards(choices);
      return choices;
    };
  }

  return {
    twistMode,
    optionalTwistErrors,
    validationSafeAdventure,
    disabledRuntimeChoice,
    removeSyntheticTwistEvents,
    marker:DISABLED_MARKER
  };
});
