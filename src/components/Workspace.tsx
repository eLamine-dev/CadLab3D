import { useState, useEffect } from "react";
import { Viewport } from "./Viewport";

const views = [
  {
    id: "perspective",
    label: "Perspective",
    position: [5, 5, 5],
    controls: true,
  },
  { id: "top", label: "Top", position: [0, 10, 0], controls: false },
  { id: "front", label: "Front", position: [0, 0, 10], controls: false },
  { id: "left", label: "Left", position: [-10, 0, 0], controls: false },
];

function Workspace() {
  const [activeView, setActiveView] = useState("perspective");
  const [maximized, setMaximized] = useState(false);

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
      {views.map((view) => (
        <div
          key={view.id}
          className={`viewport ${activeView === view.id ? "active" : ""} ${
            maximized && activeView !== view.id ? "hidden" : ""
          }`}
          onClick={() => setActiveView(view.id)}
        >
          <Viewport position={view.position} controls={view.controls} />
          <div className="viewport-label">{view.label}</div>
        </div>
      ))}
    </div>
  );
}

export default Workspace;
