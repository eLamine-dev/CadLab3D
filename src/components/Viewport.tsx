import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { Scene } from "./Scene";
import { useWorkspaceStore, defaultViews } from "../state/workspaceStore";
import ViewportCamera from "./ViewportCamera";

export default function Viewport({ id, isActive, onClick }) {
  const { viewports, setViewportSettings, setViewportCustom } =
    useWorkspaceStore();
  const viewport = viewports[id];
  const cameraSettings = viewport.settings.cameraSettings;
  const orbitSettings = viewport.settings.orbitSettings;
  const [currentView, setCurrentView] = useState(viewport.settings.id);
  const [aspectRatio, setAspectRatio] = useState(1);
  const viewportRef = useRef(null);
  const cameraControlsRef = useRef(null);

  useEffect(() => {
    function updateAspectRatio() {
      if (viewportRef.current) {
        const width = viewportRef.current.clientWidth;
        const height = viewportRef.current.clientHeight;
        setAspectRatio(width / height);
      }
    }
    updateAspectRatio();
    window.addEventListener("resize", updateAspectRatio);
    return () => window.removeEventListener("resize", updateAspectRatio);
  }, []);

  const handleViewChange = (e) => {
    const newView = e.target.value;
    setCurrentView(newView);
    setViewportSettings(id, newView);

    // Reset camera controls to default state for the new view
    if (cameraControlsRef.current) {
      cameraControlsRef.current.reset();
    }
  };

  const handleCameraInteraction = () => {
    // Mark the view as custom when the user interacts with the camera
    if (!viewport.isCustom) {
      setViewportCustom(id, true);
    }
  };

  return (
    <div
      className={`viewport ${isActive ? "active" : ""}`}
      onClick={() => onClick(id)}
      ref={viewportRef}
    >
      <div className="controls" onClick={(e) => e.stopPropagation()}>
        <label>Camera View: </label>
        <select onChange={handleViewChange} value={currentView}>
          {Object.keys(defaultViews).map((view) => (
            <option key={view} value={view}>
              {view}
            </option>
          ))}
        </select>
      </div>
      <Canvas>
        <ViewportCamera viewportId={id} aspectRatio={aspectRatio} />
        <Scene />
        <CameraControls
          makeDefault
          {...orbitSettings}
          ref={cameraControlsRef}
          onChange={handleCameraInteraction}
        />
      </Canvas>
    </div>
  );
}
