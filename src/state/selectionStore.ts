import { create } from "zustand";
import * as THREE from "three";

interface SelectionState {
  selected: THREE.Object3D[];
  select: (object: THREE.Object3D, append?: boolean) => void;
  clear: () => void;
  isSelected: (object: THREE.Object3D) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selected: [],
  select: (object, append = false) => {
    if (!append) {
      set({ selected: [object] });
    } else {
      const current = get().selected;
      if (!current.includes(object)) {
        set({ selected: [...current, object] });
      }
    }
  },
  clear: () => set({ selected: [] }),
  isSelected: (object) => get().selected.includes(object),
}));
