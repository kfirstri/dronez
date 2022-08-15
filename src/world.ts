import * as THREE from 'three';
import { Group } from 'three';

import ResourceManager from "./resources";
import { engineConfig } from "./types";

class WorldManager {
  scene: THREE.Scene;

  gridX: number;
  gridZ: number;
  boxSize: number;

  shouldMoveUAVs: boolean = false;
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

    const textures = this.resources.loadBuildingTextures();
    const materials = textures.map((texture) => {
      return new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, map: texture })
    });

    for (let i = 0; i < this.gridX * 2; i++) {
      const mesh = new THREE.Mesh(geometry, materials[i % 3]);

      const randomX = Math.floor(Math.random() * this.gridX);
      const randomZ = Math.floor(Math.random() * this.gridZ);
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

    // for (let i = 0; i < this.gridX; i++) {
    //   for (let j = 0; j < this.gridZ; j++) {
    //     const mesh = new THREE.Mesh(geometry, materials[1]);
    //     const pos = this.getGridBoxCenter(i, j);
    //     mesh.position.x = pos.x;
    //     mesh.position.y = 0;
    //     mesh.position.z = pos.z;

    //     mesh.scale.x = this.boxSize/2;
    //     mesh.scale.y = (i + 1) * (j + 1);
    //     mesh.scale.z = this.boxSize/2;

    //     mesh.updateMatrix();
    //     mesh.matrixAutoUpdate = false;

    //     this.scene.add(mesh);
    //   }
    // }

    const biggerValue = Math.max(this.gridX, this.gridZ)

    const groundGeometry = new THREE.BoxGeometry(biggerValue * this.boxSize, 3, biggerValue * this.boxSize)
    const plane = new THREE.Mesh(groundGeometry, this.getAsphaltMaterial());
    plane.position.y = -2.1;

    const grid = new THREE.GridHelper(biggerValue * this.boxSize, biggerValue, 0xaaaaaa, 0xc49a10);

    this.scene.add(grid);
    this.scene.add(plane);

    this.initModels();
  }

  private getAsphaltMaterial() {
    const DiffuseTexture = this.resources.loadTexture('/asphalt/Asphalt_001_COLOR.jpg');
    const NormalTexture = this.resources.loadTexture('/asphalt/Asphalt_001_NRM.jpg');
    const DisplacementTexture = this.resources.loadTexture('/asphalt/Asphalt_001_DISP.png');
    const SpecularityTexture = this.resources.loadTexture('/asphalt/Asphalt_001_SPEC.jpg');
    const OcclusionTexture = this.resources.loadTexture('/asphalt/Asphalt_001_OCC.jpg');

    return new THREE.MeshPhongMaterial(
      {
        color: 0xffffff,
        aoMap: OcclusionTexture,
        displacementMap: DisplacementTexture,
        specularMap: SpecularityTexture,
        normalMap: NormalTexture,
        map: DiffuseTexture
      }
    )
  }

  initModels() {
    this.resources.loadModels('../resources/uav1/scene.gltf').then((gltf) => {
      const axesHelper = new THREE.AxesHelper(20);
      gltf.scene.add(axesHelper);
      gltf.scene.position.y = 30;

      const pos = this.getGridBoxCenter(4,4);

      gltf.scene.position.z = pos.z;
      gltf.scene.position.x = pos.x;
      console.log(gltf.scene.position);

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
    const realX = (x - Math.floor(this.gridX / 2)) * this.boxSize;
    const realZ = (z - Math.floor(this.gridX / 2)) * this.boxSize;
    return new THREE.Vector3(realX + Math.floor(this.boxSize / 2), 0, realZ + Math.floor(this.boxSize / 2));
  }

  // #endregion
}

export default WorldManager;