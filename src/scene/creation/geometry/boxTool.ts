// boxTool.ts
import { CreationTool } from "../creationTypes";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import * as THREE from "three";
import sceneInstance from "../../Scene";
import { useViewportStore } from "../../../state/viewportStore";

export const boxTool: CreationTool = {
  getSteps(scene) {
    const state = {
      baseCorner1: null as THREE.Vector3 | null,
      baseCorner2: null as THREE.Vector3 | null,
      width: 0,
      depth: 0,
      height: 0,
      previewMesh: null as THREE.Mesh | null,
      viewportId: 0,
      drawingPlane: null as { normal: THREE.Vector3; up: THREE.Vector3 } | null,
    };

    const viewportId = useViewportStore.getState().activeViewport;

    function setupPreview() {
      state.previewMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.7,
          wireframe: true,
        })
      );

      scene.getScene().add(state.previewMesh);
    }

    function updateBasePreview() {
      if (!state.previewMesh || !state.baseCorner1 || !state.baseCorner2)
        return;
      state.width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
      state.depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
      state.previewMesh.geometry.dispose();
      state.previewMesh.geometry = new THREE.BoxGeometry(
        state.width,
        0.01,
        state.depth
      );

      state.previewMesh.position.set(
        (state.baseCorner1.x + state.baseCorner2.x) / 2,
        state.baseCorner1.y,
        (state.baseCorner1.z + state.baseCorner2.z) / 2
      );
    }

    function calculateHeight(currentPoint: THREE.Vector3): number {
      if (state.drawingPlane?.normal.y === 1) {
        return currentPoint.y - (state.baseCorner2?.y || 0);
      } else {
        const direction = currentPoint.clone().sub(state.baseCorner1!);
        return direction.dot(
          state.drawingPlane?.normal || new THREE.Vector3(0, 1, 0)
        );
      }
    }

    function updateHeightPreview() {
      if (!state.previewMesh || !state.baseCorner1 || !state.baseCorner2)
        return;

      const height = Math.max(0.001, Math.abs(state.height));
      state.previewMesh.geometry.dispose();
      state.previewMesh.geometry = new THREE.BoxGeometry(
        state.width,
        height,
        state.depth
      );
      state.previewMesh.position.set(
        (state.baseCorner1.x + state.baseCorner2.x) / 2,
        state.baseCorner1.y + height / 2,
        (state.baseCorner1.z + state.baseCorner2.z) / 2
      );
    }

    function finalizeBox() {
      console.log("finalize");

      const center = new THREE.Vector3(
        (state.baseCorner1.x + state.baseCorner2.x) / 2,
        state.baseCorner1.y + state.height / 2,
        (state.baseCorner1.z + state.baseCorner2.z) / 2
      );
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(state.width, state.height, state.depth),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
      box.position.set(...center);

      scene.addObject(`Box_${Date.now()}`, box, [center.x, center.y, center.z]);
    }

    function cleanupPreview() {
      if (state.previewMesh) {
        scene.getScene().remove(state.previewMesh);
        state.previewMesh = null;
      }
    }

    return [
      {
        events: [
          {
            type: "pointerdown",
            handler: (e, next) => {
              state.baseCorner1 = getWorldPointFromMouse(
                e as MouseEvent,
                viewportId
              );
              setupPreview();
              next();
            },
          },
        ],
      },
      {
        events: [
          {
            type: "pointermove",
            handler: (e) => {
              state.baseCorner2 = getWorldPointFromMouse(
                e as MouseEvent,
                viewportId
              );
              updateBasePreview();
            },
          },
          {
            type: "pointerup",
            handler: (_e, next) => {
              next();
            },
          },
        ],
      },
      {
        events: [
          {
            type: "pointermove",
            handler: (e) => {
              // const current = getWorldPointFromMouse(
              //   e as MouseEvent,
              //   viewportId
              // );
              // state.height = calculateHeight(current);
              // updateHeightPreview();
              let previousY = e.clientY;
              document.addEventListener("mousemove", (e) => {
                const deltaY = previousY - e.clientY;
                state.height += deltaY * 0.0002;
                updateHeightPreview();
                previousY = e.clientY;
              });
            },
          },
          {
            type: "pointerdown",
            handler: (_e, next) => {
              finalizeBox();
              cleanupPreview();
              next();
            },
          },
        ],
      },
    ];
  },

  onFinish() {
    console.log("Box creation finished");
  },

  onCancel() {
    console.log("Box creation canceled");
  },
};
