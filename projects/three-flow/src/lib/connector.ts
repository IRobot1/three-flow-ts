import { AbstractConnector } from "./abstract-model";
import { BufferGeometry, CircleGeometry, Mesh } from "three";
import { FlowGraph } from "./graph";

export class FlowConnector extends Mesh {
  connectortype: string;
  color = 'black'

  isFlow = true
  constructor(private graph: FlowGraph, public connector: AbstractConnector) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'

    this.name = connector.text = connector.text ?? graph.connectors.length.toString()
    this.connectortype = connector.connectortype = connector.connectortype ?? 'input'

    if (connector.userData) this.userData = connector.userData

    this.geometry = this.createGeometry(0.1)

    this.material = graph.getMaterial('geometry', 'connector', this.color);

  }

  createGeometry(size: number): BufferGeometry {
    return new CircleGeometry(size)
  }

  updateVisuals() {
  }
}
