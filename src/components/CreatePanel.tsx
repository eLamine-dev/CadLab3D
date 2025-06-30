import * as THREE from "three";
import sceneInstance from "../scene/Scene";

import { useMetaStore } from "../state/metaStore";
// import { useCreate } from "../hooks/useCreate";

export default function CreatePanel() {
  // useCreate();
  const { setMode } = useMetaStore();

  const tools = ["box", "sphere", "polyline", "arc"];

  return (
    <div className="create-panel">
      <h3>Create Object</h3>
      {tools.map((tool) => (
        <button
          key={tool}
          onClick={() => {
            setMode("create", tool);
          }}
        >
          {tool}
        </button>
      ))}
    </div>
  );
}
