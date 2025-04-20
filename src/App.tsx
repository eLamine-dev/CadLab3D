import { useEffect } from "react";
import { useSceneStore } from "./state/sceneStore";
import Workspace from "./components/Workspace";
import "./styles/Workspace.css";
import * as THREE from "three";
import { useCorrectedMouse } from "./hooks/useCorrectedMouse";
import RightPanel from "./components/RightPanel";

export default function App() {
  useCorrectedMouse();
  return (
    <>
      <Workspace />
      <RightPanel />
    </>
  );
}
