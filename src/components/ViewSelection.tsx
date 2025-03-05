import React from "react";
import { useViewportStore, defaultViews } from "../state/viewportStore";

export default function ViewSelection({ viewportId }) {
  const { viewports, setViewportSettings } = useViewportStore();
  const viewport = viewports[viewportId].settings.id;

  const handleViewChange = (event) => {
    const newView = event.target.value;

    setViewportSettings(viewportId, newView);
  };

  return (
    <div className="view-selection">
      <select onChange={handleViewChange} value={viewport}>
        {Object.keys(defaultViews).map((view) => (
          <option key={view} value={view}>
            {view}
          </option>
        ))}
      </select>
    </div>
  );
}
