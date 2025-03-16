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
    setAsCustom,
    viewports,
    updateCamSettings,
    maximizedViewport,
  } = useViewportStore();
  const controlsRef = useRef<CameraControls[]>([]);

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
      cam.zoom = camSettings.zoom;
      cam.lookAt(camSettings.target);
      cam.updateProjectionMatrix();
      return cam;
    });

    return new THREE.ArrayCamera(cameras);
  }, [size, viewports]);

  const [forceUpdate, setForceUpdate] = useState(0);

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

  // useEffect(() => {
  //   return () => {
  //     // console.log("Disposing old controls after state update...");
  //     controlsRef.current.forEach((ctrl) => {
  //       if (ctrl) ctrl.dispose();
  //     });
  //     controlsRef.current = [];
  //   };
  // }, [activeViewport]);

  useEffect(() => {
    if (controlsRef.current.length === 0) {
      console.log("Waiting for controls to initialize...");
      setForceUpdate((prev) => prev + 1);

      return;
    }

    try {
      controlsRef.current.forEach((control, index) => {
        const camera = arrayCamera.cameras[index];
        if (!camera) {
          return;
        }

        const position = new THREE.Vector3();
        control.getPosition(position);
        const target = new THREE.Vector3();
        control.getTarget(target);
        const storedZoom = viewports[index].settings.cameraSettings.zoom;
        const storedPosition =
          viewports[index].settings.cameraSettings.position;
        console.log(camera.zoom);
        if (camera.zoom !== storedZoom) {
          console.log("zzoom saved");

          updateCamSettings(index, { zoom: camera.zoom });
        } else if (!position.equals(storedPosition)) {
          updateCamSettings(index, { position, target });
        }

        console.log(viewports[index].settings.cameraSettings);
      });
    } catch (error) {
      console.error("❌ Error inside forEach loop:", error);
    }

    return () => {
      // console.log("Disposing old controls after state update...");
      controlsRef.current.forEach((ctrl) => {
        if (ctrl) ctrl.dispose();
      });
      controlsRef.current = [];
    };
  }, [activeViewport, forceUpdate]);

  useEffect(() => {
    arrayCamera.cameras.forEach((cam, index) => {
      const controls = controlsRef.current[index];

      if (!controls) return;
      // controls.enabled = index === activeViewport;
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

      if (cam.zoom !== camSettings.zoom) {
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

        const distance = controls.distance;

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
  }, [arrayCamera, gl, viewports, forceUpdate]);

  useFrame((_, delta) => {
    controlsRef.current.forEach((ctrl) => ctrl.update(delta));
  });
  //--------------------------------

  return (
    <>
      {/* <primitive object={arrayCamera} /> */}
      {arrayCamera.cameras.map((cam, index) => (
        <CameraControls
          key={index}
          ref={(el) => {
            if (el) controlsRef.current[index] = el;
          }}
          camera={cam}
          enabled={index === activeViewport}
          smoothTime={0}
          draggingSmoothTime={0}
          minPolarAngle={-Infinity}
          maxPolarAngle={Infinity}
          azimuthRotateSpeed={1}
          // mouseButtons={{
          //   wheel: THREE.ACTION.DOLLY,
          // }}
          dollyToCursor={cam instanceof THREE.PerspectiveCamera}
          truckSpeed={cam instanceof THREE.PerspectiveCamera ? undefined : 1}
        />
      ))}
    </>
  );
}
