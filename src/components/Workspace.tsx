import { useEffect, useRef } from "react";
import useRefs from "react-use-refs";
import { Canvas } from "@react-three/fiber";

import { useWorkspaceStore } from "../state/workspaceStore";
import { View, OrbitControls, PivotControls, Center } from "@react-three/drei";
import { CameraControls } from "@react-three/drei";

import ViewportCamera from "./ViewportCamera";
// import { Scene } from "../state/scene";
import { Scene } from "./Scene";
import Viewport from "./Viewport";
import "../styles/Workspace.css";

export default function Workspace() {
  const {
    activeViewport,
    maximizedViewport,
    setActiveViewport,
    setMaximizedViewport,
    viewports,
  } = useWorkspaceStore();
  const containerRef = useRef(null);

  // const scene = new Scene();

  const [view1, view2, view3, view4] = useRefs();

  useEffect(() => {
    console.log(view1, view2, view3, view4);
  }, [view1, view2, view3, view4, viewports]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.code === "KeyW") {
        setMaximizedViewport(maximizedViewport ? null : activeViewport);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeViewport, maximizedViewport, setMaximizedViewport]);

  return (
    <div
      ref={containerRef}
      className={`viewports-container ${maximizedViewport ? "maximized" : ""}`}
    >
      {/* <View
        ref={view1}
        id={1}
        isActive={activeViewport === 1}
        onClick={() => setActiveViewport(1)}
        style={{
          background: "aquamarine",
        }}
        className="view"
      >
        <ViewportCamera viewportId={1} />
        <Scene />
        <CameraControls {...viewports[1].settings.orbitSettings} />
      </View>

      <View
        ref={view2}
        id={2}
        isActive={activeViewport === 1}
        onClick={() => setActiveViewport(2)}
        style={{
          background: "aquamarine",
        }}
        className="view"
      >
        <ViewportCamera viewportId={2} />
        <Scene />
        <CameraControls {...viewports[2].settings.orbitSettings} />
      </View>

      <View
        ref={view3}
        id={3}
        isActive={activeViewport === 1}
        onClick={() => setActiveViewport(3)}
        style={{
          background: "aquamarine",
        }}
        className="view"
      >
        <ViewportCamera viewportId={3} />
        <Scene />
        <CameraControls {...viewports[3].settings.orbitSettings} />
      </View>

      <View
        ref={view4}
        id={4}
        isActive={activeViewport === 1}
        onClick={() => setActiveViewport(4)}
        style={{
          background: "aquamarine",
        }}
        className="view"
      >
        <ViewportCamera viewportId={4} />
        <Scene />
        <CameraControls {...viewports[4].settings.orbitSettings} />
      </View> */}

      <Viewport
        key={`${1}`}
        id={1}
        isActive={activeViewport === 1}
        onClick={() => setActiveViewport(1)}
      />

      <Viewport
        key={`${2}`}
        id={2}
        isActive={activeViewport === 2}
        onClick={() => setActiveViewport(2)}
      />
      <Viewport
        key={`${3}`}
        id={3}
        isActive={activeViewport === 3}
        onClick={() => setActiveViewport(3)}
      />

      <Viewport
        key={`${4}`}
        id={4}
        isActive={activeViewport === 4}
        onClick={() => setActiveViewport(4)}
      />

      <Canvas frameloop="demand" eventSource={containerRef} className="canvas">
        <View.Port />
      </Canvas>
    </div>
  );
}
