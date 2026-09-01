"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const Guard=require("../shortcut-guard.js");

test("history shortcut detection covers Ctrl/Cmd undo and redo",()=>{
  assert.equal(Guard.isHistoryShortcut({ctrlKey:true,metaKey:false,key:"z"}),true);
  assert.equal(Guard.isHistoryShortcut({ctrlKey:true,metaKey:false,key:"y"}),true);
  assert.equal(Guard.isHistoryShortcut({ctrlKey:false,metaKey:true,key:"Z"}),true);
  assert.equal(Guard.isHistoryShortcut({ctrlKey:false,metaKey:false,key:"z"}),false);
  assert.equal(Guard.isHistoryShortcut({ctrlKey:true,metaKey:false,key:"s"}),false);
});

test("editable controls keep native history shortcuts",()=>{
  assert.equal(Guard.isEditableTarget({tagName:"INPUT"}),true);
  assert.equal(Guard.isEditableTarget({tagName:"TEXTAREA"}),true);
  assert.equal(Guard.isEditableTarget({tagName:"SELECT"}),true);
  assert.equal(Guard.isEditableTarget({tagName:"DIV",isContentEditable:true}),true);
  assert.equal(Guard.isEditableTarget({tagName:"BUTTON"}),false);
  assert.equal(Guard.isEditableTarget({tagName:"DIV"}),false);
});
