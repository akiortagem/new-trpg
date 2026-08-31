"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const Core=require("../../text-game/core.js");
globalThis.TextGameCore=Core;
require("../../text-game/multi-combat-compat.js");
const Model=require("../authoring-model.js");

function character(){
  return {schemaVersion:1,kind:"character",id:"hero",name:"Hero",role:"Tester",attributes:{str:10,end:10,vit:10,mnd:10,agi:10,dex:10,int:10},skills:{Awareness:1},combat:{hp:100,stamina:10,mana:10,inventoryPoints:3,maxAp:3,def:10,defenseBonus:20},abilities:[{id:"strike",name:"Strike",kind:"attack",ap:1,stamina:0,mana:0,power:30,minRange:0,maxRange:0,attackBonus:20,tags:["Physical"]}]};
}

function enemy(id,zone){
  return {id,name:id,preset:"optimal_killer",zone,hp:50,stamina:0,mana:0,maxAp:1,atk:20,def:0,dodge:10,threat:10,abilities:[{id:"strike",name:"Strike",kind:"attack",ap:1,stamina:0,mana:0,power:20,minRange:0,maxRange:0,attackBonus:10,tags:["Physical"]}]};
}

function combat(id){
  const zone=`${id}-zone`;
  return {type:"combat",title:id,ambush:false,battlefield:{zones:[{id:zone,name:"Zone"}],links:[]},pcStarts:{$main:zone},enemies:[enemy(`${id}-enemy`,zone)],interactions:[],victory:{text:"Victory",end:"victory"},defeat:{text:"Defeat",end:"defeat"}};
}

test("wizard-created zero-combat draft validates and starts through compatibility runtime",()=>{
  const value=Model.createAdventureDraft("new-adventure","New Adventure",3);
  assert.deepEqual(Core.validateAdventure(value),[]);
  const run=Core.createRun(character(),value,()=>0.5);
  assert.equal(run.sceneId,"start");
  assert.equal(Core.visibleChoices(run)[0].id,"continue");
  Core.resolveChoice(run,"continue");
  assert.equal(run.status,"victory");
});

test("compatibility runtime accepts multiple authored combat scenes",()=>{
  const value=Model.createAdventureDraft("two-fights","Two Fights",1);
  value.scenes.start.choices[0].outcome={text:"Fight",next:"fight-one"};
  value.scenes["fight-one"]=combat("fight-one");
  value.scenes["fight-two"]=combat("fight-two");
  assert.deepEqual(Core.validateAdventure(value),[]);
  assert.doesNotThrow(()=>Core.createRun(character(),value,()=>0.5));
});

test("runtime validation rejects advance-clock outcomes that reference no authored clock",()=>{
  const value=Model.createAdventureDraft("bad-clock","Bad Clock",1);
  value.scenes.start.choices[0].outcome.effects=[{type:"advance-clock",id:"clock",segments:1}];
  const errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("unknown progress clock clock")));
  assert.throws(()=>Core.createRun(character(),value,()=>0.5),/unknown progress clock clock/);
});

test("runtime validation rejects nonnumeric advance-clock segment counts",()=>{
  const value=Model.createAdventureDraft("bad-segments","Bad Segments",1);
  value.clocks.search={label:"Search",size:4};
  value.scenes.start.choices[0].outcome.effects=[{type:"advance-clock",id:"search",segments:"two"}];
  let errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("advance-clock segments must be a finite numeric value")));
  assert.throws(()=>Core.createRun(character(),value,()=>0.5),/advance-clock segments must be a finite numeric value/);
  value.scenes.start.choices[0].outcome.effects[0].segments=2;
  errors=Core.validateAdventure(value);
  assert.deepEqual(errors,[]);
});

test("runtime validation rejects stale advance-clock interaction references",()=>{
  const value=Model.createAdventureDraft("interaction-clock","Interaction Clock",1);
  value.clocks.search={label:"Search",size:4};
  value.scenes.start.choices[0].outcome={text:"Fight",next:"fight"};
  value.scenes.fight=combat("fight");
  value.scenes.fight.interactions=[{id:"lever",name:"Lever",description:"Pull it",text:"It moves",zone:"fight-zone",ap:1,once:true,effects:[{type:"advance-clock",id:"old-search",segments:1}]}];
  const errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("unknown progress clock old-search")));
  assert.throws(()=>Core.createRun(character(),value,()=>0.5),/unknown progress clock old-search/);
});

test("runtime validation rejects nonnumeric add effects",()=>{
  const value=Model.createAdventureDraft("bad-add","Bad Add",1);
  value.scenes.start.choices[0].outcome.effects=[{type:"add",path:"quest.elapsedDays",value:"one"}];
  const errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("add effects require a finite numeric value")));
  assert.throws(()=>Core.createRun(character(),value,()=>0.5),/add effects require a finite numeric value/);
});

test("runtime validation rejects unsafe or unsupported state effect paths",()=>{
  const value=Model.createAdventureDraft("bad-path","Bad Path",1);
  value.scenes.start.choices[0].outcome.effects=[{type:"set",path:"bogus.value",value:true}];
  let errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("unsafe or unsupported state effect path bogus.value")));
  assert.throws(()=>Core.createRun(character(),value,()=>0.5),/unsafe or unsupported state effect path bogus\.value/);

  value.scenes.start.choices[0].outcome.effects=[{type:"add",path:"flags.__proto__.count",value:1}];
  errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("unsafe or unsupported state effect path flags.__proto__.count")));
  assert.throws(()=>Core.createRun(character(),value,()=>0.5),/unsafe or unsupported state effect path flags\.__proto__\.count/);
});

test("runtime validation rejects combat-only effects in ordinary outcomes",()=>{
  const value=Model.createAdventureDraft("bad-placement","Bad Placement",1);
  value.scenes.start.choices[0].outcome.effects=[{type:"damage-enemy",targetId:"enemy",amount:10}];
  const errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("effect type damage-enemy is not allowed in this container")));
  assert.throws(()=>Core.createRun(character(),value,()=>0.5),/effect type damage-enemy is not allowed in this container/);
});

test("runtime validation rejects unknown interaction effects but accepts supported combat effects",()=>{
  const value=Model.createAdventureDraft("interaction-effects","Interaction Effects",1);
  value.scenes.start.choices[0].outcome={text:"Fight",next:"fight"};
  value.scenes.fight=combat("fight");
  value.scenes.fight.interactions=[{id:"trap",name:"Trap",description:"A trap",text:"It fires",zone:"fight-zone",ap:1,once:true,effects:[{type:"damage-enemy",targetId:"fight-enemy",amount:10}]}];
  assert.deepEqual(Core.validateAdventure(value),[]);
  value.scenes.fight.interactions[0].effects=[{type:"damge-enemy",targetId:"fight-enemy",amount:10}];
  const errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("effect type damge-enemy is not allowed in this container")));
  assert.throws(()=>Core.createRun(character(),value,()=>0.5),/effect type damge-enemy is not allowed in this container/);
});

test("move-unit interactions resolve the $main alias to the selected main character",()=>{
  const value=Model.createAdventureDraft("move-main","Move Main",1);
  value.scenes.start.choices[0].outcome={text:"Fight",next:"fight"};
  value.scenes.fight=combat("fight");
  value.scenes.fight.battlefield.zones.push({id:"other-zone",name:"Other Zone"});
  value.scenes.fight.battlefield.links.push({from:"fight-zone",to:"other-zone",cost:1});
  value.scenes.fight.interactions=[{id:"portal",name:"Portal",description:"Step through",text:"The portal moves you.",zone:"fight-zone",ap:1,once:true,effects:[{type:"move-unit",side:"pc",targetId:"$main",zone:"other-zone"}]}];
  const run=Core.createRun(character(),value,()=>0.5);
  Core.resolveChoice(run,"continue",null,()=>0.5);
  assert.ok(run.combat);
  const hero=run.combat.pcs.find(pc=>pc.id==="hero");
  assert.equal(hero.zone,"fight-zone");
  Core.performInteraction(run,"hero","portal",()=>0.5);
  assert.equal(hero.zone,"other-zone");
  assert.equal(run.combat.interactions[0].effects[0].targetId,"$main");
});
