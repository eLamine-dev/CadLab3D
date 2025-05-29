import { metaStore } from "../state/metaStore";
import { useSelectionStore } from "../state/selectionStore";

export function subscribeToStores() {
  if (this._storeUnsubscribe) return;

  let selectionCleanup: (() => void) | null = null;
  let prevState = {
    mode: null as string | null,
    tool: null as string | null,
  };

  this._storeUnsubscribe = metaStore.subscribe(
    (newState) => {
      const { mode, tool } = newState;

      // Handle mode/tool changes
      if (prevState.mode !== mode || prevState.tool !== tool) {
        // Clean up previous selection if it exists
        if (selectionCleanup) {
          selectionCleanup();
          selectionCleanup = null;
        }

        // Activate selection only in free mode
        if (mode === "free") {
          selectionCleanup = this.objectSelection();
        }

        if (mode !== "free" && tool) {
          this.toolSession(tool);
        } else {
          this.cancelSession();
        }
      }

      prevState = newState;
    },
    () => {
      const state = metaStore.getState();
      return {
        mode: state.mode,
        tool: state.tool,
      };
    },
    { fireImmediately: true }
  );
}
