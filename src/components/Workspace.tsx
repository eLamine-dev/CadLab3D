import { useState, useEffect } from "react";
import Viewport from "./Viewport";
import "../styles/Workspace.css";

export default function Workspace() {
  const [activeView, setActiveView] = useState("");

  const [maximized, setMaximized] = useState(false);

  const defaultViews = [
    { id: "Perspective", cameraPosition: [5, 5, 5], controls: true },
    { id: "Top", cameraPosition: [0, 10, 0], controls: false },
    { id: "Front", cameraPosition: [0, 0, 10], controls: false },
    { id: "Left", cameraPosition: [-10, 0, 0], controls: false },
    { id: "Right", cameraPosition: [10, 0, 0], controls: false },
    { id: "Back", cameraPosition: [0, 0, -10], controls: false },
    { id: "Bottom", cameraPosition: [0, -10, 0], controls: false },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyW") {
        setMaximized((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`viewports-container ${maximized ? "maximized" : ""}`}>
      {defaultViews.slice(0, 4).map((view) => (
        <Viewport
          key={view.id}
          id={view.id}
          cameraPosition={view.cameraPosition}
          controls={view.controls}
          isActive={activeView === view.id}
          onClick={setActiveView}
          cameraType={view.id}
          defaultView={view.id}
        />
      ))}
    </div>
  );
}
