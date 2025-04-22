import { CreationStep, CreationTool } from "./creationTypes";

export class CreationSession {
  private steps: CreationStep[];
  private stepIndex = 0;
  private tool: CreationTool;

  constructor(tool: CreationTool) {
    this.tool = tool;
    this.steps = tool.getSteps();
  }

  start() {
    this.executeCurrentStep();
  }

  private executeCurrentStep() {
    const step = this.steps[this.stepIndex];
    const handler = (event: Event) => {
      step.onEvent(event, this);
      this.advanceStep();
    };
    document.addEventListener(step.eventType, handler, { once: true });
  }

  private advanceStep() {
    this.stepIndex++;
    if (this.stepIndex < this.steps.length) {
      this.executeCurrentStep();
    } else {
      this.finish();
    }
  }

  private finish() {
    if (this.tool.onFinish) {
      this.tool.onFinish();
    }
  }

  cancel() {}
}
