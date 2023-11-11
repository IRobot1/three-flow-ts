import { Material } from "three";
import { DragNode } from "./drag-node";
import { FlowGraph } from "./graph";
import { FlowInteractive } from "./interactive";
import { FlowNode } from "./node";
import { ResizeNode } from "./resize-node";
import { ScaleNode } from "./scale-node";

export class GraphInteraction {
  private nodes: Array<NodeInteractive> = []
  constructor(public flow: FlowGraph, public interactive: FlowInteractive) {

    flow.addEventListener('node-removed', (e: any) => {
      const node = e.node as FlowNode
      const index = this.nodes.findIndex(x => x.node == node)
      if (index != -1) {
        this.nodes[index].dispose()
        this.nodes.splice(index, 1)
      }
    })


    flow.addEventListener('node-added', (e: any) => {
      const node = e.node as FlowNode
      this.nodes.push(new NodeInteractive(node, this))

    })

    flow.addEventListener('dispose', () => this.dispose())
  }

  dispose() {
    this.nodes.forEach(node => node.dispose())
  }
}

class NodeInteractive {
  private nodeResizer: ResizeNode
  private nodeDragger: DragNode
  private nodeScaler: ScaleNode

  dispose = () => { }

  constructor(public node: FlowNode, graph: GraphInteraction) {

    this.nodeResizer = this.createResizer(node, graph.flow.getMaterial('geometry', 'resizing', node.resizecolor))
    const resizableChanged = () => {
      if (node.resizable) {
        graph.interactive.selectable.add(...this.nodeResizer.selectable)
        graph.interactive.draggable.add(...this.nodeResizer.selectable)
      }
      else {
        graph.interactive.selectable.remove(...this.nodeResizer.selectable)
        graph.interactive.draggable.remove(...this.nodeResizer.selectable)
      }
      this.nodeResizer.enabled = node.resizable
    }
    node.addEventListener('resizable_change', () => { resizableChanged() })
    resizableChanged()

    this.nodeScaler = this.createScaler(node, graph.flow.getMaterial('geometry', 'scaling', node.scalecolor))
    const scalebleChanged = () => {
      if (node.scalable) {
        graph.interactive.selectable.add(...this.nodeScaler.selectable)
        graph.interactive.draggable.add(...this.nodeScaler.selectable)
      }
      else {
        graph.interactive.selectable.remove(...this.nodeScaler.selectable)
        graph.interactive.draggable.remove(...this.nodeScaler.selectable)
      }
      this.nodeScaler.enabled = node.scalable
    }
    node.addEventListener('scalable_change', () => { scalebleChanged() })
    scalebleChanged()

    this.nodeDragger = this.createDragger(node, graph.flow.gridsize)
    const drag = () => {
      if (node.draggable)
        graph.interactive.draggable.add(node)
      else
        graph.interactive.draggable.remove(node)
      this.nodeDragger.enabled = node.draggable
    }
    node.addEventListener('draggable_change', () => { drag() })
    drag()

    //
    // To intercept dragged event in derived class, add the following
    //
    // node.addEventListener('dragged', () => { })
    //

    this.dispose = () => {
      if (this.nodeResizer) {
        graph.interactive.selectable.remove(...this.nodeResizer.selectable)
        graph.interactive.draggable.remove(...this.nodeResizer.selectable)
      }
      if (this.nodeDragger) {
        graph.interactive.selectable.remove(node)
        graph.interactive.draggable.remove(node)
      }
      if (this.nodeScaler) {
        graph.interactive.selectable.remove(...this.nodeScaler.selectable)
        graph.interactive.draggable.remove(...this.nodeScaler.selectable)
      }

    }
  }

  createResizer(node: FlowNode, material: Material): ResizeNode {
    return new ResizeNode(node, material)
  }

  createDragger(node: FlowNode, gridSize: number): DragNode {
    return new DragNode(node, gridSize)
  }

  createScaler(node: FlowNode, material: Material): ScaleNode {
    return new ScaleNode(node, material)
  }


}
