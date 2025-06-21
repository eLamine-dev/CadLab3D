import * as THREE from "three";
import { featureStore } from "../../../state/featureStore";
import { createControlPoint } from "../../shared/controlPoints";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import { useViewportStore } from "../../../state/viewportStore";

export class SketchPolyline {
  id: string;
  scene: THREE.Scene;
  line: THREE.Line;
  points: THREE.Vector3[];
  controls: THREE.Sprite[] = [];

  unsubscribe: () => void;

  constructor(
    id: string,
    scene: THREE.Scene,
    initialPoints: THREE.Vector3[] = []
  ) {
    this.id = id;
    this.scene = scene;
    this.points = [...initialPoints];

    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line = new THREE.Line(geometry, material);
    this.line.userData.transformCenter = this.getCenter();
    scene.getScene().add(this.line);

    // this.subscribeToFeature();
  }

  subscribeToFeature() {
    this.unsubscribe = featureStore.subscribe(
      (s) => s.polylines[this.id],
      (data) => {
        if (data) {
          this.points = data.points;
          this.update();
        }
      },
      { fireImmediately: true }
    );
  }

  getCenter() {
    const center = new THREE.Vector3();
    for (const p of this.points) center.add(p);
    return center.divideScalar(this.points.length);
  }

  update() {
    this.line.geometry.setFromPoints(this.points);
    this.line.userData.transformCenter = this.getCenter();
    this.controls.forEach((cp, i) => cp.position.copy(this.points[i]));
  }

  dispose() {
    this.scene.getScene().remove(this.line);

    this.line.geometry.dispose();
    this.unsubscribe();
  }

  static getSteps(id: string, scene: THREE.Scene) {
    const viewportId = useViewportStore.getState().activeViewport;
    const state = {
      points: [] as THREE.Vector3[],
      previewLine: null as THREE.Line | null,
      ctrlPts: [] as THREE.Sprite[],
    };

    function updatePreview(cursorPoint?: THREE.Vector3) {
      if (!state.previewLine) {
        const geometry = new THREE.BufferGeometry().setFromPoints([]);
        const material = new THREE.LineBasicMaterial({
          color: 0xffffff,
        });
        state.previewLine = new THREE.Line(geometry, material);
        scene.getScene().add(state.previewLine);
      }
      const previewPoints = [...state.points];
      if (cursorPoint) previewPoints.push(cursorPoint);
      const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
      state.previewLine.geometry.dispose();
      state.previewLine.geometry = geometry;
    }

    function undoLastPoint() {
      if (state.points.length === 0) return;

      state.points.pop();
      const lastCtrlPt = state.ctrlPts.pop();
      if (lastCtrlPt) {
        scene.getScene().remove(lastCtrlPt);
      }

      if (state.points.length === 0) {
        cleanup();
      } else {
        updatePreview();
      }

      console.log(`Undid last point. Points remaining: ${state.points.length}`);
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

    function cleanupPreview() {
      if (state.previewLine) {
        scene.getScene().remove(state.previewLine);
        state.previewLine.geometry.dispose();
        state.previewLine = null;
      }
      for (const p of state.ctrlPts) {
        scene.getScene().remove(p);
      }
      state.ctrlPts = [];
    }

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
                  const polyline = new SketchPolyline(id, scene, state.points);
                  featureStore
                    .getState()
                    .updatePolyline(id, { points: state.points });
                } else {
                  console.log("Polyline creation canceled");
                }
                cleanupPreview();

                next();
                return;
              }

              const point = getWorldPointFromMouse(e, viewportId);
              state.points.push(point);
              const ctrlPoint = createControlPoint(point.clone(), {
                objectId: this.id,
                paramKey: `point_${state.ctrlPts.length - 1}`,
                index: state.ctrlPts.length - 1,
                owner: this,
                role: "polyline-point",
              });
              state.ctrlPts.push(ctrlPoint);

              scene.getScene().add(ctrlPoint);

              updatePreview();
            },
          },
          {
            type: "pointermove",
            handler: (e: PointerEvent) => {
              if (!state.points.length) return;
              const cursorPoint = getWorldPointFromMouse(e, viewportId);
              updatePreview(cursorPoint);
            },
          },
        ],
      },
    ];
  }
}
