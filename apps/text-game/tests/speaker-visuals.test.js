const test=require('node:test');
const assert=require('node:assert/strict');
const Visuals=require('../speaker-visuals.js');

function adventure(passages){return{kind:'adventure',scenes:{start:{type:'scene',text:passages}}}}

test('old adventures receive deterministic automatic identities',()=>{
  const value=adventure([{speaker:'Mira',text:'A'},{speaker:'Ardan',text:'B'},{speaker:'Mira',text:'C'}]);
  const first=Visuals.assignmentsForAdventure(value),second=Visuals.assignmentsForAdventure(value);
  assert.deepEqual(first,second);
  assert.notEqual(first.Mira,first.Ardan);
  assert.equal(Visuals.inspectAdventure(value).errors.length,0);
});

test('authored identities are reserved while remaining speakers are assigned automatically',()=>{
  const value=adventure([{speaker:'Mira',text:'A',visualIdentity:'teal'},{speaker:'Ardan',text:'B'}]);
  const assignments=Visuals.assignmentsForAdventure(value);
  assert.equal(assignments.Mira,'teal');
  assert.notEqual(assignments.Ardan,'teal');
});

test('conflicting or unknown authored identities are validation errors',()=>{
  const value=adventure([
    {speaker:'Mira',text:'A',visualIdentity:'teal'},
    {speaker:'Mira',text:'B',visualIdentity:'rose'},
    {speaker:'Ardan',text:'C',visualIdentity:'ultraviolet'}
  ]);
  const errors=Visuals.inspectAdventure(value).errors;
  assert.equal(errors.length,2);
  assert.match(errors[0],/conflicts/);
  assert.match(errors[1],/must be one of/);
});
