import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import { useViewportStore } from "../state/viewportStore";
import { useArrayCamera } from "../hooks/useArrayCamera";
import * as THREE from "three";

export default function CameraCtrls() {
  const controlsRef = useRef<InstanceType<typeof CameraControls> | null>(null);
  const { activeViewport, updateCamSettings, viewports } = useViewportStore();
  const { arrayCamera } = useArrayCamera();
  const activeCamera = arrayCamera.cameras[activeViewport];

  useEffect(() => {
    if (!controlsRef.current || !activeCamera) return;

    // Get viewport camera settings
    const settings = viewports[activeViewport].settings.cameraSettings;

    // Apply settings
    controlsRef.current.setLookAt(
      settings.position.x,
      settings.position.y,
      settings.position.z,
      settings.target.x,
      settings.target.y,
      settings.target.z,
      true
    );

    controlsRef.current.zoomTo(settings.zoom || 1, true);
  }, [activeViewport, activeCamera, viewports]);

  // Save camera position & target when user stops moving the camera
  useEffect(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;

    const onControlEnd = () => {
      if (!controls) return;

      const position = new THREE.Vector3();
      const target = new THREE.Vector3();

      controls.getPosition(position);
      controls.getTarget(target);

      updateCamSettings(activeViewport, {
        position: position.clone(),
        target: target.clone(),
        zoom: controls.zoom,
      });
    };

    controls.addEventListener("controlend", onControlEnd);
    return () => controls.removeEventListener("controlend", onControlEnd);
  }, [activeViewport]);

  return <CameraControls ref={controlsRef} makeDefault camera={activeCamera} />;
}
