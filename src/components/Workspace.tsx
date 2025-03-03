import { useEffect, useRef } from "react";
import useRefs from "react-use-refs";
import { Canvas } from "@react-three/fiber";

import { useWorkspaceStore } from "../state/workspaceStore";
import { View, OrbitControls, PivotControls, Center } from "@react-three/drei";
import { CameraControls } from "@react-three/drei";

import ViewportCamera from "./ViewportCamera";
import Scene from "../state/scene";
// import { Scene } from "./Scene";
import Viewport from "./Viewport";
import "../styles/Workspace.css";

export default function Workspace() {
  const {
    activeViewport,
    maximizedViewport,
    setActiveViewport,
    setMaximizedViewport,
    viewports,
  } = useWorkspaceStore();
  const containerRef = useRef(null);

  const [view1, view2, view3, view4] = useRefs();

  const sceneInstance = new Scene();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.code === "KeyW") {
        setMaximizedViewport(maximizedViewport ? null : activeViewport);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeViewport, maximizedViewport, setMaximizedViewport]);

  return (
    <div
      ref={containerRef}
      className={`viewports-container ${maximizedViewport ? "maximized" : ""}`}
    >
      <Viewport
        key={`${2}`}
        id={2}
        isActive={activeViewport === 2}
        onClick={() => setActiveViewport(2)}
      />

      <Viewport
        key={`${4}`}
        id={4}
        isActive={activeViewport === 4}
        onClick={() => setActiveViewport(4)}
      />

      <Viewport
        key={`${3}`}
        id={3}
        isActive={activeViewport === 3}
        onClick={() => setActiveViewport(3)}
      />

      <Viewport
        key={`${1}`}
        id={1}
        isActive={activeViewport === 1}
        onClick={() => setActiveViewport(1)}
      />

      <Canvas frameloop="demand" eventSource={containerRef} className="canvas">
        <View.Port />
      </Canvas>
    </div>
  );
}
