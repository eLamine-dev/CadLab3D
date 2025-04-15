import { useState, useEffect } from "react";
import CameraCtrls from "./CameraCtrls";

import TransformCtrls from "./TransformCtrls";
import { useObjectInteraction } from "../hooks/useObjectInteraction";

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
      <CameraCtrls enabled={cameraEnabled} />
    </>
  );
}
