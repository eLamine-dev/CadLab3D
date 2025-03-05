import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useArrayCamera } from "../hooks/useArrayCamera";
import sceneInstance from "../state/Scene";
import { useViewportStore } from "../state/viewportStore";

function MultiViewport() {
  const arrayCamera = useArrayCamera();
  const { gl, size } = useThree();

  useFrame(() => {
    if (!arrayCamera) return;

    const fullWidth = size.width;
    const fullHeight = size.height;
    const halfWidth = fullWidth / 2;
    const halfHeight = fullHeight / 2;

    console.log = () => {};
    console.error = () => {};

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

    // requestAnimationFrame(() =>
    //   gl.render(sceneInstance.getScene(), arrayCamera.cameras[3])
    // );
  });

  return null;
}

export default function Workspace() {
  const { setActiveViewport, activeViewport } = useViewportStore();

  return (
    <div className="workspace">
      <div className="canvas-container">
        <Canvas onClick={() => console.log("click c")}>
          <MultiViewport />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
        </Canvas>
      </div>

      <div className="viewport-selection">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`viewport ${
              activeViewport === `viewport${index}` ? "active" : ""
            }`}
            onMouseDown={(e) => {
              e.stopPropagation();
              setActiveViewport(`viewport${index}`);
              console.log("click v");
            }}
          />
        ))}
      </div>
    </div>
  );
}
