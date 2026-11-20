// node fbx2glb.js entrada.fbx saida.glb — converte um FBX estático (sem texturas) para GLB com os scripts r128 desta pasta.
const fs=require('fs');const load=require('./inspect.js'),THREE=load.THREE;
global.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(r=>{this.result=r;this.onloadend&&this.onloadend()})}readAsDataURL(b){b.arrayBuffer().then(r=>{this.result='data:;base64,'+Buffer.from(r).toString('base64');this.onloadend&&this.onloadend()})}};
const o=load(process.argv[2]);
const std=x=>new THREE.MeshStandardMaterial({name:x.name,color:x.color||0x333333});
// lista de materiais só se a geometria tiver grupos; senão o GLTFExporter descarta a malha
o.traverse(m=>{if(m.isMesh)m.material=Array.isArray(m.material)&&m.geometry.groups.length>1?m.material.map(std):std([].concat(m.material)[0])});
new THREE.GLTFExporter().parse(o,g=>{fs.writeFileSync(process.argv[3],Buffer.from(g));console.log('ok',process.argv[3],(g.byteLength/1e6).toFixed(2)+'MB')},{binary:true});
