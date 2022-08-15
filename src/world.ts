import * as THREE from 'three';
import { Group } from 'three';

import ResourceManager from "./resources";
import { GameConfig, UAV } from "./types";

class WorldManager {
  scene: THREE.Scene;

  gridX: number;
  gridZ: number;
  boxSize: number;

  randomBuildingsAmount: number;

  uavsConfig: UAV[]

  shouldMoveUAVs: boolean = false;
  uavs: Group[] = []

  private resources: ResourceManager;

  constructor(scene: THREE.Scene, config: GameConfig) {
    this.gridX = config.mapConfig.gridX;
    this.gridZ = config.mapConfig.gridZ;
    this.boxSize = config.mapConfig.boxSize;

    this.randomBuildingsAmount = config.mapConfig.randomBuildings;
    this.uavsConfig = config.mapConfig.UAVs;

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

    for (let i = 0; i < this.randomBuildingsAmount; i++) {
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

      for (let UAVConfig of this.uavsConfig) {
        const currentUAVScene = gltf.scene.clone(true);

        const pos = this.getGridBoxCenter(UAVConfig.position.x, UAVConfig.position.y);

        currentUAVScene.name = UAVConfig.name;

        currentUAVScene.position.z = pos.z;
        currentUAVScene.position.x = pos.x;
        currentUAVScene.position.y = 50;

        this.uavs.push(currentUAVScene);
        this.scene.add(currentUAVScene);
      }
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

      let angle = Math.sin(time / 20 + 300) * 0.05;
      currentUav.rotateZ(THREE.MathUtils.degToRad(angle)); // todo: replace this with an animation prob
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