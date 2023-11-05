import { AbstractConnector, ConnectorState, ConnectorType } from "./abstract-model";
import { Mesh } from "three";
import { FlowNode } from "./node";

export class FlowConnector extends Mesh {
  connectorid: string;
  connectortype: ConnectorType;
  location: { x: number; y: number; z: number; };
  connectedEdges: string[];
  multiplicity: number;
  compatibility: string[];
  draggable: boolean;
  size: number;
  shape: string;
  color: string;
  label: string;
  labelsize: number;
  labelcolor: string;
  state: ConnectorState;
  error?: string | undefined;
  documentation?: string | undefined;

  constructor(connector: AbstractConnector, parentNode: FlowNode) {
    super()

    this.connectorid = connector.connectorid
    this.connectortype = connector.connectortype
    this.location = connector.location
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
  }

  updateVisuals() {
  }
}
