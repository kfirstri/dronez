import * as THREE from 'three';

import ResourceManager from "./resources";
import { Command, GameConfig, UAVConfig } from "./types";
import UAV from './UAV';

class WorldManager {
  scene: THREE.Scene;

  gridX: number;
  gridZ: number;
  boxSize: number;

  randomBuildingsAmount: number;

  uavsConfig: UAVConfig[]

  shouldMoveUAVs: boolean = false;
  uavs: Map<string, UAV>;

  private resources: ResourceManager;

  // Time Management
  startTime: number | undefined;
  currentStep: number = 0;
  lastStep: number = -1;
  readonly stepLength = 4000; // Step length in ms

  // commands
  commandsRunning: boolean = false;
  longestCommand: number = 0;

  constructor(scene: THREE.Scene, config: GameConfig) {
    this.gridX = config.mapConfig.gridX;
    this.gridZ = config.mapConfig.gridZ;
    this.boxSize = config.mapConfig.boxSize;

    this.randomBuildingsAmount = config.mapConfig.randomBuildings;
    this.uavsConfig = config.mapConfig.UAVs;

    this.scene = scene;

    this.resources = new ResourceManager();
    this.uavs = new Map();
  }

  // #region Initialization

  /**
   * Generate random buildings and the ground + grid
   */
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
      for (let UAVConfig of this.uavsConfig) {
        const uav = new UAV(gltf.scene.clone(true), this, UAVConfig);

        const pos = this.getGridBoxCenter(UAVConfig.position.x, UAVConfig.position.y);

        uav.name = UAVConfig.name;

        uav.position.z = pos.z;
        uav.position.x = pos.x;
        uav.position.y = 5;

        this.uavs?.set(uav.name, uav);
        this.scene.add(uav);
      }
    });
  }

  // #endregion

  // #region Commands

  runCommands(commands: Command[]) {
    // Load each drone it's command
    for (let command of commands) {
      this.uavs?.get(command.UAVId)?.commands.push(command);
    }

    // reset steps
    this.currentStep = 0;
    this.lastStep = -1;

    // Run the commands
    this.longestCommand = Math.max(...Array.from(this.uavs?.values()).map((uav) => uav.commands.length));
    this.commandsRunning = true;
  }

  // #endregion

  // #region Animation

  /**
   * The world animation - should only animate
   */
  animateWorld(time: DOMHighResTimeStamp) {
    if (!this.commandsRunning) return;

    if (this.startTime == undefined) {
      this.startTime = time;
    }

    const elapsed = time - this.startTime;

    this.updateUAVs(time, elapsed);

    // New Step
    const isStepDone = elapsed - (this.currentStep * this.stepLength) >= this.stepLength;
    if (isStepDone) {
      this.currentStep++;
      if (this.currentStep >= this.longestCommand) this.commandsRunning = false;
    }
  }

  private updateUAVs(time: DOMHighResTimeStamp, elapsed: number) {
    if (!this.uavs) return;

    // Every new step we have to calculate the UAV new target (this probably can go into the UAV class?)
    if (this.lastStep != this.currentStep) {
      this.uavs.forEach((uav) => { uav.target = uav.getNextTarget(this.currentStep) });
      this.lastStep = this.currentStep;
    }

    this.uavs.forEach((uav) => uav.animate(time, elapsed));
  }

  // #endregion

  // #region Utils

  /**
   * Because we have a grid i wanted the access to the tiles will be like a matrix (<0,0> is the top left corner)
   * we got this little calculation method that for a given <x,z> ( this is because this is the width an height in threejs)
   * you get the actual center-tile position on the board
   * @param x 
   * @param z 
   * @returns 
   */
  getGridBoxCenter(x: number, z: number) {
    const realX = (x - Math.floor(this.gridX / 2)) * this.boxSize;
    const realZ = (z - Math.floor(this.gridX / 2)) * this.boxSize;
    return new THREE.Vector3(realX + Math.floor(this.boxSize / 2), 0, realZ + Math.floor(this.boxSize / 2));
  }

  // #endregion
}

export default WorldManager;