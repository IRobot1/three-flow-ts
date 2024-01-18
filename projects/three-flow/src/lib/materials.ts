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
      const black = this.createMeshMaterial(<MeshBasicMaterialParameters>{ color: 'black' })
      const white = this.createMeshMaterial(<MeshBasicMaterialParameters>{ color: 'white' })
      const defaultTheme: FlowTheme = {
        'geometry-arrow': black,
        'geometry-connector': black,
        'geometry-scaling': black,
        'geometry-resizing': black,
        'geometry-label': black,
        'geometry-node': white,
        'geometry-route': white,

        'geometry-edge': white,
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
      if (!purpose || !this.materialMap.has(key)) {
        let material
        if (type == 'line')
          material = FlowMaterialUtils.LineMaterial(parameters);
        else
          material = this.createMeshMaterial(parameters);
        this.materialMap.set(key, material);
      }
    }
    else {
      key = `${type}-${purpose}`;
      if (!this.materialMap.has(key)) {
        console.warn(`Theme material ${key} not found`)
        this.materialMap.set(key, this.createMeshMaterial(<MeshBasicMaterialParameters>{ color: 'black' }))
      }
    }
    return this.materialMap.get(key)!;
  }

  // overridables

  createMeshMaterial(parameters: MaterialParameters): Material {
    return new MeshBasicMaterial(parameters);
  }
}
