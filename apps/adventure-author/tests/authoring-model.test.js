"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const Model=require("../authoring-model.js");

function choice(id){return{id,label:id,resolution:"automatic",reason:"Test",outcome:{text:"Done",end:"victory"}};}

test("new adventure drafts start with a valid routable choice",()=>{
  const value=Model.createAdventureDraft("My Adventure","My Adventure",3);
  assert.equal(value.id,"my-adventure");
  assert.equal(value.startScene,"start");
  assert.equal(value.scenes.start.type,"scene");
  assert.equal(value.scenes.start.choices.length,1);
  assert.equal(value.scenes.start.choices[0].id,"continue");
  assert.equal(value.scenes.start.choices[0].outcome.end,"victory");
});

test("choice renames reject duplicate sibling ids without mutating the scene",()=>{
  const scene={type:"scene",choices:[choice("first"),choice("second")]};
  const result=Model.renameChoiceId(scene,1,"First");
  assert.equal(result.ok,false);
  assert.match(result.error,/already exists/i);
  assert.deepEqual(scene.choices.map(x=>x.id),["first","second"]);
});

test("choice renames normalize ids and allow non-colliding changes",()=>{
  const scene={type:"scene",choices:[choice("first"),choice("second")]};
  const result=Model.renameChoiceId(scene,1,"  Third Choice  ");
  assert.deepEqual(result,{ok:true,id:"third-choice",changed:true});
  assert.deepEqual(scene.choices.map(x=>x.id),["first","third-choice"]);
});

test("rally is a supported enemy ability kind with target bounds",()=>{
  assert.ok(Model.ABILITY_KINDS.includes("rally"));
  assert.equal(Model.abilityUsesTargetBounds("rally"),true);
  const ability={kind:"rally"};
  Model.ensureAbilityKindFields(ability);
  assert.equal(ability.minTargets,2);
  assert.equal(ability.maxTargets,3);
});

test("multi and persistent abilities retain their kind-specific defaults",()=>{
  const multi={kind:"multi"},persistent={kind:"persistent"};
  Model.ensureAbilityKindFields(multi);
  Model.ensureAbilityKindFields(persistent);
  assert.deepEqual({minTargets:multi.minTargets,maxTargets:multi.maxTargets},{minTargets:2,maxTargets:3});
  assert.equal(persistent.condition.id,"Persistent Damage");
});

test("advance-clock effects require an authored clock",()=>{
  const value=Model.createAdventureDraft("clock-test","Clock Test",1);
  value.scenes.start.choices[0].outcome.effects=[{type:"advance-clock",id:"clock",segments:1}];
  assert.equal(Model.canUseAdvanceClock(value),false);
  const issues=Model.clockEffectIssues(value);
  assert.equal(issues.length,1);
  assert.match(issues[0].message,/unknown clock clock/i);

  value.clocks.search={label:"Search",size:4};
  value.scenes.start.choices[0].outcome.effects[0].id="search";
  assert.equal(Model.canUseAdvanceClock(value),true);
  assert.deepEqual(Model.clockEffectIssues(value),[]);
});

test("clock effect validation also catches stale battlefield interaction references",()=>{
  const value=Model.createAdventureDraft("combat-clock","Combat Clock",1);
  value.clocks.search={label:"Search",size:4};
  value.scenes.fight={type:"combat",battlefield:{zones:[],links:[]},interactions:[{id:"lever",effects:[{type:"advance-clock",id:"old-search",segments:1}]}]};
  const issues=Model.clockEffectIssues(value);
  assert.equal(issues.length,1);
  assert.match(issues[0].message,/old-search/);
});
