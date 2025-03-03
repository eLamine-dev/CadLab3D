import { create } from "zustand";
import * as THREE from "three";

const BASE_ORTHO_CAM = {
  zoom: 1.5,
  target: [0, 0, 0],
  near: 0.1,
  far: 1000,
};

const ORTHO_CAM_CONTROLS = {
  enableDamping: false,
  zoomSpeed: 1.0,
  autoRotate: false,
  enableZoom: true,
  enableDolly: true,
  enablePan: true,
  enableRotate: true,
};

const PER_CAM_CONTROLS = {
  enableDamping: false,
  zoomSpeed: 1.0,
  autoRotate: false,
  enableZoom: true,
  enablePan: true,
  enableRotate: true,
};

export const defaultViews = {
  Perspective: {
    id: "Perspective",
    cameraType: "PerspectiveCamera",
    cameraSettings: { position: [7, 7, 7], fov: 50, near: 0.1, far: 1000 },
    orbitSettings: PER_CAM_CONTROLS,
  },
  Top: {
    id: "Top",
    cameraType: "OrthographicCamera",
    cameraSettings: { position: [0, 10, 0], up: [0, 0, -1], ...BASE_ORTHO_CAM },
    orbitSettings: ORTHO_CAM_CONTROLS,
  },
  Front: {
    id: "Front",
    cameraType: "OrthographicCamera",
    cameraSettings: { position: [0, 0, 10], ...BASE_ORTHO_CAM },
    orbitSettings: ORTHO_CAM_CONTROLS,
  },
  Left: {
    id: "Left",
    cameraType: "OrthographicCamera",
    cameraSettings: { position: [-10, 0, 0], ...BASE_ORTHO_CAM },
    orbitSettings: ORTHO_CAM_CONTROLS,
  },
  Right: {
    id: "Right",
    cameraType: "OrthographicCamera",
    cameraSettings: { position: [10, 0, 0], ...BASE_ORTHO_CAM },
    orbitSettings: ORTHO_CAM_CONTROLS,
  },
  Back: {
    id: "Back",
    cameraType: "OrthographicCamera",
    cameraSettings: { position: [0, 0, -10], ...BASE_ORTHO_CAM },
    orbitSettings: ORTHO_CAM_CONTROLS,
  },
  Bottom: {
    id: "Bottom",
    cameraType: "OrthographicCamera",
    cameraSettings: { position: [0, -10, 0], up: [0, 0, 1], ...BASE_ORTHO_CAM },
    orbitSettings: ORTHO_CAM_CONTROLS,
  },
};

export const useWorkspaceStore = create((set) => ({
  activeViewport: 1,
  maximizedViewport: null,
  viewports: {
    1: { id: 1, settings: defaultViews.Perspective },
    2: { id: 2, settings: defaultViews.Top },
    3: { id: 3, settings: defaultViews.Front },
    4: { id: 4, settings: defaultViews.Left },
  },
  setViewportSettings: (viewport, newView) =>
    set((state) => ({
      viewports: {
        ...state.viewports,
        [viewport]: {
          ...state.viewports[viewport],
          settings: defaultViews[newView],
        },
      },
    })),
  setActiveViewport: (viewport) => set({ activeViewport: viewport }),
  setMaximizedViewport: (viewport) => set({ maximizedViewport: viewport }),
}));
