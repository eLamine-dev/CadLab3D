import { useState, useEffect } from "react";
import CameraCtrls from "./CameraCtrls";

import TransformCtrls from "./TransformCtrls";
import { useObjectInteraction } from "../hooks/useObjectInteraction";
import MultiViewport from "./MultiViewport";

export default function Controls() {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  useEffect(() => {
    console.log("Camera controls enabled from:", cameraEnabled);
  }, [cameraEnabled]);
  useObjectInteraction();

  return (
    <>
      <TransformCtrls
        onDragStart={() => setCameraEnabled(false)}
        onDragEnd={() => setCameraEnabled(true)}
      />
      {/* <MultiViewport enabled={cameraEnabled} /> */}
      <CameraCtrls enabled={cameraEnabled} />
    </>
  );
}
