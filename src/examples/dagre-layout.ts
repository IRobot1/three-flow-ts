import { GraphLabel, graphlib, layout } from "@dagrejs/dagre";
import { Vector2 } from "three";
import { FlowEdgeParameters, FlowLayout, FlowNodeParameters, LayoutResult } from "three-flow";

export class DagreLayout implements FlowLayout {

  dispose() { }

  layout(nodes: Array<FlowNodeParameters>, edges: Array<FlowEdgeParameters>, label: GraphLabel, filter?: ((nodeId: string) => boolean) | undefined): LayoutResult {
    if (!label.rankdir) label.rankdir = 'LR'
    if (!label.nodesep) label.nodesep = 0.1
    if (!label.edgesep) label.edgesep = 1
    if (!label.ranksep) label.ranksep = 4

    const graph = new graphlib.Graph()

    graph.setGraph(label);

    nodes.forEach(node => graph.setNode(node.id!, node as any))
    edges.forEach(edge => graph.setEdge(edge.from, edge.to, edge as any))

    let filteredgraph = graph
    if (filter) filteredgraph = graph.filterNodes(filter)

    layout(filteredgraph)

    const result = <LayoutResult>{
      width: label.width,
      height: label.height,
      nodes: [], edges: []
    }
    // reposition the nodes
    filteredgraph.nodes().forEach(name => {
      const data = graph.node(name)
      const filtered = filteredgraph.node(name)
      result.nodes.push({ id: name, x: filtered.x, y: filtered.y })
    })

    filteredgraph.edges().forEach(name => {
      const data = graph.edge(name.v, name.w) as FlowEdgeParameters
      const filtered = filteredgraph.edge(name)
      result.edges.push({ id: data.id!, points: filtered.points.map(p => new Vector2(p.x, p.y)) })
    })

    return result;
  }

}
