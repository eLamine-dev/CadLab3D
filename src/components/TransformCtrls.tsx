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

  const [activeCamera, setActiveCamera] = useState(null);

  useEffect(() => {
    if (!arrayCamera) return;

    const camera = arrayCamera.cameras[activeViewport];
    if (!camera) return;
    setActiveCamera(camera);
  }, [arrayCamera, activeViewport]);

  const transformControlsRef = useRef<ThreeTransformControls | null>(null);

  const selectedObjects = useSelectionStore((state) => state.selected);
  const selectedObject = selectedObjects[0] ?? null;

  const transformMode = useRef<"translate" | "rotate" | "scale">("translate");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t") transformMode.current = "translate";
      if (e.key === "r") transformMode.current = "rotate";
      if (e.key === "s") transformMode.current = "scale";
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          visible={!!selectedObject}
          object={scene.getObjectById(selectedObject.id)}
          mode={transformMode.current}
          camera={activeCamera}
          translationSnap={0.05}
          rotationSnap={THREE.MathUtils.degToRad(5)}
        />
      )}
    </>
  );
}
