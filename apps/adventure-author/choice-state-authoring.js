(() => {
  "use strict";

  const editor=document.querySelector("#sceneEditor");
  if(!editor)return;

  const OPERATOR_LABELS={equals:"is",notEquals:"is not",gte:"is at least",lte:"is at most"};
  const MODE_LABELS={direct:"One condition",all:"All conditions",any:"Any condition"};

  function enhanceChoiceAvailability(){
    if(!editor.classList.contains("choice-editor"))return;
    for(const section of editor.querySelectorAll(".section")){
      const heading=section.querySelector("h3");
      if(!heading||heading.textContent.trim()!=="Visibility")continue;
      heading.textContent="Availability";
      if(!section.querySelector("[data-choice-state-hint]")){
        const hint=document.createElement("p");
        hint.className="hint";
        hint.dataset.choiceStateHint="";
        hint.textContent="The choice is shown only while its state condition matches. With no conditions, it is always available.";
        const titleRow=section.querySelector(".section-title");
        titleRow?.insertAdjacentElement("afterend",hint);
      }
      const mode=section.querySelector("select[data-when-mode]");
      if(mode){
        for(const option of mode.options)if(MODE_LABELS[option.value])option.textContent=MODE_LABELS[option.value];
        mode.setAttribute("aria-label","How availability conditions combine");
      }
      section.querySelectorAll("select[data-cond-op]").forEach(select=>{
        for(const option of select.options)if(OPERATOR_LABELS[option.value])option.textContent=OPERATOR_LABELS[option.value];
        select.setAttribute("aria-label","State comparison");
      });
      section.querySelectorAll("select[data-cond-path]").forEach(select=>select.setAttribute("aria-label","State value"));
      section.querySelectorAll("input[data-cond-val]").forEach(input=>{
        input.placeholder="Required value";
        input.setAttribute("aria-label","Required state value");
      });
    }
  }

  editor.addEventListener("click",event=>{
    if(!event.target.closest?.("[data-add-condition]"))return;
    queueMicrotask(()=>{
      const mode=editor.querySelector("select[data-when-mode]");
      const conditions=editor.querySelectorAll("select[data-cond-path]");
      if(mode?.value!=="all"||conditions.length!==1)return;
      mode.value="direct";
      mode.dispatchEvent(new Event("change",{bubbles:true}));
    });
  });

  new MutationObserver(enhanceChoiceAvailability).observe(editor,{childList:true,subtree:true});
  enhanceChoiceAvailability();
})();
