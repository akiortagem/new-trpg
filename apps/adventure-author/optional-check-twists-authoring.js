(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.AdventureAuthorOptionalCheckTwists=api;
  if(typeof document!=="undefined"&&root.AdventureAuthorModel)api.install(root.AdventureAuthorModel);
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const PLACEHOLDER_MARKER="__optionalTwistPlaceholder";
  const BACKUP_KEY="__optionalTwistBackup";
  const clone=value=>JSON.parse(JSON.stringify(value));
  const object=value=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
  const plainClone=value=>Array.isArray(value)?value.map(plainClone):object(value)?Object.fromEntries(Object.entries(value).filter(([key])=>key!=="toJSON").map(([key,item])=>[key,plainClone(item)])):value;
  const hasOwn=(value,key)=>Boolean(value)&&Object.prototype.hasOwnProperty.call(value,key);

  function hasAuthoredTwist(choice){return object(choice)&&choice.resolution==="check"&&hasOwn(choice,"twist")&&choice.twist!=null&&hasOwn(choice,"twistPreview")&&choice.twistPreview!=null;}
  function isPlaceholder(choice){return Boolean(choice?.twist?.[PLACEHOLDER_MARKER]);}
  function isTwistEnabled(choice){return hasAuthoredTwist(choice)&&!isPlaceholder(choice);}

  function placeholderOutcome(){return{text:"Success with a Twist is disabled for this check.",end:"defeat",[PLACEHOLDER_MARKER]:true};}
  function defaultTwist(){return{text:"The goal succeeds with a complication.",next:""};}
  function defaultPreview(){return"The goal succeeds, but there is a complication.";}

  function disableTwist(choice){
    if(!object(choice)||choice.resolution!=="check")return choice;
    choice.check=object(choice.check)?choice.check:{};
    if(isTwistEnabled(choice))choice.check[BACKUP_KEY]={twist:clone(choice.twist),twistPreview:choice.twistPreview};
    choice.twistPreview="";
    choice.twist=placeholderOutcome();
    return choice;
  }

  function enableTwist(choice){
    if(!object(choice)||choice.resolution!=="check")return choice;
    choice.check=object(choice.check)?choice.check:{};
    const backup=choice.check[BACKUP_KEY];
    if(object(backup)&&object(backup.twist)){
      choice.twist=clone(backup.twist);
      choice.twistPreview=typeof backup.twistPreview==="string"?backup.twistPreview:defaultPreview();
    }else{
      choice.twist=defaultTwist();
      choice.twistPreview=defaultPreview();
    }
    delete choice.check[BACKUP_KEY];
    return choice;
  }

  function hydrateChoice(choice){
    if(!object(choice)||choice.resolution!=="check")return choice;
    const hasTwist=hasOwn(choice,"twist")&&choice.twist!=null;
    const hasPreview=hasOwn(choice,"twistPreview")&&choice.twistPreview!=null;
    if(!hasTwist&&!hasPreview)disableTwist(choice);
    return choice;
  }

  function hydrateAdventure(adventure){
    if(!object(adventure)||!object(adventure.scenes))return adventure;
    for(const scene of Object.values(adventure.scenes))if(scene?.type==="scene"&&Array.isArray(scene.choices))scene.choices.forEach(hydrateChoice);
    return adventure;
  }

  function partialTwistIssues(adventure){
    const issues=[];
    for(const [sceneId,scene] of Object.entries(object(adventure?.scenes)?adventure.scenes:{})){
      if(scene?.type!=="scene"||!Array.isArray(scene.choices))continue;
      scene.choices.forEach((choice,index)=>{
        if(!object(choice)||choice.resolution!=="check")return;
        const hasTwist=hasOwn(choice,"twist")&&choice.twist!=null,hasPreview=hasOwn(choice,"twistPreview")&&choice.twistPreview!=null;
        if(hasTwist!==hasPreview)issues.push(`scenes.${sceneId}.choices[${index}]: twist and twistPreview must either both be present or both be omitted.`);
      });
    }
    return issues;
  }

  function serializeAdventure(adventure){
    const value=plainClone(adventure);
    if(!object(value?.scenes))return value;
    for(const scene of Object.values(value.scenes)){
      if(scene?.type!=="scene"||!Array.isArray(scene.choices))continue;
      for(const choice of scene.choices){
        if(!object(choice)||choice.resolution!=="check")continue;
        if(object(choice.check)){delete choice.check[BACKUP_KEY];delete choice.check.__optionalTwistDisabled;}
        if(choice.twist?.[PLACEHOLDER_MARKER]){delete choice.twist;delete choice.twistPreview;}
      }
    }
    return value;
  }

  function install(Model){
    if(!Model||typeof document==="undefined")return;
    const createAdventureDraft=Model.createAdventureDraft;
    const migrateEnemyCatalog=Model.migrateEnemyCatalog;
    const openableShapeIssues=Model.openableShapeIssues;
    let currentAdventure=null;
    let activeSceneId=null;

    Model.createAdventureDraft=function createAdventureDraftWithOptionalTwists(...args){currentAdventure=hydrateAdventure(createAdventureDraft(...args));return currentAdventure;};
    Model.migrateEnemyCatalog=function migrateEnemyCatalogWithOptionalTwists(adventure){currentAdventure=hydrateAdventure(migrateEnemyCatalog(adventure));return currentAdventure;};
    Model.openableShapeIssues=function openableShapeIssuesWithOptionalTwists(adventure){return [...openableShapeIssues(hydrateAdventure(clone(adventure))),...partialTwistIssues(adventure)];};

    function currentChoice(){
      const choiceId=document.querySelector("#sceneDialogId")?.textContent?.trim();
      if(activeSceneId&&choiceId){const found=currentAdventure?.scenes?.[activeSceneId]?.choices?.find(choice=>choice?.id===choiceId);if(found)return found;}
      if(!choiceId)return null;
      let match=null;
      for(const [sceneId,scene] of Object.entries(currentAdventure?.scenes||{})){
        const found=scene?.type==="scene"&&Array.isArray(scene.choices)?scene.choices.find(choice=>choice?.id===choiceId):null;
        if(!found)continue;if(match)return null;match=found;activeSceneId=sceneId;
      }
      return match;
    }

    function currentChoiceIndex(){const choice=currentChoice();return choice&&activeSceneId?currentAdventure.scenes[activeSceneId].choices.indexOf(choice):-1;}

    function checkpointThroughExistingField(){
      const label=document.querySelector('#sceneEditor [data-field="label"]');
      if(!label)return;
      label.dispatchEvent(new Event("change",{bubbles:true}));
    }

    function reopenChoice(sceneId,index){
      const node=document.querySelector(`.node[data-id="${CSS.escape(sceneId)}"]`);
      if(!node)return;
      node.click();
      node.click();
      document.querySelector(`#sceneEditor [data-choice="${index}"]`)?.click();
    }

    function decorateGraph(){
      for(const [sceneId,scene] of Object.entries(currentAdventure?.scenes||{})){
        if(scene?.type!=="scene"||!Array.isArray(scene.choices))continue;
        const node=document.querySelector(`.node[data-id="${CSS.escape(sceneId)}"]`);if(!node)continue;
        const ports=[...node.querySelectorAll(".output-port")];let portIndex=0;
        for(const choice of scene.choices){
          if(choice?.resolution==="automatic"){portIndex++;continue;}
          if(choice?.resolution==="check"){
            const twistPort=ports[portIndex+2];
            if(twistPort)twistPort.hidden=!isTwistEnabled(choice);
            portIndex+=3;
          }
        }
      }
    }

    function enhanceChoiceEditor(){
      const editor=document.querySelector("#sceneEditor");
      if(!editor?.classList.contains("choice-editor"))return;
      const choice=currentChoice();if(!choice||choice.resolution!=="check")return;
      const checkSection=[...editor.querySelectorAll(".section")].find(section=>section.querySelector("h3")?.textContent.trim()==="Check");
      if(!checkSection||checkSection.querySelector("[data-optional-twist]"))return;
      const label=document.createElement("label");label.className="inline optional-twist-control";label.dataset.optionalTwist="";
      label.innerHTML=`<input type="checkbox" ${isTwistEnabled(choice)?"checked":""}> Offer Success with a Twist after a failed roll`;
      checkSection.appendChild(label);
      const input=label.querySelector("input");
      input.addEventListener("change",()=>{
        const sceneId=activeSceneId,index=currentChoiceIndex();if(!sceneId||index<0)return;
        const enabled=input.checked;
        checkpointThroughExistingField();
        const fresh=currentAdventure?.scenes?.[sceneId]?.choices?.[index];if(!fresh)return;
        enabled?enableTwist(fresh):disableTwist(fresh);
        reopenChoice(sceneId,index);
        queueMicrotask(()=>{enhanceChoiceEditor();decorateGraph();});
      });

      const preview=editor.querySelector('[data-field="twistPreview"]')?.closest("label");
      if(preview)preview.hidden=!isTwistEnabled(choice);
      for(const section of editor.querySelectorAll(".section"))if(section.querySelector("h3")?.textContent.trim()==="Twist")section.hidden=!isTwistEnabled(choice);
    }

    function withSerializedAdventure(action){
      if(!currentAdventure)return action();
      const toJSON=currentAdventure.toJSON;
      Object.defineProperty(currentAdventure,"toJSON",{configurable:true,enumerable:false,value:()=>serializeAdventure(currentAdventure)});
      try{return action();}finally{if(toJSON===undefined)delete currentAdventure.toJSON;else Object.defineProperty(currentAdventure,"toJSON",{configurable:true,enumerable:false,value:toJSON});}
    }

    document.addEventListener("click",event=>{
      const sceneChoiceAction=event.target.closest?.("#sceneEditor [data-choice],#addCheck,#addAutomatic");
      if(sceneChoiceAction){const sceneId=document.querySelector("#sceneDialogId")?.textContent?.trim();if(sceneId&&currentAdventure?.scenes?.[sceneId]?.type==="scene")activeSceneId=sceneId;}
      if(event.target.closest?.("#saveBtn,#jsonBtn")){
        if(!currentAdventure)return;
        const prior=currentAdventure.toJSON;
        Object.defineProperty(currentAdventure,"toJSON",{configurable:true,enumerable:false,value:()=>serializeAdventure(currentAdventure)});
        setTimeout(()=>{if(prior===undefined)delete currentAdventure.toJSON;else Object.defineProperty(currentAdventure,"toJSON",{configurable:true,enumerable:false,value:prior});},0);
      }
      if(event.target.closest?.("#undoBtn,#redoBtn"))captureNextJsonParse();
    },true);

    function captureNextJsonParse(){
      const original=JSON.parse;let restored=false;
      JSON.parse=function parseAndCapture(...args){const value=original.apply(this,args);if(!restored&&object(value)&&value.kind==="adventure"){restored=true;currentAdventure=hydrateAdventure(value);}return value;};
      setTimeout(()=>{JSON.parse=original;},0);
    }
    document.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&["z","y"].includes(event.key.toLowerCase()))captureNextJsonParse();},true);

    const observer=new MutationObserver(()=>{enhanceChoiceEditor();decorateGraph();});
    observer.observe(document.body,{childList:true,subtree:true});
    queueMicrotask(()=>{enhanceChoiceEditor();decorateGraph();});

    return{serialize:()=>withSerializedAdventure(()=>JSON.stringify(currentAdventure,null,2))};
  }

  return{PLACEHOLDER_MARKER,BACKUP_KEY,hasAuthoredTwist,isTwistEnabled,disableTwist,enableTwist,hydrateChoice,hydrateAdventure,partialTwistIssues,serializeAdventure,install};
});
