(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else{
    root.AdventureAuthorModel=api;
    const core=root.TextGameCore;
    if(core&&typeof core.validateCharacter==="function"){
      const validateCharacter=core.validateCharacter;
      core.validateCharacter=function validateCharacterForAuthoring(character,path="character"){
        const errors=validateCharacter(character,path);
        if(path==="character")errors.push(...api.companionImportIssues(character));
        return errors;
      };
    }
  }
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const ABILITY_KINDS=["attack","multi","push","persistent","rush","rally"];
  const object=value=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);

  function slug(value){
    return String(value||"item").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"item";
  }

  function createContinueChoice(){
    return {
      id:"continue",
      label:"Continue",
      resolution:"automatic",
      reason:"The scene is ready to continue.",
      outcome:{text:"Continue the adventure.",next:""}
    };
  }

  function createAdventureDraft(id,title,days){
    return {
      schemaVersion:2,
      kind:"adventure",
      id:slug(id),
      title:String(title||"").trim(),
      startScene:"start",
      questDays:Number(days)||0,
      initialState:{flags:{},counters:{}},
      clocks:{},
      party:[],
      enemies:[],
      scenes:{
        start:{
          type:"scene",
          title:"Opening",
          text:["Write the opening of the adventure."],
          choices:[{...createContinueChoice(),reason:"The opening is ready to continue.",outcome:{text:"Continue the adventure.",end:"victory"}}]
        }
      },
      editor:{nodes:{start:{x:120,y:100}}}
    };
  }

  function renameChoiceId(scene,index,newValue){
    if(!scene||!Array.isArray(scene.choices)||!scene.choices[index])return{ok:false,error:"Choice not found."};
    const next=slug(newValue),choice=scene.choices[index];
    if(next===choice.id)return{ok:true,id:choice.id,changed:false};
    if(scene.choices.some((other,i)=>i!==index&&other.id===next))return{ok:false,error:`Choice id ${next} already exists.`};
    choice.id=next;
    return{ok:true,id:next,changed:true};
  }

  function abilityUsesTargetBounds(kind){return kind==="multi"||kind==="rally";}

  function ensureAbilityKindFields(ability){
    if(!ability||typeof ability!=="object")return ability;
    if(abilityUsesTargetBounds(ability.kind)){
      if(ability.minTargets==null)ability.minTargets=2;
      if(ability.maxTargets==null)ability.maxTargets=3;
    }
    if(ability.kind==="persistent"&&!ability.condition)ability.condition={id:"Persistent Damage",amount:10,expression:"Burning"};
    return ability;
  }

  function companionImportIssues(character){
    if(character?.id==="$main")return["character.id: $main is reserved for the player-selected main character and cannot be imported as a companion"];
    return[];
  }

  function clockIds(adventure){return Object.keys(adventure?.clocks||{});}
  function canUseAdvanceClock(adventure){return clockIds(adventure).length>0;}

  function clockEffectIssues(adventure){
    const valid=new Set(clockIds(adventure)),issues=[];
    function walk(value,path="adventure"){
      if(!value||typeof value!=="object")return;
      if(!Array.isArray(value)&&value.type==="advance-clock"&&!valid.has(value.id))issues.push({path,id:value.id||"",message:`${path}: advance-clock references unknown clock ${value.id||"(missing)"}.`});
      if(Array.isArray(value))value.forEach((child,index)=>walk(child,`${path}[${index}]`));
      else for(const [key,child] of Object.entries(value))walk(child,`${path}.${key}`);
    }
    walk(adventure?.scenes||{},"adventure.scenes");
    return issues;
  }

  function validateWizardDraftInput(title,days){
    const errors=[];
    if(!String(title||"").trim())errors.push("Title is required.");
    const n=Number(days);
    if(!Number.isFinite(n)||n<0)errors.push("Quest days must be zero or greater.");
    return errors;
  }

  function parseNonNegativeNumber(value,label="Value"){
    if(typeof value==="string"&&!value.trim())return{ok:false,error:`${label} must be a nonnegative number.`};
    const n=Number(value);
    return Number.isFinite(n)&&n>=0?{ok:true,value:n}:{ok:false,error:`${label} must be a nonnegative number.`};
  }

  function parsePositiveInteger(value,label="Value"){
    if(typeof value==="string"&&!value.trim())return{ok:false,error:`${label} must be a positive whole number.`};
    const n=Number(value);
    return Number.isInteger(n)&&n>=1?{ok:true,value:n}:{ok:false,error:`${label} must be a positive whole number.`};
  }

  function isBattlefieldScene(scene){
    return object(scene)&&scene.type==="combat"&&object(scene.battlefield)&&Array.isArray(scene.battlefield.zones)&&Array.isArray(scene.battlefield.links);
  }

  function updateBattlefieldLink(scene,index,changes){
    const links=scene?.battlefield?.links;
    if(!Array.isArray(links)||!links[index])return{ok:false,error:"Battlefield link not found."};
    const next={...links[index],...changes};
    if(!Number.isInteger(Number(next.cost))||Number(next.cost)<1)return{ok:false,error:"Move cost must be a positive whole number."};
    next.cost=Number(next.cost);links[index]=next;return{ok:true,link:next};
  }

  function removeBattlefieldLink(scene,index){
    const links=scene?.battlefield?.links;
    if(!Array.isArray(links)||!links[index])return false;
    links.splice(index,1);return true;
  }

  function updateInteractionZone(scene,interactionId,zoneId){
    const interaction=(scene?.interactions||[]).find(item=>item?.id===interactionId);
    if(!interaction)return{ok:false,error:"Interaction not found."};
    if(!(scene?.battlefield?.zones||[]).some(zone=>zone?.id===zoneId))return{ok:false,error:`Unknown battlefield zone ${zoneId}.`};
    interaction.zone=zoneId;
    return{ok:true,interaction};
  }

  function migrateEnemyCatalog(adventure){
    if(!object(adventure))return adventure;
    adventure.enemies=Array.isArray(adventure.enemies)?adventure.enemies:[];
    const used=new Set(adventure.enemies.map(enemy=>enemy?.id).filter(Boolean));
    for(const scene of Object.values(object(adventure.scenes)?adventure.scenes:{})){
      if(scene?.type!=="combat"||!Array.isArray(scene.enemies))continue;
      scene.enemies=scene.enemies.map(enemy=>{
        if(!object(enemy)||enemy.enemyId)return enemy;
        const base=slug(enemy.id||enemy.name||"enemy");
        let enemyId=base,suffix=2;
        while(used.has(enemyId))enemyId=`${base}-${suffix++}`;
        used.add(enemyId);
        const definition={...enemy,id:enemyId};
        delete definition.zone;
        adventure.enemies.push(definition);
        return{id:enemy.id||enemyId,enemyId,zone:enemy.zone};
      });
    }
    return adventure;
  }

  function enemyDefinition(adventure,placement){
    return (adventure?.enemies||[]).find(enemy=>enemy?.id===placement?.enemyId)||null;
  }

  function enemyReferenceCount(adventure,enemyId){
    let count=0;
    for(const scene of Object.values(adventure?.scenes||{}))if(scene?.type==="combat")for(const placement of scene.enemies||[])if(placement?.enemyId===enemyId)count++;
    return count;
  }

  function openableShapeIssues(value){
    const issues=[];
    const arrayOfObjects=(items,path)=>{
      if(!Array.isArray(items)){issues.push(`${path} must be an array.`);return false;}
      items.forEach((item,index)=>{if(!object(item))issues.push(`${path}[${index}] must be an object.`);});
      return true;
    };
    const validateAbilities=(items,path)=>{
      if(!arrayOfObjects(items,path))return;
      items.forEach((ability,index)=>{
        if(!object(ability))return;
        if(ability.tags!=null&&!Array.isArray(ability.tags))issues.push(`${path}[${index}].tags must be an array when present.`);
        if(ability.condition!=null&&typeof ability.condition!=="string"&&!object(ability.condition))issues.push(`${path}[${index}].condition must be a string or object when present.`);
      });
    };
    const validateConditionShape=(condition,path)=>{
      if(!object(condition))issues.push(`${path} must be an object.`);
    };
    const validateWhenShape=(when,path)=>{
      if(when==null)return;
      if(Array.isArray(when)){when.forEach((condition,index)=>validateConditionShape(condition,`${path}[${index}]`));return;}
      if(!object(when)){issues.push(`${path} must be an object or array.`);return;}
      const hasAll=Object.prototype.hasOwnProperty.call(when,"all"),hasAny=Object.prototype.hasOwnProperty.call(when,"any");
      if(hasAll||hasAny){
        for(const key of ["all","any"]){
          if(!Object.prototype.hasOwnProperty.call(when,key))continue;
          if(!Array.isArray(when[key]))issues.push(`${path}.${key} must be an array.`);
          else when[key].forEach((condition,index)=>validateConditionShape(condition,`${path}.${key}[${index}]`));
        }
      }
    };
    const validatePositionMap=(positions,path)=>{
      if(!object(positions)){issues.push(`${path} must be an object.`);return;}
      for(const [id,position] of Object.entries(positions))if(!object(position))issues.push(`${path}.${id} must be an object.`);
    };
    if(!object(value))return["Adventure must be a JSON object."];

    if(arrayOfObjects(value.party,"party")){
      for(const [index,member] of value.party.entries()){
        if(!object(member))continue;
        if(member.abilities!=null)validateAbilities(member.abilities,`party[${index}].abilities`);
      }
    }

    if(value.enemies!=null&&arrayOfObjects(value.enemies,"enemies")){
      value.enemies.forEach((enemy,index)=>{
        if(!object(enemy))return;
        if(enemy.abilities!=null)validateAbilities(enemy.abilities,`enemies[${index}].abilities`);
      });
    }

    if(!object(value.initialState))issues.push("initialState must be an object.");
    else{
      if(!object(value.initialState.flags))issues.push("initialState.flags must be an object.");
      if(!object(value.initialState.counters))issues.push("initialState.counters must be an object.");
    }

    if(!object(value.clocks))issues.push("clocks must be an object.");
    else for(const [id,clock] of Object.entries(value.clocks))if(!object(clock))issues.push(`clocks.${id} must be an object.`);

    if(!object(value.scenes))issues.push("scenes must be an object.");
    else for(const [id,scene] of Object.entries(value.scenes)){
      if(!object(scene)){issues.push(`scenes.${id} must be an object.`);continue;}
      if(scene.type==="scene"){
        if(!Array.isArray(scene.text))issues.push(`scenes.${id}.text must be an array.`);
        else scene.text.forEach((passage,index)=>{if(typeof passage!=="string"&&!object(passage))issues.push(`scenes.${id}.text[${index}] must be narration text or a passage object.`);});
        if(arrayOfObjects(scene.choices,`scenes.${id}.choices`)){
          scene.choices.forEach((choice,index)=>{
            if(!object(choice))return;
            const base=`scenes.${id}.choices[${index}]`;
            validateWhenShape(choice.when,`${base}.when`);
            if(choice.resolution==="check"){
              if(!object(choice.actor))issues.push(`${base}.actor must be an object.`);
              else if(choice.actor.eligible!=null&&!Array.isArray(choice.actor.eligible))issues.push(`${base}.actor.eligible must be an array when present.`);
              if(!object(choice.check))issues.push(`${base}.check must be an object.`);
              else{
                if(choice.check.attributes!=null&&!Array.isArray(choice.check.attributes))issues.push(`${base}.check.attributes must be an array when present.`);
                if(choice.check.situationalModifiers!=null)arrayOfObjects(choice.check.situationalModifiers,`${base}.check.situationalModifiers`);
              }
            }
            const outcomes=choice.resolution==="automatic"?[choice.outcome]:choice.resolution==="check"?[choice.success,choice.failure,choice.twist]:[];
            outcomes.forEach((outcome,outcomeIndex)=>{
              const name=choice.resolution==="automatic"?"outcome":["success","failure","twist"][outcomeIndex];
              if(!object(outcome))issues.push(`${base}.${name} must be an object.`);
              else if(outcome.effects!=null)arrayOfObjects(outcome.effects,`${base}.${name}.effects`);
            });
          });
        }
      }
      if(scene.type==="combat"){
        if(!object(scene.battlefield))issues.push(`scenes.${id}.battlefield must be an object.`);
        else{
          arrayOfObjects(scene.battlefield.zones,`scenes.${id}.battlefield.zones`);
          arrayOfObjects(scene.battlefield.links,`scenes.${id}.battlefield.links`);
        }
        if(!object(scene.pcStarts))issues.push(`scenes.${id}.pcStarts must be an object.`);
        if(arrayOfObjects(scene.enemies,`scenes.${id}.enemies`))scene.enemies.forEach((enemy,index)=>{if(object(enemy)&&!enemy.enemyId&&enemy.abilities!=null)validateAbilities(enemy.abilities,`scenes.${id}.enemies[${index}].abilities`);});
        if(scene.interactions!=null&&arrayOfObjects(scene.interactions,`scenes.${id}.interactions`))scene.interactions.forEach((interaction,index)=>{if(object(interaction)&&interaction.effects!=null)arrayOfObjects(interaction.effects,`scenes.${id}.interactions[${index}].effects`);});
        for(const [name,outcome] of [["victory",scene.victory],["defeat",scene.defeat]]){
          if(!object(outcome))issues.push(`scenes.${id}.${name} must be an object.`);
          else if(outcome.effects!=null)arrayOfObjects(outcome.effects,`scenes.${id}.${name}.effects`);
        }
        if(scene.editor!=null){
          if(!object(scene.editor))issues.push(`scenes.${id}.editor must be an object when present.`);
          else if(scene.editor.zones!=null)validatePositionMap(scene.editor.zones,`scenes.${id}.editor.zones`);
        }
      }
    }

    if(value.editor!=null){
      if(!object(value.editor))issues.push("editor must be an object when present.");
      else if(value.editor.nodes!=null)validatePositionMap(value.editor.nodes,"editor.nodes");
    }
    return issues;
  }

  function numericAddEffectIssues(adventure){
    const issues=[];
    function walk(value,path="adventure.scenes"){
      if(!value||typeof value!=="object")return;
      if(!Array.isArray(value)&&value.type==="add"&&(typeof value.value!=="number"||!Number.isFinite(value.value)))issues.push({path,message:`${path}.value: add effects require a finite numeric value.`});
      if(Array.isArray(value))value.forEach((child,index)=>walk(child,`${path}[${index}]`));
      else for(const [key,child] of Object.entries(value))walk(child,`${path}.${key}`);
    }
    walk(adventure?.scenes||{});return issues;
  }

  function parseAddEffectValue(value){
    if(typeof value==="string"&&!value.trim())return{ok:false,error:"Add effect value must be a number."};
    const n=Number(value);
    return Number.isFinite(n)?{ok:true,value:n}:{ok:false,error:"Add effect value must be a number."};
  }

  function connectOutcome(outcome,targetId){
    if(!object(outcome))return{ok:false,error:"Outcome not found."};
    const next=String(targetId||"").trim();
    if(!next)return{ok:false,error:"Destination node is required."};
    delete outcome.end;
    outcome.next=next;
    return{ok:true,next};
  }

  function disconnectOutcome(outcome){
    if(!object(outcome))return false;
    const changed=Object.prototype.hasOwnProperty.call(outcome,"next")||Object.prototype.hasOwnProperty.call(outcome,"end");
    delete outcome.next;
    delete outcome.end;
    return changed;
  }

  return {ABILITY_KINDS,slug,createContinueChoice,createAdventureDraft,renameChoiceId,abilityUsesTargetBounds,ensureAbilityKindFields,companionImportIssues,clockIds,canUseAdvanceClock,clockEffectIssues,validateWizardDraftInput,parseNonNegativeNumber,parsePositiveInteger,isBattlefieldScene,updateBattlefieldLink,removeBattlefieldLink,updateInteractionZone,migrateEnemyCatalog,enemyDefinition,enemyReferenceCount,openableShapeIssues,numericAddEffectIssues,parseAddEffectValue,connectOutcome,disconnectOutcome};
});
