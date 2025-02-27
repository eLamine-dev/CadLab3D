import { create } from "zustand";

interface CameraSettings {
  cameraType: "PerspectiveCamera" | "OrthographicCamera";
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov?: number;
  near: number;
  far: number;
}

interface OrbitSettings {
  enableDamping: boolean;
  dampingFactor: number;
  zoomSpeed: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableZoom: boolean;
  zoomFactor: number;
  enablePan: boolean;
  panSpeed: number;
  enableRotate: boolean;
  rotateSpeed: number;
  enableKeys: boolean;
  keys: {
    LEFT: number;
    UP: number;
    RIGHT: number;
    BOTTOM: number;
  };
}

interface Viewport {
  id: number;
  settings: {
    cameraSettings: CameraSettings;
    orbitSettings: OrbitSettings;
  };
}

const ORBIT_SETTINGS = {
  enableDamping: false,
  dampingFactor: 0.05,
  zoomSpeed: 1.0,
  autoRotate: false,
  autoRotateSpeed: 2.0,
  enableZoom: true,
  zoomFactor: 1.0,
  enablePan: true,
  panSpeed: 1.0,
  enableRotate: true,
  rotateSpeed: 0.5,
  enableKeys: true,
  keys: { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 },
};

const defaultViews = {
  Perspective: {
    id: "Perspective",
    cameraSettings: {
      cameraType: "PerspectiveCamera",
      position: [5, 5, 5],
      target: [0, 0, 0],
      up: [0, 1, 0],

      fov: 50,
    },
    orbitSettings: { ...ORBIT_SETTINGS },
  },
  Top: {
    id: "Top",
    cameraSettings: {
      cameraType: "OrthographicCamera",
      zoom: 1.5,
      position: [0, 10, 0],
      target: [0, 0, 0],
      up: [0, 0, -1],
      near: 0.1,
      far: 1000,
    },
    orbitSettings: { ...ORBIT_SETTINGS },
  },
  Front: {
    id: "Front",
    cameraSettings: {
      cameraType: "OrthographicCamera",
      zoom: 1.5,
      position: [0, 0, 10],
      target: [0, 0, 0],
      near: 0.1,
      far: 1000,
    },
    orbitSettings: { ...ORBIT_SETTINGS },
  },
  Left: {
    id: "Left",
    cameraSettings: {
      cameraType: "OrthographicCamera",
      zoom: 1.5,
      position: [-10, 0, 0],
      target: [0, 0, 0],
      near: 0.1,
      far: 1000,
    },
    orbitSettings: { ...ORBIT_SETTINGS },
  },
  Right: {
    id: "Right",
    cameraSettings: {
      cameraType: "OrthographicCamera",
      zoom: 1.5,
      position: [10, 0, 0],
      target: [0, 0, 0],
      near: 0.1,
      far: 1000,
    },
    orbitSettings: { ...ORBIT_SETTINGS },
  },
  Back: {
    id: "Back",
    cameraSettings: {
      cameraType: "OrthographicCamera",
      zoom: 1.5,
      position: [0, 0, -10],
      target: [0, 0, 0],
      near: 0.1,
      far: 1000,
    },
    orbitSettings: { ...ORBIT_SETTINGS },
  },
  Bottom: {
    id: "Bottom",
    cameraSettings: {
      cameraType: "OrthographicCamera",
      zoom: 1.5,
      position: [0, -10, 0],
      target: [0, 0, 0],
      up: [0, 0, 1],
      near: 0.1,
      far: 1000,
    },
    orbitSettings: { ...ORBIT_SETTINGS },
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

  setActiveViewport: (viewport: number) => set({ activeViewport: viewport }),
  setMaximizedViewport: (viewport: number | null) =>
    set({ maximizedViewport: viewport }),
  setViewportSettings: (viewport: number, newView: keyof typeof defaultViews) =>
    set((state) => ({
      viewports: {
        ...state.viewports,
        [viewport]: {
          ...state.viewports[viewport],
          settings: defaultViews[newView],
        },
      },
    })),
}));
