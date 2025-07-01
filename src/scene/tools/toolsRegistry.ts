import { SketchPolyline } from "./creation/2d/polyline";
import { boxTool } from "./creation/3d/boxTool";
import { booleanTool } from "./modification/3d/boolean";
import { extrudeTool } from "./modification/2d/extrude";
import { arcTool } from "./creation/2d/arc";

export type ToolFactory = (
  id: string,
  scene: Scene
) => {
  getSteps: () => any;
  cancel: () => void;
  finish: () => void;
};

const toolRegistry = new Map<string, ToolFactory>();

export function registerTool(name: string, factory: ToolFactory) {
  if (toolRegistry.has(name)) {
    console.warn(`Tool "${name}" already registered`);
    return;
  }
  toolRegistry.set(name, factory);
}

export function getToolFactory(name: string): ToolFactory {
  const factory = toolRegistry.get(name);
  if (!factory) throw new Error(`Tool "${name}" is not registered`);
  return factory;
}

export function listTools() {
  return Array.from(toolRegistry.keys());
}

export function initToolRegistry() {
  SketchPolyline.register();
  //   boxTool.register();
  //   booleanTool.register();
  //   extrudeTool.register();
  //   arcTool.register();
}
