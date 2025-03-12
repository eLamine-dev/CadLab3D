import CameraCtrls from "./CameraCtrls";

import TransformCtrls from "./TransformCtrls";

export default function Controls() {
  return (
    <>
      <TransformCtrls
      // disableCameraControls={() =>
      //   controlsRef.current.forEach((ctrl) => (ctrl.enabled = false))
      // }
      // enableCameraControls={() =>
      //   controlsRef.current.forEach((ctrl) => (ctrl.enabled = true))
      // }
      />
      {/* <CameraCtrls /> */}
    </>
  );
}
