import * as THREE from "three";
import { useViewportStore } from "../state/viewportStore";

export function getDrawingPlaneFromViewport(viewportId: number) {
  const viewports = useViewportStore.getState().viewports;
  const settings = viewports[viewportId].settings;
  const camera = settings.cameraSettings;

  const camPosition = camera.position.clone().normalize();
  const up = new THREE.Vector3(...camera.up);

  let normal: THREE.Vector3;
  if (settings.cameraType === "PerspectiveCamera" || settings.isCustom) {
    normal = new THREE.Vector3(0, 1, 0);
  } else {
    normal = camPosition.negate();
  }

  return { normal, up };
}

function getPointOnPlane(
  normal: THREE.Vector3,
  origin: THREE.Vector3,
  mouse: THREE.Vector2,
  camera: THREE.Camera
) {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const plane = new THREE.Plane(normal, -origin.dot(normal));
  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersection);
  return intersection;
}
