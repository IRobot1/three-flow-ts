import { Object3D } from "three";
import { AbstractConnector, AbstractDiagram, AbstractEdge, AbstractNode } from "./abstract-model";

export class FlowDiagram extends Object3D {
  constructor(private diagram: AbstractDiagram) {
    super()
    if (!this.diagram.version) this.diagram.version = 1
  }
  get nodes(): AbstractNode[] { return this.diagram.nodes }
  get connectors(): AbstractConnector[] { return this.diagram.connectors }
  get edges(): AbstractEdge[] { return this.diagram.edges }
  get version() { return this.diagram.version }
}
