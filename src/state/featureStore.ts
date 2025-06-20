import { create } from "zustand";
import * as THREE from "three";

export type PolylineData = {
  id: string;
  points: THREE.Vector3[];
};

type FeatureState = {
  polylines: Record<string, PolylineData>;
  updatePolyline: (id: string, data: Partial<PolylineData>) => void;
  removePolyline: (id: string) => void;
};

export const useFeatureStore = create<FeatureState>((set) => ({
  polylines: {},
  updatePolyline: (id, data) =>
    set((state) => ({
      polylines: {
        ...state.polylines,
        [id]: { ...state.polylines[id], ...data },
      },
    })),
  removePolyline: (id) =>
    set((state) => {
      const newPolylines = { ...state.polylines };
      delete newPolylines[id];
      return { polylines: newPolylines };
    }),
}));
