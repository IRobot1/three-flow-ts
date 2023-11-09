import { LineBasicMaterial, Material, MeshBasicMaterial, Object3D } from "three";
import { AbstractConnector, AbstractGraph, AbstractEdge, AbstractNode } from "./abstract-model";
import { FlowInteractive } from "./interactive";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowEdge } from "./edge";
import { FlowNode } from "./node";
import { FlowConnector } from "./connector";


export type FlowMaterialType = 'line' | 'geometry'

export interface FlowGraphOptions {
  gridsize: number
  fonts?: Map<string, Font>
}

export class FlowGraph extends Object3D {
  private materials: Map<string, Material>;
  constructor(private graph: AbstractGraph, public interactive: FlowInteractive, private options?: Partial<FlowGraphOptions>) {
    super()
    if (!this.graph.version) this.graph.version = 1
    this.materials = new Map();

    graph.nodes.forEach(node => {
      this.addNode(node)
    })
    graph.edges.forEach(edge => {
      const line = this.createEdge(this, edge)
      this.add(line)
    })

  }

  dispose() {
    this.allNodes.forEach(node => node.dispose())
  }

  get gridsize(): number { return this.options?.gridsize ?? 0 }

  getFont(name = 'default') {
    return this.options?.fonts?.get(name)
  }

  public hasNode(id: string): FlowNode | undefined {
    //return this.nodes.find(node => node.id == id) != undefined

    for (const child of this.children) {
      if (child.type == 'flownode') {
        const node = child as FlowNode
        if (node.name == id) return node
      }
    }
    return undefined
  }

  hasConnector(id: string): FlowConnector | undefined {
    let connector: FlowConnector | undefined

    // find first matching connector
    for (const child of this.children) {
      if (child.type == 'flownode') {
        const node = child as FlowNode
        connector = node.getConnector(id)
        if (connector) break;
      }
    }
    return connector
  }

  get allNodes(): Array<FlowNode> {
    return this.children.filter(child => child.type == 'flownode') as Array<FlowNode>
  }

  get allEdges(): Array<FlowEdge> {
    return this.children.filter(child => child.type == 'flowedge') as Array<FlowEdge>
  }

  public addNode(node: Partial<AbstractNode>): FlowNode {
    this.nodes.push(node);

    const mesh = this.createNode(this, node, this.getFont(node.labelfont))
    this.add(mesh)

    return mesh
  }

  public addEdge(edge: Partial<AbstractEdge>): FlowEdge {
    this.edges.push(edge);

    const mesh = this.createEdge(this, edge)
    this.add(mesh)

    return mesh
  }

  public removeNode(node: FlowNode) {

    const inputs = [...node.inputConnectors]
    inputs.forEach(item => node.removeInputConnector(item))

    const outputs = [...node.outputConnectors]
    outputs.forEach(item => node.removeOutputConnector(item))

    const index = this.nodes.findIndex(n => n.id == node.name)
    if (index != -1) this.nodes.splice(index, 1)

    this.interactive.selectable.remove(node)
    this.interactive.draggable.remove(node)

    this.remove(node)
    node.dispose()
  }

  public removeEdge(edge: FlowEdge): void {
    const index = this.edges.findIndex(e => e.id == edge.name)
    if (index != -1) this.edges.splice(index, 1)
    this.remove(edge)
  }

  public removeConnectedEdge(id: string) {
    this.children.forEach(child => {
      if (child.type == 'flowedge') {
        const edge = child as FlowEdge
        if (edge.from == id || edge.to == id)
          this.removeEdge(edge)
      }
    })
  }


  newNode(): FlowNode {
    const node: Partial<AbstractNode> = {
      id: (this.nodes.length + 1).toString(),
    }

    return this.addNode(node)
  }

  get nodes(): Partial<AbstractNode>[] { return this.graph.nodes }
  get connectors(): Partial<AbstractConnector>[] { return this.graph.connectors }
  get edges(): Partial<AbstractEdge>[] { return this.graph.edges }
  get version() { return this.graph.version }

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
    return new MeshBasicMaterial({ color, opacity: 0.99 });
  }

  createNode(graph: FlowGraph, node: Partial<AbstractNode>, font?: Font): FlowNode {
    return new FlowNode(graph, node, font)
  }

  createConnector(graph: FlowGraph, connector: Partial<AbstractConnector>): FlowConnector {
    return new FlowConnector(graph, connector);
  }

  createEdge(graph: FlowGraph, edge: Partial<AbstractEdge>): FlowEdge {
    return new FlowEdge(graph, edge)
  }

}
