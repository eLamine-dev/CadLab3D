import * as THREE from "three";
import { useViewportStore } from "../../state/viewportStore";
import sceneInstance from "../Scene";

let selectableCache: THREE.Object3D[] = [];
let cacheValid = false;

export function invalidateSelectionCache() {
  cacheValid = false;
}

export function getIntersectedObject(event: MouseEvent): THREE.Object3D | null {
  const scene = sceneInstance.getScene();
  const canvas = sceneInstance.getCanvas();
  const bounds = canvas.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

  const mouse = new THREE.Vector2(x, y);
  const raycaster = new THREE.Raycaster();

  const camera =
    useViewportStore.getState().arrayCamera?.cameras[
      useViewportStore.getState().activeViewport
    ];

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
      (obj instanceof THREE.Mesh ||
        obj instanceof THREE.Line ||
        obj instanceof THREE.Sprite) &&
      obj.visible &&
      !obj.userData.nonSelectable &&
      obj.type !== "TransformControlsPlane"
    ) {
      return obj;
    }
  }

  return null;
}
