import { BufferGeometry, CatmullRomCurve3, Line, Mesh, Vector3 } from "three";
import { AbstractEdge, EdgeLineStyle } from "./abstract-model";
import { FlowGraph } from "./graph";
import { FlowNode } from "./node";

export class FlowEdge extends Mesh {
  from: string;
  to: string;
  color: number | string;
  linestyle: EdgeLineStyle;
  divisions: number
  thickness: number

  data?: { [key: string]: any; } | undefined;

  private fromConnector: FlowNode | undefined;
  private toConnector: FlowNode | undefined;
  private line?: Line

  isFlow = true
  constructor(graph: FlowGraph, public edge: AbstractEdge) {
    super()

    //@ts-ignore
    this.type = 'flowedge'

    this.name = edge.name = edge.name ?? graph.edges.length.toString()
    if (this.data) this.userData = this.data

    const dragged = () => {
      // invalidate layout points
      if (this.edge.points) this.edge.points = undefined

      this.updateVisuals()
    }

    this.from = edge.v
    this.fromConnector = graph.hasNode(this.from)
    this.fromConnector?.addEventListener('dragged', dragged)
    this.to = edge.w
    this.toConnector = graph.hasNode(this.to)
    this.toConnector?.addEventListener('dragged', dragged)

    this.color = edge.color ?? 'white'
    this.linestyle = edge.linestyle ?? 'spline'
    this.divisions = edge.divisions ?? 20
    this.thickness = edge.thickness ?? 0.01

    this.material = graph.getMaterial('line', 'edge', this.color)

    this.updateVisuals()

    if (this.line) {
      this.line.material = this.material
      this.line.position.z = -0.001
    }

  }

  updateVisuals() {
    let curvepoints: Array<Vector3> = []

    // use layout when provided
    if (this.edge.points) {
      this.edge.points.forEach(point => {
        curvepoints.push(new Vector3(point.x, -point.y, 0))
      })
    }
    else if (this.fromConnector && this.toConnector) {
      const start = new Vector3()
      this.fromConnector.getWorldPosition(start)

      const end = new Vector3()
      this.toConnector.getWorldPosition(end)

      curvepoints.push(start, end)
    }

    if (curvepoints.length > 0) {
      const curve = new CatmullRomCurve3(curvepoints);

      // only smooth if there are more then start and end
      if (this.linestyle == 'spline' && curvepoints.length > 2)
        curvepoints = curve.getPoints(this.divisions);

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

}
