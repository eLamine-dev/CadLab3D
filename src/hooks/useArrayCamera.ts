// import * as THREE from "three";
// import { useEffect, useMemo, useRef } from "react";
// import { useThree, useFrame } from "@react-three/fiber";
// import { useViewportStore } from "../state/viewportStore";
// import CameraControls from "camera-controls";

// // CameraControls.install({ THREE });

// export function useArrayCamera() {
//   const { size, gl, scene } = useThree();
//   const {
//     activeViewport,
//     setAsCustom,
//     viewports,
//     maximizedViewport,
//     updateCamSettings,
//   } = useViewportStore();

//   const controlsRef = useRef<CameraControls[]>([]);

//   const arrayCamera = useMemo(() => {
//     const width = size.width / 2;
//     const height = size.height / 2;
//     const aspect = width / height;

//     const cameras = Object.values(viewports).map((view) => {
//       const camera =
//         view.settings.cameraType === "PerspectiveCamera"
//           ? new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
//           : new THREE.OrthographicCamera(
//               -5 * aspect,
//               5 * aspect,
//               5,
//               -5,
//               0.1,
//               1000
//             );

//       camera.up.set(...view.settings.cameraSettings.up);
//       camera.position.copy(view.settings.cameraSettings.position);
//       return camera;
//     });

//     return new THREE.ArrayCamera(cameras);
//   }, [size]);

//   return { arrayCamera };
// }
