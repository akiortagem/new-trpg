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

  function validateWizardDraftInput(id,title,days){
    const errors=[];
    if(!String(id||"").trim())errors.push("Adventure ID is required.");
    if(!String(title||"").trim())errors.push("Title is required.");
    const questDays=Number(days);
    if(!Number.isFinite(questDays)||questDays<0)errors.push("Quest days must be 0 or greater.");
    return errors;
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

  function updateBattlefieldLink(scene,index,changes){
    const links=scene?.battlefield?.links;
    if(!Array.isArray(links)||!links[index])return{ok:false,error:"Battlefield link not found."};
    const link=links[index];
    if(Object.prototype.hasOwnProperty.call(changes||{},"cost")){
      const cost=Number(changes.cost);
      if(!Number.isInteger(cost)||cost<1)return{ok:false,error:"Move cost must be a positive whole number."};
      link.cost=cost;
    }
    return{ok:true,link};
  }

  function removeBattlefieldLink(scene,index){
    const links=scene?.battlefield?.links;
    if(!Array.isArray(links)||!links[index])return{ok:false,error:"Battlefield link not found."};
    const [removed]=links.splice(index,1);
    return{ok:true,removed};
  }

  return {ABILITY_KINDS,slug,validateWizardDraftInput,createAdventureDraft,renameChoiceId,abilityUsesTargetBounds,ensureAbilityKindFields,clockIds,canUseAdvanceClock,clockEffectIssues,updateBattlefieldLink,removeBattlefieldLink};
});
