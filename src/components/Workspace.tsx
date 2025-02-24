import { useState } from "react";
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

  return (
    <div className="viewports-container">
      {views.map((view) => (
        <div
          key={view.id}
          className={`viewport ${activeView === view.id ? "active" : ""}`}
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
