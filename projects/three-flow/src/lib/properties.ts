import { Mesh, Vector3 } from 'three';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import GUI from "three/examples/jsm/libs/lil-gui.module.min"
import { FlowNode } from './node';
import { ConnectorMesh } from './connector';
import { FlowDiagram } from './diagram';
import { FlowInteraction } from './interactive';
import { FlowEventType } from './model';

export class FlowProperties {
  private gui?: GUI
  private selected: Mesh | undefined

  public selectedNode: FlowNode | undefined
  public selectedConnector: ConnectorMesh | undefined

  constructor(public diagram: FlowDiagram, interaction?: FlowInteraction, guioptions?: any) {

    // only show one GUI at a time
    const htmlmethod = (mesh: Mesh, type: string) => {
      // GUI has no way to remove controllers, so destroy and create is the only way to replace
      if (this.selected && mesh != this.selected) {
        if (this.gui) this.gui.destroy()
      }

      if (mesh != this.selected) {
        this.gui = new GUI(guioptions)
        const params = { close: () => { if (this.gui) this.gui.hide() } }
        this.gui.add<any, any>(params, 'close').name('Close')

        mesh.dispatchEvent<any>({ type, gui: this.gui })
      }

      // update title and show in case it was just hidden
      if (this.gui) {
        this.gui.show()
      }
    }

    // each node can show its own HTML mesh added to the node and removed from the node and destroyed when closed
    const vrmethod = (mesh: Mesh, type: string) => {
      const postfix = '-vr'
      // skip if already added to diagram.  HTML mesh as node.name+'-vr'
      if (diagram.children.find(child => child.name == mesh.name + postfix)) return

      const params = {
        close: () => {
          gui.destroy()
          diagram.remove(htmlMesh)
          if (interaction) interaction.interactive.selectable.add(htmlMesh)
        }
      }

      // create and make sure not visible in HTML
      const gui = new GUI(guioptions)
      gui.domElement.style.visibility = 'hidden';

      gui.add<any, any>(params, 'close').name('Close')

      mesh.dispatchEvent<any>({ type, gui })

      const htmlMesh = new HTMLMesh(gui.domElement);
      htmlMesh.material.depthWrite = false
      htmlMesh.name = mesh.name + postfix
      htmlMesh.scale.setScalar(4);
      diagram.add(htmlMesh)

      const meshwidth = 1.2
      const updatePosition = () => {
        const box = htmlMesh.geometry.boundingBox
        if (!box) return
        const size = box.getSize(new Vector3())
        htmlMesh.position.set(mesh.position.x + (size.x + meshwidth) / 2, mesh.position.y, mesh.position.z + 0.02)
      }
      updatePosition()

      if (interaction) interaction.interactive.selectable.add(htmlMesh)

      // if the node is removed, make sure GUI and HTML mesh is cleaned up
      mesh.addEventListener(FlowEventType.DISPOSE, () => { params.close() })

      // move the properties if node's width changes
      mesh.addEventListener(FlowEventType.WIDTH_CHANGED, updatePosition)
      mesh.addEventListener(FlowEventType.DRAGGED, updatePosition)
    }

    diagram.addEventListener(FlowEventType.NODE_SELECTED, (e: any) => {
      const node = e.node as FlowNode
      this.selectedNode = node
      if (!node) return

      if (interaction && interaction.interactive.renderer.xr.isPresenting) {
        vrmethod(node, FlowEventType.NODE_PROPERTIES)
      }
      else {
        htmlmethod(node, FlowEventType.NODE_PROPERTIES)
      }

      this.selected = node
    })

    diagram.addEventListener(FlowEventType.DISPOSE, () => this.dispose())


    diagram.addEventListener(FlowEventType.CONNECTOR_SELECTED, (e: any) => {
      const connector = e.connector as ConnectorMesh
      this.selectedConnector = connector
      if (!connector) return

      if (interaction && interaction.interactive.renderer.xr.isPresenting) {
        vrmethod(connector, FlowEventType.CONNECTOR_PROPERTIES)
      }
      else {
        htmlmethod(connector, FlowEventType.CONNECTOR_PROPERTIES)
      }

      this.selected = connector
    })

    diagram.addEventListener(FlowEventType.DISPOSE, () => this.dispose())
  }

  dispose() {
    if (this.gui) this.gui.destroy()
  }
}
