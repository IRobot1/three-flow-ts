import { BufferGeometry, CatmullRomCurve3, ColorRepresentation, Line, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, Vector3 } from "three";
import { FlowArrowParameters, FlowEdgeParameters, EdgeLineStyle, FlowEventType } from "./model";
import { FlowDiagram } from "./diagram";
import { FlowNode } from "./node";
import { FlowArrow } from "./arrow";
import { ConnectorMesh } from "./connector";

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

  lineoffset = 0.2
  z: number

  readonly fromNode: FlowNode | undefined
  readonly toNode: FlowNode | undefined

  private fromConnector: Object3D | undefined
  private toConnector: Object3D | undefined

  private line?: Line

  isFlow = true
  constructor(public diagram: FlowDiagram, public edge: FlowEdgeParameters) {
    super()

    //@ts-ignore
    this.type = 'flowedge'

    this.name = edge.id = edge.id ? edge.id : diagram.nextEdgeId()
    if (this.data) this.userData = this.data

    this.z = edge.z != undefined ? edge.z : -0.005

    this.from = edge.from

    this.fromNode = diagram.hasNode(this.from)
    if (this.fromNode) {
      this.fromNode.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
      this.fromNode.addEventListener(FlowEventType.SCALE_CHANGED, () => { this.dragged() })

      this.fromNode.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
        if (this.fromNode)
          this.visible = this.fromNode.visible
      })
    }

    this.to = edge.to

    this.toNode = diagram.hasNode(this.to)
    if (this.toNode) {
      this.toNode.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
      this.toNode.addEventListener(FlowEventType.SCALE_CHANGED, () => { this.dragged() })

      this.toNode.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
        if (this.toNode)
          this.visible = this.toNode.visible
      })


    }

    this.addConnector(edge.fromconnector, edge.toconnector, false)

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

    if (edge.material) {
      this._matparams = edge.material
      if (!edge.material.color) edge.material.color = 'white'
    }
    else
      this._matparams = { color: 'white' }

    this._linestyle = edge.linestyle ? edge.linestyle : 'spline'
    this.lineoffset = edge.lineoffset != undefined ? edge.lineoffset : 0.2
    this._divisions = edge.divisions ? edge.divisions : 20
    this._thickness = edge.thickness ? edge.thickness : 0.01

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

  addConnector(fromconnector?: string, toconnector?: string, update = true) {
    if (this.fromNode) {
      this.fromConnector = this.fromNode.getConnector(fromconnector)
      if (this.fromConnector != this.fromNode) {
        this.fromConnector.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
        this.edge.fromconnector = fromconnector
      }
    }
    if (this.toNode) {
      this.toConnector = this.toNode.getConnector(toconnector)
      if (this.toConnector != this.toNode) {
        this.toConnector.addEventListener(FlowEventType.DRAGGED, () => { this.dragged() })
        this.edge.toconnector = toconnector
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

  updateVisuals() {
    // also used for arrows
    const from = new Vector3()
    const to = new Vector3()

    let curvepoints: Array<Vector3> = []

    // use layout when provided
    if (this.edge.points) {
      this.edge.points.forEach(point => {
        curvepoints.push(new Vector3(point.x, -point.y, 0))
      })

      from.copy(curvepoints[0])
      to.copy(curvepoints[curvepoints.length - 1])
    }
    else if (this.fromConnector && this.toConnector) {

      from.copy(this.diagram.getFlowPosition(this.fromConnector))
      to.copy(this.diagram.getFlowPosition(this.toConnector))

      if (this.fromConnector.type == 'flowconnector' && this.toConnector.type == 'flowconnector') {
        const frommesh = this.fromConnector as ConnectorMesh
        const tomesh = this.toConnector as ConnectorMesh

        const lookup: any = {
          top: { x: 0, y: this.lineoffset },
          bottom: { x: 0, y: -this.lineoffset },
          left: { x: -this.lineoffset, y: 0 },
          right: { x: this.lineoffset, y: 0 },
          center: { x: 0, y: 0 },
        }
        const delta1 = lookup[frommesh.anchor]
        let x = from.x + delta1.x
        let y = from.y + delta1.y
        const A1 = new Vector3(x, y, this.z);

        const delta2 = lookup[tomesh.anchor]
        x = to.x + delta2.x
        y = to.y + delta2.y
        const B1 = new Vector3(x, y, this.z);

        x = delta1.x + delta2.x
        y = delta1.y + delta2.y
        const diagonal = (x != 0 || y != 0)

        switch (this.edge.linestyle) {
          case 'offset':
            curvepoints.push(from, A1, B1, to)
            break;
          case 'spline':
            let curve = new CatmullRomCurve3([from, A1, B1, to]);
            curvepoints = curve.getPoints(this.divisions)
            break;
          case 'split':
            if (diagonal) {
              const splitlookup: any = {
                righttop: { x: to.x, y: from.y },
                lefttop: { x: to.x, y: from.y },
                rightbottom: { x: to.x, y: from.y },
                leftbottom: { x: to.x, y: from.y },
                topleft: { x: from.x, y: to.y },
                topright: { x: from.x, y: to.y },
                bottomright: { x: from.x, y: to.y },
                bottomleft: { x: from.x, y: to.y },
              }
              const c = splitlookup[frommesh.anchor + tomesh.anchor]
              curvepoints.push(from, new Vector3(c.x, c.y, this.z), to)
            }
            else {
              if (frommesh.anchor == 'left' || frommesh.anchor == 'right') {
                A1.x = B1.x = from.x - (from.x - to.x) / 2;
              }

              if (frommesh.anchor == 'top' || frommesh.anchor == 'bottom') {
                A1.y = B1.y = from.y - (from.y - to.y) / 2;
              }
              curvepoints.push(from, A1, B1, to)
            }

            break;
          case 'straight':
          default:
            curvepoints.push(from, to)
            break;
        }
      }
      else
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
        this.line.computeLineDistances()
      }

    }

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
