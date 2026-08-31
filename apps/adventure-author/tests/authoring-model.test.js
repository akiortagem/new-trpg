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
