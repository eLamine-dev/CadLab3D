import { use, useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { useViewportStore } from "../state/viewportStore";
import { useSelectionStore } from "../state/selectionStore";
import { TransformControls as ThreeTransformControls } from "three/addons/controls/TransformControls.js";

export default function TransformControlsComponent() {
  const { scene } = useThree();
  const { activeViewport, arrayCamera } = useViewportStore();
  const transformRef = useRef<ThreeTransformControls>(null);
  const [activeCamera, setActiveCamera] = useState<THREE.Camera | null>(null);
  const selectedObjects = useSelectionStore((state) => state.selected);
  const selectedObject = selectedObjects[0] ?? null;
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );

  useEffect(() => {
    if (!arrayCamera) return;
    const camera = arrayCamera.cameras[activeViewport];
    if (!camera) return;
    setActiveCamera(camera);
  }, [arrayCamera, activeViewport]);

  useEffect(() => {
    if (!transformRef.current || !selectedObject || !activeCamera) return;

    const obj = scene.getObjectById(selectedObject.id);
    if (!obj) return;

    let center = new THREE.Vector3();
    if (obj.userData.transformCenter) {
      center = obj.userData.transformCenter.clone();
      transformRef.current.position.copy(center);
    } else {
      transformRef.current.position.copy(selectedObject.position);
    }

    transformRef.current.updateMatrixWorld();
    // transformRef.current.update();
  }, [selectedObject, activeCamera, scene]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t") setMode("translate");
      if (e.key === "r") setMode("rotate");
      // if (e.key === "s") setMode("scale");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {selectedObject && activeCamera && (
        <TransformControls
          ref={transformRef}
          object={scene.getObjectById(selectedObject.id)}
          mode={mode}
          camera={activeCamera}
          translationSnap={0.05}
          rotationSnap={THREE.MathUtils.degToRad(5)}
        />
      )}
    </>
  );
}
