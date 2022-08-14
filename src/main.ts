import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui'

import '../style/style.css';
import { gameSystem } from './types';

let renderer: WebGLRenderer;
let camera: PerspectiveCamera;
let controls: MapControls;
let scene: Scene;
let gui: GUI;

let game: gameSystem = {
  uavs: [],
  moveUAVs: true,
  height: 600,
  width: 600
};

const render = () => {
  renderer.render(scene, camera);
}

const updateUAVs = (time: DOMHighResTimeStamp) => {
  for (let uavIndex = 0; uavIndex < game.uavs.length; uavIndex++) {
    let currentUav = game.uavs[uavIndex];
    currentUav.position.z += Math.abs(Math.cos(time / (800 * uavIndex / 2)) * 0.2 * uavIndex / 2);
    // uav.position.y += Math.cos(time / 1000) * 0.2;

    let angle = Math.sin(time / 200 + 300) * 0.05;
    currentUav.rotateZ(THREE.MathUtils.degToRad(angle)); // todo: replace this with an animation prob
  }
}

const animate = (time: DOMHighResTimeStamp) => {
  requestAnimationFrame(animate);

  controls.update();

  if (game.moveUAVs) updateUAVs(time);

  render();
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

const initControls = () => {
  controls = new MapControls(camera, renderer.domElement);

  controls.enableDamping = false;
  controls.dampingFactor = 0.06;

  controls.screenSpacePanning = false;

  controls.minDistance = 100;
  controls.maxDistance = 800;

  controls.maxPolarAngle = Math.PI / 2;
}

const initWorld = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.translate(0, 0.5, 0);

  const material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });

  for (let i = 0; i < 100; i++) {
    const mesh = new THREE.Mesh(geometry, material);

    let boxAmount = game.height / 20;

    mesh.position.x = (Math.random() * boxAmount - (boxAmount / 2)) * 20;
    mesh.position.y = 0;
    mesh.position.z = (Math.random() * boxAmount - (boxAmount / 2)) * 20;

    mesh.scale.x = 20;
    mesh.scale.y = Math.random() * 50 + 10;
    mesh.scale.z = 20;

    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;

    scene.add(mesh);
  }

  const grid = new THREE.GridHelper(game.height, game.height / 20);

  scene.add(grid);

  // scene.add(helper2);

}

const initLights = () => {
  const dirLight1 = new THREE.DirectionalLight('red');
  dirLight1.position.set(1, 1, 1);
  const helper1 = new THREE.DirectionalLightHelper( dirLight1, 100 );
  scene.add(dirLight1);
  scene.add(helper1);

  const dirLight2 = new THREE.DirectionalLight('blue');
  dirLight2.position.set(- 1, - 1, - 1);
  const helper2 = new THREE.DirectionalLightHelper( dirLight2, 100 );
  scene.add(dirLight2);
  scene.add(helper2);

  const ambientLight = new THREE.AmbientLight(0x111111);
  scene.add(ambientLight);
}

const initModels = () => {
  const loader = new GLTFLoader();

  loader.load('../models/uav1/scene.gltf',
    (gltf) => {
      gltf.scene.position.y = 100;
      game.uavs.push(gltf.scene);
      scene.add(gltf.scene);

      let clone = gltf.scene.clone();

      clone.position.y = 130;
      game.uavs.push(clone);
      scene.add(clone);
    }, undefined,
    (error) => {
      console.log('Failed loading GLTF model');
      console.error(error);
    }
  )
}

const init = () => {

  // Init Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);
  scene.fog = new THREE.FogExp2(0xeeeeee, 0.002);

  // Init Renderer
  let canvasElement = <HTMLCanvasElement>document.getElementById('game');
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasElement });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Init Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 10, 1000);
  camera.position.set(400, 200, 0);

  initControls();
  initWorld();
  initLights();
  initModels();


  // Bind events
  window.addEventListener('resize', onWindowResize);

  // Draw gui ( todo: change to only debug)
  gui = new GUI();
  gui.add(controls, 'screenSpacePanning');
  gui.add(game, 'moveUAVs');
  const folder = gui.addFolder('Position');
  folder.add(camera.position, 'x').step(0.1).listen();
  folder.add(camera.position, 'y').step(0.1).listen();
  folder.add(camera.position, 'z').step(0.1).listen();

}


// todo: move this after loading everything
init();
animate();
