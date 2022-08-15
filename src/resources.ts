import * as THREE from 'three';
import { Texture, TextureLoader } from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class ResourceManager {

  private loader?: THREE.TextureLoader;

  constructor() {
    this.loader = undefined;
  }

  private getTextureLoader() {
    return this.loader == undefined ? new THREE.TextureLoader() : this.loader;
  }

  loadBuildingTextures() {
    let textures = [];

    for (let textureIndex = 1; textureIndex <= 3; textureIndex++) {
      const name = `texture${textureIndex}.jpg`
      const texture = this.loadTexture(`/buildings/${name}`);
      textures.push(texture);
    }

    return textures;
  }

  loadTexture(path: string) {
    const texture = this.getTextureLoader().load(`../resources/${path}`);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.name = path;
    texture.repeat = new THREE.Vector2(4, 4);
    return texture;
  }

  async loadModels(modelPath: string) {
    const loader = new GLTFLoader();

    return await loader.loadAsync(modelPath);
  }
}

export default ResourceManager;