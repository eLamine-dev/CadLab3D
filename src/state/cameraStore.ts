import { create } from "zustand";

export const useCameraStore = create((set) => ({
  cameras: {},

  saveCameraState: (id, cameraState) =>
    set((state) => ({
      cameras: { ...state.cameras, [id]: cameraState },
    })),

  getCameraState: (id) => (state) => state.cameras[id] || null,
}));
