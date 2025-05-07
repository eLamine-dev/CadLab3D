import { CreationTool } from "../creationTypes";
import {
  getDrawingPlaneFromViewport,
  getWorldPointFromMouse,
} from "../utils/projectionHelper";
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
      drawingPlane: THREE.Plane,
    };

    const viewportId = useViewportStore.getState().activeViewport;

    const viewports = useViewportStore.getState().viewports;

    const drawingPlane =
      viewports[viewportId].settings.cameraSettings.drawingPlane;

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

      const n = drawingPlane.normal;

      let width = 0,
        depth = 0,
        center = new THREE.Vector3();

      if (n.x === 1 || n.x === -1) {
        // Plane is YZ (x = 0)
        width = Math.abs(state.baseCorner2.y - state.baseCorner1.y);
        depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
        center.set(
          state.baseCorner1.x,
          (state.baseCorner1.y + state.baseCorner2.y) / 2,
          (state.baseCorner1.z + state.baseCorner2.z) / 2
        );
        state.previewMesh.geometry.dispose();
        state.previewMesh.geometry = new THREE.BoxGeometry(0.01, width, depth);
      } else if (n.y === 1 || n.y === -1) {
        // Plane is XZ (y = 0)
        width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
        depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
        center.set(
          (state.baseCorner1.x + state.baseCorner2.x) / 2,
          state.baseCorner1.y,
          (state.baseCorner1.z + state.baseCorner2.z) / 2
        );
        state.previewMesh.geometry.dispose();
        state.previewMesh.geometry = new THREE.BoxGeometry(width, 0.01, depth);
      } else if (n.z === 1 || n.z === -1) {
        // Plane is XY (z = 0)
        width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
        depth = Math.abs(state.baseCorner2.y - state.baseCorner1.y);
        center.set(
          (state.baseCorner1.x + state.baseCorner2.x) / 2,
          (state.baseCorner1.y + state.baseCorner2.y) / 2,
          state.baseCorner1.z
        );
        state.previewMesh.geometry.dispose();
        state.previewMesh.geometry = new THREE.BoxGeometry(width, depth, 0.01);
      }

      state.previewMesh.position.copy(center);
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

      const height = state.height;
      const centerY = state.baseCorner1.y + height / 2;

      state.previewMesh.geometry.dispose();
      state.previewMesh.geometry = new THREE.BoxGeometry(
        state.width,
        Math.abs(height), // always positive for geometry
        state.depth
      );

      state.previewMesh.position.set(
        (state.baseCorner1.x + state.baseCorner2.x) / 2,
        centerY,
        (state.baseCorner1.z + state.baseCorner2.z) / 2
      );
    }

    function getRayFromScreenPoint(
      x: number,
      y: number,
      camera: THREE.Camera
    ): THREE.Ray {
      const canvas = sceneInstance.getCanvas();
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((x - rect.left) / rect.width) * 2 - 1,
        -((y - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      return raycaster.ray;
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

    let startY = 0;
    let initialHeight = 0;

    return [
      {
        events: [
          {
            type: "pointerdown",
            handler: (e, next) => {
              state.viewportId = useViewportStore.getState().activeViewport;
              // state.drawingPlane = getDrawingPlaneFromViewport(
              //   state.viewportId
              // );

              state.baseCorner1 = getWorldPointFromMouse(
                e as MouseEvent,
                viewportId
                // state.drawingPlane
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
                // state.drawingPlane
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
              if (!state.baseCorner2) return;
              const camera =
                useViewportStore.getState().arrayCamera?.cameras[viewportId];
              const viewport =
                useViewportStore.getState().viewports[viewportId];
              const drawingPlane =
                viewport.settings.cameraSettings.drawingPlane;
              if (!camera) return;

              const currentY = e.clientY;

              if (startY === 0) {
                startY = currentY;
                initialHeight = state.height || 0;
              }

              const deltaPixels = startY - currentY;

              const up = drawingPlane.normal.clone().normalize();

              let worldHeightDelta;

              if (camera instanceof THREE.PerspectiveCamera) {
                const distance = camera.position.distanceTo(state.baseCorner2);
                worldHeightDelta = deltaPixels * distance * 0.001;
              } else {
                worldHeightDelta = deltaPixels * 0.01;
              }

              state.height =
                initialHeight + worldHeightDelta * (up.y !== 0 ? 1 : -1);

              updateHeightPreview();
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
