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
