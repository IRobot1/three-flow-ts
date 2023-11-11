import { Box3, LineBasicMaterial, Material, MeshBasicMaterial, Object3D, Vector3 } from "three";
import { AbstractConnector, AbstractEdge, AbstractGraph, AbstractNode } from "./abstract-model";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowEdge } from "./edge";
import { FlowNode } from "./node";
import { FlowConnector } from "./connector";
import { graphlib } from "@dagrejs/dagre";


export type FlowMaterialType = 'line' | 'geometry'

export interface FlowGraphOptions {
  gridsize?: number
  fonts?: Map<string, Font>
}

export class FlowGraph extends Object3D {
  private materials: Map<string, Material>;
  readonly graph = new graphlib.Graph()

  constructor(private options?: FlowGraphOptions) {
    super()
    //if (!this.graph.version) this.graph.version = 1
    this.materials = new Map();

    this.graph.nodes().forEach(name => {
      const node = this.graph.node(name)
      this.setNode(node)
    })
    this.graph.edges().forEach(edge => {
      const line = this.createEdge(this, edge)
      this.add(line)
    })

  }

  save(): AbstractGraph {
    const graph: AbstractGraph = {
      version: 1,
      nodes: [], edges: []
    }
    this.allNodes.forEach(node => {
      node.save()
      graph.nodes.push(node.node)
    })
    this.allEdges.forEach(edge => {
      //edge.save()
      graph.edges.push(edge.edge)
    })
    return graph
  }

  load(input: AbstractGraph) {
    const graph = input as Partial<AbstractGraph>

    graph.nodes?.forEach(node => {
      this.addNode(node)
    })

    graph.edges?.forEach(edge => {
      const line = this.createEdge(this, edge)
      this.add(line)
    })
  }

  private _center = new Vector3()
  getCenter(): Vector3 {
    const box = new Box3().setFromObject(this)
    return box.getCenter(this._center)
  }

  dispose() {
    this.allNodes.forEach(node => node.dispose())
    this.dispatchEvent<any>({ type: 'dispose' })
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

  private addNode(item: AbstractNode): FlowNode {
    const node = this.createNode(this, item, this.getFont(item.labelfont))
    this.add(node)

    this.dispatchEvent<any>({ type: 'node-added', node })
    return node
  }

  public setNode(node: AbstractNode): FlowNode {
    const mesh = this.addNode(node)

    // addNode can assign node.text, so must be after
    this.graph.setNode(node.text!, node);

    return mesh;
  }

  public addConnector(connector: AbstractConnector) {
    if (connector.text)
      this.graph.setNode(connector.text, connector)
  }

  public addEdge(edge: AbstractEdge): FlowEdge {
    this.graph.setEdge(edge.v, edge.w, edge);

    const mesh = this.createEdge(this, edge)
    this.add(mesh)

    return mesh
  }

  public removeNode(node: FlowNode) {

    const inputs = [...node.inputConnectors]
    inputs.forEach(item => node.removeInputConnector(item))

    const outputs = [...node.outputConnectors]
    outputs.forEach(item => node.removeOutputConnector(item))

    this.graph.removeNode(node.name)

    this.dispatchEvent<any>({ type: 'node-removed', node })

    this.remove(node)
    node.dispose()
  }

  public removeConnector(name: string) {
    this.graph.removeNode(name)
  }


  public removeEdge(edge: FlowEdge): void {
    this.graph.removeEdge(edge.from, edge.to)

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
    const node: AbstractNode = {
      text: (this.nodes.length + 1).toString(),
    }

    return this.setNode(node)
  }

  get nodes(): string[] { return this.graph.nodes() }
  get connectors(): string[] { return this.graph.nodes() }
  get edges(): AbstractEdge[] { return this.graph.edges() }
  //get version() { return this.graph.version }

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

  createNode(graph: FlowGraph, node: AbstractNode, font?: Font): FlowNode {
    return new FlowNode(graph, node, font)
  }

  createConnector(graph: FlowGraph, connector: AbstractConnector): FlowConnector {
    return new FlowConnector(graph, connector);
  }

  createEdge(graph: FlowGraph, edge: AbstractEdge): FlowEdge {
    return new FlowEdge(graph, edge)
  }

}
