import { BufferGeometry, CircleGeometry } from "three";
import { FlowRouteParameters } from "./model";
import { FlowGraph } from "./graph";
import { FlowNode } from "./node";

export class FlowRoute extends FlowNode {
  radius: number;

  constructor(graph: FlowGraph, private route: FlowRouteParameters) {
    route.type = 'route'
    route.radius = route.radius ? route.radius : 0.1
    route.height = route.width = route.radius

    super(graph, route);

    this.radius = route.radius!
    this.resizable = this.scalable = false // don't allow
  }

  override createGeometry(): BufferGeometry {
    return new CircleGeometry(this.radius)
  }
}
