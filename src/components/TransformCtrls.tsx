import { use, useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { useViewportStore } from "../state/viewportStore";
import { useSelectionStore } from "../state/selectionStore";
import { TransformControls as ThreeTransformControls } from "three/addons/controls/TransformControls.js";

export default function TransformControlsComponent() {
  const { scene, raycaster } = useThree();
  const { activeViewport, arrayCamera } = useViewportStore();

  const transformRef = useRef<any>(null);
  const [activeCamera, setActiveCamera] = useState(null);

  const selectedObjects = useSelectionStore((state) => state.selected);
  const selectedObject = selectedObjects[0] ?? null;

  const [mode, setMode] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );

  // useEffect(() => {
  //   if (!transformRef.current || !selectedObject) return;

  //   transformRef.current.traverse((child) => {
  //     child.layers.set(1);
  //   });

  // Set up layers for controls and object
  // transformRef.current.layers.set(1);
  // scene.getObjectById(selectedObject.id)?.layers.set(1);
  //   activeCamera.layers.enable(1);
  // }, [selectedObject, activeCamera, scene]);

  // useEffect(() => {
  //   arrayCamera?.cameras.forEach((cam, index) => {
  //     cam.layers.enableAll();
  //     if (index === activeViewport) {
  //       cam.layers.enable(1);
  //     } else {
  //       // cam.layers.disable(1);
  //     }
  //   });
  // }, [activeCamera]);

  useEffect(() => {
    if (!arrayCamera) return;

    const camera = arrayCamera.cameras[activeViewport];
    if (!camera) return;
    setActiveCamera(camera);
  }, [arrayCamera, activeViewport]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t") setMode("translate");
      if (e.key === "r") setMode("rotate");
      if (e.key === "s") setMode("scale");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {selectedObject && (
        <TransformControls
          ref={transformRef}
          visible={!!selectedObject}
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
