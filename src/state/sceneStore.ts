import { create } from "zustand";
import * as THREE from "three";
import Scene from "./scene";

const masterScene = new Scene();
const scene = masterScene.getScene();

export const useSceneStore = create((set, get) => ({
  viewportScenes: {
    1: scene.clone(),
    2: scene.clone(),
    3: scene.clone(),
    4: scene.clone(),
  },

  applyTransform: (transformFn) =>
    set((state) => {
      state.viewportScenes.forEach((scene) => {
        if (scene) transformFn(scene);
      });
      return {};
    }),
}));
