import { BufferGeometry, CircleGeometry } from "three";
import { FlowEdgeData, FlowNodeData, FlowRouteData } from "./model";
import { FlowGraph } from "./graph";
import { FlowNode } from "./node";

export class FlowRoute<TNodeData extends FlowNodeData, TEdgeData extends FlowEdgeData> extends FlowNode<TNodeData, TEdgeData> {
  radius: number;

  constructor(graph: FlowGraph<TNodeData, TEdgeData>, private route: FlowRouteData) {
    route.type = 'route'
    route.resizable = route.scalable = false // don't allow
    route.radius = route.radius ?? 0.1
    route.height = route.width = route.radius

    super(graph, <TNodeData>route);

    this.radius = route.radius!
  }

  override createGeometry(): BufferGeometry {
    return new CircleGeometry(this.radius)
  }
}
