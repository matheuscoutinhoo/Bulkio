// Rebuild the checked-in GLB from pinned CC0 graphical assets (no MakeHuman code).
// Run from the repository root: node scripts/build-muscle-model.mjs [asset-cache]
import fs from 'node:fs/promises';
import path from 'node:path';
import { BufferGeometry, Float32BufferAttribute } from '../frontend/node_modules/three/build/three.module.js';

const revision = 'a8bc2d54ff0ac92e78ff71431b1023eda42bf482';
const cache = process.argv[2] || '.tmp/muscle-model';
const output = 'frontend/public/models';
await fs.mkdir(cache, { recursive: true });
await fs.mkdir(output, { recursive: true });

async function asset(relativePath) {
   const filename = path.join(cache, path.basename(relativePath));
   try { return await fs.readFile(filename, 'utf8'); } catch { /* Download on first build. */ }
   const response = await fetch(`https://raw.githubusercontent.com/makehumancommunity/makehuman/${revision}/${relativePath}`);
   if (!response.ok) throw new Error(`Asset download failed: ${relativePath} (${response.status})`);
   const text = await response.text();
   await fs.writeFile(filename, text);
   return text;
}

const vertices = [];
const faces = [];
let isBody = false;
for (const line of (await asset('makehuman/data/3dobjs/base.obj')).split('\n')) {
   const [kind, ...values] = line.trim().split(/\s+/);
   if (kind === 'v') vertices.push(values.map(Number));
   if (kind === 'g') isBody = values[0] === 'body';
   if (kind === 'f' && isBody) faces.push(values.map(v => Number(v.split('/')[0]) - 1));
}
for (const target of ['caucasian-male-young', 'universal-male-young-maxmuscle-averageweight']) {
   const text = await asset(`makehuman/data/targets/macrodetails/${target}.target`);
   for (const line of text.split('\n')) {
      const [index, ...delta] = line.trim().split(/\s+/).map(Number);
      if (delta.length === 3 && vertices[index]) {
         delta.forEach((value, axis) => { vertices[index][axis] += value; });
      }
   }
}

// Anatomical regions in the source's fixed A-pose. These are schematic surface
// regions, not inferred recruitment of secondary muscles from workout data.
function muscleRegion([signedX, y, z]) {
   const x = Math.abs(signedX);
   if (y > 6.65) return 'NEUTRAL';
   if (y > 0.5 && x > 2.05 + Math.max(0, 4.8 - y) * 0.12) {
      if (x > 4.65 || (x > 4.35 && y < 2.45)) return 'NEUTRAL'; // Hands.
      const alongArm = (x - 1.88) * 0.66 + (5.82 - y) * 0.75;
      if (alongArm < 1.35) return 'SHOULDERS';
      if (alongArm > 2.7) return 'FOREARMS';
      return z > 0.22 ? 'BICEPS' : 'TRICEPS';
   }
   if (y > 4.35 + x * 0.6 && z < 0.25) return 'TRAPS';
   if (y > 5.85) return 'NEUTRAL';
   if (y > 3.85 + 0.08 * x && z > 0.3) return 'CHEST';
   if (y > 1.1) return z > 0.25 ? 'ABS' : 'BACK';
   if (y > -1.0 && z < -0.12) return 'GLUTES';
   if (y > -0.35 && x < 0.35) return 'NEUTRAL';
   if (y > -3.45) return 'LEGS';
   if (y > -7.25) return z < 0.25 ? 'CALVES' : 'NEUTRAL';
   return 'NEUTRAL';
}

const used = [...new Set(faces.flat())];
const remap = new Map(used.map((index, i) => [index, i]));
const positions = used.flatMap(index => vertices[index].map((v, axis) => (v - (axis === 1 ? 0.55965 : 0)) / 8.74065));
const groups = new Map();
const triangles = [];
for (const face of faces) {
   const center = [0, 1, 2].map(axis => face.reduce((sum, index) => sum + vertices[index][axis], 0) / face.length);
   const group = muscleRegion(center);
   if (!groups.has(group)) groups.set(group, []);
   for (let i = 1; i < face.length - 1; i++) {
      const triangle = [face[0], face[i], face[i + 1]].map(index => remap.get(index));
      groups.get(group).push(...triangle);
      triangles.push(...triangle);
   }
}
const geometry = new BufferGeometry();
geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
geometry.setIndex(triangles);
geometry.computeVertexNormals();
geometry.computeBoundingBox();

// A compact, standard glTF binary with one material per selectable muscle group.
const buffers = [];
const bufferViews = [];
const accessors = [];
let byteOffset = 0;
function addAccessor(array, type, componentType, bounds = {}) {
   const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
   bufferViews.push({ buffer: 0, byteOffset, byteLength: bytes.length });
   buffers.push(bytes);
   const padding = (4 - bytes.length % 4) % 4;
   if (padding) buffers.push(Buffer.alloc(padding));
   byteOffset += bytes.length + padding;
   accessors.push({ bufferView: bufferViews.length - 1, componentType, count: array.length / (type === 'VEC3' ? 3 : 1), type, ...bounds });
   return accessors.length - 1;
}
const position = addAccessor(geometry.attributes.position.array, 'VEC3', 5126, {
   min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray(),
});
const normal = addAccessor(geometry.attributes.normal.array, 'VEC3', 5126);
const materials = [];
const primitives = [];
for (const [name, indices] of groups) {
   materials.push({ name, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.75 } });
   primitives.push({ attributes: { POSITION: position, NORMAL: normal }, indices: addAccessor(new Uint16Array(indices), 'SCALAR', 5123), material: materials.length - 1 });
}
const gltf = {
   asset: { version: '2.0', generator: 'Bulkio muscle model builder', copyright: 'MakeHuman Community graphical assets — CC0 1.0' },
   scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: 'MuscleBody' }],
   meshes: [{ primitives }], materials, accessors, bufferViews, buffers: [{ byteLength: byteOffset }],
};
const json = Buffer.from(JSON.stringify(gltf));
const jsonChunk = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)]);
const binary = Buffer.concat(buffers);
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binary.length, 8);
function chunkHeader(length, type) {
   const bytes = Buffer.alloc(8); bytes.writeUInt32LE(length); bytes.writeUInt32LE(type, 4); return bytes;
}
await fs.writeFile(`${output}/muscle-body.glb`, Buffer.concat([header, chunkHeader(jsonChunk.length, 0x4e4f534a), jsonChunk, chunkHeader(binary.length, 0x004e4942), binary]));
await fs.writeFile(`${output}/LICENSE-CC0.txt`, await asset('LICENSE.ASSETS.md'));
geometry.dispose();
console.log(`Generated ${output}/muscle-body.glb (${Math.round((binary.length + jsonChunk.length) / 1024)} KiB, ${triangles.length / 3} triangles)`);
