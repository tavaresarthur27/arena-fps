const fs=require('fs'),vm=require('vm');const load=require('./inspect.js'),THREE=load.THREE;
vm.runInThisContext(fs.readFileSync(__dirname+'/GLTFLoader.js','utf8'));
const b=fs.readFileSync(process.argv[2]);
new THREE.GLTFLoader().parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'',g=>{
  const bones=[],m=[];g.scene.traverse(o=>{if(o.isBone)bones.push(o.name);if(o.isSkinnedMesh)m.push(o.name)});
  const box=new THREE.Box3().setFromObject(g.scene);
  console.log('malhas',m.join(','),'| ossos',bones.length,'| tamanho',box.getSize(new THREE.Vector3()).toArray().map(v=>v.toFixed(2)).join(' '),'| clips',g.animations.map(c=>c.name).join(','));
  console.log(bones.join(' '));
},e=>console.log('erro',e));
