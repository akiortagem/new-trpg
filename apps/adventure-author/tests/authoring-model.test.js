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

test("wizard draft validation rejects missing required fields and negative days",()=>{
  assert.deepEqual(Model.validateWizardDraftInput("adventure","Title",0),[]);
  assert.ok(Model.validateWizardDraftInput("","Title",1).some(x=>/id is required/i.test(x)));
  assert.ok(Model.validateWizardDraftInput("adventure","",1).some(x=>/title is required/i.test(x)));
  assert.ok(Model.validateWizardDraftInput("adventure","Title",-1).some(x=>/0 or greater/i.test(x)));
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

test("battlefield links can be corrected and removed through model helpers",()=>{
  const scene={battlefield:{links:[{from:"road",to:"ridge",cost:1},{from:"ridge",to:"camp",cost:2}]}};
  assert.equal(Model.updateBattlefieldLink(scene,0,{cost:3}).ok,true);
  assert.equal(scene.battlefield.links[0].cost,3);
  const invalid=Model.updateBattlefieldLink(scene,0,{cost:0});
  assert.equal(invalid.ok,false);
  assert.equal(scene.battlefield.links[0].cost,3);
  const removed=Model.removeBattlefieldLink(scene,0);
  assert.equal(removed.ok,true);
  assert.deepEqual(scene.battlefield.links,[{from:"ridge",to:"camp",cost:2}]);
});

test("openable shape validation rejects containers that would crash structured rendering",()=>{
  const value=Model.createAdventureDraft("shape-test","Shape Test",1);
  assert.deepEqual(Model.openableShapeIssues(value),[]);
  value.party={};
  assert.ok(Model.openableShapeIssues(value).some(x=>/party must be an array/i.test(x)));
  value.party=[];
  value.scenes.start.choices={};
  assert.ok(Model.openableShapeIssues(value).some(x=>/choices must be an array/i.test(x)));
});

test("add effects require finite numeric values",()=>{
  const value=Model.createAdventureDraft("add-test","Add Test",1);
  value.scenes.start.choices[0].outcome.effects=[{type:"add",path:"quest.elapsedDays",value:"one"}];
  assert.equal(Model.numericAddEffectIssues(value).length,1);
  assert.deepEqual(Model.parseAddEffectValue("2"),{ok:true,value:2});
  assert.equal(Model.parseAddEffectValue("one").ok,false);
  value.scenes.start.choices[0].outcome.effects[0].value=2;
  assert.deepEqual(Model.numericAddEffectIssues(value),[]);
});
