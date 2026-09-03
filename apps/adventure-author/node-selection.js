(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else{
    root.AdventureAuthorNodeSelection=api;
    if(root.document)api.initialize(root.document);
  }
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const DOUBLE_CLICK_MS=500;
  const SELECTION_EVENT="adventure-author:node-selection-changed";

  function isEditableTarget(target){
    const tag=String(target?.tagName||"").toLowerCase();
    return Boolean(target?.isContentEditable)||tag==="input"||tag==="textarea"||tag==="select";
  }

  function isDeleteSelectionKey(event){
    return Boolean(event)&&event.key==="Delete"&&!event.ctrlKey&&!event.metaKey&&!event.altKey;
  }

  function createActivationTracker(maxDelay=DOUBLE_CLICK_MS){
    let last=null;
    return {
      record(id,time){
        const at=Number.isFinite(time)?time:Date.now();
        const doubleClick=Boolean(last&&last.id===id&&at>=last.time&&at-last.time<=maxDelay);
        last=doubleClick?null:{id,time:at};
        return doubleClick;
      },
      reset(){last=null;}
    };
  }

  function nodeFromEvent(event,canvas){
    const target=event?.target;
    if(target?.closest?.(".output-port,.input-port"))return null;
    const node=target?.closest?.(".node")||null;
    return node&&canvas?.contains?.(node)?node:null;
  }

  function selectedNode(canvas){return canvas?.querySelector?.(".node.selected")||null;}

  function shouldDeleteSelection(event,{hasSelection=false,dialogOpen=false}={}){
    return isDeleteSelectionKey(event)&&hasSelection&&!dialogOpen&&!isEditableTarget(event.target);
  }

  function initialize(doc){
    if(!doc)return()=>{};
    const canvas=doc.querySelector("#canvas"),sceneDialog=doc.querySelector("#sceneDialog"),inspector=doc.querySelector("#inspector");
    if(!canvas||!sceneDialog||!inspector)return()=>{};

    const tracker=createActivationTracker();
    const nativeShowModal=typeof sceneDialog.showModal==="function"?sceneDialog.showModal.bind(sceneDialog):null;
    const defer=typeof queueMicrotask==="function"?queueMicrotask:fn=>setTimeout(fn,0);
    let allowSceneOpen=false;
    let pointer=null;
    let ignoreNextClickId=null;

    function emitSelection(){
      const node=selectedNode(canvas),Ctor=doc.defaultView?.CustomEvent;
      if(!Ctor||typeof canvas.dispatchEvent!=="function")return;
      canvas.dispatchEvent(new Ctor(SELECTION_EVENT,{detail:{id:node?.dataset?.id||null,type:node?.classList?.contains("scene")?"scene":node?.classList?.contains("combat")?"combat":node?.classList?.contains("ending")?"ending":null}}));
    }

    function syncSceneSelectionInspector(){
      if(sceneDialog.open)return;
      const node=selectedNode(canvas);
      if(!node?.classList?.contains("scene"))return;
      const id=String(node.dataset?.id||"");
      const escaped=id.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
      inspector.innerHTML=`<div class="inspector-heading"><h2>Scene</h2><span class="entity-id">${escaped}</span></div><p class="hint">Selected. Double-click the node to edit this scene.</p>`;
    }

    if(nativeShowModal){
      sceneDialog.showModal=function(){
        if(allowSceneOpen){allowSceneOpen=false;return nativeShowModal();}
        defer(syncSceneSelectionInspector);
      };
    }

    function onMouseDown(event){
      if(event.button!==0)return;
      const node=nodeFromEvent(event,canvas);
      if(!node)return;
      pointer={id:node.dataset.id,x:event.clientX,y:event.clientY,moved:false};
    }

    function onMouseMove(event){
      if(!pointer)return;
      if(Math.abs(event.clientX-pointer.x)+Math.abs(event.clientY-pointer.y)>3)pointer.moved=true;
    }

    function onMouseUp(){
      if(pointer?.moved){
        const id=pointer.id;
        ignoreNextClickId=id;
        tracker.reset();
        defer(()=>{if(ignoreNextClickId===id)ignoreNextClickId=null;});
      }
      pointer=null;
    }

    function onClickCapture(event){
      const node=nodeFromEvent(event,canvas);
      if(!node){tracker.reset();defer(emitSelection);return;}
      const id=node.dataset.id;
      if(ignoreNextClickId===id){ignoreNextClickId=null;tracker.reset();defer(emitSelection);return;}
      if(node.classList.contains("scene")&&tracker.record(id,event.timeStamp)){
        allowSceneOpen=true;
        defer(()=>{allowSceneOpen=false;});
      }else if(!node.classList.contains("scene"))tracker.reset();
      defer(()=>{syncSceneSelectionInspector();emitSelection();});
    }

    function onKeyDown(event){
      const node=selectedNode(canvas),dialogOpen=Boolean(doc.querySelector("dialog[open]"));
      if(!shouldDeleteSelection(event,{hasSelection:Boolean(node),dialogOpen}))return;
      const deleteButton=doc.querySelector("#deleteNode");
      if(!deleteButton)return;
      event.preventDefault();
      deleteButton.click();
    }

    canvas.addEventListener("mousedown",onMouseDown,true);
    canvas.addEventListener("click",onClickCapture,true);
    doc.addEventListener("mousemove",onMouseMove,true);
    doc.addEventListener("mouseup",onMouseUp,true);
    doc.addEventListener("keydown",onKeyDown);

    return()=>{
      canvas.removeEventListener("mousedown",onMouseDown,true);
      canvas.removeEventListener("click",onClickCapture,true);
      doc.removeEventListener("mousemove",onMouseMove,true);
      doc.removeEventListener("mouseup",onMouseUp,true);
      doc.removeEventListener("keydown",onKeyDown);
      if(nativeShowModal)sceneDialog.showModal=nativeShowModal;
    };
  }

  return {DOUBLE_CLICK_MS,SELECTION_EVENT,isEditableTarget,isDeleteSelectionKey,createActivationTracker,nodeFromEvent,selectedNode,shouldDeleteSelection,initialize};
});
