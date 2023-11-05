import { AbstractConnector, ConnectorState, ConnectorType } from "./abstract-model";
import { CircleGeometry, Mesh, MeshBasicMaterial } from "three";

export class FlowConnector extends Mesh {
  connectortype: ConnectorType;
  connectedEdges: string[];
  multiplicity: number;
  compatibility: string[];
  draggable: boolean;
  size: number;
  shape: string;
  color: number | string;
  label: string;
  labelsize: number;
  labelcolor: string;
  state: ConnectorState;
  error?: string | undefined;
  documentation?: string | undefined;

  isFlow = true
  constructor(connector: AbstractConnector) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'

    this.name = connector.connectorid
    this.connectortype = connector.connectortype
    this.connectedEdges = connector.connectedEdges
    this.multiplicity = connector.multiplicity
    this.compatibility = connector.compatibility
    this.draggable = connector.draggable
    this.size = connector.size
    this.shape = connector.shape
    this.color = connector.color
    this.label = connector.label
    this.labelsize = connector.labelsize
    this.labelcolor = connector.labelcolor

    this.state = connector.state
    if (connector.data) this.userData = connector.data
    this.error = connector.error
    this.documentation = connector.documentation

    this.geometry = new CircleGeometry(0.1)

    this.material = new MeshBasicMaterial({ color: this.color });

  }

  updateVisuals() {
  }
}
