import { Box3, ColorRepresentation, LineBasicMaterial, LineBasicMaterialParameters, Material, MaterialParameters, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, Vector2, Vector3 } from "three";
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
  linematerial?: MeshBasicMaterialParameters
  linestyle?: EdgeLineStyle
  linedivisions?: number
  linethickness?: number
  lineoffset?: number
  layout?: FlowLayout
  edgez?: number
}

export class FlowDiagram extends Object3D {
  private materials: Map<string, Material>
  private graph!: FlowLayout

  private _nextId = 0
  get nextId() { return this._nextId }

  private _edgeCount = 0
  get edgeCount() { return this._edgeCount }

  private _active: FlowNode | undefined;
  get active() { return this._active }
  set active(newvalue: FlowNode | undefined) {
    if (newvalue != this._active) {
      this._active = newvalue
      this.dispatchEvent<any>({ type: FlowEventType.ACTIVE_CHANGED, node: newvalue })
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
    }

    if (!this.graph)
      this.graph = new NoOpLayout()

    this.materials = new Map();

  }

  save(): FlowDiagramParameters {
    const diagram: FlowDiagramParameters = {
      version: 1,
      nodes: [], edges: []
    }
    this.allNodes.forEach(node => {
      node.save()
      diagram.nodes.push(node.parameters)
    })
    this.allEdges.forEach(edge => {
      //edge.save()
      diagram.edges.push(edge.parameters)
    })
    return diagram
  }

  load(input: FlowDiagramParameters) {
    const diagram = input as Partial<FlowDiagramParameters>

    if (diagram.nodes) {
      diagram.nodes.forEach(node => {
        if (node.type == 'route')
          this.addRoute(node)
        else
          this.addNode(node)
      })
    }

    if (diagram.edges) {
      diagram.edges.forEach(edge => {
        const line = this.addEdge(edge)
        this.add(line)
      })
    }
  }

  layout(label: any = {}, filter?: (nodeId: string) => boolean) {
    const nodes = this.allNodes.map(node => node.parameters)
    const edges = this.allEdges.map(edge => edge.parameters)

    const result = this.graph.layout(nodes, edges, label, filter)

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
        item.parameters.points = []
        edge.points.forEach(point => {
          if (item.parameters.points) {
            item.parameters.points.push({
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

  override clear():this {
    this.allNodes.forEach(node => node.dispose())
    if (this.options && this.options.layout) this.options.layout.dispose()
    this.dispatchEvent<any>({ type: FlowEventType.DISPOSE })
    return super.clear()
  }

  dispose() { this.clear() }

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

  private nodesMap = new Map<string, FlowNode>([])

  get allNodes(): Array<FlowNode> {
    return Array.from(this.nodesMap.values())
  }

  public hasNode(id: string): FlowNode | undefined {
    return this.nodesMap.get(id)
  }

  public addNode(parameters: FlowNodeParameters): FlowNode {
    const node = this.createNode(parameters)
    this.add(node)
    this._nextId++

    this.nodesMap.set(node.name, node)

    this.dispatchEvent<any>({ type: FlowEventType.NODE_ADDED, node })
    return node
  }

  addRoute(parameters: FlowRouteParameters): FlowRoute {
    const route = this.createRoute(parameters)
    this.add(route)
    this._nextId++;

    this.nodesMap.set(route.name, route)

    this.dispatchEvent<any>({ type: FlowEventType.NODE_ADDED, node: route })
    return route
  }

  public removeNode(node: FlowNode) {

    this.dispatchEvent<any>({ type: FlowEventType.NODE_REMOVED, node })

    this.nodesMap.delete(node.name)

    this.remove(node)
    node.dispose()
  }

  removeRoute(route: FlowRoute) {
    this.removeNode(route)
  }

  nextNodeId(): string {
    return `n${this.nextId}`
  }

  newNode(): FlowNode {
    const parameters: FlowNodeParameters = {
      id: this.nextNodeId(),
    }

    return this.addNode(parameters)
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

  public addEdge(parameters: FlowEdgeParameters): FlowEdge {
    if (!parameters.material && this.options) parameters.material = this.options.linematerial
    if (!parameters.linestyle && this.options) parameters.linestyle = this.options.linestyle
    if (!parameters.divisions && this.options) parameters.divisions = this.options.linedivisions
    if (!parameters.thickness && this.options) parameters.thickness = this.options.linethickness
    if (!parameters.lineoffset && this.options) parameters.lineoffset = this.options.lineoffset
    if (!parameters.z && this.options) parameters.z = this.options.edgez

    const edge = this.createEdge(parameters)
    this.add(edge)
    this._edgeCount++;

    this.dispatchEvent<any>({ type: FlowEventType.EDGE_ADDED, edge })
    return edge
  }

  public removeEdge(edge: FlowEdge): void {

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
  getMaterial(type: FlowMaterialType, purpose: string, parameters: MaterialParameters): Material {
    const color = (parameters as MeshBasicMaterialParameters).color
    const key = `${type}-${purpose}-${color}`;
    if (!this.materials.has(key)) {
      let material
      if (type == 'line')
        material = this.createLineMaterial(purpose, parameters);
      else
        material = this.createMeshMaterial(purpose, parameters);
      this.materials.set(key, material);
    }
    return this.materials.get(key)!;
  }

  // return local position of object within the diagram
  getFlowPosition(object: Object3D): Vector3 {
    let worldPosition = new Vector3();
    object.localToWorld(worldPosition);
    return this.worldToLocal(worldPosition);
  }

  getFlowPosition2D(object: Object3D): Vector2 {
    let worldPosition = new Vector3();
    object.localToWorld(worldPosition);
    const v = this.worldToLocal(worldPosition);
    return new Vector2(v.x, v.y)
  }

  // allow overriding
  createLineMaterial(purpose: string, parameters: LineBasicMaterialParameters): Material {
    return new LineBasicMaterial(parameters);
  }

  createMeshMaterial(purpose: string, parameters: MaterialParameters): Material {
    return new MeshBasicMaterial(parameters);
  }

  createNode(parameters: FlowNodeParameters): FlowNode {
    return new FlowNode(this, parameters)
  }

  createRoute(parameters: FlowRouteParameters): FlowRoute {
    return new FlowRoute(this, parameters)
  }

  createEdge(parameters: FlowEdgeParameters): FlowEdge {
    return new FlowEdge(this, parameters)
  }

  createLabel(parameters: FlowLabelParameters): FlowLabel {
    return new FlowLabel(this, parameters)
  }

}
