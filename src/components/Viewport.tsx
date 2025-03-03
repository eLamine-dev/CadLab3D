import { useRef, useState, forwardRef, useEffect } from "react";
import {
  View,
  OrbitControls,
  PivotControls,
  CameraControls,
} from "@react-three/drei";
import { useWorkspaceStore, defaultViews } from "../state/workspaceStore";
import ViewportCamera from "./ViewportCamera";
// import { Scene } from "./Scene";
// import TScene from "../state/scene";

import { useSceneStore } from "../state/sceneStore";

const Viewport = forwardRef(({ id, isActive, onClick }, vRef) => {
  const { viewports, setViewportSettings } = useWorkspaceStore();
  const viewport = viewports[id];
  const orbitSettings = viewport.settings.orbitSettings;

  const [currentView, setCurrentView] = useState(viewport.settings.id);
  const [aspectRatio, setAspectRatio] = useState(1);

  const scene = useSceneStore((state) => state.scene);
  const moveObject = useSceneStore((state) => state.moveObject);
  const scaleObject = useSceneStore((state) => state.scaleObject);

  const boxRef = useRef();
  const [mode, setMode] = useState("translate");

  const handleViewChange = (e) => {
    const newView = e.target.value;
    setViewportSettings(id, newView);
    setCurrentView(newView);
  };

  return (
    <div
      ref={vRef}
      className={`viewport ${isActive ? "active" : ""}`}
      onClick={() => onClick(id)}
    >
      <div className="controls">
        <select onChange={handleViewChange} value={currentView}>
          {Object.keys(defaultViews).map((view) => (
            <option key={view} value={view}>
              {view}
            </option>
          ))}
        </select>
      </div>

      <View className="viewport-canvas">
        <ViewportCamera viewportId={id} />
        <primitive object={scene} />
        {/* <Scene /> */}
        <CameraControls makeDefault {...orbitSettings} />
      </View>
    </div>
  );
});

export default Viewport;
