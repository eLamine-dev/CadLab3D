import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { useViewportStore } from "../state/viewportStore";
import sceneInstance from "../state/Scene";

export default function CameraCtrls() {
  const { size, gl } = useThree();
  const {
    activeViewport,
    previousViewport,
    setAsCustom,
    viewports,
    updateCamSettings,
    maximizedViewport,
  } = useViewportStore();

  const controlsRef = useRef<Map<number, CameraControls>>(new Map());
  const [controlsMap, setControlsMap] = useState<Record<number, JSX.Element>>(
    {}
  );

  const arrayCamera = useMemo(() => {
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

      camera.up.set(...view.settings.cameraSettings.up);
      camera.position.copy(view.settings.cameraSettings.position);
      return camera;
    });

    return new THREE.ArrayCamera(cameras);
  }, [size, viewports]);

  useEffect(() => {
    controlsRef.current.forEach((control, index) => {
      const camera = control.camera;
      const position = new THREE.Vector3();
      control.getPosition(position);
      const target = new THREE.Vector3();
      control.getTarget(target);
      const storedZoom = viewports[index].settings.cameraSettings.zoom;
      const storedPosition = viewports[index].settings.cameraSettings.position;
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      if (
        camera.zoom !== storedZoom &&
        camera instanceof THREE.OrthographicCamera
      ) {
        updateCamSettings(index, {
          zoom: camera.zoom,
        });
      } else if (
        !position.equals(storedPosition) &&
        camera instanceof THREE.PerspectiveCamera
      ) {
        updateCamSettings(index, {
          position,
          target,
        });
      }
    });
  }, [maximizedViewport, activeViewport]);

  useEffect(() => {
    controlsRef.current.forEach((controls, index) => {
      if (!controls) return;
      const camSettings = viewports[index].settings.cameraSettings;
      // controls.camera.updateProjectionMatrix();
      // controls.camera.updateMatrixWorld();

      controls.setPosition(
        camSettings.position.x,
        camSettings.position.y,
        camSettings.position.z,
        false
      );

      controls.setTarget(
        camSettings.target.x,
        camSettings.target.y,
        camSettings.target.z,
        false
      );

      controls.camera.zoom = camSettings.zoom;
      // controls.zoomTo(camSettings.zoom, false);
    });
  }, [controlsMap, activeViewport]);

  useEffect(() => {
    const newControls: Record<number, JSX.Element> = {};

    arrayCamera.cameras.forEach((cam, index) => {
      const camSettings = viewports[index].settings.cameraSettings;

      cam.position.copy(camSettings.position);
      cam.lookAt(camSettings.target);
      // cam.zoom = camSettings.zoom;
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld();

      newControls[index] = (
        <CameraControls
          key={index}
          ref={(el) => {
            if (el) controlsRef.current.set(index, el);
          }}
          camera={cam}
          enabled={index === activeViewport}
          smoothTime={0}
          draggingSmoothTime={0}
          minPolarAngle={-Infinity}
          maxPolarAngle={Infinity}
          azimuthRotateSpeed={1}
          dollyToCursor={cam instanceof THREE.PerspectiveCamera}
          truckSpeed={cam instanceof THREE.OrthographicCamera ? 1 : undefined}
          onEnd={() => saveSettings(index)}
          zoom={camSettings.zoom}
        />
      );
    });

    setControlsMap(newControls);
  }, [arrayCamera, viewports]);

  useFrame((_, delta) => {
    controlsRef.current.forEach((ctrl) => ctrl.update(delta));
  });

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
        gl.render(
          sceneInstance.getScene(),
          arrayCamera.cameras[activeViewport]
        );
        return;
      }

      arrayCamera.cameras.forEach((cam, index) => {
        const [x, y] = viewportPositions[index];
        gl.setViewport(x, y, halfWidth, halfHeight);
        gl.setScissor(x, y, halfWidth, halfHeight);
        gl.setScissorTest(true);
        gl.render(sceneInstance.getScene(), cam);
      });
    });
  });

  const saveSettings = (index: number) => {
    // const camera = arrayCamera.cameras[index];
    // const controls = controlsRef.current.get(index);
    // if (!camera || !controls) return;

    // const position = new THREE.Vector3();
    // const target = new THREE.Vector3();
    // controls.getPosition(position);
    // controls.getTarget(target);

    // updateCamSettings(index, { position, target, zoom: camera.zoom });

    controlsRef.current.forEach((control, index) => {
      const camera = control.camera;
      const position = new THREE.Vector3();
      control.getPosition(position);
      const target = new THREE.Vector3();
      control.getTarget(target);
      const storedZoom = viewports[index].settings.cameraSettings.zoom;
      const storedPosition = viewports[index].settings.cameraSettings.position;
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();

      updateCamSettings(index, {
        position,
        target,
        zoom: camera.zoom,
      });
    });

    // const previousRotation =
    //   camera.userData.previousRotation || camera.quaternion.clone();
    // const camQuaternion = new THREE.Quaternion();
    // camera.getWorldQuaternion(camQuaternion);
    // previousRotation.normalize();
    // camQuaternion.normalize();

    // if (
    //   previousRotation.angleTo(camQuaternion) > 0.001 &&
    //   !viewports[index].isCustom &&
    //   camera instanceof THREE.OrthographicCamera
    // ) {
    //   setAsCustom(index);
    // }
  };

  useFrame((_, delta) => {
    controlsRef.current.forEach((ctrl) => ctrl.update(delta));
  });

  return <>{Object.values(controlsMap)}</>;
}
