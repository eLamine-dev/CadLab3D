import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";
import { useEffect, useState, useRef } from "react";
import CameraController from "./Camera";

const cameraPositions = {
  Perspective: [5, 5, 5],
  Top: [0, 10, 0],
  Front: [0, 0, 10],
  Left: [-10, 0, 0],
};

function ResizeHandler({ maximized }) {
  const { camera, gl, size } = useThree();

  useEffect(() => {
    const handleResize = () => {
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      gl.setSize(size.width, size.height);
      gl.setPixelRatio(window.devicePixelRatio);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [camera, gl, size, maximized]);

  return null;
}

export default function Viewport({
  id,
  controls,
  defaultView,
  isActive,
  maximized,
  onClick,
}) {
  const [currentView, setCurrentView] = useState(defaultView);
  const canvasRef = useRef(null);

  return (
    <div
      className={`viewport ${isActive ? "active" : ""} ${
        maximized ? "full-screen" : ""
      }`}
      onClick={() => onClick(id)}
    >
      {!maximized && (
        <div className="controls" onClick={(e) => e.stopPropagation()}>
          <label>Camera View: </label>
          <select
            onChange={(e) => {
              e.stopPropagation();
              setCurrentView(e.target.value);
            }}
            value={currentView}
          >
            {Object.keys(cameraPositions).map((view) => (
              <option key={view} value={view}>
                {view}
              </option>
            ))}
          </select>
        </div>
      )}
      <Canvas ref={canvasRef}>
        <ResizeHandler maximized={maximized} />
        <CameraController
          cameraType={currentView}
          viewportId={id}
          maximized={maximized}
        />
        <Scene />
        {controls && <OrbitControls />}
      </Canvas>
    </div>
  );
}
