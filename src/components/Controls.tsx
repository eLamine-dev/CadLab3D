import { useState, useEffect } from "react";
import CameraCtrls from "./CameraCtrls";

import TransformCtrls from "./TransformCtrls";
import { useObjectInteraction } from "../hooks/useObjectInteraction";
import MultiViewport from "./MultiViewport";

export default function Controls() {
  const [cameraCtrlsEnabled, setCameraCtrlsEnabled] = useState(true);

  useObjectInteraction();

  return (
    <>
      <TransformCtrls
        onDragStart={() => setCameraCtrlsEnabled(false)}
        onDragEnd={() => setCameraCtrlsEnabled(true)}
      />
      {/* <MultiViewport enabled={cameraCtrlsEnabled} /> */}
      <CameraCtrls enabled={cameraCtrlsEnabled} />
    </>
  );
}
