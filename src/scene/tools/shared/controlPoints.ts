import * as THREE from "three";

export function createControlPoint(
  position: THREE.Vector3,
  metadata: any
): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    color: 0xffffff,
    depthTest: true,
    depthWrite: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.07, 0.07, 0.07);
  sprite.position.copy(position);
  sprite.userData = metadata;
  return sprite;
}
