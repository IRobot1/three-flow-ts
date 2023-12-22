import { AmbientLight, BufferGeometry, Color, FileLoader, PlaneGeometry, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import {
  ConnectorInteractive,
  ConnectorMesh,
  FlowConnectorParameters,
  FlowConnectors,
  FlowDesignerOptions,
  FlowDiagram,
  FlowDiagramDesigner,
  FlowEdgeParameters,
  FlowEventType,
  FlowLabel,
  FlowLabelParameters,
  FlowNode,
  NodeConnectors,
  ThreeInteractive,
} from "three-flow";
import { ThreeJSApp } from "../app/threejs-app";
import { TroikaFlowLabel } from "./troika-label";
import { Exporter } from "./export";


export class MindmapExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 3

    scene.background = new Color(0x444444)

    const ambient = new AmbientLight()
    ambient.intensity = 1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1, 100)
    light.position.set(-1, 1, 2)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    //scene.add(new AxesHelper(3))

    const options: FlowDesignerOptions = {
      diagram: { gridsize: 0.3 }
    }

    // read-only flow
    const flow = new MindMapDiagram(app.interactive, options)
    scene.add(flow);
    //flow.position.y = 1


    // using connectors between nodes

    //connectors.createConnector = (connectors1: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh => {
    //  const mesh = new ConnectorMesh(connectors1, parameters)

    //  const original = (mesh.material as MeshBasicMaterial).clone()
    //  const white = flow.getMaterial('geometry', 'drag-enter', <MeshBasicMaterialParameters>{ color: 'white' })
    //  mesh.pointerEnter = (): string | undefined => {
    //    mesh.material = white
    //    return undefined
    //  }
    //  mesh.pointerLeave = () => {
    //    mesh.material = original
    //  }
    //  //mesh.dragStarting = (diagram: FlowDiagram, start: Vector3): FlowRoute => {
    //  //  return diagram.addRoute({
    //  //    x: start.x, y: start.y, material: { color: 'blue' }, dragging: true
    //  //  })
    //  //}
    //  mesh.dropCompleted = (diagram: FlowDiagram, start: Vector3): FlowNode | undefined => {
    //    return diagram.addNode({
    //      x: start.x, y: start.y, material: { color: 'blue' },
    //      label: { text: 'New Node', material: { color: 'white' }, },
    //      resizable: false, connectors: [
    //        { id: '', anchor: 'left', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
    //        { id: '', anchor: 'top', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
    //        { id: '', anchor: 'right', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
    //        { id: '', anchor: 'bottom', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
    //      ]
    //    })
    //  }

    //  return mesh
    //}

    flow.addIdea('Main Idea', 0, 0)

    const gui = new GUI();
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '0';
    gui.domElement.style.left = '15px';

    const fileSaver = new Exporter()
    const fileLoader = new FileLoader();

    const params = {
      filename: 'flow-mindmap.json',
      save: () => {
        const text = flow.saveTo()
        fileSaver.saveJSON(text, params.filename)
      },
      load: () => {
        fileLoader.load(`assets/mindmap.json`, (data) => {
          flow.clear()

          const diagram = <Array<MindMapText>>JSON.parse(<string>data)
          console.warn(diagram)
          // optionally, iterate over nodes and edges to override parameters before loading

          flow.loadFrom(diagram)
        });

      }
    }
    gui.add<any, any>(params, 'filename').name('File name')
    gui.add<any, any>(params, 'save').name('Save')
    gui.add<any, any>(params, 'load').name('Load')

    this.dispose = () => {
      flow.dispose()
      gui.destroy()
      orbit.dispose()
    }

  }
}

interface MindMapText {
  text: string
  position: { x: number, y: number }
  children?: Array<MindMapText>
}

class MindMapDiagram extends FlowDiagramDesigner {

  override createFlowConnectors() {
    return new MindMapConnectors(this)
  }

  constructor(interactive: ThreeInteractive, options: FlowDesignerOptions) {
    super(interactive, options)

    const handleDelete = (keyboard: KeyboardEvent, node?: FlowNode) => {
      console.warn(node)
      if (!node) return

      // only handle most simple case
      if (this.allNodes.length > 1) {

        // prevent delete if node has any child nodes
        if (node.children.find(x => x.type == 'flownode')) return

        // since we're nesting them, we're responsible for removing from parent
        if (node.parent) node.parent.remove(node)

        // finally, remove from diagram
        this.removeNode(node)
      }
    }
    const handleTab = (keyboard: KeyboardEvent, node?: FlowNode, connector?: ConnectorMesh) => {
      if (!node || !connector) return
      const position = this.getFlowPosition(node)
      if (keyboard.shiftKey)
        position.x -= 1
      else
        position.x += 1

      // re-use method in connector interaction when dragging
      const interact = this.interaction.getConnectorInteractive(connector)
      if (interact) this.connectIdea(interact, position)
    }

    const handleEnter = (keyboard: KeyboardEvent, node?: FlowNode) => {
      if (!node) return

      const position = this.getFlowPosition(node)
      if (keyboard.shiftKey)
        position.y += 0.3
      else
        position.y -= 0.3

      // get parent of this connector's node
      const parent = node.parent
      if (parent && parent.type == 'flownode') {
        // get its connectors
        const parentconnectors = this.connectors.hasNode(parent.name)
        if (parentconnectors) {
          // get the first connector - mind map only has one
          const first = parentconnectors.connectors[0]
          // get its interaction to create as child node
          const interact = this.interaction.getConnectorInteractive(first)
          if (interact) this.connectIdea(interact, position)
        }
      }
    }

    options.keyboard = {
      'Delete': handleDelete,
      'Tab': handleTab,
      'Enter': handleEnter,
    }
  }

  private connectIdea(interact: ConnectorInteractive, position: Vector3): FlowNode | undefined {
    const mesh = interact.mesh as MindMapConnector
    return mesh.connectIdea(this, position)
  }

  addIdea(text: string, x: number, y: number): FlowNode {
    return this.addNode({
      id: '', material: { color: 'blue' }, width: 0, height: 0, x, y,
      label: { text: 'drag_indicator', isicon: true, padding: 0.05, material: { color: 'white' }, },
      scalable: false, resizable: false, draggable: true, connectors: [
        {
          id: '', anchor: 'center', selectable: true, draggable: true,
          material: { color: 'red' },
          label: { text, padding: 0.05, material: { color: 'white' }, },
        },
      ]
    })
  }

  override createLabel(parameters: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, parameters)
  }

  private nodeSaveAsText(node: FlowNode, indent: number, save: Array<MindMapText>) {
    const result: MindMapText = {
      text: node.parameters.connectors![0].label?.text!,
      position: { x: +node.position.x.toFixed(2), y: +node.position.y.toFixed(2) },
    }
    save.push(result)

    node.children.forEach(child => {
      if (child.type == 'flownode') {
        if (!result.children) result.children = []
        this.nodeSaveAsText(child as FlowNode, indent + 1, result.children)
      }
    })

  }

  saveTo(): Array<MindMapText> {
    const result: Array<MindMapText> = []
    this.allNodes.forEach(node => {
      if (node.parent == this)
        this.nodeSaveAsText(node, 0, result)
    })
    return result
  }


  private getConnectorInteractive(parent: FlowNode): ConnectorInteractive {
    const parentconnectors = this.connectors.hasNode(parent.name)
    // get the first connector - mind map only has one
    const first = parentconnectors!.connectors[0]
    // get its interaction to create as child node
    return this.interaction.getConnectorInteractive(first)!
  }

  private loadFromNode(parent: FlowNode, children: Array<MindMapText>) {
    const parentinteract = this.getConnectorInteractive(parent)
    if (parentinteract) {
      // now add children to this node
      children.forEach(item => {
        const node = this.connectIdea(parentinteract, new Vector3(parent.position.x + item.position.x, parent.position.y + item.position.y))
        if (node) {
          // set the connectors text
          const childinteract = this.getConnectorInteractive(node)

          // wait one frame, so connect moves correctly when label width changes
          requestAnimationFrame(() => {
            childinteract.mesh.label!.text = item.text
          })

          // add an children to this node
          if (item.children) this.loadFromNode(node, item.children)
        }
      })
    }
  }

  loadFrom(array: Array<MindMapText>) {
    array.forEach(item => {
      const node = this.addIdea(item.text, item.position.x, item.position.y)
      this.add(node)
      if (item.children) this.loadFromNode(node, item.children)
    })
  }
}

class MindMapConnectors extends FlowConnectors {
  constructor(diagram: MindMapDiagram) {
    super(diagram)
  }

  override createGeometry(parameters: FlowConnectorParameters): BufferGeometry {
    return new PlaneGeometry(parameters.width, parameters.height)
  }
  override createConnector(connectors: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh {
    return new MindMapConnector(this.diagram, connectors, parameters)
  }

}

class MindMapConnector extends ConnectorMesh {
  constructor(diagram: FlowDiagram, connectors: NodeConnectors, parameters: FlowConnectorParameters) {
    super(connectors, parameters)

    // when the label's width is known, update connector geometry and position
    this.label!.addEventListener(FlowEventType.WIDTH_CHANGED, (e: any) => {
      this.geometry = new PlaneGeometry(e.width, parameters.height)
      this.position.x = e.width / 2 + 0.1

      // notify the edge that the connector has moved
      connectors.node.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
      diagram.dispatchEvent<any>({ type: FlowEventType.CONNECTOR_SELECTED, connector: this })

      // make sure its saved with this label
      parameters.label!.text = this.label!.text
    })

    // listen for request to show connector properties
    this.addEventListener(FlowEventType.CONNECTOR_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${this.label!.text} Properties`)

      gui.add<any, any>(this.label, 'text').name('Title')

    })

  }

  connectIdea(diagram: MindMapDiagram, start: Vector3): FlowNode | undefined {
    const newnode = diagram.addIdea('New Idea', start.x, start.y)
    if (newnode) {
      const parentNode = this.parent as FlowNode

      const params: FlowEdgeParameters = { from: parentNode.name, to: newnode.name, }

      const anchor = this.oppositeAnchor
      if (newnode.parameters.connectors) {
        const connector = newnode.parameters.connectors.find(c => c.anchor == anchor)

        if (connector) {
          params.fromconnector = this.name
          params.toconnector = connector.id
        }
      }
      diagram.addEdge(params)
    }

    const addAsChild = true
    if (addAsChild) {
      // By default a new nodes position is relative to diagram.
      const position = diagram.getFlowPosition(this.connectors.node)
      // Subtract parent position in flow to make relative to parent node
      newnode.position.sub(position)
      this.connectors.node.add(newnode)

      // When the parent node is dragged, forward event to child node
      this.connectors.node.addEventListener(FlowEventType.DRAGGED, () => { newnode.dispatchEvent<any>({ type: FlowEventType.DRAGGED }) })
    }

    return newnode
  }

  override pointerEnter(): string {
    return 'crosshair'
  }
  override dropCompleted(diagram: MindMapDiagram, start: Vector3): FlowNode | undefined {
    return this.connectIdea(diagram, start)
  }
}
