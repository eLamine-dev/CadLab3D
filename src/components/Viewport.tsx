import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";
import { useEffect, useState } from "react";

const cameraPositions = {
  Perspective: [5, 5, 5],
  Top: [0, 10, 0],
  Front: [0, 0, 10],
  Left: [-10, 0, 0],
  Right: [10, 0, 0],
  Back: [0, 0, -10],
  Bottom: [0, -10, 0],
};

function CameraController({ cameraType, maximized }) {
  const { camera } = useThree();

  useEffect(() => {
    if (cameraPositions[cameraType]) {
      camera.position.set(...cameraPositions[cameraType]);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }

    if (cameraType === "Perspective") {
      camera.fov = maximized ? 30 : 50;
    } else {
      camera.zoom = maximized ? 2 : 1;
    }
  }, [cameraType, camera, maximized]);

  return null;
}

export default function Viewport({
  id,
  controls,
  defaultView,
  isActive,
  onClick,
  maximized,
}) {
  const [currentView, setCurrentView] = useState(defaultView);

  return (
    <div
      className={`viewport ${isActive ? "active" : ""}`}
      onClick={() => onClick(id)}
    >
      <div className="controls">
        <label>Camera View: </label>
        <select
          onChange={(e) => setCurrentView(e.target.value)}
          value={currentView}
        >
          {Object.keys(cameraPositions).map((view) => (
            <option key={view} value={view}>
              {view}
            </option>
          ))}
        </select>
      </div>
      <Canvas>
        <CameraController cameraType={currentView} maximized={maximized} />
        <Scene />
        {controls && <OrbitControls />}
      </Canvas>
    </div>
  );
}
