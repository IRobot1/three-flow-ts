import { Material, MeshBasicMaterial } from "three"
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial"
import { FlowMaterials } from "./materials"

export interface FlowTheme {
  [key: string]: Material
}

const defaultTheme: FlowTheme = {
  'geometry-arrow': new MeshBasicMaterial({ color: 'black' }),
  'geometry-connector': new MeshBasicMaterial({ color: 'black' }),
  'geometry-edge': new MeshBasicMaterial({ color: 'black' }),
  'geometry-scaling': new MeshBasicMaterial({ color: 'black' }),
  'geometry-resizing': new MeshBasicMaterial({ color: 'black' }),
  'geometry-label': new MeshBasicMaterial({ color: 'black' }),
  'geometry-node': new MeshBasicMaterial({ color: 'white' }),
  'geometry-route': new MeshBasicMaterial({ color: 'white' }),
  'line-edge': new LineMaterial({ color: 0 }),
}

export class FlowThemeManager {
  private materialMap = new Map<string, Material>()
  private themesMap = new Map<string, FlowTheme>()

  constructor() {
    for (let key in defaultTheme) {
      this.materialMap.set(key, defaultTheme[key]);
    }
  }


  getThemeMaterial(type: string, purpose: string): Material {
    let material: Material
    const key = `${type}-${purpose}`;
    if (!this.materialMap.has(key)) {
      console.warn(`Theme material ${key} not found`)
    }
    return this.materialMap.get(key)!;
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

  // overridables
}


