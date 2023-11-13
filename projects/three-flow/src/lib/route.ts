import { BufferGeometry, CircleGeometry } from "three";
import { AbstractRoute } from "./abstract-model";
import { FlowGraph } from "./graph";
import { FlowNode } from "./node";

export class FlowRoute extends FlowNode {
  radius: number;

  constructor(graph: FlowGraph, private route: AbstractRoute) {
    route.type = 'route'
    route.resizable = route.scaleable = false // don't allow
    route.radius = route.radius ?? 0.1
    route.height = route.width = route.radius

    super(graph, route);

    this.radius = route.radius!
  }

  override createGeometry(): BufferGeometry {
    return new CircleGeometry(this.radius)
  }
}
