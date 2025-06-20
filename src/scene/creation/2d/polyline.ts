import * as THREE from "three";
import { useFeatureStore } from "../../../state/featureStore";
import { createControlPoint } from "../../shared/controlPoints";

export class SketchPolyline {
  id: string;
  scene: THREE.Scene;
  line: THREE.Line;
  points: THREE.Vector3[];
  controls: THREE.Sprite[] = [];

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
    scene.add(this.line);

    this.createHandles();

    this.subscribeToFeature();
  }

  subscribeToFeature() {
    this.unsubscribe = useFeatureStore.subscribe(
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

  createHandles() {
    this.controls.forEach((c) => this.scene.remove(c));
    this.controls = this.points.map((p, i) => {
      const cp = createControlPoint(p.clone(), {
        objectId: this.id,
        paramKey: `point_${i}`,
        index: i,
        owner: this,
        role: "polyline-point",
      });
      this.scene.add(cp);
      return cp;
    });
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
    this.scene.remove(this.line);
    this.controls.forEach((c) => this.scene.remove(c));
    this.line.geometry.dispose();
    this.unsubscribe();
  }

  static getSteps(id: string, scene: THREE.Scene) {
    const state = {
      points: [] as THREE.Vector3[],
      previewLine: null as THREE.Line | null,
      viewportId: 0,
    };

    function updatePreview(cursor?: THREE.Vector3) {
      if (!state.previewLine) return;
      const points = [...state.points];
      if (cursor) points.push(cursor);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      state.previewLine.geometry.dispose();
      state.previewLine.geometry = geom;
    }

    return [
      {
        events: [
          {
            type: "pointerdown",
            handler: (e, next) => {
              const pt = getWorldPointFromMouse(e, state.viewportId);
              state.points.push(pt);
              if (state.points.length === 1) {
                const geom = new THREE.BufferGeometry();
                const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
                state.previewLine = new THREE.Line(geom, mat);
                scene.add(state.previewLine);
              }
              updatePreview();
            },
          },
          {
            type: "pointermove",
            handler: (e) => {
              if (state.points.length === 0) return;
              const pt = getWorldPointFromMouse(e, state.viewportId);
              updatePreview(pt);
            },
          },
        ],
      },
      {
        events: [
          {
            type: "pointerdown",
            handler: (e, next) => {
              if (state.points.length < 2) return;
              scene.remove(state.previewLine!);
              const polyline = new SketchPolyline(id, scene, state.points);
              useFeatureStore
                .getState()
                .updatePolyline(id, { points: state.points });
              next();
            },
          },
        ],
      },
    ];
  }
}
