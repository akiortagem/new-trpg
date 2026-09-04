"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const OptionalTwists=require("../optional-check-twists-authoring.js");

function choice(){
  return{
    id:"check",label:"Check",resolution:"check",actor:{mode:"fixed",id:"$main"},
    check:{goal:"Goal",approach:"Approach",baseTN:40,attributes:["int","dex"],skill:"Awareness",situationalModifiers:[]},
    success:{text:"Success",next:"success"},failure:{text:"Failure",next:"failure"},
    twistPreview:"Old preview",twist:{text:"Old twist",next:"twist",effects:[{type:"set",path:"flags.cost",value:true}]}
  };
}

function adventure(checkChoice=choice()){
  return{schemaVersion:2,kind:"adventure",id:"author-test",title:"Author Test",startScene:"start",initialState:{flags:{},counters:{}},clocks:{},party:[],scenes:{start:{type:"scene",title:"Start",text:["Start"],choices:[checkChoice]}}};
}

test("hydrating a serialized no-twist check gives the editor a non-serialized placeholder",()=>{
  const checkChoice=choice();delete checkChoice.twist;delete checkChoice.twistPreview;
  OptionalTwists.hydrateChoice(checkChoice);
  assert.equal(OptionalTwists.isTwistEnabled(checkChoice),false);
  assert.equal(checkChoice.twist[OptionalTwists.PLACEHOLDER_MARKER],true);
  const saved=OptionalTwists.serializeAdventure(adventure(checkChoice));
  assert.equal(Object.prototype.hasOwnProperty.call(saved.scenes.start.choices[0],"twist"),false);
  assert.equal(Object.prototype.hasOwnProperty.call(saved.scenes.start.choices[0],"twistPreview"),false);
});

test("disabling and re-enabling preserves authored twist content during the editing session",()=>{
  const checkChoice=choice();
  OptionalTwists.disableTwist(checkChoice);
  assert.equal(OptionalTwists.isTwistEnabled(checkChoice),false);
  assert.equal(checkChoice.twist[OptionalTwists.PLACEHOLDER_MARKER],true);
  OptionalTwists.enableTwist(checkChoice);
  assert.equal(OptionalTwists.isTwistEnabled(checkChoice),true);
  assert.equal(checkChoice.twistPreview,"Old preview");
  assert.deepEqual(checkChoice.twist,{text:"Old twist",next:"twist",effects:[{type:"set",path:"flags.cost",value:true}]});
});

test("re-enabling a check loaded without a twist creates an editable default",()=>{
  const checkChoice=choice();delete checkChoice.twist;delete checkChoice.twistPreview;
  OptionalTwists.hydrateChoice(checkChoice);
  OptionalTwists.enableTwist(checkChoice);
  assert.equal(OptionalTwists.isTwistEnabled(checkChoice),true);
  assert.equal(checkChoice.twistPreview,"The goal succeeds, but there is a complication.");
  assert.deepEqual(checkChoice.twist,{text:"The goal succeeds with a complication.",next:""});
});

test("partial twist pairs are rejected by the authoring open contract",()=>{
  const missingPreview=choice();delete missingPreview.twistPreview;
  const missingOutcome=choice();delete missingOutcome.twist;
  for(const checkChoice of [missingPreview,missingOutcome]){
    const issues=OptionalTwists.partialTwistIssues(adventure(checkChoice));
    assert.ok(issues.some(issue=>/twist and twistPreview must either both be present or both be omitted/.test(issue)));
  }
});

test("null twist fields remain malformed instead of being hydrated into omission",()=>{
  const bothNull=choice();bothNull.twist=null;bothNull.twistPreview=null;
  OptionalTwists.hydrateChoice(bothNull);
  assert.equal(bothNull.twist,null);
  assert.equal(bothNull.twistPreview,null);
  const issues=OptionalTwists.partialTwistIssues(adventure(bothNull));
  assert.ok(issues.some(issue=>/\.twist must be an object when present/.test(issue)));
  assert.ok(issues.some(issue=>/\.twistPreview must be a non-empty string when present/.test(issue)));
  const saved=OptionalTwists.serializeAdventure(adventure(bothNull));
  assert.equal(saved.scenes.start.choices[0].twist,null);
  assert.equal(saved.scenes.start.choices[0].twistPreview,null);
});

test("serialized adventures never contain authoring backup or compatibility markers",()=>{
  const checkChoice=choice();OptionalTwists.disableTwist(checkChoice);
  const value=adventure(checkChoice);
  const saved=OptionalTwists.serializeAdventure(value);
  const serialized=JSON.stringify(saved);
  assert.doesNotMatch(serialized,/__optionalTwistBackup/);
  assert.doesNotMatch(serialized,/__optionalTwistPlaceholder/);
  assert.doesNotMatch(serialized,/__optionalTwistDisabled/);
});

test("the temporary toJSON save hook serializes without recursion",()=>{
  const checkChoice=choice();OptionalTwists.disableTwist(checkChoice);
  const value=adventure(checkChoice);
  Object.defineProperty(value,"toJSON",{configurable:true,enumerable:false,value:()=>OptionalTwists.serializeAdventure(value)});
  const serialized=JSON.stringify(value);
  assert.doesNotMatch(serialized,/__optionalTwist/);
  assert.doesNotMatch(serialized,/"twistPreview"/);
  assert.doesNotMatch(serialized,/"twist"/);
});

test("authoring source exposes the optional twist control and strips disabled fields on save",()=>{
  const root=path.resolve(__dirname,"..");
  const source=fs.readFileSync(path.join(root,"optional-check-twists-authoring.js"),"utf8");
  assert.match(source,/Offer Success with a Twist after a failed roll/);
  assert.match(source,/delete choice\.twist/);
  assert.match(source,/delete choice\.twistPreview/);
  assert.match(source,/#saveBtn,#jsonBtn/);
  assert.match(source,/twistPort\.hidden=!isTwistEnabled\(choice\)/);
  assert.match(source,/#addCheck,#addAutomatic/);
});
