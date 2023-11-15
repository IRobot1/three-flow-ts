import { FlowEdgeData, FlowLayout, FlowNodeData } from "./model";

export class NoOpLayout implements FlowLayout {

  removeEdge(from: string, to: string): any {
    return undefined
  }
  setEdge(v: string, w: string, edge: FlowEdgeData): any {
    return undefined
  }
  removeNode(name: string): any {
    return undefined
  }
  setNode(name: string, node: FlowNodeData): any {
    return undefined
  }
  nodes(): string[] {
    return []
  }
  edges(): FlowEdgeData[] {
    return []
  }
  node(name: string): any {
    return undefined
  }

  layout(options: any, filter?: ((nodeId: string) => boolean) | undefined): boolean {
    return false;
  }
}
