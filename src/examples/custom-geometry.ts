import { AmbientLight, AxesHelper, BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, ExtrudeGeometry, LineBasicMaterial, Material, MeshStandardMaterial, PointLight, Scene, Shape, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TubeGeometry } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowNode, AbstractConnector,
  AbstractEdge,
  AbstractNode,
  AbstractGraph,
  FlowEdge, FlowInteractive, ScaleNode, FlowGraphOptions
} from "three-flow";
import { ResizeNode, FlowGraph, FlowConnector } from "three-flow";
import { TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";

export class CustomGeometryExample {

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
      scene.add(new MyFlowGraph(graph, interactive, options));
    });



    this.dispose = () => {
      orbit.dispose()
    }

  }
}

class MyFlowGraph extends FlowGraph {
  constructor(graph: AbstractGraph, interactive: FlowInteractive, options?: FlowGraphOptions) {
    super(graph, interactive, options)
  }

  override createLineMaterial(color: number | string): Material {
    return new LineBasicMaterial({ color: 'orange' });
  }

  override createMeshMaterial(color: number | string): Material {
    return new MeshStandardMaterial({ color: 'orange' });
  }

  override createNode(graph: FlowGraph, node: AbstractNode, font?: Font): FlowNode {
    return new MyFlowNode(graph, node, font)
  }

  override createConnector(graph: FlowGraph, connector: AbstractConnector): FlowConnector {
    return new MyFlowConnector(graph, connector);
  }

  override createEdge(graph: FlowGraph, edge: AbstractEdge): FlowEdge {
    return new MyFlowEdge(graph, edge)
  }
}

class MyFlowNode extends FlowNode {
  constructor(graph: FlowGraph, node: AbstractNode, font?: Font) {
    super(graph, node, font);
  }

  override createGeometry(): BufferGeometry {
    return new BoxGeometry(this.width, this.height, 0.01)
  }

  override createTextGeometry(label: string, options: TextGeometryParameters): BufferGeometry {
    options.height = 0.01
    return super.createTextGeometry(label, options)
  }

  override createResizer(node: FlowNode, material: Material): ResizeNode {
    return new MyResizeNode(node, material)
  }

  override createScaler(node: FlowNode, material: Material): ScaleNode {
    return new MyScaleNode(node, material)
  }
}

class MyFlowConnector extends FlowConnector {
  constructor(graph: FlowGraph, connector: AbstractConnector) {
    super(graph, connector)
  }

  override createGeometry(size: number): BufferGeometry {
    const shape = new Shape()
    shape.ellipse(0, 0, 0.1, 0.1, 0, Math.PI * 2)
    return new ExtrudeGeometry(shape, { bevelEnabled: false, depth: 0.01 })
  }

}

class MyFlowEdge extends FlowEdge {
  constructor(graph: FlowGraph, edge: AbstractEdge) {
    super(graph, edge)
  }

  override createGeometry(start: Vector3, end: Vector3): BufferGeometry | undefined {
    const curve = new CatmullRomCurve3([start, end]);
    return new TubeGeometry(curve, 8, 0.01)
  }
}

class MyResizeNode extends ResizeNode {
  constructor(node: FlowNode, material: Material) {
    super(node, material)
  }

  override createGeometry(size: number) {
    return new BoxGeometry(size, size, 0.01)
  }

}

class MyScaleNode extends ScaleNode {
  constructor(node: FlowNode, material: Material) {
    super(node, material)
  }

  override createGeometry(size: number) {
    return new BoxGeometry(size, size, 0.01)
  }

}
