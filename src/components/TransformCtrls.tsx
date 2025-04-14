import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";
import { useSelectionStore } from "../state/selectionStore";

export default function TransformControlsComponent({ setDragging }) {
  const { gl, scene } = useThree();
  const { activeViewport } = useViewportStore();
  const { arrayCamera } = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];

  const transformControlsRef = useRef<THREE.Object3D | null>(null);

  const selectedObjects = useSelectionStore((state) => state.selected);
  const selectedObject = selectedObjects[0] ?? null; // You can change this if you want multi-object control

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

  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.visible = !!selectedObject;
    }
  }, [selectedObject]);

  return (
    <>
      {selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          object={scene.getObjectById(selectedObject.id)}
          mode={transformMode.current}
          camera={activeCamera}
          onPointerDown={() => setDragging?.(true)}
          onPointerUp={() => setDragging?.(false)}
        />
      )}
    </>
  );
}
