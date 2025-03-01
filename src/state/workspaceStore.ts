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
  enableZoom: false,
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

/**
 * Converts stored rotation array back into THREE.Euler
 */
const getEulerFromArray = (rotationArray: number[]) =>
  new THREE.Euler(...rotationArray);

export const defaultViews = {
  Perspective: {
    id: "Perspective",
    cameraType: "PerspectiveCamera",
    cameraSettings: {
      position: [7, 7, 7],
      target: [0, 0, 0],
      fov: 50,
      near: 0.1,
      far: 1000,
    },
    orbitSettings: PER_CAM_CONTROLS,
    initialRotation: [-0.615, 0.785, 0], // Stored as an array
    initialTarget: [0, 0, 0],
  },
  Top: {
    id: "Top",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [0, 10, 0],
      up: [0, 0, -1],
      ...BASE_ORTHO_CAM,
    },
    orbitSettings: ORTHO_CAM_CONTROLS,
    initialRotation: [-Math.PI / 2, 0, 0],
    initialTarget: [0, 0, 0],
  },
  Front: {
    id: "Front",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [0, 0, 10],
      ...BASE_ORTHO_CAM,
    },
    orbitSettings: ORTHO_CAM_CONTROLS,
    initialRotation: [0, 0, 0],
    initialTarget: [0, 0, 0],
  },
  Left: {
    id: "Left",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [-10, 0, 0],
      ...BASE_ORTHO_CAM,
    },
    orbitSettings: ORTHO_CAM_CONTROLS,
    initialRotation: [0, Math.PI / 2, 0],
    initialTarget: [0, 0, 0],
  },
  Right: {
    id: "Right",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [10, 0, 0],
      ...BASE_ORTHO_CAM,
    },
    orbitSettings: ORTHO_CAM_CONTROLS,
    initialRotation: [0, -Math.PI / 2, 0],
    initialTarget: [0, 0, 0],
  },
  Back: {
    id: "Back",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [0, 0, -10],
      ...BASE_ORTHO_CAM,
    },
    orbitSettings: ORTHO_CAM_CONTROLS,
    initialRotation: [0, Math.PI, 0],
    initialTarget: [0, 0, 0],
  },
  Bottom: {
    id: "Bottom",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [0, -10, 0],
      up: [0, 0, 1],
      ...BASE_ORTHO_CAM,
    },
    orbitSettings: ORTHO_CAM_CONTROLS,
    initialRotation: [Math.PI / 2, 0, 0],
    initialTarget: [0, 0, 0],
  },
};

export const useWorkspaceStore = create((set) => ({
  activeViewport: 1,
  maximizedViewport: null,
  viewports: {
    1: { id: 1, settings: defaultViews.Perspective, isCustom: false },
    2: { id: 2, settings: defaultViews.Top, isCustom: false },
    3: { id: 3, settings: defaultViews.Front, isCustom: false },
    4: { id: 4, settings: defaultViews.Left, isCustom: false },
  },

  /**
   * Updates viewport settings when changing views.
   * Ensures `initialRotation` remains stored correctly.
   */
  setViewportSettings: (viewport, newView) => {
    set((state) => ({
      viewports: {
        ...state.viewports,
        [viewport]: {
          ...state.viewports[viewport],
          settings: {
            ...defaultViews[newView],
          },
          isCustom: false,
        },
      },
    }));
  },

  setActiveViewport: (viewport) => set({ activeViewport: viewport }),
  setMaximizedViewport: (viewport) => set({ maximizedViewport: viewport }),

  setViewportCustom: (viewport, isCustom) =>
    set((state) => ({
      viewports: {
        ...state.viewports,
        [viewport]: { ...state.viewports[viewport], isCustom },
      },
    })),
}));
