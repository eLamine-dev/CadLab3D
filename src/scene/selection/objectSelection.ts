// src/scene/selection/objectPicker.ts
import * as THREE from "three";
import { useSelectionStore } from "../../state/selectionStore";
import { getIntersectedObject } from "./getIntersectedObject";
// import sceneInstance from "../Scene";
import { useViewportStore } from "../../state/viewportStore";

let hovered: THREE.Object3D | null = null;
let originalColor: THREE.Color | null = null;
let downTime = 0;
let downPosition = { x: 0, y: 0 };

export function objectSelection() {
  const canvas = this.getCanvas();
  const scene = this.getScene();

  if (!canvas || !scene) return;

  function handlePointerMove(e: MouseEvent) {
    const obj = getIntersectedObject(e);

    if (obj !== hovered) {
      if (hovered && originalColor) {
        const mat = (hovered as any).material;
        if (mat?.color) mat.color.copy(originalColor);
      }

      if (obj && (obj as any).material?.color) {
        originalColor = (obj as any).material.color.clone();
        (obj as any).material.color.set(0xffffff);
      } else {
        originalColor = null;
      }

      hovered = obj;
      useSelectionStore.getState().setHovered(obj);
    }
  }

  function handlePointerDown(e: MouseEvent) {
    downTime = performance.now();
    downPosition = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp(e: MouseEvent) {
    const dt = performance.now() - downTime;
    const dx = Math.abs(e.clientX - downPosition.x);
    const dy = Math.abs(e.clientY - downPosition.y);
    const smallDrag = dx < 3 && dy < 3;
    const quickClick = dt < 250;

    if (!smallDrag || !quickClick) return;

    // const obj = getIntersectedObject(e, scene, camera, canvas);

    if (hovered) {
      const isMulti = e.ctrlKey || e.metaKey;
      useSelectionStore.getState().toggleSelected(hovered, isMulti);
    } else {
      useSelectionStore.getState().clear();
    }
  }

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointerup", handlePointerUp);

  return () => {
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointerup", handlePointerUp);
  };
}
