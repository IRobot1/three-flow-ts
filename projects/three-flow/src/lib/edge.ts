import { BufferGeometry, CatmullRomCurve3, CubicBezierCurve3, Line, Mesh, Vector3 } from "three";
import { AbstractEdge } from "./abstract-model";
import { FlowConnector } from "./connector";
import { FlowGraph } from "./graph";

export class FlowEdge extends Mesh {
  from!: string;
  to!: string;
  color = 'white'
  data?: { [key: string]: any; } | undefined;

  private fromConnector: FlowConnector | undefined;
  private toConnector: FlowConnector | undefined;
  private line = new Line()

  isFlow = true
  constructor(graph: FlowGraph, edge: Partial<AbstractEdge>) {
    super()

    //@ts-ignore
    this.type = 'flowedge'

    this.name = edge.id = edge.id ?? graph.edges.length.toString()
    if (this.data) this.userData = this.data

    if (!edge.from) {
      console.warn(`Edge ${this.name} start connector id must be defined`)
      return
    }
    if (!edge.to) {
      console.warn(`Edge ${this.name} end connector id must be defined`)
      return
    }

    this.from = edge.from
    this.fromConnector = graph.hasConnector(this.from)
    this.fromConnector?.addEventListener('moved', () => {
      this.updateVisuals()
    })
    this.to = edge.to
    this.toConnector = graph.hasConnector(this.to)
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

    // Calculate direction and distance between start and end
    const direction = new Vector3().subVectors(end, start).normalize();
    const distance = start.distanceTo(end);

    // Define the magnitude of the curve
    const curveMagnitude =  distance * 0.4;  // connector width/radius * some factor

    let xfactor = 1
    if (start.y > end.y) xfactor = -1

    let yfactor = 1
    if (start.x > end.x) yfactor = -1

    // Calculate control points for the curve
    const controlPoint1 = new Vector3(
      start.x + direction.y * curveMagnitude * xfactor,
      start.y  + direction.x * curveMagnitude* yfactor,
      start.z
    );

    const controlPoint2 = new Vector3(
      end.x - direction.y * curveMagnitude * xfactor,
      end.y - direction.x * curveMagnitude * yfactor,
      end.z
    );

    // Create the spline curve with control points
    const curve = new CubicBezierCurve3(start, controlPoint1, controlPoint2, end);

    const curvepoints = curve.getPoints(25);
    return new BufferGeometry().setFromPoints(curvepoints);
  }

  createGeometry(start: Vector3, end: Vector3): BufferGeometry | undefined {
    return undefined
  }

}
