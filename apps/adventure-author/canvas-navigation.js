(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.AdventureCanvasNavigation=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const MAIN_CANVAS_WIDTH=5400;
  const MAIN_CANVAS_HEIGHT=3600;
  const MIDDLE_MOUSE_BUTTON=1;
  const MIDDLE_MOUSE_BUTTON_MASK=4;

  function extendMainCanvas(canvas,edges){
    if(!canvas||!edges)return;
    canvas.style.minWidth=`${MAIN_CANVAS_WIDTH}px`;
    canvas.style.minHeight=`${MAIN_CANVAS_HEIGHT}px`;
    edges.style.width=`${MAIN_CANVAS_WIDTH}px`;
    edges.style.height=`${MAIN_CANVAS_HEIGHT}px`;
  }

  function bindMiddleMousePan(viewport,doc){
    if(!viewport||!doc)return()=>{};
    const win=doc.defaultView||null;
    let panning=null;

    function end(){
      if(!panning)return;
      panning=null;
      viewport.classList?.remove("canvas-panning");
      doc.removeEventListener("mousemove",move);
      doc.removeEventListener("mouseup",end);
      win?.removeEventListener("blur",end);
    }

    function move(event){
      if(!panning)return;
      if(typeof event.buttons==="number"&&(event.buttons&MIDDLE_MOUSE_BUTTON_MASK)===0){
        end();
        return;
      }
      viewport.scrollLeft=panning.scrollLeft-(event.clientX-panning.x);
      viewport.scrollTop=panning.scrollTop-(event.clientY-panning.y);
    }

    function start(event){
      if(event.button!==MIDDLE_MOUSE_BUTTON)return;
      event.preventDefault();
      end();
      panning={x:event.clientX,y:event.clientY,scrollLeft:viewport.scrollLeft,scrollTop:viewport.scrollTop};
      viewport.classList?.add("canvas-panning");
      doc.addEventListener("mousemove",move);
      doc.addEventListener("mouseup",end);
      win?.addEventListener("blur",end);
    }

    function suppressMiddleAuxClick(event){
      if(event.button===MIDDLE_MOUSE_BUTTON)event.preventDefault();
    }

    viewport.addEventListener("mousedown",start,true);
    viewport.addEventListener("auxclick",suppressMiddleAuxClick);

    return()=>{
      end();
      viewport.removeEventListener("mousedown",start,true);
      viewport.removeEventListener("auxclick",suppressMiddleAuxClick);
    };
  }

  function initialize(doc){
    if(!doc)return;
    const viewport=doc.querySelector(".canvas-wrap");
    const canvas=doc.querySelector("#canvas");
    const edges=doc.querySelector("#edges");
    extendMainCanvas(canvas,edges);
    bindMiddleMousePan(viewport,doc);
  }

  return {MAIN_CANVAS_WIDTH,MAIN_CANVAS_HEIGHT,MIDDLE_MOUSE_BUTTON,MIDDLE_MOUSE_BUTTON_MASK,extendMainCanvas,bindMiddleMousePan,initialize};
});

if(typeof document!=="undefined")AdventureCanvasNavigation.initialize(document);