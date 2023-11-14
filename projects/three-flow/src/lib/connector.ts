import { FlowConnectorData, FlowEdgeData, FlowNodeData } from "./model";
import { BufferGeometry, CircleGeometry, Mesh } from "three";
import { FlowGraph } from "./graph";

export class FlowConnector<TNodeData extends FlowNodeData, TEdgeData extends FlowEdgeData> extends Mesh {
  connectortype: string;
  color = 'black'

  isFlow = true
  constructor(private graph: FlowGraph<TNodeData,TEdgeData>, public connector: FlowConnectorData) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'

    this.name = connector.text = connector.text ?? graph.nodes.length.toString()
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
