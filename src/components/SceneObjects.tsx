import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import * as THREE from "three";
import sceneInstance from "../state/Scene";
import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";

export default function SceneObjects() {
  const { gl } = useThree();
  const { activeViewport } = useViewportStore();
  const arrayCamera = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];

  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
    null
  );
  const [transformControls, setTransformControls] =
    useState<TransformControls | null>(null);

  useEffect(() => {
    if (!activeCamera || !gl) return;

    if (!transformControls) {
      const controls = new TransformControls(activeCamera, gl.domElement);
      sceneInstance.getScene().add(controls);
      setTransformControls(controls);

      // Disable OrbitControls while dragging
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

    const onPointerDown = (event) => {
      if (!activeCamera) return;

      if (maximizedViewport !== null) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, activeCamera);

        const sceneChildren = sceneInstance.getScene().children;
        console.log("Scene children:", sceneChildren);

        let intersects = raycaster.intersectObjects(sceneChildren, true);
        intersects = intersects.filter(
          (obj) => !(obj.object instanceof THREE.GridHelper)
        );

        console.log("Raycast Intersects:", intersects);

        if (intersects.length > 0) {
          console.log("Selected Object:", intersects[0].object);
          setSelectedObject(intersects[0].object);
        } else {
          console.log("No Object Selected");
          setSelectedObject(null);
        }
      } else {
        const fullWidth = size.width;
        const fullHeight = size.height;
        const halfWidth = fullWidth / 2;
        const halfHeight = fullHeight / 2;

        const viewportPositions = [
          [0, halfHeight],
          [halfWidth, halfHeight],
          [0, 0],
          [halfWidth, 0],
        ];

        const [x, y] = viewportPositions[activeViewport];

        const viewportX = event.clientX - x;
        const viewportY = event.clientY - y;

        mouse.x = (viewportX / halfWidth) * 2 - 1;
        mouse.y = -(viewportY / halfHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, activeCamera);
        let intersects = raycaster.intersectObjects(
          sceneInstance.getScene().children,
          true
        );

        intersects = intersects.filter(
          (obj) => !(obj.object instanceof THREE.GridHelper)
        );

        console.log("Viewport:", activeViewport, "Mouse:", mouse);
        console.log("Raycast Intersects:", intersects);

        if (intersects.length > 0) {
          console.log("Selected Object:", intersects[0].object);
          setSelectedObject(intersects[0].object);
        } else {
          console.log("No Object Selected");
          setSelectedObject(null);
        }
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [activeCamera]);

  return null;
}
