(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else{
    root.AdventureAuthorShortcutGuard=api;
    if(typeof root.addEventListener==="function"){
      root.addEventListener("keydown",event=>{
        if(api.isHistoryShortcut(event)&&api.isEditableTarget(event.target))event.stopPropagation();
      },true);
    }
  }
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  function isEditableTarget(target){
    const tag=String(target?.tagName||"").toLowerCase();
    return Boolean(target?.isContentEditable)||tag==="input"||tag==="textarea"||tag==="select";
  }

  function isHistoryShortcut(event){
    if(!event||(event.ctrlKey!==true&&event.metaKey!==true))return false;
    const key=String(event.key||"").toLowerCase();
    return key==="z"||key==="y";
  }

  return {isEditableTarget,isHistoryShortcut};
});
