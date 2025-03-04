import { useEffect, useMemo, forwardRef } from "react";
import { View, CameraControls, PivotControls } from "@react-three/drei";

import ViewportCamera from "./ViewportCamera";
import { useWorkspaceStore } from "../state/workspaceStore";

const Viewport = forwardRef(({ id, isActive, onClick }, vRef) => {
  const { viewports, setViewportSettings, setViewportCustom } =
    useWorkspaceStore();
  const viewport = viewports[id];
  const orbitSettings = viewport.settings.orbitSettings;
  const { viewportScenes, applyTransform } = useSceneStore();

  const moveObject = (objectId, x, y, z) => {
    applyTransform((scene) => {
      const obj = scene.getObjectByName(objectId);
      if (obj) obj.position.set(x, y, z);
    });
  };

  return (
    <div
      ref={vRef}
      className={`viewport ${isActive ? "active" : ""}`}
      onClick={() => onClick(id)}
    >
      <View className="viewport-canvas">
        <ViewportCamera viewportId={id} />
        <PivotControls
          anchor={[0, 0, 0]}
          depthTest={false}
          lineWidth={2}
          onDrag={(e) => moveObject("box", e.x, e.y, e.z)}
        >
          <primitive object={viewportScenes[id]} />
        </PivotControls>
        <CameraControls makeDefault {...orbitSettings} />
        <axesHelper args={[5]} />
        <gridHelper args={[10, 10]} />
        pivot
      </View>
    </div>
  );
});

export default Viewport;
