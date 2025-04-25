import { useEffect } from "react";
import { useMetaStore } from "../state/metaStore";
import sceneInstance from "../scene/Scene";

export function useCreate() {
  const { mode, tool } = useMetaStore();

  useEffect(() => {
    if (mode !== "create") return;

    sceneInstance.creationSession(tool);
  }, [mode, tool]);
}
