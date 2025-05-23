import * as THREE from "three";
import { useViewportStore } from "../../../state/viewportStore";

export function getDrawingPlaneFromViewport(viewportId: number): THREE.Plane {
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
    normal = cameraUp.clone();
  }

  return new THREE.Plane(normal, -origin.dot(normal));
}

export function getWorldPointFromMouse(
  event: MouseEvent,
  viewportId: number,
  plane: THREE.Plane
): THREE.Vector3 {
  const arrayCamera = useViewportStore.getState().arrayCamera;

  const camera = arrayCamera.cameras[viewportId];

  const mouse = new THREE.Vector2();
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  mouse.set(x, y);

  camera.updateMatrixWorld();

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // const plane = getDrawingPlaneFromViewport(viewportId);
  // const threePlane = new THREE.Plane(
  //   plane.normal,
  //   -plane.origin.dot(plane.normal)
  // );

  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersection);

  return intersection;
}
