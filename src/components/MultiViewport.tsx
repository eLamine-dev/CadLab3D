import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import sceneInstance from "../state/Scene";
import { useViewportStore } from "../state/viewportStore";
import { useEffect, useMemo, useRef } from "react";
import CameraControls from "camera-controls";
import { useArrayCamera } from "../hooks/useArrayCamera";

export default function MultiViewport() {
  const { size, gl, scene } = useThree();
  const { activeViewport, maximizedViewport } = useViewportStore();

  const { arrayCamera } = useArrayCamera();

  useFrame(() => {
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

    requestAnimationFrame(() => {
      if (maximizedViewport !== null) {
        gl.setViewport(0, 0, fullWidth, fullHeight);
        gl.setScissor(0, 0, fullWidth, fullHeight);
        gl.setScissorTest(true);
        gl.render(scene, arrayCamera.cameras[activeViewport]);
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

  //   useEffect(() => {
  //     if (controlsRef.current.length == 0) return;
  //     controlsRef.current.forEach((control, index) => {
  //       const camera = control.camera;
  //       const position = new THREE.Vector3();
  //       control.getPosition(position);
  //       const target = new THREE.Vector3();
  //       control.getTarget(target);
  //       const storedZoom = viewports[index].settings.cameraSettings.zoom;
  //       const storedPosition = viewports[index].settings.cameraSettings.position;
  //       if (camera.zoom !== storedZoom) {
  //         updateCamSettings(index, {
  //           zoom: camera.zoom,
  //         });
  //       } else if (position !== storedPosition) {
  //         updateCamSettings(index, {
  //           position,
  //           target,
  //         });
  //       }
  //       camera.updateMatrixWorld();
  //       camera.updateProjectionMatrix();
  //     });
  //   }, [maximizedViewport, activeViewport]);

  //   useEffect(() => {
  //     controlsRef.current.forEach((ctrl) => ctrl.dispose());
  //     controlsRef.current = [];

  //     arrayCamera.cameras.forEach((cam, index) => {
  //       const controls = new CameraControls(cam, gl.domElement);
  //       controls.enabled = index === activeViewport;
  //       controls.smoothTime = 0;
  //       controls.draggingSmoothTime = 0;

  //       controls.minPolarAngle = -Infinity;
  //       controls.maxPolarAngle = Infinity;
  //       controls.azimuthRotateSpeed = 1;

  //       if (cam instanceof THREE.PerspectiveCamera) {
  //         controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
  //         controls.dollyToCursor = true;
  //       } else {
  //         controls.truckSpeed = 1;
  //       }

  //       const camSettings = viewports[index].settings.cameraSettings;

  //       if (camSettings.position) {
  //         cam.position.copy(camSettings.position);
  //       }
  //       if (camSettings.target) {
  //         controls.setTarget(
  //           camSettings.target.x,
  //           camSettings.target.y,
  //           camSettings.target.z,
  //           false
  //         );
  //       }

  //       controls.zoomTo(camSettings.zoom, false);

  //       controls.addEventListener("controlstart", () => {
  //         cam.userData.previousRotation = cam.quaternion.clone();
  //       });

  //       controls.addEventListener("controlend", () => {
  //         const position = new THREE.Vector3();
  //         controls.getPosition(position);
  //         const target = new THREE.Vector3();
  //         controls.getTarget(target);

  //         const distance = controls.distance;

  //         cam.updateProjectionMatrix();
  //         cam.updateMatrixWorld();

  //         updateCamSettings(index, {
  //           position,
  //           target,
  //           distance,
  //           zoom: cam.zoom,
  //         });

  //         const previousRotation =
  //           cam.userData.previousRotation || cam.quaternion.clone();

  //         const camQuaternion = new THREE.Quaternion();
  //         cam.getWorldQuaternion(camQuaternion);

  //         previousRotation.normalize();
  //         camQuaternion.normalize();

  //         const rotationChanged = previousRotation.angleTo(camQuaternion) > 0.001;

  //         if (
  //           rotationChanged &&
  //           !viewports[index].isCustom &&
  //           cam instanceof THREE.OrthographicCamera
  //         ) {
  //           setAsCustom(index);
  //         }
  //       });

  //       controlsRef.current.push(controls);
  //     });
  //   }, [arrayCamera, gl, maximizedViewport, viewports, activeViewport]);

  //   useEffect(() => {
  //     controlsRef.current.forEach((ctrl, index) => {
  //       ctrl.enabled = enabled && index === activeViewport;
  //     });
  //   }, [activeViewport, enabled]);

  //   useFrame((_, delta) => {
  //     controlsRef.current.forEach((ctrl) => ctrl.update(delta));
  //   });

  return null;
}
