import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useArrayCamera } from "../hooks/useArrayCamera";
import sceneInstance from "../state/Scene";
import { useViewportStore } from "../state/viewportStore";
import ViewSelection from "./ViewSelection";

function MultiViewport() {
  const arrayCamera = useArrayCamera();
  const { setActiveViewport, viewports } = useViewportStore();
  const { gl, size } = useThree();

  useFrame(() => {
    if (!arrayCamera) return;

    const fullWidth = size.width;
    const fullHeight = size.height;
    const halfWidth = fullWidth / 2;
    const halfHeight = fullHeight / 2;

    const viewportPositions = [
      [0, halfHeight],
      [halfWidth, halfHeight],
      [0, 0],
      [halfWidth, 0],
    ];

    requestAnimationFrame(() =>
      arrayCamera.cameras.forEach((cam, index) => {
        const [x, y] = viewportPositions[index];

        gl.setViewport(x, y, halfWidth, halfHeight);
        gl.setScissor(x, y, halfWidth, halfHeight);
        gl.setScissorTest(true);
        gl.render(sceneInstance.getScene(), cam);
      })
    );
  });

  return null;
}

export default function Workspace() {
  const {
    setActiveViewport,
    activeViewport,
    maximizedViewport,
    setMaximizedViewport,
    viewports,
  } = useViewportStore();

  return (
    <div className={`workspace ${maximizedViewport ? "maximized" : ""}`}>
      <div className="canvas-container">
        <Canvas>{/* Pass maximized state to the viewport logic */}</Canvas>
      </div>

      <div className="viewport-selection">
        {!maximizedViewport &&
          Object.keys(viewports).map((index) => (
            <div
              key={index}
              className={`viewport ${activeViewport === index ? "active" : ""}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                setActiveViewport(index);
              }}
            >
              <ViewSelection viewportId={index} />
            </div>
          ))}

        {maximizedViewport && (
          <div className="viewport maximized">
            <ViewSelection viewportId={maximizedViewport} />
          </div>
        )}
      </div>
    </div>
  );
}
