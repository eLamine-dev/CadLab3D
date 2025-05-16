import * as THREE from "three";
import sceneInstance from "../scene/Scene";

import { useMetaStore } from "../state/metaStore";
// import { useCreate } from "../hooks/useCreate";

export default function CreatePanel() {
  // useCreate();
  const { setMode } = useMetaStore();

  const tools = ["box", "sphere"];

  return (
    <div className="create-panel">
      <h3>Create Object</h3>
      {tools.map((obj) => (
        <button
          key={obj}
          onClick={() => {
            setMode("create", obj);
          }}
        >
          {obj}
        </button>
      ))}
    </div>
  );
}
