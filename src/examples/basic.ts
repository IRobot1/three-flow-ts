import { AmbientLight, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  AbstractConnector,
  AbstractEdge,
  AbstractNode,
  AbstractGraph,
  FlowInteractive,
  FlowGraph,
  FlowGraphOptions
} from "three-flow";

export class BasicExample {

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


    //scene.add(new AxesHelper(3))


    const nodes: AbstractNode[] = [
      {
        id: "1",
        x: 0, y: 0, z: 0,
        label: "Title1",
        labelsize: 0.1,
        labelcolor: 'white',
        labelfont: 'helvetika',
        inputs: ["3", "4"],
        outputs: ["5"],
        draggable: true,
        resizable: true,
        scaleable: true,
        scale: 1,
        width: 1,
        height: 2,
        color: 'green'

      },
      {
        id: "2",
        x: 2, y: 0, z: 0,
        label: "Title2",
        labelsize: 0.1,
        labelcolor: 'white',
        labelfont: 'helvetika',
        inputs: ["6"],
        outputs: [],
        draggable: true,
        resizable: false,
        scaleable: true,
        scale: 1,
        width: 1,
        height: 1,
        color: 'red'
      },
      {
        id: "3",
        x: -2, y: 0, z: 0,
        label: "Title3",
        labelsize: 0.1,
        labelcolor: 'white',
        labelfont: 'helvetika',
        inputs: [],
        outputs: ["1", "2"],
        draggable: true,
        resizable: false,
        scaleable: true,
        scale: 1,
        width: 1,
        height: 1,
        color: 'gold'
      }

    ];

    const connectors: AbstractConnector[] = [
      {
        id: "1",
        connectortype: "output",
      },
      {
        id: "2",
        connectortype: "output",
      },
      {
        id: "3",
        connectortype: "input",
      },
      {
        id: "4",
        connectortype: "input",
      },
      {
        id: "5",
        connectortype: "output",
      },
      {
        id: "6",
        connectortype: "input",
      }
    ];

    const edges: AbstractEdge[] = [
      {
        id: "7",
        from: "1",
        to: "3",
      },
      {
        id: "8",
        from: "2",
        to: "4",
      },
      {
        id: "9",
        from: "5",
        to: "6",
      }
    ];

    const interactive = new FlowInteractive(app, app.camera)

    const loader = new FontLoader();

    const graph: AbstractGraph = {
      version: 1,
      nodes, connectors, edges
    }

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowGraphOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['helvetika', font],
        ])
      }
      scene.add(new FlowGraph(graph, interactive, options));
    });



    this.dispose = () => {
      orbit.dispose()
    }

  }
}
