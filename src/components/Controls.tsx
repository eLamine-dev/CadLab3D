import { useState } from "react";
import CameraCtrls from "./CameraCtrls";

import TransformCtrls from "./TransformCtrls";

export default function Controls() {
  const [dragging, setDragging] = useState(false);
  return (
    <>
      <TransformCtrls setDragging={setDragging} />
      <CameraCtrls dragging={dragging} />
    </>
  );
}
