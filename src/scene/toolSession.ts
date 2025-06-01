import sceneInstance from "./Scene";
import { boxTool } from "./creation/3d/boxTool";
import { polylineTool } from "./creation/2d/polyline";
import type { CreationTool, ToolName } from "./creationTypes";
import { booleanTool } from "./modification/3d/boolean";
import { extrudeTool } from "./modification/2d/extrude";
import { arcTool } from "./creation/2d/arc";
import { metaStore } from "../state/metaStore";

export function runToolSession(toolName: ToolName, scene = sceneInstance) {
  const tool = getTool(toolName);
  const steps = tool.getSteps(scene);
  let stepIndex = 0;
  let activeListeners: { type: string; handler: EventListener }[] = [];

  const resetMode = metaStore.getState().setMode;

  const canvas = scene.getCanvas();

  function advanceStep() {
    cleanupStep();
    stepIndex++;
    if (stepIndex < steps.length) {
      executeStep();
    } else {
      finish();
    }
  }

  function executeStep() {
    const step = steps[stepIndex];
    step.events.forEach(({ type, handler }) => {
      const wrapped = (e: Event) => handler(e, advanceStep);
      canvas.addEventListener(type, wrapped);
      activeListeners.push({ type, handler: wrapped });
    });
  }

  function cleanupStep() {
    activeListeners.forEach(({ type, handler }) => {
      canvas.removeEventListener(type, handler);
    });
    activeListeners = [];
  }

  function finish() {
    cleanupStep();
    resetMode("free", null);
    tool.onFinish?.();
  }

  function cancel() {
    cleanupStep();
    tool.onCancel?.();
  }

  executeStep();

  return { cancel };
}

function getTool(toolName: ToolName): CreationTool {
  switch (toolName) {
    case "box":
      return boxTool;
    case "polyline":
      return polylineTool;
    case "boolean":
      return booleanTool;
    case "extrude":
      return extrudeTool;
    case "arc":
      return arcTool;

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
