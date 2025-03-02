import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useWorkspaceStore } from "../state/workspaceStore";
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
      {Object.values(viewports).map((viewport) => (
        <Viewport
          key={viewport.id}
          id={viewport.id}
          isActive={activeViewport === viewport.id}
          onClick={() => setActiveViewport(viewport.id)}
        />
      ))}
      <Canvas eventSource={containerRef}>
        <View.Port />
      </Canvas>
    </div>
  );
}
