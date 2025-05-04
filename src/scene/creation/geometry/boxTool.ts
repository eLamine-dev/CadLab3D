// boxTool.ts
import { CreationTool } from "../creationTypes";
import { getWorldPointFromMouse } from "../utils/projectionHelper";
import * as THREE from "three";
import sceneInstance from "../../Scene";
import { useViewportStore } from "../../../state/viewportStore";

export const boxTool: CreationTool = {
  getSteps() {
    const state = {
      baseCorner1: null as THREE.Vector3 | null,
      baseCorner2: null as THREE.Vector3 | null,
      height: 0,
      previewMesh: null as THREE.Mesh | null,
      viewportId: 0,
      drawingPlane: null as { normal: THREE.Vector3; up: THREE.Vector3 } | null,
    };

    return [
      {
        eventType: "pointerdown",
        onEvent: (e: MouseEvent) => {
          console.log(e);

          state.viewportId = useViewportStore.getState().activeViewport;
          // state.drawingPlane = getDrawingPlaneFromViewport(state.viewportId);
          state.baseCorner1 = getWorldPointFromMouse(e, state.viewportId);

          // state.previewMesh = new THREE.Mesh(
          //   new THREE.BoxGeometry(1, 1, 1),
          //   new THREE.MeshBasicMaterial({
          //     color: 0x00ff00,
          //     transparent: true,
          //     opacity: 0.7,
          //     wireframe: true,
          //   })
          // );

          console.log("point", state.baseCorner1);

          const redBox = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
          );

          redBox.position.set(
            state.baseCorner1.x,
            state.baseCorner1.y,
            state.baseCorner1.z
          );

          sceneInstance.getScene().add(redBox);
        },
      },

      {
        eventType: "mousemove",
        onEvent: (e: MouseEvent) => {
          console.log(e);
          if (!state.baseCorner1 || !state.previewMesh) return;

          state.baseCorner2 = getWorldPointFromMouse(e, state.viewportId);
          updateBasePreview(state);
        },
      },

      {
        eventType: "mouseup",
        onEvent: (e: MouseEvent) => {
          console.log(e);
          if (!state.previewMesh) return;

          state.previewMesh.material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
          });
        },
      },

      {
        eventType: "mousemove",
        onEvent: (e: MouseEvent) => {
          console.log(e);
          if (!state.baseCorner1 || !state.baseCorner2 || !state.previewMesh)
            return;

          const currentPoint = getWorldPointFromMouse(e, state.viewportId);
          state.height = calculateHeight(state, currentPoint);
          updateHeightPreview(state);
        },
      },

      {
        eventType: "click",
        onEvent: () => {
          if (!state.baseCorner1 || !state.baseCorner2 || !state.previewMesh)
            return;

          createFinalBox(state);
          cleanupPreview(state);
        },
      },
    ];
  },

  onFinish() {
    console.log("Box creation finished");
  },

  onCancel() {},
};

function updateBasePreview(state: any) {
  if (!state.previewMesh || !state.baseCorner1 || !state.baseCorner2) return;

  const width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
  const depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);

  state.previewMesh.scale.set(width, 0.001, depth);
  state.previewMesh.position.set(
    (state.baseCorner1.x + state.baseCorner2.x) / 2,
    state.baseCorner1.y,
    (state.baseCorner1.z + state.baseCorner2.z) / 2
  );
}

function calculateHeight(state: any, currentPoint: THREE.Vector3): number {
  if (state.drawingPlane?.normal.y === 1) {
    return currentPoint.y - state.baseCorner1.y;
  } else {
    const direction = currentPoint.clone().sub(state.baseCorner1);
    return direction.dot(
      state.drawingPlane?.normal || new THREE.Vector3(0, 1, 0)
    );
  }
}

function updateHeightPreview(state: any) {
  if (!state.previewMesh || !state.baseCorner1 || !state.baseCorner2) return;

  const width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
  const depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
  const height = Math.max(0.001, Math.abs(state.height));

  state.previewMesh.scale.set(width, height, depth);
  state.previewMesh.position.set(
    (state.baseCorner1.x + state.baseCorner2.x) / 2,
    state.baseCorner1.y + height / 2,
    (state.baseCorner1.z + state.baseCorner2.z) / 2
  );
}

function createFinalBox(state: any) {
  const width = Math.abs(state.baseCorner2.x - state.baseCorner1.x);
  const depth = Math.abs(state.baseCorner2.z - state.baseCorner1.z);
  const height = Math.abs(state.height);

  const center = new THREE.Vector3(
    (state.baseCorner1.x + state.baseCorner2.x) / 2,
    state.baseCorner1.y + height / 2,
    (state.baseCorner1.z + state.baseCorner2.z) / 2
  );

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  box.position.copy(center);

  sceneInstance.addObject(`Box_${Date.now()}`, box, [
    center.x,
    center.y,
    center.z,
  ]);
}

function cleanupPreview(state: any) {
  if (state.previewMesh) {
    sceneInstance.getScene().remove(state.previewMesh);
    state.previewMesh = null;
  }
}
