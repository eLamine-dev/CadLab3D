import { PerspectiveCamera, OrthographicCamera } from "@react-three/drei";
import { useWorkspaceStore } from "../state/workspaceStore";

function ViewportCamera({ viewportId }) {
  const { viewports } = useWorkspaceStore();
  const viewportSettings = viewports[viewportId]?.settings?.cameraSettings;

  if (!viewportSettings) return null;

  return viewportSettings.cameraType === "PerspectiveCamera" ? (
    <PerspectiveCamera
      makeDefault
      position={viewportSettings.position}
      fov={viewportSettings.fov}
      near={viewportSettings.near}
      far={viewportSettings.far}
    />
  ) : (
    <OrthographicCamera
      makeDefault
      position={viewportSettings.position}
      zoom={viewportSettings.zoom}
      near={viewportSettings.near}
      far={viewportSettings.far}
    />
  );
}

export default ViewportCamera;
