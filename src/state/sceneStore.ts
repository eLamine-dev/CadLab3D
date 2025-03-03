import { create } from "zustand";
import * as THREE from "three";

export const useSceneStore = create((set) => ({
  scene: new THREE.Scene(),
  objects: new Map(),

  addObject: (id, mesh) =>
    set((state) => {
      state.scene.add(mesh);
      const newObjects = new Map(state.objects);
      newObjects.set(id, mesh);
      return { objects: newObjects };
    }),

  moveObject: (id, x, y, z) =>
    set((state) => {
      const obj = state.objects.get(id);
      if (obj) obj.position.set(x, y, z);
      return { objects: state.objects };
    }),

  scaleObject: (id, scale) =>
    set((state) => {
      const obj = state.objects.get(id);
      if (obj) obj.scale.set(scale, scale, scale);
      return { objects: state.objects };
    }),
}));
