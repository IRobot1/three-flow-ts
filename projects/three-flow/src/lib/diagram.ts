import { Box3, LineBasicMaterial, Material, MeshBasicMaterial, Object3D, Vector3 } from "three";
import { FlowEdgeParameters, FlowDiagramParameters, FlowNodeParameters, FlowRouteParameters, EdgeLineStyle, FlowEventType, FlowLayout } from "./model";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowEdge } from "./edge";
import { FlowNode } from "./node";
import { FlowRoute } from "./route";
import { NoOpLayout } from "./noop-layout";

export type FlowMaterialType = 'line' | 'geometry'

export interface FlowDiagramOptions {
  gridsize?: number
  fonts?: Map<string, Font>
  linecolor?: number | string
  linestyle?: EdgeLineStyle
  linedivisions?: number
  linethickness?: number
  layout?: FlowLayout
}

export class FlowDiagram extends Object3D {
  private materials: Map<string, Material>
  private graph!: FlowLayout

  private _nodeCount = 0
  get nodeCount() { return this._nodeCount }

  private _edgeCount = 0
  get edgeCount() { return this._edgeCount }

  private _active: FlowNode | undefined;
  get active() { return this._active }
  set active(newvalue: FlowNode | undefined) {
    if (newvalue != this._active) {
      this._active = newvalue
      this.dispatchEvent<any>({ type: FlowEventType.ACTIVE_CHANGED })
    }
  }

  constructor(private options?: FlowDiagramOptions) {
    super()

    if (options) {
      if (options.gridsize != undefined)
        this.gridsize = options.gridsize
      else
        this.gridsize = 0

      if (options.layout)
        this.graph = options.layout
      else
        this.graph = new NoOpLayout()
    }

    this.materials = new Map();
  }

  save(): FlowDiagramParameters {
    const diagram: FlowDiagramParameters = {
      version: 1,
      nodes: [], edges: []
    }
    this.allNodes.forEach(node => {
      node.save()
      diagram.nodes.push(node.node)
    })
    this.allEdges.forEach(edge => {
      //edge.save()
      diagram.edges.push(edge.edge)
    })
    return diagram
  }

  load(input: FlowDiagramParameters) {
    const diagram = input as Partial<FlowDiagramParameters>

    if (diagram.nodes) {
      diagram.nodes.forEach(node => {
        if (node.type == 'route')
          this.setRoute(node)
        else
          this.setNode(node)
      })
    }

    if (diagram.edges) {
      diagram.edges.forEach(edge => {
        const line = this.setEdge(edge)
        this.add(line)
      })
    }
  }

  layout(label: any = {}, filter?: (nodeId: string) => boolean) {
    if (this.graph.layout(label, filter)) {

      const centerx = label.width! / 2
      const centery = label.height! / 2

      // reposition the nodes
      this.allNodes.forEach(node => {
        const data = this.graph.node(node.name)
        if (node) {
          node.position.set(data.x - centerx, -data.y + centery, 0)
        }
      })

      // redraw edges using calculated points
      this.allEdges.forEach(edge => {
        if (edge.edge.points)
          edge.edge.points.forEach(point => {
            point.x -= centerx
            point.y -= centery
          })
        edge.updateVisuals()
      })
    }
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

  private addNode(item: FlowNodeParameters): FlowNode {
    const node = this.createNode(this, item)
    this.add(node)

    this.dispatchEvent<any>({ type: FlowEventType.NODE_ADDED, node })
    return node
  }

  public setNode(node: FlowNodeParameters): FlowNode {
    const mesh = this.addNode(node)

    // addNode can assign node.text, so must be after
    this.graph.setNode(node.text!, node);
    this._nodeCount++

    return mesh;
  }

  private addRoute(item: FlowRouteParameters): FlowNode {
    const route = this.createRoute(this, item)
    this.add(route)

    this.dispatchEvent<any>({ type: FlowEventType.NODE_ADDED, node: route })
    return route
  }

  public setRoute(route: FlowRouteParameters): FlowNode {
    const mesh = this.addRoute(route)

    // addNode can assign node.text, so must be after
    this.graph.setNode(route.text!, route);
    this._nodeCount++;

    return mesh;
  }

  public removeNode(node: FlowNode) {

    this.graph.removeNode(node.name)
    this._nodeCount--

    this.dispatchEvent<any>({ type: FlowEventType.NODE_REMOVED, node })

    this.remove(node)
    node.dispose()
  }

  newNode(): FlowNode {
    const node: FlowNodeParameters = {
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

  public addEdge(item: FlowEdgeParameters): FlowEdge {
    if (!item.color && this.options) item.color = this.options.linecolor
    if (!item.linestyle && this.options) item.linestyle = this.options.linestyle
    if (!item.divisions && this.options) item.divisions = this.options.linedivisions
    if (!item.thickness && this.options) item.thickness = this.options.linethickness

    const edge = this.createEdge(this, item)
    this.add(edge)

    this.dispatchEvent<any>({ type: FlowEventType.EDGE_ADDED, edge })
    return edge
  }

  public setEdge(edge: FlowEdgeParameters): FlowEdge {
    this.graph.setEdge(edge.v, edge.w, edge);
    this._edgeCount++;
    return this.addEdge(edge)
  }

  public removeEdge(edge: FlowEdge): void {

    this.graph.removeEdge(edge.from, edge.to)
    this._edgeCount--

    this.dispatchEvent<any>({ type: FlowEventType.EDGE_REMOVED, edge })

    this.remove(edge)
  }

  get nodes(): string[] { return this.graph.nodes() }
  get connectors(): string[] { return this.graph.nodes() }
  get edges(): FlowEdgeParameters[] { return this.graph.edges() }

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

  createNode(diagram: FlowDiagram, node: FlowNodeParameters): FlowNode {
    return new FlowNode(diagram, node)
  }

  createRoute(diagram: FlowDiagram, route: FlowRouteParameters): FlowNode {
    return new FlowRoute(diagram, route)
  }

  createEdge(diagram: FlowDiagram, edge: FlowEdgeParameters): FlowEdge {
    return new FlowEdge(diagram, edge)
  }

}