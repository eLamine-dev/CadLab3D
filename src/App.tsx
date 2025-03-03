import { useEffect } from "react";
import { useSceneStore } from "./state/sceneStore";
import Workspace from "./components/Workspace";
import * as THREE from "three";

export default function App() {
  const addObject = useSceneStore((state) => state.addObject);

  useEffect(() => {
    // Create a single box and add it to the scene
    const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(0, 0, 0);

    addObject("box", boxMesh);
  }, [addObject]);

  return <Workspace />;
}
