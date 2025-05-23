import sceneInstance from "../Scene";
import { boxTool } from "./geometry/boxTool";
import type { CreationTool, ToolName } from "./creationTypes";

export function runCreationSession(toolName: ToolName, scene = sceneInstance) {
  const tool = getTool(toolName);
  const steps = tool.getSteps(scene);
  let stepIndex = 0;
  let activeListeners: { type: string; handler: EventListener }[] = [];

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
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
