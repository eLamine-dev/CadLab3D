import * as THREE from "three";
import { useViewportStore } from "../../../state/viewportStore";

// export function getDrawingPlaneFromViewport(viewportId: number): THREE.Plane {
//   const store = useViewportStore.getState();
//   const viewport = store.viewports[viewportId];
//   const settings = viewport.settings;
//   const camSettings = settings.cameraSettings;

//   const is3DView =
//     settings.cameraType === "PerspectiveCamera" || viewport.isCustom;

//   const position = camSettings.position;
//   const target = camSettings.target ?? new THREE.Vector3(0, 0, 0);

//   if (is3DView) {
//     // Ground plane
//     return new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
//   } else {
//     // For 2D orthographic views: use view direction as the normal
//     const viewDir = new THREE.Vector3()
//       .subVectors(target, position)
//       .normalize();

//     // Flip to ensure the normal faces toward camera
//     const normal = viewDir.clone().negate();

//     // Plane through target (usually origin)
//     const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
//       normal,
//       target
//     );
//     return plane;
//   }
// }

export function getWorldPointFromMouse(
  event: MouseEvent,
  viewportId: number
): THREE.Vector3 {
  const { arrayCamera, viewports } = useViewportStore.getState();
  const camera = arrayCamera?.cameras[viewportId];
  const drawingPlane =
    viewports[viewportId].settings.cameraSettings.drawingPlane;

  if (!camera || !drawingPlane) {
    throw new Error(
      "Camera or drawing plane not found for the given viewport."
    );
  }

  const canvas = event.target as HTMLElement;
  const rect = canvas.getBoundingClientRect();

  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersection = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(drawingPlane.clone(), intersection);

  if (!hit) {
    throw new Error("Ray did not intersect the drawing plane.");
  }

  return intersection;
}
