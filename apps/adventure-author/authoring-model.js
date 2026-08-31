(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else root.AdventureAuthorModel=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const ABILITY_KINDS=["attack","multi","push","persistent","rush","rally"];

  function slug(value){
    return String(value||"item").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"item";
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
      scenes:{
        start:{
          type:"scene",
          title:"Opening",
          text:["Write the opening of the adventure."],
          choices:[{
            id:"continue",
            label:"Continue",
            resolution:"automatic",
            reason:"The opening is ready to continue.",
            outcome:{text:"Continue the adventure.",end:"victory"}
          }]
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

  function abilityUsesTargetBounds(kind){
    return kind==="multi"||kind==="rally";
  }

  function ensureAbilityKindFields(ability){
    if(!ability||typeof ability!=="object")return ability;
    if(abilityUsesTargetBounds(ability.kind)){
      if(ability.minTargets==null)ability.minTargets=2;
      if(ability.maxTargets==null)ability.maxTargets=3;
    }
    if(ability.kind==="persistent"&&!ability.condition)ability.condition={id:"Persistent Damage",amount:10,expression:"Burning"};
    return ability;
  }

  function clockIds(adventure){
    return Object.keys(adventure?.clocks||{});
  }

  function canUseAdvanceClock(adventure){
    return clockIds(adventure).length>0;
  }

  function clockEffectIssues(adventure){
    const valid=new Set(clockIds(adventure)),issues=[];
    function walk(value,path="adventure"){
      if(!value||typeof value!=="object")return;
      if(!Array.isArray(value)&&value.type==="advance-clock"&&!valid.has(value.id)){
        issues.push({path,id:value.id||"",message:`${path}: advance-clock references unknown clock ${value.id||"(missing)"}.`});
      }
      if(Array.isArray(value))value.forEach((child,index)=>walk(child,`${path}[${index}]`));
      else for(const [key,child] of Object.entries(value))walk(child,`${path}.${key}`);
    }
    walk(adventure?.scenes||{},"adventure.scenes");
    return issues;
  }

  function validateWizardDraftInput(id,title,days){
    const errors=[];
    if(!String(id||"").trim())errors.push("Adventure ID is required.");
    if(!String(title||"").trim())errors.push("Title is required.");
    const n=Number(days);
    if(!Number.isFinite(n)||n<0)errors.push("Quest days must be zero or greater.");
    return errors;
  }

  function updateBattlefieldLink(scene,index,changes){
    const links=scene?.battlefield?.links;
    if(!Array.isArray(links)||!links[index])return{ok:false,error:"Battlefield link not found."};
    const next={...links[index],...changes};
    if(!Number.isInteger(Number(next.cost))||Number(next.cost)<1)return{ok:false,error:"Move cost must be a positive whole number."};
    next.cost=Number(next.cost);
    links[index]=next;
    return{ok:true,link:next};
  }

  function removeBattlefieldLink(scene,index){
    const links=scene?.battlefield?.links;
    if(!Array.isArray(links)||!links[index])return false;
    links.splice(index,1);
    return true;
  }

  function openableShapeIssues(value){
    const issues=[];
    const object=v=>Boolean(v)&&typeof v==="object"&&!Array.isArray(v);
    if(!object(value))return["Adventure must be a JSON object."];
    if(!Array.isArray(value.party))issues.push("party must be an array.");
    if(!object(value.initialState))issues.push("initialState must be an object.");
    else{
      if(!object(value.initialState.flags))issues.push("initialState.flags must be an object.");
      if(!object(value.initialState.counters))issues.push("initialState.counters must be an object.");
    }
    if(!object(value.clocks))issues.push("clocks must be an object.");
    if(!object(value.scenes))issues.push("scenes must be an object.");
    else for(const [id,scene] of Object.entries(value.scenes)){
      if(!object(scene)){issues.push(`scenes.${id} must be an object.`);continue;}
      if(scene.type==="scene"){
        if(!Array.isArray(scene.text))issues.push(`scenes.${id}.text must be an array.`);
        if(!Array.isArray(scene.choices))issues.push(`scenes.${id}.choices must be an array.`);
      }
      if(scene.type==="combat"){
        if(!object(scene.battlefield))issues.push(`scenes.${id}.battlefield must be an object.`);
        else{
          if(!Array.isArray(scene.battlefield.zones))issues.push(`scenes.${id}.battlefield.zones must be an array.`);
          if(!Array.isArray(scene.battlefield.links))issues.push(`scenes.${id}.battlefield.links must be an array.`);
        }
        if(!object(scene.pcStarts))issues.push(`scenes.${id}.pcStarts must be an object.`);
        if(!Array.isArray(scene.enemies))issues.push(`scenes.${id}.enemies must be an array.`);
        if(scene.interactions!=null&&!Array.isArray(scene.interactions))issues.push(`scenes.${id}.interactions must be an array.`);
      }
    }
    if(value.editor!=null){
      if(!object(value.editor))issues.push("editor must be an object when present.");
      else if(value.editor.nodes!=null&&!object(value.editor.nodes))issues.push("editor.nodes must be an object when present.");
    }
    return issues;
  }

  function numericAddEffectIssues(adventure){
    const issues=[];
    function walk(value,path="adventure.scenes"){
      if(!value||typeof value!=="object")return;
      if(!Array.isArray(value)&&value.type==="add"&&(typeof value.value!=="number"||!Number.isFinite(value.value))){
        issues.push({path,message:`${path}.value: add effects require a finite numeric value.`});
      }
      if(Array.isArray(value))value.forEach((child,index)=>walk(child,`${path}[${index}]`));
      else for(const [key,child] of Object.entries(value))walk(child,`${path}.${key}`);
    }
    walk(adventure?.scenes||{});
    return issues;
  }

  function parseAddEffectValue(value){
    const n=Number(value);
    return Number.isFinite(n)?{ok:true,value:n}:{ok:false,error:"Add effect value must be a number."};
  }

  return {ABILITY_KINDS,slug,createAdventureDraft,renameChoiceId,abilityUsesTargetBounds,ensureAbilityKindFields,clockIds,canUseAdvanceClock,clockEffectIssues,validateWizardDraftInput,updateBattlefieldLink,removeBattlefieldLink,openableShapeIssues,numericAddEffectIssues,parseAddEffectValue};
});
