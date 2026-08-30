(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.TextGameCore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";

const VERSION=1;
const ATTRIBUTES=["str","end","vit","mnd","agi","dex","int"];
const NPC_PRESETS=["optimal_killer","self_preserving","dramatic_gm"];
const ATTACK_KINDS=["attack","multi","push","persistent","rush"];
const clone=value=>JSON.parse(JSON.stringify(value));
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const percentile=(random=Math.random)=>Math.floor(random()*100)+1;
const d6=(random=Math.random)=>Math.floor(random()*6)+1;
const byId=(items,id)=>items.find(item=>item.id===id);
const isObject=value=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);

function error(path,message){return `${path}: ${message}`}
function requireString(errors,value,path){if(typeof value!=="string"||!value.trim())errors.push(error(path,"must be a non-empty string"))}
function requireNumber(errors,value,path,min=null){if(typeof value!=="number"||!Number.isFinite(value)||(min!==null&&value<min))errors.push(error(path,`must be a number${min===null?"":` of at least ${min}`}`))}

function validateAbility(ability,path,errors){
  if(!isObject(ability)){errors.push(error(path,"must be an object"));return}
  requireString(errors,ability.id,`${path}.id`);requireString(errors,ability.name,`${path}.name`);
  if(![...ATTACK_KINDS,"heal","multiheal","rally"].includes(ability.kind))errors.push(error(`${path}.kind`,"must be attack, multi, push, persistent, rush, heal, multiheal, or rally"));
  for(const key of ["ap","stamina","mana"])requireNumber(errors,ability[key]??0,`${path}.${key}`,0);
  requireNumber(errors,ability.power,`${path}.power`,0);requireNumber(errors,ability.minRange??0,`${path}.minRange`,0);requireNumber(errors,ability.maxRange??0,`${path}.maxRange`,0);
  if(Number.isFinite(ability.minRange)&&Number.isFinite(ability.maxRange)&&ability.minRange>ability.maxRange)errors.push(error(path,"minRange cannot exceed maxRange"));
  if(ATTACK_KINDS.includes(ability.kind))requireNumber(errors,ability.attackBonus,`${path}.attackBonus`,0);
  if(["multi","multiheal","rally"].includes(ability.kind)){
    requireNumber(errors,ability.minTargets,`${path}.minTargets`,2);requireNumber(errors,ability.maxTargets,`${path}.maxTargets`,2);
    if(Number.isFinite(ability.minTargets)&&Number.isFinite(ability.maxTargets)&&ability.minTargets>ability.maxTargets)errors.push(error(path,"minTargets cannot exceed maxTargets"));
  }
}

function validateCharacter(character,path="character"){
  const errors=[];
  if(!isObject(character))return[error(path,"must be a JSON object")];
  if(character.schemaVersion!==VERSION)errors.push(error(`${path}.schemaVersion`,`must be ${VERSION}`));
  if(character.kind!=="character")errors.push(error(`${path}.kind`,"must be character"));
  requireString(errors,character.id,`${path}.id`);requireString(errors,character.name,`${path}.name`);requireString(errors,character.role,`${path}.role`);
  if(!isObject(character.attributes))errors.push(error(`${path}.attributes`,"must be an object"));
  else for(const key of ATTRIBUTES)requireNumber(errors,character.attributes[key],`${path}.attributes.${key}`,0);
  if(!isObject(character.skills))errors.push(error(`${path}.skills`,"must be an object of skill ranks"));
  else for(const [name,rank] of Object.entries(character.skills)){requireNumber(errors,rank,`${path}.skills.${name}`,0);if(Number.isFinite(rank)&&rank>5)errors.push(error(`${path}.skills.${name}`,"cannot exceed rank 5"))}
  if(!isObject(character.combat))errors.push(error(`${path}.combat`,"must be an object"));
  else for(const key of ["hp","stamina","mana","inventoryPoints","maxAp","def","defenseBonus"])requireNumber(errors,character.combat[key],`${path}.combat.${key}`,0);
  if(!Array.isArray(character.abilities)||!character.abilities.length)errors.push(error(`${path}.abilities`,"must contain at least one combat ability"));
  else character.abilities.forEach((ability,index)=>validateAbility(ability,`${path}.abilities[${index}]`,errors));
  const ids=(character.abilities||[]).map(x=>x.id);if(new Set(ids).size!==ids.length)errors.push(error(`${path}.abilities`,"ability ids must be unique"));
  return errors;
}

function outcomeRefs(choice){
  if(choice.resolution==="automatic")return[choice.outcome];
  if(choice.resolution==="check")return[choice.success,choice.failure,choice.twist];
  return[];
}
function validateOutcome(outcome,path,errors){
  if(!isObject(outcome)){errors.push(error(path,"must be an object"));return}
  requireString(errors,outcome.text,`${path}.text`);
  if(!outcome.next&&!outcome.end)errors.push(error(path,"must provide next or end"));
  if(outcome.end&&!['victory','defeat'].includes(outcome.end))errors.push(error(`${path}.end`,"must be victory or defeat"));
  if(outcome.effects&&!Array.isArray(outcome.effects))errors.push(error(`${path}.effects`,"must be an array"));
}
function validateChoice(choice,path,errors,companionIds,clockIds){
  if(!isObject(choice)){errors.push(error(path,"must be an object"));return}
  requireString(errors,choice.id,`${path}.id`);requireString(errors,choice.label,`${path}.label`);
  if(!["automatic","check"].includes(choice.resolution))errors.push(error(`${path}.resolution`,"must be automatic or check"));
  if(choice.resolution==="automatic")validateOutcome(choice.outcome,`${path}.outcome`,errors);
  if(choice.resolution==="check"){
    if(!isObject(choice.actor))errors.push(error(`${path}.actor`,"must describe a fixed or selectable actor"));
    else if(choice.actor.mode==="fixed"){
      if(choice.actor.id!=="$main"&&!companionIds.has(choice.actor.id))errors.push(error(`${path}.actor.id`,"must be $main or an adventure companion id"));
    }else if(choice.actor.mode==="select"){
      if(!Array.isArray(choice.actor.eligible)||!choice.actor.eligible.length)errors.push(error(`${path}.actor.eligible`,"must list $main, companion ids, or *"));
      else for(const id of choice.actor.eligible)if(!["*","$main"].includes(id)&&!companionIds.has(id))errors.push(error(`${path}.actor.eligible`,`contains unknown companion id ${id}`));
    }else errors.push(error(`${path}.actor.mode`,"must be fixed or select"));
    if(!isObject(choice.check))errors.push(error(`${path}.check`,"must be an object"));
    else{
      if(!Array.isArray(choice.check.attributes)||choice.check.attributes.length!==2||choice.check.attributes.some(x=>!ATTRIBUTES.includes(x)))errors.push(error(`${path}.check.attributes`,"must contain exactly two attribute ids"));
      requireString(errors,choice.check.skill,`${path}.check.skill`);requireNumber(errors,choice.check.gmModifier,`${path}.check.gmModifier`);
      if(choice.check.situationalModifiers&&!Array.isArray(choice.check.situationalModifiers))errors.push(error(`${path}.check.situationalModifiers`,"must be an array"));
      if(choice.check.clock&&!clockIds.has(choice.check.clock))errors.push(error(`${path}.check.clock`,`references unknown clock ${choice.check.clock}`));
    }
    validateOutcome(choice.success,`${path}.success`,errors);validateOutcome(choice.failure,`${path}.failure`,errors);validateOutcome(choice.twist,`${path}.twist`,errors);
    requireString(errors,choice.twistPreview,`${path}.twistPreview`);
  }
}
function validateCombat(scene,path,errors,partyIds){
  if(!isObject(scene.battlefield)){errors.push(error(`${path}.battlefield`,"must be an object"));return}
  const zones=scene.battlefield.zones;
  if(!Array.isArray(zones)||!zones.length)errors.push(error(`${path}.battlefield.zones`,"must contain zones"));
  const zoneIds=new Set((zones||[]).map(x=>x.id));
  if(zoneIds.size!==(zones||[]).length)errors.push(error(`${path}.battlefield.zones`,"zone ids must be unique"));
  for(const [index,link] of (scene.battlefield.links||[]).entries()){
    if(!zoneIds.has(link.from)||!zoneIds.has(link.to))errors.push(error(`${path}.battlefield.links[${index}]`,"references an unknown zone"));
    requireNumber(errors,link.cost,`${path}.battlefield.links[${index}].cost`,1);
  }
  if(!isObject(scene.pcStarts))errors.push(error(`${path}.pcStarts`,"must map $main and every companion to zones"));
  else for(const id of partyIds)if(!zoneIds.has(scene.pcStarts[id]))errors.push(error(`${path}.pcStarts.${id}`,"must reference a battlefield zone"));
  if(!Array.isArray(scene.enemies)||!scene.enemies.length)errors.push(error(`${path}.enemies`,"must contain at least one enemy"));
  for(const [index,enemy] of (scene.enemies||[]).entries()){
    const ep=`${path}.enemies[${index}]`;requireString(errors,enemy.id,`${ep}.id`);requireString(errors,enemy.name,`${ep}.name`);
    if(!NPC_PRESETS.includes(enemy.preset))errors.push(error(`${ep}.preset`,`must be one of ${NPC_PRESETS.join(", ")}`));
    if(!zoneIds.has(enemy.zone))errors.push(error(`${ep}.zone`,"must reference a battlefield zone"));
    for(const key of ["hp","maxAp","atk","def","dodge","threat"])requireNumber(errors,enemy[key],`${ep}.${key}`,0);
    if(!Array.isArray(enemy.abilities)||!enemy.abilities.length)errors.push(error(`${ep}.abilities`,"must contain at least one ability"));
    else enemy.abilities.forEach((ability,aIndex)=>validateAbility({...ability,attackBonus:ability.attackBonus??0},`${ep}.abilities[${aIndex}]`,errors));
  }
  const enemyIds=(scene.enemies||[]).map(x=>x.id);if(new Set(enemyIds).size!==enemyIds.length)errors.push(error(`${path}.enemies`,"enemy ids must be unique"));
  for(const [index,interaction] of (scene.interactions||[]).entries()){
    const ip=`${path}.interactions[${index}]`;requireString(errors,interaction.id,`${ip}.id`);requireString(errors,interaction.name,`${ip}.name`);requireString(errors,interaction.text,`${ip}.text`);requireNumber(errors,interaction.ap??1,`${ip}.ap`,0);if(!zoneIds.has(interaction.zone))errors.push(error(`${ip}.zone`,"must reference a battlefield zone"));if(interaction.effects&&!Array.isArray(interaction.effects))errors.push(error(`${ip}.effects`,"must be an array"));
  }
  const interactionIds=(scene.interactions||[]).map(x=>x.id);if(new Set(interactionIds).size!==interactionIds.length)errors.push(error(`${path}.interactions`,"interaction ids must be unique"));
  validateOutcome(scene.victory,`${path}.victory`,errors);validateOutcome(scene.defeat,`${path}.defeat`,errors);
}
function validateAdventure(adventure){
  const errors=[];
  if(!isObject(adventure))return[error("adventure","must be a JSON object")];
  if(adventure.schemaVersion!==VERSION)errors.push(error("adventure.schemaVersion",`must be ${VERSION}`));
  if(adventure.kind!=="adventure")errors.push(error("adventure.kind","must be adventure"));
  requireString(errors,adventure.id,"adventure.id");requireString(errors,adventure.title,"adventure.title");requireString(errors,adventure.startScene,"adventure.startScene");
  if(!Array.isArray(adventure.party))errors.push(error("adventure.party","must be an array of companion characters"));
  const companionIds=new Set();
  for(const [index,character] of (adventure.party||[]).entries()){
    validateCharacter(character,`adventure.party[${index}]`).forEach(x=>errors.push(x));
    if(character?.id){if(character.id==="$main")errors.push(error(`adventure.party[${index}].id`,"is reserved for the selected main character"));if(companionIds.has(character.id))errors.push(error("adventure.party","companion ids must be unique"));companionIds.add(character.id)}
  }
  const clockIds=new Set(Object.keys(adventure.clocks||{}));for(const [id,clock] of Object.entries(adventure.clocks||{})){requireString(errors,clock.label,`adventure.clocks.${id}.label`);if(![2,4,6].includes(clock.size))errors.push(error(`adventure.clocks.${id}.size`,"must be 2, 4, or 6"))}
  if(!isObject(adventure.scenes))errors.push(error("adventure.scenes","must be an object keyed by scene id"));
  const scenes=adventure.scenes||{};
  if(adventure.startScene&&!scenes[adventure.startScene])errors.push(error("adventure.startScene","references an unknown scene"));
  let combatCount=0;
  for(const [id,scene] of Object.entries(scenes)){
    const path=`adventure.scenes.${id}`;
    if(!["scene","combat","ending"].includes(scene.type))errors.push(error(`${path}.type`,"must be scene, combat, or ending"));
    requireString(errors,scene.title,`${path}.title`);
    if(scene.type==="scene"){
      if(!Array.isArray(scene.text)||!scene.text.length)errors.push(error(`${path}.text`,"must contain at least one passage"));
      if(!Array.isArray(scene.choices)||!scene.choices.length)errors.push(error(`${path}.choices`,"must contain at least one choice"));
      (scene.choices||[]).forEach((choice,index)=>validateChoice(choice,`${path}.choices[${index}]`,errors,companionIds,clockIds));const choiceIds=(scene.choices||[]).map(x=>x.id);if(new Set(choiceIds).size!==choiceIds.length)errors.push(error(`${path}.choices`,"choice ids must be unique within a scene"));
    }
    if(scene.type==="combat"){combatCount++;validateCombat(scene,path,errors,new Set(["$main",...companionIds]))}
    if(scene.type==="ending"&&!['victory','defeat'].includes(scene.outcome))errors.push(error(`${path}.outcome`,"must be victory or defeat"));
  }
  if(combatCount!==1)errors.push(error("adventure.scenes","must contain exactly one combat scene"));
  const refs=[];
  for(const scene of Object.values(scenes)){
    if(scene.type==="scene")for(const choice of scene.choices||[])for(const outcome of outcomeRefs(choice))if(outcome?.next)refs.push(outcome.next);
    if(scene.type==="combat")for(const outcome of [scene.victory,scene.defeat])if(outcome?.next)refs.push(outcome.next);
  }
  for(const ref of refs)if(!scenes[ref])errors.push(error("adventure.scenes",`references unknown next scene ${ref}`));
  return errors;
}

function log(run,type,message,data={}){
  run.log.push({sequence:run.log.length+1,at:new Date().toISOString(),type,message,data:clone(data)});
}
function resolveActorId(run,id){return id==="$main"?run.mainCharacterId:id}
function party(run){return run.characters}
function character(run,id){return byId(run.characters,resolveActorId(run,id))}
function scene(run){return run.adventure.scenes[run.sceneId]}

function initialClocks(adventure){
  return Object.fromEntries(Object.entries(adventure.clocks||{}).map(([id,value])=>[id,{label:value.label,size:value.size,filled:value.filled||0}]));
}
function createRun(mainCharacter,adventure,random=Math.random){
  const characterErrors=validateCharacter(mainCharacter),adventureErrors=validateAdventure(adventure);
  if(characterErrors.length||adventureErrors.length)throw new Error([...characterErrors,...adventureErrors].join("\n"));
  const main=clone(mainCharacter),companions=clone(adventure.party);
  if(companions.some(x=>x.id===main.id))throw new Error(`The main character id ${main.id} conflicts with an adventure companion id.`);
  const run={engineVersion:VERSION,runId:`run-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,adventure:clone(adventure),mainCharacterTemplate:clone(mainCharacter),mainCharacterId:main.id,characters:[main,...companions],sceneId:adventure.startScene,status:"playing",ending:null,world:{flags:clone(adventure.initialState?.flags||{}),counters:clone(adventure.initialState?.counters||{}),quest:{remainingDays:adventure.questDays??null,elapsedDays:0},clocks:initialClocks(adventure)},pendingTwist:null,combat:null,log:[],startedAt:new Date().toISOString()};
  log(run,"run.started",`Started ${adventure.title} with ${main.name}.`,{adventureId:adventure.id,mainCharacterId:main.id});
  enterCurrentScene(run,random);
  return run;
}
function enterCurrentScene(run,random=Math.random){
  const current=scene(run);if(!current)throw new Error(`Unknown scene ${run.sceneId}.`);
  log(run,"scene.entered",`Entered ${current.title}.`,{sceneId:run.sceneId,type:current.type});
  if(current.type==="ending"){run.status=current.outcome;run.ending={title:current.title,text:current.text||`Adventure ended in ${current.outcome}.`,outcome:current.outcome};log(run,"run.ended",run.ending.text,{outcome:current.outcome});}
  if(current.type==="combat")startCombat(run,current,random);
}
function pathValue(run,path){
  const parts=path.split(".");let value=run.world;
  for(const part of parts){if(["__proto__","constructor","prototype"].includes(part))return undefined;value=value?.[part]}
  return value;
}
function matchesCondition(run,condition){
  const value=pathValue(run,condition.path);
  if(Object.prototype.hasOwnProperty.call(condition,"equals"))return value===condition.equals;
  if(Object.prototype.hasOwnProperty.call(condition,"notEquals"))return value!==condition.notEquals;
  if(Object.prototype.hasOwnProperty.call(condition,"gte"))return value>=condition.gte;
  if(Object.prototype.hasOwnProperty.call(condition,"lte"))return value<=condition.lte;
  return Boolean(value);
}
function visible(run,item){
  if(!item.when)return true;
  if(Array.isArray(item.when))return item.when.every(x=>matchesCondition(run,x));
  if(item.when.all)return item.when.all.every(x=>matchesCondition(run,x));
  if(item.when.any)return item.when.any.some(x=>matchesCondition(run,x));
  return matchesCondition(run,item.when);
}
function visibleChoices(run){return(scene(run)?.choices||[]).filter(x=>visible(run,x))}
function choiceActors(run,choice){
  if(choice.resolution!=="check")return[];
  if(choice.actor.mode==="fixed")return[character(run,choice.actor.id)].filter(Boolean);
  const eligible=choice.actor.eligible||["*"];
  if(eligible.includes("*"))return party(run);
  return eligible.map(id=>character(run,id)).filter(Boolean);
}
function checkTotal(run,choice,actorId){
  const actor=character(run,actorId);if(!actor)throw new Error("The selected actor is not eligible.");
  const [first,second]=choice.check.attributes,skillRank=actor.skills[choice.check.skill]||0;
  const situational=(choice.check.situationalModifiers||[]).reduce((sum,item)=>sum+item.value,0);
  return{tn:actor.attributes[first]+actor.attributes[second]+skillRank*5+choice.check.gmModifier+situational,first:first,second:second,skill:choice.check.skill,skillRank,gmModifier:choice.check.gmModifier,situationalModifiers:clone(choice.check.situationalModifiers||[])};
}
function setWorldPath(run,path,value,add=false){
  const parts=path.split(".");if(!["flags","counters","quest","clocks"].includes(parts[0])||parts.some(x=>["__proto__","constructor","prototype"].includes(x)))throw new Error(`Unsafe effect path ${path}.`);
  let target=run.world;for(const part of parts.slice(0,-1)){if(!isObject(target[part]))target[part]={};target=target[part]}
  const key=parts.at(-1);target[key]=add?(Number(target[key])||0)+value:value;
}
function applyEffects(run,effects=[]){
  for(const effect of effects){
    if(effect.type==="set")setWorldPath(run,effect.path,clone(effect.value));
    else if(effect.type==="add")setWorldPath(run,effect.path,effect.value,true);
    else if(effect.type==="advance-clock"){
      const clock=run.world.clocks[effect.id];if(!clock)throw new Error(`Unknown progress clock ${effect.id}.`);clock.filled=clamp(clock.filled+(effect.segments||1),0,clock.size);
    }else throw new Error(`Unknown effect type ${effect.type}.`);
    log(run,"state.changed",`Applied ${effect.type} effect.`,effect);
  }
}
function applyOutcome(run,outcome,kind,random=Math.random){
  log(run,`outcome.${kind}`,outcome.text,{effects:outcome.effects||[],next:outcome.next||null,end:outcome.end||null});
  applyEffects(run,outcome.effects||[]);
  if(outcome.end){run.status=outcome.end;run.ending={title:outcome.title||"Adventure End",text:outcome.text,outcome:outcome.end};log(run,"run.ended",outcome.text,{outcome:outcome.end});return}
  run.sceneId=outcome.next;enterCurrentScene(run,random);
}
function resolveChoice(run,choiceId,actorId=null,random=Math.random){
  if(run.status!=="playing"||run.combat||run.pendingTwist)throw new Error("The adventure is not waiting for an out-of-combat choice.");
  const choice=visibleChoices(run).find(x=>x.id===choiceId);if(!choice)throw new Error("That choice is not currently available.");
  log(run,"choice.selected",choice.label,{choiceId,actorId});
  if(choice.resolution==="automatic"){applyOutcome(run,choice.outcome,"automatic",random);return{result:"automatic"}}
  const eligible=choiceActors(run,choice);const actor=eligible.find(x=>x.id===resolveActorId(run,actorId));if(!actor)throw new Error("Choose an eligible character for this check.");
  const details=checkTotal(run,choice,actor.id);
  if(details.tn>=100){log(run,"check.automatic-success",`${actor.name} succeeds automatically at TN ${details.tn}.`,{choiceId,actorId:actor.id,...details});applyOutcome(run,choice.success,"success",random);return{result:"success",automatic:true,details}}
  if(details.tn<=0){log(run,"check.automatic-failure",`${actor.name} cannot succeed at TN ${details.tn}.`,{choiceId,actorId:actor.id,...details});applyOutcome(run,choice.failure,"failure",random);return{result:"failure",automatic:true,details}}
  const roll=percentile(random),success=roll<=details.tn;
  log(run,"check.rolled",`${actor.name} rolled ${String(roll).padStart(2,"0")} against TN ${details.tn}: ${success?"success":"failure"}.`,{choiceId,actorId:actor.id,roll,...details});
  if(success){
    if(choice.check.clock){const segments=roll<=5?2:1;applyEffects(run,[{type:"advance-clock",id:choice.check.clock,segments}]);log(run,"clock.progress",`${run.world.clocks[choice.check.clock].label} advances by ${segments} segment${segments===1?"":"s"}.`,{clockId:choice.check.clock,segments});}
    applyOutcome(run,choice.success,"success",random);return{result:"success",roll,details};
  }
  run.pendingTwist={choiceId,actorId:actor.id,roll,details,failure:clone(choice.failure),twist:clone(choice.twist),twistPreview:choice.twistPreview};
  log(run,"twist.offered",choice.twistPreview,{choiceId,actorId:actor.id});
  return{result:"failed-check",roll,details};
}
function resolveTwist(run,accept,random=Math.random){
  if(!run.pendingTwist)throw new Error("There is no pending twist.");
  const pending=run.pendingTwist;run.pendingTwist=null;
  log(run,accept?"twist.accepted":"twist.declined",accept?pending.twistPreview:"The party keeps the failed result.",{choiceId:pending.choiceId,actorId:pending.actorId});
  applyOutcome(run,accept?pending.twist:pending.failure,accept?"twist":"failure",random);
}

function combatantFromCharacter(source,zone){
  return{id:source.id,name:source.name,role:source.role,side:"pc",attributes:clone(source.attributes),skills:clone(source.skills),abilities:clone(source.abilities),reactions:clone(source.reactions||[]),hp:source.combat.hp,maxHp:source.combat.hp,stamina:source.combat.stamina,maxStamina:source.combat.stamina,mana:source.combat.mana,maxMana:source.combat.mana,ip:source.combat.inventoryPoints,maxAp:source.combat.maxAp,ap:source.combat.maxAp,def:source.combat.def,defenseBonus:source.combat.defenseBonus,zone,conditions:[],acted:false,prepared:null,invincible:false,targeted:0};
}
function combatantFromEnemy(source){
  return{...clone(source),side:"npc",maxHp:source.hp,ap:source.maxAp,stamina:source.stamina||0,maxStamina:source.stamina||0,mana:source.mana||0,maxMana:source.mana||0,conditions:[],alive:true,targeted:0,defenses:0};
}
function startCombat(run,combatScene,random=Math.random){
  const pcs=run.characters.map(source=>combatantFromCharacter(source,combatScene.pcStarts[source.id]||combatScene.pcStarts.$main));
  const nextCriticalRound=d6(random),ambush=Boolean(combatScene.ambush);
  run.combat={sceneId:run.sceneId,name:combatScene.title,round:1,phase:ambush?"enemy":"pc",ambush,ambushEnemyPhaseComplete:false,zones:clone(combatScene.battlefield.zones),links:clone(combatScene.battlefield.links),interactions:clone(combatScene.interactions||[]),pcs,enemies:combatScene.enemies.map(combatantFromEnemy),selectedPcId:null,nextCriticalRound,criticalUsed:false,criticalArmed:null,enemyIndex:0,pending:null,queued:null,metrics:{rounds:1,pcAttacks:0,npcAttacks:0,npcDefenseRolls:0,pcDefenseRolls:0,noRollAttacks:0,moves:0,protects:0,prepared:0,criticalUses:0,apExpired:0,abilityUses:{}},log:[]};
  combatLog(run,"combat.started",`${combatScene.title} begins. ${ambush?"Enemies":"PCs"} act first.`,{ambush,nextCriticalRound});
  combatLog(run,"critical.scheduled",`The first Critical Round is round ${nextCriticalRound}.`,{nextCriticalRound});
  if(ambush)continueEnemyPhase(run,random);
}
function combatLog(run,type,message,data={}){
  const entry={sequence:run.combat.log.length+1,round:run.combat.round,phase:run.combat.phase,type,message,data:clone(data)};run.combat.log.push(entry);log(run,`combat.${type}`,message,{round:entry.round,phase:entry.phase,...data});
}
function zoneName(combat,id){return byId(combat.zones,id)?.name||id}
function adjacent(combat,zone){return combat.links.filter(x=>x.from===zone||x.to===zone).map(x=>({zone:x.from===zone?x.to:x.from,cost:x.cost}))}
function distance(combat,from,to){
  if(from===to)return 0;const queue=[[from,0]],best=new Map([[from,0]]);
  while(queue.length){queue.sort((a,b)=>a[1]-b[1]);const [zone,cost]=queue.shift();if(zone===to)return cost;for(const edge of adjacent(combat,zone)){const next=cost+edge.cost;if(next<(best.get(edge.zone)??Infinity)){best.set(edge.zone,next);queue.push([edge.zone,next])}}}
  return Infinity;
}
function rangeDistance(combat,from,to){
  if(from===to)return 0;const queue=[[from,0]],seen=new Set([from]);
  while(queue.length){const [zone,links]=queue.shift();for(const edge of adjacent(combat,zone)){if(seen.has(edge.zone))continue;if(edge.zone===to)return links+1;seen.add(edge.zone);queue.push([edge.zone,links+1])}}
  return Infinity;
}
function conditionsHas(unit,id){return unit.conditions.some(x=>(typeof x==="string"?x:x.id)===id)}
function addCondition(unit,condition){if(!condition||conditionsHas(unit,condition.id||condition))return;unit.conditions.push(typeof condition==="string"?{id:condition}:clone(condition));if((condition.id||condition)==="Incapacitated")unit.ap=Math.min(unit.ap,1)}
function removeCondition(unit,id){unit.conditions=unit.conditions.filter(x=>(typeof x==="string"?x:x.id)!==id)}
function livingEnemies(combat){return combat.enemies.filter(x=>x.alive&&x.hp>0)}
function targetableEnemies(combat){return livingEnemies(combat).filter(x=>!x.transit)}
function consciousPcs(combat){return combat.pcs.filter(x=>x.hp>0)}
function targetablePcs(combat){return consciousPcs(combat).filter(x=>!x.transit)}
function abilityCost(ability){return{ap:ability.ap||0,stamina:ability.stamina||0,mana:ability.mana||0}}
function canPay(unit,ability){const cost=abilityCost(ability);return unit.ap>=cost.ap&&unit.stamina>=cost.stamina&&unit.mana>=cost.mana}
function pay(unit,ability){const cost=abilityCost(ability);unit.ap-=cost.ap;unit.stamina-=cost.stamina;unit.mana-=cost.mana}
function inRange(combat,actor,target,ability){const value=rangeDistance(combat,actor.zone,target.zone);return value>=(ability.minRange||0)&&value<=(ability.maxRange||0)}
function legalAbilityTargets(combat,actor,ability){
  const candidates=ability.kind==="heal"||ability.kind==="multiheal"?combat.pcs.filter(x=>x.hp< x.maxHp):ability.kind==="rally"?combat.pcs.filter(x=>x.hp>0&&!conditionsHas(x,"Rallied")):targetableEnemies(combat);
  return candidates.filter(target=>!target.transit&&inRange(combat,actor,target,ability));
}
function metricUse(combat,unit,ability){const key=`${unit.id}:${ability.name}`;combat.metrics.abilityUses[key]=(combat.metrics.abilityUses[key]||0)+1}
function weaknessDamage(target,ability,power){
  const tags=ability.tags||[];let bonus=0,resistance=0;for(const tag of tags){bonus+=target.weaknesses?.[tag]||0;resistance+=target.resistances?.[tag]||0}return Math.max(0,power+bonus-resistance);
}
function npcWillDefend(enemy,ability,damage){
  if(enemy.ap<1||conditionsHas(enemy,"Incapacitated"))return false;
  if(enemy.preset==="self_preserving")return true;
  if(enemy.preset==="optimal_killer")return ability.kind==="multi"||Boolean(ability.condition)||damage>=55||damage>=enemy.hp;
  return enemy.hp/enemy.maxHp<=.5||damage>=enemy.hp||(enemy.defenses++%2===0&&damage>=45);
}
function applyPcAttack(run,pc,ability,targets,options={},random=Math.random){
  const combat=run.combat,critical=combat.criticalArmed?.pcId===pc.id;
  const criticalAttribute=critical?combat.criticalArmed.attribute:null;
  let basePower=ability.power+(conditionsHas(pc,"Rallied")?10:0)+(critical?(pc.attributes[criticalAttribute]||0)*2:0);
  if(critical){combat.criticalArmed=null;combat.criticalUsed=true;combat.metrics.criticalUses++;combatLog(run,"critical.attack",`${pc.name} turns ${ability.name} into a Critical Attack using ${criticalAttribute.toUpperCase()}.`,{pcId:pc.id,abilityId:ability.id,attribute:criticalAttribute})}
  combat.metrics.pcAttacks++;
  for(const enemy of targets){
    let damage=weaknessDamage(enemy,ability,basePower),defended=false,roll=null,tn=null;
    if(!critical&&npcWillDefend(enemy,ability,damage)){
      enemy.ap--;defended=true;
      const effectiveDef=enemy.def+(conditionsHas(enemy,"Rallied")?5:0);
      if(ability.kind==="multi"){damage=Math.max(0,damage-effectiveDef)}
      else{roll=percentile(random);tn=enemy.dodge+(ability.attackBonus||0);combat.metrics.npcDefenseRolls++;damage=roll>=96?0:(roll<=5||roll<=tn)?damage:Math.max(0,damage-effectiveDef)}
      combatLog(run,"npc.defended",`${enemy.name} Defends${roll===null?"":` (roll ${String(roll).padStart(2,"0")} vs TN ${tn})`}.`,{enemyId:enemy.id,roll,tn,damage});
    }else combat.metrics.noRollAttacks++;
    enemy.hp=Math.max(0,enemy.hp-damage);
    if(damage>0&&ability.condition)addCondition(enemy,ability.condition);
    if(damage>0&&ability.kind==="push"&&options.destination){if(adjacent(combat,enemy.zone).some(x=>x.zone===options.destination&&x.cost===1))enemy.zone=options.destination}
    combatLog(run,"pc.attack",`${pc.name}'s ${ability.name} deals ${damage} damage to ${enemy.name}${defended?" after defense":""}.`,{pcId:pc.id,enemyId:enemy.id,abilityId:ability.id,damage,defended,roll,tn});
    if(enemy.hp===0){enemy.alive=false;combatLog(run,"npc.defeated",`${enemy.name} is defeated.`,{enemyId:enemy.id})}
  }
}
function performPcAbility(run,pcId,abilityId,targetIds,options={},random=Math.random){
  const combat=run.combat,pc=byId(combat.pcs,pcId),ability=byId(pc?.abilities||[],abilityId);if(!pc||!ability)throw new Error("Unknown PC or ability.");
  if(combat.phase!=="pc"||pc.acted||pc.hp<=0||pc.transit)throw new Error("That PC cannot act now.");if(!canPay(pc,ability))throw new Error("The character cannot pay that ability's costs.");
  let targets;
  if(ability.kind==="heal"||ability.kind==="multiheal"||ability.kind==="rally")targets=targetIds.map(id=>byId(combat.pcs,id)).filter(Boolean);
  else targets=targetIds.map(id=>byId(combat.enemies,id)).filter(x=>x?.alive);
  if(ability.kind==="rush"){
    const target=targets[0],move=options.moveTo;if(!target||target.zone!==move||!adjacent(combat,pc.zone).some(x=>x.zone===move&&x.cost===1))throw new Error("Rush requires an enemy in an adjacent destination zone.");pc.zone=move;combat.metrics.moves++;combatLog(run,"pc.moved",`${pc.name} rushes to ${zoneName(combat,move)}.`,{pcId,zone:move});
  }
  if(targets.some(target=>!inRange(combat,pc,target,ability)))throw new Error("At least one target is out of range.");
  const min=ability.minTargets||1,max=ability.maxTargets||1;if(targets.length<min||targets.length>max)throw new Error(`Choose ${min}–${max} targets.`);
  if(combat.criticalArmed&&combat.criticalArmed.pcId===pc.id&&!ATTACK_KINDS.includes(ability.kind))throw new Error("A Critical Attack must be spent on an attack ability.");
  pay(pc,ability);metricUse(combat,pc,ability);
  if(ability.kind==="heal"||ability.kind==="multiheal"){
    for(const target of targets)target.hp=Math.min(target.maxHp,target.hp+ability.power);
    combatLog(run,"pc.healed",`${pc.name} uses ${ability.name} on ${targets.map(x=>x.name).join(", ")}.`,{pcId,abilityId,targetIds,amount:ability.power});
  }else if(ability.kind==="rally"){
    for(const target of targets)addCondition(target,{id:"Rallied",sourceId:pc.id,invocationId:ability.id});
    combatLog(run,"pc.rallied",`${pc.name} uses ${ability.name} on ${targets.map(x=>x.name).join(", ")}.`,{pcId,abilityId,targetIds});
  }else applyPcAttack(run,pc,ability,targets,options,random);
  checkCombatEnd(run,random);
}
function movePc(run,pcId,zone){
  const combat=run.combat,pc=byId(combat.pcs,pcId);if(!pc||combat.phase!=="pc"||pc.acted||pc.hp<=0||pc.ap<=0)throw new Error("That PC cannot move now.");
  if(pc.transit){
    if(pc.transit.to!==zone)throw new Error("A character in transit may only continue or abandon the crossing.");
    const spent=Math.min(pc.ap,pc.transit.total-pc.transit.progress);pc.ap-=spent;pc.transit.progress+=spent;combat.metrics.moves+=spent;
    if(pc.transit.progress>=pc.transit.total){pc.zone=pc.transit.to;pc.transit=null;combatLog(run,"pc.moved",`${pc.name} completes the crossing to ${zoneName(combat,pc.zone)} (${spent} AP).`,{pcId,zone:pc.zone,cost:spent})}
    else combatLog(run,"pc.transit",`${pc.name} continues toward ${zoneName(combat,pc.transit.to)} (${pc.transit.progress}/${pc.transit.total} Moves).`,{pcId,...pc.transit,spent});
    return;
  }
  const edge=adjacent(combat,pc.zone).find(x=>x.zone===zone);if(!edge)throw new Error("That zone is not connected.");const spent=Math.min(pc.ap,edge.cost);pc.ap-=spent;combat.metrics.moves+=spent;
  if(spent===edge.cost){pc.zone=zone;combatLog(run,"pc.moved",`${pc.name} moves to ${zoneName(combat,zone)} (${spent} AP).`,{pcId,zone,cost:spent})}
  else{pc.transit={from:pc.zone,to:zone,total:edge.cost,progress:spent};combatLog(run,"pc.transit",`${pc.name} begins crossing toward ${zoneName(combat,zone)} (${spent}/${edge.cost} Moves).`,{pcId,...pc.transit})}
}
function abandonTransit(run,pcId){
  const combat=run.combat,pc=byId(combat.pcs,pcId);if(!pc||combat.phase!=="pc"||pc.acted||!pc.transit)throw new Error("That character is not able to abandon a crossing.");
  const from=pc.transit.from,to=pc.transit.to;pc.zone=from;pc.transit=null;combatLog(run,"pc.transit-abandoned",`${pc.name} abandons the crossing to ${zoneName(combat,to)} and returns to ${zoneName(combat,from)}.`,{pcId,from,to});
}
function beginPcTurn(run,pcId,random=Math.random){
  const combat=run.combat,pc=byId(combat.pcs,pcId);if(!pc||combat.phase!=="pc"||pc.acted||pc.hp<=0)throw new Error("That PC cannot begin a turn now.");
  if(combat.selectedPcId&&combat.selectedPcId!==pc.id)throw new Error("The active PC must finish their turn before another begins.");
  if(pc.turnStarted){combat.selectedPcId=pc.id;return}
  pc.turnStarted=true;combat.selectedPcId=pc.id;
  for(const condition of pc.conditions.filter(x=>(x.id||x)==="Persistent Damage")){const damage=condition.amount||0;if(damage){pc.hp=Math.max(0,pc.hp-damage);combatLog(run,"condition.damage",`${pc.name} takes ${damage} Persistent Damage.`,{pcId:pc.id,damage})}}
  if(pc.hp===0){pc.acted=true;combat.selectedPcId=null;combatLog(run,"pc.unconscious",`${pc.name} falls unconscious.`,{pcId:pc.id});checkCombatEnd(run,random)}
}
function resolveRallySustain(run,pcId,sustain){
  const combat=run.combat,pc=byId(combat.pcs,pcId);if(!pc||combat.phase!=="pc"||!pc.rallyDue)throw new Error("No Rallied invocation is awaiting this character's decision.");
  if(sustain){if(pc.ap<1)throw new Error("The character has no AP to sustain Rallied.");pc.ap--;combatLog(run,"rallied.sustained",`${pc.name} spends 1 AP to sustain Rallied.`,{pcId})}
  else{for(const target of combat.pcs)target.conditions=target.conditions.filter(condition=>condition.sourceId!==pc.id);combatLog(run,"rallied.ended",`${pc.name} lets Rallied end.`,{pcId})}
  pc.rallyDue=false;
}
function useConsumable(run,pcId,resource){
  const pc=byId(run.combat.pcs,pcId);if(!pc||run.combat.phase!=="pc"||pc.acted||pc.ap<1||pc.ip<1)throw new Error("The character cannot use a consumable now.");
  if(resource==="hp")pc.hp=Math.min(pc.maxHp,pc.hp+50);else if(resource==="stamina")pc.stamina=Math.min(pc.maxStamina,pc.stamina+5);else if(resource==="mana")pc.mana=Math.min(pc.maxMana,pc.mana+6);else throw new Error("Unknown consumable benefit.");
  pc.ap--;pc.ip--;combatLog(run,"pc.consumable",`${pc.name} spends 1 Inventory Point to restore ${resource}.`,{pcId,resource});
}
function recover(run,pcId,targetId,conditionId){
  const combat=run.combat,pc=byId(combat.pcs,pcId),target=byId(combat.pcs,targetId);if(!pc||!target||combat.phase!=="pc"||pc.acted||pc.ap<1||pc.zone!==target.zone||!conditionsHas(target,conditionId))throw new Error("Recover is not legal.");
  pc.ap--;removeCondition(target,conditionId);combatLog(run,"pc.recover",`${pc.name} removes ${conditionId} from ${target.name}.`,{pcId,targetId,conditionId});
}
function availableInteractions(combat,pc){return(combat.interactions||[]).filter(interaction=>interaction.zone===pc.zone&&(!interaction.once||!interaction.used)&&pc.ap>=(interaction.ap??1)&&!pc.transit)}
function performInteraction(run,pcId,interactionId,random=Math.random){
  const combat=run.combat,pc=byId(combat.pcs,pcId),interaction=byId(combat.interactions||[],interactionId);if(!pc||!interaction||combat.phase!=="pc"||pc.acted||pc.hp<=0||!availableInteractions(combat,pc).includes(interaction))throw new Error("That interaction is not legal.");
  const cost=interaction.ap??1;pc.ap-=cost;if(interaction.once!==false)interaction.used=true;combatLog(run,"pc.interacted",`${pc.name}: ${interaction.text}`,{pcId,interactionId,cost});
  for(const effect of interaction.effects||[]){
    if(["set","add","advance-clock"].includes(effect.type)){applyEffects(run,[effect]);continue}
    if(effect.type==="damage-enemy"){
      const target=byId(combat.enemies,effect.targetId);if(!target?.alive)continue;target.hp=Math.max(0,target.hp-effect.amount);combatLog(run,"interaction.damage",`${target.name} takes ${effect.amount} damage.`,{interactionId,targetId:target.id,damage:effect.amount});if(target.hp===0){target.alive=false;combatLog(run,"npc.defeated",`${target.name} is defeated.`,{enemyId:target.id})}
    }else if(effect.type==="condition-enemy"){
      const target=byId(combat.enemies,effect.targetId);if(target?.alive){addCondition(target,effect.condition);combatLog(run,"interaction.condition",`${target.name} becomes ${effect.condition.id||effect.condition}.`,{interactionId,targetId:target.id,condition:effect.condition})}
    }else if(effect.type==="move-unit"){
      const units=effect.side==="npc"?combat.enemies:combat.pcs,target=byId(units,effect.targetId);if(target&&byId(combat.zones,effect.zone)){target.zone=effect.zone;target.transit=null;combatLog(run,"interaction.move",`${target.name} moves to ${zoneName(combat,effect.zone)}.`,{interactionId,targetId:target.id,zone:effect.zone})}
    }else throw new Error(`Unknown combat interaction effect ${effect.type}.`);
  }
  checkCombatEnd(run,random);
}
function prepare(run,pcId,abilityId,trigger){
  const combat=run.combat,pc=byId(combat.pcs,pcId),ability=byId(pc?.abilities||[],abilityId);if(!pc||!ability||combat.phase!=="pc"||pc.acted||!ATTACK_KINDS.includes(ability.kind)||!canPay(pc,ability)||!["enemy-enters-range","enemy-attacks-ally"].includes(trigger))throw new Error("That prepared action is not legal.");
  pc.prepared={abilityId,trigger};combat.metrics.prepared++;combatLog(run,"pc.prepared",`${pc.name} prepares ${ability.name}: ${trigger==="enemy-enters-range"?"when an enemy enters range":"when an enemy attacks an ally in this zone"}.`,{pcId,abilityId,trigger});
}
function endPcTurn(run,pcId,random=Math.random){
  const combat=run.combat,pc=byId(combat.pcs,pcId);if(!pc||combat.phase!=="pc"||pc.acted||pc.hp<=0)throw new Error("That PC cannot end a turn now.");
  if(pc.rallyDue)resolveRallySustain(run,pcId,false);
  pc.acted=true;pc.turnStarted=true;combat.selectedPcId=null;combatLog(run,"pc.turn-ended",`${pc.name} ends their turn with ${pc.ap} AP retained.`,{pcId,retainedAp:pc.ap});
  if(combat.pcs.every(x=>x.acted||x.hp<=0)){
    if(combat.ambush&&combat.round===1&&combat.ambushEnemyPhaseComplete){endRound(run,random);return}
    combat.phase="enemy";combat.enemyIndex=0;combatLog(run,"phase.enemy","Enemy phase begins.");continueEnemyPhase(run,random)
  }
}
function useCritical(run,kind,pcId,attribute=null){
  const combat=run.combat,pc=byId(combat.pcs,pcId);if(!pc||combat.round!==combat.nextCriticalRound||combat.criticalUsed)throw new Error("No Critical is available.");
  if(kind!=="invincibility"&&combat.phase!=="pc")throw new Error("That Critical benefit must be chosen during the PC phase.");
  if(kind==="invincibility"&&combat.phase==="enemy"&&combat.pending?.targetId!==pcId)throw new Error("An Invincibility Frame used in response must protect the current target.");
  if(kind==="attack"){
    if(!["dex","agi","str","int"].includes(attribute))throw new Error("Choose DEX, AGI, STR, or INT.");combat.criticalArmed={pcId,attribute};combatLog(run,"critical.armed",`${pc.name} prepares a Critical Attack using ${attribute.toUpperCase()}.`,{pcId,attribute});return;
  }
  combat.criticalUsed=true;combat.metrics.criticalUses++;
  if(kind==="recovery"){const wasDown=pc.hp===0;pc.hp=Math.min(pc.maxHp,pc.hp+Math.ceil(pc.maxHp/2));pc.conditions=[];if(wasDown&&pc.hp>0&&combat.phase==="pc"){pc.acted=false;if(!combat.selectedPcId)combat.selectedPcId=pc.id}combatLog(run,"critical.recovery",`${pc.name} receives Critical Recovery.`,{pcId})}
  else if(kind==="invincibility"){pc.invincible=true;combatLog(run,"critical.invincibility",`${pc.name} gains an Invincibility Frame for this round.`,{pcId})}
  else throw new Error("Unknown Critical benefit.");
}
function reactionOptions(combat,pending){
  const target=byId(combat.pcs,pending.targetId),options=[{id:"take",label:"Take the attack"}];if(!target||target.hp<=0)return options;
  if(target.ap>0&&!conditionsHas(target,"Incapacitated"))options.push({id:"defend",label:pending.attack.kind==="multi"?"Defend — apply DEF":"Defend — roll percentile",actorId:target.id});
  if(pending.attack.kind!=="multi")for(const protector of combat.pcs.filter(x=>x.hp>0&&!x.transit&&x.id!==target.id&&x.zone===target.zone&&x.ap>0&&!conditionsHas(x,"Incapacitated"))){options.push({id:`protect:${protector.id}`,label:`${protector.name} Protects`,actorId:protector.id});if(protector.ap>=2)options.push({id:`protect-defend:${protector.id}`,label:`${protector.name} Protects, then Defends`,actorId:protector.id})}
  for(const reaction of target.reactions||[])if(reaction.kind==="ward"&&target.ap>=(reaction.ap||1)&&target.mana>=(reaction.mana||0))options.push({id:`ward:${reaction.id}`,label:reaction.name,actorId:target.id});
  return options;
}
function resolveReaction(run,optionId,random=Math.random){
  const combat=run.combat,pending=combat.pending;if(!pending||pending.type!=="reaction")throw new Error("No attack is waiting for a reaction.");
  const queuedKind=combat.queued?.kind;
  if(!reactionOptions(combat,pending).some(x=>x.id===optionId))throw new Error("That reaction is not legal.");
  const source=byId(combat.enemies,pending.sourceId),original=byId(combat.pcs,pending.targetId),attack=pending.attack;let target=original,defend=false,ward=null;
  if(optionId.startsWith("protect:")){target=byId(combat.pcs,optionId.split(":")[1]);target.ap--;combat.metrics.protects++}
  if(optionId.startsWith("protect-defend:")){target=byId(combat.pcs,optionId.split(":")[1]);target.ap-=2;combat.metrics.protects++;defend=true}
  if(optionId==="defend"){target.ap--;defend=true}
  if(optionId.startsWith("ward:")){ward=byId(target.reactions,optionId.split(":")[1]);target.ap-=ward.ap||1;target.mana-=ward.mana||0;defend=true}
  if(target.invincible){combatLog(run,"pc.invincible",`${target.name}'s Invincibility Frame prevents ${attack.name}.`,{targetId:target.id,sourceId:source.id});combat.pending=null;if(queuedKind!=="multi-chain")combat.queued=null;if(queuedKind!=="multi-chain")continueEnemyPhase(run,random);return}
  let damage=weaknessDamage(target,attack,attack.power),roll=null,tn=null;
  if(defend){
    const effectiveDef=target.def+(conditionsHas(target,"Rallied")?5:0);
    if(attack.kind==="multi")damage=Math.max(0,damage-effectiveDef-(ward?.defBonus||0));
    else{roll=percentile(random);tn=source.threat+target.defenseBonus+(ward?.threatBonus||0);for(const tag of attack.tags||[])tn+=ward?.tagBonus?.[tag]||0;combat.metrics.pcDefenseRolls++;damage=roll<=5?0:roll<=tn?Math.max(0,damage-effectiveDef-(ward?.defBonus||0)):damage}
    combatLog(run,"pc.defended",`${target.name} Defends${roll===null?"":` (roll ${String(roll).padStart(2,"0")} vs TN ${tn})`}.`,{targetId:target.id,roll,tn,damage,wardId:ward?.id||null});
  }else combat.metrics.noRollAttacks++;
  target.hp=Math.max(0,target.hp-damage);target.targeted++;
  if(damage>0&&attack.condition)addCondition(target,attack.condition);
  if(damage>0&&attack.kind==="push"){
    const destinations=adjacent(combat,target.zone).filter(x=>x.cost===1),preferred=destinations.find(x=>x.zone===attack.pushTo),destination=preferred||destinations.sort((a,b)=>a.zone.localeCompare(b.zone))[0];
    if(destination){target.zone=destination.zone;combatLog(run,"pc.forced-move",`${target.name} is forced into ${zoneName(combat,destination.zone)}.`,{targetId:target.id,zone:destination.zone})}
  }
  combat.metrics.npcAttacks++;combatLog(run,"npc.attack",`${source.name}'s ${attack.name} deals ${damage} damage to ${target.name}.`,{sourceId:source.id,targetId:target.id,attackId:attack.id,damage,optionId,roll,tn});
  if(target.hp===0)combatLog(run,"pc.unconscious",`${target.name} falls unconscious.`,{targetId:target.id});
  combat.pending=null;if(queuedKind!=="multi-chain")combat.queued=null;checkCombatEnd(run,random);if(run.combat&&queuedKind!=="multi-chain")continueEnemyPhase(run,random);
}
function preparedCandidate(combat,enemy,trigger,target=null){
  return combat.pcs.find(pc=>pc.hp>0&&pc.prepared?.trigger===trigger&&pc.ap>0&&(!target||pc.id!==target.id)&&(trigger!=="enemy-attacks-ally"||pc.zone===target.zone)&&byId(pc.abilities,pc.prepared.abilityId)&&inRange(combat,pc,enemy,byId(pc.abilities,pc.prepared.abilityId))&&canPay(pc,byId(pc.abilities,pc.prepared.abilityId)));
}
function resolvePrepared(run,use,targetIds=null,random=Math.random){
  if(typeof targetIds==="function"){random=targetIds;targetIds=null}
  const combat=run.combat,pending=combat.pending;if(!pending||pending.type!=="prepared")throw new Error("No prepared action is waiting.");
  const pc=byId(combat.pcs,pending.pcId),enemy=byId(combat.enemies,pending.enemyId),ability=byId(pc.abilities,pending.abilityId);combat.pending=null;
  if(use&&enemy.alive){
    const ids=targetIds||[enemy.id],targets=ids.map(id=>byId(combat.enemies,id)).filter(target=>target?.alive);
    const min=ability.minTargets||1,max=ability.maxTargets||1;
    if(!targets.includes(enemy)||new Set(ids).size!==ids.length||targets.length<min||targets.length>max||targets.some(target=>!inRange(combat,pc,target,ability))){combat.pending=pending;throw new Error(`Choose ${min}–${max} legal targets, including the enemy that triggered the preparation.`)}
    pc.prepared=null;pay(pc,ability);metricUse(combat,pc,ability);applyPcAttack(run,pc,ability,targets,{},random);combatLog(run,"prepared.triggered",`${pc.name}'s prepared ${ability.name} triggers against ${targets.map(target=>target.name).join(", ")}.`,{pcId:pc.id,enemyId:enemy.id,targetIds:targets.map(target=>target.id),abilityId:ability.id})
  }
  else combatLog(run,"prepared.skipped",`${pc.name} does not use the prepared ${ability.name}.`,{pcId:pc.id,abilityId:ability.id});
  checkCombatEnd(run,random);if(!run.combat)return;
  if(combat.queued?.kind==="attack"){const queued=combat.queued;if(!enemy.alive){combat.queued=null;continueEnemyPhase(run,random);return}combat.pending={type:"reaction",sourceId:enemy.id,targetId:queued.targetId,attack:queued.attack};}
  else{combat.queued=null;continueEnemyPhase(run,random)}
}
function targetForPreset(combat,enemy){
  const pcs=targetablePcs(combat),preset=enemy.preset;
  return pcs.sort((a,b)=>{
    if(preset==="optimal_killer")return a.hp/a.maxHp-b.hp/b.maxHp||a.hp-b.hp||distance(combat,enemy.zone,a.zone)-distance(combat,enemy.zone,b.zone)||a.id.localeCompare(b.id);
    if(preset==="dramatic_gm")return a.targeted-b.targeted||b.hp/b.maxHp-a.hp/a.maxHp||a.id.localeCompare(b.id);
    return distance(combat,enemy.zone,a.zone)-distance(combat,enemy.zone,b.zone)||b.hp/b.maxHp-a.hp/a.maxHp||a.id.localeCompare(b.id);
  })[0];
}
function enemyAttackOptions(combat,enemy,target){
  const out=[];for(const ability of enemy.abilities.filter(x=>[...ATTACK_KINDS,"rally"].includes(x.kind)&&canPay(enemy,x))){
    if(ability.kind==="rally"){
      const allies=livingEnemies(combat).filter(unit=>unit.id!==enemy.id&&!conditionsHas(unit,"Rallied")&&inRange(combat,enemy,unit,ability));if(allies.length>=(ability.minTargets||1))out.push({ability,targets:allies.slice(0,ability.maxTargets||allies.length),score:ability.power||60});
      continue;
    }
    if(ability.kind==="rush"){
      if(adjacent(combat,enemy.zone).some(edge=>edge.cost===1&&edge.zone===target.zone))out.push({ability,targets:[target],score:ability.power+10});
      continue;
    }
    let valid=targetablePcs(combat).filter(pc=>inRange(combat,enemy,pc,ability));
    if(ability.kind==="multi"){if(valid.length>=(ability.minTargets||2))out.push({ability,targets:valid.sort((a,b)=>a.hp-b.hp).slice(0,ability.maxTargets||valid.length),score:ability.power*Math.min(valid.length,ability.maxTargets||valid.length)});}
    else if(valid.includes(target))out.push({ability,targets:[target],score:ability.power+(ability.condition?20:0)});
  }
  return out.sort((a,b)=>b.score-a.score||a.ability.ap-b.ability.ap||a.ability.id.localeCompare(b.ability.id));
}
function nextStep(combat,from,to,budget){
  return adjacent(combat,from).filter(x=>distance(combat,x.zone,to)<distance(combat,from,to)).sort((a,b)=>distance(combat,a.zone,to)-distance(combat,b.zone,to)||a.cost-b.cost||a.zone.localeCompare(b.zone))[0];
}
function queueEnemyAttack(run,enemy,option){
  const combat=run.combat,baseAbility=option.ability,attack={...baseAbility,power:baseAbility.power+(conditionsHas(enemy,"Rallied")?10:0)},targets=option.targets;pay(enemy,baseAbility);metricUse(combat,enemy,baseAbility);
  if(baseAbility.kind==="rally"){
    for(const target of targets)addCondition(target,{id:"Rallied",sourceId:enemy.id,invocationId:baseAbility.id});combatLog(run,"npc.rallied",`${enemy.name} uses ${baseAbility.name} on ${targets.map(x=>x.name).join(", ")}.`,{enemyId:enemy.id,abilityId:baseAbility.id,targetIds:targets.map(x=>x.id)});return false;
  }
  if(attack.kind==="rush"){
    enemy.zone=targets[0].zone;combat.metrics.moves++;combatLog(run,"npc.moved",`${enemy.name} rushes to ${zoneName(combat,enemy.zone)}.`,{enemyId:enemy.id,zone:enemy.zone});
  }
  if(attack.kind==="multi"){
    combat.queued={kind:"multi-chain",sourceId:enemy.id,attack,targetIds:targets.map(x=>x.id),index:0};queueNextMultiReaction(run);return true;
  }
  const target=targets[0];combat.queued={kind:"attack",sourceId:enemy.id,targetId:target.id,attack};
  const prepared=preparedCandidate(combat,enemy,"enemy-attacks-ally",target);
  if(prepared){combat.pending={type:"prepared",pcId:prepared.id,enemyId:enemy.id,abilityId:prepared.prepared.abilityId};return true}
  combat.pending={type:"reaction",sourceId:enemy.id,targetId:target.id,attack};
  return true;
}
function queueNextMultiReaction(run){
  const combat=run.combat,queued=combat.queued;if(!queued||queued.kind!=="multi-chain")return;
  if(queued.index>=queued.targetIds.length){combat.queued=null;continueEnemyPhase(run);return}
  combat.pending={type:"reaction",sourceId:queued.sourceId,targetId:queued.targetIds[queued.index++],attack:queued.attack};
}
function persistentAtTurnStart(run,enemy){
  for(const condition of enemy.conditions.filter(x=>(x.id||x)==="Persistent Damage")){const damage=condition.amount||0;if(damage){enemy.hp=Math.max(0,enemy.hp-damage);combatLog(run,"condition.damage",`${enemy.name} takes ${damage} Persistent Damage.`,{enemyId:enemy.id,damage})}}
  if(enemy.hp===0){enemy.alive=false;combatLog(run,"npc.defeated",`${enemy.name} is defeated by Persistent Damage.`,{enemyId:enemy.id})}
}
function continueEnemyPhase(run,random=Math.random){
  const combat=run.combat;if(!combat||combat.phase!=="enemy"||combat.pending)return;
  let guard=0;
  while(run.combat&&combat.phase==="enemy"&&!combat.pending&&guard++<200){
    if(checkCombatEnd(run,random))return;
    const enemies=livingEnemies(combat);
    if(combat.enemyIndex>=enemies.length){
      if(combat.ambush&&combat.round===1&&!combat.ambushEnemyPhaseComplete){combat.ambushEnemyPhaseComplete=true;combat.phase="pc";combat.enemyIndex=0;combat.selectedPcId=null;combatLog(run,"phase.pc","The ambushed party takes the second phase of round 1.");return}
      endRound(run,random);return
    }
    const enemy=enemies[combat.enemyIndex];
    if(!enemy.turnStarted){enemy.turnStarted=true;persistentAtTurnStart(run,enemy);if(!enemy.alive){combat.enemyIndex++;continue}if(enemy.rallyDue){if(enemy.ap>0){enemy.ap--;combatLog(run,"rallied.sustained",`${enemy.name} spends 1 AP to sustain Rallied.`,{enemyId:enemy.id})}else{for(const target of combat.enemies)target.conditions=target.conditions.filter(condition=>condition.sourceId!==enemy.id);combatLog(run,"rallied.ended",`${enemy.name} cannot sustain Rallied.`,{enemyId:enemy.id})}enemy.rallyDue=false}if(conditionsHas(enemy,"Incapacitated")){removeCondition(enemy,"Incapacitated");enemy.ap=0;combatLog(run,"npc.recover",`${enemy.name} spends its turn Recovering from Incapacitated.`,{enemyId:enemy.id});enemy.turnStarted=false;combat.enemyIndex++;continue}const persistent=enemy.conditions.find(condition=>(condition.id||condition)==="Persistent Damage"),shouldRecover=persistent&&enemy.ap>0&&(enemy.preset==="self_preserving"||(enemy.preset==="optimal_killer"&&(persistent.amount||0)>=10)||(enemy.preset==="dramatic_gm"&&enemy.hp/enemy.maxHp<=.5));if(shouldRecover){enemy.ap--;removeCondition(enemy,"Persistent Damage");combatLog(run,"npc.recover",`${enemy.name} Recovers from Persistent Damage.`,{enemyId:enemy.id,condition:"Persistent Damage"})}}
    if(enemy.transit){
      const spent=Math.min(enemy.ap,enemy.transit.total-enemy.transit.progress);enemy.ap-=spent;enemy.transit.progress+=spent;combat.metrics.moves+=spent;
      if(enemy.transit.progress<enemy.transit.total){combatLog(run,"npc.transit",`${enemy.name} continues toward ${zoneName(combat,enemy.transit.to)} (${enemy.transit.progress}/${enemy.transit.total} Moves).`,{enemyId:enemy.id,...enemy.transit,spent});enemy.turnStarted=false;combat.enemyIndex++;continue}
      enemy.zone=enemy.transit.to;enemy.transit=null;combatLog(run,"npc.moved",`${enemy.name} completes the crossing to ${zoneName(combat,enemy.zone)}.`,{enemyId:enemy.id,zone:enemy.zone,cost:spent});const prepared=preparedCandidate(combat,enemy,"enemy-enters-range");if(prepared){combat.queued={kind:"movement",enemyId:enemy.id};combat.pending={type:"prepared",pcId:prepared.id,enemyId:enemy.id,abilityId:prepared.prepared.abilityId};return}
    }
    if(enemy.ap<=0||(enemy.preset==="self_preserving"&&enemy.hp/enemy.maxHp<=.5&&enemy.ap===1)){
      combatLog(run,"npc.turn-ended",`${enemy.name} ends its turn with ${enemy.ap} AP retained.`,{enemyId:enemy.id,retainedAp:enemy.ap});enemy.turnStarted=false;combat.enemyIndex++;continue;
    }
    const target=targetForPreset(combat,enemy);if(!target){combatLog(run,"npc.turn-ended",`${enemy.name} has no target it can affect while the party is in transit.`,{enemyId:enemy.id,retainedAp:enemy.ap});enemy.turnStarted=false;combat.enemyIndex++;continue}const options=enemyAttackOptions(combat,enemy,target);
    if(options.length){if(queueEnemyAttack(run,enemy,options[0]))return;continue}
    const step=nextStep(combat,enemy.zone,target.zone,enemy.ap);
    if(!step){combatLog(run,"npc.blocked",`${enemy.name} cannot reach a useful position and ends its turn.`,{enemyId:enemy.id});enemy.turnStarted=false;combat.enemyIndex++;continue}
    const spent=Math.min(enemy.ap,step.cost);enemy.ap-=spent;combat.metrics.moves+=spent;
    if(spent<step.cost){enemy.transit={from:enemy.zone,to:step.zone,total:step.cost,progress:spent};combatLog(run,"npc.transit",`${enemy.name} begins crossing toward ${zoneName(combat,step.zone)} (${spent}/${step.cost} Moves).`,{enemyId:enemy.id,...enemy.transit});enemy.turnStarted=false;combat.enemyIndex++;continue}
    enemy.zone=step.zone;combatLog(run,"npc.moved",`${enemy.name} moves to ${zoneName(combat,step.zone)} (${spent} AP).`,{enemyId:enemy.id,zone:step.zone,cost:spent});
    const prepared=preparedCandidate(combat,enemy,"enemy-enters-range");if(prepared){combat.queued={kind:"movement",enemyId:enemy.id};combat.pending={type:"prepared",pcId:prepared.id,enemyId:enemy.id,abilityId:prepared.prepared.abilityId};return}
  }
  if(guard>=200)throw new Error("Enemy controller exceeded its safety limit.");
}
function resolveReactionAndContinue(run,optionId,random=Math.random){
  const queuedKind=run.combat?.queued?.kind;resolveReaction(run,optionId,random);
  if(!run.combat)return;
  if(queuedKind==="multi-chain"&&run.combat.queued?.kind==="multi-chain"){queueNextMultiReaction(run)}
}
function endRound(run,random=Math.random){
  const combat=run.combat;for(const unit of [...combat.pcs,...combat.enemies])combat.metrics.apExpired+=unit.ap;
  if(combat.round===combat.nextCriticalRound){combat.nextCriticalRound=combat.round+d6(random);combatLog(run,"critical.scheduled",`The next Critical Round is round ${combat.nextCriticalRound}.`,{nextCriticalRound:combat.nextCriticalRound})}
  combat.round++;combat.metrics.rounds=combat.round;combat.phase="pc";combat.enemyIndex=0;combat.criticalUsed=false;combat.criticalArmed=null;
  const activeIds=new Set([...combat.pcs,...livingEnemies(combat)].filter(x=>x.hp>0).map(x=>x.id));for(const unit of [...combat.pcs,...combat.enemies])unit.conditions=unit.conditions.filter(condition=>(condition.id||condition)!=="Rallied"||activeIds.has(condition.sourceId));
  for(const pc of combat.pcs){pc.ap=pc.hp>0?(conditionsHas(pc,"Incapacitated")?1:pc.maxAp):0;pc.acted=pc.hp<=0;pc.turnStarted=false;pc.prepared=null;pc.invincible=false;pc.rallyDue=combat.pcs.some(target=>target.conditions.some(condition=>condition.sourceId===pc.id))}
  for(const enemy of livingEnemies(combat)){enemy.ap=conditionsHas(enemy,"Incapacitated")?1:enemy.maxAp;enemy.turnStarted=false;enemy.rallyDue=combat.enemies.some(target=>target.conditions.some(condition=>condition.sourceId===enemy.id))}
  combatLog(run,"round.started",`Round ${combat.round} begins. AP refreshes.`,{round:combat.round,critical:combat.round===combat.nextCriticalRound});
}
function checkCombatEnd(run,random=Math.random){
  const combat=run.combat;if(!combat)return true;const combatScene=run.adventure.scenes[combat.sceneId];
  if(!livingEnemies(combat).length){const snapshot=clone(combat);run.combat=null;log(run,"combat.ended",`${snapshot.name} ends in victory.`,{outcome:"victory",metrics:snapshot.metrics,combatLog:snapshot.log});applyOutcome(run,combatScene.victory,"combat-victory",random);return true}
  if(!consciousPcs(combat).length){const snapshot=clone(combat);run.combat=null;log(run,"combat.ended",`${snapshot.name} ends in defeat.`,{outcome:"defeat",metrics:snapshot.metrics,combatLog:snapshot.log});applyOutcome(run,combatScene.defeat,"combat-defeat",random);return true}
  return false;
}
function combatSummary(combat){
  return{round:combat.round,phase:combat.phase,criticalAvailable:combat.round===combat.nextCriticalRound&&!combat.criticalUsed,pending:clone(combat.pending),pcs:clone(combat.pcs),enemies:clone(combat.enemies),zones:clone(combat.zones),links:clone(combat.links),metrics:clone(combat.metrics)};
}

return{VERSION,ATTRIBUTES,NPC_PRESETS,validateCharacter,validateAdventure,createRun,scene,party,visibleChoices,choiceActors,checkTotal,resolveChoice,resolveTwist,combatSummary,distance,adjacent,legalAbilityTargets,beginPcTurn,resolveRallySustain,movePc,abandonTransit,performPcAbility,useConsumable,recover,availableInteractions,performInteraction,prepare,endPcTurn,useCritical,reactionOptions,resolveReaction:resolveReactionAndContinue,resolvePrepared,continueEnemyPhase,checkCombatEnd,clone,percentile,d6};
});
