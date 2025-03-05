import { create } from "zustand";
import * as THREE from "three";

export const useViewportStore = create((set) => ({
  activeViewport: "viewport0",
  setActiveViewport: (viewportId: string) =>
    set({ activeViewport: viewportId }),

  //   cameraAssignments: {
  //     viewport1: 0,
  //     viewport2: 1,
  //     viewport3: 2,
  //     viewport4: 3,
  //   },

  arrayCamera: null,

  //   setViewportCamera: (viewportId: string, cameraIndex: number) =>
  //     set((state) => ({
  //       cameraAssignments: {
  //         ...state.cameraAssignments,
  //         [viewportId]: cameraIndex,
  //       },
  //     })),

  setArrayCamera: (camera: THREE.ArrayCamera) => set({ arrayCamera: camera }),
}));
