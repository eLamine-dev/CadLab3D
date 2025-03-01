import { create } from "zustand";
import * as THREE from "three";

export const useSceneStore = create((set) => ({
  objects: new Map(),

  addObject: (id, object) =>
    set((state) => {
      const newObjects = new Map(state.objects);
      newObjects.set(id, object);
      return { objects: newObjects };
    }),

  updateObject: (id, transform) =>
    set((state) => {
      const newObjects = new Map(state.objects);
      if (newObjects.has(id)) {
        Object.assign(newObjects.get(id), transform);
      }
      return { objects: newObjects };
    }),

  removeObject: (id) =>
    set((state) => {
      const newObjects = new Map(state.objects);
      newObjects.delete(id);
      return { objects: newObjects };
    }),
}));
