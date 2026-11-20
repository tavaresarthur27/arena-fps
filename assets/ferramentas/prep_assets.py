"""Gera assets/soldado.gltf+.bin (malha sem texturas) e assets/animacoes.glb (só as animações usadas)."""
import zipfile, json, struct, sys, os

S, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

# ---- personagem ----
zc = zipfile.ZipFile(os.path.join(S, 'dl_ubc/ubc.zip'))
base = 'Universal Base Characters[Standard]/Base Characters/Godot - UE/'
c = json.loads(zc.read(base + 'Superhero_Male_FullBody.gltf'))
for k in ('images', 'textures', 'samplers'):
    c.pop(k, None)
for m in c['materials']:
    pbr = m.get('pbrMetallicRoughness', {})
    for t in ('baseColorTexture', 'metallicRoughnessTexture'):
        pbr.pop(t, None)
    for t in ('normalTexture', 'occlusionTexture', 'emissiveTexture'):
        m.pop(t, None)
c['buffers'][0]['uri'] = 'soldado.bin'
open(os.path.join(OUT, 'soldado.gltf'), 'w', encoding='utf-8').write(json.dumps(c, separators=(',', ':')))
open(os.path.join(OUT, 'soldado.bin'), 'wb').write(zc.read(base + 'Superhero_Male_FullBody.bin'))

# ---- animações ----
u = zipfile.ZipFile(os.path.join(S, 'dl_ual/ual.zip')).read('Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb')
jl = struct.unpack('<I', u[12:16])[0]
j = json.loads(u[20:20 + jl])
bo = 20 + jl
bl = struct.unpack('<I', u[bo:bo + 4])[0]
binc = u[bo + 8:bo + 8 + bl]
KEEP = ['Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Pistol_Aim_Neutral', 'Pistol_Shoot', 'Hit_Chest']
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
CS = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
amap, accs, bvs, data = {}, [], [], bytearray()
def acc(i):
    if i in amap:
        return amap[i]
    a = dict(j['accessors'][i]); bv = j['bufferViews'][a['bufferView']]
    assert 'byteStride' not in bv or bv['byteStride'] == CS[a['componentType']] * NC[a['type']]
    n = a['count'] * CS[a['componentType']] * NC[a['type']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    while len(data) % 4: data.append(0)
    bvs.append({'buffer': 0, 'byteOffset': len(data), 'byteLength': n})
    data.extend(binc[off:off + n])
    a['bufferView'] = len(bvs) - 1; a.pop('byteOffset', None)
    accs.append(a); amap[i] = len(accs) - 1
    return amap[i]
anims = []
for a in j['animations']:
    if a['name'] not in KEEP:
        continue
    a = json.loads(json.dumps(a))
    for s in a['samplers']:
        s['input'] = acc(s['input']); s['output'] = acc(s['output'])
    anims.append(a)
nodes = [{k: v for k, v in n.items() if k not in ('mesh', 'skin')} for n in j['nodes']]
while len(data) % 4: data.append(0)
nj = {'asset': j['asset'], 'scene': j.get('scene', 0), 'scenes': j['scenes'], 'nodes': nodes,
      'animations': anims, 'accessors': accs, 'bufferViews': bvs, 'buffers': [{'byteLength': len(data)}]}
js = json.dumps(nj, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(data)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(data), 0x004E4942) + bytes(data)
open(os.path.join(OUT, 'animacoes.glb'), 'wb').write(glb)
open(os.path.join(OUT, 'LICENCA.txt'), 'w', encoding='utf-8').write(
    'Modelo e animações: Quaternius (https://quaternius.com)\n'
    '- Universal Base Characters (Superhero_Male_FullBody), sem texturas\n'
    '- Universal Animation Library (UAL1_Standard): ' + ', '.join(KEEP) + '\n'
    'Licença: CC0 1.0 Universal (domínio público) - https://creativecommons.org/publicdomain/zero/1.0/\n')
print('animações', [a['name'] for a in anims])
for f in os.listdir(OUT):
    print(f, os.path.getsize(os.path.join(OUT, f)))
