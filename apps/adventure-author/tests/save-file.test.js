"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const Core=require("../../text-game/core.js");
const Model=require("../authoring-model.js");
const source=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
// Exercise the app's actual document/history/file handlers with browser I/O mocked.
const handlers=source.slice(source.indexOf("  let adventure ="),source.indexOf("  function outputsFor"));

function deferred(){let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};}
function fileHandle(id,closing=Promise.resolve()){
  const writes=[];
  return {writes,getFile:async()=>({text:async()=>JSON.stringify(Model.createAdventureDraft(id,id,3))}),
    createWritable:async()=>({write:async text=>writes.push(JSON.parse(text)),close:()=>closing})};
}
function setup(){
  const nodes=new Map(),timers=new Map(),alerts=[];
  const $=id=>{if(!nodes.has(id))nodes.set(id,{hidden:true,textContent:"",classList:{toggle(){}},listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}});return nodes.get(id);};
  const context={Core,Model,$,document:{addEventListener(){},activeElement:{blur(){}}},window:{},fileLabel:$("#fileLabel"),alert:message=>alerts.push(message),
    render(){context.fileLabel.textContent=context.api.adventure.title;},
    renderBattlefield(){},renderEnemyCatalog(){},
    setTimeout(fn){const id=timers.size+1;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}};
  vm.createContext(context);
  vm.runInContext(handlers+`\nthis.api={newAdventure,openFile,saveFile,undo,redo,
    get adventure(){return adventure;},get handle(){return fileHandle;},
    editTitle(title){checkpoint();adventure.title=title;}};`,context);
  const api=context.api;
  const open=async handle=>{context.window.showOpenFilePicker=async()=>[handle];await api.openFile();};
  const fallbackOpen=async id=>{$("#fallbackOpen");await $("#fallbackOpen").listeners.change({target:{files:[await fileHandle(id).getFile()],value:""}});};
  return {api,context,$,alerts,open,fallbackOpen};
}

for(const mode of ["new","open","fallback"]){
  test(`pending save cannot replace the ${mode} adventure's file handle or status`,async()=>{
    const t=setup(),closing=deferred(),old=fileHandle("old",closing.promise),next=fileHandle("new");
    await t.open(old);
    const saving=t.api.saveFile();
    await new Promise(setImmediate);
    assert.equal(old.writes.length,1);
    assert.equal(t.$("#saveBtn").disabled,true);
    assert.equal(t.$("#saveToast").hidden,true);
    if(mode==="new")t.api.newAdventure("new",3);
    else if(mode==="open")await t.open(next);
    else await t.fallbackOpen("new");
    const expectedHandle=t.api.handle,label=t.$("#fileLabel").textContent;
    closing.resolve();await saving;
    assert.equal(t.api.handle,expectedHandle);
    assert.equal(t.$("#fileLabel").textContent,label);
    assert.equal(t.$("#saveToast").hidden,true);
    assert.equal(t.$("#saveBtn").disabled,false);
    t.context.window.showSaveFilePicker=async()=>next;
    await t.api.saveFile();
    assert.equal(old.writes.length,1,"the next Save must not overwrite the previous file");
    assert.equal(next.writes.length,1);
    assert.equal(next.writes[0].id,"new");
    assert.deepEqual(t.alerts,[]);
  });
}

test("a pending first-save picker cannot attach its handle after a document switch",async()=>{
  const t=setup(),picker=deferred(),old=fileHandle("old");
  t.api.newAdventure("old",3);
  t.context.window.showSaveFilePicker=()=>picker.promise;
  const saving=t.api.saveFile();
  t.api.newAdventure("new",3);
  picker.resolve(old);await saving;
  assert.equal(old.writes[0].id,"old");
  assert.equal(t.api.handle,null);
  assert.equal(t.$("#fileLabel").textContent,"new");
  assert.equal(t.$("#saveToast").hidden,true);
});

test("undo and redo during a first save preserve the document's new file association",async()=>{
  const t=setup(),closing=deferred(),handle=fileHandle("draft",closing.promise);
  t.api.newAdventure("draft",3);
  t.context.window.showSaveFilePicker=async()=>handle;
  const saving=t.api.saveFile();
  await new Promise(setImmediate);
  t.api.editTitle("Edited");t.api.undo();t.api.redo();
  closing.resolve();await saving;
  assert.equal(t.api.handle,handle);
  assert.equal(t.api.adventure.title,"Edited");
  assert.equal(t.$("#saveToast").textContent,"Adventure successfully saved.");
  assert.equal(t.$("#saveBtn").disabled,false);
});

