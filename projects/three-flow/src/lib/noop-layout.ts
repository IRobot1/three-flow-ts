import { FlowEdgeParameters, FlowLayout, FlowNodeParameters } from "./model";

export class NoOpLayout implements FlowLayout {

  removeEdge(from: string, to: string): any {
    return undefined
  }
  setEdge(v: string, w: string, edge: FlowEdgeParameters): any {
    return undefined
  }
  removeNode(name: string): any {
    return undefined
  }
  setNode(name: string, node: FlowNodeParameters): any {
    return undefined
  }
  nodes(): string[] {
    return []
  }
  edges(): FlowEdgeParameters[] {
    return []
  }
  node(name: string): any {
    return undefined
  }

  layout(options: any, filter?: ((nodeId: string) => boolean) | undefined): boolean {
    return false;
  }
}
