import { InteractiveEventType, ThreeInteractive } from "three-flow";
import { UIPanel } from "./panel";
import { Vector3 } from "three";
import { GUIEventType } from "./model";

export class PanelInteraction {

  private dragging = false

  constructor(public panel: UIPanel, private interactive: ThreeInteractive, gridsize = 0) {

    const selectableChanged = () => {
      if (panel.selectable)
        this.interactive.selectable.add(panel)
      else
        this.interactive.selectable.remove(panel)
    }
    panel.addEventListener(GUIEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
    selectableChanged()


    const snapToGrid = (position: THREE.Vector3): THREE.Vector3 => {
      if (gridsize > 0) {
        // Assuming position is the position of the object being dragged
        position.x = Math.round(position.x / gridsize) * gridsize;
        position.y = Math.round(position.y / gridsize) * gridsize;
        position.z = Math.round(position.z / gridsize) * gridsize;
      }
      return position;
    }


    panel.addEventListener(InteractiveEventType.POINTERENTER, () => {
      if (!panel.draggable || !panel.visible) return
      document.body.style.cursor = 'grab'
    })

    panel.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      if (document.body.style.cursor == 'grab')
        document.body.style.cursor = 'default'
    })

    let offset: Vector3
    panel.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      if (!panel.draggable || !panel.visible) return

      // remember where in the mesh the mouse was clicked to avoid jump on first drag
      offset = e.position.sub(panel.position).clone()
      document.body.style.cursor = 'grabbing'

      this.dragging = true
    });
    panel.addEventListener(InteractiveEventType.DRAGEND, () => { this.dragging = false });

    panel.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      if (!this.dragging || !panel.draggable || !panel.visible) return

      let position = e.position.clone() as Vector3

      panel.position.copy(snapToGrid(e.position.sub(offset)))
      panel.dispatchEvent<any>({ type: GUIEventType.DRAGGED })

    });
  }

  stopDragging() {
    this.panel.dispatchEvent<any>({ type: InteractiveEventType.DRAGEND })
  }
}
