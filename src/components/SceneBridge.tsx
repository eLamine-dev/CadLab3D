import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import sceneInstance from "../scene/Scene";

export default function SceneBridge() {
  const { scene } = useThree();

  useEffect(() => {
    sceneInstance.setScene(scene);
  }, [scene]);

  return null;
}
