import { useEffect, useRef, useState } from "react";
import { TransformControls } from "@react-three/drei";
import { useSceneStore } from "../state/sceneStore";

export function Scene() {
  const { objects, updateObject } = useSceneStore();
  const transformRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.attach(selectedObject || null);
    }
  }, [selectedObject]);

  return (
    <>
      <ambientLight />
      <directionalLight position={[2, 2, 2]} intensity={0.5} />

      {!objects.length == 0 &&
        Array.from(objects.entries()).map(([id, obj]) => (
          <mesh
            key={id}
            ref={obj.ref}
            position={obj.position}
            rotation={obj.rotation}
            scale={obj.scale}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedObject(obj.ref.current);
            }}
          ></mesh>
        ))}

      <boxGeometry
        args={[1, 1, 1]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedObject(obj.ref.current);
        }}
      />
      <meshStandardMaterial
        color={selectedObject === obj.ref.current ? "blue" : "orange"}
      />

      <TransformControls
        ref={transformRef}
        object={selectedObject}
        onChange={() => {
          if (selectedObject) {
            updateObject(selectedObject.uuid, {
              position: selectedObject.position.toArray(),
              rotation: selectedObject.rotation.toArray(),
            });
          }
        }}
      />
    </>
  );
}
