import { Material, MaterialParameters, MeshBasicMaterial, MeshBasicMaterialParameters } from "three";
import { LineMaterial, LineMaterialParameters } from "three/examples/jsm/lines/LineMaterial";


export class FlowMaterialUtils {
  static LineMaterial(parameters: LineMaterialParameters): Material {
    const material = new LineMaterial(parameters);
    material.resolution.set(window.innerWidth, window.innerHeight); // resolution of the viewport
    material.worldUnits = false
    return material
  }
}

export interface FlowTheme {
  [key: string]: Material
}



export class FlowMaterials {
  private materialMap = new Map<string, Material>()
  private themesMap = new Map<string, FlowTheme>()

  constructor(theme?: FlowTheme) {
    if (theme)
      this.addTheme('default', theme)
    else {
      const defaultTheme: FlowTheme = {
        'geometry-arrow': new MeshBasicMaterial({ color: 'black' }),
        'geometry-connector': new MeshBasicMaterial({ color: 'black' }),
        'geometry-scaling': new MeshBasicMaterial({ color: 'black' }),
        'geometry-resizing': new MeshBasicMaterial({ color: 'black' }),
        'geometry-label': new MeshBasicMaterial({ color: 'black' }),
        'geometry-node': new MeshBasicMaterial({ color: 'white' }),
        'geometry-route': new MeshBasicMaterial({ color: 'white' }),

        'geometry-edge': new MeshBasicMaterial({ color: 'white' }),
        'line-edge': FlowMaterialUtils.LineMaterial({ color: 0xffffff }),
      }
      this.addTheme('default', defaultTheme)
    }
  }


  addTheme(name: string, theme: FlowTheme) {
    this.themesMap.set(name, theme)
    for (let key in theme) {
      const material = this.materialMap.get(key);
      // add any material introduced by this theme
      if (!material)
        this.materialMap.set(key, theme[key])
    }
  }

  setTheme(name: string) {
    const theme = this.themesMap.get(name)
    if (theme) {
      for (let key in theme) {
        const material = this.materialMap.get(key);
        if (material)
          material.copy(theme[key])
      }
    }
  }

  getMaterial(type: string, purpose: string, parameters?: MaterialParameters): Material {
    let key: string
    if (parameters) {
      const color = (parameters as MeshBasicMaterialParameters).color
      key = `${type}-${purpose}|${color}`;
      if (!this.materialMap.has(key)) {
        let material
        if (type == 'line')
          material = FlowMaterialUtils.LineMaterial(parameters);
        else
          material = this.createMeshMaterial(purpose, parameters);
        this.materialMap.set(key, material);
      }
    }
    else {
      key = `${type}-${purpose}`;
      if (!this.materialMap.has(key)) {
        console.warn(`Theme material ${key} not found`)
        this.materialMap.set(key, new MeshBasicMaterial({ color: 'black' }))
      }
    }
    return this.materialMap.get(key)!;
  }

  // overridables

  createMeshMaterial(purpose: string, parameters: MaterialParameters): Material {
    return new MeshBasicMaterial(parameters);
  }
}
