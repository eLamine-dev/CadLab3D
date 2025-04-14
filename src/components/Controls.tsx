import { useState } from "react";
import CameraCtrls from "./CameraCtrls";

import TransformCtrls from "./TransformCtrls";
import { useObjectInteraction } from "../hooks/useObjectInteraction";

export default function Controls() {
  const [dragging, setDragging] = useState(false);
  useObjectInteraction();
  return (
    <>
      <TransformCtrls setDragging={setDragging} />
      <CameraCtrls dragging={dragging} />
    </>
  );
}
