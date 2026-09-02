const test=require('node:test');
const assert=require('node:assert/strict');
const AuthorVisuals=require('../speaker-visuals.js');

function adventure(){return{kind:'adventure',scenes:{a:{type:'scene',text:[
  'Narration',
  {speaker:'Mira',text:'One'},
  {speaker:'Ardan',text:'Two'}
]},b:{type:'scene',text:[{speaker:'Mira',text:'Three'}]}}}}

function openableAdventure(id='accepted'){
  return{
    schemaVersion:2,
    kind:'adventure',
    id,
    title:'Test',
    startScene:'a',
    initialState:{flags:{},counters:{}},
    clocks:{},
    party:[],
    enemies:[],
    scenes:{a:{type:'scene',text:[{speaker:'Mira',text:'One'}],choices:[]}}
  };
}

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

test('rejected parsed adventures do not replace the active authoring adventure',()=>{
  const model={
    createAdventureDraft:()=>openableAdventure('new'),
    openableShapeIssues:value=>value.id==='bad-shape'?['bad shape']:[]
  };
  const json={parse:JSON.parse};
  const document={querySelector(){return null},querySelectorAll(){return[]},addEventListener(){}};
  const root={document,AdventureAuthorModel:model,JSON:json};
  const runtime=AuthorVisuals.installAuthoring(root);
  const accepted=json.parse(JSON.stringify(openableAdventure('accepted')));
  assert.equal(runtime.getAdventure(),accepted);

  json.parse(JSON.stringify({...openableAdventure('unknown-field'),unexpected:true}));
  assert.equal(runtime.getAdventure(),accepted);

  json.parse(JSON.stringify({...openableAdventure('wrong-schema'),schemaVersion:99}));
  assert.equal(runtime.getAdventure(),accepted);

  json.parse(JSON.stringify(openableAdventure('bad-shape')));
  assert.equal(runtime.getAdventure(),accepted);
});
