import { AmbientLight, BufferGeometry, CircleGeometry, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters,
  FlowNodeParameters,
  FlowConnectorParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowDiagramParameters,
  FlowInteraction,
  FlowConnectors,
  FlowEventType,
  FlowNode,
  FlowLabelParameters,
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";
import { FlowProperties } from "./flow-properties";

export class PropertiesExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
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


    const nodes: FlowNodeParameters[] = [
    ];


    const edges: FlowEdgeParameters[] = [
    ];

    const loader = new FontLoader();

    const diagram: FlowDiagramParameters = {
      version: 1,
      nodes, edges
    }


    // read-only flow
    const flow = new FlowDiagram()
    scene.add(flow);
    flow.createLabel = (label: FlowLabelParameters) => { return new TroikaFlowLabel(flow, label) }
    flow.createNode = (node: FlowNodeParameters) => { return new PropertiesNode(flow, node) }
    // make the flow interactive
    const interaction = new FlowInteraction(flow, app, app.camera)

    // show properties when node is selected
    const properties = new FlowProperties(flow)

    flow.addNode({ x: -1, label: { text: 'Node 1' } })
    flow.addNode({ x: 1, label: { text: 'Node 2' } })

    this.dispose = () => {
      interaction.dispose()
      properties.dispose()
      orbit.dispose()
    }

  }
}

class PropertiesNode extends FlowNode {
  constructor(diagram: FlowDiagram, node: FlowNodeParameters) {
    super(diagram, node)

    this.addEventListener(FlowEventType.NODE_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI

      gui.add<any, any>(this, 'draggable').name('Draggable')

    })

  }
}

