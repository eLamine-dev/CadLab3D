import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";

export function Viewport({ position, controls }) {
  return (
    <Canvas camera={{ position, fov: 50 }}>
      <Scene />
      {controls && <OrbitControls />}
    </Canvas>
  );
}
