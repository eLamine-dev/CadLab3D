import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSelectionStore } from "../state/selectionStore";
import { useViewportStore } from "../state/viewportStore";
import { useArrayCamera } from "./useArrayCamera";

export const useObjectInteraction = () => {
  const { gl, scene } = useThree();
  const { activeViewport } = useViewportStore();
  const { arrayCamera } = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [hovered, setHovered] = useState<THREE.Object3D | null>(null);
  const [originalColor, setOriginalColor] = useState<THREE.Color | null>(null);

  useEffect(() => {
    if (!gl || !activeCamera) return;

    const canvas = gl.domElement;

    const getIntersections = (event: MouseEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      mouse.current.set(x, y);
      activeCamera.updateMatrixWorld();
      activeCamera.updateProjectionMatrix();
      raycaster.current.setFromCamera(mouse.current, activeCamera);

      return raycaster.current
        .intersectObjects(scene.children, true)
        .filter((o) => !(o.object instanceof THREE.GridHelper));
    };

    const handlePointerMove = (event: MouseEvent) => {
      const hits = getIntersections(event);
      if (hits.length > 0) {
        const hit = hits[0].object;
        if (hit !== hovered) {
          if (hovered && originalColor) {
            const prevMesh = hovered as THREE.Mesh;
            if (prevMesh.material) {
              (prevMesh.material as any).color.copy(originalColor);
            }
          }

          const newMesh = hit as THREE.Mesh;
          if (newMesh.material) {
            setOriginalColor((newMesh.material as any).color.clone());
            newMesh.material.color.set(0xffffff);
          }

          setHovered(hit);
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

    const handleClick = (event: MouseEvent) => {
      const hits = getIntersections(event);
      if (hits.length > 0) {
        const isMulti = event.ctrlKey || event.metaKey;
        const selected = hits[0].object;
        useSelectionStore.getState().toggleSelected(selected, isMulti);
      } else {
        useSelectionStore.getState().setSelected([]);
      }
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [gl, activeCamera, hovered, originalColor, scene]);
};
