import { GraphLabel, graphlib, layout } from "@dagrejs/dagre";
import { FlowEdgeParameters, FlowLayout, FlowNodeParameters, LayoutResult } from "three-flow";

const options = { compound:true }

export class DagreLayout implements FlowLayout {

  private graph = new graphlib.Graph(options)

  dispose() {
    this.graph = new graphlib.Graph(options)
  }
  removeEdge(edge: FlowEdgeParameters, from: string, to: string): any {
    return this.graph.removeEdge(from, to)
  }
  setEdge(from: string, to: string, edge: FlowEdgeParameters): any {
    //console.log(`g.setEdge('${from}', '${to}', ${JSON.stringify(edge)});`)
    return this.graph.setEdge(from, to, edge)
  }
  removeNode(name: string): any {
    return this.graph.removeNode(name)
  }
  setNode(name: string, node: FlowNodeParameters): unknown {
    //console.log(`g.setNode('${name}', ${JSON.stringify(node)});`)
    return this.graph.setNode(name, node)
  }
  setParent(parent: string, id: string): any {
    //console.log(`g.setParent('${id}', '${parent}');`)
    return this.graph.setParent(id, parent)
  }

  layout(label: GraphLabel, filter?: ((nodeId: string) => boolean) | undefined): LayoutResult {
    if (!label.rankdir) label.rankdir = 'LR'
    if (!label.nodesep) label.nodesep = 0.1
    if (!label.edgesep) label.edgesep = 1
    if (!label.ranksep) label.ranksep = 4
    
    this.graph.setGraph(label);
    
    let filteredgraph = this.graph
    if (filter) filteredgraph = this.graph.filterNodes(filter)

    filteredgraph.edges().forEach(edge => {
      const v = filteredgraph.node(edge.v) as FlowNodeParameters
      const w = filteredgraph.node(edge.w) as FlowNodeParameters
      if (v['issubgraph'] || w['issubgraph'])
      filteredgraph.removeEdge(edge.v, edge.w)
    })
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
      result.nodes.push({ id: name, x: filtered.x, y: filtered.y, width:filtered.width, height:filtered.height })
    })

    filteredgraph.edges().forEach(name => {
      const data = this.graph.edge(name.v, name.w) as FlowEdgeParameters
      const filtered = filteredgraph.edge(name)
      result.edges.push({ id: data.name!, points: filtered.points })
    })

    return result;
  }

}
