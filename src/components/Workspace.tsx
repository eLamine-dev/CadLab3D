import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useArrayCamera } from "../hooks/useArrayCamera";
import scene from "../state/Scene";
import { useViewportStore } from "../state/viewportStore";

function MultiViewport() {
  const arrayCamera = useArrayCamera();
  const { gl, size } = useThree();

  useFrame(() => {
    if (!arrayCamera) return;

    const width = size.width / 2;
    const height = size.height / 2;

    arrayCamera.cameras.forEach((cam, i) => {
      const x = i % 2 === 0 ? 0 : width;
      const y = i < 2 ? height : 0;

      gl.setViewport(x, y, width, height);
      gl.setScissor(x, y, width, height);
      gl.setScissorTest(true);
      gl.render(scene.getScene(), cam);
    });
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
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`viewport ${
              activeViewport === `viewport${index}` ? "active" : ""
            }`}
            onClick={() => {
              setActiveViewport(`viewport${index}`);
              console.log("click v");
            }}
          />
        ))}
      </div>
    </div>
  );
}
