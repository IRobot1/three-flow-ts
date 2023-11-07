import { LineBasicMaterial, Material, MeshBasicMaterial, Object3D } from "three";
import { AbstractConnector, AbstractDiagram, AbstractEdge, AbstractNode, DiagramOptions } from "./abstract-model";
import { FlowInteractive } from "./interactive";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowEdge } from "./edge";
import { FlowNode } from "./node";
import { FlowConnector } from "./connector";

export type FlowMaterialType = 'line' | 'geometry'


export class FlowDiagram extends Object3D {
  private materials: Map<string, Material>;
  constructor(private diagram: AbstractDiagram, public interactive: FlowInteractive, private fonts: Map<string, Font>, private options?: Partial<DiagramOptions>) {
    super()
    if (!this.diagram.version) this.diagram.version = 1
    this.materials = new Map();

    diagram.nodes.forEach(node => {
      this.addNode(node)
    })
    diagram.edges.forEach(edge => {
      const line = this.createEdge(this, edge)
      this.add(line)
    })

  }

  get gridsize():number { return this.options?.gridsize ?? 0 }

  public addNode(node: AbstractNode): FlowNode {
    const mesh = this.createNode(this, node, this.font)
    this.interactive.selectable.add(mesh)
    this.interactive.draggable.add(mesh)
    this.add(mesh)
    return mesh
  }

  get font() { return this.fonts.get('helvetika')! }

  newNode(): FlowNode {
    const node: AbstractNode = {
      nodeid: (this.nodes.length + 1).toString(),
      position: { x: 0, y: 0, z: 0 },
      nodetype: "function",
      label: "New Node",
      inputs: [],
      outputs: [],
      state: "default",
      draggable: true,
      category: "",
      resizable: true,
      scaleable: true,
      scale: 1,
      labelsize: 0.1,
      labelcolor: 'white',
      width: 1,
      height: 1,
      color: 'white'
    }

    return this.addNode(node)
  }

  get nodes(): AbstractNode[] { return this.diagram.nodes }
  get connectors(): AbstractConnector[] { return this.diagram.connectors }
  get edges(): AbstractEdge[] { return this.diagram.edges }
  get version() { return this.diagram.version }

  getConnector(id: string): FlowConnector | undefined {
    let connector: FlowConnector | undefined

    // find first matching connector
    for (const child of this.children) {
      const node = child as FlowNode
      connector = node.getConnector(id)
      if (connector) break;
    }
    return connector
  }

  //
  // purpose is node, resize, scale, disabled, error, selected, active, etc
  // note that connector may have multipe purposes based on state
  //
  getMaterial(type: FlowMaterialType, purpose: string, color: number | string): Material {
    const key = `${type}-${purpose}-${color}`;
    if (!this.materials.has(key)) {
      let material
      if (type == 'line')
        material = this.createLineMaterial(color);
      else
        material = this.createMeshMaterial(color);
      this.materials.set(key, material);
    }
    return this.materials.get(key)!;
  }

  // allow overriding
  createLineMaterial(color: number | string): Material {
    return new LineBasicMaterial({ color });
  }

  createMeshMaterial(color: number | string): Material {
    return new MeshBasicMaterial({ color });
  }

  createNode(diagram: FlowDiagram, node: AbstractNode, font: Font): FlowNode {
    return new FlowNode(diagram, node, font)
  }

  createConnector(diagram: FlowDiagram, connector: AbstractConnector): FlowConnector {
    return new FlowConnector(diagram, connector);
  }

  createEdge(diagram: FlowDiagram, edge: AbstractEdge): FlowEdge {
    return new FlowEdge(diagram, edge)
  }

}
