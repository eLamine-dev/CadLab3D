import { metaStore } from "../state/metaStore";

export function subscribeToStores() {
  if (this._storeUnsubscribe) return;

  let prevState = { mode: null as string | null, tool: null as string | null };
  let selectionCleanup: (() => void) | undefined;

  this._storeUnsubscribe = metaStore.subscribe(
    (newState) => {
      const { mode, tool } = newState;

      if (prevState.mode !== mode || prevState.tool !== tool) {
        // Clean up previous selection handler
        if (selectionCleanup) {
          selectionCleanup();
          selectionCleanup = undefined;
        }

        if (mode === "free") {
          selectionCleanup = this.objectSelection();
        } else if (tool) {
          this.runToolSession(tool);
        } else {
          this.cancelSession();
        }
      }

      prevState = newState;
    },
    () => {
      const state = metaStore.getState();
      return { mode: state.mode, tool: state.tool };
    },
    { fireImmediately: true }
  );
}
