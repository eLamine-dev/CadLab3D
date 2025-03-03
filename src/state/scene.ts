import * as THREE from "three";

export default class Scene {
  static instance: Scene;
  scene: THREE.Scene;
  objects: Map<string, THREE.Object3D>;

  constructor() {
    if (Scene.instance) return Scene.instance;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);
    this.objects = new Map();

    const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(0, 0, 0);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    this.scene.add(boxMesh);
    this.objects.set("box", boxMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    Scene.instance = this;
  }

  getScene() {
    return this.scene;
  }
}
