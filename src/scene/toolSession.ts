import sceneInstance from "./Scene";
import { boxTool } from "./creation/3d/boxTool";
import { SketchPolyline } from "./creation/2d/polyline";
import type { CreationTool, ToolName } from "./creationTypes";
import { booleanTool } from "./modification/3d/boolean";
import { extrudeTool } from "./modification/2d/extrude";
import { arcTool } from "./creation/2d/arc";
import { metaStore } from "../state/metaStore";

type ToolFactory = (id: string, scene: Scene) => ToolSession;

export class ToolSession {
  static registry = new Map<string, ToolFactory>();
  private currentTool: ToolSession | null = null;
  private stepIndex = 0;
  private activeListeners: { type: string; handler: EventListener }[] = [];
  private canvas: HTMLCanvasElement;
  private resetMode: () => void;

  constructor(private scene: Scene) {
    this.canvas = scene.getCanvas();
    this.resetMode = () => metaStore.getState().setMode("free", null);
  }

  static register(toolName: string, factory: ToolFactory) {
    if (this.registry.has(toolName)) {
      console.warn(`Tool "${toolName}" already registered`);
    }
    this.registry.set(toolName, factory);
  }

  static has(toolName: string) {
    return this.registry.has(toolName);
  }

  static list() {
    return Array.from(this.registry.keys());
  }

  run(toolName: string) {
    const factory = ToolSession.registry.get(toolName);
    if (!factory) throw new Error(`Tool "${toolName}" is not registered`);

    const id = `${toolName}_${Date.now()}`;
    this.currentTool = factory(id, this.scene);

    const steps = this.currentTool.getSteps();
    this.stepIndex = 0;
    this.executeStep(steps);
  }

  private executeStep(steps: ReturnType<ToolSession["getSteps"]>) {
    const step = steps[this.stepIndex];
    step.events.forEach(({ type, handler }) => {
      const wrapped = (e: Event) => handler(e, () => this.advanceStep(steps));
      this.canvas.addEventListener(type, wrapped);
      this.activeListeners.push({ type, handler: wrapped });
    });
  }

  private advanceStep(steps: ReturnType<ToolSession["getSteps"]>) {
    this.cleanupStep();
    this.stepIndex++;
    if (this.stepIndex < steps.length) {
      this.executeStep(steps);
    } else {
      this.finish();
    }
  }

  private cleanupStep() {
    this.activeListeners.forEach(({ type, handler }) =>
      this.canvas.removeEventListener(type, handler)
    );
    this.activeListeners = [];
  }

  cancel() {
    this.cleanupStep();
    this.currentTool?.cancel?.();
    this.resetMode();
  }

  finish() {
    this.cleanupStep();
    this.currentTool?.finish?.();
    this.resetMode();
  }
}

// function getTool(toolName: ToolName): CreationTool {
//   switch (toolName) {
//     case "box":
//       return boxTool;
//     case "polyline":
//       return {
//         getSteps(id, scene) {
//           const polyline = new SketchPolyline(id, scene);
//           polyline.startCreation();
//           return polyline.getCreationSteps();
//         },
//       };
//     case "boolean":
//       return booleanTool;
//     case "extrude":
//       return extrudeTool;
//     case "arc":
//       return arcTool;

//     default:
//       throw new Error(`Unknown tool: ${toolName}`);
//   }
// }
