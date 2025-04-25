import { create } from "zustand";

type EditorMode = "free" | "create" | "modify" | "select";

type ToolName = "box" | "sphere" | "line" | "light" | null;

interface MetaState {
  mode: EditorMode;
  tool: ToolName;
  selection: string[];
  hovered: string | null;

  setMode: (mode: EditorMode, tool: ToolName) => void;
  clearTool: () => void;
  setSelection: (ids: string[]) => void;
  setHovered: (id: string | null) => void;
}

export const useMetaStore = create<MetaState>((set) => ({
  mode: "free",
  tool: null,
  selection: [],
  hovered: null,

  setMode: (mode, tool) => set({ mode, tool }),
  clearTool: () => set({ tool: null }),
  setSelection: (ids) => set({ selection: ids }),
  setHovered: (id) => set({ hovered: id }),
}));
