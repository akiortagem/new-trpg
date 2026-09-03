"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const Model=require("../authoring-model.js");

const appSource=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
const indexSource=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const enhancementSource=fs.readFileSync(path.join(__dirname,"..","choice-state-authoring.js"),"utf8");

test("authoring model preserves supported choice state-condition shapes",()=>{
  const adventure=Model.createAdventureDraft("conditional","Conditional",3);
  const choice=adventure.scenes.start.choices[0];
  adventure.initialState.flags.vaultOpen=false;
  adventure.initialState.counters.reputation=0;
  choice.when={all:[{path:"flags.vaultOpen",equals:true},{path:"counters.reputation",gte:2}]};
  assert.deepEqual(Model.openableShapeIssues(adventure),[]);
  assert.deepEqual(choice.when,{all:[{path:"flags.vaultOpen",equals:true},{path:"counters.reputation",gte:2}]});
});

test("choice editor exposes state path, comparison, and required value controls",()=>{
  assert.match(appSource,/function whenEditor\(when\)/);
  assert.match(appSource,/data-cond-path/);
  assert.match(appSource,/data-cond-op/);
  assert.match(appSource,/data-cond-val/);
  assert.match(appSource,/function statePaths\(\)/);
});

test("authoring app loads shared condition validation and availability labels",()=>{
  assert.match(indexSource,/\.\.\/text-game\/choice-state-conditions\.js/);
  assert.match(indexSource,/choice-state-authoring\.js/);
  assert.match(enhancementSource,/Availability/);
  assert.match(enhancementSource,/The choice is shown only while its state condition matches/);
  assert.match(enhancementSource,/equals:"is"/);
});
