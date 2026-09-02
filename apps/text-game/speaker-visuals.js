(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.SpeakerVisuals=api;
  if(root.document&&root.TextGameCore&&root.document.querySelector("#app"))api.installRuntime(root);
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const PALETTE=["teal","amber","rose","violet","green","blue","coral","mint"];
  const SLOT_PREFIX="new-trpg-text-game-slot-";
  const object=value=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);

  function hashSpeaker(value){
    let hash=2166136261;
    for(const char of String(value||"")){hash^=char.codePointAt(0);hash=Math.imul(hash,16777619)}
    return hash>>>0;
  }

  function dialoguePassages(adventure){
    const passages=[];
    for(const [sceneId,scene] of Object.entries(adventure?.scenes||{})){
      if(scene?.type!=="scene")continue;
      (scene.text||[]).forEach((passage,index)=>{
        if(object(passage)&&typeof passage.speaker==="string"&&passage.speaker.trim())passages.push({sceneId,index,passage,speaker:passage.speaker.trim()});
      });
    }
    return passages;
  }

  function inspectAdventure(adventure){
    const speakers=[],seen=new Set(),authored={},errors=[];
    for(const {sceneId,index,passage,speaker} of dialoguePassages(adventure)){
      if(!seen.has(speaker)){seen.add(speaker);speakers.push(speaker)}
      if(passage.visualIdentity==null||passage.visualIdentity==="")continue;
      if(!PALETTE.includes(passage.visualIdentity)){
        errors.push(`adventure.scenes.${sceneId}.text[${index}].visualIdentity: must be one of ${PALETTE.join(", ")}`);
        continue;
      }
      if(authored[speaker]&&authored[speaker]!==passage.visualIdentity){
        errors.push(`adventure speaker ${speaker}: visualIdentity conflicts between ${authored[speaker]} and ${passage.visualIdentity}`);
        continue;
      }
      authored[speaker]=passage.visualIdentity;
    }
    return{speakers,authored,errors};
  }

  function assignmentsForAdventure(adventure){
    const {speakers,authored}=inspectAdventure(adventure),assignments={...authored},used=new Set(Object.values(authored));
    for(const speaker of speakers){
      if(assignments[speaker])continue;
      const start=hashSpeaker(speaker)%PALETTE.length;
      let token=PALETTE[start];
      if(used.size<PALETTE.length){
        for(let offset=0;offset<PALETTE.length;offset++){
          const candidate=PALETTE[(start+offset)%PALETTE.length];
          if(!used.has(candidate)){token=candidate;break}
        }
      }
      assignments[speaker]=token;used.add(token);
    }
    return assignments;
  }

  function installRuntime(root){
    if(root.__speakerVisualsRuntimeInstalled)return;
    root.__speakerVisualsRuntimeInstalled=true;
    const doc=root.document,core=root.TextGameCore;
    let assignments={},lastSpeaker=null;

    const setAdventure=adventure=>{assignments=assignmentsForAdventure(adventure);lastSpeaker=null;};
    const originalValidate=core.validateAdventure.bind(core);
    core.validateAdventure=function validateAdventureWithSpeakerVisuals(adventure){
      const errors=originalValidate(adventure),visualErrors=inspectAdventure(adventure).errors;
      if(!errors.length&&!visualErrors.length)setAdventure(adventure);
      return[...errors,...visualErrors];
    };
    const originalCreateRun=core.createRun.bind(core);
    core.createRun=function createRunWithSpeakerVisuals(mainCharacter,adventure,...rest){
      setAdventure(adventure);
      return originalCreateRun(mainCharacter,adventure,...rest);
    };

    function loadSlotAdventure(index){
      try{
        const saved=JSON.parse(root.localStorage.getItem(SLOT_PREFIX+index));
        if(saved?.run?.adventure)setAdventure(saved.run.adventure);
      }catch{}
    }
    doc.addEventListener("click",event=>{
      const button=event.target.closest?.("[data-load-slot]");
      if(button)loadSlotAdventure(button.dataset.loadSlot);
    },true);

    function applyIdentity(element,speaker){
      const token=assignments[speaker];
      if(!token)return;
      for(const item of PALETTE)element.classList.remove(`vi-${item}`);
      element.classList.add(`vi-${token}`);
      element.dataset.visualIdentity=token;
    }
    function decorateHistory(){
      doc.querySelectorAll(".vn-history-dialogue").forEach(entry=>{
        const speaker=entry.querySelector("strong")?.textContent?.trim();
        if(speaker)applyIdentity(entry,speaker);
      });
    }
    function decorateTextbox(){
      const box=doc.querySelector(".vn-textbox");
      if(!box||box.dataset.viDecorated)return;
      box.dataset.viDecorated="1";
      if(box.classList.contains("vn-scene"))return;
      const speaker=box.querySelector(".vn-speaker")?.textContent?.trim();
      if(!speaker)return;
      if(box.classList.contains("vn-dialogue"))applyIdentity(box,speaker);
      if(lastSpeaker&&lastSpeaker!==speaker)box.classList.add("vi-speaker-change");
      lastSpeaker=speaker;
    }
    function decorate(){decorateHistory();decorateTextbox()}
    const observer=new root.MutationObserver(decorate);
    observer.observe(doc.querySelector("#app"),{childList:true,subtree:true});
    decorate();
    return{setAdventure,decorate,disconnect:()=>observer.disconnect()};
  }

  return{PALETTE,hashSpeaker,dialoguePassages,inspectAdventure,assignmentsForAdventure,installRuntime};
});
