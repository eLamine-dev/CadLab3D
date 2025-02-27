import { useEffect } from "react";
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
      className={`viewports-container ${maximizedViewport ? "maximized" : ""}`}
    >
      {!maximizedViewport &&
        Object.values(viewports).map((viewport) => (
          <Viewport
            key={viewport.id}
            id={viewport.id}
            isActive={activeViewport === viewport.id}
            onClick={() => setActiveViewport(viewport.id)}
          />
        ))}
      {maximizedViewport && (
        <Viewport
          key={maximizedViewport}
          id={maximizedViewport}
          isActive={true}
          onClick={() => {}}
        />
      )}
    </div>
  );
}
