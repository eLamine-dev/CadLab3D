import { useState, useEffect } from "react";
import CameraCtrls from "./CameraCtrls";
import { useThree, useFrame } from "@react-three/fiber";

import { useArrayCamera } from "../hooks/useArrayCamera";
import { useViewportStore } from "../state/viewportStore";
import TransformCtrls from "./TransformCtrls";
import { useObjectInteraction } from "../hooks/useObjectInteraction";
import MultiViewport from "./MultiViewport";
import { useCameraControls } from "../hooks/useCameraCtrls";

export default function Controls() {
  return (
    <>
      <TransformCtrls />
      <CameraCtrls />
    </>
  );
}
