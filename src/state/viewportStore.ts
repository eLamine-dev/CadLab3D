import { create } from "zustand";
import * as THREE from "three";

export const useViewportStore = create((set) => ({
  activeViewport: "viewport1",
  setActiveViewport: (viewportId: string) =>
    set({ activeViewport: viewportId }),

  cameraAssignments: {
    viewport1: 0, // Index in ArrayCamera.cameras
    viewport2: 1,
    viewport3: 2,
    viewport4: 3,
  },

  arrayCamera: null, // Stores the shared ArrayCamera instance
  scene: new THREE.Scene(), // Global shared scene

  setViewportCamera: (viewportId: string, cameraIndex: number) =>
    set((state) => ({
      cameraAssignments: {
        ...state.cameraAssignments,
        [viewportId]: cameraIndex,
      },
    })),

  setArrayCamera: (camera: THREE.ArrayCamera) => set({ arrayCamera: camera }),
}));
