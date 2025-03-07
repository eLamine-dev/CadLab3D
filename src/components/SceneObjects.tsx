import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import sceneInstance from "../state/Scene";
import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";

export default function SceneObjects() {
  const { gl } = useThree();
  const { activeViewport, maximizedViewport } = useViewportStore();
  const { arrayCamera } = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];

  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
    null
  );
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(
    null
  );
  const [originalColor, setOriginalColor] = useState<THREE.Color | null>(null);

  useEffect(() => {
    if (!activeCamera || !gl) return;

    const raycaster = new THREE.Raycaster();
    console.log(raycaster);

    const mouse = new THREE.Vector2();

    const onPointerMove = (event: MouseEvent) => {
      if (!activeCamera) return;

      const canvas = gl.domElement.getBoundingClientRect();
      const canvasX = event.clientX - canvas.left;
      const canvasY = event.clientY - canvas.top;

      let x, y;
      const viewports = [
        { x: 0, y: 0 }, // Top-left
        { x: 0.5, y: 0 }, // Top-right
        { x: 0, y: 0.5 }, // Bottom-left
        { x: 0.5, y: 0.5 }, // Bottom-right
      ];

      if (maximizedViewport === null) {
        const viewport = viewports[activeViewport];
        x = ((canvasX - viewport.x * canvas.width) * 2) / canvas.width;
        y = ((canvasY - viewport.y * canvas.height) * 2) / canvas.height;
      } else {
        x = canvasX / canvas.width;
        y = canvasY / canvas.height;
      }

      mouse.x = x * 2 - 1;
      mouse.y = -(y * 2 - 1);

      activeCamera.updateMatrixWorld();
      activeCamera.updateProjectionMatrix();
      raycaster.setFromCamera(mouse, activeCamera);

      let intersects = raycaster.intersectObjects(
        sceneInstance.getScene().children,
        true
      );
      intersects = intersects.filter(
        (obj) => !(obj.object instanceof THREE.GridHelper)
      );

      if (intersects.length > 0) {
        const hovered = intersects[0].object;

        if (hovered !== hoveredObject) {
          if (hoveredObject) {
            const prevMesh = hoveredObject as THREE.Mesh;
            if (prevMesh.material && originalColor) {
              prevMesh.material.color.copy(originalColor);
            }
          }

          const hoveredMesh = hovered as THREE.Mesh;
          if (hoveredMesh.material) {
            setOriginalColor(hoveredMesh.material.color.clone());
            hoveredMesh.material.color.set(0xffffff);
          }

          setHoveredObject(hovered);
        }
      } else {
        if (hoveredObject) {
          const prevMesh = hoveredObject as THREE.Mesh;
          if (prevMesh.material && originalColor) {
            prevMesh.material.color.copy(originalColor);
          }
          setHoveredObject(null);
          setOriginalColor(null);
        }
      }
    };

    gl.domElement.addEventListener("pointermove", onPointerMove);
    return () => {
      gl.domElement.removeEventListener("pointermove", onPointerMove);
    };
  }, [activeCamera, hoveredObject, originalColor, gl]);

  return null;
}
