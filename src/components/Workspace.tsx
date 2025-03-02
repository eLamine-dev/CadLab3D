import { useEffect, useRef } from "react";
import useRefs from "react-use-refs";
import { Canvas } from "@react-three/fiber";

import { useWorkspaceStore } from "../state/workspaceStore";
import { View, OrbitControls, PivotControls } from "@react-three/drei";
import { CameraControls } from "@react-three/drei";

import ViewportCamera from "./ViewportCamera";
import { Scene } from "../state/scene";
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

  const scene = new Scene();

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
      {/* <Viewport
        ref={view1}
        id={1}
        isActive={activeViewport === 1}
        onClick={() => setActiveViewport(1)}
      />
      <Viewport
        ref={view2}
        id={2}
        isActive={activeViewport === 2}
        onClick={() => setActiveViewport(2)}
      />
      <Viewport
        ref={view3}
        id={3}
        isActive={activeViewport === 3}
        onClick={() => setActiveViewport(3)}
      />
      <Viewport
        ref={view4}
        id={4}
        isActive={activeViewport === 4}
        onClick={() => setActiveViewport(4)}
      /> */}

      <View
        ref={view1}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ViewportCamera viewportId={1} />
        <primitive object={scene.getScene()} />
        <CameraControls {...viewports[1].settings.orbitSettings} />
      </View>

      {/* <View
        ref={view2}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ViewportCamera viewportId={2} />
        <primitive object={scene.getScene()} />
        <CameraControls {...viewports[2].settings.orbitSettings} />
      </View>
      <View
        ref={view3}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ViewportCamera viewportId={3} />
        <primitive object={scene.getScene()} />
        <CameraControls {...viewports[3].settings.orbitSettings} />
      </View>
      <View
        ref={view4}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ViewportCamera viewportId={4} />
        <primitive object={scene.getScene()} />
        <CameraControls {...viewports[4].settings.orbitSettings} />
      </View> */}
      <Canvas frameloop="demand" eventSource={containerRef} className="canvas">
        <View.Port />
      </Canvas>
    </div>
  );
}
