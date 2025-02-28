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
  const [cameraReady, setCameraReady] = useState(false);

  const viewportRef = useRef(null);
  const cameraControlsRef = useRef(null);
  const isOrtho = viewport.settings.cameraType === "OrthographicCamera";
  const initialRotationRef = useRef<THREE.Euler | null>(null);

  useEffect(() => {
    function updateAspectRatio() {
      if (viewportRef.current) {
        const width = viewportRef.current.clientWidth;
        const height = viewportRef.current.clientHeight;
        setAspectRatio(width / height);
      }
    }
    updateAspectRatio();
    window.addEventListener("resize", updateAspectRatio);
    return () => window.removeEventListener("resize", updateAspectRatio);
  }, []);

  useEffect(() => {
    if (!cameraControlsRef.current) return;

    setCameraReady(true);
  }, [cameraControlsRef.current]);

  useEffect(() => {
    if (
      !cameraReady ||
      !cameraControlsRef.current ||
      !isOrtho ||
      viewport.isCustom
    )
      return;

    const camera = cameraControlsRef.current.camera;
    const rotation = new THREE.Euler().setFromRotationMatrix(camera.matrix);

    if (!initialRotationRef.current) {
      initialRotationRef.current = rotation.clone();
    }

    console.log("Initial Rotation Set:", initialRotationRef.current);
  }, [cameraReady, viewport.settings, isOrtho, viewport.isCustom]);

  const handleViewChange = (e) => {
    const newView = e.target.value;

    if (newView !== "Custom") {
      setViewportSettings(id, newView);
      setCurrentView(newView);

      if (cameraControlsRef.current) {
        cameraControlsRef.current.reset();
      }

      initialRotationRef.current = null;
    }
  };

  const handleCameraChange = () => {
    if (
      !cameraReady ||
      !cameraControlsRef.current ||
      !isOrtho ||
      viewport.isCustom ||
      !initialRotationRef.current
    ) {
      return;
    }

    const camera = cameraControlsRef.current.camera;
    const currentRotation = new THREE.Euler().setFromRotationMatrix(
      camera.matrix
    );

    if (!currentRotation.equals(initialRotationRef.current)) {
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
