import { FlowEdgeParameters, FlowLayout, FlowNodeParameters, LayoutResult } from "./model";

export class NoOpLayout implements FlowLayout {

  dispose() { }

  layout(nodes: Array<FlowNodeParameters>, edges: Array<FlowEdgeParameters>, options: any, filter?: ((nodeId: string) => boolean) | undefined): LayoutResult {
    return <LayoutResult>{ width: 0, height: 0, nodes, edges }
  }
}
