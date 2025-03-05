import { create } from "zustand";
import * as THREE from "three";

const BASE_ORTHO_CAM = {
  zoom: 1.5,
  target: [0, 0, 0],
  near: 0.1,
  far: 1000,
};

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
    matrix: null,
    initialMatrix: new THREE.Matrix4().compose(
      new THREE.Vector3(7, 7, 7),
      new THREE.Quaternion(),
      new THREE.Vector3(1, 1, 1)
    ),
  },
  Top: {
    id: "Top",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [0, 10, 0],
      up: [0, 0, -1],
      ...BASE_ORTHO_CAM,
    },
    matrix: null,
    initialMatrix: new THREE.Matrix4().compose(
      new THREE.Vector3(0, 10, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
      new THREE.Vector3(1, 1, 1)
    ),
  },
  Front: {
    id: "Front",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [0, 0, 10],
      ...BASE_ORTHO_CAM,
    },
    matrix: null,
    initialMatrix: new THREE.Matrix4().compose(
      new THREE.Vector3(0, 0, 10),
      new THREE.Quaternion(),
      new THREE.Vector3(1, 1, 1)
    ),
  },
  Left: {
    id: "Left",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [-10, 0, 0],
      ...BASE_ORTHO_CAM,
    },
    matrix: null,
    initialMatrix: new THREE.Matrix4().compose(
      new THREE.Vector3(-10, 0, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
      new THREE.Vector3(1, 1, 1)
    ),
  },

  Right: {
    id: "Right",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [10, 0, 0],
      ...BASE_ORTHO_CAM,
    },
    matrix: null,
    initialMatrix: new THREE.Matrix4().compose(
      new THREE.Vector3(10, 0, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)),
      new THREE.Vector3(1, 1, 1)
    ),
  },
  Back: {
    id: "Back",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [0, 0, -10],
      ...BASE_ORTHO_CAM,
    },
    matrix: null,
    initialMatrix: new THREE.Matrix4().compose(
      new THREE.Vector3(0, 0, -10),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
      new THREE.Vector3(1, 1, 1)
    ),
  },
  Bottom: {
    id: "Bottom",
    cameraType: "OrthographicCamera",
    cameraSettings: {
      position: [0, -10, 0],
      ...BASE_ORTHO_CAM,
    },
    matrix: null,
    initialMatrix: new THREE.Matrix4().compose(
      new THREE.Vector3(0, -10, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
      new THREE.Vector3(1, 1, 1)
    ),
  },
};

export const useViewportStore = create((set, get) => ({
  activeViewport: 1,
  previousViewport: null,

  viewports: {
    0: {
      id: 1,
      settings: {
        ...defaultViews.Perspective,
        matrix: defaultViews.Perspective.initialMatrix,
      },
    },

    1: {
      id: 2,
      settings: {
        ...defaultViews.Top,
        matrix: defaultViews.Top.initialMatrix,
      },
    },

    2: {
      id: 3,
      settings: {
        ...defaultViews.Front,
        matrix: defaultViews.Front.initialMatrix,
      },
    },

    3: {
      id: 4,
      settings: {
        ...defaultViews.Left,
        matrix: defaultViews.Left.initialMatrix,
      },
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

  setViewportSettings: (viewportId: number, newView) => {
    console.log(viewportId, newView);

    set((state) => ({
      ...state,
      viewports: {
        ...state.viewports,
        [viewportId]: {
          ...state.viewports[viewportId],
          settings: defaultViews[newView],
        },
      },
    }));
  },

  setCameraMatrix: (viewportId, matrix) =>
    set((state) => ({
      ...state,
      viewports: {
        ...state.viewports,
        [viewportId]: {
          ...state.viewports[viewportId],
          settings: {
            ...state.viewports[viewportId].settings,
            matrix: matrix,
          },
        },
      },
    })),
}));
