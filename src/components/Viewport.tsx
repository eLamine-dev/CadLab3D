import { useRef, useState } from "react";
import { View, OrbitControls } from "@react-three/drei";
import { useWorkspaceStore, defaultViews } from "../state/workspaceStore";
import ViewportCamera from "./ViewportCamera";
import { Scene } from "../state/scene";

export default function Viewport({ id, isActive, onClick }) {
  const { viewports, setViewportSettings } = useWorkspaceStore();
  const viewport = viewports[id];

  const [currentView, setCurrentView] = useState(viewport.settings.id);
  const scene = new Scene();

  const handleViewChange = (e) => {
    const newView = e.target.value;
    setViewportSettings(id, newView);
    setCurrentView(newView);
  };

  return (
    <div
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
      <View>
        <ViewportCamera viewportId={id} />
        <primitive object={scene.getScene()} />
        <OrbitControls makeDefault />
      </View>
    </div>
  );
}
