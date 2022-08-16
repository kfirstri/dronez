import { GUI } from 'lil-gui';
import * as THREE from 'three';
import { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';

import '../style/style.css';
import { GameConfig, Command } from './types';
import { CommandType } from './utils';
import WorldManager from './world';

class dronezGame {
  canvasElement: HTMLCanvasElement;

  uavs: Group[] = [];

  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private controls: MapControls;
  private scene: Scene;
  private gui: GUI;

  private world: WorldManager;

  constructor(config: GameConfig) {
    this.canvasElement = config.canvasElement;

    this.scene = new THREE.Scene();
    this.world = new WorldManager(this.scene, config);
  }

  start() {
    this.init();
    this.animate(0.001);
  }

  /**
   * Run commands for the uavs
   * @param commands a list of Command objects
   */
  runCommands(commands: Command[]) {
    this.world.runCommands(commands);
  }

  init() {

    // Init Scene
    this.scene.background = new THREE.Color(0x7dcff5);
    this.scene.fog = new THREE.FogExp2(0xf7f2c8, 0.0012);

    // Init Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvasElement });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Init Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 10, 1000);
    this.camera.position.set(0, 150, 300);

    this.initControls();
    this.world.init();
    this.initLights();

    // Bind events
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Draw gui ( todo: change to only debug)
    this.gui = new GUI();
    this.gui.add(this.controls, 'screenSpacePanning');
    this.gui.add(this.world, 'shouldMoveUAVs');
    this.gui.add(this.world, 'currentStep').listen();

    const folder = this.gui.addFolder('Position');
    folder.add(this.camera.position, 'x').step(0.1).listen();
    folder.add(this.camera.position, 'y').step(0.1).listen();
    folder.add(this.camera.position, 'z').step(0.1).listen();

  }

  /**
   * The method the actually runs the animation and rendering
   * @param time current animation time
   */
  animate(time: DOMHighResTimeStamp) {
    requestAnimationFrame((time) => this.animate(time));

    this.controls.update();

    this.world.animateWorld(time);

    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  initControls() {
    this.controls = new MapControls(this.camera, this.renderer.domElement);

    this.controls.enableDamping = false;
    this.controls.dampingFactor = 0.06;

    this.controls.screenSpacePanning = false;

    this.controls.minDistance = 100;
    this.controls.maxDistance = 800;

    this.controls.maxPolarAngle = Math.PI / 2;
  }

  initLights() {
    const dirLight1 = new THREE.DirectionalLight(0xcccccc, 0.5);
    dirLight1.position.set(1, 1, 1);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc4bc7a, 0.5);
    dirLight2.position.set(- 1, - 1, - 1);
    this.scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0xf7f2c8, 0.6);
    this.scene.add(ambientLight);
  }
}


const game: GameConfig = {
  canvasElement: <HTMLCanvasElement>document.getElementById('game'),
  mapConfig: {
    randomBuildings: 30,
    gridX: 20,
    gridZ: 20,
    boxSize: 20,
    UAVs: [
      {
        position: { x: 5, y: 5 },
        name: "1"
      },
      {
        position: { x: 5, y: 6 },
        name: "2"
      },
    ]
  }
};

let commands: Command[] = [
  {
    UAVId: "1",
    command: CommandType.TAKEOFF
  },
  {
    UAVId: "2",
    command: CommandType.TAKEOFF
  },
  {
    UAVId: "1",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 1,
        y: 0
      }
    }
  },
  {
    UAVId: "2",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 0,
        y: -1
      }
    },
  },
  {
    UAVId: "1",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 1,
        y: 0
      }
    }
  },
  {
    UAVId: "2",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 0,
        y: -1
      }
    },
  },
  {
    UAVId: "1",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 1,
        y: 0
      }
    }
  },
  {
    UAVId: "2",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 0,
        y: -1
      }
    },
  },
  {
    UAVId: "1",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 1,
        y: 0
      }
    }
  },
  {
    UAVId: "2",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 0,
        y: -1
      }
    },
  },
  {
    UAVId: "1",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 1,
        y: 0
      }
    }
  },
  {
    UAVId: "1",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 1,
        y: 1
      }
    }
  },
  {
    UAVId: "1",
    command: CommandType.MOVE,
    data: {
      angle: undefined,
      direction: {
        x: 1,
        y: 0
      }
    }
  },
];

// Todo: add compatibility checks
const engine = new dronezGame(game);
engine.start();
engine.runCommands(commands);