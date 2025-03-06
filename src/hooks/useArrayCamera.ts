import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useViewportStore } from "../state/viewportStore";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function useArrayCamera() {
  const { size, set, gl } = useThree();
  const { activeViewport, setAsCostum, viewports, setCameraMatrix } =
    useViewportStore();
  const controlsRef = useRef<OrbitControls[]>([]);

  const arrayCamera = useMemo(() => {
    const width = size.width / 2;
    const height = size.height / 2;
    const aspect = width / height;

    const cameras = [
      // new THREE.PerspectiveCamera(50, aspect, 0.1, 1000),
      // new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 1000),
      // new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 1000),
      // new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 1000),
    ];

    Object.values(viewports).forEach((view) => {
      const camera =
        view.settings.cameraType === "PerspectiveCamera"
          ? new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
          : new THREE.OrthographicCamera(
              -5 * aspect,
              5 * aspect,
              5,
              -5,
              0.1,
              1000
            );
      camera.applyMatrix4(view.settings.matrix);
      cameras.push(camera);
    });

    return new THREE.ArrayCamera(cameras);
  }, [size, viewports]);

  useEffect(() => {
    controlsRef.current.forEach((ctrl) => ctrl.dispose());
    controlsRef.current = [];

    arrayCamera.cameras.forEach((cam, index) => {
      const controls = new OrbitControls(cam, gl.domElement);
      controls.enabled = index === activeViewport;

      controls.addEventListener("end", () => {
        cam.updateMatrix();
        setCameraMatrix(index, cam.matrix.clone());

        if (!viewports[index].isCostum) {
          setAsCostum(index);
        }
        console.log(viewports[index]);
      });

      controlsRef.current.push(controls);
    });
  }, [arrayCamera, gl]);

  useEffect(() => {
    controlsRef.current.forEach((ctrl, index) => {
      ctrl.enabled = index === activeViewport;
    });
  }, [activeViewport]);

  return arrayCamera;
}
