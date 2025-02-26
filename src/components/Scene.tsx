import { useRef, useState } from "react";

import { TransformControls } from "@react-three/drei";

export function Scene() {
  const cubeRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);

  return (
    <>
      <ambientLight />
      <directionalLight position={[2, 2, 2]} intensity={0.5} />
      <mesh
        ref={cubeRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          setSelectedObject(cubeRef);
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={selectedObject === cubeRef ? "blue" : "orange"}
        />
      </mesh>
      {selectedObject && <TransformControls object={selectedObject} />}
    </>
  );
}
