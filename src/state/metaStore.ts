import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type EditorMode = "free" | "create" | "modify" | "select";
export type ToolName = "box" | "sphere" | "line" | "light" | null;

export interface MetaState {
  mode: EditorMode;
  tool: ToolName;

  setMode: (mode: EditorMode, tool: ToolName) => void;
  clearTool: () => void;
}

export const metaStore = createStore(
  subscribeWithSelector<MetaState>((set) => ({
    mode: "free",
    tool: null,

    setMode: (mode, tool) => {
      set({ mode, tool });
      console.log(mode, tool);
    },
    clearTool: () => set({ tool: null }),
  }))
);

export const useMetaStore = <T>(selector: (state: MetaState) => T): T =>
  useStore(metaStore, selector);
