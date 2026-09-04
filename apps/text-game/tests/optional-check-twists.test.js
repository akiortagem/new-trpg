"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const Core=require("../core.js");
require("../choice-state-conditions.js");
require("../multi-combat-compat.js");
require("../optional-scene-titles.js");
const OptionalTwists=require("../optional-check-twists.js");

function character(){
  return{schemaVersion:1,kind:"character",id:"hero",name:"Rhea",role:"Tester",attributes:{str:10,end:10,vit:10,mnd:10,agi:10,dex:10,int:10},skills:{Athletics:1},combat:{hp:100,stamina:10,mana:0,inventoryPoints:3,maxAp:3,def:10,defenseBonus:20},abilities:[{id:"strike",name:"Strike",kind:"attack",ap:1,stamina:0,mana:0,power:30,minRange:0,maxRange:0,attackBonus:20,tags:["Physical"]}]};
}

function checkChoice(){
  return{
    id:"test-check",label:"Attempt the test.",resolution:"check",actor:{mode:"fixed",id:"$main"},
    check:{goal:"Pass the test.",approach:"Try carefully.",baseTN:25,attributes:["str","end"],skill:"Athletics",situationalModifiers:[]},
    success:{text:"Success.",end:"victory"},
    failure:{text:"Failure.",end:"defeat"},
    twistPreview:"Success, but at a cost.",
    twist:{text:"Success with a cost.",end:"victory"}
  };
}

function adventure(choice=checkChoice()){
  return{schemaVersion:2,kind:"adventure",id:"optional-twist-test",title:"Optional Twist Test",startScene:"start",questDays:0,initialState:{flags:{},counters:{}},clocks:{},party:[],enemies:[],scenes:{start:{type:"scene",title:"Start",text:["Test."],choices:[choice]}}};
}

test("existing checks keep Success with a Twist enabled",()=>{
  const value=adventure();
  assert.deepEqual(Core.validateAdventure(value),[]);
  const run=Core.createRun(character(),value,()=>0.9);
  const result=Core.resolveChoice(run,"test-check","hero",()=>0.9);
  assert.equal(result.result,"failed-check");
  assert.ok(run.pendingTwist);
  assert.ok(run.log.some(entry=>entry.type==="twist.offered"));
});

test("a check may omit both twist fields",()=>{
  const choice=checkChoice();delete choice.twist;delete choice.twistPreview;
  const value=adventure(choice);
  assert.equal(OptionalTwists.twistMode(choice),"disabled");
  assert.deepEqual(Core.validateAdventure(value),[]);
});

test("rolled failure without a twist applies Failure immediately",()=>{
  const choice=checkChoice();delete choice.twist;delete choice.twistPreview;
  const run=Core.createRun(character(),adventure(choice),()=>0.9);
  const result=Core.resolveChoice(run,"test-check","hero",()=>0.9);
  assert.equal(result.result,"failure");
  assert.equal(result.twistOffered,false);
  assert.equal(run.pendingTwist,null);
  assert.equal(run.status,"defeat");
  assert.equal(run.ending.text,"Failure.");
  assert.ok(run.log.some(entry=>entry.type==="outcome.failure"&&entry.message==="Failure."));
  assert.ok(!run.log.some(entry=>entry.type.startsWith("twist.")),"disabled twists do not leak synthetic offer/decline events");
  assert.deepEqual(run.log.map(entry=>entry.sequence),run.log.map((_,index)=>index+1),"event sequence remains contiguous after compatibility events are removed");
});

test("successful checks without a twist still use Success normally",()=>{
  const choice=checkChoice();delete choice.twist;delete choice.twistPreview;
  const run=Core.createRun(character(),adventure(choice),()=>0.1);
  const result=Core.resolveChoice(run,"test-check","hero",()=>0.1);
  assert.equal(result.result,"success");
  assert.equal(run.status,"victory");
  assert.equal(run.ending.text,"Success.");
  assert.equal(run.pendingTwist,null);
});

test("twist and twistPreview must be authored or omitted together",()=>{
  const noOutcome=checkChoice();delete noOutcome.twist;
  const noPreview=checkChoice();delete noPreview.twistPreview;
  for(const choice of [noOutcome,noPreview]){
    const errors=Core.validateAdventure(adventure(choice));
    assert.ok(errors.some(error=>error.includes("twist and twistPreview must either both be present or both be omitted")));
  }
});

test("null twist fields are invalid rather than treated as omission",()=>{
  const bothNull=checkChoice();bothNull.twist=null;bothNull.twistPreview=null;
  const nullOutcomeOnly=checkChoice();nullOutcomeOnly.twist=null;delete nullOutcomeOnly.twistPreview;
  const nullPreviewOnly=checkChoice();nullPreviewOnly.twistPreview=null;delete nullPreviewOnly.twist;
  for(const choice of [bothNull,nullOutcomeOnly,nullPreviewOnly]){
    assert.notEqual(OptionalTwists.twistMode(choice),"disabled");
    const errors=Core.validateAdventure(adventure(choice));
    assert.ok(errors.length>0,"present null twist fields must remain visible to validation");
  }
  assert.throws(()=>Core.createRun(character(),adventure(bothNull),()=>0.5),/twist|twistPreview/);
});

test("browser apps load the optional twist contract before their app code",()=>{
  const textRoot=path.resolve(__dirname,"..");
  const authorRoot=path.resolve(textRoot,"..","adventure-author");
  const textHtml=fs.readFileSync(path.join(textRoot,"index.html"),"utf8");
  const authorHtml=fs.readFileSync(path.join(authorRoot,"index.html"),"utf8");
  assert.match(textHtml,/optional-check-twists\.js/);
  assert.ok(textHtml.indexOf("optional-check-twists.js")<textHtml.indexOf("app.js"));
  assert.match(authorHtml,/\.\.\/text-game\/optional-check-twists\.js/);
  assert.match(authorHtml,/optional-check-twists-authoring\.js/);
  assert.ok(authorHtml.indexOf("optional-check-twists-authoring.js")<authorHtml.indexOf("app.js"));
});
