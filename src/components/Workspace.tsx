import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useArrayCamera } from "../hooks/useArrayCamera";
import sceneInstance from "../state/Scene";
import { useViewportStore } from "../state/viewportStore";

function MultiViewport() {
  const arrayCamera = useArrayCamera();
  const { gl, size } = useThree();

  console.log("arrayCamera", arrayCamera);

  useFrame(() => {
    if (!arrayCamera) return;

    const width = size.width / 2;
    const height = size.height / 2;

    gl.setViewport(0, height, width, height);
    gl.setScissor(0, height, width, height);
    gl.setScissorTest(true);

    gl.render(sceneInstance.getScene(), arrayCamera.cameras[0]);

    gl.setViewport(width, height, width, height);
    gl.setScissor(width, height, width, height);
    gl.setScissorTest(true);

    gl.render(sceneInstance.getScene(), arrayCamera.cameras[1]);

    gl.setViewport(0, 0, width, height);
    gl.setScissor(0, 0, width, height);
    gl.setScissorTest(true);
    gl.render(sceneInstance.getScene(), arrayCamera.cameras[2]);

    gl.setViewport(width, 0, width, height);
    gl.setScissor(width, 0, width, height);
    gl.setScissorTest(true);
    gl.render(sceneInstance.getScene(), arrayCamera.cameras[3]);
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
