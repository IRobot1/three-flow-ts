import { Box3, LineBasicMaterial, Material, MeshBasicMaterial, Object3D, Vector3 } from "three";
import { FlowEdgeParameters, FlowDiagramParameters, FlowNodeParameters, FlowRouteParameters, EdgeLineStyle, FlowEventType, FlowLayout, FlowLabelParameters } from "./model";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowEdge } from "./edge";
import { FlowNode } from "./node";
import { FlowRoute } from "./route";
import { NoOpLayout } from "./noop-layout";
import { FlowLabel } from "./label";

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
    const result = this.graph.layout(label, filter)

    const centerx = result.width! / 2
    const centery = result.height! / 2

    result.nodes.forEach(node => {
      const item = this.hasNode(node.id)
      if (item) {
        item.position.set(node.x! - centerx, -node.y! + centery, 0)
      }
    })

    // redraw edges using calculated points
    result.edges.forEach(edge => {
      const item = this.hasEdge(edge.id)
      if (item) {
        item.edge.points = []
        edge.points.forEach(point => {
          if (item.edge.points) {
            item.edge.points.push({
              x: point.x - centerx,
              y: point.y - centery
            })
          }
        })

        item.updateVisuals()
      }
    })

  }

  private _center = new Vector3()
  getCenter(): Vector3 {
    const box = new Box3().setFromObject(this)
    return box.getCenter(this._center)
  }

  dispose() {
    this.allNodes.forEach(node => node.dispose())
    if (this.options && this.options.layout) this.options.layout.dispose()
    this.dispatchEvent<any>({ type: FlowEventType.DISPOSE })
    this.children.length = 0
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

  private setNode(item: FlowNodeParameters): FlowNode {
    const node = this.createNode(item)
    this.add(node)
    this._nodeCount++

    this.dispatchEvent<any>({ type: FlowEventType.NODE_ADDED, node })
    return node
  }

  public addNode(node: FlowNodeParameters): FlowNode {
    const mesh = this.setNode(node)

    // setNode can assign node.text, so must be done before adding to graph
    this.graph.setNode(node.text!, node);

    return mesh;
  }

  private addRoute(item: FlowRouteParameters): FlowNode {
    const route = this.createRoute(item)
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

  nextNodeId(): string {
    return `n${this.nodeCount}`
  }

  newNode(): FlowNode {
    const node: FlowNodeParameters = {
      text: this.nextNodeId(),
    }

    return this.addNode(node)
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

  private setEdge(item: FlowEdgeParameters): FlowEdge {
    if (!item.color && this.options) item.color = this.options.linecolor
    if (!item.linestyle && this.options) item.linestyle = this.options.linestyle
    if (!item.divisions && this.options) item.divisions = this.options.linedivisions
    if (!item.thickness && this.options) item.thickness = this.options.linethickness

    const edge = this.createEdge(item)
    this.add(edge)
    this._edgeCount++;

    this.dispatchEvent<any>({ type: FlowEventType.EDGE_ADDED, edge })
    return edge
  }

  public addEdge(edge: FlowEdgeParameters): FlowEdge {
    const mesh = this.setEdge(edge)

    // setEdge can assign edge.name, so must be after
    this.graph.setEdge(edge.v, edge.w, edge);
    return mesh;
  }

  public removeEdge(edge: FlowEdge): void {

    this.graph.removeEdge(edge.edge, edge.from, edge.to)
    this._edgeCount--

    this.dispatchEvent<any>({ type: FlowEventType.EDGE_REMOVED, edge })

    this.remove(edge)
  }

  nextEdgeId(): string {
    return `e${this.edgeCount}`
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

  createNode(node: FlowNodeParameters): FlowNode {
    return new FlowNode(this, node)
  }

  createRoute(route: FlowRouteParameters): FlowNode {
    return new FlowRoute(this, route)
  }

  createEdge(edge: FlowEdgeParameters): FlowEdge {
    return new FlowEdge(this, edge)
  }

  createLabel(label: FlowLabelParameters) : FlowLabel {
    return new FlowLabel(this, label)
  }

}
