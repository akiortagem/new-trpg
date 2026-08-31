"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const Core=require("../core.js");

function character(id="hero",name="Hero"){
  return{schemaVersion:1,kind:"character",id,name,role:"Tester",attributes:{str:15,end:10,vit:10,mnd:5,agi:10,dex:10,int:10},skills:{Awareness:2,Athletics:2,Blades:3},combat:{hp:100,stamina:10,mana:0,inventoryPoints:3,maxAp:3,def:10,defenseBonus:30},abilities:[{id:"strike",name:"Strike",kind:"attack",ap:1,stamina:0,mana:0,power:50,minRange:0,maxRange:0,attackBonus:35,tags:["Physical"]}]};
}
function outcome(text,next){return{text,next}}
function enemy(overrides={}){
  return{id:"foe",name:"Foe",preset:"optimal_killer",zone:"field",hp:200,maxAp:2,atk:40,def:5,dodge:20,threat:20,abilities:[{id:"claw",name:"Claw",kind:"attack",ap:1,stamina:0,mana:0,power:40,minRange:0,maxRange:0,tags:["Physical"]}],...overrides};
}
function combatScene(overrides={}){
  return{type:"combat",title:"Test Fight",ambush:false,battlefield:{zones:[{id:"field",name:"Field"}],links:[]},pcStarts:{$main:"field",ally:"field"},enemies:[enemy()],victory:outcome("The foe falls.","won"),defeat:outcome("The party falls.","lost"),...overrides};
}
function adventure(startScene="test",sceneOverrides={}){
  const ally=character("ally","Ally");
  return{schemaVersion:2,kind:"adventure",id:"test-adventure",title:"Test Adventure",startScene,questDays:2,initialState:{flags:{warned:false},counters:{}},clocks:{search:{label:"Search",size:4}},party:[ally],scenes:{test:{type:"scene",title:"The Test",text:["Choose.",{speaker:"Ally",text:"I can read the trail."}],choices:[{id:"check",label:"Make the check",resolution:"check",actor:{mode:"select",eligible:["*"]},check:{goal:"Find the trail",approach:"Study the marks",baseTN:60,attributes:["int","dex"],skill:"Awareness",situationalModifiers:[],clock:"search"},success:outcome("The trail is found.","fight"),failure:outcome("The trail goes cold.","lost"),twistPreview:"The trail is found, but danger is warned.",twist:{text:"The trail is found after a lookout escapes.",next:"fight",effects:[{type:"set",path:"flags.warned",value:true}]}}]},fight:combatScene(),won:{type:"ending",title:"Won",outcome:"victory",text:"Victory."},lost:{type:"ending",title:"Lost",outcome:"defeat",text:"Defeat."},...sceneOverrides}};
}

test("character and adventure schemas accept a complete valid pair",()=>{
  assert.deepEqual(Core.validateCharacter(character()),[]);
  assert.deepEqual(Core.validateAdventure(adventure()),[]);
});

test("adventures require exactly one combat scene and valid next references",()=>{
  const value=adventure();delete value.scenes.fight;const errors=Core.validateAdventure(value);
  assert.ok(errors.some(x=>x.includes("exactly one combat scene")));
  assert.ok(errors.some(x=>x.includes("unknown next scene fight")));
});

test("any valid main-character id replaces $main without adventure restrictions",()=>{
  const run=Core.createRun(character("unexpected-main","Unexpected Main"),adventure());
  assert.equal(run.mainCharacterId,"unexpected-main");
  assert.deepEqual(run.characters.map(x=>x.id),["unexpected-main","ally"]);
});

test("checks reveal and use the RAW TN formula",()=>{
  const run=Core.createRun(character(),adventure()),choice=Core.visibleChoices(run)[0];
  const preview=Core.checkTotal(run,choice,"hero");
  assert.equal(preview.tn,90,"Base 60 + INT 10 + DEX 10 + Awareness rank 2 × 5");
  const result=Core.resolveChoice(run,"check","hero",()=>0.09);
  assert.equal(result.result,"success");
  assert.equal(result.roll,10);
  assert.equal(run.world.clocks.search.filled,1);
  assert.ok(run.combat,"success enters the combat scene");
});

test("natural 01–05 fills two progress-clock segments",()=>{
  const value=adventure();value.scenes.test.choices[0].success.next="test";
  const run=Core.createRun(character(),value);Core.resolveChoice(run,"check","hero",()=>0);
  assert.equal(run.world.clocks.search.filled,2);
  assert.ok(run.log.some(x=>x.type==="clock.progress"&&x.data.segments===2));
});

test("checks require a Base TN from 25 to 60",()=>{
  const missing=adventure();delete missing.scenes.test.choices[0].check.baseTN;assert.ok(Core.validateAdventure(missing).some(x=>x.includes("check.baseTN")));
  const high=adventure();high.scenes.test.choices[0].check.baseTN=61;assert.ok(Core.validateAdventure(high).some(x=>x.includes("cannot exceed 60")));
});

test("Base TN uses a new adventure and save-engine version",()=>{
  const legacy=adventure();legacy.schemaVersion=1;delete legacy.scenes.test.choices[0].check.baseTN;legacy.scenes.test.choices[0].check.gmModifier=0;
  assert.equal(Core.CHARACTER_SCHEMA_VERSION,1);assert.equal(Core.ADVENTURE_SCHEMA_VERSION,2);assert.equal(Core.ENGINE_VERSION,2);
  const errors=Core.validateAdventure(legacy);assert.ok(errors.some(x=>x.includes("schemaVersion: must be 2")));assert.ok(errors.some(x=>x.includes("check.baseTN")));
});

test("scene narration and character dialogue enter the presentation queue",()=>{
  const run=Core.createRun(character(),adventure());assert.ok(run.log.some(x=>x.type==="story.narration"&&x.message==="Choose."));assert.ok(run.log.some(x=>x.type==="story.dialogue"&&x.data.speaker==="Ally"));
});

test("failed rolls wait for the player to accept or decline the authored twist",()=>{
  const accepted=Core.createRun(character(),adventure());
  const result=Core.resolveChoice(accepted,"check","hero",()=>0.9);
  assert.equal(result.result,"failed-check");
  assert.equal(accepted.pendingTwist.twistPreview,"The trail is found, but danger is warned.");
  assert.equal(accepted.world.flags.warned,false,"the complication is not applied before acceptance");
  Core.resolveTwist(accepted,true,()=>0.5);
  assert.equal(accepted.world.flags.warned,true);
  assert.ok(accepted.combat,"accepting the twist achieves the goal");

  const declined=Core.createRun(character(),adventure());Core.resolveChoice(declined,"check","hero",()=>0.9);Core.resolveTwist(declined,false);
  assert.equal(declined.status,"defeat");
  assert.equal(declined.world.flags.warned,false);
});

test("author-marked automatic choices never roll",()=>{
  const value=adventure("automatic",{automatic:{type:"scene",title:"Certain",text:["The road is clear."],choices:[{id:"continue",label:"Walk onward",resolution:"automatic",reason:"Ordinary travel",outcome:{text:"The party arrives.",next:"test",effects:[{type:"add",path:"quest.elapsedDays",value:1}]}}]}});
  const run=Core.createRun(character(),value);const result=Core.resolveChoice(run,"continue",null,()=>{throw new Error("automatic resolution must not roll")});
  assert.equal(result.result,"automatic");assert.equal(run.world.quest.elapsedDays,1);assert.equal(run.sceneId,"test");
});

test("Critical Attack adds twice the chosen attribute and cannot be Defended",()=>{
  const value=adventure("fight");value.scenes.fight.enemies=[enemy({hp:70,preset:"self_preserving"})];
  const run=Core.createRun(character(),value,()=>0);const combat=run.combat,hero=combat.pcs.find(x=>x.id==="hero");
  assert.equal(combat.nextCriticalRound,1);
  Core.useCritical(run,"attack",hero.id,"str");
  Core.performPcAbility(run,hero.id,"strike",["foe"],{},()=>0.99);
  assert.equal(run.status,"victory","50 ATK + STR 15 × 2 defeats 70 HP");
  assert.ok(run.log.some(x=>x.type==="combat.critical.attack"));
  assert.ok(!run.log.some(x=>x.type==="combat.npc.defended"),"Critical Attack cannot be Defended");
});

test("combat rolls preserve the fixed 01–05 exceptional band",()=>{
  const main=character();main.abilities[0].attackBonus=0;const value=adventure("fight");value.scenes.fight.enemies=[enemy({preset:"self_preserving",dodge:0,def:20})];const run=Core.createRun(main,value,()=>0.5),foe=run.combat.enemies[0];Core.performPcAbility(run,"hero","strike",["foe"],{},()=>0);
  assert.equal(foe.hp,150,"a natural 01 deals full ATK even when the calculated TN is 0");
});

test("enemy phase pauses for player reactions and applies PC Defend",()=>{
  const run=Core.createRun(character(),adventure("fight"),()=>0.5),combat=run.combat;
  Core.endPcTurn(run,"hero",()=>0.1);Core.endPcTurn(run,"ally",()=>0.1);
  assert.equal(combat.phase,"enemy");assert.equal(combat.pending.type,"reaction");
  const target=combat.pcs.find(x=>x.id===combat.pending.targetId),before=target.hp,beforeAp=target.ap;
  Core.resolveReaction(run,"defend",()=>0.1);
  assert.equal(target.hp,before-30,"successful Defend applies 10 DEF to 40 ATK");
  assert.equal(target.ap,beforeAp-1);
  assert.equal(combat.metrics.pcDefenseRolls,1);
  assert.ok(combat.pending,"the enemy's remaining AP produces the next decision instead of silently resolving it");
});

test("an ambush reverses round-one phase order without removing the PCs' phase",()=>{
  const value=adventure("fight");value.scenes.fight.ambush=true;const run=Core.createRun(character(),value,()=>0.5),combat=run.combat;
  while(combat.pending)Core.resolveReaction(run,"take",()=>0.5);
  assert.equal(combat.round,1);assert.equal(combat.phase,"pc","PCs receive the second phase of the ambush round");
  Core.endPcTurn(run,"hero");Core.endPcTurn(run,"ally");assert.equal(combat.round,2);assert.equal(combat.phase,"pc","normal PC-first order resumes in round two");
});

test("self-preserving NPCs retain their last AP while badly wounded",()=>{
  const value=adventure("fight");value.scenes.fight.enemies=[enemy({hp:80,preset:"self_preserving"})];
  const run=Core.createRun(character(),value,()=>0.5),combat=run.combat,foe=combat.enemies[0];foe.hp=40;
  Core.endPcTurn(run,"hero");Core.endPcTurn(run,"ally");
  assert.equal(combat.pending.type,"reaction","the first attack still gives the player a reaction");Core.resolveReaction(run,"take");
  assert.equal(combat.pending,null);assert.equal(combat.phase,"pc");assert.equal(foe.ap,2,"the retained AP expires and refreshes for the next round");assert.ok(combat.log.some(x=>x.type==="npc.turn-ended"&&x.data.retainedAp===1));
});

test("deterministic NPC presets can use Recover on Persistent Damage",()=>{
  const value=adventure("fight");value.scenes.fight.enemies=[enemy({preset:"self_preserving"})];const run=Core.createRun(character(),value,()=>0.5),combat=run.combat,foe=combat.enemies[0];foe.conditions.push({id:"Persistent Damage",amount:10});
  Core.endPcTurn(run,"hero");Core.endPcTurn(run,"ally");assert.equal(foe.hp,190);assert.ok(!foe.conditions.some(x=>x.id==="Persistent Damage"));assert.ok(combat.log.some(x=>x.type==="npc.recover"));
});

test("long connections create transit that forbids ordinary actions and can be abandoned",()=>{
  const value=adventure("fight"),fight=value.scenes.fight;fight.battlefield.zones.push({id:"far",name:"Far Side"});fight.battlefield.links=[{from:"field",to:"far",cost:5}];fight.enemies[0].zone="far";
  const run=Core.createRun(character(),value,()=>0.5),hero=run.combat.pcs.find(x=>x.id==="hero");Core.beginPcTurn(run,"hero");Core.movePc(run,"hero","far");
  assert.deepEqual(hero.transit,{from:"field",to:"far",total:5,progress:3});assert.equal(hero.ap,0);
  assert.throws(()=>Core.performPcAbility(run,"hero","strike",["foe"]),/cannot act/);
  Core.abandonTransit(run,"hero");assert.equal(hero.transit,null);assert.equal(hero.zone,"field");
});

test("attack range counts zone links rather than Move costs",()=>{
  const value=adventure("fight"),fight=value.scenes.fight;fight.battlefield.zones.push({id:"far",name:"Far Side"});fight.battlefield.links=[{from:"field",to:"far",cost:5}];fight.enemies[0].zone="far";const main=character();main.abilities[0].maxRange=1;
  const run=Core.createRun(main,value,()=>0.5),hero=run.combat.pcs.find(x=>x.id==="hero"),foe=run.combat.enemies[0];
  assert.ok(Core.legalAbilityTargets(run.combat,hero,hero.abilities[0]).includes(foe));
});

test("a PC turn cannot be interleaved with another PC's turn",()=>{
  const run=Core.createRun(character(),adventure("fight"),()=>0.5);Core.beginPcTurn(run,"hero");
  assert.throws(()=>Core.beginPcTurn(run,"ally"),/must finish their turn/);assert.equal(run.combat.selectedPcId,"hero");
  Core.endPcTurn(run,"hero");assert.doesNotThrow(()=>Core.beginPcTurn(run,"ally"));
});

test("prepared multi-target abilities recheck and enforce every target requirement",()=>{
  const main=character();main.abilities=[{id:"sweep",name:"Sweep",kind:"multi",ap:1,stamina:0,mana:0,power:20,minRange:0,maxRange:0,minTargets:2,maxTargets:2,attackBonus:0}];const value=adventure("fight");value.scenes.fight.enemies=[enemy(),enemy({id:"foe-2",name:"Second Foe"})];
  const run=Core.createRun(main,value,()=>0.5),combat=run.combat,hero=combat.pcs.find(x=>x.id==="hero");Core.prepare(run,"hero","sweep","enemy-attacks-ally");Core.endPcTurn(run,"hero");Core.endPcTurn(run,"ally");
  assert.equal(combat.pending.type,"prepared");assert.throws(()=>Core.resolvePrepared(run,true,["foe"]),/Choose 2–2 legal targets/);assert.equal(combat.pending.type,"prepared");
  Core.resolvePrepared(run,true,["foe","foe-2"],()=>0.5);assert.equal(combat.enemies[0].hp,185);assert.equal(combat.enemies[1].hp,185);assert.deepEqual(combat.log.find(x=>x.type==="prepared.triggered").data.targetIds,["foe","foe-2"]);
});

test("Critical Recovery lets a PC downed by turn-start damage resume with retained AP",()=>{
  const run=Core.createRun(character(),adventure("fight"),()=>0),combat=run.combat,hero=combat.pcs.find(x=>x.id==="hero");hero.hp=10;hero.ap=2;hero.conditions.push({id:"Persistent Damage",amount:10});Core.beginPcTurn(run,"hero");
  assert.equal(hero.hp,0);assert.equal(hero.acted,true);Core.useCritical(run,"recovery","hero");assert.equal(hero.hp,50);assert.equal(hero.ap,2);assert.equal(hero.acted,false);assert.equal(combat.selectedPcId,"hero");
});

test("Persistent Damage is applied at the start of a PC's normal turn",()=>{
  const run=Core.createRun(character(),adventure("fight"),()=>0.5),hero=run.combat.pcs.find(x=>x.id==="hero");hero.conditions.push({id:"Persistent Damage",amount:12,expression:"Burning"});
  Core.beginPcTurn(run,"hero");assert.equal(hero.hp,88);Core.beginPcTurn(run,"hero");assert.equal(hero.hp,88,"selecting the same active PC again does not repeat turn-start damage");
});

test("Rallied modifies ATK and presents its invoker with the next-round sustain cost",()=>{
  const main=character();main.abilities.unshift({id:"rally",name:"Battle Cry",kind:"rally",ap:1,stamina:0,mana:0,power:0,minRange:0,maxRange:0,minTargets:2,maxTargets:2});
  const run=Core.createRun(main,adventure("fight"),()=>0),combat=run.combat,hero=combat.pcs.find(x=>x.id==="hero"),foe=combat.enemies[0];Core.beginPcTurn(run,"hero");Core.performPcAbility(run,"hero","rally",["hero","ally"]);Core.performPcAbility(run,"hero","strike",["foe"],{},()=>0);
  assert.equal(foe.hp,140,"Rallied increases the 50 ATK Strike to 60");assert.ok(hero.conditions.some(x=>x.id==="Rallied"));
  Core.endPcTurn(run,"hero");Core.endPcTurn(run,"ally");while(combat.pending)Core.resolveReaction(run,"take",()=>0.5);
  assert.equal(combat.phase,"pc");assert.equal(hero.rallyDue,true);Core.beginPcTurn(run,"hero");Core.resolveRallySustain(run,"hero",true);assert.equal(hero.ap,2);assert.ok(hero.conditions.some(x=>x.id==="Rallied"));
});

test("authored Interact actions apply predetermined battlefield outcomes",()=>{
  const value=adventure("fight");value.scenes.fight.interactions=[{id:"drop-gate",name:"Drop Gate",description:"Pull the lever",text:"The gate crashes onto the foe.",zone:"field",ap:1,once:true,effects:[{type:"damage-enemy",targetId:"foe",amount:200},{type:"set",path:"flags.gateDropped",value:true}]}];
  const run=Core.createRun(character(),value,()=>0.5);Core.beginPcTurn(run,"hero");assert.equal(Core.availableInteractions(run.combat,run.combat.pcs[0]).length,1);Core.performInteraction(run,"hero","drop-gate");
  assert.equal(run.status,"victory");assert.equal(run.world.flags.gateDropped,true);assert.ok(run.log.some(x=>x.type==="combat.pc.interacted"));
});

test("the complete miniature adventure in the authoring guide is valid JSON and validates",()=>{
  const markdown=fs.readFileSync(path.resolve(__dirname,"..","AUTHORING.md"),"utf8"),section=markdown.split("## Complete miniature adventure")[1],match=section.match(/```json\n([\s\S]*?)\n```/);
  assert.ok(match,"the guide contains a complete JSON example");const value=JSON.parse(match[1]);assert.deepEqual(Core.validateAdventure(value),[]);
});

test("static application exposes local files, three save slots, and log export",()=>{
  const root=path.resolve(__dirname,"..");const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),source=fs.readFileSync(path.join(root,"app.js"),"utf8");
  assert.match(html,/id="characterFile"|id="app"/);
  assert.match(source,/\[1,2,3\]/);
  assert.match(source,/new Blob\(\[JSON\.stringify\(payload,null,2\)\]/);
  assert.doesNotMatch(source,/fetch\s*\(/,"the app makes no network request");
  assert.match(source,/typeVnText/);assert.match(source,/class="vn-textbox/);assert.match(source,/Click to reveal/);assert.doesNotMatch(source,/storyStreamHtml/);
  assert.match(source,/function vnHistoryHtml/);assert.match(source,/id="vnHistory"/);assert.match(source,/entry\.sequence<=sequence&&isVnEntry\(entry\)/,"only previously revealed VN messages appear above the active box");
  assert.match(source,/else if\(nextVnEntry\(\)\)renderVnEntry/,"queued VN entries take precedence over combat rendering");
  assert.doesNotMatch(source,/!run\.combat&&nextVnEntry/,"combat transitions must not bypass queued story entries");
});
