const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
function setup(){
  const elements=new Map(),events={};
  function element(key){if(!elements.has(key))elements.set(key,{textContent:'',disabled:false,hidden:true,classList:{toggle(){}},addEventListener(){},remove(){},click(){}});return elements.get(key);}
  const context={window:{TextGameCore:{},AdventureAuthorModel:{slug:x=>x}},document:{querySelector:element,addEventListener:(type,fn)=>events[type]=fn,activeElement:{blur(){}},createElement:()=>element('link'),body:{appendChild(){}}},setTimeout:()=>0,clearTimeout(){},alert(){},Blob,URL:{createObjectURL:()=>'',revokeObjectURL(){}}};
  vm.createContext(context);
  vm.runInContext(source.slice(0,source.indexOf('  function outputsFor'))+`
    function render(){updateSaveStatus();}
    window.test={set(value){adventure=value;},get(){return adventure;},resetSaveStatus,updateSaveStatus,saveFile,mutateInline,undo,redo,session(){documentSession++;},handle(value){fileHandle=value;}};
  })();`,context);
  return {api:context.window.test,window:context.window,status:element('#saveStatus'),events};
}
(async()=>{
  const {api,window,status,events}=setup();
  api.set({id:'draft',title:'Draft'});api.resetSaveStatus();assert.match(status.textContent,/Unsaved changes · Never saved/);
  api.resetSaveStatus({lastModified:1700000000000});assert.match(status.textContent,/All changes saved · Last saved:/);
  const initial=status.textContent;
  api.mutateInline(()=>api.get().title='Edited');assert.match(status.textContent,/Unsaved changes/);
  api.undo();assert.equal(status.textContent,initial);api.redo();assert.match(status.textContent,/Unsaved changes/);
  const input={value:'Typing',defaultValue:'Edited',type:'text',matches:()=>true,closest:()=>null};
  api.resetSaveStatus({lastModified:1700000000000});events.input({target:input});assert.match(status.textContent,/Unsaved changes/);
  input.value='Edited';events.input({target:input});assert.match(status.textContent,/All changes saved/);
  let finish;window.showSaveFilePicker=async()=>({createWritable:async()=>({write:async()=>{},close:()=>new Promise(resolve=>finish=resolve)})});
  const saving=api.saveFile();while(!finish)await Promise.resolve();api.mutateInline(()=>api.get().title='During save');finish();await saving;assert.match(status.textContent,/Unsaved changes · Last saved:/);
  api.undo();assert.match(status.textContent,/All changes saved/);
  api.mutateInline(()=>api.get().title='Failure');const before=status.textContent;
  api.handle({createWritable:async()=>{throw Error('disk full');}});await api.saveFile();assert.equal(status.textContent,before);
  api.handle(null);window.showSaveFilePicker=async()=>{throw Object.assign(Error('cancel'),{name:'AbortError'});};await api.saveFile();assert.equal(status.textContent,before);
  delete window.showSaveFilePicker;await api.saveFile();assert.match(status.textContent,/Unsaved changes.*Download started:.*save unconfirmed/);
  finish=null;window.showSaveFilePicker=async()=>({createWritable:async()=>({write:async()=>{},close:()=>new Promise(resolve=>finish=resolve)})});
  const oldSave=api.saveFile();while(!finish)await Promise.resolve();api.session();api.set({id:'new',title:'New'});api.resetSaveStatus();finish();await oldSave;assert.equal(status.textContent,'Unsaved changes · Never saved');
  console.log('Save status tests passed: new/open, inline edits, typing, undo/redo, concurrent edits, failure, cancellation, download, document switching.');
})().catch(error=>{console.error(error);process.exitCode=1;});
