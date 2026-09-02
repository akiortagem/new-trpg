"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const Navigation=require("../canvas-navigation.js");

class FakeTarget{
  constructor(){
    this.listeners=new Map();
    this.scrollLeft=0;
    this.scrollTop=0;
    const classes=new Set();
    this.classList={
      add:value=>classes.add(value),
      remove:value=>classes.delete(value),
      contains:value=>classes.has(value)
    };
  }
  addEventListener(type,handler,options){
    const handlers=this.listeners.get(type)||[];
    handlers.push({handler,once:Boolean(options?.once)});
    this.listeners.set(type,handlers);
  }
  removeEventListener(type,handler){
    this.listeners.set(type,(this.listeners.get(type)||[]).filter(entry=>entry.handler!==handler));
  }
  dispatch(type,event={}){
    for(const entry of [...(this.listeners.get(type)||[])]){
      entry.handler(event);
      if(entry.once)this.removeEventListener(type,entry.handler);
    }
  }
}

test("main authoring canvas is pre-extended to three times its prior baseline",()=>{
  const canvas={style:{}},edges={style:{}};
  Navigation.extendMainCanvas(canvas,edges);
  assert.equal(Navigation.MAIN_CANVAS_WIDTH,5400);
  assert.equal(Navigation.MAIN_CANVAS_HEIGHT,3600);
  assert.equal(canvas.style.minWidth,"5400px");
  assert.equal(canvas.style.minHeight,"3600px");
  assert.equal(edges.style.width,"5400px");
  assert.equal(edges.style.height,"3600px");
});

test("middle mouse drag pans the authoring viewport",()=>{
  const viewport=new FakeTarget(),doc=new FakeTarget();
  viewport.scrollLeft=600;
  viewport.scrollTop=400;
  Navigation.bindMiddleMousePan(viewport,doc);

  let prevented=false;
  viewport.dispatch("mousedown",{button:1,clientX:100,clientY:100,preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  assert.equal(viewport.classList.contains("canvas-panning"),true);

  doc.dispatch("mousemove",{clientX:45,clientY:70});
  assert.equal(viewport.scrollLeft,655);
  assert.equal(viewport.scrollTop,430);

  doc.dispatch("mouseup",{});
  assert.equal(viewport.classList.contains("canvas-panning"),false);
});

test("left mouse interaction is left to existing node and connection dragging",()=>{
  const viewport=new FakeTarget(),doc=new FakeTarget();
  viewport.scrollLeft=200;
  viewport.scrollTop=150;
  Navigation.bindMiddleMousePan(viewport,doc);

  let prevented=false;
  viewport.dispatch("mousedown",{button:0,clientX:100,clientY:100,preventDefault(){prevented=true;}});
  doc.dispatch("mousemove",{clientX:20,clientY:20});

  assert.equal(prevented,false);
  assert.equal(viewport.scrollLeft,200);
  assert.equal(viewport.scrollTop,150);
  assert.equal(viewport.classList.contains("canvas-panning"),false);
});
