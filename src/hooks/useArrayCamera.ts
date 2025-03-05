import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useViewportStore } from "../state/viewportStore";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function useArrayCamera() {
  const { size, set, gl } = useThree();
  const { activeViewport } = useViewportStore();
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

    cameras[0].position.set(5, 5, 5);
    cameras[1].position.set(0, 10, 0);
    cameras[2].position.set(0, 0, 10);
    cameras[3].position.set(-10, 0, 0);

    cameras[1].up.set(0, 0, -1);
    cameras[2].up.set(0, 1, 0);
    cameras[3].up.set(0, 1, 0);

    cameras.forEach((cam) => cam.lookAt(0, 0, 0));

    return new THREE.ArrayCamera(cameras);
  }, [size]);

  useEffect(() => {
    controlsRef.current.forEach((ctrl) => ctrl.dispose());
    controlsRef.current = [];

    arrayCamera.cameras.forEach((cam, index) => {
      const controls = new OrbitControls(cam, gl.domElement);
      // controls.enableDamping = true;
      // controls.dampingFactor = 0.05;
      // controls.screenSpacePanning = false;
      // controls.maxPolarAngle = Math.PI / 2;
      controls.enabled = `viewport${index}` === activeViewport;

      controlsRef.current.push(controls);
    });
  }, [arrayCamera, gl]);

  useFrame(() => {
    controlsRef.current.forEach((ctrl) => ctrl.update());
  });

  useEffect(() => {
    controlsRef.current.forEach((ctrl, index) => {
      ctrl.enabled = `viewport${index}` === activeViewport;
    });
  }, [activeViewport]);

  // useEffect(() => {
  //   set({ camera: arrayCamera });
  // }, [arrayCamera, set]);

  return arrayCamera;
}
