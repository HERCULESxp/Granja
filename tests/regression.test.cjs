const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1].split('if (IS_DEV) {\n  document.title')[0];
function app(raw=null,pathname='/Granja/dev/') {
  const stored=new Map(raw===null?[]:[['granja_caixa_dev_v1',raw]]), elements={};
  let fail=false;
  const ctx=vm.createContext({URL,Date,console,location:{href:'http://localhost'+pathname},alert(){},confirm:()=>true,setTimeout(){},localStorage:{getItem:k=>stored.get(k)??null,setItem(k,v){if(fail)throw Error('quota');stored.set(k,v)}},document:{addEventListener(){},getElementById(id){return elements[id]??={value:'',checked:false,required:true,disabled:false,style:{},parentElement:{style:{}},classList:{contains:()=>false}}}}});
  vm.runInContext(script,ctx);
  const run=s=>vm.runInContext(s,ctx);
  run('renderDashboard=()=>stock();renderExpenses=()=>{};renderProduction=()=>{};renderSales=()=>{};renderReports=()=>{};toast=()=>{}');
  return {run,stored,elements,setFail:()=>fail=true};
}
test('limpar inclui consumo e permite continuar usando estoque',()=>{const a=app();a.run('clearData()');assert.equal(a.run('stock()'),0);assert.deepEqual(JSON.parse(a.stored.get('granja_caixa_dev_v1')),{expenses:[],production:[],sales:[],consumption:[]});});
test('produção utilizada não pode ser excluída',()=>{const a=app();a.run("data.production=[{id:1,qty:10}];data.sales=[{id:2,qty:8}];removeItem('production',1)");assert.equal(a.run('stock()'),2);assert.equal(a.run('data.production.length'),1);});
test('trocar consumo para animais restaura valor e observação',()=>{const a=app();a.run("vType=document.getElementById('vType');vType.value='ovos';document.getElementById('vConsumptionCheck').checked=true;toggleConsumption();vType.value='animais';updateSaleType()");assert.equal(a.elements.vValue.parentElement.style.display,'');assert.equal(a.elements.vValue.required,true);assert.equal(a.elements.vObs.disabled,false);});
test('backup antigo recebe consumo vazio e rejeita valores ou estrutura inválidos',()=>{const a=app();assert.equal(a.run('validateData({expenses:[],production:[],sales:[]}).consumption.length'),0);for(const record of ['{expenses:{},production:[],sales:[]}', '{expenses:[],production:[{id:1,date:"2026-02-30",qty:1}],sales:[]}', '{expenses:[],production:[],sales:[{id:1,date:"2026-10-21",qty:-1,value:1}]}'])assert.throws(()=>a.run(`validateData(${record})`));});
test('falha ao gravar desfaz mutação em memória',()=>{const a=app();a.setFail();assert.equal(a.run("data.expenses.push({id:1,date:'2026-10-21',cat:'Ração',qty:1,value:20});save()"),false);assert.equal(a.run('data.expenses.length'),0);assert.equal(a.stored.size,0);});
test('dados corrompidos são preservados e impedem sobrescrita',()=>{const a=app('{inválido');assert.equal(a.run('save()'),false);assert.equal(a.stored.get('granja_caixa_dev_v1'),'{inválido');});
test('produção e preview escolhem chaves diferentes',()=>{assert.equal(app().run('KEY'),'granja_caixa_dev_v1');assert.equal(app(null,'/Granja/').run('KEY'),'granja_caixa_v1');});
