import { BufferGeometry, CatmullRomCurve3, Line, Mesh, Vector3 } from "three";
import { AbstractEdge, EdgeRouting, EdgeState } from "./abstract-model";
import { FlowConnector } from "./connector";
import { FlowDiagram } from "./diagram";

export class FlowEdge extends Mesh {
  startConnectorId!: string;
  endConnectorId!: string;
  intermediatePoints: string[];
  color: number | string
  label?: string | undefined;
  labelsize: number;
  labelcolor: number | string;
  selectable: boolean;
  highlighting: boolean;
  data?: { [key: string]: any; } | undefined;
  state: EdgeState;
  error?: string | undefined;
  routing: EdgeRouting;
  arrowheads: boolean;

  private startConnector: FlowConnector | undefined;
  private endConnector: FlowConnector | undefined;
  private line = new Line()

  isFlow = true
  constructor(diagram: FlowDiagram, edge: Partial<AbstractEdge>) {
    super()

    //@ts-ignore
    this.type = 'flowedge'

    this.name = edge.id = edge.id ?? diagram.edges.length.toString()
    this.intermediatePoints = edge.intermediatePoints = edge.intermediatePoints ?? []
    this.color = edge.color = edge.color ?? 'white'
    this.label = edge.label = edge.label ?? ''
    this.labelcolor = edge.labelcolor = edge.labelcolor ?? 'black'
    this.labelsize = edge.labelsize = edge.labelsize ?? 0.1
    this.selectable = edge.selectable = edge.selectable ?? true
    this.highlighting = edge.highlighting = edge.highlighting ?? false
    if (this.data) this.userData = this.data
    this.state = edge.state = edge.state ?? 'default'
    this.error = edge.error
    this.routing = edge.routing = edge.routing ?? 'straight'
    this.arrowheads = edge.arrowheads = edge.arrowheads ?? false
    if (!edge.startConnectorId) {
      console.warn(`Edge ${this.name} start connector id must be defined`)
      return
    }
    if (!edge.endConnectorId) {
      console.warn(`Edge ${this.name} end connector id must be defined`)
      return
    }

    this.startConnectorId = edge.startConnectorId
    this.startConnector = diagram.getConnector(this.startConnectorId)
    this.startConnector?.addEventListener('moved', () => {
      this.updateVisuals()
    })
    this.endConnectorId = edge.endConnectorId
    this.endConnector = diagram.getConnector(this.endConnectorId)
    this.endConnector?.addEventListener('moved', () => {
      this.updateVisuals()
    })


    this.material = diagram.getMaterial('line', 'edge', this.color)

    this.updateVisuals()

    if (this.line.geometry) {
      this.line.material = this.material
      this.add(this.line)
    }

  }

  updateVisuals() {
    if (this.startConnector && this.endConnector) {
      const start = new Vector3()
      this.startConnector.getWorldPosition(start)

      const end = new Vector3()
      this.endConnector.getWorldPosition(end)

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
