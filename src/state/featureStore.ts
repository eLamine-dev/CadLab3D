import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
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

export const featureStore = createStore(
  subscribeWithSelector<FeatureState>((set) => ({
    polylines: {},
    updatePolyline: (id, data) =>
      set((state) => ({
        polylines: {
          ...state.polylines,
          [id]: {
            id,
            points: [],
            ...state.polylines[id],
            ...data,

            points: data.points
              ? data.points.map((p) => p.clone())
              : state.polylines[id]?.points || [],
          },
        },
      })),

    updatePoint: (id, index, point) =>
      set((state) => {
        const polyline = state.polylines[id];
        if (!polyline || index < 0 || index >= polyline.points.length) {
          console.warn(`Invalid point update: polyline ${id}, index ${index}`);
          return state;
        }

        const newPoints = [...polyline.points];
        newPoints[index] = point.clone();

        return {
          polylines: {
            ...state.polylines,
            [id]: {
              ...polyline,
              points: newPoints,
            },
          },
        };
      }),

    removePolyline: (id) =>
      set((state) => {
        const newPolylines = { ...state.polylines };
        delete newPolylines[id];
        return { polylines: newPolylines };
      }),
  }))
);

export const useFeatureStore = <T>(selector: (state: FeatureState) => T): T =>
  useStore(featureStore, selector);
