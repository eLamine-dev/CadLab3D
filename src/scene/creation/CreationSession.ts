import sceneInstance from "../Scene";

import { boxTool } from "./geometry/boxTool";
import type { CreationTool, ToolName } from "./creationTypes";

export function runCreationSession(
  toolName: ToolName,
  scene: typeof sceneInstance
) {
  const tool = getTool(toolName);
  const steps = tool.getSteps(scene);
  let stepIndex = 0;
  let currentHandler: ((e: Event) => void) | undefined;

  const canvas = scene.getCanvas();

  function executeCurrentStep() {
    console.log(canvas);

    const step = steps[stepIndex];
    if (currentHandler) {
      canvas.removeEventListener(step.eventType, currentHandler);
    }
    currentHandler = (event: Event) => {
      console.log("handler", event);

      // step.onEvent(event);
      // advanceStep();
    };
    console.log(step.eventType);
    canvas.addEventListener(step.eventType, currentHandler);
  }

  function advanceStep() {
    console.log("advance");

    stepIndex++;
    if (stepIndex < steps.length) {
      executeCurrentStep();
    } else {
      finish();
    }
  }

  function finish() {
    cleanup();
    tool.onFinish?.();
  }

  function cancel() {
    cleanup();
    tool.onCancel?.();
  }

  function cleanup() {
    if (currentHandler) {
      canvas.removeEventListener(steps[stepIndex]?.eventType, currentHandler);
    }
  }

  executeCurrentStep();

  return { cancel };
}

function getTool(toolName: ToolName): CreationTool {
  switch (toolName) {
    case "box":
      return boxTool;

    default:
      throw new Error("Unknown tool: " + toolName);
  }
}
