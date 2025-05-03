import * as THREE from "three";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { useViewportStore } from "../state/viewportStore";
import { useArrayCamera } from "../hooks/useArrayCamera";
// import sceneInstance from "../state/Scene";

export default function CameraCtrls() {
  const { size, gl, scene } = useThree();
  const {
    activeViewport,
    previousViewport,
    setAsCustom,
    viewports,
    updateCamSettings,
    maximizedViewport,
    arrayCamera,
  } = useViewportStore();

  const controlsRef = useRef<Map<number, CameraControls>>(new Map());
  const [controlsMap, setControlsMap] = useState<Record<number, JSX.Element>>(
    {}
  );

  useEffect(() => {
    if (!arrayCamera || controlsRef.current.size === 0) return;

    controlsRef.current.forEach((controls, index) => {
      if (!controls) return;
      const camSettings = viewports[index].settings.cameraSettings;
      const camera = controls.camera;

      controls.setLookAt(
        camSettings.position.x,
        camSettings.position.y,
        camSettings.position.z,
        camSettings.target.x,
        camSettings.target.y,
        camSettings.target.z,
        false
      );

      camera.up.set(...camSettings.up);

      camera.zoom = camSettings.zoom;
      controls.zoomTo(camSettings.zoom, false);

      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    });
  }, [controlsMap, viewports, arrayCamera]);

  useEffect(() => {
    saveSettings(previousViewport);
  }, [previousViewport]);

  useEffect(() => {
    if (!arrayCamera) return;

    const newControls: Record<number, JSX.Element> = {};

    arrayCamera.cameras.forEach((cam: THREE.Camera, index: number) => {
      const camSettings = viewports[index].settings.cameraSettings;

      cam.position.copy(camSettings.position);
      cam.lookAt(camSettings.target);
      cam.zoom = camSettings.zoom;
      cam.up.set(...camSettings.up);

      cam.updateProjectionMatrix();
      cam.updateMatrixWorld();
      cam.userData.previousRotation = cam.quaternion.clone();
      //TODO: disable orbiting when mode is not "free" but keep pan and zoom
      newControls[index] = (
        <CameraControls
          key={index}
          ref={(ref) => {
            if (ref) {
              controlsRef.current.set(index, ref);
            }
          }}
          camera={cam}
          enabled={index === activeViewport}
          smoothTime={0}
          draggingSmoothTime={0}
          minPolarAngle={-Infinity}
          maxPolarAngle={Infinity}
          azimuthRotateSpeed={1}
          onEnd={() => checkCustomViewRotation(index)}
          dollyToCursor={cam instanceof THREE.PerspectiveCamera}
          truckSpeed={cam instanceof THREE.OrthographicCamera ? 1 : undefined}
          makeDefault
        />
      );
    });

    setControlsMap(newControls);
  }, [arrayCamera, viewports, activeViewport]);

  useFrame((_, delta) => {
    const activeControl = controlsRef.current.get(activeViewport);
    if (activeControl && activeControl.enabled) {
      activeControl.update(delta);
    }
  });

  const saveSettings = (index: number) => {
    const camera = arrayCamera?.cameras[index];
    const controls = controlsRef.current.get(index);
    if (!camera || !controls) return;

    const position = new THREE.Vector3();
    const target = new THREE.Vector3();
    controls.getPosition(position);
    controls.getTarget(target);

    updateCamSettings(index, { position, target, zoom: camera.zoom });
  };

  const checkCustomViewRotation = (index: number) => {
    const camera = arrayCamera?.cameras[index];
    if (!camera || !(camera instanceof THREE.OrthographicCamera)) return;

    if (!camera.userData.previousRotation) {
      camera.userData.previousRotation = camera.quaternion.clone();
      console.log(camera.userData.previousRotation);

      return;
    }

    const previousRotation = camera.userData.previousRotation;

    const camQuaternion = new THREE.Quaternion();
    camera.getWorldQuaternion(camQuaternion);

    previousRotation.normalize();
    camQuaternion.normalize();

    const rotationChanged = previousRotation.angleTo(camQuaternion) > 0.001;

    if (
      rotationChanged &&
      !viewports[index].isCustom &&
      camera instanceof THREE.OrthographicCamera
    ) {
      setAsCustom(index);
    }

    saveSettings(index);
  };

  return <>{arrayCamera && controlsMap[activeViewport]}</>;
}
