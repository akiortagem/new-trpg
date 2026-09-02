const test=require('node:test');
const assert=require('node:assert/strict');
const AuthorVisuals=require('../speaker-visuals.js');

function adventure(){return{kind:'adventure',scenes:{a:{type:'scene',text:[
  'Narration',
  {speaker:'Mira',text:'One'},
  {speaker:'Ardan',text:'Two'}
]},b:{type:'scene',text:[{speaker:'Mira',text:'Three'}]}}}}

test('author override applies to every dialogue passage for the same speaker',()=>{
  const value=adventure(),overrides=new Map([['Mira','violet']]);
  assert.equal(AuthorVisuals.applySpeakerIdentityOverrides(value,overrides),2);
  assert.equal(value.scenes.a.text[1].visualIdentity,'violet');
  assert.equal(value.scenes.b.text[0].visualIdentity,'violet');
  assert.equal(value.scenes.a.text[2].visualIdentity,undefined);
});

test('automatic removes authored identity without changing narration',()=>{
  const value=adventure();
  value.scenes.a.text[1].visualIdentity='teal';
  value.scenes.b.text[0].visualIdentity='teal';
  const overrides=new Map([['Mira',null]]);
  AuthorVisuals.applySpeakerIdentityOverrides(value,overrides);
  assert.equal(value.scenes.a.text[1].visualIdentity,undefined);
  assert.equal(value.scenes.b.text[0].visualIdentity,undefined);
  assert.equal(value.scenes.a.text[0],'Narration');
});

test('authored overrides are collected by speaker',()=>{
  const value=adventure();value.scenes.a.text[1].visualIdentity='rose';
  const map=AuthorVisuals.authoredOverrides(value);
  assert.equal(map.get('Mira'),'rose');
  assert.equal(map.has('Ardan'),false);
});
