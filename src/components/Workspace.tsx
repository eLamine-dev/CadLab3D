import { useEffect, useState } from "react";
import * as THREE from "three";

import SceneObjects from "./SceneObjects";
import { Canvas, useThree, useFrame } from "@react-three/fiber";

import sceneInstance from "../scene/Scene";
import { useViewportStore } from "../state/viewportStore";
import ViewSelection from "./ViewSelection";
// import TransformCtrls from "./TransformCtrls";
import CameraCtrls from "./CameraCtrls";
import SceneBridge from "./SceneBridge";

import Controls from "./Controls";
import MultiViewport from "./MultiViewport";
import ObjectSelection from "./ObjectSelection";

export default function Workspace() {
  const {
    setActiveViewport,
    activeViewport,
    setMaximizedViewport,
    maximizedViewport,
  } = useViewportStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.code === "KeyW") {
        setMaximizedViewport(
          maximizedViewport !== null ? null : activeViewport
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeViewport, maximizedViewport, setMaximizedViewport]);

  return (
    <div className="workspace">
      <div className="canvas-container">
        <Canvas onClick={() => console.log("canvas")}>
          {/* <SceneObjects /> */}
          <MultiViewport />
          <SceneBridge />
          <Controls />
          <ObjectSelection />

          {/* <CameraCtrls enabled={true} /> */}
          {/* <ObjectInteraction /> */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
        </Canvas>
      </div>
      {maximizedViewport !== null && (
        <div className="viewport-selection maximized">
          <div
            key={maximizedViewport}
            className="viewport active"
            onMouseDown={(e) => {
              e.stopPropagation();
              // setActiveViewport(maximizedViewport);
            }}
          >
            <ViewSelection viewportId={maximizedViewport} />
          </div>
        </div>
      )}
      {maximizedViewport == null && (
        <div className="viewport-selection">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`viewport ${activeViewport === index ? "active" : ""}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (activeViewport !== index) setActiveViewport(index);
              }}
            >
              <ViewSelection viewportId={index} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
