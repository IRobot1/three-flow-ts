import { AbstractConnector, ConnectorState, ConnectorType } from "./abstract-model";
import { BufferGeometry, CircleGeometry, Mesh, MeshBasicMaterial } from "three";
import { FlowDiagram } from "./diagram";

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
  constructor(private diagram: FlowDiagram, public connector: Partial<AbstractConnector>) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'

    this.name = connector.id = connector.id ?? diagram.connectors.length.toString()
    this.connectortype = connector.connectortype = connector.connectortype ?? 'input'
    this.connectedEdges = connector.connectedEdges = connector.connectedEdges ?? []
    this.multiplicity = connector.multiplicity = connector.multiplicity ?? 1
    this.compatibility = connector.compatibility = connector.compatibility ?? []
    this.draggable = connector.draggable = connector.draggable ?? true
    this.size = connector.size = connector.size ?? 0.1
    this.shape = connector.shape = connector.shape ?? ''
    this.color = connector.color = connector.color ?? 'black'
    this.label = connector.label = connector.label??''
    this.labelsize = connector.labelsize = connector.labelsize ?? 0.1
    this.labelcolor = connector.labelcolor = connector.labelcolor ?? 'black'

    this.state = connector.state = connector.state ?? 'default'
    if (connector.data) this.userData = connector.data
    this.error = connector.error
    this.documentation = connector.documentation

    this.geometry = this.createGeometry(0.1)

    this.material = diagram.getMaterial('geometry', 'connector', this.color );

  }

  createGeometry(size: number): BufferGeometry {
    return new CircleGeometry(size)
  }

  updateVisuals() {
  }
}
