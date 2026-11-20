// FBX da Mixamo (com skin) → GLB: corpo + esqueleto de um arquivo, animações de todos (renomeadas, sem deslocamento horizontal do quadril).
// node export.js <pasta das animações> <saída.glb> [corpo.fbx]  — sem o 3º argumento o corpo vem da animação idle;
// com ele (outro personagem Mixamo, mesmo esqueleto mixamorig), os materiais guardam o nome original para o jogo aplicar as texturas.
const fs=require('fs'),path=require('path');
const load=require('./inspect.js'),THREE=load.THREE;
global.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(r=>{this.result=r;this.onloadend&&this.onloadend()})}readAsDataURL(b){b.arrayBuffer().then(r=>{this.result='data:'+(b.type||'application/octet-stream')+';base64,'+Buffer.from(r).toString('base64');this.onloadend&&this.onloadend()})}};
const SRC=process.argv[2],OUT=process.argv[3],BODY=process.argv[4];
const ANIMS={idle:'Rifle Aiming Idle',run:'Rifle Run',fire:'Firing Rifle',hit:'Hit Reaction',back:'Run Backward',crouch:'Rifle Crouch Walk',stop:'Rifle Run To Stop'};
const base=load(BODY||path.join(SRC,ANIMS.idle+'.fbx'));
const clips=[];
for(const k in ANIMS){
  const c=load(path.join(SRC,ANIMS[k]+'.fbx')).animations[0];
  c.name=k;
  for(const t of c.tracks)if(/Hips\.position$/.test(t.name)){const v=t.values,x0=v[0],z0=v[2];for(let i=0;i<v.length;i+=3){v[i]=x0;v[i+2]=z0}} // no lugar
  clips.push(c);
}
const has=new Set();base.traverse(o=>{if(o.isBone)has.add(o.name)});   // personagem sem alguns ossos (ex.: anelar/mindinho): o exportador descartaria o clipe inteiro
clips.forEach(c=>{c.tracks=c.tracks.filter(t=>has.has(t.name.split('.')[0]))});
base.traverse(o=>{if(o.isMesh)o.material=new THREE.MeshStandardMaterial({name:BODY?[].concat(o.material)[0].name:o.name})});   // sem texturas no GLB
new THREE.GLTFExporter().parse(base,glb=>{
  fs.writeFileSync(OUT,Buffer.from(glb));
  console.log('ok',OUT,(fs.statSync(OUT).size/1e6).toFixed(2)+'MB',clips.map(c=>c.name+' '+c.duration.toFixed(2)));
},{binary:true,animations:clips,onlyVisible:false});
