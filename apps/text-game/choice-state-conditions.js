(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root?.TextGameCore)api.install(root.TextGameCore);
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const COMPARATORS=["equals","notEquals","gte","lte"];
  const installed=new WeakSet();
  const object=value=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
  const has=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
  const error=(path,message)=>`${path}: ${message}`;

  function conditionPathIssue(adventure,path){
    if(typeof path!=="string"||!path.trim())return"must be a non-empty state path";
    const parts=path.split(".");
    if(parts.some(part=>!part||["__proto__","constructor","prototype"].includes(part)))return"contains an invalid path segment";
    if(path==="quest.elapsedDays")return null;
    if((parts[0]==="flags"||parts[0]==="counters")&&parts.length>=2)return null;
    if(parts[0]==="clocks"&&parts.length===3&&parts[2]==="filled"){
      return Object.prototype.hasOwnProperty.call(adventure?.clocks||{},parts[1])?null:`references unknown clock ${parts[1]}`;
    }
    return"must reference flags.*, counters.*, quest.elapsedDays, or clocks.<id>.filled";
  }

  function validateCondition(adventure,condition,path,errors){
    if(!object(condition)){errors.push(error(path,"must be an object"));return;}
    const pathIssue=conditionPathIssue(adventure,condition.path);
    if(pathIssue)errors.push(error(`${path}.path`,pathIssue));
    const present=COMPARATORS.filter(key=>has(condition,key));
    if(present.length!==1){errors.push(error(path,"must contain exactly one of equals, notEquals, gte, or lte"));return;}
    const comparator=present[0],value=condition[comparator];
    if((comparator==="gte"||comparator==="lte")&&(typeof value!=="number"||!Number.isFinite(value)))errors.push(error(`${path}.${comparator}`,"must be a finite number"));
    if((comparator==="equals"||comparator==="notEquals")&&(typeof value==="object"&&value!==null))errors.push(error(`${path}.${comparator}`,"must be a string, number, boolean, or null"));
  }

  function validateWhen(adventure,when,path,errors){
    if(Array.isArray(when)){when.forEach((condition,index)=>validateCondition(adventure,condition,`${path}[${index}]`,errors));return;}
    if(!object(when)){errors.push(error(path,"must be a condition object, an array of conditions, or an all/any group"));return;}
    const grouped=["all","any"].filter(key=>has(when,key));
    if(!grouped.length){validateCondition(adventure,when,path,errors);return;}
    if(grouped.length!==1){errors.push(error(path,"must use either all or any, not both"));return;}
    const key=grouped[0];
    if(!Array.isArray(when[key])){errors.push(error(`${path}.${key}`,"must be an array"));return;}
    when[key].forEach((condition,index)=>validateCondition(adventure,condition,`${path}.${key}[${index}]`,errors));
  }

  function validateChoiceStateConditions(adventure){
    const errors=[];
    for(const [sceneId,scene] of Object.entries(adventure?.scenes||{})){
      if(scene?.type!=="scene"||!Array.isArray(scene.choices))continue;
      scene.choices.forEach((choice,index)=>{
        if(choice?.when!=null)validateWhen(adventure,choice.when,`adventure.scenes.${sceneId}.choices[${index}].when`,errors);
      });
    }
    return errors;
  }

  function install(core){
    if(!core||installed.has(core))return core;
    const validateAdventure=core.validateAdventure.bind(core);
    const createRun=core.createRun.bind(core);
    core.validateAdventure=function validateAdventureWithChoiceStateConditions(adventure){
      return [...validateAdventure(adventure),...validateChoiceStateConditions(adventure)];
    };
    core.createRun=function createRunWithChoiceStateConditions(mainCharacter,adventure,random){
      const errors=validateChoiceStateConditions(adventure);
      if(errors.length)throw new Error(errors.join("\n"));
      return createRun(mainCharacter,adventure,random);
    };
    installed.add(core);
    return core;
  }

  return{COMPARATORS,validateChoiceStateConditions,install};
});
