import * as THREE from "three";
import SceneSingleton from "../../Scene";
import { getIntersectedObject } from "../../selection/getIntersectedObject";
import type { CreationTool } from "../../creationTypes";

export const extrudeTool: CreationTool = {
  getSteps(scene: SceneSingleton) {
    const state = {
      selectedLine: null as THREE.Line | null,
      extrudeHeight: 0,
      previewMesh: null as THREE.Mesh | null,
      shapePlane: new THREE.Plane(),
      shapeCenter: new THREE.Vector3(),
    };

    function isPolylineClosed(line: THREE.Line): boolean {
      const positions = line.geometry.attributes.position;
      if (positions.count < 3) return false;

      const firstPoint = new THREE.Vector3().fromBufferAttribute(positions, 0);
      const lastPoint = new THREE.Vector3().fromBufferAttribute(
        positions,
        positions.count - 1
      );

      return firstPoint.distanceTo(lastPoint) < 0.1;
    }

    function getPolylinePoints(line: THREE.Line): THREE.Vector3[] {
      const positions = line.geometry.attributes.position;
      const points: THREE.Vector3[] = [];

      for (let i = 0; i < positions.count; i++) {
        const point = new THREE.Vector3().fromBufferAttribute(positions, i);

        point.applyMatrix4(line.matrixWorld);
        points.push(point);
      }

      return points;
    }

    function calculateShapePlaneAndCenter(points: THREE.Vector3[]) {
      state.shapeCenter.set(0, 0, 0);
      for (const point of points) {
        state.shapeCenter.add(point);
      }
      state.shapeCenter.divideScalar(points.length);

      const normal = new THREE.Vector3();
      for (let i = 0; i < points.length - 2; i++) {
        const v1 = new THREE.Vector3().subVectors(points[i + 1], points[i]);
        const v2 = new THREE.Vector3().subVectors(points[i + 2], points[i]);
        normal.crossVectors(v1, v2);

        if (normal.length() > 0.001) {
          normal.normalize();
          break;
        }
      }

      if (normal.length() < 0.001) {
        normal.set(0, 0, 1);
      }

      state.shapePlane.setFromNormalAndCoplanarPoint(normal, state.shapeCenter);
    }

    function projectPointsToPlane(points: THREE.Vector3[]): THREE.Vector2[] {
      const normal = state.shapePlane.normal;

      const u = new THREE.Vector3();
      const v = new THREE.Vector3();

      if (Math.abs(normal.x) < 0.9) {
        u.set(1, 0, 0);
      } else {
        u.set(0, 1, 0);
      }
      u.cross(normal).normalize();

      v.crossVectors(normal, u).normalize();

      const projectedPoints: THREE.Vector2[] = [];
      for (const point of points) {
        const localPoint = new THREE.Vector3().subVectors(
          point,
          state.shapeCenter
        );
        const x = localPoint.dot(u);
        const y = localPoint.dot(v);
        projectedPoints.push(new THREE.Vector2(x, y));
      }

      return projectedPoints;
    }

    function createExtrudedGeometry(
      points: THREE.Vector3[],
      height: number,
      isClosed: boolean
    ): THREE.BufferGeometry {
      if (isClosed) {
        return createExtrudedVolume(points, height);
      } else {
        return createExtrudedRibbon(points, height);
      }
    }

    function createExtrudedVolume(
      points: THREE.Vector3[],
      height: number
    ): THREE.BufferGeometry {
      const projectedPoints = projectPointsToPlane(points);
      const shape = new THREE.Shape();

      if (points.length > 0) {
        shape.moveTo(projectedPoints[0].x, projectedPoints[0].y);
        for (let i = 1; i < projectedPoints.length; i++) {
          shape.lineTo(projectedPoints[i].x, projectedPoints[i].y);
        }
        shape.closePath();
      }

      const extrudeSettings = {
        depth: Math.abs(height),
        bevelEnabled: false,
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const normal = state.shapePlane.normal;

      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal.clone().normalize()
      );

      const position = state.shapeCenter.clone();
      if (height < 0) {
        position.add(normal.clone().multiplyScalar(height));
      }

      matrix.compose(position, quaternion, new THREE.Vector3(1, 1, 1));

      geometry.applyMatrix4(matrix);
      return geometry;
    }

    function createExtrudedRibbon(
      points: THREE.Vector3[],
      height: number
    ): THREE.BufferGeometry {
      const vertices: number[] = [];
      const indices: number[] = [];
      const normal = state.shapePlane.normal;
      const extrudeVector = normal.clone().multiplyScalar(height);

      for (let i = 0; i < points.length; i++) {
        const basePoint = points[i];
        const extrudedPoint = basePoint.clone().add(extrudeVector);

        vertices.push(basePoint.x, basePoint.y, basePoint.z);
        vertices.push(extrudedPoint.x, extrudedPoint.y, extrudedPoint.z);

        if (i < points.length - 1) {
          const baseIndex = i * 2;

          indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
          indices.push(baseIndex + 1, baseIndex + 2, baseIndex + 3);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      return geometry;
    }

    function updatePreview() {
      if (!state.selectedLine) return;

      const points = getPolylinePoints(state.selectedLine);
      const isClosed = isPolylineClosed(state.selectedLine);

      if (state.previewMesh) {
        scene.getScene().remove(state.previewMesh);
        state.previewMesh.geometry.dispose();
      }

      if (Math.abs(state.extrudeHeight) < 0.001) {
        state.previewMesh = null;
        return;
      }

      const geometry = createExtrudedGeometry(
        points,
        state.extrudeHeight,
        isClosed
      );

      const material = new THREE.MeshLambertMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.7,
        wireframe: true,
      });

      state.previewMesh = new THREE.Mesh(geometry, material);
      state.previewMesh.userData.isPreview = true;
      scene.getScene().add(state.previewMesh);
    }

    function finalizeExtrude() {
      if (!state.selectedLine || Math.abs(state.extrudeHeight) < 0.001) return;

      const points = getPolylinePoints(state.selectedLine);
      const isClosed = isPolylineClosed(state.selectedLine);
      const geometry = createExtrudedGeometry(
        points,
        state.extrudeHeight,
        isClosed
      );

      const material = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const mesh = new THREE.Mesh(geometry, material);

      const extrudeType = isClosed ? "Volume" : "Ribbon";
      mesh.name = `Extruded${extrudeType}_${Date.now()}`;

      mesh.userData.transformCenter = state.shapeCenter.clone();

      scene.addObject(mesh.name, mesh);

      console.log(
        `Created extruded ${extrudeType.toLowerCase()} from polyline`
      );
    }

    function cleanupPreview() {
      if (state.previewMesh) {
        scene.getScene().remove(state.previewMesh);
        state.previewMesh.geometry.dispose();
        state.previewMesh = null;
      }
    }

    let startY = 0;
    let initialHeight = 0;

    return [
      {
        events: [
          {
            type: "click",
            handler: (e: PointerEvent, next: () => void) => {
              const obj = getIntersectedObject(e);
              if (obj && obj instanceof THREE.Line) {
                state.selectedLine = obj;
                const points = getPolylinePoints(obj);
                calculateShapePlaneAndCenter(points);

                const isClosed = isPolylineClosed(obj);
                console.log(
                  `Selected ${
                    isClosed ? "closed" : "open"
                  } polyline for extrusion`
                );
                next();
              } else {
                console.log("Please select a polyline to extrude");
              }
            },
          },
        ],
      },
      {
        events: [
          {
            type: "pointermove",
            handler: (e: PointerEvent) => {
              if (!state.selectedLine) return;

              const currentY = e.clientY;

              if (startY === 0) {
                startY = currentY;
                initialHeight = state.extrudeHeight || 0;
              }

              const deltaPixels = startY - currentY;
              const worldHeightDelta = deltaPixels * 0.01;

              state.extrudeHeight = initialHeight + worldHeightDelta;

              console.log(`Extrude height: ${state.extrudeHeight.toFixed(2)}`);
              updatePreview();
            },
          },
          {
            type: "click",
            handler: (e: PointerEvent, next: () => void) => {
              finalizeExtrude();
              cleanupPreview();
              next();
            },
          },
        ],
      },
    ];
  },

  onFinish() {
    console.log("Extrude tool finished");
  },

  onCancel() {
    console.log("Extrude tool canceled");
    // Cleanup any preview when canceled
    const scene = SceneSingleton;
    if (scene) {
      scene.getScene().traverse((obj) => {
        if (obj.userData.isPreview) {
          scene.getScene().remove(obj);
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
          }
        }
      });
    }
  },
};
