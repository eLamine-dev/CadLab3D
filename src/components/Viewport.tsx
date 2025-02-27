import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { Scene } from "./Scene";
import { useWorkspaceStore } from "../state/workspaceStore";
import ViewportCamera from "./ViewportCamera";
import { useEffect, useState } from "react";

function ResizeHandler({ viewportId }) {
  const { camera, gl } = useThree();
  const { viewports } = useWorkspaceStore();
  const viewportSettings = viewports[viewportId]?.settings;

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
  }, [camera, gl, viewportSettings]);

  return null;
}

export default function Viewport({ id, isActive, onClick }) {
  const { viewports, setViewportSettings } = useWorkspaceStore();
  const viewport = viewports[id];
  const cameraSettings = viewport.settings.cameraSettings;
  const orbitSettings = viewport.settings.orbitSettings;
  const [currentView, setCurrentView] = useState(viewport.settings.id);

  const handleViewChange = (e) => {
    const newView = e.target.value;
    setCurrentView(newView);
    setViewportSettings(id, newView);
  };

  return (
    <div
      className={`viewport ${isActive ? "active" : ""}`}
      onClick={() => onClick(id)}
    >
      <div className="controls" onClick={(e) => e.stopPropagation()}>
        <label>Camera View: </label>
        <select onChange={handleViewChange} value={currentView}>
          {Object.keys(useWorkspaceStore.getState().viewports).map((view) => (
            <option key={view} value={view}>
              {view}
            </option>
          ))}
        </select>
      </div>
      <Canvas>
        <ResizeHandler viewportId={id} />
        <ViewportCamera viewportId={id} {...cameraSettings} />
        <Scene />
        <CameraControls
          minZoom={0.5}
          maxZoom={5}
          enableDamping={orbitSettings.enableDamping}
          dampingFactor={orbitSettings.dampingFactor}
          zoomSpeed={orbitSettings.zoomSpeed}
          smoothTime={0.1}
          enabled={true}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
