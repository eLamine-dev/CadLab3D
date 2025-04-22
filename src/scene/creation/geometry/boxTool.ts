import { CreationTool } from "../../creationTypes";
import { getWorldPointFromMouse, createBoxMesh } from "../../utils/helpers";


export const boxTool: CreationTool = {
  getSteps() {
    let start: THREE.Vector3;
    let end: THREE.Vector3;

    return [
      {
        eventType: "mousedown",
        onEvent: (e: MouseEvent) => {
          start = getWorldPointFromMouse(e);
        },
      },
      {
        eventType: "mouseup",
        onEvent: (e: MouseEvent) => {
          end = getWorldPointFromMouse(e);
        },
      },
      {
        eventType: "click",
        onEvent: (e: MouseEvent) => {
          const height = getHeightFromMouse(e); /
          const mesh = createBoxMesh(start, end, height);
          window.scene.add(mesh);
        },
      },
    ];
  },
  onFinish() {
    console.log("Box creation finished");
  },
};
