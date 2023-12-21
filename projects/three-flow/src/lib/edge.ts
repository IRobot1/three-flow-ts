import { BufferGeometry, ColorRepresentation, Line, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, Path, SplineCurve, Vector2, Vector3 } from "three";
import { FlowArrowParameters, FlowEdgeParameters, EdgeLineStyle, FlowEventType, AnchorType } from "./model";
import { FlowDiagram } from "./diagram";
import { FlowNode } from "./node";
import { FlowArrow } from "./arrow";
import { ConnectorMesh } from "./connector";
import { Path3 } from "./path3";
import { FlowEdgePath3 } from "./edge-path3";

export class FlowEdge extends Mesh {
  readonly from: string;
  readonly to: string;

  private _matparams!: MeshBasicMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue;
      if (newvalue)
        (this.material as MeshBasicMaterial).color.set(newvalue)
    }
  }

  private _linestyle: EdgeLineStyle;
  get linestyle() { return this._linestyle }
  set linestyle(newvalue: EdgeLineStyle) {
    if (this._linestyle != newvalue) {
      if (this._linestyle == 'bezier') this.removeArrows()
      this._linestyle = newvalue
      this.updateVisuals()
    }
  }

  private _divisions: number
  get divisions() { return this._divisions }
  set divisions(newvalue: number) {
    newvalue = Math.max(3, newvalue)
    if (this._divisions != newvalue) {
      this._divisions = newvalue
      this.updateVisuals()
    }
  }

  private _thickness: number
  get thickness() { return this._thickness }
  set thickness(newvalue: number) {
    if (this._thickness != newvalue) {
      this._thickness = newvalue
      this.updateVisuals()
    }
  }

  data?: { [key: string]: any; } | undefined;

  public fromArrow: FlowArrow | undefined;
  public toArrow: FlowArrow | undefined;

  lineoffset = 0.2
  z: number

  readonly fromNode: FlowNode | undefined
  readonly toNode: FlowNode | undefined

  private fromConnector: Object3D | undefined
  private toConnector: Object3D | undefined

  private line?: Line

  isFlow = true
  constructor(public diagram: FlowDiagram, public parameters: FlowEdgeParameters) {
    super()

    //@ts-ignore
    this.type = 'flowedge'

    this.name = parameters.id = parameters.id ? parameters.id : diagram.nextEdgeId()
    if (this.data) this.userData = this.data

    this.z = parameters.z != undefined ? parameters.z : -0.005

    this.from = parameters.from

    this.fromNode = diagram.hasNode(this.from)
    if (this.fromNode) {
      this.fromNode.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
      this.fromNode.addEventListener(FlowEventType.SCALE_CHANGED, () => { this.dragged() })
      this.fromNode.addEventListener(FlowEventType.EDGE_DELETE, () => { console.warn('TODO: delete edge from node') })
      this.fromNode.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
        if (this.fromNode)
          this.visible = this.fromNode.visible
      })
    }

    this.to = parameters.to

    this.toNode = diagram.hasNode(this.to)
    if (this.toNode) {
      this.toNode.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
      this.toNode.addEventListener(FlowEventType.SCALE_CHANGED, () => { this.dragged() })
      this.toNode.addEventListener(FlowEventType.EDGE_DELETE, () => { console.warn('TODO: delete edge to node') })
      this.toNode.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
        if (this.toNode)
          this.visible = this.toNode.visible
      })


    }

    this.addConnector(parameters.fromconnector, parameters.toconnector, false)

    if (parameters.fromarrow) {
      parameters.fromarrow.type = parameters.fromarrow.type ? parameters.fromarrow.type : 'from'
      this.fromArrow = this.createArrow(parameters.fromarrow)
      this.add(this.fromArrow)
    }
    if (parameters.toarrow) {
      parameters.toarrow.type = parameters.toarrow.type ? parameters.toarrow.type : 'to'
      this.toArrow = this.createArrow(parameters.toarrow)
      this.add(this.toArrow)
    }

    if (parameters.material) {
      this._matparams = parameters.material
      if (!parameters.material.color) parameters.material.color = 'white'
    }
    else
      this._matparams = { color: 'white' }

    this._linestyle = parameters.linestyle ? parameters.linestyle : 'bezier'
    this.lineoffset = parameters.lineoffset != undefined ? parameters.lineoffset : 0.2
    this._divisions = parameters.divisions ? parameters.divisions : 20
    this._thickness = parameters.thickness ? parameters.thickness : 0.01

    this.material = diagram.getMaterial('line', 'edge', this._matparams)

    diagram.addEventListener(FlowEventType.NODE_REMOVED, (e: any) => {
      const node = e.node as FlowNode

      if (node == this.fromNode || node == this.toNode)
        diagram.removeEdge(this)
    })

    requestAnimationFrame(() => {
      this.updateVisuals()

      if (this.line) {
        this.line.material = this.material
        this.line.position.z = this.z
      }
    })
  }

  private dragged() {
    this.removeArrows()
    this.updateVisuals()
  }

  private deleteEdge() { this.diagram.removeEdge(this) }

  addConnector(fromconnector?: string, toconnector?: string, update = true) {
    if (this.fromNode) {
      this.fromConnector = this.fromNode.getConnector(fromconnector)
      if (this.fromConnector != this.fromNode) {
        this.fromConnector.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
        this.fromConnector.addEventListener(FlowEventType.EDGE_DELETE, () => { this.deleteEdge() })
        this.parameters.fromconnector = fromconnector
      }
    }
    if (this.toNode) {
      this.toConnector = this.toNode.getConnector(toconnector)
      if (this.toConnector != this.toNode) {
        this.toConnector.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
        this.toConnector.addEventListener(FlowEventType.EDGE_DELETE, () => { this.deleteEdge() })
        this.parameters.toconnector = toconnector
      }
    }
    if (update) this.updateVisuals()
  }

  removeConnector() {
    if (this.fromNode) {
      if (this.fromConnector) this.fromConnector.removeEventListener(FlowEventType.DRAGGED, this.dragged)
      this.fromConnector = this.fromNode.getConnector(undefined)
      this.parameters.fromconnector = undefined
    }
    if (this.toNode) {
      if (this.toConnector) this.toConnector.removeEventListener(FlowEventType.DRAGGED, this.dragged)
      this.toConnector = this.toNode.getConnector(undefined)
      this.parameters.toconnector = undefined
    }
    this.updateVisuals()
  }

  private removeArrows() {
    // invalidate layout points
    if (this.parameters.points) this.parameters.points = undefined

    // and arrows
    if (this.toArrow) {
      this.remove(this.toArrow)
      this.toArrow = undefined
    }

    if (this.fromArrow) {
      this.remove(this.fromArrow)
      this.fromArrow = undefined
    }
  }

  private arrowLookAt(source: Vector3, target: Vector3) {
    // Calculate the angle to rotate
    return Math.atan2(target.y - source.y, target.x - source.x)
  }

  updateVisuals() {
    // also used for arrows
    const from = new Vector3()
    const to = new Vector3()
    let path: Path3

    // use layout when provided
    if (this.parameters.points) {
      const curvepoints: Array<Vector3> = []
      this.parameters.points.forEach(point => {
        curvepoints.push(new Vector3(point.x, -point.y))
      })
      path = new Path3(curvepoints)

      from.copy(curvepoints[0])
      to.copy(curvepoints[curvepoints.length - 1])
    }
    else if (this.fromConnector && this.toConnector) {

      from.copy(this.diagram.getFlowPosition(this.fromConnector))
      to.copy(this.diagram.getFlowPosition(this.toConnector))

      let fromanchor: AnchorType = 'center'
      let toanchor: AnchorType = 'center'

      if (this.fromConnector.type == 'flowconnector') {
        const frommesh = this.fromConnector as ConnectorMesh
        from.copy(this.diagram.getFlowPosition(frommesh))
        fromanchor = frommesh.anchor
      }

      if (this.toConnector.type == 'flowconnector') {
        const tomesh = this.toConnector as ConnectorMesh
        to.copy(this.diagram.getFlowPosition(tomesh))
        toanchor = tomesh.anchor
      }

      const edge = new FlowEdgePath3()
      switch (this.linestyle) {
        case 'straight': {
          const result = edge.getStraightPath({ source: from, target: to })
          path = result.path
        }
          break
        case 'step':
          const result = edge.getSmoothStepPath({ source: from, sourcePosition: fromanchor, target: to, targetPosition: toanchor })
          path = result.path
          break
        case 'bezier': {
          const result = edge.getBezierPath({ source: from, sourcePosition: fromanchor, target: to, targetPosition: toanchor })
          path = result.path
        }
          break

      }
    }
    else
      path = new Path3([from, to])

    const curvepoints = path.getPoints(this.divisions)//.map(p => new Vector3(p.x, p.y, p.z))
    const geometry = this.createGeometry(curvepoints, this.thickness)
    if (geometry) {
      this.geometry.dispose()
      this.geometry = geometry
    }
    else {
      if (!this.line) {
        this.line = new Line()
        this.add(this.line)
      }
      this.line.geometry.dispose()
      this.line.geometry = this.createLine(curvepoints)
      this.line.computeLineDistances()
    }


    if (this.toArrow) {
      this.toArrow.position.set(to.x, to.y, 0)
      if (this.toConnector) {
        const angle = this.arrowLookAt(this.toArrow.position, this.toConnector.position)
        this.toArrow.rotate = angle + MathUtils.degToRad(90)
      }
    }
    if (this.fromArrow) {
      this.fromArrow.position.set(from.x, from.y, 0)
      if (this.fromConnector) {
        const angle = this.arrowLookAt(this.fromArrow.position, this.fromConnector.position)
        this.fromArrow.rotate = angle + MathUtils.degToRad(90)
      }
    }




  }

  // overridable
  createLine(curvepoints: Array<Vector3>): BufferGeometry {
    return new BufferGeometry().setFromPoints(curvepoints);
  }

  createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    return undefined
  }

  createArrow(arrow: FlowArrowParameters): FlowArrow {
    return new FlowArrow(this, arrow)
  }
}
