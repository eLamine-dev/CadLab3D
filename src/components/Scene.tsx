import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";

export function Scene() {
  const cubeRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);

  useFrame(() => {
    if (cubeRef.current && selectedObject === null) {
      cubeRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <ambientLight />
      <directionalLight position={[2, 2, 2]} intensity={0.5} />
      <mesh ref={cubeRef} onClick={() => setSelectedObject(cubeRef)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={selectedObject === cubeRef ? "blue" : "orange"}
        />
      </mesh>
      {selectedObject && <TransformControls object={selectedObject} />}
    </>
  );
}
