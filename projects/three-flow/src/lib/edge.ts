import { BufferGeometry, CatmullRomCurve3, CubicBezierCurve3, Line, Mesh, Vector3 } from "three";
import { AbstractEdge } from "./abstract-model";
import { FlowConnector } from "./connector";
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

    this.from = edge.v
    this.fromConnector = graph.hasNode(this.from)
    this.fromConnector?.addEventListener('moved', () => {
      this.updateVisuals()
    })
    this.to = edge.w
    this.toConnector = graph.hasNode(this.to)
    this.toConnector?.addEventListener('moved', () => {
      this.updateVisuals()
    })


    this.material = graph.getMaterial('line', 'edge', this.color)

    this.updateVisuals()

    if (this.line.geometry) {
      this.line.material = this.material
      this.line.position.z = -0.001
      this.add(this.line)
    }

  }

  updateVisuals() {
    if (this.fromConnector && this.toConnector) {
      const start = new Vector3()
      this.fromConnector.getWorldPosition(start)

      const end = new Vector3()
      this.toConnector.getWorldPosition(end)

      const geometry = this.createGeometry(start, end)
      if (geometry)
        this.geometry = geometry
      else
        this.line.geometry = this.createLine(start, end)
    }
  }

  // overridable
  createLine(start: Vector3, end: Vector3): BufferGeometry {
    let curvepoints = [start, end]

    //// Calculate direction and distance between start and end
    //const direction = new Vector3().subVectors(end, start).normalize();
    //const distance = start.distanceTo(end);

    //// Define the magnitude of the curve
    //const curveMagnitude =  distance * 0.4;  // connector width/radius * some factor

    //let xfactor = 1
    //if (start.y > end.y) xfactor = -1

    //let yfactor = 1
    //if (start.x > end.x) yfactor = -1

    //// Calculate control points for the curve
    //const controlPoint1 = new Vector3(
    //  start.x + direction.y * curveMagnitude * xfactor,
    //  start.y  + direction.x * curveMagnitude* yfactor,
    //  start.z
    //);

    //const controlPoint2 = new Vector3(
    //  end.x - direction.y * curveMagnitude * xfactor,
    //  end.y - direction.x * curveMagnitude * yfactor,
    //  end.z
    //);

    //// Create the spline curve with control points
    //const curve = new CubicBezierCurve3(start, controlPoint1, controlPoint2, end);

    //curvepoints = curve.getPoints(25);
    return new BufferGeometry().setFromPoints(curvepoints);
  }

  createGeometry(start: Vector3, end: Vector3): BufferGeometry | undefined {
    return undefined
  }

}
