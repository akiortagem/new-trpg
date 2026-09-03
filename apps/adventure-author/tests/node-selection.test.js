"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const Selection=require("../node-selection.js");

test("scene activation requires two clicks on the same node within the double-click window",()=>{
  const tracker=Selection.createActivationTracker(500);
  assert.equal(tracker.record("scene-a",1000),false);
  assert.equal(tracker.record("scene-a",1400),true);
  assert.equal(tracker.record("scene-a",2000),false);
  assert.equal(tracker.record("scene-b",2200),false);
  assert.equal(tracker.record("scene-a",2300),false);
  assert.equal(tracker.record("scene-a",2900),false);
});

test("reset prevents a drag release from contributing to scene activation",()=>{
  const tracker=Selection.createActivationTracker(500);
  assert.equal(tracker.record("scene-a",1000),false);
  tracker.reset();
  assert.equal(tracker.record("scene-a",1200),false);
});

test("Delete only removes a selected node from non-editable, non-dialog context",()=>{
  const base={key:"Delete",ctrlKey:false,metaKey:false,altKey:false,target:{tagName:"DIV"}};
  assert.equal(Selection.shouldDeleteSelection(base,{hasSelection:true,dialogOpen:false}),true);
  assert.equal(Selection.shouldDeleteSelection({...base,target:{tagName:"INPUT"}},{hasSelection:true,dialogOpen:false}),false);
  assert.equal(Selection.shouldDeleteSelection(base,{hasSelection:false,dialogOpen:false}),false);
  assert.equal(Selection.shouldDeleteSelection(base,{hasSelection:true,dialogOpen:true}),false);
  assert.equal(Selection.shouldDeleteSelection({...base,key:"Backspace"},{hasSelection:true,dialogOpen:false}),false);
  assert.equal(Selection.shouldDeleteSelection({...base,ctrlKey:true},{hasSelection:true,dialogOpen:false}),false);
});

test("node hit testing ignores connection ports",()=>{
  const node={};
  const canvas={contains:value=>value===node};
  const regularTarget={closest:selector=>selector===".node"?node:null};
  const portTarget={closest:selector=>selector===".output-port,.input-port"?{}:selector===".node"?node:null};
  assert.equal(Selection.nodeFromEvent({target:regularTarget},canvas),node);
  assert.equal(Selection.nodeFromEvent({target:portTarget},canvas),null);
});

test("browser integration blocks first scene open, allows second click, and wires Delete",async()=>{
  const listeners={canvas:{},doc:{}};
  const selected={dataset:{id:"scene-a"},classList:{contains:name=>name==="scene"}};
  const target={closest:selector=>selector===".node"?selected:null};
  let modalOpens=0,deleteClicks=0,prevented=0;
  const canvas={
    addEventListener:(type,fn)=>{listeners.canvas[type]=fn;},
    removeEventListener:()=>{},
    contains:value=>value===selected,
    querySelector:selector=>selector===".node.selected"?selected:null,
    dispatchEvent:()=>{}
  };
  const sceneDialog={open:false,showModal(){modalOpens++;this.open=true;}};
  const inspector={innerHTML:""};
  const deleteButton={click:()=>{deleteClicks++;}};
  const doc={
    defaultView:{CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}}},
    querySelector(selector){
      if(selector==="#canvas")return canvas;
      if(selector==="#sceneDialog")return sceneDialog;
      if(selector==="#inspector")return inspector;
      if(selector==="dialog[open]")return sceneDialog.open?sceneDialog:null;
      if(selector==="#deleteNode")return deleteButton;
      return null;
    },
    addEventListener:(type,fn)=>{listeners.doc[type]=fn;},
    removeEventListener:()=>{}
  };

  Selection.initialize(doc);
  listeners.canvas.click({target,timeStamp:1000});
  sceneDialog.showModal();
  await Promise.resolve();
  assert.equal(modalOpens,0);
  assert.match(inspector.innerHTML,/Double-click the node/);

  listeners.canvas.click({target,timeStamp:1200});
  sceneDialog.showModal();
  assert.equal(modalOpens,1);

  sceneDialog.open=false;
  listeners.doc.keydown({key:"Delete",ctrlKey:false,metaKey:false,altKey:false,target:{tagName:"DIV"},preventDefault(){prevented++;}});
  assert.equal(deleteClicks,1);
  assert.equal(prevented,1);
});
