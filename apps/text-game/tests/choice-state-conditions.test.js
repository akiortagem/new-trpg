"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const Core=require("../core.js");
require("../choice-state-conditions.js");

function character(){
  return{
    schemaVersion:1,kind:"character",id:"hero",name:"Hero",role:"Tester",
    attributes:{str:10,end:10,vit:10,mnd:10,agi:10,dex:10,int:10},
    skills:{Blades:1},
    combat:{hp:100,stamina:10,mana:0,inventoryPoints:3,maxAp:3,def:5,defenseBonus:20},
    abilities:[{id:"strike",name:"Strike",kind:"attack",ap:1,stamina:0,mana:0,power:30,minRange:0,maxRange:0,attackBonus:20,tags:["Physical"]}]
  };
}

function automaticChoice(id,label,when,effects=[]){
  return{id,label,resolution:"automatic",when,reason:"State-gated test choice.",outcome:{text:`Resolved ${id}.`,next:"start",effects}};
}

function adventure(){
  return{
    schemaVersion:2,kind:"adventure",id:"state-choice-test",title:"State Choice Test",startScene:"start",questDays:3,
    initialState:{flags:{vault:"closed",permission:false},counters:{reputation:1}},
    clocks:{search:{label:"Search",size:4}},party:[],
    scenes:{
      start:{type:"scene",title:"Start",text:["Choose."],choices:[
        automaticChoice("open-vault","Use the open vault",{path:"flags.vault",equals:"open"}),
        automaticChoice("open-it","Open the vault",{path:"flags.vault",equals:"closed"},[{type:"set",path:"flags.vault",value:"open"}]),
        automaticChoice("trusted","Use trusted access",{all:[{path:"flags.permission",equals:true},{path:"counters.reputation",gte:2}]})
      ]},
      fight:{type:"combat",title:"Required combat",ambush:false,battlefield:{zones:[{id:"field",name:"Field"}],links:[]},pcStarts:{$main:"field"},enemies:[{id:"foe",name:"Foe",preset:"optimal_killer",zone:"field",hp:30,maxAp:1,atk:10,def:0,dodge:0,threat:0,abilities:[{id:"claw",name:"Claw",kind:"attack",ap:1,stamina:0,mana:0,power:10,minRange:0,maxRange:0,tags:["Physical"]}]}],victory:{text:"Win.",end:"victory"},defeat:{text:"Lose.",end:"defeat"}}
    }
  };
}

test("a choice is available only while its state equals the authored value",()=>{
  const run=Core.createRun(character(),adventure());
  assert.deepEqual(Core.visibleChoices(run).map(choice=>choice.id),["open-it"]);
  Core.resolveChoice(run,"open-it");
  assert.equal(run.world.flags.vault,"open");
  assert.deepEqual(Core.visibleChoices(run).map(choice=>choice.id),["open-vault"]);
  assert.throws(()=>Core.resolveChoice(run,"open-it"),/not currently available/);
});

test("all conditions re-evaluate current boolean and numeric state",()=>{
  const run=Core.createRun(character(),adventure());
  run.world.flags.permission=true;
  run.world.counters.reputation=2;
  assert.ok(Core.visibleChoices(run).some(choice=>choice.id==="trusted"));
  run.world.counters.reputation=1;
  assert.ok(!Core.visibleChoices(run).some(choice=>choice.id==="trusted"));
});

test("choice state conditions are validated as part of the adventure contract",()=>{
  const value=adventure();
  value.scenes.start.choices[0].when={path:"flags.vault"};
  let errors=Core.validateAdventure(value);
  assert.ok(errors.some(message=>message.includes("must contain exactly one")));

  value.scenes.start.choices[0].when={path:"flags.vault",equals:"open",notEquals:"closed"};
  errors=Core.validateAdventure(value);
  assert.ok(errors.some(message=>message.includes("must contain exactly one")));

  value.scenes.start.choices[0].when={path:"clocks.missing.filled",gte:1};
  errors=Core.validateAdventure(value);
  assert.ok(errors.some(message=>message.includes("references unknown clock missing")));

  value.scenes.start.choices[0].when={path:"counters.reputation",gte:"2"};
  errors=Core.validateAdventure(value);
  assert.ok(errors.some(message=>message.includes("must be a finite number")));
});

test("starting a run rejects malformed choice conditions even though core.js predates the hardening layer",()=>{
  const value=adventure();
  value.scenes.start.choices[0].when={path:"secret.value",equals:true};
  assert.throws(()=>Core.createRun(character(),value),/must reference flags/);
});
