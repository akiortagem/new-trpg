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

function combat(){
  return {type:"combat",title:"Fight",ambush:false,battlefield:{zones:[{id:"zone",name:"Zone"}],links:[]},pcStarts:{$main:"zone"},enemies:[enemy("enemy","zone")],interactions:[],victory:{text:"Victory",end:"victory"},defeat:{text:"Defeat",end:"defeat"}};
}

function adventure(){
  const value=Model.createAdventureDraft("hardening","Hardening",1);
  value.scenes.start.choices[0].outcome={text:"Fight",next:"fight"};
  value.scenes.fight=combat();
  return value;
}

test("advance-clock segments must be positive whole numbers",()=>{
  const value=Model.createAdventureDraft("clock","Clock",1);
  value.clocks.search={label:"Search",size:4};
  for(const segments of [0,-1,1.5,"two"]){
    value.scenes.start.choices[0].outcome.effects=[{type:"advance-clock",id:"search",segments}];
    assert.ok(Core.validateAdventure(value).some(error=>error.includes("positive whole number")));
  }
  value.scenes.start.choices[0].outcome.effects=[{type:"advance-clock",id:"search",segments:2}];
  assert.deepEqual(Core.validateAdventure(value),[]);
});

test("interaction damage cannot heal through negative amounts",()=>{
  const value=adventure();
  value.scenes.fight.interactions=[{id:"trap",name:"Trap",text:"Trap",zone:"zone",ap:1,effects:[{type:"damage-enemy",targetId:"enemy",amount:-10}]}];
  assert.ok(Core.validateAdventure(value).some(error=>error.includes("damage-enemy amount must be a nonnegative finite number")));
  value.scenes.fight.interactions[0].effects[0]={type:"damage-enemy",targetId:"missing",amount:10};
  assert.ok(Core.validateAdventure(value).some(error=>error.includes("unknown enemy missing")));
});

test("persistent condition amounts cannot become healing",()=>{
  const value=adventure();
  value.scenes.fight.interactions=[{id:"fire",name:"Fire",text:"Burn",zone:"zone",ap:1,effects:[{type:"condition-enemy",targetId:"enemy",condition:{id:"Persistent Damage",amount:-5}}]}];
  assert.ok(Core.validateAdventure(value).some(error=>error.includes("condition.amount")&&error.includes("nonnegative")));
});

test("check modifiers and numeric visibility comparisons require numeric values",()=>{
  const value=Model.createAdventureDraft("check","Check",1);
  value.scenes.start.choices=[{id:"check",label:"Check",resolution:"check",actor:{mode:"select",eligible:["*"]},check:{goal:"Goal",approach:"Approach",baseTN:40,attributes:["int","dex"],skill:"Awareness",situationalModifiers:[{label:"Bad",value:"five"}]},when:{all:[{path:"quest.elapsedDays",gte:"one"}]},success:{text:"Success",end:"victory"},failure:{text:"Failure",end:"defeat"},twistPreview:"Twist",twist:{text:"Twist",end:"victory"}}];
  const errors=Core.validateAdventure(value);
  assert.ok(errors.some(error=>error.includes("situationalModifiers[0].value")));
  assert.ok(errors.some(error=>error.includes(".gte: must be a finite number")));
});

test("runtime character validation rejects malformed combat payloads",()=>{
  const main=character();
  main.abilities[0].tags={Physical:true};
  assert.ok(Core.validateCharacter(main).some(error=>error.includes("tags: must be an array")));
  main.abilities[0].tags=["Physical"];
  main.abilities[0].condition={id:"Persistent Damage",amount:-1};
  assert.ok(Core.validateCharacter(main).some(error=>error.includes("condition.amount")));
});

test("adventure-level numeric invariants are validated",()=>{
  const value=Model.createAdventureDraft("days","Days",1);
  value.questDays=-1;
  assert.ok(Core.validateAdventure(value).some(error=>error.includes("questDays")));
  value.questDays=1;
  value.clocks.search={label:"Search",size:4,filled:5};
  assert.ok(Core.validateAdventure(value).some(error=>error.includes("clocks.search.filled")));
});
