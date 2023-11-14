import { Box3, LineBasicMaterial, Material, MeshBasicMaterial, Object3D, Vector3 } from "three";
import { FlowEdgeData, FlowGraphData, FlowNodeData, FlowRouteData, EdgeLineStyle } from "./model";
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

export class FlowGraph<TNodeData extends FlowNodeData, TEdgeData extends FlowEdgeData> extends Object3D {
  private materials: Map<string, Material>;
  readonly graph = new graphlib.Graph()

  private _active: FlowNode<TNodeData, TEdgeData> | undefined;
  get active() { return this._active }
  set active(newvalue: FlowNode<TNodeData, TEdgeData> | undefined) {
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
      this.setNode(<TNodeData>node)
    })
    this.graph.edges().forEach(edge => {
      const line = this.addEdge(<TEdgeData>edge)
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

    graph.nodes?.forEach(node => {
      if (node.type == 'route')
        this.setRoute(node)
      else
        this.setNode(<TNodeData>node)
    })

    graph.edges?.forEach(edge => {
      const line = this.setEdge(<TEdgeData>edge)
      this.add(line)
    })
  }

  layout(label: GraphLabel = { rankdir:'LR' }, filter?: (nodeId: string) => boolean) {
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

  get allNodes(): Array<FlowNode<TNodeData, TEdgeData>> {
    return this.children.filter(child => child.type == 'flownode') as Array<FlowNode<TNodeData, TEdgeData>>
  }

  public hasNode(id: string): FlowNode<TNodeData, TEdgeData> | undefined {

    for (const child of this.children) {
      if (child.type == 'flownode') {
        const node = child as FlowNode<TNodeData, TEdgeData>
        if (node.name == id) return node
      }
    }
    return undefined
  }

  private addNode(item: TNodeData): FlowNode<TNodeData, TEdgeData> {
    const node = this.createNode(this, item)
    this.add(node)

    this.dispatchEvent<any>({ type: 'node-added', node })
    return node
  }

  public setNode(node: TNodeData): FlowNode<TNodeData, TEdgeData> {
    const mesh = this.addNode(node)

    // addNode can assign node.text, so must be after
    this.graph.setNode(node.text!, node);

    return mesh;
  }

  private addRoute(item: FlowRouteData): FlowNode<TNodeData, TEdgeData> {
    const route = this.createRoute(this, item)
    this.add(route)

    this.dispatchEvent<any>({ type: 'node-added', node: route })
    return route
  }

  public setRoute(route: FlowRouteData): FlowNode<TNodeData, TEdgeData> {
    const mesh = this.addRoute(route)

    // addNode can assign node.text, so must be after
    this.graph.setNode(route.text!, route);

    return mesh;
  }

  public removeNode(node: FlowNode<TNodeData, TEdgeData>) {

    this.graph.removeNode(node.name)

    this.dispatchEvent<any>({ type: 'node-removed', node })

    this.remove(node)
    node.dispose()
  }

  newNode(): FlowNode<TNodeData, TEdgeData> {
    const node = <TNodeData> {
      text: (this.nodes.length + 1).toString(),
    }

    return this.setNode(node)
  }


  get allEdges(): Array<FlowEdge<TNodeData, TEdgeData>> {
    return this.children.filter(child => child.type == 'flowedge') as Array<FlowEdge<TNodeData, TEdgeData>>
  }

  public hasEdge(id: string): FlowEdge<TNodeData, TEdgeData> | undefined {

    for (const child of this.children) {
      if (child.type == 'flowedge') {
        const edge = child as FlowEdge<TNodeData, TEdgeData>
        if (edge.name == id) return edge
      }
    }
    return undefined
  }

  public addEdge(item: TEdgeData): FlowEdge<TNodeData, TEdgeData> {
    if (!item.color) item.color = this.options?.linecolor
    if (!item.linestyle) item.linestyle = this.options?.linestyle
    if (!item.divisions) item.divisions = this.options?.linedivisions
    if (!item.thickness) item.thickness = this.options?.linethickness

    const edge = this.createEdge(this, item)
    this.add(edge)

    this.dispatchEvent<any>({ type: 'edge-added', edge })
    return edge
  }

  public setEdge(edge: TEdgeData): FlowEdge<TNodeData, TEdgeData> {
    this.graph.setEdge(edge.v, edge.w, edge);
    return this.addEdge(edge)
  }

  public removeEdge(edge: FlowEdge<TNodeData, TEdgeData>): void {
    this.graph.removeEdge(edge.from, edge.to)

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

  createNode(graph: FlowGraph<TNodeData, TEdgeData>, node: TNodeData): FlowNode<TNodeData, TEdgeData> {
    return new FlowNode<TNodeData, TEdgeData>(graph, node)
  }

  createRoute(graph: FlowGraph<TNodeData, TEdgeData>, route: FlowRouteData): FlowNode<TNodeData, TEdgeData> {
    return new FlowRoute(graph, route)
  }

  createEdge(graph: FlowGraph<TNodeData, TEdgeData>, edge: TEdgeData): FlowEdge<TNodeData, TEdgeData> {
    return new FlowEdge<TNodeData, TEdgeData>(graph, edge)
  }

}
