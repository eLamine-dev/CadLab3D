import { use, useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { useViewportStore } from "../state/viewportStore";
import { useSelectionStore } from "../state/selectionStore";
import { TransformControls as ThreeTransformControls } from "three/addons/controls/TransformControls.js";
import { useFeatureStore } from "../state/featureStore";

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
    if (!selectedObject) return;
    if (selectedObject.userData.instance?.editMode == false) {
      selectedObject.userData.instance?.showCtrlPoints();
      selectedObject.userData.instance.editMode = true;
    }

    // return () => {
    //   if (selectedObject.userData.instance) {
    //     selectedObject.userData.instance.editMode = false;
    //     selectedObject.userData.instance.hideCtrlPoints();
    //   }
    // };
  }, [selectedObject]);

  // useEffect(() => {
  //   if (!selectedObject) return;
  //   selectedObject.userData.instance?.showCtrlPoints();
  // }, [selectedObject]);

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
      const center = new THREE.Vector3();
      selectedObject.geometry.computeBoundingBox();
      selectedObject.geometry.boundingBox?.getCenter(center);
      transformRef.current.position.copy(center);
    }

    // transformRef.current.updateMatrixWorld();
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

  function handleObjectChange() {
    console.log("handling", selectedObject);

    if (selectedObject instanceof THREE.Sprite) {
      selectedObject.updateMatrixWorld();
      const point = new THREE.Vector3();
      selectedObject.getWorldPosition(point);
      selectedObject.userData.onUpdate(point);
    }
  }

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
          onObjectChange={handleObjectChange}
        />
      )}
    </>
  );
}
