import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useViewportStore } from "../state/viewportStore";

export default function MultiViewport() {
  const { size, gl, scene } = useThree();
  const {
    activeViewport,
    viewports,
    maximizedViewport,
    setArrayCamera,
    arrayCamera,
  } = useViewportStore();

  const previousSize = useRef({ width: 0, height: 0 });
  const viewportPositions = useMemo(
    () => [
      [0, size.height / 2],
      [size.width / 2, size.height / 2],
      [0, 0],
      [size.width / 2, 0],
    ],
    [size.width, size.height]
  );

  useEffect(() => {
    const width = size.width / 2;
    const height = size.height / 2;
    const aspect = width / height;

    const cameras = Object.values(viewports).map((view) => {
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

      // camera.up.set(...view.settings.cameraSettings.up);
      // camera.position.copy(view.settings.cameraSettings.position);
      return camera;
    });

    const newArrayCamera = new THREE.ArrayCamera(cameras);
    setArrayCamera(newArrayCamera);
  }, [viewports]);

  useEffect(() => {
    if (!arrayCamera) return;

    const { width, height } = size;

    if (
      width === previousSize.current.width &&
      height === previousSize.current.height
    ) {
      return;
    }

    previousSize.current = { width, height };

    const aspect = width / height;

    arrayCamera.cameras.forEach((camera) => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = aspect;
      } else if (camera instanceof THREE.OrthographicCamera) {
        camera.left = -5 * aspect;
        camera.right = 5 * aspect;
        camera.top = 5;
        camera.bottom = -5;
      }
      camera.updateProjectionMatrix();
    });
  }, [size, arrayCamera]);

  useFrame(() => {
    if (!arrayCamera) return;

    const fullWidth = size.width;
    const fullHeight = size.height;
    const halfWidth = fullWidth / 2;
    const halfHeight = fullHeight / 2;

    requestAnimationFrame(() => {
      if (maximizedViewport !== null) {
        gl.setViewport(0, 0, fullWidth, fullHeight);
        gl.setScissor(0, 0, fullWidth, fullHeight);
        gl.setScissorTest(true);
        gl.render(scene, arrayCamera.cameras[maximizedViewport]);
        return;
      }

      arrayCamera.cameras.forEach((cam, index) => {
        const [x, y] = viewportPositions[index];
        gl.setViewport(x, y, halfWidth, halfHeight);
        gl.setScissor(x, y, halfWidth, halfHeight);
        gl.setScissorTest(true);
        gl.render(scene, cam);
      });
    });
  });

  return null;
}
