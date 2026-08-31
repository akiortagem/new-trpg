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

  return {ABILITY_KINDS,slug,createAdventureDraft,renameChoiceId,abilityUsesTargetBounds,ensureAbilityKindFields};
});
