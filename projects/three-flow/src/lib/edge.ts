import { BufferGeometry, CatmullRomCurve3, Line, MathUtils, Matrix4, Mesh, MeshBasicMaterial, Object3D, Vector2, Vector3 } from "three";
import { FlowArrowParameters, FlowEdgeParameters, EdgeLineStyle, FlowEventType } from "./model";
import { FlowDiagram } from "./diagram";
import { FlowNode } from "./node";
import { FlowArrow } from "./arrow";
import { FlowConnectorParameters } from "../../../../dist/three-flow";

export class FlowEdge extends Mesh {
  readonly from: string;
  readonly to: string;

  private _color: number | string;
  get color() { return this._color }
  set color(newvalue: number | string) {
    if (this._color != newvalue) {
      this._color = newvalue;
      (this.material as any).color.set(newvalue)
    }
  }

  private _linestyle: EdgeLineStyle;
  get linestyle() { return this._linestyle }
  set linestyle(newvalue: EdgeLineStyle) {
    if (this._linestyle != newvalue) {
      if (this._linestyle == 'spline') this.removeArrows()
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


  private readonly fromNode: FlowNode | undefined
  private readonly toNode: FlowNode | undefined

  private fromConnector: Object3D | undefined
  private toConnector: Object3D | undefined

  private line?: Line

  isFlow = true
  constructor(public diagram: FlowDiagram, public edge: FlowEdgeParameters) {
    super()

    //@ts-ignore
    this.type = 'flowedge'

    this.name = edge.name = edge.name ? edge.name : diagram.nextEdgeId()
    if (this.data) this.userData = this.data


    this.from = edge.v

    this.fromNode = diagram.hasNode(this.from)
    if (this.fromNode) {
      this.fromNode.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
      this.fromNode.addEventListener(FlowEventType.SCALE_CHANGED, () => { this.dragged() })

      this.fromNode.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
        if (this.fromNode)
          this.visible = this.fromNode.visible
      })
    }

    this.to = edge.w

    this.toNode = diagram.hasNode(this.to)
    if (this.toNode) {
      this.toNode.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
      this.toNode.addEventListener(FlowEventType.SCALE_CHANGED, () => { this.dragged() })

      this.toNode.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
        if (this.toNode)
          this.visible = this.toNode.visible
      })
    }

    this.addConnector(edge.fromconnector, edge.toconnector)

    if (edge.fromarrow) {
      edge.fromarrow.type = edge.fromarrow.type ? edge.fromarrow.type : 'from'
      this.fromArrow = this.createArrow(edge.fromarrow)
      this.add(this.fromArrow)
    }
    if (edge.toarrow) {
      edge.toarrow.type = edge.toarrow.type ? edge.toarrow.type : 'to'
      this.toArrow = this.createArrow(edge.toarrow)
      this.add(this.toArrow)
    }


    this._color = edge.color ? edge.color : 'white'
    this._linestyle = edge.linestyle ? edge.linestyle : 'spline'
    this._divisions = edge.divisions ? edge.divisions : 20
    this._thickness = edge.thickness ? edge.thickness : 0.01

    this.material = diagram.getMaterial('line', 'edge', this.color)

    this.updateVisuals()

    if (this.line) {
      this.line.material = this.material
      this.line.position.z = -0.001
    }
  }

  private dragged() {
    this.removeArrows()
    this.updateVisuals()
  }

  addConnector(fromconnector?: string, toconnector?: string) {
    let update = false
    if (this.fromNode) {
      this.fromConnector = this.fromNode.getConnector(fromconnector)
      if (this.fromConnector != this.fromNode) {
        this.fromConnector.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
        this.edge.fromconnector = fromconnector
        update = true
      }
    }
    if (this.toNode) {
      this.toConnector = this.toNode.getConnector(toconnector)
      if (this.toConnector != this.toNode) {
        this.toConnector.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
        this.edge.toconnector = toconnector
        update = true
      }
    }
    if (update) this.updateVisuals()
  }

  removeConnector() {
    if (this.fromNode) {
      if (this.fromConnector) this.fromConnector.removeEventListener(FlowEventType.DRAGGED, this.dragged)
      this.fromConnector = this.fromNode.getConnector(undefined)
      this.edge.fromconnector = undefined
    }
    if (this.toNode) {
      if (this.toConnector) this.toConnector.removeEventListener(FlowEventType.DRAGGED, this.dragged)
      this.toConnector = this.toNode.getConnector(undefined)
      this.edge.toconnector = undefined
    }
    this.updateVisuals()
  }

  private removeArrows() {
    // invalidate layout points
    if (this.edge.points) this.edge.points = undefined

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

  // Get position of connector relative to diagram
  private getConnectorPosition(connector: Object3D, diagram: Object3D): Vector3 {
    let connectorWorldPosition = new Vector3();
    connector.localToWorld(connectorWorldPosition);

    return diagram.worldToLocal(connectorWorldPosition);
  }

  updateVisuals() {
    let curvepoints: Array<Vector3> = []
    const from = new Vector3()
    const to = new Vector3()

    // use layout when provided
    if (this.linestyle == 'spline' && this.edge.points) {
      this.edge.points.forEach(point => {
        curvepoints.push(new Vector3(point.x, -point.y, 0))
      })
      from.copy(curvepoints[0])
      to.copy(curvepoints[curvepoints.length - 1])


      if (this.toArrow) {
        this.toArrow.position.copy(to)
        if (this.toConnector) {
          const angle = this.arrowLookAt(this.toArrow.position, this.toConnector.position)
          this.toArrow.rotate = angle + MathUtils.degToRad(90)
        }
      }
      if (this.fromArrow) {
        this.fromArrow.position.copy(from)
        if (this.fromConnector) {
          const angle = this.arrowLookAt(this.fromArrow.position, this.fromConnector.position)
          this.fromArrow.rotate = angle + MathUtils.degToRad(90)
        }
      }
    }
    else if (this.fromConnector && this.toConnector) {
      from.copy(this.getConnectorPosition(this.fromConnector, this.diagram))
      to.copy(this.getConnectorPosition(this.toConnector, this.diagram))

      curvepoints.push(from, to)
    }

    if (curvepoints.length > 0) {
      const curve = new CatmullRomCurve3(curvepoints);

      // only smooth if there are more then start and end
      if (this.linestyle == 'spline' && curvepoints.length > 2) {
        curvepoints = curve.getPoints(this.divisions);
      }

      const geometry = this.createGeometry(curvepoints, this.thickness)
      if (geometry)
        this.geometry = geometry
      else {
        if (!this.line) {
          this.line = new Line()
          this.add(this.line)
        }
        this.line.geometry = this.createLine(curvepoints)
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
