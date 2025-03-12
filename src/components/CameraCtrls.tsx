import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { useViewportStore } from "../state/viewportStore";
import sceneInstance from "../state/Scene";

export default function CameraCtrls() {
  const { size, gl } = useThree();
  const {
    activeViewport,
    setAsCustom,
    viewports,
    updateCamSettings,
    maximizedViewport,
  } = useViewportStore();
  const controlsRef = useRef<CameraControls[]>([]);
  console.log(controlsRef.current);

  const arrayCamera = useMemo(() => {
    const width = size.width / 2;
    const height = size.height / 2;
    const aspect = width / height;

    const cameras = Object.values(viewports).map((view) => {
      const cam =
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

      const camSettings = view.settings.cameraSettings;
      cam.position.copy(camSettings.position);
      cam.lookAt(camSettings.target);
      cam.updateProjectionMatrix();
      return cam;
    });

    return new THREE.ArrayCamera(cameras);
  }, [size, viewports]);

  useEffect(() => {
    const activeCam = arrayCamera.cameras[activeViewport];
    if (activeCam) {
      activeCam.updateProjectionMatrix();
      activeCam.updateMatrixWorld();
    }
  }, [activeViewport, arrayCamera]);

  //-----------------------------
  useEffect(() => {
    arrayCamera.cameras.forEach((cam, index) => {
      const controls = controlsRef.current[index];
      controls.enabled = index === activeViewport;
      controls.smoothTime = 0;
      controls.draggingSmoothTime = 0;

      controls.minPolarAngle = -Infinity;
      controls.maxPolarAngle = Infinity;
      controls.azimuthRotateSpeed = 1;

      if (cam instanceof THREE.PerspectiveCamera) {
        // controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
        controls.dollyToCursor = true;
      } else {
        controls.truckSpeed = 1;
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

      controls.zoomTo(camSettings.zoom, false);

      controls.addEventListener("controlstart", () => {
        cam.userData.previousRotation = cam.quaternion.clone();
      });

      controls.addEventListener("controlend", () => {
        const position = new THREE.Vector3();
        controls.getPosition(position);
        const target = new THREE.Vector3();
        controls.getTarget(target);

        const distance = controls.distance;

        cam.updateProjectionMatrix();
        cam.updateMatrixWorld();

        updateCamSettings(index, {
          position,
          target,
          distance,
          zoom: cam.zoom,
        });

        const previousRotation =
          cam.userData.previousRotation || cam.quaternion.clone();

        const camQuaternion = new THREE.Quaternion();
        cam.getWorldQuaternion(camQuaternion);

        previousRotation.normalize();
        camQuaternion.normalize();

        const rotationChanged = previousRotation.angleTo(camQuaternion) > 0.001;

        if (
          rotationChanged &&
          !viewports[index].isCustom &&
          cam instanceof THREE.OrthographicCamera
        ) {
          setAsCustom(index);
        }
      });
    });
  }, [arrayCamera, gl, maximizedViewport, viewports, activeViewport]);

  useEffect(() => {
    controlsRef.current.forEach((control, index) => {
      const camera = control.camera;
      const position = new THREE.Vector3();
      control.getPosition(position);
      const target = new THREE.Vector3();
      control.getTarget(target);
      const storedZoom = viewports[index].settings.cameraSettings.zoom;
      const storedPosition = viewports[index].settings.cameraSettings.position;
      if (camera.zoom !== storedZoom) {
        updateCamSettings(index, {
          zoom: camera.zoom,
        });
      } else if (position !== storedPosition) {
        updateCamSettings(index, {
          position,
          target,
        });
      }
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
    });
  }, [maximizedViewport, activeViewport]);

  useFrame((_, delta) => {
    controlsRef.current.forEach((ctrl) => ctrl.update(delta));
  });
  //--------------------------------
  useFrame(() => {
    if (!arrayCamera) return;

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

  return (
    <>
      <primitive object={arrayCamera} />
      {arrayCamera.cameras.map((cam, index) => (
        <CameraControls
          key={index}
          ref={(el) => {
            controlsRef.current[index] = el;
          }}
          camera={cam}
          enabled={index === activeViewport}
          smoothTime={0}
          draggingSmoothTime={0}
          minPolarAngle={-Infinity}
          maxPolarAngle={Infinity}
          azimuthRotateSpeed={1}
          // mouseButtons={{
          //   wheel:
          //     cam instanceof THREE.PerspectiveCamera
          //       ? CameraControls.ACTION.DOLLY
          //       : undefined,
          // }}

          dollyToCursor={cam instanceof THREE.PerspectiveCamera}
          truckSpeed={cam instanceof THREE.PerspectiveCamera ? undefined : 1}
          // onEnd={(e) => {
          //   const position = new THREE.Vector3();
          //   controlsRef.current[index].getPosition(position);
          //   const target = new THREE.Vector3();
          //   controlsRef.current[index].getTarget(target);
          //   const distance = controlsRef.current[index].distance;
          //   cam.updateProjectionMatrix();
          //   cam.updateMatrixWorld();
          //   updateCamSettings(index, {
          //     position,
          //     target,
          //     distance,
          //     zoom: cam.zoom,
          //   });

          //   const previousRotation =
          //     cam.userData.previousRotation || cam.quaternion.clone();
          //   const camQuaternion = new THREE.Quaternion();
          //   cam.getWorldQuaternion(camQuaternion);

          //   previousRotation.normalize();
          //   camQuaternion.normalize();
          //   const rotationChanged =
          //     previousRotation.angleTo(camQuaternion) > 0.001;

          //   if (
          //     rotationChanged &&
          //     !viewports[index].isCustom &&
          //     cam instanceof THREE.OrthographicCamera
          //   ) {
          //     setAsCustom(index);
          //   }
          // }}
        />
      ))}
    </>
  );
}
