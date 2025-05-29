import { create } from "zustand";
import * as THREE from "three";

interface SelectionState {
  selected: THREE.Object3D[];
  hovered: THREE.Object3D | null;
  select: (object: THREE.Object3D, append?: boolean) => void;
  toggleSelected: (object: THREE.Object3D, append?: boolean) => void;
  setSelected: (objects: THREE.Object3D[]) => void;
  setHovered: (object: THREE.Object3D | null) => void;
  clear: () => void;
  isSelected: (object: THREE.Object3D) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selected: [],
  hovered: null,

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

  toggleSelected: (object, append = false) => {
    const current = get().selected;
    const isAlreadySelected = current.includes(object);

    if (append) {
      if (isAlreadySelected) {
        set({ selected: current.filter((o) => o !== object) });
      } else {
        set({ selected: [...current, object] });
      }
    } else {
      set({ selected: [object] });
    }

    console.log("selected", get().selected);
  },

  setSelected: (objects) => set({ selected: objects }),

  setHovered: (object) => set({ hovered: object }),

  clear: () => set({ selected: [] }),

  isSelected: (object) => get().selected.includes(object),
}));
