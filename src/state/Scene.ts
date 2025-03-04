import * as THREE from "three";

class SceneSingleton {
  static instance: SceneSingleton | null = null;
  private scene: THREE.Scene;
  private objects: Map<string, THREE.Object3D>;

  constructor() {
    if (!SceneSingleton.instance) {
      this.scene = new THREE.Scene();
      this.objects = new Map();

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 10);
      this.scene.add(directionalLight);

      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
      this.scene.add(box);
      this.objects.set("box", box);

      SceneSingleton.instance = this;
    }
    return SceneSingleton.instance;
  }

  getScene() {
    return this.scene;
  }

  addObject(name: string, object: THREE.Object3D) {
    this.scene.add(object);
    this.objects.set(name, object);
  }

  removeObject(name: string) {
    const obj = this.objects.get(name);
    if (obj) {
      this.scene.remove(obj);
      this.objects.delete(name);
    }
  }
}

const sceneInstance = new SceneSingleton();
export default sceneInstance;
