import { Box3, LineBasicMaterial, Material, MeshBasicMaterial, Object3D, Vector3 } from "three";
import { FlowEdgeData, FlowGraphData, FlowNodeData, FlowRouteData, EdgeLineStyle, FlowEventType } from "./model";
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
  private graph = new graphlib.Graph()

  private _active: FlowNode | undefined;
  get active() { return this._active }
  set active(newvalue: FlowNode | undefined) {
    if (newvalue != this._active) {
      this._active = newvalue
      this.dispatchEvent<any>({ type: FlowEventType.ACTIVE_CHANGED })
    }
  }

  constructor(private options?: FlowGraphOptions) {
    super()

    if (options && options.gridsize != undefined)
      this.gridsize = options.gridsize
    else
      this.gridsize = 0

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

  save(): FlowGraphData {
    const graph: FlowGraphData = {
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

  load(input: FlowGraphData) {
    const graph = input as Partial<FlowGraphData>

    if (graph.nodes) {
      graph.nodes.forEach(node => {
        if (node.type == 'route')
          this.setRoute(node)
        else
          this.setNode(node)
      })
    }

    if (graph.edges) {
      graph.edges.forEach(edge => {
        const line = this.setEdge(edge)
        this.add(line)
      })
    }
  }

  layout(label: GraphLabel = { rankdir: 'LR' }, filter?: (nodeId: string) => boolean) {
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
    this.dispatchEvent<any>({ type: FlowEventType.DISPOSE })
  }

  private _gridsize = 0
  get gridsize(): number { return this._gridsize }
  set gridsize(newvalue: number) {
    if (this._gridsize != newvalue) {
      this._gridsize = newvalue;
    }
  }

  getFont(name = 'default') {
    if (this.options && this.options.fonts)
      return this.options.fonts.get(name)
    return undefined
  }

  get allNodes(): Array<FlowNode> {
    return this.children.filter(child => child.type == 'flownode') as Array<FlowNode>
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

  private addNode(item: FlowNodeData): FlowNode {
    const node = this.createNode(this, item)
    this.add(node)

    this.dispatchEvent<any>({ type: FlowEventType.NODE_ADDED, node })
    return node
  }

  public setNode(node: FlowNodeData): FlowNode {
    const mesh = this.addNode(node)

    // addNode can assign node.text, so must be after
    this.graph.setNode(node.text!, node);

    return mesh;
  }

  private addRoute(item: FlowRouteData): FlowNode {
    const route = this.createRoute(this, item)
    this.add(route)

    this.dispatchEvent<any>({ type: FlowEventType.NODE_ADDED, node: route })
    return route
  }

  public setRoute(route: FlowRouteData): FlowNode {
    const mesh = this.addRoute(route)

    // addNode can assign node.text, so must be after
    this.graph.setNode(route.text!, route);

    return mesh;
  }

  public removeNode(node: FlowNode) {

    this.graph.removeNode(node.name)

    this.dispatchEvent<any>({ type: FlowEventType.NODE_REMOVED, node })

    this.remove(node)
    node.dispose()
  }

  newNode(): FlowNode {
    const node: FlowNodeData = {
      text: (this.nodes.length + 1).toString(),
    }

    return this.setNode(node)
  }


  get allEdges(): Array<FlowEdge> {
    return this.children.filter(child => child.type == 'flowedge') as Array<FlowEdge>
  }

  public hasEdge(id: string): FlowEdge | undefined {

    for (const child of this.children) {
      if (child.type == 'flowedge') {
        const edge = child as FlowEdge
        if (edge.name == id) return edge
      }
    }
    return undefined
  }

  public addEdge(item: FlowEdgeData): FlowEdge {
    if (!item.color && this.options) item.color = this.options.linecolor
    if (!item.linestyle && this.options) item.linestyle = this.options.linestyle
    if (!item.divisions && this.options) item.divisions = this.options.linedivisions
    if (!item.thickness && this.options) item.thickness = this.options.linethickness

    const edge = this.createEdge(this, item)
    this.add(edge)

    this.dispatchEvent<any>({ type: FlowEventType.EDGE_ADDED, edge })
    return edge
  }

  public setEdge(edge: FlowEdgeData): FlowEdge {
    this.graph.setEdge(edge.v, edge.w, edge);
    return this.addEdge(edge)
  }

  public removeEdge(edge: FlowEdge): void {
    this.graph.removeEdge(edge.from, edge.to)

    this.dispatchEvent<any>({ type: FlowEventType.EDGE_REMOVED, edge })

    this.remove(edge)
  }

  get nodes(): string[] { return this.graph.nodes() }
  get connectors(): string[] { return this.graph.nodes() }
  get edges(): FlowEdgeData[] { return this.graph.edges() }

  //
  // purpose is node, resize, scale, disabled, error, selected, active, etc
  // note that connector may have multipe purposes based on state
  //
  getMaterial(type: FlowMaterialType, purpose: string, color: number | string): Material {
    const key = `${type}-${purpose}-${color}`;
    if (!this.materials.has(key)) {
      let material
      if (type == 'line')
        material = this.createLineMaterial(purpose, color);
      else
        material = this.createMeshMaterial(purpose, color);
      this.materials.set(key, material);
    }
    return this.materials.get(key)!;
  }

  // allow overriding
  createLineMaterial(purpose: string, color: number | string): Material {
    return new LineBasicMaterial({ color });
  }

  createMeshMaterial(purpose: string, color: number | string): Material {
    return new MeshBasicMaterial({ color, opacity: 0.99 });
  }

  createNode(graph: FlowGraph, node: FlowNodeData): FlowNode {
    return new FlowNode(graph, node)
  }

  createRoute(graph: FlowGraph, route: FlowRouteData): FlowNode {
    return new FlowRoute(graph, route)
  }

  createEdge(graph: FlowGraph, edge: FlowEdgeData): FlowEdge {
    return new FlowEdge(graph, edge)
  }

}
