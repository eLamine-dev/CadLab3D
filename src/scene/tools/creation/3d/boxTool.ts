import { getWorldPointFromMouse } from "../utils/projectionHelper";
import * as THREE from "three";
import { useViewportStore } from "../../../../state/viewportStore";

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
    const camera = useViewportStore.getState().arrayCamera?.cameras[viewportId];

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

    function updateHeightPreview() {
      if (!state.previewMesh || !state.baseCorner1 || !state.baseCorner2)
        return;

      const n = drawingPlane.normal;
      const h = state.height;
      const absH = Math.abs(h);

      const center = new THREE.Vector3();
      let width = 0,
        depth = 0;

      if (n.x === 1 || n.x === -1) {
        // Plane is YZ → height along X
        width = Math.abs(state.baseCorner2.y - state.baseCorner1.y);
        depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
        center.set(
          state.baseCorner1.x + h / 2,
          (state.baseCorner1.y + state.baseCorner2.y) / 2,
          (state.baseCorner1.z + state.baseCorner2.z) / 2
        );
        state.previewMesh.geometry.dispose();
        state.previewMesh.geometry = new THREE.BoxGeometry(absH, width, depth);
      } else if (n.y === 1 || n.y === -1) {
        // Plane is XZ → height along Y
        width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
        depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
        center.set(
          (state.baseCorner1.x + state.baseCorner2.x) / 2,
          state.baseCorner1.y + h / 2,
          (state.baseCorner1.z + state.baseCorner2.z) / 2
        );
        state.previewMesh.geometry.dispose();
        state.previewMesh.geometry = new THREE.BoxGeometry(width, absH, depth);
      } else if (n.z === 1 || n.z === -1) {
        // Plane is XY → height along Z
        width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
        depth = Math.abs(state.baseCorner2.y - state.baseCorner1.y);
        center.set(
          (state.baseCorner1.x + state.baseCorner2.x) / 2,
          (state.baseCorner1.y + state.baseCorner2.y) / 2,
          state.baseCorner1.z + h / 2
        );
        state.previewMesh.geometry.dispose();
        state.previewMesh.geometry = new THREE.BoxGeometry(width, depth, absH);
      }

      state.previewMesh.position.copy(center);
    }

    function finalizeBox() {
      if (!state.baseCorner1 || !state.baseCorner2) return;

      const n = drawingPlane.normal;
      const h = state.height;
      const absH = Math.abs(h);

      const center = new THREE.Vector3();
      let width = 0,
        depth = 0;
      let geometry: THREE.BoxGeometry;

      let box: THREE.Mesh;

      if (n.x === 1 || n.x === -1) {
        width = Math.abs(state.baseCorner2.y - state.baseCorner1.y);
        depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
        center.set(
          state.baseCorner1.x + h / 2,
          (state.baseCorner1.y + state.baseCorner2.y) / 2,
          (state.baseCorner1.z + state.baseCorner2.z) / 2
        );
        geometry = new THREE.BoxGeometry(absH, width, depth);
      } else if (n.y === 1 || n.y === -1) {
        width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
        depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
        center.set(
          (state.baseCorner1.x + state.baseCorner2.x) / 2,
          state.baseCorner1.y + h / 2,
          (state.baseCorner1.z + state.baseCorner2.z) / 2
        );
        geometry = new THREE.BoxGeometry(width, absH, depth);
      } else {
        width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
        depth = Math.abs(state.baseCorner2.y - state.baseCorner1.y);
        center.set(
          (state.baseCorner1.x + state.baseCorner2.x) / 2,
          (state.baseCorner1.y + state.baseCorner2.y) / 2,
          state.baseCorner1.z + h / 2
        );
        geometry = new THREE.BoxGeometry(width, depth, absH);
      }

      box = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
      box.position.copy(center);
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
