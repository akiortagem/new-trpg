"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const Core=require("../core.js");
require("../multi-combat-compat.js");
require("../optional-scene-titles.js");

function character(){
  return{schemaVersion:1,kind:"character",id:"hero",name:"Rhea",role:"Tester",attributes:{str:10,end:10,vit:10,mnd:10,agi:10,dex:10,int:10},skills:{Blades:1},combat:{hp:100,stamina:10,mana:0,inventoryPoints:3,maxAp:3,def:10,defenseBonus:20},abilities:[{id:"strike",name:"Strike",kind:"attack",ap:1,stamina:0,mana:0,power:30,minRange:0,maxRange:0,attackBonus:20,tags:["Physical"]}]};
}
function combatScene(title=null){
  return{type:"combat",title,ambush:false,battlefield:{zones:[{id:"field",name:"Field"}],links:[]},pcStarts:{$main:"field"},enemies:[{id:"foe",name:"Foe",preset:"optimal_killer",zone:"field",hp:10,maxAp:1,atk:1,def:0,dodge:0,threat:0,abilities:[{id:"tap",name:"Tap",kind:"attack",ap:1,stamina:0,mana:0,power:1,minRange:0,maxRange:0,tags:["Physical"]}]}],victory:{text:"Victory.",next:"done"},defeat:{text:"Defeat.",next:"done"}};
}
function adventure(){
  return{schemaVersion:2,kind:"adventure",id:"titleless-test",title:"Titleless Test",startScene:"start",questDays:0,initialState:{flags:{},counters:{}},clocks:{},party:[],enemies:[],scenes:{start:{type:"scene",title:"Start",text:["Start narration."],choices:[{id:"branch",label:"Continue",resolution:"automatic",reason:"Test transition.",outcome:{text:"Continue.",next:"branch"}}]},branch:{type:"scene",title:"Branch",text:["Branch narration."],choices:[{id:"finish",label:"Finish",resolution:"automatic",reason:"Test ending.",outcome:{text:"Finish.",next:"done"}}]},done:{type:"ending",title:"Done",outcome:"victory",text:"Done."}}};
}

for(const variant of ["omitted","null","blank"]){
  test(`scene titles may be ${variant}`,()=>{
    const value=adventure();
    if(variant==="omitted")delete value.scenes.branch.title;
    if(variant==="null")value.scenes.branch.title=null;
    if(variant==="blank")value.scenes.branch.title="   ";
    assert.deepEqual(Core.validateAdventure(value),[]);
  });
}

test("titleless scene transitions keep narration but suppress the title presentation event",()=>{
  const value=adventure();value.scenes.branch.title=null;
  const run=Core.createRun(character(),value,()=>0.5);Core.resolveChoice(run,"branch");
  assert.equal(run.sceneId,"branch");
  assert.equal(run.adventure.scenes.branch.title,null,"the runtime preserves the authored contract value");
  assert.ok(run.log.some(entry=>entry.type==="scene.entered.hidden"&&entry.data?.sceneId==="branch"&&entry.data?.titleless===true));
  assert.ok(!run.log.some(entry=>entry.type==="scene.entered"&&entry.data?.sceneId==="branch"));
  assert.ok(run.log.some(entry=>entry.type==="story.narration"&&entry.message==="Branch narration."));
  assert.equal(String(Core.scene(run).title),"","the renderer receives a truthy presentation title that stringifies to empty, preventing the adventure-title fallback");
});

test("titled scenes retain the existing presentation behavior",()=>{
  const run=Core.createRun(character(),adventure(),()=>0.5);Core.resolveChoice(run,"branch");
  assert.ok(run.log.some(entry=>entry.type==="scene.entered"&&entry.data?.sceneId==="branch"));
  assert.equal(Core.scene(run).title,"Branch");
});

test("a titleless starting combat removes compatibility titles from headers and logs",()=>{
  const value=adventure();value.startScene="fight";value.scenes.fight=combatScene(null);value.scenes.done.title=null;
  const run=Core.createRun(character(),value,()=>0.5);
  assert.equal(run.combat.name,"");
  assert.equal(run.combat.log.find(entry=>entry.type==="combat.started")?.message,"Combat begins. PCs act first.");
  assert.equal(run.log.find(entry=>entry.type==="combat.combat.started")?.message,"Combat begins. PCs act first.");
  assert.ok(!run.log.some(entry=>/Compatibility title for fight/.test(entry.message)),"the validation-only title never reaches exported events");
  assert.ok(run.log.some(entry=>entry.type==="scene.entered.hidden"&&entry.data?.sceneId==="fight"));
  run.combat.enemies[0].alive=false;Core.checkCombatEnd(run,()=>0.5);
  assert.equal(run.status,"victory");assert.equal(run.ending.title,null);
  assert.ok(run.log.some(entry=>entry.type==="scene.entered.hidden"&&entry.data?.sceneId==="done"));
});

test("a later titleless combat removes null from player-facing and exported combat logs",()=>{
  const value=adventure();value.scenes.start.choices[0].outcome.next="fight";value.scenes.fight=combatScene(null);
  const run=Core.createRun(character(),value,()=>0.5);Core.resolveChoice(run,"branch");
  assert.equal(run.sceneId,"fight");assert.equal(run.combat.name,"");
  assert.equal(run.combat.log.find(entry=>entry.type==="combat.started")?.message,"Combat begins. PCs act first.");
  const exportedStart=[...run.log].reverse().find(entry=>entry.type==="combat.combat.started");
  assert.equal(exportedStart?.message,"Combat begins. PCs act first.");
  assert.doesNotMatch(exportedStart?.message||"",/^null begins\./);
});

test("both browser apps load the optional-title contract layer and titleless header CSS",()=>{
  const textRoot=path.resolve(__dirname,"..");
  const authorRoot=path.resolve(textRoot,"..","adventure-author");
  const textHtml=fs.readFileSync(path.join(textRoot,"index.html"),"utf8");
  const authorHtml=fs.readFileSync(path.join(authorRoot,"index.html"),"utf8");
  const css=fs.readFileSync(path.join(textRoot,"optional-scene-titles.css"),"utf8");
  assert.match(textHtml,/optional-scene-titles\.js/);assert.match(textHtml,/optional-scene-titles\.css/);
  assert.match(authorHtml,/\.\.\/text-game\/optional-scene-titles\.js/);
  assert.match(css,/\.vn-stage-title:empty/);assert.match(css,/\.battle-head h2:empty/);assert.match(css,/\.ending h2:empty/);
});
