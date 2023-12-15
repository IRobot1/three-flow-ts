import { BufferGeometry, CircleGeometry } from "three";
import { FlowRouteParameters } from "./model";
import { FlowDiagram } from "./diagram";
import { FlowNode } from "./node";

export class FlowRoute extends FlowNode {
  radius: number;

  constructor(diagram: FlowDiagram, parameters: FlowRouteParameters) {
    parameters.type = 'route'
    parameters.radius = parameters.radius ? parameters.radius : 0.1
    parameters.height = parameters.width = parameters.radius

    super(diagram, parameters);

    this.radius = parameters.radius!
    this.resizable = this.scalable = false // don't allow
  }

  override createGeometry(): BufferGeometry {
    return new CircleGeometry(this.radius)
  }
}
