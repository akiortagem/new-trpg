(function(root,factory){
  const shared=typeof module!=="undefined"&&module.exports?require("../text-game/speaker-visuals.js"):root.SpeakerVisuals;
  const api=factory(shared);
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.AdventureAuthorSpeakerVisuals=api;
  if(root.document&&root.AdventureAuthorModel)api.installAuthoring(root);
})(typeof globalThis!=="undefined"?globalThis:this,function(Shared){
  "use strict";

  const PALETTE=Shared.PALETTE;
  const object=value=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);

  function authoredOverrides(adventure){
    const overrides=new Map();
    for(const {passage,speaker} of Shared.dialoguePassages(adventure)){
      if(PALETTE.includes(passage.visualIdentity)&&!overrides.has(speaker))overrides.set(speaker,passage.visualIdentity);
    }
    return overrides;
  }

  function applySpeakerIdentityOverrides(adventure,overrides){
    let changed=0;
    for(const {passage,speaker} of Shared.dialoguePassages(adventure)){
      if(!overrides.has(speaker))continue;
      const identity=overrides.get(speaker);
      if(identity==null||identity==="automatic"){
        if(Object.prototype.hasOwnProperty.call(passage,"visualIdentity")){delete passage.visualIdentity;changed++}
      }else if(PALETTE.includes(identity)&&passage.visualIdentity!==identity){passage.visualIdentity=identity;changed++}
    }
    return changed;
  }

  function installAuthoring(root){
    if(root.__authorSpeakerVisualsInstalled)return;
    root.__authorSpeakerVisualsInstalled=true;
    const doc=root.document,model=root.AdventureAuthorModel,originalParse=JSON.parse.bind(JSON),originalCreate=model.createAdventureDraft.bind(model);
    let activeAdventure=null,overrides=new Map();

    function captureAdventure(adventure){
      if(!object(adventure)||adventure.kind!=="adventure")return adventure;
      activeAdventure=adventure;overrides=authoredOverrides(adventure);queueMicrotask(refreshVisibleCards);return adventure;
    }
    JSON.parse=function parseWithSpeakerVisuals(...args){return captureAdventure(originalParse(...args))};
    model.createAdventureDraft=function createAdventureDraftWithSpeakerVisuals(...args){return captureAdventure(originalCreate(...args))};

    function optionHtml(selected){
      return [`<option value="automatic"${selected?"":" selected"}>Automatic</option>`,...PALETTE.map(token=>`<option value="${token}"${selected===token?" selected":""}>${token[0].toUpperCase()+token.slice(1)}</option>`)].join("");
    }
    function refreshCard(card,input){
      if(!card)return;
      const speaker=input.value.trim(),select=card.querySelector("[data-speaker-vi]"),identity=overrides.get(speaker)||"automatic";
      if(select&&select.value!==identity)select.value=identity;
      for(const token of PALETTE)card.classList.remove(`vi-${token}`);
      if(identity!=="automatic")card.classList.add(`vi-${identity}`);
      const swatch=card.querySelector(".speaker-vi-swatch");if(swatch)swatch.dataset.identity=identity;
      input.dataset.viSpeaker=speaker;
    }
    function forceCheckpoint(input){
      input.dataset.viCheckpoint="1";
      input.dispatchEvent(new Event("change",{bubbles:true}));
      delete input.dataset.viCheckpoint;
    }
    function installCard(input){
      const card=input.closest(".card");if(!card||card.querySelector("[data-speaker-vi]"))return;
      const speaker=input.value.trim(),selected=overrides.get(speaker)||null,label=doc.createElement("label");
      label.className="speaker-vi-field";
      label.innerHTML=`<span class="speaker-vi-label"><i class="speaker-vi-swatch" aria-hidden="true"></i>Visual identity</span><select data-speaker-vi>${optionHtml(selected)}</select>`;
      input.insertAdjacentElement("afterend",label);
      label.querySelector("select").addEventListener("change",event=>{
        if(!activeAdventure)return;
        const current=input.value.trim(),identity=event.target.value==="automatic"?null:event.target.value;
        forceCheckpoint(input);
        applySpeakerIdentityOverrides(activeAdventure,new Map([[current,identity]]));
        overrides=authoredOverrides(activeAdventure);
        queueMicrotask(refreshVisibleCards);
      });
      refreshCard(card,input);
    }
    function refreshVisibleCards(){doc.querySelectorAll("[data-pass-speaker]").forEach(input=>{installCard(input);refreshCard(input.closest(".card"),input)})}

    doc.addEventListener("change",event=>{
      const input=event.target.closest?.("[data-pass-speaker]");if(!input||input.dataset.viCheckpoint)return;
      const previous=input.dataset.viSpeaker||"",next=input.value.trim();
      if(previous===next){queueMicrotask(refreshVisibleCards);return}
      input.dataset.viSpeaker=next;
      queueMicrotask(()=>{
        if(!activeAdventure)return;
        const identity=overrides.has(next)?overrides.get(next):null;
        applySpeakerIdentityOverrides(activeAdventure,new Map([[next,identity]]));
        overrides=authoredOverrides(activeAdventure);
        refreshVisibleCards();
      });
    },true);

    const sceneEditor=doc.querySelector("#sceneEditor");
    if(sceneEditor){new root.MutationObserver(refreshVisibleCards).observe(sceneEditor,{childList:true,subtree:true});refreshVisibleCards()}
    return{captureAdventure,refreshVisibleCards,getAdventure:()=>activeAdventure,getOverrides:()=>new Map(overrides)};
  }

  return{PALETTE,authoredOverrides,applySpeakerIdentityOverrides,installAuthoring};
});
