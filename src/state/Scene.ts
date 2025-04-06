import * as THREE from "three";

class SceneSingleton {
  static instance: SceneSingleton | null = null;
  private _scene: THREE.Scene | null = null;
  private objects = new Map<string, THREE.Object3D>();

  setScene(scene: THREE.Scene) {
    this._scene = scene;

    this.initScene();
  }

  private initScene() {
    if (!this._scene) return;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this._scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    this._scene.add(directionalLight);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    this._scene.add(box);
    this.objects.set("box", box);

    const redBox = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    redBox.position.set(3, 0, 0);
    this._scene.add(redBox);
    this.objects.set("redBox", redBox);

    const blueBox = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    blueBox.position.set(0, 3, 0);
    blueBox.castShadow = true;
    blueBox.receiveShadow = true;
    blueBox.layers.enable(0);
    this._scene.add(blueBox);
    this.objects.set("blueBox", blueBox);

    const grid = new THREE.GridHelper(10, 10);
    this._scene.add(grid);
    this.objects.set("grid", grid);

    SceneSingleton.instance = this;
  }

  getScene() {
    if (!this._scene) throw new Error("Scene not initialized");
    return this._scene;
  }

  addObject(name: string, object: THREE.Object3D, position = [0, 0, 0]) {
    object.position.set(...position);

    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      object.layers.enable(0);
    }

    this._scene.add(object);
    this.objects.set(name, object);
  }

  removeObject(name: string) {
    const obj = this.objects.get(name);
    if (obj) {
      this._scene.remove(obj);
      this.objects.delete(name);
    }
  }
}

const sceneInstance = new SceneSingleton();
export default sceneInstance;
