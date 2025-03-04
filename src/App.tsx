import { useEffect } from "react";
import { useSceneStore } from "./state/sceneStore";
import Workspace from "./components/Workspace";
import "./styles/Workspace.css";
import * as THREE from "three";

export default function App() {
  return <Workspace />;
}
