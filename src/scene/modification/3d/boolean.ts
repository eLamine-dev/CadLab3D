import * as THREE from "three";
import {
  Evaluator,
  Brush,
  ADDITION,
  SUBTRACTION,
  REVERSE_SUBTRACTION,
  INTERSECTION,
  DIFFERENCE,
} from "three-bvh-csg";
import SceneSingleton from "../../Scene";
import { getIntersectedObject } from "../../selection/getIntersectedObject";

const OPERATION_MAP = {
  ADDITION,
  SUBTRACTION,
  REVERSE_SUBTRACTION,
  INTERSECTION,
  DIFFERENCE,
};

export const booleanTool: Tool = {
  getSteps() {
    const state = {
      objectA: null as THREE.Mesh | null,
      objectB: null as THREE.Mesh | null,
      operation: "SUBTRACTION" as keyof typeof OPERATION_MAP,
    };

    function applyBoolean() {
      const { objectA, objectB, operation } = state;
      if (!objectA || !objectB) {
        console.warn("Boolean operation requires two valid mesh operands.");
        return;
      }

      try {
        const brushA = new Brush(objectA.geometry.clone());
        const brushB = new Brush(objectB.geometry.clone());

        brushA.geometry.applyMatrix4(objectA.matrixWorld);
        brushB.geometry.applyMatrix4(objectB.matrixWorld);

        brushA.matrix.identity();
        brushA.matrixAutoUpdate = false;
        brushA.updateMatrixWorld();

        brushB.matrix.identity();
        brushB.matrixAutoUpdate = false;
        brushB.updateMatrixWorld();

        const evaluator = new Evaluator();
        const resultBrush = evaluator.evaluate(
          brushA,
          brushB,
          OPERATION_MAP[operation]
        );

        const result = new THREE.Mesh(
          resultBrush.geometry,
          objectA.material.clone()
        );

        result.name = `booleanResult_${Date.now()}`;

        // Add to scene
        SceneSingleton?.addObject(result.name, result);

        console.log("Boolean operation completed:", operation);
      } catch (err) {
        console.error("Boolean operation failed:", err);
      }
    }

    return [
      {
        events: [
          {
            type: "click",
            handler: (e: PointerEvent, next: () => void) => {
              const obj = getIntersectedObject(e);
              if (obj && obj instanceof THREE.Mesh) {
                state.objectA = obj;
              }
              console.log(
                "Boolean operation started with objectA:",
                state.objectA
              );
              next();
            },
          },
        ],
      },
      {
        events: [
          {
            type: "click",
            handler: (e: PointerEvent, next: () => void) => {
              const obj = getIntersectedObject(e);
              if (obj && obj instanceof THREE.Mesh) {
                state.objectB = obj;
              }
              console.log(
                "Boolean operation with objectB:",
                state.objectB?.name
              );
            },
          },
          {
            type: "click",
            handler: (e: PointerEvent, next: () => void) => {
              applyBoolean();
              next();
            },
          },
        ],
      },
    ];
  },
  onFinish() {
    console.log("Boolean operation finished.");
  },
  onCancel() {
    console.log("Boolean operation canceled.");
  },
};
