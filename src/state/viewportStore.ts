import { create } from "zustand";
import * as THREE from "three";

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
    initialMatrix: new THREE.Matrix4().compose(
      new THREE.Vector3(0, -10, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
      new THREE.Vector3(1, 1, 1)
    ),
  },
};

import { create } from "zustand";
import * as THREE from "three";

export const useViewportStore = create((set, get) => ({
  activeViewport: "viewport0",
  previousViewport: null,

  // 🔥 Store a matrix per camera
  cameraMatrices: {
    viewport0: defaultViews.Perspective.initialMatrix,
    viewport1: defaultViews.Top.initialMatrix,
    viewport2: defaultViews.Front.initialMatrix,
    viewport3: defaultViews.Perspective.initialMatrix,
  },

  setActiveViewport: (viewportId) => {
    const { activeViewport, cameraMatrices } = get();
    if (activeViewport !== viewportId) {
      set({
        previousViewport: activeViewport,
        cameraMatrices: {
          ...cameraMatrices,
          [activeViewport]: cameraMatrices[activeViewport], // Keep reference
        },
        activeViewport: viewportId,
      });
    }
  },

  setCameraMatrix: (viewportId, matrix) =>
    set((state) => ({
      cameraMatrices: {
        ...state.cameraMatrices,
        [viewportId]: matrix, // Keep reference, no clone()
      },
    })),

  getCameraMatrix: (viewportId) =>
    get().cameraMatrices[viewportId] || new THREE.Matrix4(),
}));
