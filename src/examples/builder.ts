import { AmbientLight, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  AbstractGraph,
  FlowInteractive,
  FlowGraph
} from "three-flow";

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

    const interactive = new FlowInteractive(app, app.camera)

    const loader = new FontLoader();

    const graph: AbstractGraph = {
      version: 1,
      nodes: [],
      connectors: [],
      edges: []
    }

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const fontMap: Map<string, Font> = new Map<string, Font>([
        ['helvetika', font],
      ]);

      const flow = new FlowGraph(graph, interactive, fontMap, { gridsize: 0.3 });
      scene.add(flow)

      // build the graph programmatically
      const node3 = flow.addNode({ label: 'Title3', color: 'gold', position: { x: -2, y: 0, z: 0 } })
      const n3out1 = node3.addOutputConnector({})
      const n3out2 = node3.addOutputConnector({})

      const node4 = flow.addNode({ label: 'Title4', color: 'gold', position: { x: -2, y: 1.2, z: 0 } })
      const n4out1 = node4.addOutputConnector({})

      const node1 = flow.addNode({ label: 'Title1', color: 'green', position: { x: 0, y: 0.5, z: 0 } })
      const n1in1 = node1.addInputConnector({})
      const n1in2 = node1.addInputConnector({})
      const n1out = node1.addOutputConnector({})

      const edge1 = flow.addEdge({ from: n3out1.name, to: n1in1.name })
      const edge2 = flow.addEdge({ from: n3out2.name, to: n1in2.name })
      const edge4 = flow.addEdge({ from: n4out1.name, to: n1in1.name })

      const node2 = flow.addNode({ label: 'Title2', color: 'red', position: { x: 2, y: 1.2, z: 0 } })
      const n2in = node2.addInputConnector({})
      const edge3 = flow.addEdge({ from: n1out.name, to: n2in.name })

      const node5 = flow.addNode({ label: 'Title5', color: 'red', position: { x: 2, y: 0, z: 0 } })
      const n5in = node5.addInputConnector({})
      const edge5 = flow.addEdge({ from: n1out.name, to: n5in.name })


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

      console.log(graph)
      console.log(interactive)
    });



    this.dispose = () => {
      orbit.dispose()
    }

  }
}
