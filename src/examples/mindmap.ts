import { AmbientLight, BufferGeometry, Camera, Color, PlaneGeometry, PointLight, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import {
  ConnectorMesh,
  FlowConnectorParameters,
  FlowConnectors,
  FlowDiagram,
  FlowDiagramOptions,
  FlowDiagramParameters,
  FlowEventType,
  FlowInteraction,
  FlowLabel,
  FlowLabelParameters,
  FlowNode,
  NodeConnectors,
} from "three-flow";
import { ThreeJSApp } from "../app/threejs-app";
import { FlowProperties } from "./flow-properties";
import { TroikaFlowLabel } from "./troika-label";

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

    const options: FlowDiagramOptions = {
      gridsize: 0.3,
    }

    // read-only flow
    const flow = new MindMapDiagram(app, app.camera, options)
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

    const first = flow.addNode({
      id: 'first', material: { color: 'blue' }, width: 0, height: 0,
      label: { text: 'drag_indicator', isicon: true, padding: 0.05, material: { color: 'white' }, },
      scalable: false, resizable: false, draggable: true, connectors: [
        {
          id: '', anchor: 'center', selectable: true, draggable: true,
          material: { color: 'red' },
          label: { text: 'Main Idea', padding: 0.05, material: { color: 'white' }, },
        },
        //  { id: '', anchor: 'left', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
        //  { id: '', anchor: 'top', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
        //  { id: '', anchor: 'right', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
        //  { id: '', anchor: 'bottom', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
      ]
    })

    this.dispose = () => {
      orbit.dispose()
    }

  }
}

class MindMapDiagram extends FlowDiagram {
  override dispose: () => void

  constructor(renderer: WebGLRenderer, camera: Camera, options?: FlowDiagramOptions) {
    super(options)

    // make the flow interactive
    const interaction = new FlowInteraction(this, renderer, camera)
    const connectors = new MindMapConnectors(this)
    const properties = new FlowProperties(this)

    this.dispose = () => {
      interaction.dispose()
      properties.dispose()
      super.dispose()
    }


    this.addEventListener(FlowEventType.KEY_DOWN, (e: any) => {
      const keyboard = e.keyboard as KeyboardEvent
      if (!properties.selectedConnector) return
      const connector = properties.selectedConnector
      const node = connector.connectors.node

      switch (keyboard.code) {
        case 'Delete':
          // only handle most simple case
          if (this.allNodes.length > 1) {

            // prevent delete if node has any child nodes
            if (node.children.find(x => x.type == 'flownode')) return

            // since we're nesting them, we're responsible for removing from parent
            if (node.parent) node.parent.remove(node)

            // finally, remove from diagram
            this.removeNode(node)
          }
          break;
        case 'Tab': {
          const position = this.getFlowPosition(node)
          if (keyboard.shiftKey)
            position.x -= 1
          else
            position.x += 1

          // re-use method in connector interaction when dragging
          const interact = interaction.connector(connector)
          if (interact) interact.createNode(position)
        }
          break;
        case 'Enter': {
          const position = this.getFlowPosition(node)
          if (keyboard.shiftKey)
            position.y += 0.3
          else
            position.y -= 0.3

          // get parent of this connector's node
          const parent = node.parent
          if (parent && parent.type == 'flownode') {
            // get its connectors
            const parentconnectors = connectors.hasNode(parent.name)
            if (parentconnectors) {
              // get the first connector - mind map only has one
              const first = parentconnectors.getConnectors()[0]
              // get its interaction to create as child node
              const interact = interaction.connector(first)
              if (interact) interact.createNode(position)
            }
          }
        }
          break;
      }
    })
  }

  override createLabel(parameters: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, parameters)
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
    })

    // listen for request to show connector properties
    this.addEventListener(FlowEventType.CONNECTOR_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${this.label!.text} Properties`)

      gui.add<any, any>(this.label, 'text').name('Title')

    })

  }

  override pointerEnter(): string {
    return 'crosshair'
  }

  override dropCompleted(diagram: FlowDiagram, start: Vector3): FlowNode | undefined {
    const newnode = diagram.addNode({
      x: start.x, y: start.y, material: { color: 'blue' },
      width: 0, height: 0,
      label: { text: 'drag_indicator', isicon: true, padding: 0.05, material: { color: 'white' }, },
      scalable: false, resizable: false, draggable: true, connectors: [
        {
          id: '', anchor: 'center', selectable: true, draggable: true,
          material: { color: 'red' },
          label: { text: 'New Idea', padding: 0.05, material: { color: 'white' }, },
        },
      ]
    })

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

}
