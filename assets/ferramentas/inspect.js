// Carrega os scripts do three r128 (os mesmos da CDN do jogo) no Node e inspeciona os FBX.
const fs=require('fs'),path=require('path'),vm=require('vm');
const D=__dirname;
global.window=global;global.self=global;
global.document={createElementNS:()=>({style:{},getContext:()=>null,addEventListener(){}}),createElement:()=>({style:{},getContext:()=>null})};
for(const f of ['three.min.js','fflate.min.js','NURBSUtils.js','NURBSCurve.js','FBXLoader.js','GLTFExporter.js'])vm.runInThisContext(fs.readFileSync(path.join(D,f),'utf8'),{filename:f});
const THREE=global.THREE;
module.exports=function load(file){
  const buf=fs.readFileSync(file);
  const ab=buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.length);
  const mgr=new THREE.LoadingManager();mgr.setURLModifier(()=>'data:,');
  return new THREE.FBXLoader(mgr).parse(ab,path.dirname(file)+'/');
};
module.exports.THREE=THREE;
if(require.main===module){
  const o=module.exports(process.argv[2]);
  const meshes=[],bones=[];o.traverse(x=>{if(x.isSkinnedMesh||x.isMesh)meshes.push({n:x.name,v:x.geometry.attributes.position.count,mat:[].concat(x.material).map(m=>m.name+(m.map?'[map:'+(m.map.name||'?')+']':''))});if(x.isBone)bones.push(x.name)});
  const b=new THREE.Box3().setFromObject(o);
  console.log(JSON.stringify({escala:o.scale.toArray(),tamanho:b.getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(1)),meshes,ossos:bones.length,primeiros:bones.slice(0,8),clips:o.animations.map(c=>c.name+' '+c.duration.toFixed(2)+'s '+c.tracks.length+'tr')},null,1));
}
