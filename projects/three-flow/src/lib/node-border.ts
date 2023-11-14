import { BufferGeometry, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { FlowNode } from "./node";
import { FlowGraph } from "./graph";
import { InteractiveEventType } from "./interactive";


export class NodeBorder extends Mesh {

  constructor(public node: FlowNode, graph: FlowGraph) {
    super()

    this.material = new MeshBasicMaterial({ color: 'black' })
    this.geometry = this.createGeometry(node.width + 0.08, node.height + 0.08)
    this.position.z -= 0.001

    let active = false
    this.activeChanged(active)

    graph.addEventListener('active_change', () => {
      if (!node.selectable) return
      if (graph.active != node) {
        active = false
      }
      this.activeChanged(active)
    })

    node.addEventListener(InteractiveEventType.DRAGSTART, () => {
      if (!node.selectable) return
      graph.active = node
      active = true
      this.activeChanged(active)
    })
    node.addEventListener('click', () => {
      if (!node.selectable || node.draggable) return
      graph.active = node
      active = !active
      this.activeChanged(active)
    })

    node.addEventListener(InteractiveEventType.POINTERENTER, () => {
      this.hoverChanged(active, true)

    })
    node.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      this.hoverChanged(active, false)
    })
    node.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      graph.active = undefined
    })


    node.addEventListener('width_change', () => {
      this.geometry = this.createGeometry(node.width + 0.08, node.height + 0.08)
    })
    node.addEventListener('height_change', () => {
      this.geometry = this.createGeometry(node.width + 0.08, node.height + 0.08)
    })

  }

  protected setColor(color: number | string) {
    (this.material as MeshBasicMaterial).color.set(color)
  }

  // overridables
  createGeometry(width: number, height: number): BufferGeometry {
    return new PlaneGeometry(width, height)
  }

  activeChanged(active: boolean) {
    //this.visible = active
    this.setColor(active ? 'white' : 'black')
  }

  hoverChanged(active: boolean, over: boolean) {
    //if (!active) this.visible = over
    this.setColor(over ? 'blue' : (active ? 'white' : 'black'))
  }

}
