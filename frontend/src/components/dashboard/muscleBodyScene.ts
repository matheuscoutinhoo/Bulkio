import {
   Color, DirectionalLight, Float32BufferAttribute, HemisphereLight, Mesh, MeshStandardMaterial,
   OrthographicCamera, Scene, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { UNTRAINED_COLOR, type MuscleEntry } from './muscleDistribution';
import { BodyTapTracker, pickMuscleRegion } from './musclePicking';

export type BodyView = 'front' | 'back';
export interface MuscleScene {
   update: (entries: MuscleEntry[], selected: string | null) => void;
   view: (view: BodyView) => void;
   rotate: (angle: number) => void;
   dispose: () => void;
}

export function createMuscleScene(
   host: HTMLDivElement,
   onSelect: (group: string | null) => void,
   onReady: () => void,
   onError: () => void,
): MuscleScene {
   const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
   renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
   renderer.setClearColor(0x000000, 0);
   const canvas = renderer.domElement;
   canvas.setAttribute('aria-hidden', 'true');
   canvas.style.touchAction = 'pan-y';
   host.appendChild(canvas);

   const scene = new Scene();
   const camera = new OrthographicCamera(-1, 1, 1.15, -1.15, 0.1, 30);
   camera.position.set(0, 0, 5);
   const controls = new OrbitControls(camera, canvas);
   controls.enablePan = false;
   controls.enableZoom = false; // Wheel and pinch remain available to the page.
   controls.minPolarAngle = Math.PI * 0.4;
   controls.maxPolarAngle = Math.PI * 0.6;
   controls.rotateSpeed = 0.65;
   // OrbitControls installs touch-action:none; vertical swipes should still scroll.
   canvas.style.touchAction = 'pan-y';

   scene.add(new HemisphereLight('#ffffff', '#9187ac', 2));
   for (const [x, y, z, intensity] of [[-3, 5, 5, 2.4], [4, 1, -4, 1.8], [0, 2, -5, 0.7]]) {
      const light = new DirectionalLight('#ffffff', intensity);
      light.position.set(x, y, z);
      scene.add(light);
   }

   let disposed = false;
   let frame = 0;
   const meshes: Mesh[] = [];
   const regionWeights = new Map<string, Float32Array>();
   let vertexColors: Float32BufferAttribute | null = null;
   let entries: MuscleEntry[] = [];
   let selected: string | null = null;
   const abort = new AbortController();
   const render = () => {
      if (disposed || frame) return;
      frame = requestAnimationFrame(() => {
         frame = 0;
         if (!disposed) renderer.render(scene, camera);
      });
   };
   const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const aspect = width / height;
      const halfHeight = Math.max(1.12, 0.72 / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      render();
   };
   const updateColors = () => {
      // Blend only boundary vertices shared by regions to avoid a jagged seam.
      // Interior vertices keep the exact same palette colour as their legend.
      if (vertexColors) {
         const colors = vertexColors.array;
         colors.fill(0);
         for (const [group, weights] of regionWeights) {
            const color = new Color(entries.find(item => item.group === group)?.color || UNTRAINED_COLOR);
            for (let i = 0; i < weights.length; i++) {
               colors[i * 3] += color.r * weights[i];
               colors[i * 3 + 1] += color.g * weights[i];
               colors[i * 3 + 2] += color.b * weights[i];
            }
         }
         vertexColors.needsUpdate = true;
      }
      for (const mesh of meshes) {
         const material = mesh.material as MeshStandardMaterial;
         material.color.set(selected && regionWeights.has(selected) && selected !== material.name ? '#9b98a6' : '#ffffff');
         material.emissive = new Color(selected === material.name ? '#7c3aed' : '#000000');
         material.emissiveIntensity = selected === material.name ? 0.35 : 0;
      }
      render();
   };

   const observer = new ResizeObserver(resize);
   observer.observe(host);
   controls.addEventListener('change', render);
   resize();

   const taps = new BodyTapTracker();
   const pointerDown = (event: PointerEvent) => taps.down(event);
   const pointerMove = (event: PointerEvent) => taps.move(event);
   const pointerCancel = (event: PointerEvent) => taps.cancel(event);
   const pointerUp = (event: PointerEvent) => {
      if (taps.up(event)) onSelect(pickMuscleRegion(meshes, camera, { x: event.clientX, y: event.clientY }, canvas.getBoundingClientRect()));
   };
   const contextLost = (event: Event) => { event.preventDefault(); onError(); };
   canvas.addEventListener('pointerdown', pointerDown);
   canvas.addEventListener('pointermove', pointerMove);
   canvas.addEventListener('pointerup', pointerUp);
   canvas.addEventListener('pointercancel', pointerCancel);
   canvas.addEventListener('lostpointercapture', pointerCancel);
   canvas.addEventListener('webglcontextlost', contextLost);

   void (async () => {
      try {
         const response = await fetch(`${import.meta.env.BASE_URL}models/muscle-body.glb`, { signal: abort.signal });
         if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
         const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '');
         if (disposed) {
            gltf.scene.traverse(object => {
               if (object instanceof Mesh) {
                  object.geometry.dispose();
                  const materials = Array.isArray(object.material) ? object.material : [object.material];
                  materials.forEach(material => material.dispose());
               }
            });
            return;
         }
         gltf.scene.traverse(object => { if (object instanceof Mesh) meshes.push(object); });
         const vertexCount = meshes[0].geometry.getAttribute('position').count;
         const totals = new Float32Array(vertexCount);
         vertexColors = new Float32BufferAttribute(new Float32Array(vertexCount * 3), 3);
         for (const mesh of meshes) {
            const material = mesh.material as MeshStandardMaterial;
            const weights = new Float32Array(vertexCount);
            const index = mesh.geometry.getIndex()!;
            for (let i = 0; i < index.count; i++) {
               const vertex = index.getX(i);
               weights[vertex]++;
               totals[vertex]++;
            }
            regionWeights.set(material.name, weights);
            material.vertexColors = true;
            mesh.geometry.setAttribute('color', vertexColors);
         }
         for (const weights of regionWeights.values()) {
            for (let i = 0; i < vertexCount; i++) weights[i] /= totals[i] || 1;
         }
         scene.add(gltf.scene);
         updateColors();
         onReady();
      } catch {
         if (!disposed) onError();
      }
   })();

   return {
      update(nextEntries, nextSelected) {
         entries = nextEntries;
         selected = nextSelected;
         updateColors();
      },
      view(view) {
         camera.position.set(0, 0, view === 'front' ? 5 : -5);
         controls.target.set(0, 0, 0);
         controls.update();
         render();
      },
      rotate(angle) { controls.rotateLeft(angle); controls.update(); },
      dispose() {
         disposed = true;
         abort.abort();
         cancelAnimationFrame(frame);
         observer.disconnect();
         controls.dispose();
         canvas.removeEventListener('pointerdown', pointerDown);
         canvas.removeEventListener('pointermove', pointerMove);
         canvas.removeEventListener('pointerup', pointerUp);
         canvas.removeEventListener('pointercancel', pointerCancel);
         canvas.removeEventListener('lostpointercapture', pointerCancel);
         canvas.removeEventListener('webglcontextlost', contextLost);
         // glTF primitives share their position/normal buffers.
         new Set(meshes.map(mesh => mesh.geometry)).forEach(geometry => geometry.dispose());
         new Set(meshes.map(mesh => mesh.material as MeshStandardMaterial)).forEach(material => material.dispose());
         renderer.dispose();
         renderer.forceContextLoss();
         canvas.remove();
      },
   };
}
