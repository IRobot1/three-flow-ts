import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, PlaneGeometry, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowEventType, FlowDiagram, FlowNode, FlowNodeParameters, FlowEdgeParameters, FlowInteraction, FlowLabel, FlowLabelParameters, FlowConnectors, FlowProperties, FlowDiagramOptions, FlowConnectorParameters } from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

export class StressExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    app.enableStats()

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

    const flow = new FlowDiagram({ linestyle: 'bezier' })
    scene.add(flow);

    flow.createLabel = (parameters: FlowLabelParameters): FlowLabel => {
      return new TroikaFlowLabel(flow, parameters)
    }
    const interactive = new FlowInteraction(flow, app.interactive)

    const connectors = new StressFlowConnectors(flow)

    const properties = new FlowProperties(flow)

    let count = 1
    let lastnode: FlowNode | undefined
    const hidden = false

    for (let y = 15; y > -15; y--) {
      for (let x = -8; x < 8; x++) {
        const text = `Node ${count}`
        const nodeparams: FlowNodeParameters = {
          x, y,
          width: 0.8, height: 0.8,
          label: { text, hidden },
          resizable: false, scalable: false,
          connectors: [
            { id: "c1" + text, anchor: 'top', hidden, radius: 0.02 },
            { id: "c2" + text, anchor: 'bottom', hidden, radius: 0.02 },
          ],
        }

        const node = flow.addNode(nodeparams)
        node.userData = { x: node.position.x, y: node.position.y }

        if (lastnode) {
          const edgeparams: FlowEdgeParameters = {
            id: '', from: lastnode.name, to: node.name, divisions: 40,
            fromconnector: lastnode.parameters.connectors![1].id, toconnector: nodeparams.connectors![0].id,
          }
          flow.addEdge(edgeparams)
        }
        lastnode = node
        count++
      }
    }

    const params = {
      random() {
        flow.allNodes.forEach(node => {
          node.position.x = -20 + Math.random() * 40
          node.position.y = -20 + Math.random() * 40
          node.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
        })
      },
      reset() {
        flow.allNodes.forEach(node => {
          const { x, y } = node.userData
          node.position.x = x
          node.position.y = y
          node.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
        })
      }
    }
    const gui = new GUI({ title: 'Stress Options' });
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '0';
    gui.domElement.style.left = '85px';
    gui.add<any, any>(params, 'random').name('Random Positions')
    gui.add<any, any>(params, 'reset').name('Reset Positions')

    //count = 0
    //scene.traverse(object => { count++ })
    //console.warn(scene.children, count)

    this.dispose = () => {
      gui.destroy()
      interactive.dispose()
      properties.dispose()
      orbit.dispose()
      app.disableStats()
    }
  }

}

class StressNode extends FlowNode {

  constructor(diagram: StressFlowDiagram, parameters: FlowNodeParameters) {
    super(diagram, parameters)

    this.createGeometry = (): BufferGeometry => {
      return diagram.geometry
    }
  }
}

class StressFlowDiagram extends FlowDiagram {
  geometry: BufferGeometry
  constructor(options?: FlowDiagramOptions) {
    super(options)

    this.geometry = new PlaneGeometry(0.8, 0.8)
  }

  override createNode(node: FlowNodeParameters): FlowNode {
    return new StressNode(this, node)
  }
}

class StressFlowConnectors extends FlowConnectors {
  constructor(diagram: FlowDiagram) {
    super(diagram)

    const geometry = new CircleGeometry(0.02)

    this.createGeometry = (parameters: FlowConnectorParameters): BufferGeometry => {
      return geometry
    }
  }

}
