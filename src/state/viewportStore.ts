import { create } from "zustand";
import * as THREE from "three";

const BASE_ORTHO_CAM = {
  zoom: 3,
  target: new THREE.Vector3(0, 0, 0),
  // target: [0, 0, 0],
  near: 0.1,
  far: 1000,
};

export const defaultViews = {
  Perspective: {
    id: "Perspective",
    cameraType: "PerspectiveCamera",
    cameraSettings: {
      zoom: 1,
      position: new THREE.Vector3(7, 7, 7),
      target: new THREE.Vector3(0, 0, 0),
      // position: [7, 7, 7],
      // target: [0, 0, 0],
      up: [0, 1, 0],
      fov: 50,
      near: 0.1,
      far: 1000,
      distance: 10,
    },
  },
  Top: {
    id: "Top",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: new THREE.Vector3(0, 10, 0),
      // position: [0, 10, 0],
      up: [0, 0, -1],
      ...BASE_ORTHO_CAM,
    },
  },
  Front: {
    id: "Front",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: new THREE.Vector3(0, 0, 10),
      // position: [0, 0, 10],
      up: [0, 1, 0],
      ...BASE_ORTHO_CAM,
    },
  },
  Left: {
    id: "Left",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: new THREE.Vector3(-10, 0, 0),
      // position: [-10, 0, 0],
      up: [0, 1, 0],
      ...BASE_ORTHO_CAM,
    },
  },

  Right: {
    id: "Right",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: new THREE.Vector3(10, 0, 0),
      // position: [10, 0, 0],
      up: [0, 1, 0],
      ...BASE_ORTHO_CAM,
    },
  },
  Back: {
    id: "Back",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: new THREE.Vector3(0, 0, -10),
      // position: [0, 0, -10],
      up: [0, 1, 0],
      ...BASE_ORTHO_CAM,
    },
  },

  Bottom: {
    id: "Bottom",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: new THREE.Vector3(0, -10, 0),
      // position: [0, -10, 0],
      up: [0, 0, 1],
      ...BASE_ORTHO_CAM,
    },
  },
};

export const useViewportStore = create((set, get) => ({
  activeViewport: 0,
  previousViewport: null,
  maximizedViewport: null,

  viewports: {
    0: {
      id: 0,
      settings: {
        ...defaultViews.Perspective,
      },
      isCustom: false,
    },

    1: {
      id: 1,
      settings: {
        ...defaultViews.Top,
      },
      isCustom: false,
    },

    2: {
      id: 2,
      settings: {
        ...defaultViews.Front,
      },
      isCustom: false,
    },

    3: {
      id: 3,
      settings: {
        ...defaultViews.Left,
      },
      isCustom: false,
    },
  },

  setActiveViewport: (viewportId) => {
    const { activeViewport } = get();
    if (activeViewport !== viewportId) {
      set({
        previousViewport: activeViewport,
        activeViewport: viewportId,
      });
    }
  },

  setAsCustom: (viewportId) => {
    set((state) => ({
      ...state,
      viewports: {
        ...state.viewports,
        [viewportId]: {
          ...state.viewports[viewportId],
          settings: {
            ...state.viewports[viewportId].settings,
            cameraSettings: {
              ...state.viewports[viewportId].settings.cameraSettings,
              up: [0, 1, 0],
            },
          },
          isCustom: true,
        },
      },
    }));
  },

  setViewportSettings: (viewportId: number, newView) => {
    set((state) => ({
      ...state,
      viewports: {
        ...state.viewports,
        [viewportId]: {
          ...state.viewports[viewportId],
          settings: {
            ...defaultViews[newView],
          },
          isCustom: false,
        },
      },
    }));
  },

  updateCamSettings: (viewportId, updates) => {
    console.log("updates", updates);

    set((state) => ({
      ...state,
      viewports: {
        ...state.viewports,
        [viewportId]: {
          ...state.viewports[viewportId],
          settings: {
            ...state.viewports[viewportId].settings,
            cameraSettings: {
              ...state.viewports[viewportId].settings.cameraSettings,
              ...updates,
            },
          },
        },
      },
    }));
  },

  setMaximizedViewport: (viewportId) => {
    set((state) => ({
      maximizedViewport: state.maximizedViewport !== null ? null : viewportId,
    }));
  },
}));
