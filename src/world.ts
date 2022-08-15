import * as THREE from 'three';
import { Group } from 'three';

import ResourceManager from "./resources";
import { engineConfig } from "./types";

class WorldManager {
  scene: THREE.Scene;

  gridX: number;
  gridZ: number;
  boxSize: number;

  shouldMoveUAVs: boolean = true;
  uavs: Group[] = []

  private resources: ResourceManager;

  constructor(scene: THREE.Scene, config: engineConfig) {
    this.gridX = config.gridX;
    this.gridZ = config.gridZ;
    this.boxSize = config.boxSize;

    this.scene = scene;

    this.resources = new ResourceManager();
  }

  // #region Initialization

  init() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);

    const textures = this.resources.loadTextures();
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, map: textures[0] }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, map: textures[1] }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, map: textures[2] }),
    ]

    for (let i = 0; i < this.gridX * 2; i++) {
      const mesh = new THREE.Mesh(geometry, materials[i % 3]);

      const randomX = Math.floor(Math.random() * this.gridX - (this.gridX / 2));
      const randomZ = Math.floor(Math.random() * this.gridZ - (this.gridZ / 2));
      const newPosition = this.getGridBoxCenter(randomX, randomZ);

      mesh.position.x = newPosition.x;
      mesh.position.y = 0;
      mesh.position.z = newPosition.z;

      const s = Math.random() * (this.boxSize - 10) + 10;
      mesh.scale.x = s;
      mesh.scale.y = Math.random() * 50 + 10;
      mesh.scale.z = s;

      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;

      this.scene.add(mesh);
    }

    const biggerValue = Math.max(this.gridX, this.gridZ)
    const grid = new THREE.GridHelper(biggerValue * this.boxSize, biggerValue, 0xcccccc, 0xcccccc);

    this.scene.add(grid);


    this.initModels();
  }

  initModels() {
    this.resources.loadModels('../models/uav1/scene.gltf').then((gltf) => {
      const axesHelper = new THREE.AxesHelper(20);
      gltf.scene.add(axesHelper);
      gltf.scene.position.y = 100;
      gltf.scene.position.z = -this.gridZ / 2;

      this.uavs.push(gltf.scene);
      this.scene.add(gltf.scene);
    });
  }

  // #endregion

  // #region Animation

  animateWorld(time?: DOMHighResTimeStamp) {
    if (this.shouldMoveUAVs) this.updateUAVs(time);
  }

  private updateUAVs(time: DOMHighResTimeStamp = 0.1) {

    for (let uavIndex = 0; uavIndex < this.uavs.length; uavIndex++) {
      let currentUav = this.uavs[uavIndex];

      const nextZ = currentUav.position.z + Math.abs(Math.sin(time / 2) * 0.2);
      const nextY = currentUav.position.y + Math.sin(time / 900 + 100) * 0.2;
      // console.log(nextZ);

      // if (Math.floor(time) %9 == 0) currentUav.lookAt(currentUav.position.x, nextY, nextZ);

      currentUav.position.z = nextZ;
      currentUav.position.y = nextY;

      // let angle = Math.sin(time / 200 + 300) * 0.05;
      // currentUav.rotateZ(THREE.MathUtils.degToRad(angle)); // todo: replace this with an animation prob
    }
  }

  // #endregion

  // #region Utils

  private getGridBoxCenter(x: number, z: number) {
    return new THREE.Vector3(
      x * this.boxSize + (this.boxSize / 2),
      0,
      z * this.boxSize + (this.boxSize / 2)
    );
  }

  // #endregion
}

export default WorldManager;