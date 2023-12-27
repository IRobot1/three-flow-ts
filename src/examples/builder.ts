import { AmbientLight, BufferGeometry, Color, PointLight, Scene, Shape, ShapeGeometry } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowDiagram,
  FlowDiagramOptions,
  FlowInteraction,
  FlowNode,
  FlowNodeParameters
} from "three-flow";
import { Exporter } from "three-flow";
import { DagreLayout } from "./dagre-layout";

interface MyFlowNodeParameters extends FlowNodeParameters {
  shape: string
}

export class BuilderExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 5

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

    const loader = new FontLoader();
    let interaction: FlowInteraction

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowDiagramOptions = {
        gridsize: 0.3, linestyle: 'straight',
        fonts: new Map<string, Font>([
          ['default', font],
        ]),
        layout: new DagreLayout()
      }

      const flow = new FlowDiagram(options);
      scene.add(flow)

      flow.createNode = (mynode: MyFlowNodeParameters): FlowNode => {
        const result = new FlowNode(flow, mynode);
        mynode.shape = 'round'
        result.createGeometry = (): BufferGeometry => {
          const width = result.width!
          const height = result.height!
          const radius = 0.3

          const halfwidth = width / 2
          const halfheight = height / 2
          const ctx = new Shape()
            .moveTo(-halfwidth + radius, -halfheight)
            .lineTo(halfwidth - radius, -halfheight)
            .quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius)
            .lineTo(halfwidth, halfheight - radius)
            .quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight)
            .lineTo(-halfwidth + radius, halfheight)
            .quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius)
            .lineTo(-halfwidth, -halfheight + radius)
            .quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight)

          return new ShapeGeometry(ctx);
        }
        return result;
      };
      // make the flow interactive
      interaction = new FlowInteraction(flow, app.interactive)


      // build the diagram programmatically
      const node3 = flow.addNode({ label: { text: 'Node3' }, material: { color: 'gold' }, x: -2 })
      //const node3 = node3.addOutputConnector({})
      //const node3 = node3.addOutputConnector({})

      const node4 = flow.addNode({ label: { text: 'Node4' }, material: { color: 'gold' }, x: -2, y: 1.2 })
      //const node4 = node4.addOutputConnector({})

      const node1 = flow.addNode({ label: { text: 'Node1' }, material: { color: 'green' }, y: 0.5 })
      //const node1 = node1.addInputConnector({})
      //const node1 = node1.addInputConnector({})
      //const node1 = node1.addOutputConnector({})

      const edge1 = flow.addEdge({ from: node3.name, to: node1.name })
      //const edge2 = flow.addEdge({ v: node3.name, w: node1.name })
      const edge4 = flow.addEdge({ from: node4.name, to: node1.name })

      const node2 = flow.addNode({ label: { text: 'Node2' }, material: { color: 'red' }, x: 2, y: 1.2 })
      //const node2 = node2.addInputConnector({})
      const edge3 = flow.addEdge({ from: node1.name, to: node2.name })

      const node5 = flow.addNode({ label: { text: 'Node5' }, material: { color: 'red' }, x: 2, y: -2 })
      //const node5 = node5.addInputConnector({})

      const route1 = flow.addRoute({ material: { color: 'blue' }, y: -1 })
      const edge6 = flow.addEdge({ from: node1.name, to: route1.name, toarrow: { scale: 1 } })
      const edge5 = flow.addEdge({ from: route1.name, to: node5.name, toarrow: { indent: 0, scale: 1, offset: 0.2, material: { color: 'gold' } } })

      flow.layout({ rankdir: 'LR', ranksep: 1 })

      console.log(flow.saveDiagram())
      //flow.removeNode(node1)
      //flow.removeNode(node2)
      //flow.removeNode(node3)
      //flow.removeNode(node4)
      //flow.removeNode(node5)

      //node1.removeInputConnector(n1in1)
      //node1.removeInputConnector(n1in2)
      //node1.removeOutputConnector(n1out)

      //node2.removeInputConnector(n2in)

      //node3.removeOutputConnector(n3out2)
      //node3.removeOutputConnector(n3out1)

      //flow.removeEdge(edge1)
      //flow.removeEdge(edge2)
      //flow.removeEdge(edge3)
      //flow.removeEdge(edge4)
      //flow.removeEdge(edge5)

      //console.warn(interactive)

      //const exporter = new Exporter()
      //exporter.saveJSON(flow.saveDiagram(), 'builder')

    });



    this.dispose = () => {
      interaction.dispose()
      orbit.dispose()
    }

  }
}
