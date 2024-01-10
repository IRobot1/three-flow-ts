import { Material, MaterialParameters, MeshBasicMaterial, MeshBasicMaterialParameters } from "three";
import { LineMaterial, LineMaterialParameters } from "three/examples/jsm/lines/LineMaterial";

export class FlowMaterials {
  private materialMap = new Map<string, Material>()

  getMaterial(type: string, purpose: string, parameters: MaterialParameters): Material {
    const color = (parameters as MeshBasicMaterialParameters).color
    const key = `${type}-${purpose}|${color}`;
    if (!this.materialMap.has(key)) {
      let material
      if (type == 'line')
        material = this.createLineMaterial(purpose, parameters);
      else
        material = this.createMeshMaterial(purpose, parameters);
      this.materialMap.set(key, material);
    }
    return this.materialMap.get(key)!;
  }

  // overridables
  
  createLineMaterial(purpose: string, parameters: LineMaterialParameters): Material {
    const material = new LineMaterial(parameters);
    material.resolution.set(window.innerWidth, window.innerHeight); // resolution of the viewport
    material.worldUnits = false
    return material
  }

  createMeshMaterial(purpose: string, parameters: MaterialParameters): Material {
    return new MeshBasicMaterial(parameters);
  }
}


