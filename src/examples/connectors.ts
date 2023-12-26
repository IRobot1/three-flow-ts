import { AmbientLight, AxesHelper, Color, Intersection, MeshBasicMaterialParameters, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowInteraction, FlowNode, FlowNodeParameters, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowLabel, FlowLabelParameters, NodeConnectors, FlowConnectorParameters, ConnectorMesh, FlowEdgeParameters, FlowEventType } from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

export class ConnectorsExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 2

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

    const flow = new ConnectorDiagram()
    scene.add(flow);

    const interaction = new FlowInteraction(flow, app.interactive)

    const connectors = new MyConnectors(flow)
    connectors.createConnector

    const column1 = -1
    const column2 = 1
    const row1 = 0

    const node1 = flow.addNode({
      x: column1, y: row1, label: { text: 'Start', material: { color: 'black' } }, resizable: false, scalable: false, draggable: false,
      connectors: [
        { id: 'c1n1', anchor: 'right', selectable: true, draggable: true, startDragDistance: 0.05 }
      ]
    })
    const node2 = flow.addNode({
      x: column2, y: row1, label: { text: 'End', material: { color: 'black' } }, resizable: false, scalable: false, draggable: false,
      connectors: [
        { id: 'c1n1', anchor: 'left', disabled: true, draggable: true, selectable:true }
      ]
    })

    this.dispose = () => {
      orbit.dispose()
    }
  }
}

class MyConnector extends ConnectorMesh {
  constructor(public diagram: FlowDiagram, nodeconnectors: NodeConnectors, parameters: FlowConnectorParameters) {
    super(nodeconnectors, parameters)

    const disabledmaterial = diagram.getMaterial('geometry', 'connector', <MeshBasicMaterialParameters>{ color: 'gray' })
    const enabledmaterial = this.material

    const setColor = () => {
      this.material = this.disabled ? disabledmaterial : enabledmaterial
    }
    setColor()

    this.addEventListener(FlowEventType.DISABLE_CHANGED, setColor)
  }

  override dragOver() {
    if (this.disabled || !this.allowDrop) {

    console.warn('drag over')
      document.body.style.cursor = 'not-allowed'
    }

  }

  override dropCompleted(diagram: FlowDiagram, start: Vector3, dragIntersects: Array<Intersection>): FlowNode | undefined {
    const intersect = dragIntersects.filter(i => i.object.type == 'flowconnector')
    // ignore unless drop was on top of a connector
    if (!intersect.length) return

    intersect.forEach(intersect => {
      const mesh = intersect.object as ConnectorMesh
      console.warn(mesh.disabled, mesh.allowDrop)
      if (mesh.disabled || !mesh.allowDrop) return

      const node = mesh.parent as FlowNode

      const edgeparams: FlowEdgeParameters = {
        from: this.parent!.name, to: node.name, fromconnector: this.name, toconnector: mesh.name
      }
      diagram.addEdge(edgeparams)
    })

    return undefined
  }

}

class MyConnectors extends FlowConnectors {
  //constructor(diagram: FlowDiagram) {
  //  super(diagram)
  //}

  override createConnector(connectors: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh {
    return new MyConnector(this.diagram, connectors, parameters)
  }

}


class ConnectorDiagram extends FlowDiagram {
  constructor(xoptions?: FlowDiagramOptions) {
    super(xoptions)
  }


  override createLabel(parameters: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, parameters)
  }

}
