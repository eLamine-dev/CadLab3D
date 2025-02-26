import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";
import { useEffect, useState } from "react";

function CameraController({ cameraSettings }) {
  const { camera } = useThree();

  useEffect(() => {
    //   switch (currentView) {
    //     case "Perspective":
    //       camera.position.set(5, 5, 5);
    //       break;
    //     case "Top":
    //       camera.position.set(0, 10, 0);
    //       break;
    //     case "Front":
    //       camera.position.set(0, 0, 10);
    //       break;
    //     case "Left":
    //       camera.position.set(-10, 0, 0);
    //       break;
    //   }

    camera.position.set(cameraSettings.position);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [cameraSettings, camera]);

  return null;
}

export default function Viewport({ controls, defaultView }) {
  const [currentView, setCurrentView] = useState(defaultView);
  return (
    <>
      <div className="controls">
        <label>Camera View: </label>
        <select
          onChange={(e) => setCurrentView(e.target.value)}
          value={currentView}
        >
          <option value="Perspective">Perspective</option>
          <option value="Top">Top</option>
          <option value="Front">Front</option>
          <option value="Left">Left</option>
        </select>
      </div>
      <Canvas>
        <CameraController cameraSettings={currentView} />
        <Scene />
        {controls && <OrbitControls />}
      </Canvas>
    </>
  );
}
