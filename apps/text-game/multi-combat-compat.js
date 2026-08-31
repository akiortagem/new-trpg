(() => {
  "use strict";

  const core = globalThis.TextGameCore;
  if (!core || typeof core.validateAdventure !== "function") return;

  const validateAdventure = core.validateAdventure;
  core.validateAdventure = function validateAdventureWithMultipleCombats(adventure) {
    return validateAdventure(adventure).filter(
      issue => issue !== "adventure.scenes: must contain exactly one combat scene"
    );
  };
})();
