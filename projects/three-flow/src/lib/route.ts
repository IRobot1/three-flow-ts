import { AbstractNode } from "./abstract-model";
import { FlowGraph } from "./graph";
import { FlowNode } from "./node";

export class FlowRoute extends FlowNode {
  constructor(graph: FlowGraph, node: AbstractNode) {
    super(graph, node);

    //@ts-ignore
    this.type = 'flowroute'
  }
}
