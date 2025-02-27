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
  const { camera, gl } = useThree();

  useEffect(() => {
    const handleResize = () => {
      gl.setSize(window.innerWidth, window.innerHeight);
      gl.setPixelRatio(window.devicePixelRatio);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [camera, gl, maximized]);

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
      <Canvas>
        <ResizeHandler maximized={maximized} />
        <CameraController
          cameraType={currentView}
          viewportId={id}
          maximized={maximized}
        />
        <Scene />
        {controls && <OrbitControls enableDamping={false} />}
      </Canvas>
    </div>
  );
}
