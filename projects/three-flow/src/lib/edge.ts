import { BufferGeometry, CatmullRomCurve3, Line, MathUtils, Mesh, MeshBasicMaterial, Object3D, Vector2, Vector3 } from "three";
import { FlowArrowParameters, FlowEdgeParameters, EdgeLineStyle, FlowEventType } from "./model";
import { FlowDiagram } from "./diagram";
import { FlowNode } from "./node";
import { FlowArrow } from "./arrow";

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

  readonly fromConnector: Object3D | undefined
  readonly toConnector: Object3D | undefined
  public fromArrow: FlowArrow | undefined;
  public toArrow: FlowArrow | undefined;
  private line?: Line

  isFlow = true
  constructor(public diagram: FlowDiagram, public edge: FlowEdgeParameters) {
    super()

    //@ts-ignore
    this.type = 'flowedge'

    this.name = edge.name = edge.name ? edge.name : diagram.nextEdgeId()
    if (this.data) this.userData = this.data

    const dragged = () => {
      this.removeArrows()
      this.updateVisuals()
    }

    this.from = edge.v

    const fromNode = diagram.hasNode(this.from)
    if (fromNode) {
      fromNode.addEventListener(FlowEventType.DRAGGED, dragged)

      fromNode.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
        if (fromNode)
          this.visible = fromNode.visible
      })
      this.fromConnector = fromNode.getConnector(edge.fromconnector)
    }

    this.to = edge.w

    const toNode = diagram.hasNode(this.to)
    if (toNode) {
      toNode.addEventListener(FlowEventType.DRAGGED, dragged)

      toNode.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
        if (toNode)
          this.visible = toNode.visible
      })
      this.toConnector = toNode.getConnector(edge.toconnector)
    }

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
      from.copy(this.fromConnector.getWorldPosition(new Vector3()))
      to.copy(this.toConnector.getWorldPosition(new Vector3()))

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
