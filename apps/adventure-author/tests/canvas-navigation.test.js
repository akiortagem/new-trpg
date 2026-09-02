"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const Navigation=require("../canvas-navigation.js");

class FakeTarget{
  constructor(){
    this.listeners=new Map();
    this.scrollLeft=0;
    this.scrollTop=0;
    this.defaultView=null;
    const classes=new Set();
    this.classList={
      add:value=>classes.add(value),
      remove:value=>classes.delete(value),
      contains:value=>classes.has(value)
    };
  }
  addEventListener(type,handler,options){
    const handlers=this.listeners.get(type)||[];
    handlers.push({
      handler,
      once:Boolean(typeof options==="object"&&options?.once),
      capture:options===true||Boolean(typeof options==="object"&&options?.capture)
    });
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

  doc.dispatch("mousemove",{buttons:4,clientX:45,clientY:70});
  assert.equal(viewport.scrollLeft,655);
  assert.equal(viewport.scrollTop,430);

  doc.dispatch("mouseup",{});
  assert.equal(viewport.classList.contains("canvas-panning"),false);
});

test("middle mouse pan starts in capture phase before child handlers can stop propagation",()=>{
  const viewport=new FakeTarget(),doc=new FakeTarget();
  Navigation.bindMiddleMousePan(viewport,doc);

  const listener=viewport.listeners.get("mousedown")?.[0];
  assert.ok(listener);
  assert.equal(listener.capture,true);
});

test("panning is cancelled when browser focus is lost",()=>{
  const viewport=new FakeTarget(),doc=new FakeTarget(),win=new FakeTarget();
  doc.defaultView=win;
  viewport.scrollLeft=300;
  viewport.scrollTop=200;
  Navigation.bindMiddleMousePan(viewport,doc);

  viewport.dispatch("mousedown",{button:1,clientX:100,clientY:100,preventDefault(){}});
  assert.equal(viewport.classList.contains("canvas-panning"),true);

  win.dispatch("blur",{});
  assert.equal(viewport.classList.contains("canvas-panning"),false);

  doc.dispatch("mousemove",{buttons:4,clientX:0,clientY:0});
  assert.equal(viewport.scrollLeft,300);
  assert.equal(viewport.scrollTop,200);
});

test("mousemove cancels stale panning when the middle button is no longer held",()=>{
  const viewport=new FakeTarget(),doc=new FakeTarget();
  viewport.scrollLeft=300;
  viewport.scrollTop=200;
  Navigation.bindMiddleMousePan(viewport,doc);

  viewport.dispatch("mousedown",{button:1,clientX:100,clientY:100,preventDefault(){}});
  doc.dispatch("mousemove",{buttons:0,clientX:0,clientY:0});

  assert.equal(viewport.classList.contains("canvas-panning"),false);
  assert.equal(viewport.scrollLeft,300);
  assert.equal(viewport.scrollTop,200);
});

test("left mouse interaction is left to existing node and connection dragging",()=>{
  const viewport=new FakeTarget(),doc=new FakeTarget();
  viewport.scrollLeft=200;
  viewport.scrollTop=150;
  Navigation.bindMiddleMousePan(viewport,doc);

  let prevented=false;
  viewport.dispatch("mousedown",{button:0,clientX:100,clientY:100,preventDefault(){prevented=true;}});
  doc.dispatch("mousemove",{buttons:1,clientX:20,clientY:20});

  assert.equal(prevented,false);
  assert.equal(viewport.scrollLeft,200);
  assert.equal(viewport.scrollTop,150);
  assert.equal(viewport.classList.contains("canvas-panning"),false);
});
