import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

export type EditorMode = "free" | "create" | "modify" | "select";
export type ToolName = "box" | "sphere" | "line" | "light" | null;

export interface MetaState {
  mode: EditorMode;
  tool: ToolName;
  selection: string[];
  hovered: string | null;

  setMode: (mode: EditorMode, tool: ToolName) => void;
  clearTool: () => void;
  setSelection: (ids: string[]) => void;
  setHovered: (id: string | null) => void;
}

export const metaStore = createStore<MetaState>((set) => ({
  mode: "free",
  tool: null,
  selection: [],
  hovered: null,

  setMode: (mode, tool) => {
    set({ mode, tool });
    console.log(mode, tool);
  },
  clearTool: () => set({ tool: null }),
  setSelection: (ids) => set({ selection: ids }),
  setHovered: (id) => set({ hovered: id }),
}));

export const useMetaStore = <T>(selector: (state: MetaState) => T): T =>
  useStore(metaStore, selector);
