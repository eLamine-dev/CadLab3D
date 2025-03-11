import { useCameraControls } from "../hooks/useCameraCtrls";
import { useFrame } from "@react-three/fiber";
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
    </>
  );
}
