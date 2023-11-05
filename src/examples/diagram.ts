import { AmbientLight, AxesHelper, BoxGeometry, Mesh, MeshBasicMaterial, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowNode, AbstractConnector,
  AbstractEdge,
  AbstractNode,
  AbstractDiagram
} from "three-flow";
import { Interactive } from "../gallery/interactive";
import { InteractiveObjects } from "../gallery/interactive-objects";
import { FlowConnector } from "three-flow";

export class DiagramExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 10

    const ambient = new AmbientLight()
    ambient.intensity = 0.1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1, 100)
    light.position.set(-1, 1, 2)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)


    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    //orbit.enableRotate = false;
    orbit.update();

    scene.add(new AxesHelper(3))


    const nodes: AbstractNode[] = [
      {
        nodeid: "1",
        position: { x: 0, y: 0, z: 0 },
        nodetype: "function",
        label: "Title1",
        inputs: ["3", "4"],
        outputs: ["5"],
        state: "default",
        draggable: true,
        category: "",
        resizable: true,
        labelsize: 0.1,
        labelcolor: 'white', width: 1, height: 2, color: 'green'

      },
      {
        nodeid: "2",
        position: { x: 2, y: 0, z: 0 },
        nodetype: "return",
        label: "Title2",
        inputs: ["6"],
        outputs: [],
        state: "selected",
        draggable: true,
        category: "",
        resizable: true,
        labelsize: 0.1,
        labelcolor: 'white', width: 1, height: 1, color: 'red'
      }
    ];

    const connectors: AbstractConnector[] = [
      {
        connectorid: "3",
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
        connectorid: "4",
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
        connectorid: "5",
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
        connectorid: "6",
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
        edgeid: "7",
        startConnectorId: "3",
        endConnectorId: "5",
        intermediatePoints: [],
        label: "",
        selectable: true,
        highlighting: true,
        state: "default",
        routing: "straight",
        arrowheads: true
      },
      {
        edgeid: "8",
        startConnectorId: "4",
        endConnectorId: "5",
        intermediatePoints: [],
        label: "",
        selectable: true,
        highlighting: true,
        state: "default",
        routing: "straight",
        arrowheads: true
      },
      {
        edgeid: "9",
        startConnectorId: "5",
        endConnectorId: "6",
        intermediatePoints: [],
        label: "",
        selectable: true,
        highlighting: true,
        state: "default",
        routing: "straight",
        arrowheads: true
      }
    ];

    //const serializedDiagram = serializeDiagram(nodes, connectors, edges);
    //console.log(serializedDiagram)

    const selectable = new InteractiveObjects()
    const draggable = new InteractiveObjects()

    const interactive = new Interactive(app, app.camera, selectable.list, draggable.list)

    const loader = new FontLoader();

    const diagram: AbstractDiagram = {
      version: 1,
      nodes, connectors, edges
    }

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      //const node = new FlowNode(diagram, nodes[0], font);
      //scene.add(node)
      nodes.forEach(node => {
        const mesh = new FlowNode(diagram, node, font);
        scene.add(mesh);
        selectable.add(mesh)
        draggable.add(mesh)
      });

    });



    this.dispose = () => {
      orbit.dispose()
    }

  }
}
