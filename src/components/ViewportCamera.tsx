import { PerspectiveCamera, OrthographicCamera } from "@react-three/drei";
import { useWorkspaceStore } from "../state/workspaceStore";
import { useEffect, useState } from "react";

function ViewportCamera({ viewportId, aspectRatio }) {
  const { viewports } = useWorkspaceStore();
  const viewport = viewports[viewportId];
  const cameraSettings = viewport.settings.cameraSettings;
  const cameraType = viewport.settings.cameraType;
  const [frustum, setFrustum] = useState({
    left: -1,
    right: 1,
    top: 1,
    bottom: -1,
  });

  useEffect(() => {
    const calculateOrthoFrustum = (
      distance: number,
      fov: number,
      aspectRatio: number
    ) => {
      const height = Math.tan((fov * Math.PI) / 180) * distance;
      const width = height * aspectRatio;
      return { left: -width, right: width, top: height, bottom: -height };
    };
    if (cameraType === "OrthographicCamera") {
      const distance = 5;
      const fov = 50;
      const newFrustum = calculateOrthoFrustum(distance, fov, aspectRatio);
      setFrustum(newFrustum);
    }
  }, [cameraType, aspectRatio]);

  if (!cameraSettings) return null;

  return cameraType === "PerspectiveCamera" ? (
    <PerspectiveCamera makeDefault {...cameraSettings} />
  ) : (
    <OrthographicCamera makeDefault {...cameraSettings} {...frustum} />
  );
}

export default ViewportCamera;
