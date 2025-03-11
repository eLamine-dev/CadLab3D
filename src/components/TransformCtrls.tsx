import { useEffect, useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import sceneInstance from "../state/Scene";
import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";

export default function TransformControlsComponent() {
  const { gl } = useThree();
  const { activeViewport } = useViewportStore();
  const { arrayCamera } = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];
  const scene = sceneInstance.getScene();

  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
    null
  );
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");

  const transformControlsRef = useRef<THREE.Object3D | null>(null);

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

      let intersects = raycaster.intersectObjects(
        sceneInstance.getScene().children,
        true
      );
      intersects = intersects.filter(
        (obj) => !(obj.object instanceof THREE.GridHelper)
      );

      console.log(intersects);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t") setTransformMode("translate");
      if (e.key === "r") setTransformMode("rotate");
      if (e.key === "s") setTransformMode("scale");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!selectedObject || !transformControlsRef.current) return;

    scene.add(transformControlsRef.current);
    return () => {
      scene.remove(transformControlsRef.current);
    };
  }, [selectedObject]);

  // useEffect(() => {
  //   if (transformControlsRef.current) {
  //     transformControlsRef.current.visible = !!selectedObject;
  //   }
  // }, [selectedObject]);

  return (
    <>
      {selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          object={selectedObject}
          mode={transformMode}
          camera={activeCamera}
          // onMouseDown={(e) => e.preventDefault()}

          onChange={() => selectedObject.updateMatrixWorld()}
        />
      )}
    </>
  );
}
