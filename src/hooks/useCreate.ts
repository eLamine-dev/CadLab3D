import { useEffect } from "react";
import { useMetaStore } from "../state/metaStore";
import { CreationSession } from "../scene/creation/CreationSession";

export function useCreate() {
  const { mode, tool } = useMetaStore();

  useEffect(() => {
    if (mode !== "create") return;

    const session = new CreationSession(tool);
    session.start();
  }, [mode, tool]);
}
