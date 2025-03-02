import * as THREE from "three";
import { Center, Environment } from "@react-three/drei";

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, -10]} intensity={1} castShadow />

      <Environment preset="city" />

      <group matrixAutoUpdate={false}>
        <Center>
          <mesh castShadow>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial
              color="goldenrod"
              roughness={0.5}
              metalness={0.8}
            />
          </mesh>
        </Center>
      </group>
    </>
  );
}
