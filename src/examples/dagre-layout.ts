import { GraphLabel, graphlib, layout } from "@dagrejs/dagre";
import { FlowEdgeData, FlowLayout, FlowNodeData } from "three-flow";

export class DagreLayout implements FlowLayout {
  private graph = new graphlib.Graph()

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
  layout(label: GraphLabel, filter?: ((nodeId: string) => boolean) | undefined): boolean {
    if (!label.rankdir) label.rankdir = 'LR'
    if (!label.nodesep) label.nodesep = 0.1
    if (!label.edgesep) label.edgesep = 1
    if (!label.ranksep) label.ranksep = 4

    this.graph.setGraph(label);

    let filteredgraph = this.graph
    if (filter) filteredgraph = this.graph.filterNodes(filter)

    layout(filteredgraph)

    // reposition the nodes
    filteredgraph.nodes().forEach(name => {
      const data = this.graph.node(name)
      const filtered = filteredgraph.node(name)
      data.x = filtered.x
      data.y = filtered.y
    })

    // only need to copy if filtered graph is different
    if (filteredgraph != this.graph) {
      filteredgraph.edges().forEach(name => {
        const data = this.graph.edge(name.v, name.w)
        const filtered = filteredgraph.edge(name)
        data.points = filtered.points
      })
    }
    return true;
  }

}
