import { useRef, useState, forwardRef } from "react";
import { View, OrbitControls, PivotControls } from "@react-three/drei";
import { useWorkspaceStore, defaultViews } from "../state/workspaceStore";
import ViewportCamera from "./ViewportCamera";
import { Scene } from "./Scene";
import * as THREE from "three";

const Viewport = forwardRef(({ id, isActive, onClick, children }, vRef) => {
  const { viewports, setViewportSettings } = useWorkspaceStore();
  const viewport = viewports[id];

  const [currentView, setCurrentView] = useState(viewport.settings.id);

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
        <label>Camera View:</label>
        <select onChange={handleViewChange} value={currentView}>
          {Object.keys(defaultViews).map((view) => (
            <option key={view} value={view}>
              {view}
            </option>
          ))}
        </select>
      </div>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ViewportCamera viewportId={id} />
        <Scene />
        <PivotControls scale={0.5} depthTest={false} />
        <OrbitControls makeDefault />
      </View>
    </div>
  );
});

export default Viewport;
