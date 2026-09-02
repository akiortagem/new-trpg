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

test("showTitle is optional and defaults to true",()=>{
  const value=adventure();
  assert.deepEqual(Core.validateAdventure(value),[]);
  const run=Core.createRun(character(),value,()=>0.5);Core.resolveChoice(run,"branch");
  assert.ok(run.log.some(entry=>entry.type==="scene.entered"&&entry.data?.sceneId==="branch"));
  assert.equal(Core.scene(run).title,"Branch");
});

test("showTitle accepts booleans and rejects other present values",()=>{
  const visible=adventure();visible.scenes.branch.showTitle=true;
  const hidden=adventure();hidden.scenes.branch.showTitle=false;
  assert.deepEqual(Core.validateAdventure(visible),[]);assert.deepEqual(Core.validateAdventure(hidden),[]);
  for(const invalid of [null,"false",0,{}]){
    const value=adventure();value.scenes.branch.showTitle=invalid;
    assert.ok(Core.validateAdventure(value).some(error=>error.includes("adventure.scenes.branch.showTitle: must be a boolean when present")));
  }
});

test("showTitle false preserves the editor title but suppresses ordinary scene presentation",()=>{
  const value=adventure();value.scenes.branch.showTitle=false;
  const run=Core.createRun(character(),value,()=>0.5);Core.resolveChoice(run,"branch");
  assert.equal(run.sceneId,"branch");
  assert.equal(run.adventure.scenes.branch.title,"Branch","the authored title remains available as editor metadata");
  assert.equal(run.adventure.scenes.branch.showTitle,false);
  assert.ok(run.log.some(entry=>entry.type==="scene.entered.hidden"&&entry.data?.sceneId==="branch"&&entry.data?.titleHidden===true&&entry.data?.titleless!==true));
  assert.ok(!run.log.some(entry=>entry.type==="scene.entered"&&entry.data?.sceneId==="branch"));
  assert.ok(run.log.some(entry=>entry.type==="story.narration"&&entry.message==="Branch narration."));
  assert.equal(String(Core.scene(run).title),"","the renderer receives no player-facing title despite the authored title remaining intact");
});

test("showTitle false clears a titled ending reached through an ordinary choice",()=>{
  const value=adventure();value.scenes.done.showTitle=false;
  const run=Core.createRun(character(),value,()=>0.5);
  Core.resolveChoice(run,"branch");Core.resolveChoice(run,"finish");
  assert.equal(run.sceneId,"done");assert.equal(run.status,"victory");
  assert.equal(run.adventure.scenes.done.title,"Done","the authored ending title remains in adventure data");
  assert.equal(run.ending.title,null,"the player-facing ending title is cleared after the transition");
  assert.ok(run.log.some(entry=>entry.type==="scene.entered.hidden"&&entry.data?.sceneId==="done"&&entry.data?.titleHidden===true));
});

test("titleless scene transitions remain backward-compatible",()=>{
  const value=adventure();value.scenes.branch.title=null;
  const run=Core.createRun(character(),value,()=>0.5);Core.resolveChoice(run,"branch");
  assert.equal(run.adventure.scenes.branch.title,null);
  assert.ok(run.log.some(entry=>entry.type==="scene.entered.hidden"&&entry.data?.sceneId==="branch"&&entry.data?.titleless===true&&entry.data?.titleHidden===true));
  assert.ok(!run.log.some(entry=>entry.type==="scene.entered"&&entry.data?.sceneId==="branch"));
  assert.equal(String(Core.scene(run).title),"");
});

test("showTitle false suppresses a titled starting combat and titled ending without deleting either title",()=>{
  const value=adventure();value.startScene="fight";value.scenes.fight=combatScene("Bridge Ambush");value.scenes.fight.showTitle=false;value.scenes.done.showTitle=false;
  const run=Core.createRun(character(),value,()=>0.5);
  assert.equal(run.adventure.scenes.fight.title,"Bridge Ambush");assert.equal(run.combat.name,"");
  assert.equal(run.combat.log.find(entry=>entry.type==="combat.started")?.message,"Combat begins. PCs act first.");
  assert.equal(run.log.find(entry=>entry.type==="combat.combat.started")?.message,"Combat begins. PCs act first.");
  assert.ok(!run.log.some(entry=>entry.message.includes("Bridge Ambush")),"hidden combat titles do not leak into exported events");
  assert.ok(run.log.some(entry=>entry.type==="scene.entered.hidden"&&entry.data?.sceneId==="fight"&&entry.data?.titleHidden===true));
  run.combat.enemies[0].alive=false;Core.checkCombatEnd(run,()=>0.5);
  assert.equal(run.status,"victory");assert.equal(run.adventure.scenes.done.title,"Done");assert.equal(run.ending.title,null);
  assert.ok(run.log.some(entry=>entry.type==="scene.entered.hidden"&&entry.data?.sceneId==="done"&&entry.data?.titleHidden===true));
});

test("showTitle false also suppresses a titled combat entered later",()=>{
  const value=adventure();value.scenes.start.choices[0].outcome.next="fight";value.scenes.fight=combatScene("Lower Gate");value.scenes.fight.showTitle=false;
  const run=Core.createRun(character(),value,()=>0.5);Core.resolveChoice(run,"branch");
  assert.equal(run.sceneId,"fight");assert.equal(run.adventure.scenes.fight.title,"Lower Gate");assert.equal(run.combat.name,"");
  assert.equal(run.combat.log.find(entry=>entry.type==="combat.started")?.message,"Combat begins. PCs act first.");
  const exportedStart=[...run.log].reverse().find(entry=>entry.type==="combat.combat.started");
  assert.equal(exportedStart?.message,"Combat begins. PCs act first.");
  assert.ok(!run.log.some(entry=>entry.message.includes("Lower Gate")));
});

test("titleless starting combat still removes compatibility titles from headers and logs",()=>{
  const value=adventure();value.startScene="fight";value.scenes.fight=combatScene(null);value.scenes.done.title=null;
  const run=Core.createRun(character(),value,()=>0.5);
  assert.equal(run.combat.name,"");
  assert.equal(run.combat.log.find(entry=>entry.type==="combat.started")?.message,"Combat begins. PCs act first.");
  assert.equal(run.log.find(entry=>entry.type==="combat.combat.started")?.message,"Combat begins. PCs act first.");
  assert.ok(!run.log.some(entry=>/Compatibility title for fight/.test(entry.message)));
  run.combat.enemies[0].alive=false;Core.checkCombatEnd(run,()=>0.5);
  assert.equal(run.status,"victory");assert.equal(run.ending.title,null);
});

test("browser apps expose title visibility while keeping graph labels independent",()=>{
  const textRoot=path.resolve(__dirname,"..");
  const authorRoot=path.resolve(textRoot,"..","adventure-author");
  const textHtml=fs.readFileSync(path.join(textRoot,"index.html"),"utf8");
  const authorHtml=fs.readFileSync(path.join(authorRoot,"index.html"),"utf8");
  const authorApp=fs.readFileSync(path.join(authorRoot,"app.js"),"utf8");
  const css=fs.readFileSync(path.join(textRoot,"optional-scene-titles.css"),"utf8");
  assert.match(textHtml,/optional-scene-titles\.js/);assert.match(textHtml,/optional-scene-titles\.css/);
  assert.match(authorHtml,/\.\.\/text-game\/optional-scene-titles\.js/);
  assert.match(authorApp,/data-show-title/);assert.match(authorApp,/Show title in game/);assert.match(authorApp,/s\.showTitle!==false/);assert.match(authorApp,/delete s\.showTitle/);
  assert.match(authorApp,/s\.title\|\|id/,"graph nodes continue to use the authored title even when in-game presentation is disabled");
  assert.match(css,/\.vn-stage-title:empty/);assert.match(css,/\.battle-head h2:empty/);assert.match(css,/\.ending h2:empty/);
});
