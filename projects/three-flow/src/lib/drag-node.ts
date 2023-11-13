import { Object3D, Vector3 } from "three";
import { InteractiveEventType } from "./interactive";
import { FlowNode } from "./node";

export class DragNode {
  public enabled = true

  private dragging = false

  constructor(node: FlowNode, gridSize: number) {
    const snapToGrid = (position: THREE.Vector3): THREE.Vector3 => {
      const gridSize = node.graph.gridsize
      if (gridSize > 0) {
        // Assuming position is the position of the object being dragged
        position.x = Math.round(position.x / gridSize) * gridSize;
        position.y = Math.round(position.y / gridSize) * gridSize;
        position.z = Math.round(position.z / gridSize) * gridSize;
      }
      return position;
    }

    let offset: Vector3
    node.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      this.dragging = true
    });
    node.addEventListener(InteractiveEventType.DRAGEND, () => { this.dragging = false });

    node.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      let position = e.position.clone() as Vector3
      if (this.dragging) {
        node.position.copy(snapToGrid(position))
        node.dispatchEvent<any>({ type: 'dragged'})
      }
    });
  }

}
