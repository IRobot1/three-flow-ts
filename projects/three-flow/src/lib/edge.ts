import { BufferGeometry, CatmullRomCurve3, Line, Mesh, Vector3 } from "three";
import { AbstractEdge } from "./abstract-model";
import { FlowGraph } from "./graph";
import { FlowNode } from "./node";

export class FlowEdge extends Mesh {
  from!: string;
  to!: string;
  color = 'white'
  data?: { [key: string]: any; } | undefined;

  private fromConnector: FlowNode | undefined;
  private toConnector: FlowNode | undefined;
  private line = new Line()

  isFlow = true
  constructor(graph: FlowGraph, public edge: AbstractEdge) {
    super()

    //@ts-ignore
    this.type = 'flowedge'

    this.name = edge.name = edge.name ?? graph.edges.length.toString()
    if (this.data) this.userData = this.data

    if (!edge.v) {
      console.warn(`Edge ${this.name} start connector id must be defined`)
      return
    }
    if (!edge.w) {
      console.warn(`Edge ${this.name} end connector id must be defined`)
      return
    }

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


    this.material = graph.getMaterial('line', 'edge', this.color)

    this.updateVisuals()

    if (this.line.geometry) {
      this.line.material = this.material
      this.line.position.z = -0.001
      this.add(this.line)
    }

  }

  updateVisuals() {
    const curvepoints: Array<Vector3> = []

    // use layout when provided
    if (this.edge.points) {
      this.edge.points.forEach(point => {
        curvepoints.push(new Vector3(point.x, point.y, 0))
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
      const geometry = this.createGeometry(curvepoints)
      if (geometry)
        this.geometry = geometry
      else
        this.line.geometry = this.createLine(curvepoints)
    }
  }

  // overridable
  createLine(curvepoints: Array<Vector3>): BufferGeometry {

    const curve = new CatmullRomCurve3(curvepoints);

    // only smooth if there are more then start and end
    if (curvepoints.length > 2) curvepoints = curve.getPoints(25);

    return new BufferGeometry().setFromPoints(curvepoints);
  }

  createGeometry(curvepoints: Array<Vector3>): BufferGeometry | undefined {
    return undefined
  }

}
