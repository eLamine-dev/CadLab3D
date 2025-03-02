import * as THREE from "three";

export class Scene {
  static instance: Scene;
  scene: THREE.Scene;

  constructor() {
    if (Scene.instance) return Scene.instance;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    const Box = new THREE.BoxGeometry(1, 1, 1);
    const BoxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const BoxMesh = new THREE.Mesh(Box, BoxMaterial);
    this.scene.add(BoxMesh);

    const light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light);

    Scene.instance = this;
  }

  getScene() {
    return this.scene;
  }
}
