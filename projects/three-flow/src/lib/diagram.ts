import { Box3, LineBasicMaterial, Material, Matrix4, MeshBasicMaterial, Object3D, Vector3 } from "three";
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

  nodezdepth = 0.1
  edgezdepth = 0.05

  constructor(private options?: FlowDiagramOptions) {
    super()

    // @ts-ignore
    this.type = 'flowdiagram';

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

  // Correct position if node is part of a subgraph
  private setPositionOfChild(diagram: Object3D, subgraph: Object3D, node: Object3D, desiredPosition: Vector3): Vector3 {
    diagram.updateMatrixWorld();
    subgraph.updateMatrixWorld();

    let localPosition = desiredPosition

    if (node.parent === subgraph) {
      let worldPosition = desiredPosition.applyMatrix4(diagram.matrixWorld);

      let inverseMatrixB = new Matrix4().copy(subgraph.matrixWorld).invert();

      localPosition = worldPosition.applyMatrix4(inverseMatrixB);
    }

    return localPosition
  }

  layout(label: any = {}, filter?: (nodeId: string) => boolean) {
    const result = this.graph.layout(label, filter)

    const centerx = result.width! / 2
    const centery = result.height! / 2

    result.nodes.forEach(node => {
      const item = this.hasNode(node.id)
      if (item) {
        const desiredPostion = new Vector3(node.x! - centerx, -node.y! + centery, item.position.z)
        const localPosition = this.setPositionOfChild(this, item.parent!, item, desiredPostion)
        item.position.copy(localPosition)
        item.width = node.width
        item.height = node.height
      }
    })

    // redraw edges using calculated points
    result.edges.forEach(edge => {
      const item = this.hasEdge(edge.id)
      if (item) {
        item.edge.points = []
        edge.points.forEach(point => {
          let desiredPosition = new Vector3(point.x - centerx, point.y - centery, item.position.z)

          // This works, but not sure why there needs to be a difference
          if (item.parent == this)
            desiredPosition.y = point.y - centery
          else
            desiredPosition.y = -point.y + centery

          const localPosition = this.setPositionOfChild(this, item.parent!, item, desiredPosition)

          if (item.edge.points) {
            item.edge.points.push({
              x: localPosition.x,
              y: localPosition.y,
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

  private nodeChild(id: string, children: Array<Object3D>): FlowNode | undefined {
    for (const child of children) {
      if (child.type == 'flownode') {
        const node = child as FlowNode
        if (node.name == id) return node

        if (child.children.length > 0) {
          const result = this.nodeChild(id, child.children)
          if (result) return result
        }
      }
    }
    return undefined
  }

  public hasNode(id: string): FlowNode | undefined {
    return this.nodeChild(id, this.children)
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

  public setNodeParent(parent: FlowNode, child: FlowNode) {
    this.graph.setParent(parent.name, child.name)
    parent.add(child)
    child.position.z = this.nodezdepth
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

  nextNodeId(): string {
    return `n${this.nodeCount}`
  }

  newNode(): FlowNode {
    const node: FlowNodeParameters = {
      text: this.nextNodeId(),
    }

    return this.setNode(node)
  }


  get allEdges(): Array<FlowEdge> {
    return this.children.filter(child => child.type == 'flowedge') as Array<FlowEdge>
  }

  private edgeChild(id: string, children: Array<Object3D>): FlowEdge | undefined {
    for (const child of children) {
      if (child.type == 'flowedge') {
        const edge = child as FlowEdge
        if (edge.name == id) return edge
      }
      if (child.children.length > 0) {
        const result = this.edgeChild(id, child.children)
        if (result) return result
      }
    }
    return undefined
  }
  public hasEdge(id: string): FlowEdge | undefined {
    return this.edgeChild(id, this.children)
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
    const mesh = this.addEdge(edge)
    this._edgeCount++;
    this.graph.setEdge(edge.v, edge.w, edge);
    return mesh;
  }

  public setEdgeParent(parent: FlowNode, child: FlowEdge) {
    parent.add(child)
    child.position.z = this.edgezdepth
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
