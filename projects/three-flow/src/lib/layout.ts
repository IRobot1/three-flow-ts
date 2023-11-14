import { Graph } from "@dagrejs/graphlib";
import { FlowEdgeData, FlowLayout, FlowNodeData } from "./model";

export class NoLayout implements FlowLayout {
  private graph = new Graph()

  removeEdge(from: string, to: string): any {
    return this.graph.removeEdge(from, to)
  }
  setEdge(v: string, w: string, edge: FlowEdgeData): any {
    return this.graph.setEdge(v, w, edge)
  }
  removeNode(name: string): any {
    return this.graph.removeNode(name)
  }
  setNode(name: string, node: FlowNodeData): unknown {
    return this.graph.setNode(name, node)
  }
  filterNodes(callback: (nodeId: string) => boolean) {
    return this.graph.filterNodes(callback)
  }
  nodes(): string[] {
    return this.graph.nodes()
  }
  edges(): FlowEdgeData[] {
    return this.graph.edges();
  }
  node(name: string) {
    return this.graph.node(name)
  }
  layout(options: any, filter?: ((nodeId: string) => boolean) | undefined): boolean {
    return false;
  }

}
