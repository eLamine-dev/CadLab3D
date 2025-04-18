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

      camera.zoom = camSettings.zoom;
      controls.zoomTo(camSettings.zoom, false);

      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    });
  }, [controlsMap, viewports, arrayCamera]);

  useEffect(() => {
    if (!arrayCamera) return;

    const newControls: Record<number, JSX.Element> = {};

    arrayCamera.cameras.forEach((cam: THREE.Camera, index) => {
      const camSettings = viewports[index].settings.cameraSettings;

      cam.position.copy(camSettings.position);
      cam.lookAt(camSettings.target);
      cam.zoom = camSettings.zoom;
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld();

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
          dollyToCursor={cam instanceof THREE.PerspectiveCamera}
          truckSpeed={cam instanceof THREE.OrthographicCamera ? 1 : undefined}
          makeDefault
          onEnd={() => saveSettings(index)}
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
    const camera = arrayCamera.cameras[index];
    const controls = controlsRef.current.get(index);
    if (!camera || !controls) return;

    const position = new THREE.Vector3();
    const target = new THREE.Vector3();
    controls.getPosition(position);
    controls.getTarget(target);

    updateCamSettings(index, { position, target, zoom: camera.zoom });

    if (!camera.userData.previousRotation) {
      camera.userData.previousRotation = camera.quaternion.clone();
    }

    const previousRotation = camera.userData
      .previousRotation as THREE.Quaternion;
    const camQuaternion = new THREE.Quaternion();
    camera.getWorldQuaternion(camQuaternion);

    previousRotation.normalize();
    camQuaternion.normalize();

    if (
      previousRotation.angleTo(camQuaternion) > 0.001 &&
      !viewports[index].isCustom &&
      camera instanceof THREE.OrthographicCamera
    ) {
      setAsCustom(index);
    }
    camera.userData.previousRotation = camQuaternion.clone();
  };

  return <>{controlsMap[activeViewport]}</>;
}
// export default function CameraCtrls() {
//   const { size, gl, scene } = useThree();
//   const {
//     activeViewport,
//     previousViewport,
//     setAsCustom,
//   viewports,
//   updateCamSettings,
//   maximizedViewport,
//   arrayCamera,
// } = useViewportStore();

// const controlsRef = useRef<Map<number, CameraControls>>(new Map());
// const [controlsMap, setControlsMap] = useState<Record<number, JSX.Element>>(
//   {}
// );

//   useEffect(() => {
//     controlsRef.current.forEach((control, index) => {
//       const camera = control.camera;
//       camera.updateProjectionMatrix();
//       camera.updateMatrixWorld();
//       const position = new THREE.Vector3();
//       control.getPosition(position);
//       const target = new THREE.Vector3();
//       control.getTarget(target);
//       const storedZoom = viewports[index].settings.cameraSettings.zoom;
//       const storedPosition = viewports[index].settings.cameraSettings.position;
//       // if (
//       //   camera.zoom !== storedZoom &&
//       //   camera instanceof THREE.OrthographicCamera
//       // ) {
//       //   updateCamSettings(index, {
//       //     zoom: camera.zoom,
//       //   });
//       // }

//       // if (
//       //   !position.equals(storedPosition)
//       //   // &&
//       //   // camera instanceof THREE.PerspectiveCamera
//       // ) {
//       //   updateCamSettings(index, {
//       //     position,
//       //     target,
//       //   });
//       // }

//       updateCamSettings(index, {
//         zoom: camera.zoom,
//         position,
//         target,
//       });
//     });
//   }, [maximizedViewport, activeViewport]);

//   useEffect(() => {
//     controlsRef.current.forEach((controls, index) => {
//       if (!controls) return;
//       const camSettings = viewports[index].settings.cameraSettings;

//       controls.setLookAt(
//         camSettings.position.x,
//         camSettings.position.y,
//         camSettings.position.z,
//         camSettings.target.x,
//         camSettings.target.y,
//         camSettings.target.z,
//         false
//       );

//       controls.camera.lookAt(camSettings.target);

//       controls.camera.zoom = camSettings.zoom;
//       controls.zoomTo(camSettings.zoom, false);

//       controls.camera.updateProjectionMatrix();
//       controls.camera.updateMatrixWorld();
//       // controls.updateCameraUp();
//     });
//   }, [controlsMap]);

//   useEffect(() => {
//     if (!arrayCamera) return;

//     const newControls: Record<number, JSX.Element> = {};

//     arrayCamera.cameras.forEach((cam: THREE.Camera, index) => {
//       const camSettings = viewports[index].settings.cameraSettings;

//       cam.position.copy(camSettings.position);
//       cam.lookAt(camSettings.target);

//       cam.zoom = camSettings.zoom;
//       cam.updateMatrixWorld();

//       newControls[index] = (
//         <CameraControls
//           key={index}
//           ref={(ref) => {
//             if (ref) {
//               controlsRef.current.set(index, ref);
//             }
//           }}
//           camera={cam}
//           enabled={true}
//           smoothTime={0}
//           draggingSmoothTime={0}
//           minPolarAngle={-Infinity}
//           maxPolarAngle={Infinity}
//           azimuthRotateSpeed={1}
//           dollyToCursor={cam instanceof THREE.PerspectiveCamera}
//           truckSpeed={cam instanceof THREE.OrthographicCamera ? 1 : undefined}
//           makeDefault
//           onEnd={() => saveSettings(index)}
//         />
//       );
//     });

//     setControlsMap(newControls);
//   }, [arrayCamera, viewports]);

//   // useEffect(() => {
//   //   controlsRef.current.forEach((ctrl) => {
//   //     ctrl.enabled = false;
//   //   });
//   // }, [enabled]);

//   useFrame((_, delta) => {
//     controlsRef.current.forEach((ctrl) => ctrl.update(delta));
//   });

//   const saveSettings = (index: number) => {
//     const camera = arrayCamera.cameras[index];
//     const controls = controlsRef.current.get(index);
//     if (!camera || !controls) return;
//     const position = new THREE.Vector3();
//     const target = new THREE.Vector3();
//     controls.getPosition(position);
//     controls.getTarget(target);
//     updateCamSettings(index, { position, target, zoom: camera.zoom });
//     controlsRef.current.forEach((control, index) => {
//       const camera = control.camera;
//       camera.updateProjectionMatrix();
//       camera.updateMatrixWorld();
//       const position = new THREE.Vector3();
//       control.getPosition(position);
//       const target = new THREE.Vector3();
//       control.getTarget(target);
//       const storedZoom = viewports[index].settings.cameraSettings.zoom;
//       const storedPosition = viewports[index].settings.cameraSettings.position;
//       updateCamSettings(index, {
//         position,
//         target,
//         zoom: camera.zoom,
//       });
//     });
//     const previousRotation =
//       camera.userData.previousRotation || camera.quaternion.clone();
//     const camQuaternion = new THREE.Quaternion();
//     camera.getWorldQuaternion(camQuaternion);
//     previousRotation.normalize();
//     camQuaternion.normalize();
//     if (
//       previousRotation.angleTo(camQuaternion) > 0.001 &&
//       !viewports[index].isCustom &&
//       camera instanceof THREE.OrthographicCamera
//     ) {
//       setAsCustom(index);
//     }
//   };

//   return <>{controlsMap[activeViewport]}</>;
// }
