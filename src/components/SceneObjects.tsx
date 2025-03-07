import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import * as THREE from "three";
import sceneInstance from "../state/Scene";
import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";
import { useSimulatedMouse } from "../hooks/useSimulatedMouse"; // ✅ Import Hook

export default function SceneObjects() {
  const { gl, size } = useThree();
  const { activeViewport, maximizedViewport } = useViewportStore();
  const arrayCamera = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];

  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
    null
  );
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(
    null
  );
  const [originalColor, setOriginalColor] = useState<THREE.Color | null>(null);
  const [transformControls, setTransformControls] =
    useState<TransformControls | null>(null);

  useSimulatedMouse();

  useEffect(() => {
    if (!activeCamera || !gl) return;

    if (!transformControls) {
      const controls = new TransformControls(activeCamera, gl.domElement);
      sceneInstance.getScene().add(controls);
      setTransformControls(controls);

      controls.addEventListener("dragging-changed", (event) => {
        controls.enabled = !event.value;
      });

      return () => {
        sceneInstance.getScene().remove(controls);
        controls.dispose();
      };
    }
  }, [activeCamera, gl]);

  useEffect(() => {
    if (transformControls && selectedObject) {
      transformControls.attach(selectedObject);
    } else if (transformControls) {
      transformControls.detach();
    }
  }, [selectedObject]);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (event: MouseEvent) => {
      if (!activeCamera) return;

      mapMouseToViewport(event);

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
          if (hoveredObject && originalColor) {
            (hoveredObject as THREE.Mesh).material.color.copy(originalColor);
          }

          setHoveredObject(hovered);
          setOriginalColor((hovered as THREE.Mesh).material.color.clone());

          (hovered as THREE.Mesh).material.color.set(0xff0000);
        }
      } else {
        if (hoveredObject && originalColor) {
          (hoveredObject as THREE.Mesh).material.color.copy(originalColor);
          setHoveredObject(null);
          setOriginalColor(null);
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [
    activeCamera,
    size,
    activeViewport,
    maximizedViewport,
    hoveredObject,
    originalColor,
    gl,
  ]);

  return null;
}
