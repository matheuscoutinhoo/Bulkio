/// <reference types="node" />
import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { BodyTapTracker, pickMuscleRegion } from './musclePicking';
import { getMuscleFocus } from './muscleFocus';
import { BODY_MUSCLE_GROUPS } from './muscleDistribution';

const bounds = { left: 40, top: 80, width: 400, height: 460 };
function camera(back = false) {
   const result = new OrthographicCamera(-1, 1, 1.15, -1.15, 0.1, 30);
   result.position.set(0, 0, back ? -5 : 5);
   result.lookAt(0, 0, 0);
   result.updateMatrixWorld(true);
   return result;
}
function screenPoint(x: number, y: number, view: OrthographicCamera) {
   const point = new Vector3(x, y, 0).project(view);
   return { x: bounds.left + (point.x + 1) / 2 * bounds.width, y: bounds.top + (1 - point.y) / 2 * bounds.height };
}

describe('visible muscle picking', () => {
   it('lets neutral surfaces occlude muscles, without selecting a muscle through the body', () => {
      const chest = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ name: 'CHEST' }));
      const neutral = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ name: 'NEUTRAL' }));
      neutral.position.z = 0.2;
      const view = camera();
      expect(pickMuscleRegion([chest, neutral], view, screenPoint(0, 0, view), bounds)).toBeNull();
      neutral.position.x = 2; // Matrix updates must be applied before picking, even before the next render.
      expect(pickMuscleRegion([chest, neutral], view, screenPoint(0, 0, view), bounds)).toBe('CHEST');
      chest.geometry.dispose(); neutral.geometry.dispose(); chest.material.dispose(); neutral.material.dispose();
   });

   it('does not turn a miss or an outside tap into a nearby muscle selection', () => {
      const mesh = new Mesh(new PlaneGeometry(0.1, 0.1), new MeshBasicMaterial({ name: 'BICEPS' }));
      const view = camera();
      expect(pickMuscleRegion([mesh], view, screenPoint(0.2, 0, view), bounds)).toBeNull();
      expect(pickMuscleRegion([mesh], view, { x: bounds.left - 1, y: 100 }, bounds)).toBeNull();
      mesh.geometry.dispose(); mesh.material.dispose();
   });

   describe('checked-in body mesh', () => {
      let meshes: Mesh[];
      beforeAll(async () => {
         const bytes = readFileSync(new URL('../../../public/models/muscle-body.glb', import.meta.url));
         const model = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
         meshes = [];
         model.scene.traverse(object => { if (object instanceof Mesh) meshes.push(object); });
      });

      it.each(BODY_MUSCLE_GROUPS)('keeps the entire selected %s region inside the focused view on narrow screens', group => {
         const focus = getMuscleFocus(group)!;
         const view = new OrthographicCamera(-0.72, 0.72, 1.15, -1.15, 0.1, 30);
         view.position.set(Math.sin(focus.azimuth) * 5, focus.targetY, Math.cos(focus.azimuth) * 5);
         view.lookAt(0, focus.targetY, 0);
         view.zoom = focus.zoom;
         view.updateProjectionMatrix();
         view.updateMatrixWorld(true);
         const mesh = meshes.find(item => (item.material as MeshBasicMaterial).name === group)!;
         const position = mesh.geometry.getAttribute('position');
         const index = mesh.geometry.getIndex()!;
         for (let i = 0; i < index.count; i++) {
            const point = new Vector3().fromBufferAttribute(position, index.getX(i)).applyMatrix4(mesh.matrixWorld).project(view);
            expect(Math.abs(point.x)).toBeLessThanOrEqual(1);
            expect(Math.abs(point.y)).toBeLessThanOrEqual(1);
         }
      });

      it.each([
         ['CHEST', 0.1, 0.48, false], ['ABS', 0.06, 0.25, false],
         ['BACK', 0.1, 0.27, true], ['TRAPS', 0.1, 0.55, true],
         ['SHOULDERS', 0.27, 0.55, false], ['BICEPS', 0.35, 0.45, false],
         ['TRICEPS', 0.35, 0.45, true], ['FOREARMS', 0.45, 0.35, false],
         ['GLUTES', 0.1, -0.07, true], ['LEGS', 0.12, -0.32, false],
         ['CALVES', 0.2, -0.7, true], [null, 0, 0.84, false],
         [null, 0.15, -0.6, false], [null, 0.6, 0.15, false],
      ] as const)('selects %s at an anatomical reference point', (group, x, y, back) => {
         const view = camera(back);
         expect(pickMuscleRegion(meshes, view, screenPoint(x, y, view), bounds)).toBe(group);
      });
   });
});

describe('body taps', () => {
   const pointer = (values = {}) => ({ pointerId: 1, isPrimary: true, button: 0, clientX: 100, clientY: 100, timeStamp: 100, ...values });
   it('accepts a single short tap', () => {
      const tracker = new BodyTapTracker(); tracker.down(pointer());
      expect(tracker.up(pointer({ timeStamp: 200 }))).toBe(true);
   });
   it('rejects a rotation even when the pointer returns to its original position', () => {
      const tracker = new BodyTapTracker(); tracker.down(pointer());
      tracker.move(pointer({ clientX: 120 }));
      expect(tracker.up(pointer({ timeStamp: 300 }))).toBe(false);
   });
   it('rejects multi-touch, cancelled scrolling, long presses and right clicks', () => {
      const tracker = new BodyTapTracker(); tracker.down(pointer());
      tracker.down(pointer({ pointerId: 2, isPrimary: false }));
      expect(tracker.up(pointer({ pointerId: 2 }))).toBe(false);
      expect(tracker.up(pointer())).toBe(false);
      tracker.down(pointer()); tracker.cancel(pointer()); expect(tracker.up(pointer())).toBe(false);
      tracker.down(pointer()); expect(tracker.up(pointer({ timeStamp: 800 }))).toBe(false);
      tracker.down(pointer({ button: 2 })); expect(tracker.up(pointer({ button: 2 }))).toBe(false);
   });
});
