import { PerspectiveCamera, OrthographicCamera } from "@react-three/drei";
import { useWorkspaceStore } from "../state/workspaceStore";

export default function ViewportCamera({ viewportId }) {
  const { viewports } = useWorkspaceStore();
  const viewport = viewports[viewportId];

  if (!viewport) return null;

  const { cameraType, cameraSettings } = viewport.settings;

  return cameraType === "PerspectiveCamera" ? (
    <PerspectiveCamera makeDefault {...cameraSettings} />
  ) : (
    <OrthographicCamera makeDefault {...cameraSettings} />
  );
}
