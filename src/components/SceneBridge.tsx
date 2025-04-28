import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import sceneInstance from "../scene/Scene";

export default function SceneBridge() {
  const { scene, gl } = useThree();

  useEffect(() => {
    sceneInstance.bridgeScenes(scene, gl.domElement);
  }, [scene]);

  return null;
}
