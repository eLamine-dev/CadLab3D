import * as THREE from "three";
import sceneInstance from "../scene/Scene";

import { useMetaStore } from "../state/metaStore";

export default function CreatePanel() {
  const { setMode } = useMetaStore();

  const startCreation = (createObject) => {
    setMode("create");
    createObject();
  };
  const createBox = () => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    sceneInstance.addObject(`Box_${Date.now()}`, box, [0, 0, 0]);
  };

  const createSphere = () => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x0077ff })
    );
    sceneInstance.addObject(`Sphere_${Date.now()}`, sphere, [0, 0, 0]);
  };

  return (
    <div className="create-panel">
      <h3>Create Object</h3>
      <button onClick={() => startCreation(createBox)}>Box</button>
      <button onClick={() => startCreation(createSphere)}>Sphere</button>
    </div>
  );
}
