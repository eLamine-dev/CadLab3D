import * as THREE from "three";
import sceneInstance from "../scene/Scene";

import { useMetaStore } from "../state/metaStore";

export default function CreatePanel() {
  const { setMode } = useMetaStore();

  const objcets = ["box", "sphere"];

  return (
    <div className="create-panel">
      <h3>Create Object</h3>
      <button onClick={() => startCreation("box")}>Box</button>
      <button onClick={() => startCreation(createSphere)}>Sphere</button>
    </div>
  );
}
