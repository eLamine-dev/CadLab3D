import { useState, useEffect } from "react";
import CameraCtrls from "./CameraCtrls";
import { useThree, useFrame } from "@react-three/fiber";

import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";
import TransformCtrls from "./TransformCtrls";
import { useObjectInteraction } from "../hooks/useObjectInteraction";
import MultiViewport from "./MultiViewport";

export default function Controls() {
  const [cameraCtrlsEnabled, setCameraCtrlsEnabled] = useState(true);

  const { size, gl, scene } = useThree();
  const { activeViewport, maximizedViewport, viewports } = useViewportStore();

  const { arrayCamera } = useArrayCamera();

  // useObjectInteraction();

  return (
    <>
      {/* <TransformCtrls
        onDragStart={() => setCameraCtrlsEnabled(false)}
        onDragEnd={() => setCameraCtrlsEnabled(true)}
      /> */}
      {/* <MultiViewport enabled={cameraCtrlsEnabled} /> */}
      <CameraCtrls enabled={cameraCtrlsEnabled} />
    </>
  );
}
