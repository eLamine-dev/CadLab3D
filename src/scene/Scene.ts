import * as THREE from "three";
import { runToolSession } from "./toolSession";
import { subscribeToStores } from "./subscribeToStores";
import { objectSelection } from "./selection/objectSelection";
import { occAPI } from "./occ/occAPI";

class SceneSingleton {
  static instance: SceneSingleton | null = null;
  private _scene: THREE.Scene | null = null;

  private occ: Awaited<ReturnType<typeof loadOpenCascade>> | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private objects = new Map<string, THREE.Object3D>();
  private activeSession: ReturnType<typeof runToolSession> | null = null;

  constructor() {
    this.subscribeToStores = subscribeToStores.bind(this);
    this.objectSelection = objectSelection.bind(this);
    // this.unsubscribeFromStores = unsubscribeFromStores.bind(this);
  }

  async bridgeScenes(scene: THREE.Scene, canvas: HTMLCanvasElement) {
    this._scene = scene;
    this._canvas = canvas;

    this.initScene();
    this.subscribeToStores();

    // occAPI.init();
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
      new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    box.position.set(0, 0.5, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    box.layers.enable(0);
    this._scene.add(box);
    this.objects.set("box", box);

    const grid = new THREE.GridHelper(10, 10);
    grid.userData.nonSelectable = true;
    this._scene.add(grid);
    this.objects.set("grid", grid);

    SceneSingleton.instance = this;
  }

  getScene() {
    if (!this._scene) throw new Error("Scene not initialized");
    return this._scene;
  }

  getCanvas() {
    if (!this._canvas) throw new Error("Scene not initialized");
    return this._canvas;
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

  toolSession(toolName: ToolName) {
    this.cancelSession();
    this.activeSession = runToolSession(toolName, this);
  }

  cancelSession() {
    this.activeSession?.cancel();
    this.activeSession = null;
  }
}

const sceneInstance = new SceneSingleton();
export default sceneInstance;
