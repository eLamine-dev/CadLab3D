// projectionHelper.ts
import * as THREE from "three";
import { useViewportStore } from "../../../state/viewportStore";

export function getDrawingPlaneFromViewport(viewportId: number): {
  normal: THREE.Vector3;
  up: THREE.Vector3;
  origin: THREE.Vector3;
} {
  const viewports = useViewportStore.getState().viewports;
  const settings = viewports[viewportId].settings;
  const camera = settings.cameraSettings;

  let normal: THREE.Vector3;
  let origin = new THREE.Vector3(0, 0, 0);

  if (settings.cameraType === "PerspectiveCamera") {
    // For perspective view, use ground plane by default
    normal = new THREE.Vector3(0, 1, 0);
  } else {
    // For orthographic views, use plane perpendicular to view direction
    normal = new THREE.Vector3().copy(camera.position).normalize().negate();

    // Adjust origin based on view type for better snapping
    switch (settings.id) {
      case "Top":
      case "Bottom":
        origin.y = 0;
        break;
      case "Front":
      case "Back":
        origin.z = 0;
        break;
      case "Left":
      case "Right":
        origin.x = 0;
        break;
    }
  }

  return {
    normal,
    up: new THREE.Vector3(...camera.up),
    origin,
  };
}

export function getWorldPointFromMouse(
  event: MouseEvent,
  viewportId: number
): THREE.Vector3 {
  const viewports = useViewportStore.getState().viewports;
  const settings = viewports[viewportId].settings;
  const { camera } = settings.cameraSettings;

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
