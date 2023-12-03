import GUI from "three/examples/jsm/libs/lil-gui.module.min"
import { FlowDiagram, FlowEventType, FlowNode } from "three-flow"

export class FlowProperties {
  private gui: GUI
  constructor(public diagram: FlowDiagram, guioptions?: any) {
    // create emtpy GUI and hide it until a node is selected
    let gui = new GUI(guioptions)
    gui.hide()
    this.gui = gui

    let selected: FlowNode | undefined
    diagram.addEventListener(FlowEventType.NODE_SELECTED, (e: any) => {
      const node = e.node as FlowNode
      if (!node) return
      console.warn('selected', node.name)

      // GUI has no way to remove controllers, so destroy and create is the only way to replace
      if (selected && node != selected) {
        gui.destroy()
        console.warn('destory',gui)
        gui = new GUI(guioptions)
        this.gui = gui
      }

      if (node != selected) {
        const params = { close : () => { gui.hide() } }
        gui.add<any, any>(params, 'close').name('Close')

        node.dispatchEvent<any>({ type: FlowEventType.NODE_PROPERTIES, gui })
      }

      // update title and show in case it was just hidden
      gui.title(`${node.label.text} Properties`)
      gui.show()

      selected = node
    })

    diagram.addEventListener(FlowEventType.DISPOSE, () => this.dispose())
  }

  dispose() {
    console.warn('disposed', this.gui)
    this.gui.destroy()
    this.gui.hide()
  }
}


