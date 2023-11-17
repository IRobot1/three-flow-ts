import { FlowEdgeParameters, FlowLayout, FlowNodeParameters, LayoutResult } from "./model";

export class NoOpLayout implements FlowLayout {

  dispose() { }

  removeEdge(edge: FlowEdgeParameters, from: string, to: string): any {
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
  layout(options: any, filter?: ((nodeId: string) => boolean) | undefined): LayoutResult {
    return <LayoutResult>{ width: 0, height: 0, nodes: [], edges: [] }
  }
}
