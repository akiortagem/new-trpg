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
  const aiSource=fs.readFileSync(require.resolve("../ai-controller.js"),"utf8");
  const appSource=fs.readFileSync(require.resolve("../app.js"),"utf8");
  vm.runInContext(aiSource+"\n"+appSource+"\n"+testSource,context,{timeout:2000});
}

async function runAsyncEngineTest(testSource,fetchMock){
  const elements=new Map();
  const document={
    querySelector(selector){if(!elements.has(selector))elements.set(selector,new FakeElement());return elements.get(selector)},
    querySelectorAll(){return []}
  };
  const storage=new Map();
  const context={assert,document,window:{print(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},fetch:fetchMock,confirm:()=>true,console,Date,Math,setTimeout,clearTimeout};
  vm.createContext(context);
  const aiSource=fs.readFileSync(require.resolve("../ai-controller.js"),"utf8");
  const appSource=fs.readFileSync(require.resolve("../app.js"),"utf8");
  return vm.runInContext(`(async()=>{${aiSource}\n${appSource}\n${testSource}})()`,context,{timeout:4000});
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
  state.mode="bandits";
  state.screen="tweaks";
  state.tweaks=defaultTweaks();
  let draft=defaultPlacement("bandits");
  assert.equal(draft.pcs.ardan,ENCOUNTERS.bandits.start,"New placement drafts use the published PC start zone");
  assert.equal(draft.enemies.archer1,4,"New placement drafts use each enemy's published zone");
  assert.ok(movePlacementUnit(draft,"pcs","ardan",4,"bandits"),"An individual PC can move to any encounter zone");
  assert.ok(movePlacementUnit(draft,"enemies","melee1",0,"bandits"),"An individual enemy can move to any encounter zone");
  assert.ok(applyPlacement("bandits",draft),"A complete valid placement can be applied");
  assert.equal(state.tweaks.placements.bandits.pcs.ardan,4,"Applied PC placement is persisted in setup state");
  assert.equal(state.tweaks.placements.bandits.enemies.melee1,0,"Applied enemy placement is persisted in setup state");
  assert.equal(state.tweaks.placements.bandits.counts.melee,4,"Applying placement snapshots the locked archetype counts");
  tweakView();
  assert.ok(app.innerHTML.includes("Enemy counts are locked until placement is reset."),"The tweak screen explains the count lock");
  assert.ok(app.innerHTML.includes('disabled aria-disabled="true"'),"Applied placement disables enemy count fields");
  let cancelledDraft=deep(state.tweaks.placements.bandits);
  movePlacementUnit(cancelledDraft,"pcs","ardan",1,"bandits");
  renderPlacementModal("bandits",cancelledDraft);
  document.querySelector("#cancelPlacement").onclick();
  assert.equal(state.tweaks.placements.bandits.pcs.ardan,4,"Cancel leaves the previously applied placement unchanged");
  assert.equal(modalRoot.innerHTML,"","Cancel closes the placement modal");
  startEncounter("bandits");
  assert.equal(state.battle.pcs.find(p=>p.id==="ardan").zone,4,"Combat starts the PC in the applied zone");
  assert.equal(state.battle.enemies.find(e=>e.id==="melee1").zone,0,"Combat starts the enemy in the applied zone");
  state.screen="tweaks";
  resetPlacement("bandits",false);
  assert.equal(state.tweaks.placements.bandits,null,"Reset Placement discards the placement snapshot");
  tweakView();
  assert.ok(!app.innerHTML.includes('aria-disabled="true"'),"Reset Placement unlocks enemy count fields");
  let reapplied=defaultPlacement("bandits");
  movePlacementUnit(reapplied,"pcs","mira",3,"bandits");
  applyPlacement("bandits",reapplied);
  tweakView();
  document.querySelector("#resetTweaks").onclick();
  assert.equal(state.tweaks.placements.bandits,null,"Reset published values also clears placement");
  assert.equal(state.tweaks.bandits.melee.count,4,"Reset published values restores enemy counts");
`);

runEngineTest(`
  state.screen="setup";
  setupView();
  assert.ok(!app.innerHTML.includes("Full Session"),"The removed multi-encounter mode is absent from setup");
  assert.equal((app.innerHTML.match(/data-mode=/g)||[]).length,2,"Setup offers only the two independent encounters");
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
  reactionPrompt=(e,target,name,atk,multi=false,condition=null,done=()=>{})=>resolveEnemyHit(e,target,name,atk,{id:"none"},multi,condition,done);
  state.tweaks=defaultTweaks();
  assert.equal(state.tweaks.troll.troll.bossEdgesEnabled,true,"Boss Edges default to enabled");
  state.tweaks.troll.troll.bossEdgesEnabled=false;
  startEncounter("troll");
  let troll=state.battle.enemies[0];
  assert.equal(troll.edges,0,"A troll begins without Edges when the toggle is disabled");
  troll.conditions=["Persistent Damage"];
  trollEdgeOne(troll,()=>{});
  assert.ok(troll.conditions.includes("Persistent Damage"),"A disabled Edge cannot Recover Persistent Damage");
  assert.equal(state.battle.metrics.edgeRecover,0,"Disabled Edges never increment Edge recovery telemetry");
  state.battle.pcs.slice(0,3).forEach(p=>p.acted=true);
  state.battle.selected=state.battle.pcs[3].id;
  endPCTurn();
  assert.equal(troll.edges,0,"Disabled Edges remain disabled after round refresh");
  assert.ok(state.battle.log.some(x=>x.text==="Boss Edges are disabled."),"The combat log records the disabled setting");
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
  assert.equal(state.battle.metrics.npcDefRolls,1,"An NPC defense roll increments only the NPC counter");
  assert.equal(state.battle.metrics.pcDefRolls,0,"An NPC defense roll does not increment the PC counter");
  resolveEnemyHit(enemy,pc,"Strike",35,{id:"defend"},false,null,()=>{});
  assert.equal(state.battle.metrics.npcDefRolls,1,"A PC defense roll does not increment the NPC counter");
  assert.equal(state.battle.metrics.pcDefRolls,1,"A PC defense roll increments only the PC counter");
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
  reactionPrompt=(e,target,name,atk,multi=false,condition=null,done=()=>{})=>resolveEnemyHit(e,target,name,atk,{id:"none"},multi,condition,done);
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let bruiser=state.battle.enemies.find(e=>e.type==="bruiser"),target=state.battle.pcs.find(p=>p.id==="ardan");
  bruiser.zone=target.zone; bruiser.ap=3;
  runBanditStep(bruiser,()=>{});
  let bruiserActions=state.battle.log.filter(x=>x.text.startsWith("Bruiser 1's")).map(x=>x.text);
  assert.equal(bruiserActions.filter(x=>x.includes("Concussive Blow")).length,1,"A 3-AP bruiser uses only one 2-AP Concussive Blow");
  assert.equal(bruiserActions.filter(x=>x.includes("Strike")).length,1,"The bruiser may spend its final AP on one Strike");
  assert.equal(bruiser.ap,0,"Bruiser attacks consume their full listed AP costs");
  bruiser.zone=1; bruiser.ap=3;
  let movedBruiserStart=state.battle.log.length;
  runBanditStep(bruiser,()=>{});
  let movedBruiserActions=state.battle.log.slice(movedBruiserStart).map(x=>x.text);
  assert.equal(movedBruiserActions.filter(x=>x.includes("Bruiser 1 moves")).length,1,"Bruiser spends 1 AP moving into range");
  assert.equal(movedBruiserActions.filter(x=>x.includes("Bruiser 1's Concussive Blow")).length,1,"Moved bruiser spends its remaining 2 AP on Concussive Blow");
  assert.equal(movedBruiserActions.filter(x=>x.includes("Bruiser 1's Strike")).length,0,"Moved bruiser cannot make an extra Strike");
  assert.equal(bruiser.ap,0,"Move plus Concussive Blow exhausts a bruiser's 3 AP");
  let archer=state.battle.enemies.find(e=>e.type==="archer");
  archer.zone=target.zone; archer.ap=2;
  let before=state.battle.log.length;
  runBanditStep(archer,()=>{});
  let archerActions=state.battle.log.slice(before).filter(x=>x.text.startsWith("Archer 1's"));
  assert.equal(archerActions.filter(x=>x.text.includes("Aimed Shot")).length,1,"A 2-AP archer uses one Aimed Shot");
  assert.equal(archer.ap,0,"Aimed Shot consumes 2 AP");
  assert.ok(state.battle.enemies.every(e=>e.ap>=0),"No NPC AP balance becomes negative");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let pc=state.battle.pcs.find(p=>p.id==="ardan"),enemy=state.battle.enemies.find(e=>e.type==="melee"),ability=pc.abilities.find(a=>a.id==="strike");
  enemy.ap=2;
  resolvePCAttack(pc,ability,[enemy]);
  assert.equal(enemy.ap,1,"NPC Defend spends AP during the PC phase");
  processEnemy=()=>{};
  enemyPhase();
  assert.equal(enemy.ap,1,"Enemy phase does not refresh AP spent on reactions");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let ardan=state.battle.pcs.find(p=>p.id==="ardan"),sera=state.battle.pcs.find(p=>p.id==="sera"),enemy=state.battle.enemies.find(e=>e.type==="bruiser");
  ardan.control="allout"; ardan.hp=100; sera.control="prepared"; sera.ap=1; sera.stamina=20; sera.zone=ardan.zone; enemy.zone=ardan.zone;
  reactionPrompt(enemy,ardan,"Strike",50,false,null,()=>{});
  assert.ok(state.battle.log.some(x=>x.text.startsWith("Sera's Always Prepared doctrine chooses Sera uses Shielded Intercession")),"Shielded Intercession is attributed to Sera and her doctrine");
  assert.ok(!state.battle.log.some(x=>x.text.startsWith("Ardan's Always Prepared")),"The protected target is not mislabeled with Sera's doctrine");
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
    state={screen:"setup",mode:null,results:[],survey:{},battle:null,tweaks:defaultTweaks()};
    for(const p of Object.values(state.tweaks.pcs))p.control=doctrine;
    startEncounter("bandits");
    let summaries=0;
    while(state.autoPause&&summaries++<100)advanceAutoPause();
    assert.ok(summaries>0,doctrine+" party presents automated turn summaries");
    assert.notEqual(state.screen,"battle",doctrine+" party terminates the published bandit encounter");
    assert.ok(state.results.length===1,doctrine+" party records an encounter result");
  }
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let ardan=state.battle.pcs.find(p=>p.id==="ardan"),bruiser=state.battle.enemies.find(e=>e.type==="bruiser");
  ardan.ap=3;
  resolveEnemyHit(bruiser,ardan,"Concussive Blow",50,{id:"none"},false,"Incapacitated",()=>{});
  assert.ok(ardan.conditions.includes("Incapacitated"),"A damaging Concussive Blow causes Incapacitated");
  assert.equal(ardan.ap,1,"Incapacitated immediately caps current AP at one");
  assert.ok(!legalReactions(ardan,bruiser,false).some(x=>["defend","gale"].includes(x.id)),"An Incapacitated target cannot personally react");
  assert.ok(!legalBasic(ardan,ardan.abilities.find(a=>a.id==="strike")),"An Incapacitated PC cannot attack");
  assert.ok(legalBasic(ardan,{id:"recover"}),"An Incapacitated PC may Recover");
  assert.ok(state.battle.log.some(x=>x.text==="Ardan becomes Incapacitated."),"The condition is announced in the combat log");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let ardan=state.battle.pcs.find(p=>p.id==="ardan"),bruiser=state.battle.enemies.find(e=>e.type==="bruiser");
  ardan.def=100;
  resolveEnemyHit(bruiser,ardan,"Concussive Blow",50,{id:"defend"},true,"Incapacitated",()=>{});
  assert.ok(!ardan.conditions.includes("Incapacitated"),"A zero-damage Concussive Blow does not cause Incapacitated");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  let ardan=state.battle.pcs.find(p=>p.id==="ardan");
  ardan.control="allout"; ardan.conditions=["Incapacitated"]; ardan.ap=1;
  state.battle.selected=ardan.id;
  runAutomatedTurn(ardan);
  assert.ok(!ardan.conditions.includes("Incapacitated"),"An automated PC Recovers from Incapacitated");
  assert.equal(ardan.ap,0,"Recover spends the Incapacitated PC's only AP");
  assert.ok(state.battle.log.some(x=>x.text.includes("only AP Recovering from Incapacitated")),"Automated Recover is explained in the log");
`);

runEngineTest(`
  commit=()=>{};
  save=()=>{};
  state.tweaks=defaultTweaks();
  startEncounter("bandits");
  continuePCPhase=()=>{};
  let ardan=state.battle.pcs.find(p=>p.id==="ardan");
  ardan.conditions=["Incapacitated"];
  endRound();
  assert.equal(ardan.ap,1,"An Incapacitated PC refreshes to only one AP");
`);

(async()=>{
  let calls=[];
  await runAsyncEngineTest(`
    commit=()=>{};
    save=()=>{};
    localStorage.setItem(AI_KEY_STORAGE,"test-secret-key");
    localStorage.setItem(AI_MODEL_STORAGE,"test-model");
    state.tweaks=defaultTweaks();
    state.tweaks.pcs.ardan.aiBehavior="optimal";
    startEncounter("bandits");
    let ardan=state.battle.pcs.find(p=>p.id==="ardan"); ardan.control="ai";
    let options=legalAIPCOptions(ardan);
    assert.ok(options.length>1,"An AI PC receives fully specified legal choices");
    assert.equal(new Set(options.map(x=>x.id)).size,options.length,"Every AI choice ID is unique");
    let decision=await requestAIDecision(ardan,"PC action",options);
    assert.equal(decision.choice_id,options[0].id,"The fifth valid response is accepted");
    assert.equal(state.battle.metrics.ai.requests,5,"Each retry is counted as an API request");
    assert.equal(state.battle.metrics.ai.retries,4,"Four retries are recorded before the valid fifth response");
    assert.equal(state.battle.metrics.ai.decisions,1,"Only the valid choice becomes a decision record");
    assert.equal(state.battle.aiDecisions[0].behavior,"Optimal Tactician");
    assert.ok(!JSON.stringify(state).includes("test-secret-key"),"The API key is excluded from autosaved encounter state");
  `,async(url,request)=>{
    calls.push({url,request});
    let attempt=calls.length,body=JSON.parse(request.body),choice=body.text.format.schema.properties.choice_id.enum[0];
    return{ok:true,status:200,json:async()=>({output_text:JSON.stringify({choice_id:attempt<5?"illegal-choice":choice,reasoning:"Test reasoning"}),usage:{input_tokens:10,output_tokens:4,total_tokens:14}})};
  });
  assert.equal(calls.length,5,"The client stops retrying after a valid fifth response");
  assert.equal(calls[0].url,"https://api.openai.com/v1/responses");
  let firstBody=JSON.parse(calls[0].request.body),firstSituation=JSON.parse(firstBody.input[1].content);
  assert.equal(firstBody.store,false,"API responses are not stored by OpenAI");
  assert.ok(!calls[0].request.body.includes("test-secret-key"),"The API key never appears in the request body or prompt");
  assert.equal(firstSituation.battlefield.opponents[0].hp,undefined,"PC prompts do not reveal exact enemy HP");
  assert.ok(firstSituation.battlefield.opponents[0].health,"PC prompts include only the visible qualitative enemy health");

  let failedCalls=0;
  await runAsyncEngineTest(`
    commit=()=>{};
    save=()=>{};
    localStorage.setItem(AI_KEY_STORAGE,"test-secret-key");
    state.tweaks=defaultTweaks();
    startEncounter("bandits");
    let ardan=state.battle.pcs.find(p=>p.id==="ardan"),caught=null;
    try{await requestAIDecision(ardan,"PC action",legalAIPCOptions(ardan))}catch(error){caught=error}
    assert.ok(caught,"Five unusable responses surface a failure");
    assert.equal(caught.attemptErrors.length,5,"The failure exposes all five attempt errors");
    assert.equal(state.battle.metrics.ai.failures,5,"Every failed attempt is recorded");
  `,async()=>{failedCalls++;return{ok:true,status:200,json:async()=>({output_text:"not json",usage:{}})}});
  assert.equal(failedCalls,5,"The client stops after exactly five failed attempts");

  runEngineTest(`
    commit=()=>{};
    save=()=>{};
    state.tweaks=defaultTweaks();
    assert.equal(state.tweaks.pcs.ardan.aiBehavior,"role_faithful","PCs receive a default selectable AI behavior");
    assert.equal(state.tweaks.bandits.melee.control,"rigid","NPC archetypes remain deterministic by default");
    assert.equal(state.tweaks.bandits.melee.aiBehavior,"optimal_killer","NPC archetypes receive a default selectable AI behavior");
    state.tweaks.bandits.bruiser.control="ai";
    localStorage.setItem(AI_KEY_STORAGE,"test-secret-key");
    startEncounter("bandits");
    let bruiser=state.battle.enemies.find(e=>e.type==="bruiser"),ardan=state.battle.pcs.find(p=>p.id==="ardan");
    bruiser.zone=ardan.zone; bruiser.ap=2;
    let options=legalAINPCOptions(bruiser);
    assert.ok(options.some(x=>x.name==="Concussive Blow"&&x.cost===2),"AI bruisers are offered their legal 2-AP ability");
    assert.ok(options.every(x=>!x.cost||x.cost<=bruiser.ap),"AI NPC choices never exceed current AP");
  `);

  runEngineTest(`
    commit=()=>{};
    save=()=>{};
    reactionPrompt=(e,target,name,atk,multi=false,condition=null,done=()=>{})=>resolveEnemyHit(e,target,name,atk,{id:"none"},multi,condition,done);
    state.tweaks=defaultTweaks();
    startEncounter("bandits");
    let bruiser=state.battle.enemies.find(e=>e.type==="bruiser"),ardan=state.battle.pcs.find(p=>p.id==="ardan");
    bruiser.control="ai"; bruiser.zone=ardan.zone; bruiser.ap=2;
    let concussive=legalAINPCOptions(bruiser).find(x=>x.name==="Concussive Blow"&&x.targetIds.includes(ardan.id));
    executeAINPCOption(bruiser,concussive,()=>{});
    assert.equal(bruiser.ap,0,"Executing an AI-selected Concussive Blow spends its full 2 AP");
    assert.ok(ardan.conditions.includes("Incapacitated"),"AI-selected Concussive Blow uses the complete rules-engine effect");
    let sera=state.battle.pcs.find(p=>p.id==="sera"); ardan.control="ai"; ardan.aiBehavior="self_preserving"; ardan.hp=100; sera.control="ai"; sera.aiBehavior="role_faithful"; sera.zone=ardan.zone; sera.ap=2;
    let reactions=legalReactions(ardan,bruiser,false),choice=aiPresetReaction(ardan,reactions,50,false);
    assert.ok(["intercede","protectDefend","protect"].includes(choice.id),"Role-Faithful AI Sera deterministically Protects an endangered ally");
    sera.ap=0; ardan.conditions=[];
    choice=aiPresetReaction(ardan,legalReactions(ardan,bruiser,false),50,false);
    assert.equal(choice.id,"defend","Self-Preserving AI deterministically Defends without an API request");
  `);

  runEngineTest(`
    commit=()=>{};
    save=()=>{};
    state.tweaks=defaultTweaks();
    startEncounter("troll");
    let troll=state.battle.enemies[0]; troll.control="ai"; troll.conditions=["Persistent Damage"];
    let options=legalAITrollEdgeOptions(troll);
    assert.ok(options.some(x=>x.kind==="edge_recover"),"An AI troll can choose Edge Recover when Persistent Damage suppresses Regeneration");
    let recover=options.find(x=>x.kind==="edge_recover"),before=troll.edges;
    executeAITrollEdge(troll,recover,()=>{});
    assert.equal(troll.edges,before-1,"An AI-selected boss action consumes one Edge");
    assert.ok(!troll.conditions.includes("Persistent Damage"),"AI Edge Recover removes Persistent Damage through the rules engine");
  `);

  runEngineTest(`
    state.mode="troll";
    state.tweaks=defaultTweaks();
    state.screen="tweaks";
    tweakView();
    assert.ok(app.innerHTML.includes("ChatGPT API Control"),"The tweak screen renders API configuration");
    assert.ok(app.innerHTML.includes("Inexperienced Player"),"The tweak screen renders all PC AI behaviors");
    assert.ok(app.innerHTML.includes("Dramatic GM"),"The tweak screen renders all NPC AI behaviors");
    assert.ok(app.innerHTML.includes("Enable Boss Edges"),"The API controls coexist with troll Boss Edge tweaking");
    state.mode="bandits";
    tweakView();
    state.tweaks.pcs.ardan.control="ai";
    startEncounter("bandits");
    assert.equal(state.screen,"tweaks","An AI-configured encounter cannot begin without an API key");
    assert.ok(modalRoot.innerHTML.includes("API key required"),"The missing-key problem is explained before combat");
  `);

  await runAsyncEngineTest(`
    commit=()=>{};
    save=()=>{};
    localStorage.setItem(AI_KEY_STORAGE,"test-secret-key");
    state.tweaks=defaultTweaks();
    startEncounter("bandits");
    let ardan=state.battle.pcs.find(p=>p.id==="ardan"); ardan.control="ai";
    continuePCPhase();
    assert.equal(state.battle.selected,null,"AI PCs are not auto-selected at the start of the PC phase");
    state.battle.selected=ardan.id;
    assert.ok(controlsHtml().includes("Start AI turn"),"Selecting an AI PC replaces its action list with Start AI turn");
    await runAITurn(ardan);
    assert.ok(document.querySelector("#aiNext").onclick,"An AI decision waits behind a Next button");
    document.querySelector("#aiNext").onclick();
    assert.ok(ardan.acted,"Pressing Next executes the validated end-turn choice");
    assert.equal(ardan.ap,ardan.maxAp,"The AI may legally retain AP by ending its turn");
  `,async(url,request)=>{let body=JSON.parse(request.body),prompt=JSON.parse(body.input[1].content),end=prompt.legal_choices.find(x=>x.label==="End turn");return{ok:true,status:200,json:async()=>({output_text:JSON.stringify({choice_id:end.choice_id,reasoning:"Retain AP for reactions."}),usage:{input_tokens:8,output_tokens:4,total_tokens:12}})}});

  let pcSegmentCalls=0;
  await runAsyncEngineTest(`
    commit=()=>{};
    save=()=>{};
    localStorage.setItem(AI_KEY_STORAGE,"test-secret-key");
    state.tweaks=defaultTweaks();
    startEncounter("bandits");
    let sera=state.battle.pcs.find(p=>p.id==="sera"),target=state.battle.enemies.find(e=>e.type==="melee"),startHp=target.hp;
    sera.control="ai"; state.battle.selected=sera.id;
    await runAITurn(sera);
    assert.equal(state.battle.metrics.ai.requests,1,"Move and attack are selected by one initial PC API call");
    document.querySelector("#aiNext").onclick();
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(sera.zone,target.zone,"The deterministic movement preceding the attack executes from the same segment");
    assert.ok(target.hp<startHp,"The attack at the segment's uncertainty boundary executes");
    assert.equal(state.battle.metrics.ai.requests,2,"A fresh API call occurs only after the uncertain attack resolves");
    document.querySelector("#aiNext").onclick();
    assert.ok(sera.acted,"The second segment can end the PC turn");
  `,async(url,request)=>{
    pcSegmentCalls++;
    let body=JSON.parse(request.body),prompt=JSON.parse(body.input[1].content),choices=prompt.legal_choices;
    let choice=pcSegmentCalls===1?choices.find(x=>x.label.includes("Move to Gate")&&x.label.includes("Shield Bash")):choices.find(x=>x.label==="End turn");
    assert.ok(choice,"The request supplies the expected legal PC action segment");
    return{ok:true,status:200,json:async()=>({output_text:JSON.stringify({choice_id:choice.choice_id,reasoning:"Use the supplied legal segment."}),usage:{input_tokens:12,output_tokens:5,total_tokens:17}})};
  });
  assert.equal(pcSegmentCalls,2,"The move does not consume a separate API request");

  let phaseCalls=0;
  await runAsyncEngineTest(`
    commit=()=>{};
    save=()=>{};
    localStorage.setItem(AI_KEY_STORAGE,"test-secret-key");
    state.tweaks=defaultTweaks();
    for(const group of Object.values(state.tweaks.bandits))group.count=0;
    state.tweaks.bandits.melee.count=2;
    state.tweaks.bandits.melee.control="ai";
    startEncounter("bandits");
    state.battle.phase="enemy";
    let continued=false,actors=state.battle.enemies.filter(isAIControlled);
    await prepareAIEnemyPhase(()=>{continued=true});
    assert.equal(state.battle.metrics.ai.requests,1,"Every AI NPC is planned in one API request");
    assert.equal(continued,false,"The batched enemy plan waits behind a Next button");
    document.querySelector("#aiNext").onclick();
    assert.ok(continued,"Next accepts the complete batched enemy plan");
    assert.deepEqual(Object.keys(state.battle.aiEnemyPlans).sort(),actors.map(a=>a.id).sort(),"The one response contains a plan for every AI NPC");
  `,async(url,request)=>{
    phaseCalls++;
    let body=JSON.parse(request.body),situation=JSON.parse(body.input[1].content);
    let plans=situation.actors.map(actor=>({actor_id:actor.id,action_ids:["end"]}));
    return{ok:true,status:200,json:async()=>({output_text:JSON.stringify({reasoning:"Hold position.",plans}),usage:{input_tokens:20,output_tokens:8,total_tokens:28}})};
  });
  assert.equal(phaseCalls,1,"A complete multi-NPC phase makes exactly one fetch call");

  let executedPhaseCalls=0;
  await runAsyncEngineTest(`
    commit=()=>{};
    save=()=>{};
    localStorage.setItem(AI_KEY_STORAGE,"test-secret-key");
    state.tweaks=defaultTweaks();
    for(const group of Object.values(state.tweaks.bandits))group.count=0;
    state.tweaks.bandits.archer.count=1;
    state.tweaks.bandits.archer.control="ai";
    startEncounter("bandits");
    enemyPhase();
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.ok(document.querySelector("#aiNext").onclick,"The complete enemy plan waits behind Next");
    document.querySelector("#aiNext").onclick();
    assert.ok(state.battle.log.some(x=>x.text.includes("Archer 1 moves to Camp")),"Pressing Next executes and logs the stored enemy plan");
    assert.equal(state.battle.round,2,"The executed batched plan completes the enemy phase");
  `,async(url,request)=>{
    executedPhaseCalls++;
    let body=JSON.parse(request.body),situation=JSON.parse(body.input[1].content);
    let plans=situation.actors.map(actor=>{let sequence=actor.legal_turn_sequences.find(x=>x.label.includes("Move to Camp"));assert.ok(sequence,"The archer receives a legal movement sequence");return{actor_id:actor.id,action_ids:sequence.action_ids}});
    return{ok:true,status:200,json:async()=>({output_text:JSON.stringify({reasoning:"Move into the camp.",plans}),usage:{input_tokens:20,output_tokens:8,total_tokens:28}})};
  });
  assert.equal(executedPhaseCalls,1,"Executing the batched enemy phase does not make another request");

  runEngineTest(`
    state.tweaks=defaultTweaks();
    startEncounter("bandits");
    let archer=state.battle.enemies.find(e=>e.type==="archer"),leader=state.battle.enemies.find(e=>e.type==="leader");
    let archerPlans=legalAINPCTurnPlans(archer).sequences,leaderPlans=legalAINPCTurnPlans(leader).sequences;
    assert.ok(!archerPlans.some(x=>x.action_ids[0]==="aimed:mira"),"An archer is not offered an out-of-range Aimed Shot as its first action");
    assert.ok(!leaderPlans.some(x=>x.action_ids[0]==="move:1"),"A leader is not offered a non-adjacent move as its first action");
    assert.ok(leaderPlans.some(x=>x.action_ids[0]==="move:2"&&x.action_ids[1]==="move:1"),"The same destination remains available through a legal two-step sequence");
    let melee=state.battle.enemies.find(e=>e.type==="melee"); melee.zone=state.battle.pcs[0].zone; melee.ap=1;
    state.battle.pcs[0].hp=0;
    let repaired=repairAINPCAction(melee,"strike:ardan");
    assert.ok(repaired.id.startsWith("strike:")&&!repaired.id.endsWith(":ardan"),"A stale defeated target is replaced without ending the NPC turn");
  `);

  runEngineTest(`
    commit=()=>{};
    save=()=>{};
    state.tweaks=defaultTweaks();
    startEncounter("bandits");
    let enemy=state.battle.enemies[0],pc=state.battle.pcs[0],attack={power:55,type:"attack"};
    enemy.control="ai"; enemy.ap=1; enemy.aiBehavior="self_preserving";
    assert.equal(aiNPCShouldDefend(enemy,attack),true,"Self-Preserving NPCs always Defend when able");
    enemy.aiBehavior="optimal_killer"; enemy.hp=100;
    assert.equal(aiNPCShouldDefend(enemy,attack),false,"Optimal Killer preserves AP against nonlethal ordinary damage");
    enemy.hp=50;
    assert.equal(aiNPCShouldDefend(enemy,attack),true,"Optimal Killer Defends against lethal damage");
    pc.control="ai"; pc.aiBehavior="reckless"; pc.ap=1;
    let options=legalReactions(pc,enemy,false);
    assert.equal(aiPresetReaction(pc,options,55,false).id,"none","Reckless Hero never Defends");
    pc.aiBehavior="self_preserving";
    assert.equal(aiPresetReaction(pc,options,55,false).id,"defend","Self-Preserving PC always Defends when able");
  `);

  console.log("combat-engine tests passed");
})().catch(error=>{console.error(error);process.exitCode=1});
