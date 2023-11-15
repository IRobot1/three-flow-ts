import * as cytoscape from 'cytoscape';
import { FlowEdgeParameters, FlowLayout, FlowNodeParameters, LayoutResult } from "three-flow";

export class CytoscapeLayout implements FlowLayout {
  private graph = cytoscape({ headless: true });

  removeEdge(edge: FlowEdgeParameters, from: string, to: string): any {
    return this.graph.remove(edge.name!)
  }

  setEdge(from: string, to: string, edge: FlowEdgeParameters): any {
    return this.graph.add({ group: 'edges', data: { id: edge.name, source: edge.v, target: edge.w } })
  }

  removeNode(name: string): any {
    return this.graph.remove(name)
  }
  setNode(name: string, node: FlowNodeParameters): any {
    node.x = 0
    node.y = 0
    return this.graph.add({ group: 'nodes', data: { id: node.text, ...node } })
  }
  layout(options: any, filter?: (nodeId: string) => boolean): LayoutResult {
    const layout = this.graph.layout({ name: 'breadthfirst' });
    layout.run();

    const result = <LayoutResult>{ width: 0, height: 0, nodes: [], edges: [] }

    // Calculate the bounding box of the layout
    var min_x = Infinity, max_x = -Infinity, min_y = Infinity, max_y = -Infinity;

    // After running the layout, you can access the calculated positions
    this.graph.nodes().forEach(node => {
      const data = node.data() as FlowNodeParameters
      const pos = node.position()
      result.nodes.push({ id: node.id(), x: pos.x, y: pos.y })

      min_x = Math.min(min_x, pos.x);
      max_x = Math.max(max_x, pos.x);
      min_y = Math.min(min_y, pos.y);
      max_y = Math.max(max_y, pos.y);
    });

    result.width = max_x - min_x;
    result.height = max_y - min_y;

    this.graph.edges().forEach(edge => {
      result.edges.push({ id: edge.id(), points: [edge.source().position(), edge.target().position()] })
    })

    //console.warn(result)
    return result;
  }

}
