import { Object3D, Vector3 } from "three";
import { FlowNode } from "./node";
import { InteractiveEventType } from "./interactive";

export class DragNode {
  public enabled = true

  private dragging = false

  constructor(node: FlowNode) {

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
        node.position.copy(e.position.sub(offset))
        node.moveConnector()
      }
    });
  }

}
