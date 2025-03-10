import { useEffect } from "react";
import { useViewportStore } from "../state/viewportStore";

function interceptAndRedispatch(event: MouseEvent, canvas: HTMLCanvasElement) {
  if (event.defaultPrevented || (event as any)._corrected) return;
  event.stopImmediatePropagation();
  event.preventDefault();

  const { activeViewport, maximizedViewport } = useViewportStore.getState();
  const rect = canvas.getBoundingClientRect();

  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;

  let correctedX, correctedY;
  const viewports = [
    { x: 0, y: 0 }, // Top-left
    { x: 0.5, y: 0 }, // Top-right
    { x: 0, y: 0.5 }, // Bottom-left
    { x: 0.5, y: 0.5 }, // Bottom-right
  ];

  if (maximizedViewport === null) {
    const viewport = viewports[activeViewport];
    correctedX = (canvasX - viewport.x * rect.width) * 2;
    correctedY = (canvasY - viewport.y * rect.height) * 2;
  } else {
    correctedX = canvasX;
    correctedY = canvasY;
  }

  if (event.type === "wheel") {
    const wheelEvent = event as WheelEvent;

    const newWheelEvent = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaX: wheelEvent.deltaX,
      deltaY: wheelEvent.deltaY,
      deltaZ: wheelEvent.deltaZ,
      deltaMode: wheelEvent.deltaMode,
      clientX: rect.left + correctedX,
      clientY: rect.top + correctedY,
      screenX: event.screenX,
      screenY: event.screenY,
    });

    Object.defineProperty(newWheelEvent, "_corrected", {
      value: true,
      enumerable: false,
    });
    canvas.dispatchEvent(newWheelEvent);
    return;
  }

  const newEvent = new MouseEvent(event.type, {
    bubbles: true,
    cancelable: true,
    clientX: rect.left + correctedX,
    clientY: rect.top + correctedY,
    screenX: event.screenX,
    screenY: event.screenY,
    movementX: event.movementX,
    movementY: event.movementY,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    metaKey: event.metaKey,
    button: event.button,
    buttons: event.buttons,
    relatedTarget: event.relatedTarget,
    view: event.view,
  });

  Object.defineProperty(newEvent, "_corrected", {
    value: true,
    enumerable: false,
  });

  canvas.dispatchEvent(newEvent);
}

export function useCorrectedMouse() {
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const events = [
      "mousemove",
      "mousedown",
      "mouseup",
      "click",
      "dblclick",
      "contextmenu",

      "wheel",

      "pointermove",
      "pointerdown",
      "pointerup",
      "pointerover",
      "pointerout",
      "pointerenter",
      "pointerleave",
      "pointercancel",

      "dragstart",
      "drag",
      "dragend",
      "dragenter",
      "dragleave",
      "dragover",
      "drop",
    ];

    const handler = (event: MouseEvent) =>
      interceptAndRedispatch(event, canvas);

    events.forEach((eventType) => {
      canvas.addEventListener(eventType, handler, true);
    });

    return () => {
      events.forEach((eventType) => {
        canvas.removeEventListener(eventType, handler, true);
      });
    };
  }, []);
}
