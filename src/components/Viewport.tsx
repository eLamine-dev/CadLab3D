import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { Scene } from "./Scene";
import { useWorkspaceStore, defaultViews } from "../state/workspaceStore";
import ViewportCamera from "./ViewportCamera";
import * as THREE from "three";

export default function Viewport({ id, isActive, onClick }) {
  const { viewports, setViewportSettings, setViewportCustom } =
    useWorkspaceStore();
  const viewport = viewports[id];
  const orbitSettings = viewport.settings.orbitSettings;

  const [currentView, setCurrentView] = useState(viewport.settings.id);
  const [aspectRatio, setAspectRatio] = useState(1);

  const viewportRef = useRef(null);
  const cameraControlsRef = useRef(null);
  const ignoreCameraChangesRef = useRef(false);
  const isOrtho = viewport.settings.cameraType === "OrthographicCamera";

  useEffect(() => {
    function updateAspectRatio() {
      if (viewportRef.current) {
        const width = viewportRef.current.clientWidth;
        const height = viewportRef.current.clientHeight;
        setAspectRatio(width / height);
      }
    }
    console.log("Viewport Rendered", id);
    updateAspectRatio();
    window.addEventListener("resize", updateAspectRatio);
    return () => window.removeEventListener("resize", updateAspectRatio);
  }, []);

  const handleViewChange = (e) => {
    const newView = e.target.value;
    if (newView !== "Custom") {
      setViewportSettings(id, newView);
      setCurrentView(newView);

      if (cameraControlsRef.current) {
        const { position, target } = defaultViews[newView].cameraSettings;
        const initialRotation = new THREE.Euler(
          ...defaultViews[newView].initialRotation
        );
        const cameraControls = cameraControlsRef.current;

        cameraControls.enabled = false;
        ignoreCameraChangesRef.current = true;

        cameraControls.setPosition(...position, false);
        cameraControls.setTarget(...target, false);

        const camera = cameraControls.camera;
        camera.quaternion.setFromEuler(initialRotation);
        camera.updateMatrixWorld();

        requestAnimationFrame(() => {
          cameraControls.enabled = true;
          ignoreCameraChangesRef.current = false;
        });
      }
    }
  };

  const handleCameraChange = () => {
    if (
      !cameraControlsRef.current ||
      !isOrtho ||
      viewport.isCustom ||
      ignoreCameraChangesRef.current
    ) {
      return;
    }

    const camera = cameraControlsRef.current.camera;
    const currentRotation = new THREE.Euler().setFromRotationMatrix(
      camera.matrix
    );
    const initialRotation = new THREE.Euler(
      ...viewport.settings.initialRotation
    );

    const TOLERANCE = 0.000000001;
    if (
      Math.abs(currentRotation.x - initialRotation.x) > TOLERANCE ||
      Math.abs(currentRotation.y - initialRotation.y) > TOLERANCE ||
      Math.abs(currentRotation.z - initialRotation.z) > TOLERANCE
    ) {
      setViewportCustom(id, true);
    }
  };

  return (
    <div
      className={`viewport ${isActive ? "active" : ""}`}
      onClick={() => onClick(id)}
      ref={viewportRef}
    >
      <div className="controls" onClick={(e) => e.stopPropagation()}>
        <label>Camera View: </label>
        <select
          onChange={handleViewChange}
          value={viewport.isCustom ? "Custom" : currentView}
        >
          {Object.keys(defaultViews).map((view) => (
            <option key={view} value={view}>
              {view}
            </option>
          ))}
          {viewport.isCustom && isOrtho && (
            <option value="Custom">Custom</option>
          )}
        </select>
      </div>

      <Canvas>
        <ViewportCamera viewportId={id} aspectRatio={aspectRatio} />
        <Scene />
        <CameraControls
          makeDefault
          {...orbitSettings}
          ref={cameraControlsRef}
          onChange={handleCameraChange}
        />
      </Canvas>
    </div>
  );
}
