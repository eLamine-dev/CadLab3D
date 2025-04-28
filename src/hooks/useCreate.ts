import { useEffect } from "react";
import { useMetaStore } from "../state/metaStore";
import sceneInstance from "../scene/Scene";

export function useCreate() {
  const { mode, tool } = useMetaStore();

  useEffect(() => {
    console.log("useCreate", mode, tool);
    if (mode !== "create") return;

    sceneInstance.creationSession(tool);
  }, [mode, tool]);

  return null;
}
