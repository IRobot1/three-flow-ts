import GUI from "three/examples/jsm/libs/lil-gui.module.min"
import { FlowDiagram, FlowEventType, FlowInteraction, FlowNode } from "three-flow"

export class FlowProperties {
  private gui?: GUI
  constructor(public diagram: FlowDiagram, interaction?: FlowInteraction, guioptions?: any) {
    let selected: FlowNode | undefined
    diagram.addEventListener(FlowEventType.NODE_SELECTED, (e: any) => {
      const node = e.node as FlowNode
      if (!node) return

      // GUI has no way to remove controllers, so destroy and create is the only way to replace
      if (selected && node != selected) {
        if (this.gui) this.gui.destroy()
      }

      if (node != selected) {
        this.gui = new GUI(guioptions)
        const params = { close: () => { if (this.gui) this.gui.hide() } }
        this.gui.add<any, any>(params, 'close').name('Close')

        node.dispatchEvent<any>({ type: FlowEventType.NODE_PROPERTIES, gui: this.gui })
      }

      // update title and show in case it was just hidden
      if (this.gui) {
        this.gui.title(`${node.label.text} Properties`)
        this.gui.show()
      }

      selected = node
    })

    diagram.addEventListener(FlowEventType.DISPOSE, () => this.dispose())
  }

  dispose() {
    if (this.gui) this.gui.destroy()
  }
}
