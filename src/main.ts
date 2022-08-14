import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui'

import '../style/style.css';


let renderer: WebGLRenderer;
let camera: PerspectiveCamera;
let controls: MapControls;
let scene: Scene;

const render = () => {
  renderer.render(scene, camera);
}

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

const initControls = () => {
  controls = new MapControls(camera, renderer.domElement);

  controls.enableDamping = true;
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

  for (let i = 0; i < 500; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = 0;
    mesh.position.z = Math.random() * 1600 - 800;

    mesh.scale.x = 20;
    mesh.scale.y = Math.random() * 80 + 10;
    mesh.scale.z = 20;

    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    
    scene.add(mesh);
  }
}

const initLights = () => {
  const dirLight1 = new THREE.DirectionalLight(0xffffff);
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x002288);
  dirLight2.position.set(- 1, - 1, - 1);
  scene.add(dirLight2);

  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);
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
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(400, 200, 0);

  initControls();

  initWorld();

  initLights();


  // Bind events
  window.addEventListener('resize', onWindowResize);

  // Draw gui ( todo: change to only debug)
  const gui = new GUI();
  gui.add(controls, 'screenSpacePanning');

}


// todo: move this after loading everything
init();
animate();
