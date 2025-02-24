import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function Scene() {
  const cubeRef = useRef(null);

  useFrame(() => {
    if (cubeRef.current) cubeRef.current.rotation.y += 0.01;
  });

  return (
    <>
      <ambientLight />
      <directionalLight position={[2, 2, 2]} intensity={0.5} />
      <mesh ref={cubeRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
}
