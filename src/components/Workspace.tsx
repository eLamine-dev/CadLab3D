import { useState, useEffect, useRef } from "react";
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
  const [savedViews, setSavedViews] = useState(defaultViews);

  const viewportRefs = useRef({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyW") {
        if (!maximized) {
          setSavedViews([...defaultViews]);
        }
        setMaximized((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maximized]);

  return (
    <div className="viewports-container">
      {!maximized &&
        savedViews.map((view) => (
          <Viewport
            key={view.id}
            id={view.id}
            defaultView={view.defaultView}
            controls={view.controls}
            isActive={activeView === view.id}
            onClick={() => setActiveView(view.id)}
            maximized={false}
            viewportRef={(ref) => (viewportRefs.current[view.id] = ref)}
          />
        ))}
      {maximized && (
        <Viewport
          key={activeView}
          id={activeView}
          defaultView={activeView}
          controls={true}
          isActive={true}
          onClick={() => {}}
          maximized={true}
          viewportRef={viewportRefs.current[activeView]}
        />
      )}
    </div>
  );
}
