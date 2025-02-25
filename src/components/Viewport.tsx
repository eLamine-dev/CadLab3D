import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";
import { useEffect } from "react";

export function Viewport({ cameraType, controls }) {
  const { camera } = useThree();

  useEffect(() => {
    switch (cameraType) {
      case "Perspective":
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        break;
      case "Top":
        camera.position.set(0, 10, 0);
        camera.lookAt(0, 0, 0);
        break;
      case "Front":
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        break;
      case "Left":
        camera.position.set(-10, 0, 0);
        camera.lookAt(0, 0, 0);
        break;
    }
    camera.updateProjectionMatrix();
  }, [cameraType, camera]);

  return (
    <Canvas>
      <Scene />
      {controls && <OrbitControls />}
    </Canvas>
  );
}
