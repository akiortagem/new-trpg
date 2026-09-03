(() => {
  "use strict";

  const editor=document.querySelector("#sceneEditor");
  if(!editor)return;

  const OPERATOR_LABELS={equals:"is",notEquals:"is not",gte:"is at least",lte:"is at most"};

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

  new MutationObserver(enhanceChoiceAvailability).observe(editor,{childList:true,subtree:true});
  enhanceChoiceAvailability();
})();
