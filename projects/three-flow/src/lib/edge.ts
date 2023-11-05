import { BufferGeometry, CatmullRomCurve3, Line, LineBasicMaterial, Mesh, Vector3 } from "three";
import { AbstractDiagram, AbstractEdge, EdgeRouting, EdgeState } from "./abstract-model";
import { FlowConnector } from "./connector";

export class FlowEdge extends Line {
  edgeid: string;
  startConnectorId: string;
  endConnectorId: string;
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

  constructor(diagram: AbstractDiagram, edge: AbstractEdge) {
    super()

    this.edgeid = edge.edgeid

    this.startConnectorId = edge.startConnectorId
    let connector = diagram.connectors.find(c => c.connectorid = this.startConnectorId)
    if (connector) this.startConnector = new FlowConnector(connector)

    this.endConnectorId = edge.endConnectorId
    connector = diagram.connectors.find(c => c.connectorid = this.endConnectorId)
    if (connector) this.endConnector = new FlowConnector(connector)

    this.intermediatePoints = edge.intermediatePoints
    this.color = edge.color
    this.label = edge.label
    this.labelcolor = edge.color
    this.labelsize = edge.labelsize
    this.selectable = edge.selectable
    this.highlighting = edge.highlighting
    if (this.data) this.userData = this.data
    this.state = edge.state
    this.error = edge.error
    this.routing = edge.routing
    this.arrowheads = edge.arrowheads

    this.material = new LineBasicMaterial({ color: edge.color })

    this.updateVisuals()
  }

  interact() { }
  compatibility() { }

  updateVisuals() {
    if (this.startConnector && this.endConnector) {
      const start = new Vector3()
      this.startConnector.getWorldPosition(start)

      const end = new Vector3()
      this.endConnector.getWorldPosition(end)

      console.warn(start, end)

      const curve = new CatmullRomCurve3([start,end]);
      const curvepoints = curve.getPoints(25);
      this.geometry = new BufferGeometry().setFromPoints(curvepoints);

    }
  }

}
