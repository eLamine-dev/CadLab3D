import { useState, useEffect } from "react";
import Viewport from "./Viewport";
import "../styles/Workspace.css";

const defaultViews = [
  { id: "Perspective", defaultView: "Perspective", controls: true },
  { id: "Top", defaultView: "Top", controls: false },
  { id: "Front", defaultView: "Front", controls: false },
  { id: "Left", defaultView: "Left", controls: false },
];

export default function Workspace() {
  const [activeView, setActiveView] = useState("Perspective");
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
    <div
      className={`viewports-container ${
        maximized ? "maximized" : "grid-layout"
      }`}
    >
      {defaultViews.map((view) => (
        <Viewport
          key={view.id}
          id={view.id}
          defaultView={view.defaultView}
          controls={view.controls}
          isActive={activeView === view.id}
          onClick={() => setActiveView(view.id)}
          maximized={maximized}
        />
      ))}
    </div>
  );
}
