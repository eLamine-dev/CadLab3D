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
  getSteps(scene: SceneSingleton) {
    const state = {
      objectA: null as THREE.Mesh | null,
      objectB: null as THREE.Mesh | null,
      operation: "SUBTRACTION" as keyof typeof OPERATION_MAP,
    };

    function applyBoolan() {
      const { objectA, objectB, operation } = state;

      if (!objectA || !objectB) {
        console.warn("Boolean operation requires two valid mesh operands.");
        return;
      }

      try {
        const brushA = new Brush(objectA.geometry.clone());
        const brushB = new Brush(objectB.geometry.clone());

        brushA.matrix.copy(objectA.matrixWorld);
        brushA.matrixAutoUpdate = false;
        brushA.updateMatrixWorld();

        brushB.matrix.copy(objectB.matrixWorld);
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
        result.position.set(0, 0, 0);

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
              applyBoolan();
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
