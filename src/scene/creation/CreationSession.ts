// CreationSession.ts
import sceneInstance from "../Scene";

export class CreationSession {
  private steps: CreationStep[];
  private stepIndex = 0;
  private tool: CreationTool;
  private currentHandler?: (event: Event) => void;
  private previewObject?: THREE.Object3D;

  constructor(toolName) {
    this.tool = tool;
    this.steps = tool.getSteps();
  }

  start() {
    this.executeCurrentStep();
  }

  private executeCurrentStep() {
    const step = this.steps[this.stepIndex];

    if (this.currentHandler) {
      document.removeEventListener(step.eventType, this.currentHandler);
    }

    this.currentHandler = (event: Event) => {
      step.onEvent(event);
      this.advanceStep();
    };

    document.addEventListener(step.eventType, this.currentHandler, {
      once: true,
    });
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
    this.cleanup();
    if (this.tool.onFinish) {
      this.tool.onFinish();
    }
  }

  cancel() {
    this.cleanup();
    if (this.tool.onCancel) {
      this.tool.onCancel();
    }
  }

  private cleanup() {
    if (this.currentHandler) {
      document.removeEventListener(
        this.steps[this.stepIndex].eventType,
        this.currentHandler
      );
    }
    if (this.previewObject) {
      sceneInstance.getScene().remove(this.previewObject);
    }
  }
}
