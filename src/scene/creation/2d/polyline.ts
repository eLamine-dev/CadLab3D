import * as THREE from "three";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import { useViewportStore } from "../../../state/viewportStore";
import type { CreationTool } from "../../creationTypes";

export const polylineTool: CreationTool = {
  getSteps(scene) {
    const state = {
      points: [] as THREE.Vector3[],
      previewLine: null as THREE.Line | null,
      markers: [] as THREE.Sprite[],
      viewportId: useViewportStore.getState().activeViewport,
    };

    function setupPreview() {
      if (state.previewLine) return;

      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      state.previewLine = new THREE.Line(geometry, material);
      scene.getScene().add(state.previewLine);
    }

    function updatePreview(cursorPoint?: THREE.Vector3) {
      if (!state.previewLine) return;

      let previewPoints = [...state.points];
      if (cursorPoint && state.points.length > 0) {
        previewPoints.push(cursorPoint);
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
      state.previewLine.geometry.dispose();
      state.previewLine.geometry = geometry;
    }

    function addPointSprite(position: THREE.Vector3): THREE.Sprite {
      const material = new THREE.SpriteMaterial({ color: 0xffffff });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.07, 0.07, 0.07);
      sprite.position.copy(position);
      sprite.userData.isPolylineMarker = true;
      return sprite;
    }

    function undoLastPoint() {
      if (state.points.length === 0) return;

      // Remove the last point and its marker
      state.points.pop();
      const lastMarker = state.markers.pop();
      if (lastMarker) {
        scene.getScene().remove(lastMarker);
      }

      // Update preview
      if (state.points.length === 0) {
        cleanup();
      } else {
        updatePreview();
      }

      console.log(`Undid last point. Points remaining: ${state.points.length}`);
    }

    function finalizePolyline() {
      if (state.points.length < 2) {
        console.log("Need at least 2 points to create a polyline");
        return;
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(state.points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
      const polyline = new THREE.Line(geometry, material);

      // Calculate center point for transforms
      const center = new THREE.Vector3();
      for (const point of state.points) center.add(point);
      center.divideScalar(state.points.length);
      polyline.userData.transformCenter = center;

      scene.addObject(`Polyline_${Date.now()}`, polyline);
    }

    function cleanup() {
      if (state.previewLine) {
        scene.getScene().remove(state.previewLine);
        state.previewLine.geometry.dispose();
        state.previewLine = null;
      }

      for (const marker of state.markers) {
        scene.getScene().remove(marker);
      }
      state.markers = [];
    }

    function reset() {
      cleanup();
      state.points = [];
      console.log("Polyline creation reset");
    }

    function handleKeyPress(e: KeyboardEvent) {
      switch (e.key.toLowerCase()) {
        case "escape":
          reset();
          break;
        case "backspace":
          e.preventDefault();
          undoLastPoint();
          break;
        case "enter":
          if (state.points.length >= 2) {
            finalizePolyline();
            reset();
          }
          break;
      }
    }

    document.addEventListener("keydown", handleKeyPress);

    return [
      {
        events: [
          {
            type: "pointerdown",
            handler: (e: PointerEvent, next: () => void) => {
              if (e.button === 2) {
                e.preventDefault();
                document.removeEventListener("keydown", handleKeyPress);

                if (state.points.length >= 2) {
                  finalizePolyline();
                } else {
                  console.log(
                    "Polyline creation canceled - need at least 2 points"
                  );
                }

                cleanup();
                next();
                return;
              }

              const point = getWorldPointFromMouse(e, state.viewportId);

              state.points.push(point);

              const sprite = addPointSprite(point);
              state.markers.push(sprite);
              scene.getScene().add(sprite);

              if (state.points.length === 1) {
                setupPreview();
              }

              updatePreview();
            },
          },
          {
            type: "pointermove",
            handler: (e: PointerEvent) => {
              if (state.points.length === 0) return;

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
    document.removeEventListener("keydown", () => {});
  },
};
