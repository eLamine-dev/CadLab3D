import { useEffect, useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import sceneInstance from "../state/Scene";
import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";

export default function TransformCtrls({ setDragging }) {
  const { gl } = useThree();
  const { activeViewport } = useViewportStore();
  const { arrayCamera } = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];
  const scene = sceneInstance.getScene();

  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
    null
  );
  const transformControlsRef = useRef(null);

  useEffect(() => {
    if (!activeCamera || !gl) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      if (!activeCamera) return;

      const canvas = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - canvas.left) / canvas.width) * 2 - 1;
      mouse.y = -((event.clientY - canvas.top) / canvas.height) * 2 + 1;

      activeCamera.updateMatrixWorld();
      activeCamera.updateProjectionMatrix();

      raycaster.setFromCamera(mouse, activeCamera);
      let intersects = raycaster.intersectObjects(scene.children, true);

      // Exclude grid helpers
      intersects = intersects.filter(
        (obj) => !(obj.object instanceof THREE.GridHelper)
      );

      console.log(intersects); // Debugging selection

      if (intersects.length > 0) {
        setSelectedObject(intersects[0].object);
      } else {
        setSelectedObject(null);
      }
    };

    gl.domElement.addEventListener("click", onPointerDown);
    return () => {
      gl.domElement.removeEventListener("click", onPointerDown);
    };
  }, []);

  return (
    <>
      {selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          object={selectedObject}
          mode="translate"
          camera={activeCamera}
          enabled={!!selectedObject}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onChange={() => selectedObject.updateMatrixWorld()}
        />
      )}
    </>
  );
}
