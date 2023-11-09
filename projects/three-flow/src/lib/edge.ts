import { BufferGeometry, CatmullRomCurve3, Line, Mesh, Vector3 } from "three";
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
    const curve = new CatmullRomCurve3([start, end]);
    const curvepoints = curve.getPoints(25);
    return new BufferGeometry().setFromPoints(curvepoints);
  }

  createGeometry(start: Vector3, end: Vector3): BufferGeometry | undefined {
    return undefined
  }

}
