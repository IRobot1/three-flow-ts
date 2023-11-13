import { Box3, LineBasicMaterial, Material, MeshBasicMaterial, Object3D, Vector3 } from "three";
import { AbstractEdge, AbstractGraph, AbstractNode, AbstractRoute, EdgeLineStyle } from "./abstract-model";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowEdge } from "./edge";
import { FlowNode } from "./node";
import { GraphLabel, graphlib, layout } from "@dagrejs/dagre";
import { FlowRoute } from "./route";


export type FlowMaterialType = 'line' | 'geometry'

export interface FlowGraphOptions {
  gridsize?: number
  fonts?: Map<string, Font>
  linecolor?: number | string
  linestyle?: EdgeLineStyle
  linedivisions?: number
  linethickness?: number
}

export class FlowGraph extends Object3D {
  private materials: Map<string, Material>;
  readonly graph = new graphlib.Graph()

  private _active: FlowNode | undefined;
  get active() { return this._active }
  set active(newvalue: FlowNode | undefined) {
    if (newvalue != this._active) {
      this._active = newvalue
      this.dispatchEvent<any>({ type: 'active_change' })
    }
  }

  constructor(private options?: FlowGraphOptions) {
    super()

    this.gridsize = options?.gridsize ?? 0

    this.materials = new Map();

    this.graph.nodes().forEach(name => {
      const node = this.graph.node(name)
      this.setNode(node)
    })
    this.graph.edges().forEach(edge => {
      const line = this.addEdge(edge)
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
      if (node.type == 'route')
        this.setRoute(node)
      else
        this.setNode(node)
    })

    graph.edges?.forEach(edge => {
      const line = this.setEdge(edge)
      this.add(line)
    })
  }

  layout(label: GraphLabel, filter?: (nodeId: string) => boolean) {
    if (!label.nodesep) label.nodesep = 0.1
    if (!label.edgesep) label.edgesep = 1
    if (!label.ranksep) label.ranksep = 4

    this.graph.setGraph(label);

    let filteredgraph = this.graph
    if (filter) filteredgraph = this.graph.filterNodes(filter)

    layout(filteredgraph)

    // reposition the nodes
    filteredgraph.nodes().forEach(name => {
      const data = this.graph.node(name)
      const node = this.hasNode(name)
      if (node) {
        node.position.set(data.x, -data.y, 0)
      }
    })

    // redraw edges using calculated points
    this.allEdges.forEach(edge => {
      edge.updateVisuals()
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

  private _gridsize = 0
  get gridsize(): number { return this._gridsize }
  set gridsize(newvalue: number) {
    if (this._gridsize != newvalue) {
      this._gridsize = newvalue;
    }
  }

  getFont(name = 'default') {
    return this.options?.fonts?.get(name)
  }

  public hasNode(id: string): FlowNode | undefined {

    for (const child of this.children) {
      if (child.type == 'flownode') {
        const node = child as FlowNode
        if (node.name == id) return node
      }
    }
    return undefined
  }

  get allNodes(): Array<FlowNode> {
    return this.children.filter(child => child.type == 'flownode') as Array<FlowNode>
  }

  get allEdges(): Array<FlowEdge> {
    return this.children.filter(child => child.type == 'flowedge') as Array<FlowEdge>
  }

  private addNode(item: AbstractNode): FlowNode {
    const node = this.createNode(this, item)
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

  private addRoute(item: AbstractRoute): FlowNode {
    const route = this.createRoute(this, item)
    this.add(route)

    this.dispatchEvent<any>({ type: 'node-added', node: route })
    return route
  }

  public setRoute(route: AbstractRoute): FlowNode {
    const mesh = this.addRoute(route)

    // addNode can assign node.text, so must be after
    this.graph.setNode(route.text!, route);

    return mesh;
  }

  public addEdge(item: AbstractEdge): FlowEdge {
    if (!item.color) item.color = this.options?.linecolor
    if (!item.linestyle) item.linestyle = this.options?.linestyle
    if (!item.divisions) item.divisions = this.options?.linedivisions
    if (!item.thickness) item.thickness = this.options?.linethickness

    const edge = this.createEdge(this, item)
    this.add(edge)

    this.dispatchEvent<any>({ type: 'edge-added', edge })
    return edge
  }

  public setEdge(edge: AbstractEdge): FlowEdge {
    this.graph.setEdge(edge.v, edge.w, edge);
    return this.addEdge(edge)
  }

  public removeNode(node: FlowNode) {

    this.graph.removeNode(node.name)

    this.dispatchEvent<any>({ type: 'node-removed', node })

    this.remove(node)
    node.dispose()
  }

  public removeEdge(edge: FlowEdge): void {
    this.graph.removeEdge(edge.from, edge.to)

    this.remove(edge)
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

  createNode(graph: FlowGraph, node: AbstractNode): FlowNode {
    return new FlowNode(graph, node)
  }

  createRoute(graph: FlowGraph, route: AbstractRoute): FlowNode {
    return new FlowRoute(graph, route)
  }

  createEdge(graph: FlowGraph, edge: AbstractEdge): FlowEdge {
    return new FlowEdge(graph, edge)
  }

}
