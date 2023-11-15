import { FlowConnectorParameters } from "./model";
import { BufferGeometry, CircleGeometry, Mesh } from "three";
import { FlowDiagram } from "./diagram";

export class FlowConnector extends Mesh {
  connectortype: string;
  color = 'black'

  isFlow = true
  constructor(private diagram: FlowDiagram, public connector: FlowConnectorParameters) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'

    this.name = connector.text = connector.text ? connector.text : diagram.nodeCount.toString()
    this.connectortype = connector.connectortype = connector.connectortype ? connector.connectortype : 'input'

    if (connector.userData) this.userData = connector.userData

    this.geometry = this.createGeometry(0.1)

    this.material = diagram.getMaterial('geometry', 'connector', this.color);

  }

  createGeometry(size: number): BufferGeometry {
    return new CircleGeometry(size)
  }

  updateVisuals() {
  }
}
