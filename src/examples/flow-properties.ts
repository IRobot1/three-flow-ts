import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import GUI from "three/examples/jsm/libs/lil-gui.module.min"
import { FlowDiagram, FlowEventType, FlowInteraction, FlowNode } from "three-flow"

export class FlowProperties {
  private gui?: GUI
  constructor(public diagram: FlowDiagram, interaction?: FlowInteraction, guioptions?: any) {
    let selected: FlowNode | undefined

    // only show one GUI at a time
    const htmlmethod = (node: FlowNode) => {
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
    }

    // each node can show its own HTML mesh added to the node and removed from the node and destroyed when closed
    const vrmethod = (node: FlowNode) => {
      const postfix = '-vr'
      // skip if already added to diagram.  HTML mesh as node.name+'-vr'
      if (diagram.children.find(child => child.name == node.name + postfix)) return

      const params = {
        close: () => {
          gui.destroy()
          diagram.remove(mesh)
          interaction!.interactive.selectable.add(mesh)
        }
      }

      // create and make sure not visible in HTML
      const gui = new GUI(guioptions)
      gui.title(`${node.label.text} Properties`)
      gui.domElement.style.visibility = 'hidden';

      gui.add<any, any>(params, 'close').name('Close')

      node.dispatchEvent<any>({ type: FlowEventType.NODE_PROPERTIES, gui })

      const mesh = new HTMLMesh(gui.domElement);
      mesh.material.depthWrite = false
      mesh.name = node.name + postfix
      mesh.scale.setScalar(4);
      diagram.add(mesh)

      const meshwidth = 1.2
      const updatePosition = () => {
        mesh.position.set(node.position.x + (node.width + meshwidth) / 2 , node.position.y, node.position.z + 0.02)
      }
      updatePosition()

      interaction!.interactive.selectable.add(mesh)

      // if the node is removed, make sure GUI and HTML mesh is cleaned up
      node.addEventListener(FlowEventType.DISPOSE, () => { params.close() })

      // move the properties if node's width changes
      node.addEventListener(FlowEventType.WIDTH_CHANGED, updatePosition)
      node.addEventListener(FlowEventType.DRAGGED, updatePosition)
    }

    diagram.addEventListener(FlowEventType.NODE_SELECTED, (e: any) => {
      const node = e.node as FlowNode
      if (!node) return

      if (interaction && interaction.interactive.renderer.xr.isPresenting) {
        vrmethod(node)
      }
      else {
        htmlmethod(node)
      }

      selected = node
    })

    diagram.addEventListener(FlowEventType.DISPOSE, () => this.dispose())
  }

  dispose() {
    if (this.gui) this.gui.destroy()
  }
}
