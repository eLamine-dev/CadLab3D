import * as THREE from "three";
import { featureStore } from "../../../state/featureStore";
import { createControlPoint } from "../../shared/controlPoints";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import { useViewportStore } from "../../../state/viewportStore";

export class SketchPolyline {
  id: string;
  scene: THREE.Scene;
  points: THREE.Vector3[] = [];
  controls: THREE.Sprite[] = [];
  line: THREE.Line;
  unsubscribe: () => void = () => {};
  isFinalized = false;

  previewLine: THREE.Line | null = null;
  creationActive = false;

  constructor(id: string, scene: THREE.Scene) {
    this.id = id;
    this.scene = scene;

    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const geometry = new THREE.BufferGeometry();
    this.line = new THREE.Line(geometry, material);

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
      // this.line.geometry.dispose();
      // this.line.geometry = new THREE.BufferGeometry().setFromPoints(
      //   this.points
      // );
      // this.line.userData.transformCenter = this.getCenter();
      this.update();
      featureStore.getState().updatePolyline(this.id, { points: this.points });
      this.subscribeToFeature();
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
        if (data) {
          this.points = data.points;
          this.update();
        }
      },
      { fireImmediately: true }
    );
  }

  update() {
    this.line.geometry.dispose();
    this.line.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line.userData.transformCenter = this.getCenter();
    this.controls.forEach((cp, i) => cp.position.copy(this.points[i]));
  }

  getCenter(): THREE.Vector3 {
    const center = new THREE.Vector3();
    for (const p of this.points) center.add(p);
    return center.divideScalar(this.points.length);
  }

  cleanupPreview() {
    if (this.previewLine) {
      this.scene.getScene().remove(this.previewLine);
      this.previewLine.geometry.dispose();
      this.previewLine = null;
    }

    this.controls.forEach((cp) => this.scene.getScene().remove(cp));
    this.controls = [];
  }

  dispose() {
    this.scene.getScene().remove(this.line);
    this.line.geometry.dispose();
    this.cleanupPreview();
    this.unsubscribe();
  }

  handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      this.points.pop();
      this.controls.pop()?.removeFromParent();
      this.updatePreview();
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

  addPoint(point: THREE.Vector3) {
    this.points.push(point);

    const ctrl = createControlPoint(point.clone(), {
      objectId: this.id,
      paramKey: `points[${this.points.length - 1}]`,
      index: this.points.length - 1,
      owner: this,
      role: "polyline-point",
    });

    this.controls.push(ctrl);
    this.scene.getScene().add(ctrl);
    this.updatePreview();
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
