import { GUI } from 'lil-gui';
import * as THREE from 'three';
import { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';

import '../style/style.css';
import { engineConfig } from './types';
import WorldManager from './world';


let game: engineConfig = {
  canvasElement: <HTMLCanvasElement>document.getElementById('game'),
  gridX: 30,
  gridZ: 30,
  boxSize: 25
};

class dronezEngine {
  canvasElement: HTMLCanvasElement;

  uavs: Group[] = [];

  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private controls: MapControls;
  private scene: Scene;
  private gui: GUI;

  private world: WorldManager;

  constructor(config: engineConfig) {
    this.canvasElement = config.canvasElement;

    this.scene = new THREE.Scene();
    this.world = new WorldManager(this.scene, config);
  }

  start() {
    this.init();
    this.animate();
  }

  init() {

    // Init Scene
    this.scene.background = new THREE.Color(0x0099ee);
    this.scene.fog = new THREE.FogExp2(0x0099ee, 0.0012);

    // Init Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvasElement });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Init Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 10, 1000);
    this.camera.position.set(300, 150, 0);

    this.initControls();
    this.world.init();
    this.initLights();

    // Bind events
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Draw gui ( todo: change to only debug)
    this.gui = new GUI();
    this.gui.add(this.controls, 'screenSpacePanning');
    this.gui.add(this.world, 'shouldMoveUAVs');

    const folder = this.gui.addFolder('Position');
    folder.add(this.camera.position, 'x').step(0.1).listen();
    folder.add(this.camera.position, 'y').step(0.1).listen();
    folder.add(this.camera.position, 'z').step(0.1).listen();

  }

  animate(time?: DOMHighResTimeStamp) {
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
    const dirLight1 = new THREE.DirectionalLight(0xffffff);
    dirLight1.position.set(1, 1, 1);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0099ee);
    dirLight2.position.set(- 1, - 1, - 1);
    this.scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x444444);
    this.scene.add(ambientLight);
  }
}

// Todo: add compatibility checks
const engine = new dronezEngine(game);
engine.start();