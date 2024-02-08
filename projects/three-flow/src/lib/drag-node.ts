import { Vector3 } from "three";
import { FlowPointerEventType } from "./pointer";
import { FlowNode } from "./node";
import { FlowEventType } from "./model";

export class DragNode {

  private dragging = false

  constructor(private node: FlowNode, gridSize: number) {
    const snapToGrid = (position: THREE.Vector3): THREE.Vector3 => {
      const gridSize = node.diagram.gridsize
      if (gridSize > 0) {
        // Assuming position is the position of the object being dragged
        position.x = Math.round(position.x / gridSize) * gridSize;
        position.y = Math.round(position.y / gridSize) * gridSize;
        position.z = Math.round(position.z / gridSize) * gridSize;
      }
      return position;
    }

    node.addEventListener(FlowPointerEventType.POINTERENTER, () => {
      if (!node.draggable || node.hidden) return
      document.body.style.cursor = 'grab'
    })

    node.addEventListener(FlowPointerEventType.POINTERLEAVE, () => {
      if (document.body.style.cursor == 'grab')
        document.body.style.cursor = 'default'
    })

    let offset: Vector3
    node.addEventListener(FlowPointerEventType.DRAGSTART, (e: any) => {
      if (!node.draggable || node.hidden) return

      // remember where in the mesh the mouse was clicked to avoid jump on first drag
      offset = e.position.sub(node.position).clone()
      document.body.style.cursor = 'grabbing'

      this.dragging = true
    });
    node.addEventListener(FlowPointerEventType.DRAGEND, () => { this.dragging = false });

    node.addEventListener(FlowPointerEventType.DRAG, (e: any) => {
      if (!this.dragging || !node.draggable || node.hidden) return

      let position = e.position.clone() as Vector3

      node.position.copy(snapToGrid(e.position.sub(offset)))
      node.dispatchEvent<any>({ type: FlowEventType.DRAGGED })

    });
  }

  stopDragging() {
    this.node.dispatchEvent<any>({ type: FlowPointerEventType.DRAGEND })
  }
}
