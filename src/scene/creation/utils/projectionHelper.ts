import * as THREE from "three";
import { useViewportStore } from "../../../state/viewportStore";

export function getDrawingPlaneFromViewport(viewportId: number): {
  normal: THREE.Vector3;
  up: THREE.Vector3;
  origin: THREE.Vector3;
} {
  const viewport = useViewportStore.getState().viewports[viewportId];
  const settings = viewport.settings;
  const camera = settings.cameraSettings;

  const cameraUp = new THREE.Vector3(...camera.up);
  const is3DView =
    settings.cameraType === "PerspectiveCamera" || viewport.isCustom;

  let normal: THREE.Vector3;
  const origin = new THREE.Vector3(0, 0, 0);

  if (is3DView) {
    normal = cameraUp.clone();
  } else {
    normal = new THREE.Vector3().copy(camera.position).normalize().negate();
  }

  return {
    normal,
    up: cameraUp,
    origin,
  };
}

export function getWorldPointFromMouse(
  event: MouseEvent,
  viewportId: number
): THREE.Vector3 {
  const arrayCamera = useViewportStore.getState().arrayCamera;

  console.log(arrayCamera);

  const camera = arrayCamera.cameras[viewportId];

  const mouse = new THREE.Vector2();
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const plane = getDrawingPlaneFromViewport(viewportId);
  const threePlane = new THREE.Plane(
    plane.normal,
    -plane.origin.dot(plane.normal)
  );

  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(threePlane, intersection);

  return intersection;
}
