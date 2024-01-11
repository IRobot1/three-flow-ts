import { BufferGeometry, ColorRepresentation, MathUtils, Mesh, Object3D, Vector3 } from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial, LineMaterialParameters } from "three/examples/jsm/lines/LineMaterial";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { FlowArrowParameters, FlowEdgeParameters, EdgeLineStyle, FlowEventType, AnchorType } from "./model";
import { FlowDiagram } from "./diagram";
import { FlowNode } from "./node";
import { FlowArrow } from "./arrow";
import { ConnectorMesh } from "./connector";
import { Path3 } from "./path3";
import { FlowEdgePath3 } from "./edge-path3";
import { FlowLabel } from "./label";

export type CustomPathParams = {
  source: Vector3
  sourcePosition: AnchorType;
  target: Vector3
  targetPosition: AnchorType;
  curvature?: number;
};

export class FlowEdge extends Mesh {
  readonly from: string;
  readonly to: string;
  fromconnector?: string
  toconnector?: string

  private _matparams!: LineMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue as number;
      if (newvalue)
        (this.material as LineMaterial).color.set(newvalue)
    }
  }

  private _linestyle: EdgeLineStyle;
  get linestyle() { return this._linestyle }
  set linestyle(newvalue: EdgeLineStyle) {
    if (this._linestyle != newvalue) {
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

  public line?: Line2
  public label?: FlowLabel
  public stepRadius: number
  public stepOffset: number
  public bezierCurvature: number

  private _selectable: boolean;
  get selectable() { return this._selectable }
  set selectable(newvalue: boolean) {
    if (this._selectable != newvalue) {
      this._selectable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.SELECTABLE_CHANGED })
    }
  }

  get selectableObject(): Object3D {
    return this.line ? this.line : this
  }


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
      this._matparams = parameters.material as LineMaterialParameters
      if (parameters.material.color == undefined) parameters.material.color = 0xffffff
    }
    else
      this._matparams = { color: 0xffffff }

    this._linestyle = parameters.linestyle ? parameters.linestyle : 'bezier'
    this.lineoffset = parameters.lineoffset != undefined ? parameters.lineoffset : 0.2
    this._divisions = parameters.divisions ? parameters.divisions : 20
    this._thickness = parameters.thickness ? parameters.thickness : 0.01

    this.stepRadius = parameters.stepRadius != undefined ? parameters.stepRadius : 0.1
    this.stepOffset = parameters.stepOffset != undefined ? parameters.stepOffset : 0.1
    this.bezierCurvature = parameters.bezierCurvature != undefined ? parameters.bezierCurvature : 0.25

    this._selectable = parameters.selectable != undefined ? parameters.selectable : true

    if (parameters.label) {
      this.label = diagram.createLabel(parameters.label)
      this.add(this.label)
    }

    diagram.addEventListener(FlowEventType.NODE_REMOVED, (e: any) => {
      const node = e.node as FlowNode

      if (node == this.fromNode || node == this.toNode)
        diagram.removeEdge(this)
    })

    requestAnimationFrame(() => {
      if (this.label)
        this.label.updateLabel()

      this.updateVisuals()

      if (this.line) {
        this.line.position.z = this.z
      }
    })
  }

  private dragged() {
    // invalidate layout points
    if (this.parameters.points) this.parameters.points = undefined
    this.updateVisuals()
    this.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
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
      this.fromconnector = this.fromConnector.name
    }
    if (this.toNode) {
      this.toConnector = this.toNode.getConnector(toconnector)
      if (this.toConnector != this.toNode) {
        this.toConnector.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
        this.toConnector.addEventListener(FlowEventType.EDGE_DELETE, () => { this.deleteEdge() })
        this.parameters.toconnector = toconnector
      }
      this.toconnector = this.toConnector.name
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

  removeArrows() {
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

  curvepoints: Array<Vector3> = []

  updateVisuals() {
    // also used for arrows
    const from = new Vector3()
    const to = new Vector3()
    let path: Path3
    let center: Vector3 | undefined

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
    else {
      let fromanchor: AnchorType = 'center'
      let toanchor: AnchorType = 'center'

      if (this.fromConnector) {
        from.copy(this.diagram.getFlowPosition(this.fromConnector))

        if (this.fromConnector.type == 'flowconnector') {
          const frommesh = this.fromConnector as ConnectorMesh
          from.copy(this.diagram.getFlowPosition(frommesh))
          fromanchor = frommesh.anchor
        }
      }
      else if (this.fromNode)
        from.copy(this.fromNode.position)

      if (this.toConnector) {
        to.copy(this.diagram.getFlowPosition(this.toConnector))
        if (this.toConnector.type == 'flowconnector') {
          const tomesh = this.toConnector as ConnectorMesh
          to.copy(this.diagram.getFlowPosition(tomesh))
          toanchor = tomesh.anchor
        }
      }
      else if (this.toNode)
        to.copy(this.toNode.position)

      if (fromanchor == 'center' || toanchor == 'center') {
        const xdiff = Math.abs(to.x - from.x)
        const ydiff = Math.abs(to.y - from.y)
        if (xdiff > ydiff) {
          if (from.x < to.x) {
            fromanchor = 'right'
            toanchor = 'left'
          }
          else if (from.x > to.x) {
            fromanchor = 'left'
            toanchor = 'right'
          }
        }
        else {
          if (from.y < to.y) {
            fromanchor = 'top'
            toanchor = 'bottom'
          }
          else if (from.y > to.y) {
            fromanchor = 'bottom'
            toanchor = 'top'
          }
        }
      }

      const edge = new FlowEdgePath3()
      switch (this.linestyle) {
        case 'straight': {
          const result = edge.getStraightPath({ source: from, target: to })
          path = result.path
          center = result.label
        }
          break
        case 'step':
          const result = edge.getSmoothStepPath({ source: from, sourcePosition: fromanchor, target: to, targetPosition: toanchor, borderRadius: this.stepRadius, lineoffset: this.stepOffset })
          path = result.path
          center = result.label
          break
        case 'bezier': {
          const result = edge.getBezierPath({ source: from, sourcePosition: fromanchor, target: to, targetPosition: toanchor, curvature: this.bezierCurvature })
          path = result.path
          center = result.label
        }
          break
        case 'custom': {
          const result = this.getCustomPath({ source: from, sourcePosition: fromanchor, target: to, targetPosition: toanchor })
          path = result.path
          center = result.center
        }
      }
    }

    const curvepoints = path.getPoints(this.divisions)
    // avoid errors if something isn't right
    if (curvepoints.length == 0) return

    this.curvepoints = curvepoints

    const geometry = this.createGeometry(curvepoints, this.thickness)
    if (geometry) {
      this.geometry.dispose()
      this.geometry = geometry
      this.material = this.diagram.getMaterial('geometry', 'edge', this.parameters.material)

    }
    else {
      if (!this.line) {
        this.line = new Line2()
        this.material = this.line.material = this.diagram.getMaterial('line', 'edge', this.parameters.material) as LineMaterial
        this.add(this.line)
      }
      this.line.geometry.dispose()
      this.line.geometry = this.createLine(curvepoints)
      this.line.computeLineDistances()
    }

    if (center && this.label) {
      if (this.label.labelMesh) {
        this.label.labelMesh.position.copy(center)
      }
      this.dispatchEvent<any>({ type: FlowEventType.EDGE_CENTER, center })
    }

    if (this.toArrow) {
      const start = path.getPointAt(0.9)
      const end = path.getPointAt(0.95)
      this.toArrow.position.copy(path.getPointAt(1 - this.toArrow.offset))
      if (this.toConnector) {
        const angle = this.arrowLookAt(start, end)
        this.toArrow.rotate = angle + MathUtils.degToRad(90)
      }
    }
    if (this.fromArrow) {
      const start = path.getPointAt(0.1)
      const end = path.getPointAt(0.05)
      this.fromArrow.position.copy(path.getPointAt(this.fromArrow.offset))
      if (this.fromConnector) {
        const angle = this.arrowLookAt(start, end)
        this.fromArrow.rotate = angle + MathUtils.degToRad(90)
      }
    }
  }

  // overridable
  createLine(curvepoints: Array<Vector3>): LineGeometry {
    const positions: Array<number> = []
    curvepoints.forEach(p => positions.push(p.x, p.y, p.z))
    return new LineGeometry().setPositions(positions)
  }

  createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    return undefined
  }

  createArrow(arrow: FlowArrowParameters): FlowArrow {
    return new FlowArrow(this.diagram, arrow)
  }

  getCustomPath({
    source,
    sourcePosition = 'bottom',
    target,
    targetPosition = 'top',
  }: CustomPathParams): { path: Path3, center: Vector3 } {
    console.warn('custom path not implemented')
    return { path: new Path3(), center: new Vector3 }
  }
}


