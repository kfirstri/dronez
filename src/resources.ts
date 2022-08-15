import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class ResourceManager {
  loadTextures() {
    let textures = [];

    const textureLoader = new THREE.TextureLoader();

    for (let textureIndex = 1; textureIndex <= 3; textureIndex++) {
      const name = `texture${textureIndex}.jpg`
      const texture = textureLoader.load(`../models/buildings/${name}`);

      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.name = name;
      texture.repeat = new THREE.Vector2(4, 4);

      textures.push(texture);
      console.log(`loaded ${name}`);
    }

    return textures;
  }

  async loadModels(modelPath: string) {
    const loader = new GLTFLoader();

    return await loader.loadAsync(modelPath);
  }
}

export default ResourceManager;