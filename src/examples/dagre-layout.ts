import { GraphLabel, graphlib, layout } from "@dagrejs/dagre";
import { Vector2 } from "three";
import { FlowEdgeParameters, FlowLayout, FlowNodeParameters, LayoutResult } from "three-flow";

export class DagreLayout implements FlowLayout {
  private graph = new graphlib.Graph()

  dispose() {  }

  layout(nodes: Array<FlowNodeParameters>, edges: Array<FlowEdgeParameters>, label: GraphLabel, filter?: ((nodeId: string) => boolean) | undefined): LayoutResult {
    if (!label.rankdir) label.rankdir = 'LR'
    if (!label.nodesep) label.nodesep = 0.1
    if (!label.edgesep) label.edgesep = 1
    if (!label.ranksep) label.ranksep = 4

    this.graph.setGraph(label);

    nodes.forEach(node => this.graph.setNode(node.id!, node as any))
    edges.forEach(edge=> this.graph.setEdge(edge.from, edge.to, edge as any))

    let filteredgraph = this.graph
    if (filter) filteredgraph = this.graph.filterNodes(filter)

    layout(filteredgraph)

    const result = <LayoutResult>{
      width: label.width,
      height: label.height,
      nodes: [], edges: []
    }
    // reposition the nodes
    filteredgraph.nodes().forEach(name => {
      const data = this.graph.node(name)
      const filtered = filteredgraph.node(name)
      result.nodes.push({ id: name, x: filtered.x, y: filtered.y })
    })

    filteredgraph.edges().forEach(name => {
      const data = this.graph.edge(name.v, name.w) as FlowEdgeParameters
      const filtered = filteredgraph.edge(name)
      result.edges.push({ id: data.id!, points: filtered.points.map(p => new Vector2(p.x, p.y)) })
    })

    return result;
  }

}
