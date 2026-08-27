"use strict";
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

class FakeElement {
  constructor(){this.innerHTML="";this.textContent="";this.dataset={};this.onclick=null;this.oninput=null;this.scrollTop=0;this.scrollHeight=0}
  querySelectorAll(){return []}
}

function runEngineTest(testSource){
  const elements=new Map();
  const document={
    querySelector(selector){if(!elements.has(selector))elements.set(selector,new FakeElement());return elements.get(selector)},
    querySelectorAll(){return []}
  };
  const storage=new Map();
  const context={assert,document,window:{print(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},confirm:()=>true,console,Date,Math,setTimeout,clearTimeout};
  vm.createContext(context);
  const appSource=fs.readFileSync(require.resolve("../app.js"),"utf8");
  vm.runInContext(appSource+"\n"+testSource,context,{timeout:2000});
}

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  reactionPrompt=(e,target,name,atk,multi=false,condition=null,done=()=>{})=>resolveEnemyHit(e,target,name,atk,{id:"none"},multi,condition,done);
  state.tweaks=defaultTweaks();
  state.tweaks.bandits.melee.count=2;
  state.tweaks.bandits.melee.hp=123;
  state.tweaks.pcs.ardan.hp=333;
  startEncounter("bandits");
  assert.equal(state.battle.enemies.filter(e=>e.type==="melee").length,2,"Configured enemy count is applied");
  assert.equal(state.battle.enemies.find(e=>e.type==="melee").maxHp,123,"Configured enemy stats are applied");
  assert.equal(state.battle.pcs.find(p=>p.id==="ardan").maxHp,333,"Configured PC stats are applied");
  assert.equal(distance(0,4),4,"Watchtower path uses the two-Move connection");
  state.battle.pcs.slice(0,3).forEach(p=>p.acted=true);
  state.battle.selected=state.battle.pcs[3].id;
  endPCTurn();
  assert.equal(state.battle.round,2,"Bandit enemy phase completes and advances the round");
  assert.equal(state.battle.phase,"pc");
  assert.equal(state.battle.enemies.find(e=>e.type==="archer").zone,2,"Archers spend 2 AP climbing down from the Watchtower");
  let safety=0;
  while(state.screen==="battle"&&safety++<8){
    state.battle.pcs.filter(p=>p.hp>0).forEach(p=>p.acted=true);
    enemyPhase();
  }
  assert.notEqual(safety,9,"Repeated bandit rounds always make progress toward an encounter result");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  reactionPrompt=(e,target,name,atk,multi=false,condition=null,done=()=>{})=>resolveEnemyHit(e,target,name,atk,{id:"none"},multi,condition,done);
  state.tweaks=defaultTweaks();
  state.tweaks.troll.troll.count=2;
  startEncounter("troll");
  assert.equal(state.battle.enemies.length,2,"Configured troll count is applied");
  assert.ok(state.battle.enemies.every(e=>e.edges===3),"Every troll begins with three Edges");
  state.battle.pcs.slice(0,3).forEach(p=>p.acted=true);
  state.battle.selected=state.battle.pcs[3].id;
  endPCTurn();
  assert.equal(state.battle.round,2,"Troll normal turn completes and advances the round");
  assert.ok(state.battle.enemies.every(e=>e.edges===3),"Every troll's Edges refresh for the new round");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let pc=state.battle.pcs.find(p=>p.id==="ardan"),enemy=state.battle.enemies.find(e=>e.type==="melee"),ability=pc.abilities.find(a=>a.id==="strike");
  enemy.ap=1;
  resolvePCAttack(pc,ability,[enemy]);
  assert.ok(state.battle.log.some(entry=>entry.text.includes("vs TN 80")),"Defense roll log includes its target number");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let enemy=state.battle.enemies.find(e=>e.type==="melee");
  let weak={power:35,type:"attack"}, strong={power:55,type:"attack"}, multi={power:35,type:"multi"};
  enemy.ap=2;
  assert.equal(enemyShouldDefend(enemy,weak),false,"Existing doctrine ignores a weak single-target attack");
  assert.equal(enemyShouldDefend(enemy,strong),true,"Existing doctrine defends against a strong attack");
  assert.equal(enemyShouldDefend(enemy,multi),true,"Existing doctrine preserves multi-target mitigation");
  enemy.defendPolicy="always";
  assert.equal(enemyShouldDefend(enemy,weak),true,"Always policy defends against every attack");
  enemy.defendPolicy="random"; enemy.defendOdds=0;
  assert.equal(enemyShouldDefend(enemy,strong),false,"Zero-percent randomized policy never defends");
  enemy.defendOdds=100;
  assert.equal(enemyShouldDefend(enemy,weak),true,"Hundred-percent randomized policy always defends");
  enemy.defendPolicy="hp"; enemy.defendHpThreshold=50; enemy.hp=41; enemy.maxHp=80;
  assert.equal(enemyShouldDefend(enemy,strong),false,"HP policy does not defend above its threshold");
  enemy.hp=40;
  assert.equal(enemyShouldDefend(enemy,weak),true,"HP policy defends at its threshold");
  enemy.ap=0;
  assert.equal(enemyShouldDefend(enemy,strong),false,"No policy can Defend without AP");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let ardan=state.battle.pcs.find(p=>p.id==="ardan");
  ardan.control="allout";
  state.battle.selected=ardan.id;
  runAutomatedTurn(ardan);
  assert.equal(ardan.ap,0,"All-Out Attacker spends every usable AP");
  assert.ok(ardan.acted,"All-Out Attacker completes its turn");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let ardan=state.battle.pcs.find(p=>p.id==="ardan");
  ardan.control="prepared";
  state.battle.selected=ardan.id;
  runAutomatedTurn(ardan);
  assert.equal(ardan.ap,1,"Always Prepared retains one reaction AP");
  let defend=automatedReaction(ardan,legalReactions(ardan,state.battle.enemies[0],false));
  assert.equal(defend.id,"defend","Always Prepared uses retained AP to Defend");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let ardan=state.battle.pcs.find(p=>p.id==="ardan");
  ardan.control="survivor"; ardan.attacksPreviousPhase=2;
  state.battle.selected=ardan.id;
  runAutomatedTurn(ardan);
  assert.equal(ardan.ap,1,"Reactive Survivor reserves AP after two attacks in the previous enemy phase");
  assert.ok(ardan.reactionDoctrineActive,"Reactive Survivor enables defense while its danger condition is active");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let elian=state.battle.pcs.find(p=>p.id==="elian"),mira=state.battle.pcs.find(p=>p.id==="mira");
  elian.control="prepared"; mira.hp=0; mira.acted=true;
  state.battle.selected=elian.id;
  runAutomatedTurn(elian);
  assert.ok(mira.hp>0,"Automated healer revives a fallen ally before other priorities");
  let sera=state.battle.pcs.find(p=>p.id==="sera");
  sera.control="prepared"; sera.ap=1; sera.stamina=20; mira.hp=Math.floor(mira.maxHp*.4); mira.zone=sera.zone;
  let protect=automatedReaction(mira,legalReactions(mira,state.battle.enemies[0],false));
  assert.equal(protect.id,"intercede","Automated Sera uses Shielded Intercession for an endangered mage");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  for(const p of Object.values(state.tweaks.pcs))p.control="allout";
  for(const group of Object.values(state.tweaks.bandits))group.count=0;
  state.tweaks.bandits.melee.count=1; state.tweaks.bandits.melee.hp=30; state.tweaks.bandits.melee.defendPolicy="always";
  startEncounter("bandits");
  assert.ok(state.autoPause,"An automated turn pauses on its summary dialog");
  while(state.autoPause)advanceAutoPause();
  assert.equal(state.screen,"report","A fully automated doctrine party completes after advancing its summaries");
  assert.equal(state.results.at(-1).outcome,"victory");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  for(const doctrine of ["allout","prepared","survivor"]){
    state={screen:"setup",mode:null,queue:[],results:[],survey:{},battle:null,tweaks:defaultTweaks()};
    for(const p of Object.values(state.tweaks.pcs))p.control=doctrine;
    startEncounter("bandits");
    let summaries=0;
    while(state.autoPause&&summaries++<100)advanceAutoPause();
    assert.ok(summaries>0,doctrine+" party presents automated turn summaries");
    assert.notEqual(state.screen,"battle",doctrine+" party terminates the published bandit encounter");
    assert.ok(state.results.length===1,doctrine+" party records an encounter result");
  }
`);

console.log("combat-engine tests passed");
