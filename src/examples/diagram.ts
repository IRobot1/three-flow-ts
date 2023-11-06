import { AmbientLight, AxesHelper, BufferGeometry, CatmullRomCurve3, CircleGeometry, CylinderGeometry, LineBasicMaterial, Material, MeshStandardMaterial, PlaneGeometry, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TubeGeometry } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowNode, AbstractConnector,
  AbstractEdge,
  AbstractNode,
  AbstractDiagram,
  FlowEdge, FlowInteractive, FlowObjects
} from "three-flow";
import { FlowDiagram, FlowConnector } from "three-flow";

export class DiagramExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 5

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
        category: "",
        draggable: true,
        resizable: true,
        scaleable: true,
        scale: 1,
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
        category: "",
        draggable: true,
        resizable: false,
        scaleable: true,
        scale: 1,
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
        arrowheads: true,
        labelsize: 0,
        labelcolor: 0,
        color: 'white'
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
        arrowheads: true,
        labelsize: 0,
        labelcolor: 0,
        color: 'white'
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
        arrowheads: true,
        labelsize: 0,
        labelcolor: 0,
        color: 'white'
      }
    ];

    //const serializedDiagram = serializeDiagram(nodes, connectors, edges);
    //console.log(serializedDiagram)

    const interactive = new FlowInteractive(app, app.camera)

    const loader = new FontLoader();

    const diagram: AbstractDiagram = {
      version: 1,
      nodes, connectors, edges
    }

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const fontMap: Map<string, Font> = new Map<string, Font>([
        ['helvetika', font],
      ]);
      scene.add(new MyFlowDiagram(diagram, interactive, fontMap));
    });



    this.dispose = () => {
      orbit.dispose()
    }

  }
}

class MyFlowDiagram extends FlowDiagram {
  constructor(diagram: AbstractDiagram, interactive: FlowInteractive, fonts: Map<string, Font>) {
    super(diagram, interactive, fonts)
  }

  override createLineMaterial(color: number | string): Material {
    return new LineBasicMaterial({ color: 'orange' });
  }

  override createMeshMaterial(color: number | string): Material {
    return new MeshStandardMaterial({ color: 'orange' });
  }

  override createNode(diagram: FlowDiagram, node: AbstractNode, font: Font): FlowNode {
    return new MyFlowNode(diagram, node, font)
  }

  override createConnector(diagram: FlowDiagram, connector: AbstractConnector): FlowConnector {
    return new MyFlowConnector(diagram, connector);
  }

  override createEdge(diagram: FlowDiagram, edge: AbstractEdge): FlowEdge {
    return new MyFlowEdge(diagram, edge)
  }
}

class MyFlowNode extends FlowNode {
  constructor(diagram: FlowDiagram, node: AbstractNode, font: Font) {
    super(diagram, node, font);
  }

  override createGeometry(): BufferGeometry {
    return new PlaneGeometry(this.width,this.height)
  }

}

class MyFlowConnector extends FlowConnector {
  constructor(diagram: FlowDiagram, connector: AbstractConnector) {
    super(diagram, connector)
  }

  override createGeometry(size: number): BufferGeometry {
    return new CircleGeometry(size, 6)
  }

}

class MyFlowEdge extends FlowEdge {
  constructor(diagram: FlowDiagram, edge: AbstractEdge) {
    super(diagram, edge)
  }

   

}
