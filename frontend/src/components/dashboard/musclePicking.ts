import { Camera, Mesh, Raycaster, Vector2 } from 'three';
import { BODY_MUSCLE_GROUPS } from './muscleDistribution';

const groups = new Set<string>(BODY_MUSCLE_GROUPS);

export function pickMuscleRegion(meshes: Mesh[], camera: Camera, point: { x: number; y: number }, bounds: { left: number; top: number; width: number; height: number }): string | null {
   if (bounds.width <= 0 || bounds.height <= 0 || point.x < bounds.left || point.y < bounds.top || point.x > bounds.left + bounds.width || point.y > bounds.top + bounds.height) return null;
   camera.updateMatrixWorld(true);
   meshes.forEach(mesh => mesh.updateWorldMatrix(true, false));
   const raycaster = new Raycaster();
   raycaster.setFromCamera(new Vector2((point.x - bounds.left) / bounds.width * 2 - 1, 1 - (point.y - bounds.top) / bounds.height * 2), camera);
   // The nearest visible triangle is authoritative. Neutral surfaces must block muscles behind them.
   const hit = raycaster.intersectObjects(meshes, false)[0];
   if (!hit) return null;
   const material = (hit.object as Mesh).material;
   const name = (Array.isArray(material) ? material[hit.face?.materialIndex ?? 0] : material)?.name;
   return name && groups.has(name) ? name : null;
}

type TapPointer = Pick<PointerEvent, 'pointerId' | 'isPrimary' | 'button' | 'clientX' | 'clientY' | 'timeStamp'>;

export class BodyTapTracker {
   private pointers = new Set<number>();
   private start: TapPointer | null = null;

   down(event: TapPointer) {
      this.pointers.add(event.pointerId);
      this.start = this.pointers.size === 1 && event.isPrimary && event.button === 0 ? event : null;
   }

   move(event: TapPointer) {
      if (this.start?.pointerId === event.pointerId && Math.hypot(event.clientX - this.start.clientX, event.clientY - this.start.clientY) > 6) this.start = null;
   }

   up(event: TapPointer): boolean {
      const start = this.start;
      this.pointers.delete(event.pointerId);
      this.start = null;
      return !!start && this.pointers.size === 0 && event.pointerId === start.pointerId && event.button === 0
         && event.timeStamp - start.timeStamp <= 600
         && Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) <= 6;
   }

   cancel(event: Pick<TapPointer, 'pointerId'>) {
      this.pointers.delete(event.pointerId);
      this.start = null;
   }
}
