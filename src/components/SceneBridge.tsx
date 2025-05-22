import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import sceneInstance from "../scene/Scene";
import { useMetaStore } from "../state/metaStore";

export default function SceneBridge() {
  const { scene, gl } = useThree();

  // useEffect(() => {
  //   const canvas = gl.domElement;
  //   console.log("Canvas element is:", canvas);

  //   canvas.addEventListener("click", (e) => {
  //     console.log("manual canvas listener fired", e);
  //   });
  // }, [scene]);

  useEffect(() => {
    sceneInstance.bridgeScenes(scene, gl.domElement);
  }, [gl.domElement, scene]);

  return null;
}
