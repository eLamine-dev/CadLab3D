import { metaStore } from "../state/metaStore";

export function subscribeToStores() {
  if (this._storeUnsubscribe) return;

  let prevState = {
    mode: null as string | null,
    tool: null as string | null,
    selection: [] as string[],
    hovered: null as string | null,
  };

  this._storeUnsubscribe = metaStore.subscribe(
    // 1. Listener
    (newState) => {
      const { mode, tool, selection, hovered } = newState;

      if (prevState.mode !== mode || prevState.tool !== tool) {
        if (mode === "create" && tool) {
          this.creationSession(tool);
        } else {
          this.cancelSession();
        }
      }

      // Handle selection change
      if (JSON.stringify(prevState.selection) !== JSON.stringify(selection)) {
        this.onSelectionChange?.(selection);
      }

      // Handle hovered change
      if (prevState.hovered !== hovered) {
        this.onHoverChange?.(hovered);
      }

      prevState = newState;
    },

    // 2. Selector
    (state) => ({
      mode: state.mode,
      tool: state.tool,
      selection: state.selection,
      hovered: state.hovered,
    }),

    // 3. Options
    { fireImmediately: true }
  );
}
