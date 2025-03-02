import { useRef, useState, forwardRef } from "react";
import {
  View,
  OrbitControls,
  PivotControls,
  CameraControls,
} from "@react-three/drei";
import { useWorkspaceStore, defaultViews } from "../state/workspaceStore";
import ViewportCamera from "./ViewportCamera";
import { Scene } from "./Scene";
import * as THREE from "three";

const Viewport = forwardRef(({ id, isActive, onClick, children }, vRef) => {
  const { viewports, setViewportSettings } = useWorkspaceStore();
  const viewport = viewports[id];
  const orbitSettings = viewport.settings.orbitSettings;

  const [currentView, setCurrentView] = useState(viewport.settings.id);
  const sceneInstance = new Scene();

  const handleViewChange = (e) => {
    const newView = e.target.value;
    setViewportSettings(id, newView);
    setCurrentView(newView);
  };

  return (
    <div
      ref={vRef}
      className={`view ${isActive ? "active" : ""}`}
      onClick={() => onClick(id)}
    >
      <div className="controls">
        <label>Camera View:</label>
        <select onChange={handleViewChange} value={currentView}>
          {Object.keys(defaultViews).map((view) => (
            <option key={view} value={view}>
              {view}
            </option>
          ))}
        </select>
      </div>
      <View>
        <ViewportCamera viewportId={id} />
        {/* <primitive object={sceneInstance.getScene()} /> */}
        <Scene />
        <CameraControls {...orbitSettings} />
      </View>
    </div>
  );
});

export default Viewport;
