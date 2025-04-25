import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSelectionStore } from "../state/selectionStore";
import { useViewportStore } from "../state/viewportStore";

export default function ObjectSelection() {
  const { gl, scene } = useThree();
  const { activeViewport, arrayCamera } = useViewportStore();

  const [activeCamera, setActiveCamera] = useState<THREE.Camera | null>(null);

  useEffect(() => {
    if (!arrayCamera) return;
    const camera = arrayCamera.cameras[activeViewport];
    if (camera) setActiveCamera(camera);
  }, [arrayCamera, activeViewport]);

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const downTime = useRef<number>(0);
  const downPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [hovered, setHovered] = useState<THREE.Object3D | null>(null);
  const [originalColor, setOriginalColor] = useState<THREE.Color | null>(null);

  const canvas = gl.domElement;

  // const getIntersections = (event: MouseEvent) => {
  //   const bounds = canvas.getBoundingClientRect();
  //   const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  //   const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  //   mouse.current.set(x, y);

  //   raycaster.current.setFromCamera(mouse.current, activeCamera);
  //   return raycaster.current
  //     .intersectObjects(scene.children, true)
  //     .filter((o) => o.object instanceof THREE.Mesh);
  // };

  const getIntersections = (event: MouseEvent) => {
    const bounds = canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    mouse.current.set(x, y);

    if (!activeCamera) return null;

    activeCamera.updateMatrixWorld();
    raycaster.current.setFromCamera(mouse.current, activeCamera);

    const selectables = [];

    scene.traverse((obj) => {
      if (
        obj instanceof THREE.Mesh &&
        !obj.userData.nonSelectable &&
        obj.type !== "TransformControlsPlane"
      ) {
        selectables.push(obj);
      }
    });

    const intersects = raycaster.current.intersectObjects(selectables, true);
    console.log(intersects);

    for (const hit of intersects) {
      const obj = hit.object;
      if (
        obj instanceof THREE.Mesh &&
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
      if (hit.object !== hovered) {
        if (hovered && originalColor) {
          const prevMesh = hovered as THREE.Mesh;
          if (prevMesh.material) {
            (prevMesh.material as any).color.copy(originalColor);
          }
        }

        const newMesh = hit.object as THREE.Mesh;
        if (newMesh.material) {
          setOriginalColor((newMesh.material as any).color.clone());
          newMesh.material.color.set(0xffffff);
        }

        setHovered(hit.object);
      }
    } else {
      if (hovered && originalColor) {
        const mesh = hovered as THREE.Mesh;
        if (mesh.material) {
          mesh.material.color.copy(originalColor);
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
