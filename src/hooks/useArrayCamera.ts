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
      camera.up.set(...view.settings.cameraSettings.up);

      camera.position.copy(
        new THREE.Vector3(...view.settings.cameraSettings.position)
      );

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

      controls.minPolarAngle = -Infinity;
      controls.maxPolarAngle = Infinity;
      controls.azimuthRotateSpeed = 1;

      if (cam instanceof THREE.PerspectiveCamera) {
        controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
      }

      const camSettings = viewports[index].settings.cameraSettings;

      if (camSettings.position) {
        cam.position.copy(camSettings.position);
      }
      if (camSettings.target) {
        controls.setTarget(
          camSettings.target.x,
          camSettings.target.y,
          camSettings.target.z,
          false
        );
      }
      if (camSettings.up) {
        cam.up.set(...camSettings.up);
      }

      if (cam instanceof THREE.OrthographicCamera) {
        controls.zoomTo(camSettings.zoom, false);
      }

      controls.addEventListener("controlstart", () => {
        cam.userData.previousRotation = cam.quaternion.clone();
      });

      controls.addEventListener("controlend", () => {
        const position = new THREE.Vector3();
        controls.getPosition(position);
        const target = new THREE.Vector3();
        controls.getTarget(target);

        let zoom = null;
        const distance = controls.distance;

        if (cam instanceof THREE.OrthographicCamera) {
          zoom = cam.zoom;
        }

        setCameraMatrix(index, position, target, distance, zoom);
        cam.updateMatrixWorld();

        const previousRotation =
          cam.userData.previousRotation || cam.quaternion.clone();

        const camQuaternion = new THREE.Quaternion();
        cam.getWorldQuaternion(camQuaternion);

        previousRotation.normalize();
        camQuaternion.normalize();

        const rotationChanged = previousRotation.angleTo(camQuaternion) > 0.001;
        console.log(
          "Rotation Changed:",
          rotationChanged,
          "Angle:",
          previousRotation.angleTo(camQuaternion)
        );

        if (rotationChanged) {
          if (!viewports[index].isCustom) {
            setAsCustom(index);
          }
        }
      });

      controlsRef.current.push(controls);
    });
  }, [arrayCamera, gl, maximizedViewport, viewports]);

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
