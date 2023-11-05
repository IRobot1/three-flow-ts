import { Material, MeshBasicMaterial, Object3D } from "three";
import { AbstractConnector, AbstractDiagram, AbstractEdge, AbstractNode } from "./abstract-model";
import { FlowInteractive } from "./interactive";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowEdge } from "./edge";
import { FlowNode } from "./node";

export class FlowDiagram extends Object3D {
  private materials: Map<string, Material>;
  constructor(private diagram: AbstractDiagram, private interactive: FlowInteractive, private fonts: Map<string, Font>) {
    super()
    if (!this.diagram.version) this.diagram.version = 1
    this.materials = new Map();

    diagram.nodes.forEach(node => {
      this.addNode(node)
    })
    diagram.edges.forEach(edge => {
      const line = new FlowEdge(diagram, edge)
      this.add(line)
    })

  }

  public addNode(node: AbstractNode) : FlowNode {
    const mesh = new FlowNode(this.diagram, node, this.font)
    this.interactive.selectable.add(mesh)
    this.interactive.draggable.add(mesh)
    this.add(mesh)
    return mesh
  }

  get font() { return this.fonts.get('helvetika')! }

  newNode(): FlowNode {
    const node: AbstractNode = {
      nodeid: (this.nodes.length+1).toString(),
      position: { x: 0, y: 0, z: 0 },
      nodetype: "function",
      label: "New Node",
      inputs: [],
      outputs: [],
      state: "default",
      draggable: true,
      category: "",
      resizable: true,
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


  getMaterial(color: number | string, purpose: string): Material | undefined {
    const key = `${color}-${purpose}`;
    if (!this.materials.has(key)) {
      const material = new MeshBasicMaterial({ color });
      // TODO: LineBasicMaterial({color})
      this.materials.set(key, material);
    }
    return this.materials.get(key);
  }
}
