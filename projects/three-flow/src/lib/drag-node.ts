import { Object3D, Vector3 } from "three";
import { InteractiveEventType } from "./interactive";

export class DragNode {
  public enabled = true

  private dragging = false

  constructor(node: Object3D, gridSize: number) {
    const snapToGrid = (position: THREE.Vector3): THREE.Vector3 => {
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

      // so we can click anywhere in the title, remember offset within title where we started dragging
      offset = e.position.sub(node.position).clone()
      this.dragging = true
    });
    node.addEventListener(InteractiveEventType.DRAGEND, () => { this.dragging = false });

    node.addEventListener(InteractiveEventType.DRAG, (e: any) => {

      // adjust the current position by offset within title
      if (this.dragging) {
        node.position.copy(snapToGrid(e.position.sub(offset)))
        node.dispatchEvent<any>({ type: 'dragged'})
      }
    });
  }

}
