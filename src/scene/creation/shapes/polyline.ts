// src/scene/creation/geometry/polylineTool.ts
import * as THREE from "three";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import { useViewportStore } from "../../../state/viewportStore";

export const polylineTool: CreationTool = {
  getSteps(scene) {
    const state = {
      points: [] as THREE.Vector3[],
      previewPoints: [] as THREE.Vector3[],
      line: null as THREE.Line | null,
      viewportId: useViewportStore.getState().activeViewport,
    };

    function setupPreview() {
      const geometry = new THREE.BufferGeometry();
      geometry.setFromPoints(state.previewPoints);
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      state.line = new THREE.Line(geometry, material);
      scene.getScene().add(state.line);
    }

    function updatePreview(cursorPoint?: THREE.Vector3) {
      if (!state.line) return;

      const dynamicPoints = [...state.points];
      if (cursorPoint) dynamicPoints.push(cursorPoint);

      const geometry = new THREE.BufferGeometry().setFromPoints(dynamicPoints);
      state.line.geometry.dispose();
      state.line.geometry = geometry;
    }

    function finalizePolyline() {
      if (state.points.length < 2) return;

      const geometry = new THREE.BufferGeometry().setFromPoints(state.points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
      const line = new THREE.Line(geometry, material);

      const center = new THREE.Vector3();
      for (const p of state.points) {
        center.add(p);
      }
      center.divideScalar(state.points.length);

      // Store the center in userData for the transform controls
      line.userData.transformCenter = center;

      scene.addObject(`Polyline_${Date.now()}`, line);
    }

    function cleanupPreview() {
      if (state.line) {
        scene.getScene().remove(state.line);
        state.line.geometry.dispose();
        state.line = null;
      }
    }

    return [
      {
        events: [
          {
            type: "pointerdown",
            handler: (e: PointerEvent, next: () => void) => {
              if (e.button === 2) {
                e.preventDefault();
                if (state.points.length >= 2) {
                  finalizePolyline();
                } else {
                  console.log("Polyline creation canceled");
                }
                cleanupPreview();
                next();
                return;
              }

              const point = getWorldPointFromMouse(e, state.viewportId);
              state.points.push(point);
              if (!state.line) setupPreview();
              updatePreview();
            },
          },
          {
            type: "pointermove",
            handler: (e: PointerEvent) => {
              if (!state.points.length) return;
              const cursorPoint = getWorldPointFromMouse(e, state.viewportId);
              updatePreview(cursorPoint);
            },
          },
        ],
      },
    ];
  },

  onFinish() {
    console.log("Polyline creation finished");
  },

  onCancel() {
    console.log("Polyline creation canceled");
  },
};
