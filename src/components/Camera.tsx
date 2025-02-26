import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useCameraStore } from "../state/cameraStore";

function CameraController({ cameraType, viewportId, maximized }) {
  const { camera, size } = useThree();
  const saveCameraState = useCameraStore((state) => state.saveCameraState);
  const getCameraState = useCameraStore((state) => state.getCameraState);

  useEffect(() => {
    const savedState = getCameraState(viewportId);

    if (savedState && savedState.position && savedState.rotation) {
      camera.position.copy(savedState.position);
      camera.rotation.copy(savedState.rotation);
      camera.zoom = savedState.zoom;
    } else {
      // Fallback to default positions
      const cameraPositions = {
        Perspective: [5, 5, 5],
        Top: [0, 10, 0],
        Front: [0, 0, 10],
        Left: [-10, 0, 0],
      };

      if (cameraPositions[cameraType]) {
        camera.position.set(...cameraPositions[cameraType]);
        camera.lookAt(0, 0, 0);
      }
    }

    camera.updateProjectionMatrix();
  }, [cameraType, maximized]);

  useEffect(() => {
    return () => {
      if (camera.position && camera.rotation) {
        saveCameraState(viewportId, {
          position: camera.position.clone(),
          rotation: camera.rotation.clone(),
          zoom: camera.zoom,
        });
      }
    };
  }, [camera, viewportId]);

  return null;
}

export default CameraController;
