import { Material, MaterialParameters, MeshBasicMaterial, MeshBasicMaterialParameters } from "three"
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader"

export class FontCache {
  private textureMap = new Map<string, Font>()

  private fontLoader = new FontLoader()

  getFont(url: string, onLoad: (data: Font) => void) {
    let font = this.textureMap.get(url)
    if (!font) {
      this.fontLoader.load(url, (texture: Font) => {
        this.textureMap.set(url, texture)
        onLoad(texture)
      })
    }
  }
}

export class MaterialCache {
  private materialMap = new Map<string, Material>()

  getMaterial(type: string, purpose: string, parameters: MeshBasicMaterialParameters): Material {
    const color = parameters.color
    const key = `${type}-${purpose}-${color}`;
    if (!this.materialMap.has(key)) {
      const material = this.createMaterial(type, purpose, parameters);
      this.materialMap.set(key, material);
    }
    return this.materialMap.get(key)!;
  }

  createMaterial(type: string, purpose: string, parameters: MaterialParameters): Material {
    return new MeshBasicMaterial(parameters);
  }
}
