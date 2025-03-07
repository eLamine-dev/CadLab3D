import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useViewportStore } from "../state/viewportStore";

export function useSimulatedMouse() {
  const { gl } = useThree();
  const { activeViewport, maximizedViewport } = useViewportStore();

  const simulateMouseEvent = (originalEvent: MouseEvent) => {
    if (maximizedViewport !== null) return;
    originalEvent.preventDefault();
    originalEvent.stopPropagation();

    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    const fullWidth = rect.width;
    const fullHeight = rect.height;
    const halfWidth = fullWidth / 2;
    const halfHeight = fullHeight / 2;

    let viewportX = originalEvent.clientX - rect.left;
    let viewportY = originalEvent.clientY - rect.top;

    const viewportOffsets = [
      { x: 0, y: halfHeight, width: halfWidth, height: halfHeight },
      { x: halfWidth, y: halfHeight, width: halfWidth, height: halfHeight },
      { x: 0, y: 0, width: halfWidth, height: halfHeight },
      { x: halfWidth, y: 0, width: halfWidth, height: halfHeight },
    ];
    const viewport = viewportOffsets[activeViewport];

    viewportX = viewport.x + viewportX * (fullWidth / viewport.width);
    viewportY = viewport.y + viewportY * (fullHeight / viewport.height);

    const simulatedEvent = new MouseEvent(originalEvent.type, {
      bubbles: true,
      cancelable: true,
      clientX: viewportX + rect.left,
      clientY: viewportY + rect.top,
      buttons: originalEvent.buttons,
    });

    // console.log(`Simulated ${originalEvent.type} at:`, {
    //   x: simulatedEvent.clientX,
    //   y: simulatedEvent.clientY,
    // });

    canvas.dispatchEvent(simulatedEvent);
  };

  useEffect(() => {
    const eventTypes = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "click",
      "dblclick",
      "contextmenu",
    ];

    eventTypes.forEach((eventType) => {
      window.addEventListener(eventType, simulateMouseEvent);
    });

    return () => {
      eventTypes.forEach((eventType) => {
        window.removeEventListener(eventType, simulateMouseEvent);
      });
    };
  }, [activeViewport, maximizedViewport, gl]);
}
