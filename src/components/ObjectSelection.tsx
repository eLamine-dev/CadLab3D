import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSelectionStore } from "../state/selectionStore";
import { useViewportStore } from "../state/viewportStore";

//TODO: need to be shut down on creation mode
export default function ObjectSelection() {
  const { gl, scene } = useThree();
  const { activeViewport, arrayCamera } = useViewportStore();

  const [activeCamera, setActiveCamera] = useState<THREE.Camera | null>(null);

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const downTime = useRef<number>(0);
  const downPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [hovered, setHovered] = useState<THREE.Object3D | null>(null);
  const [originalColor, setOriginalColor] = useState<THREE.Color | null>(null);

  const canvas = gl.domElement;

  const getIntersections = (event: MouseEvent) => {
    const bounds = canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    mouse.current.set(x, y);

    if (!activeCamera) return null;

    activeCamera.updateMatrixWorld();
    raycaster.current.setFromCamera(mouse.current, activeCamera);

    //TODO: need a better way , kind of innefficient
    const selectables = [];

    scene.traverse((obj) => {
      if (
        !obj.userData.nonSelectable &&
        obj.type !== "TransformControlsPlane"
      ) {
        selectables.push(obj);
      }
    });

    raycaster.current.params.Line.threshold = 0.2;
    const intersects = raycaster.current.intersectObjects(selectables, true);

    for (const hit of intersects) {
      const obj = hit.object;
      if (
        (obj instanceof THREE.Mesh || obj instanceof THREE.Line) &&
        obj.visible &&
        !obj.userData.nonSelectable &&
        obj.type !== "TransformControlsPlane"
      ) {
        return hit;
      }
    }

    return null;
  };

  const handlePointerMove = (event: MouseEvent) => {
    const hit = getIntersections(event);

    if (hit) {
      const obj = hit.object;

      if (obj !== hovered) {
        if (hovered && originalColor) {
          const prevMaterial = (hovered as any).material;
          if (prevMaterial && prevMaterial.color) {
            prevMaterial.color.copy(originalColor);
          }
        }

        const newMaterial = (obj as any).material;
        if (newMaterial && newMaterial.color) {
          setOriginalColor(newMaterial.color.clone());
          newMaterial.color.set(0xffffff);
        }

        setHovered(obj);
      }
    } else {
      if (hovered && originalColor) {
        const mat = (hovered as any).material;
        if (mat && mat.color) {
          mat.color.copy(originalColor);
        }
      }
      setHovered(null);
      setOriginalColor(null);
    }
  };

  const handlePointerDown = (event: MouseEvent) => {
    downTime.current = performance.now();
    downPosition.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: MouseEvent) => {
    const dt = performance.now() - downTime.current;
    const dx = Math.abs(event.clientX - downPosition.current.x);
    const dy = Math.abs(event.clientY - downPosition.current.y);

    const smallDrag = dx < 3 && dy < 3;
    const quickClick = dt < 250;

    if (!smallDrag || !quickClick) return;

    // const hits = getIntersections(event);
    // const clicked = hits[0]?.object;

    if (hovered) {
      const isMulti = event.ctrlKey || event.metaKey;
      useSelectionStore.getState().toggleSelected(hovered, isMulti);
    } else {
      useSelectionStore.getState().clear();
    }
  };

  useEffect(() => {
    if (!arrayCamera) return;
    const camera = arrayCamera.cameras[activeViewport];
    if (camera) setActiveCamera(camera);
  }, [arrayCamera, activeViewport]);

  useEffect(() => {
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [canvas, hovered, originalColor, activeCamera]);

  return null;
}
