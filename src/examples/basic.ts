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
  FlowGraph
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
        position: { x: 0, y: 0, z: 0 },
        nodetype: "function",
        label: "Title1",
        inputs: ["3", "4"],
        outputs: ["5"],
        state: "default",
        category: "",
        draggable: true,
        resizable: true,
        scaleable: true,
        scale: 1,
        labelsize: 0.1,
        labelcolor: 'white', width: 1, height: 2, color: 'green'

      },
      {
        id: "2",
        position: { x: 2, y: 0, z: 0 },
        nodetype: "return",
        label: "Title2",
        inputs: ["6"],
        outputs: [],
        state: "selected",
        category: "",
        draggable: true,
        resizable: false,
        scaleable: true,
        scale: 1,
        labelsize: 0.1,
        labelcolor: 'white', width: 1, height: 1, color: 'red'
      },
      {
        id: "3",
        position: { x: -2, y: 0, z: 0 },
        nodetype: "return",
        label: "Title3",
        inputs: [],
        outputs: ["1","2"],
        state: "default",
        category: "",
        draggable: true,
        resizable: false,
        scaleable: true,
        scale: 1,
        labelsize: 0.1,
        labelcolor: 'white',
        width: 1,
        height: 1,
        color: 'gold'
      }

    ];

    const connectors: AbstractConnector[] = [
      {
        id: "1",
        connectortype: "output",
        order: 0,
        connectedEdges: ["7"],
        multiplicity: 1,
        compatibility: [],
        draggable: false,
        size: 1,
        shape: "circle",
        color: "blue",
        label: "A",
        state: "default",
        labelsize: 0.1,
        labelcolor: 'white'
      },
      {
        id: "2",
        connectortype: "output",
        order: 0,
        connectedEdges: ["8"],
        multiplicity: 1,
        compatibility: [],
        draggable: false,
        size: 1,
        shape: "circle",
        color: "blue",
        label: "B",
        state: "default",
        labelsize: 0.1,
        labelcolor: 'white'
      },
      {
        id: "3",
        connectortype: "input",
        order: 0,
        connectedEdges: ["7"],
        multiplicity: 1,
        compatibility: [],
        draggable: false,
        size: 1,
        shape: "circle",
        color: "blue",
        label: "A",
        state: "default",
        labelsize: 0.1,
        labelcolor: 'white'
      },
      {
        id: "4",
        connectortype: "input",
        order: 0,
        connectedEdges: ["8"],
        multiplicity: 1,
        compatibility: [],
        draggable: false,
        size: 1,
        shape: "circle",
        color: "blue",
        label: "B",
        state: "default",
        labelsize: 0.1,
        labelcolor: 'white'
      },
      {
        id: "5",
        connectortype: "output",
        order: 0,
        connectedEdges: ["9"],
        multiplicity: 1,
        compatibility: [],
        draggable: false,
        size: 1,
        shape: "circle",
        color: "red",
        label: "Sum",
        state: "default",
        labelsize: 0.1,
        labelcolor: 'white'
      },
      {
        id: "6",
        connectortype: "input",
        order: 0,
        connectedEdges: ["9"],
        multiplicity: 1,
        compatibility: [],
        draggable: false,
        size: 1,
        shape: "circle",
        color: "blue",
        label: "Value",
        state: "default",
        labelsize: 0.1,
        labelcolor: 'white'
      }
    ];

    const edges: AbstractEdge[] = [
      {
        id: "7",
        from: "1",
        to: "3",
        intermediatePoints: [],
        label: "",
        selectable: true,
        highlighting: true,
        state: "default",
        routing: "straight",
        arrowheads: true,
        labelsize: 0,
        labelcolor: 0,
        color: 'white'
      },
      {
        id: "8",
        from: "2",
        to: "4",
        intermediatePoints: [],
        label: "",
        selectable: true,
        highlighting: true,
        state: "default",
        routing: "straight",
        arrowheads: true,
        labelsize: 0,
        labelcolor: 0,
        color: 'white'
      },
      {
        id: "9",
        from: "5",
        to: "6",
        intermediatePoints: [],
        label: "",
        selectable: true,
        highlighting: true,
        state: "default",
        routing: "straight",
        arrowheads: true,
        labelsize: 0,
        labelcolor: 0,
        color: 'white'
      }
    ];

    const interactive = new FlowInteractive(app, app.camera)

    const loader = new FontLoader();

    const graph: AbstractGraph = {
      version: 1,
      nodes, connectors, edges
    }

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const fontMap: Map<string, Font> = new Map<string, Font>([
        ['helvetika', font],
      ]);
      scene.add(new FlowGraph(graph, interactive, fontMap, { gridsize: 0.3 }));
    });



    this.dispose = () => {
      orbit.dispose()
    }

  }
}
