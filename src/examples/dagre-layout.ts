import { GraphLabel, graphlib, layout } from "@dagrejs/dagre";
import { FlowEdgeParameters, FlowLayout, FlowNodeParameters, LayoutResult } from "three-flow";

export class DagreLayout implements FlowLayout {
  private graph = new graphlib.Graph()

  removeEdge(edge: FlowEdgeParameters, from: string, to: string): any {
    return this.graph.removeEdge(from, to)
  }
  setEdge(from: string, to: string, edge: FlowEdgeParameters): any {
    return this.graph.setEdge(from, to, edge)
  }
  removeNode(name: string): any {
    return this.graph.removeNode(name)
  }
  setNode(name: string, node: FlowNodeParameters): unknown {
    return this.graph.setNode(name, node)
  }
  layout(label: GraphLabel, filter?: ((nodeId: string) => boolean) | undefined): LayoutResult {
    if (!label.rankdir) label.rankdir = 'LR'
    if (!label.nodesep) label.nodesep = 0.1
    if (!label.edgesep) label.edgesep = 1
    if (!label.ranksep) label.ranksep = 4

    this.graph.setGraph(label);

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
      result.edges.push({ id: data.name!, points: filtered.points })
    })

    return result;
  }

}
