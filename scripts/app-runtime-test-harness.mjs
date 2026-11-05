// Execute the real app functions and lazily initialized state without browser boot effects.
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const acorn=require(require.resolve('acorn',{paths:[require.resolve('terser')]}));
const source=await readFile(new URL('../app.js', import.meta.url),'utf8');
export function createAppRuntimeTestContext() {
const tree=acorn.parse(source,{ecmaVersion:'latest',sourceType:'script'});
const ctx={console,URL,URLSearchParams,setTimeout,clearTimeout,performance,Map,Set,
 document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{},classList:{contains:()=>false}}},
 window:{location:{origin:'http://localhost',hostname:'localhost',search:''},matchMedia:()=>({matches:false})},
 localStorage:{getItem:()=>null,setItem(){}}, navigator:{language:'pt-BR'}};
vm.createContext(ctx);
for(const node of tree.body){
 if(node.type==='FunctionDeclaration')vm.runInContext(source.slice(node.start,node.end),ctx);
 if(node.type!=='VariableDeclaration')continue;
 for(const declaration of node.declarations){
  if(declaration.id.type!=='Identifier'||Object.hasOwn(ctx,declaration.id.name))continue;
  const name=declaration.id.name;
  Object.defineProperty(ctx,name,{configurable:true,get(){const value=declaration.init?vm.runInContext('('+source.slice(declaration.init.start,declaration.init.end)+')',ctx):undefined;Object.defineProperty(ctx,name,{value,writable:true,configurable:true});return value;},set(value){Object.defineProperty(ctx,name,{value,writable:true,configurable:true});}});
 }
}

return ctx;
}
