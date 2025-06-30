import * as THREE from "three";
import { featureStore } from "../../../state/featureStore";
import { createControlPoint } from "../../shared/controlPoints";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import { useViewportStore } from "../../../state/viewportStore";
import { ToolSession } from "../../toolSession";
export class SketchPolyline {
  id: string;
  scene: THREE.Scene;
  points: THREE.Vector3[] = [];
  controls: THREE.Sprite[] = [];
  line: THREE.Line;
  unsubscribe: () => void = () => {};
  isFinalized = false;
  showCtrlPoints = () =>
    this.points.forEach((p, i) => this.addControlPointAt(p, i));
  hideCtrlPoints = () => {
    this.controls.forEach((c) => this.scene.getScene().remove(c));
    this.controls = [];
  };
  previewLine: THREE.Line | null = null;
  editMode = false;
  creationActive = false;

  constructor(id: string, scene: THREE.Scene) {
    this.id = id;
    this.scene = scene;

    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const geometry = new THREE.BufferGeometry();
    this.line = new THREE.Line(geometry, material);
    this.line.userData.instance = this;

    featureStore.getState().updatePolyline(this.id, { points: this.points });
    scene.getScene().add(this.line);
  }

  startCreation() {
    this.creationActive = true;
    document.addEventListener("keydown", this.handleKeyPress);
  }

  finalizeCreation() {
    if (this.points.length >= 2) {
      this.creationActive = false;
      this.isFinalized = true;
      this.update();
      featureStore.getState().updatePolyline(this.id, { points: this.points });
      this.subscribeToFeature();
      this.hideCtrlPoints();
    } else {
      console.warn("Polyline creation canceled (not enough points)");
      this.dispose();
    }
    this.cleanupPreview();
    document.removeEventListener("keydown", this.handleKeyPress);
  }

  subscribeToFeature() {
    this.unsubscribe = featureStore.subscribe(
      (s) => s.polylines[this.id],
      (data) => {
        if (data && data.points) {
          const pointsChanged =
            this.points.length !== data.points.length ||
            data.points.some(
              (p, i) => !this.points[i] || !p.equals(this.points[i])
            );

          if (pointsChanged) {
            this.points = data.points.map((p) => p.clone());
            this.update();
            this.updateControlPoints();
          }
        }
      },
      { fireImmediately: false }
    );
  }

  update() {
    if (this.line.geometry) {
      this.line.geometry.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(this.points);
    this.line.geometry = geometry;

    this.line.userData.transformCenter = this.getCenter();

    this.line.updateMatrixWorld(true);
  }

  updateControlPoints() {
    this.controls.forEach((ctrl, i) => {
      if (this.points[i]) {
        ctrl.position.copy(this.points[i]);
        ctrl.updateMatrixWorld(true);
      }
    });
  }

  getCenter(): THREE.Vector3 {
    if (this.points.length === 0) return new THREE.Vector3();

    const center = new THREE.Vector3();
    for (const p of this.points) {
      center.add(p);
    }
    return center.divideScalar(this.points.length);
  }

  cleanupPreview() {
    if (this.previewLine) {
      this.scene.getScene().remove(this.previewLine);
      this.previewLine.geometry.dispose();
      this.previewLine = null;
    }
  }

  dispose() {
    this.scene.getScene().remove(this.line);
    this.line.geometry.dispose();
    this.cleanupPreview();

    this.controls.forEach((cp) => {
      this.scene.getScene().remove(cp);
    });
    this.controls = [];

    this.unsubscribe();
  }

  handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (this.points.length > 0) {
        this.points.pop();
        const ctrl = this.controls.pop();
        if (ctrl) {
          this.scene.getScene().remove(ctrl);
        }
        this.updatePreview();
      }
    }
  };

  updatePreview(cursorPoint?: THREE.Vector3) {
    const previewPoints = [...this.points];
    if (cursorPoint) previewPoints.push(cursorPoint);

    if (!this.previewLine) {
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      const geometry = new THREE.BufferGeometry();
      this.previewLine = new THREE.Line(geometry, material);
      this.scene.getScene().add(this.previewLine);
    }

    this.previewLine.geometry.dispose();
    this.previewLine.geometry = new THREE.BufferGeometry().setFromPoints(
      previewPoints
    );
  }

  addControlPointAt(point: THREE.Vector3, index: number) {
    const ctrl = createControlPoint(point.clone(), {
      objectId: this.id,
      paramKey: `points[${index}]`,
      index: index,
      owner: this,
      role: "polyline-point",
      onUpdate: (newPosition: THREE.Vector3) => {
        featureStore
          .getState()
          .updatePoint(this.id, index, newPosition.clone());
      },
    });

    this.controls[index] = ctrl;
    this.scene.getScene().add(ctrl);
    return ctrl;
  }

  addPoint(point: THREE.Vector3) {
    const index = this.points.length;
    this.points.push(point.clone());

    this.addControlPointAt(point, index);

    if (this.creationActive) {
      this.update();
    }
  }

  handlePointerDown = (e: PointerEvent, next: () => void) => {
    if (e.button === 2) {
      e.preventDefault();
      this.finalizeCreation();
      next();
      return;
    }

    const pt = getWorldPointFromMouse(
      e,
      useViewportStore.getState().activeViewport
    );
    this.addPoint(pt);
    console.log("pointer down");
  };

  handlePointerMove = (e: PointerEvent) => {
    if (!this.creationActive || !this.points.length) return;

    const pt = getWorldPointFromMouse(
      e,
      useViewportStore.getState().activeViewport
    );
    this.updatePreview(pt);
  };

  getCreationSteps() {
    return [
      {
        events: [
          { type: "pointerdown", handler: this.handlePointerDown },
          { type: "pointermove", handler: this.handlePointerMove },
        ],
      },
    ];
  }
}

ToolSession.register("polyline", (id, scene) => {
  const tool = new SketchPolyline(id, scene);
  tool.startCreation();
  return {
    getSteps: () => tool.getCreationSteps(),
    cancel: () => tool.dispose(),
    finish: () => tool.finalizeCreation(),
  };
});
