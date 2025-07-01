// src/scene/creation/2d/arc.ts
import * as THREE from "three";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import { useViewportStore } from "../../../../state/viewportStore";
import type { CreationTool } from "../../creationTypes";

export const arcTool: CreationTool = {
  getSteps(scene) {
    const viewportId = useViewportStore.getState().activeViewport;
    const viewports = useViewportStore.getState().viewports;
    const drawingPlane =
      viewports[viewportId].settings.cameraSettings.drawingPlane;

    const state = {
      viewportId,
      drawingPlane,
      p1: null as THREE.Vector3 | null,
      p2: null as THREE.Vector3 | null,
      p3: new THREE.Vector3(),
      arcLine: null as THREE.Line | null,
      sprites: [] as THREE.Sprite[],
    };

    function addSprite(pos: THREE.Vector3, color: number) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ color }));
      sprite.scale.set(0.08, 0.08, 0.08);
      sprite.position.copy(pos);
      state.sprites.push(sprite);
      scene.getScene().add(sprite);
    }

    // Extract 2D coordinates based on the drawing plane
    function get2DCoords(point: THREE.Vector3): { x: number; y: number } {
      const n = drawingPlane.normal;

      if (Math.abs(n.x) === 1) {
        // YZ plane (side view)
        return { x: point.y, y: point.z };
      } else if (Math.abs(n.y) === 1) {
        // XZ plane (top view)
        return { x: point.x, y: point.z };
      } else {
        // XY plane (front view)
        return { x: point.x, y: point.y };
      }
    }

    // Convert 2D coordinates back to 3D based on the drawing plane
    function to3DCoords(
      x: number,
      y: number,
      referencePoint: THREE.Vector3
    ): THREE.Vector3 {
      const n = drawingPlane.normal;

      if (Math.abs(n.x) === 1) {
        // YZ plane
        return new THREE.Vector3(referencePoint.x, x, y);
      } else if (Math.abs(n.y) === 1) {
        // XZ plane
        return new THREE.Vector3(x, referencePoint.y, y);
      } else {
        // XY plane
        return new THREE.Vector3(x, y, referencePoint.z);
      }
    }

    function createArcPoints(
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      center: THREE.Vector3,
      mouse: THREE.Vector3,
      segments = 64
    ): THREE.Vector3[] {
      const p1_2d = get2DCoords(p1);
      const p2_2d = get2DCoords(p2);
      const center_2d = get2DCoords(center);
      const mouse_2d = get2DCoords(mouse);

      const radius = Math.sqrt(
        Math.pow(p1_2d.x - center_2d.x, 2) + Math.pow(p1_2d.y - center_2d.y, 2)
      );

      const a1 = Math.atan2(p1_2d.y - center_2d.y, p1_2d.x - center_2d.x);
      const a2 = Math.atan2(p2_2d.y - center_2d.y, p2_2d.x - center_2d.x);
      const mouseAngle = Math.atan2(
        mouse_2d.y - center_2d.y,
        mouse_2d.x - center_2d.x
      );

      const lineVec_x = p2_2d.x - p1_2d.x;
      const lineVec_y = p2_2d.y - p1_2d.y;
      const mouseVec_x = mouse_2d.x - p1_2d.x;
      const mouseVec_y = mouse_2d.y - p1_2d.y;
      const cross = lineVec_x * mouseVec_y - lineVec_y * mouseVec_x;

      // Calculate the two possible arc sweeps
      let angleDiff1 = a2 - a1; // Counter-clockwise from a1 to a2
      let angleDiff2 = a1 - a2; // Counter-clockwise from a2 to a1 (clockwise from a1 to a2)

      // Normalize to [0, 2π]
      while (angleDiff1 < 0) angleDiff1 += Math.PI * 2;
      while (angleDiff1 >= Math.PI * 2) angleDiff1 -= Math.PI * 2;
      while (angleDiff2 < 0) angleDiff2 += Math.PI * 2;
      while (angleDiff2 >= Math.PI * 2) angleDiff2 -= Math.PI * 2;

      let useCounterClockwise = true;

      // Check if mouse angle is in the counter-clockwise arc from a1 to a2
      let testAngle = mouseAngle - a1;
      while (testAngle < 0) testAngle += Math.PI * 2;
      while (testAngle >= Math.PI * 2) testAngle -= Math.PI * 2;

      if (testAngle <= angleDiff1) {
        // Mouse is in the counter-clockwise arc
        useCounterClockwise = true;
      } else {
        // Mouse is in the clockwise arc
        useCounterClockwise = false;
      }

      let startAngle, angleDiff;
      if (useCounterClockwise) {
        startAngle = a1;
        angleDiff = angleDiff1;
      } else {
        startAngle = a1;
        angleDiff = -angleDiff2; // Negative for clockwise
      }

      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = startAngle + t * angleDiff;

        // Calculate 2D point on arc
        const x2d = center_2d.x + radius * Math.cos(angle);
        const y2d = center_2d.y + radius * Math.sin(angle);

        // Convert back to 3D coordinates
        const point3d = to3DCoords(x2d, y2d, center);
        points.push(point3d);
      }
      return points;
    }

    function findArcCenter(
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      mouse: THREE.Vector3
    ): THREE.Vector3 | null {
      // Work in 2D coordinates for the current drawing plane
      const p1_2d = get2DCoords(p1);
      const p2_2d = get2DCoords(p2);
      const mouse_2d = get2DCoords(mouse);

      // Vector from p1 to p2 in 2D
      const to2_x = p2_2d.x - p1_2d.x;
      const to2_y = p2_2d.y - p1_2d.y;
      const mid12_x = (p1_2d.x + p2_2d.x) * 0.5;
      const mid12_y = (p1_2d.y + p2_2d.y) * 0.5;

      // Perpendicular to the line p1-p2 (for perpendicular bisector)
      const perp12_x = -to2_y;
      const perp12_y = to2_x;
      const perp12_len = Math.sqrt(perp12_x * perp12_x + perp12_y * perp12_y);
      const perp12_norm_x = perp12_x / perp12_len;
      const perp12_norm_y = perp12_y / perp12_len;

      // Vector from p1 to mouse in 2D
      const toMouse_x = mouse_2d.x - p1_2d.x;
      const toMouse_y = mouse_2d.y - p1_2d.y;
      const mid1m_x = (p1_2d.x + mouse_2d.x) * 0.5;
      const mid1m_y = (p1_2d.y + mouse_2d.y) * 0.5;

      // Perpendicular to the line p1-mouse (for perpendicular bisector)
      const perp1m_x = -toMouse_y;
      const perp1m_y = toMouse_x;
      const perp1m_len = Math.sqrt(perp1m_x * perp1m_x + perp1m_y * perp1m_y);
      const perp1m_norm_x = perp1m_x / perp1m_len;
      const perp1m_norm_y = perp1m_y / perp1m_len;

      // Find intersection of the two perpendicular bisectors in 2D
      const cross =
        perp12_norm_x * perp1m_norm_y - perp12_norm_y * perp1m_norm_x;
      if (Math.abs(cross) < 1e-6) return null; // Lines are parallel

      const dx = mid1m_x - mid12_x;
      const dy = mid1m_y - mid12_y;
      const t = (dx * perp1m_norm_y - dy * perp1m_norm_x) / cross;

      const intersect_x = mid12_x + t * perp12_norm_x;
      const intersect_y = mid12_y + t * perp12_norm_y;

      // Convert back to 3D coordinates
      return to3DCoords(intersect_x, intersect_y, p1);
    }

    function updateArc(mouse: THREE.Vector3) {
      if (!state.p1 || !state.p2) return;

      const center = findArcCenter(state.p1, state.p2, mouse);
      if (!center) return;

      state.p3.copy(center);
      const arcPoints = createArcPoints(state.p1, state.p2, center, mouse);

      if (!state.arcLine) {
        const geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
        state.arcLine = new THREE.Line(geometry, material);
        scene.getScene().add(state.arcLine);
      } else {
        state.arcLine.geometry.dispose();
        state.arcLine.geometry = new THREE.BufferGeometry().setFromPoints(
          arcPoints
        );
      }
    }

    function finalizeArc() {
      if (!state.p1 || !state.p2 || !state.arcLine) return;

      const final = state.arcLine.clone();
      final.material = new THREE.LineBasicMaterial({ color: 0x00ffff });
      final.geometry = state.arcLine.geometry.clone();

      // Calculate center from the geometry points
      const center = new THREE.Vector3();
      const pos = final.geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        center.x += pos.getX(i);
        center.y += pos.getY(i);
        center.z += pos.getZ(i);
      }
      center.divideScalar(pos.count);
      final.userData.transformCenter = center;

      scene.addObject(`Arc_${Date.now()}`, final);
    }

    function cleanup() {
      if (state.arcLine) {
        scene.getScene().remove(state.arcLine);
        state.arcLine.geometry.dispose();
        state.arcLine = null;
      }
      for (const s of state.sprites) {
        scene.getScene().remove(s);
      }
      state.sprites = [];
    }

    return [
      {
        events: [
          {
            type: "pointerdown",
            handler: (e, next) => {
              const pt = getWorldPointFromMouse(e, state.viewportId);
              state.p1 = pt.clone();
              addSprite(pt, 0xff0000);
              next();
            },
          },
        ],
      },
      {
        events: [
          {
            type: "pointerdown",
            handler: (e, next) => {
              const pt = getWorldPointFromMouse(e, state.viewportId);
              state.p2 = pt.clone();
              addSprite(pt, 0x0000ff);
              next();
            },
          },
          {
            type: "pointermove",
            handler: (e) => {
              const pt = getWorldPointFromMouse(e, state.viewportId);
              updateArc(pt);
            },
          },
        ],
      },
      {
        events: [
          {
            type: "pointermove",
            handler: (e) => {
              const pt = getWorldPointFromMouse(e, state.viewportId);
              updateArc(pt);
            },
          },
          {
            type: "pointerdown",
            handler: (e, next) => {
              const pt = getWorldPointFromMouse(e, state.viewportId);
              updateArc(pt);
              addSprite(state.p3, 0x00ff00);
              finalizeArc();
              cleanup();
              next();
            },
          },
        ],
      },
    ];
  },

  onFinish() {
    console.log("Arc tool finished");
  },

  onCancel() {
    console.log("Arc tool canceled");
  },
};
