import * as THREE from "three";

let selectableCache: THREE.Object3D[] = [];
let cacheValid = false;

export function invalidateSelectionCache() {
  cacheValid = false;
}

export function getIntersectedObject(
  event: MouseEvent,
  scene: THREE.Scene,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement
): THREE.Object3D | null {
  const bounds = canvas.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

  const mouse = new THREE.Vector2(x, y);
  const raycaster = new THREE.Raycaster();

  raycaster.setFromCamera(mouse, camera);
  raycaster.params.Line.threshold = 0.2;

  if (!cacheValid) {
    selectableCache = [];
    scene.traverse((obj) => {
      if (
        !obj.userData.nonSelectable &&
        obj.type !== "TransformControlsPlane"
      ) {
        selectableCache.push(obj);
      }
    });
    cacheValid = true;
  }

  const intersects = raycaster.intersectObjects(selectableCache, true);
  for (const hit of intersects) {
    const obj = hit.object;
    if (
      (obj instanceof THREE.Mesh || obj instanceof THREE.Line) &&
      obj.visible &&
      !obj.userData.nonSelectable &&
      obj.type !== "TransformControlsPlane"
    ) {
      return obj;
    }
  }

  return null;
}
