import * as THREE from "three";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import { useViewportStore } from "../../../state/viewportStore";
import { CSG } from "three-bvh-csg";

export const boolean: Tool = {
  getSteps(scene) {
    const state = {
      objectA: null as THREE.Mesh | null,
      objectB: null as THREE.Mesh | null,
      operation:
        "ADDITION" |
        "SUBTRACTION" |
        "REVERSE_SUBTRACTION" |
        "DIFFERENCE" |
        "INTERSECTION",
    };

    return [
      {
        events: [
          {
            type: "pointerdown",
            handler: (e: PointerEvent, next: () => void) => {
              const viewportId = useViewportStore.getState().activeViewport;
              const camera =
                useViewportStore.getState().arrayCamera?.cameras[viewportId];

              const worldPoint = getWorldPointFromMouse(
                e.clientX,
                e.clientY,
                camera,
                scene.getScene()
              );

              if (worldPoint) {
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(worldPoint, camera);

                const intersects = raycaster.intersectObjects(
                  scene.getScene().children
                );

                if (intersects.length > 0) {
                  state.objectA = intersects[0].object;
                }
              }

              next();
            },
          },
          {
            type: "pointerup",
            handler: (e: PointerEvent, next: () => void) => {
              const viewportId = useViewportStore.getState().activeViewport;
              const camera =
                useViewportStore.getState().arrayCamera?.cameras[viewportId];

              const worldPoint = getWorldPointFromMouse(
                e.clientX,
                e.clientY,
                camera,
                scene.getScene()
              );

              if (worldPoint) {
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(worldPoint, camera);

                const intersects = raycaster.intersectObjects(
                  scene.getScene().children
                );

                if (intersects.length > 0) {
                  state.objectB = intersects[0].object;
                }
              }

              next();
            },
          },
        ],
      },
    ];
  },

  onFinish() {
    console.log("Boolean applied");
  },

  onCancel() {
    console.log("Boolean canceled");
  },
};
