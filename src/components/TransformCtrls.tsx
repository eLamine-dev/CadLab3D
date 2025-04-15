import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";
import { useSelectionStore } from "../state/selectionStore";
import { TransformControls as ThreeTransformControls } from "three/addons/controls/TransformControls.js";
import { log } from "three/tsl";

export default function TransformControlsComponent({
  onDragStart,
  onDragEnd,
}: {
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const { gl, scene } = useThree();
  const { activeViewport } = useViewportStore();
  const { arrayCamera } = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];

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

  useEffect(() => {
    const controls = transformControlsRef.current;
    if (!controls || !selectedObject) return;

    const handleChange = (e: { value: boolean }) => {
      console.log("event", e.value);

      if (e.value) {
        onDragStart?.();
      } else {
        onDragEnd?.();
      }
    };

    controls.addEventListener("dragging-changed", handleChange);
    return () => {
      controls.removeEventListener("dragging-changed", handleChange);
    };
  }, [selectedObject, onDragStart, onDragEnd]);

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
          visible={!!selectedObject}
          object={scene.getObjectById(selectedObject.id)}
          mode={transformMode.current}
          camera={activeCamera}
          // onMouseDown={() => {
          //   onDragStart?.();
          // }}
          // onMouseUp={() => {
          //   onDragEnd?.();
          // }}
        />
      )}
    </>
  );
}
