import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useViewportStore } from "../state/viewportStore";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function useArrayCamera() {
  const { size, set, gl } = useThree();
  const { activeViewport, cameraMatrices, viewports, setCameraMatrix } =
    useViewportStore();
  const controlsRef = useRef<OrbitControls[]>([]);

  const arrayCamera = useMemo(() => {
    const width = size.width / 2;
    const height = size.height / 2;
    const aspect = width / height;

    const cameras = [
      new THREE.PerspectiveCamera(50, aspect, 0.1, 1000),
      new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 1000),
      new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 1000),
      new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 1000),
    ];

    cameras.forEach((cam, index) => {
      cam.applyMatrix4(viewports[index].settings.martix);
    });

    // cameras.forEach((cam) => cam.lookAt(0, 0, 0));

    return new THREE.ArrayCamera(cameras);
  }, [size]);

  useEffect(() => {
    controlsRef.current.forEach((ctrl) => ctrl.dispose());
    controlsRef.current = [];

    arrayCamera.cameras.forEach((cam, index) => {
      const controls = new OrbitControls(cam, gl.domElement);
      controls.enabled = index === activeViewport;

      controls.addEventListener("end", () => {
        cam.updateMatrix();
        setCameraMatrix(index, cam.matrix.clone());
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
