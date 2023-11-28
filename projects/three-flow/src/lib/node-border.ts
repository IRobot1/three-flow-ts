import { BufferGeometry, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { FlowNode } from "./node";
import { FlowDiagram } from "./diagram";
import { InteractiveEventType } from "./three-interactive";
import { FlowEventType } from "./model";


export class NodeBorder extends Mesh {

  constructor(public node: FlowNode, diagram: FlowDiagram) {
    super()

    this.material = new MeshBasicMaterial({ color: 'black' })
    this.geometry = this.createGeometry(node.width + 0.08, node.height + 0.08)
    this.position.z -= 0.001

    let active = false
    this.activeChanged(active)

    diagram.addEventListener(FlowEventType.ACTIVE_CHANGED, () => {
      if (!node.selectable) return
      if (diagram.active != node) {
        active = false
      }
      this.activeChanged(active)
    })

    node.addEventListener(InteractiveEventType.DRAGSTART, () => {
      if (!node.selectable) return
      diagram.active = node
      active = true
      this.activeChanged(active)
    })
    node.addEventListener(InteractiveEventType.CLICK, () => {
      if (!node.selectable || node.draggable) return
      diagram.active = node
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
      diagram.active = undefined
    })


    node.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
      this.geometry = this.createGeometry(node.width + 0.08, node.height + 0.08)
    })
    node.addEventListener(FlowEventType.HEIGHT_CHANGED, () => {
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
