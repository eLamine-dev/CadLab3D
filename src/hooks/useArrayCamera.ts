import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useViewportStore } from "../state/viewportStore";
import CameraControls from "camera-controls"; // ✅ Use CameraControls

CameraControls.install({ THREE });

export function useArrayCamera() {
  const { size, set, gl } = useThree();
  const {
    activeViewport,
    setAsCustom,
    viewports,
    setCameraMatrix,
    maximizedViewport,
  } = useViewportStore();

  const controlsRef = useRef<CameraControls[]>([]);

  const arrayCamera = useMemo(() => {
    const width = size.width / 2;
    const height = size.height / 2;
    const aspect = width / height;
    const cameras = [];

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

      // camera.applyMatrix4(view.settings.matrix);
      if (view.settings.cameraSettings.position) {
        camera.position.copy(
          new THREE.Vector3(...view.settings.cameraSettings.position)
        );
      }
      cameras.push(camera);
    });

    return new THREE.ArrayCamera(cameras);
  }, [size, viewports]);

  useEffect(() => {
    controlsRef.current.forEach((ctrl) => ctrl.dispose());
    controlsRef.current = [];

    arrayCamera.cameras.forEach((cam, index) => {
      const controls = new CameraControls(cam, gl.domElement);
      controls.enabled = index === activeViewport;
      controls.smoothTime = 0;
      controls.draggingSmoothTime = 0;

      const camSettings = viewports[index].settings.cameraSettings;

      if (camSettings.position) {
        cam.position.copy(new THREE.Vector3(...camSettings.position));
      }
      if (camSettings.target) {
        controls.setTarget(
          camSettings.target.x,
          camSettings.target.y,
          camSettings.target.z,
          false
        );
      }

      if (cam instanceof THREE.OrthographicCamera) {
        controls.zoomTo(camSettings.zoom, false);
      }
      // if (cam instanceof THREE.OrthographicCamera && camSettings.distance) {
      //   controls.dollyTo(camSettings.distance, false);
      // }

      controls.addEventListener("controlend", () => {
        const position = new THREE.Vector3();
        controls.getPosition(position);
        const target = new THREE.Vector3();
        controls.getTarget(target);
        const distance = controls.distance;

        let zoom = null;
        if (cam instanceof THREE.OrthographicCamera) {
          zoom = cam.zoom;
        }
        setCameraMatrix(index, position, target, distance, zoom);
        if (!viewports[index].isCustom) {
          setAsCustom(index);
        }
      });

      controlsRef.current.push(controls);
    });
  }, [arrayCamera, gl, maximizedViewport]);

  useEffect(() => {
    controlsRef.current.forEach((ctrl, index) => {
      ctrl.enabled = index === activeViewport;
    });
  }, [activeViewport]);

  useFrame((_, delta) => {
    controlsRef.current.forEach((ctrl) => ctrl.update(delta));
  });

  return { arrayCamera };
}
