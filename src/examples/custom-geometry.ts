import { AmbientLight, AxesHelper, BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, ExtrudeGeometry, FrontSide, Material, MeshBasicMaterial, MeshStandardMaterial, PointLight, Scene, Shape, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TubeGeometry } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowNode,
  FlowEdgeData,
  FlowNodeData,
  FlowEdge, FlowInteractive, ScaleNode, FlowGraphOptions, FlowGraphData, GraphInteraction, NodeBorder, FlowArrow, FlowArrowData, ArrowStyle
} from "three-flow";
import { ResizeNode, FlowGraph } from "three-flow";
import { TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

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


    const nodes: FlowNodeData[] = [
      {
        text: "1",
        y: 2,
        label: "Movable / Enabled",
        labelfont: 'helvetika',
        selectable: true,
        width: 1.5,
        height: 2,
        color: 'green',
      },
      {
        text: "2",
        x: 2, y: 0, z: 0,
        label: "Pinned, Disabled",
        labelsize: 0.1,
        labelcolor: 'white',
        labelfont: 'helvetika',
        draggable: false,
        resizable: false,
        scaleable: true,
        selectable: false,
        scale: 1,
        width: 1.5,
        height: 1,
        color: 'red',
        resizecolor: 'red',
        scalecolor: 'yellow',


      },
      {
        text: "3",
        x: -2, y: 0, z: 0,
        label: "Pinned / Enabled",
        labelsize: 0.1,
        labelcolor: 'white',
        labelfont: 'helvetika',
        draggable: false,
        resizable: false,
        selectable: true,
        scaleable: true,
        scale: 1,
        width: 1.5,
        height: 1,
        color: 'gold',
        resizecolor: 'red',
        scalecolor: 'yellow',

      },

      {
        text: "4",
        y: -2,
        label: "Movable / Disabled",
        labelfont: 'helvetika',
        selectable: false,
        width: 1.5,
        height: 2,
        color: 'green',
      },

    ];

    const edges: FlowEdgeData[] = [
      {
        name: '1',
        v: "1",
        w: "3",
        color: 0xff0000,
        toarrow: { color: 0xff0000 }
      },
      {
        v: "1",
        w: "2",
      },
      {
        v: "4",
        w: "3",
      },
      {
        v: "4",
        w: "2",
      },
    ];

    const interactive = new FlowInteractive(app, app.camera)

    const loader = new FontLoader();

    const graph: FlowGraphData = {
      version: 1,
      nodes, edges
    }

    const gui = new GUI();


    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowGraphOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['helvetika', font],
        ]),
        linethickness: 0.015,
        linecolor: 0x2ead25,
        linestyle: 'spline'
      }
      const flow = new MyFlowGraph(options)
      scene.add(flow);

      // make the flow interactive
      new GraphInteraction(flow, interactive)

      flow.load(graph)
      console.log(flow)

      flow.layout()
      const center = flow.getCenter()
      app.camera.position.x = center.x
      app.camera.position.y = center.y
      orbit.target.set(app.camera.position.x, app.camera.position.y, 0)


      gui.add(flow, 'layout').name("Layout")

      const edge1 = flow.hasEdge('1')!
      const arrow1 = edge1.toArrow as FlowArrow

      const edgegui = gui.addFolder('Edge Properties')

      edgegui.add<any, any>(edge1, 'linestyle', ['straight', 'spline']).name('Line Style').onChange(() => {
        flow.layout()
      })
      edgegui.add<any, any>(edge1, 'divisions', 3, 15).name('Spline Division').step(1)
      edgegui.addColor(edge1, 'color').name('Line Color')
      edgegui.add<any, any>(edge1, 'thickness', 0.01, 0.05).name('Line Width')

      const arrowgui = gui.addFolder('Arrow Properties')
      arrowgui.addColor(arrow1, 'color').name('Arrow Color')
      arrowgui.add<any, any>(arrow1, 'width', 0.1, 0.3).name('Arrow Width')
      arrowgui.add<any, any>(arrow1, 'height', 0.2, 0.5).name('Arrow Height')
      arrowgui.add<any, any>(arrow1, 'indent', 0, 0.2).name('Arrow Indent')
      //arrowstyle ?: ArrowStyle;

      arrowgui.add<any, any>(arrow1, 'scalar', 0.5, 2).name('Scale')
 
    });



    this.dispose = () => {
      gui.destroy()
      orbit.dispose()
    }

  }
}

class MyFlowGraph extends FlowGraph {
  constructor(options?: FlowGraphOptions) {
    super(options)
  }

  override createLineMaterial(purpose: string, color: number | string): Material {
    return new MeshBasicMaterial({ color });
  }

  override createMeshMaterial(purpose: string, color: number | string): Material {
    return new MeshStandardMaterial({ color, side: purpose == 'arrow' ? DoubleSide : FrontSide });
  }

  override createNode(graph: FlowGraph, node: FlowNodeData): FlowNode {
    return new MyFlowNode(graph, node)
  }

  override createEdge(graph: FlowGraph, edge: FlowEdgeData): FlowEdge {
    return new MyFlowEdge(graph, edge)
  }
}

const depth = 0.15
class MyFlowNode extends FlowNode {
  border: NodeBorder;

  constructor(graph: FlowGraph, node: FlowNodeData) {
    super(graph, node);

    this.border = new NodeBorder(this, graph)
    this.add(this.border)
  }

  override createGeometry(): BufferGeometry {
    return new BoxGeometry(this.width, this.height, depth)
  }

  override createTextGeometry(label: string, options: TextGeometryParameters): BufferGeometry {
    options.height = depth
    return super.createTextGeometry(label, options)
  }
}

class MyFlowEdge extends FlowEdge {
  constructor(graph: FlowGraph, edge: FlowEdgeData) {
    super(graph, edge)
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CatmullRomCurve3(curvepoints);
    return new TubeGeometry(curve, curvepoints.length, thickness)
  }

  override createArrow(arrow: FlowArrowData): FlowArrow {
    return new MyArrow(this, arrow)
  }
}

class MyArrow extends FlowArrow {
  override createArrow(style: ArrowStyle): BufferGeometry {
    const shape = new Shape()
      .lineTo(-this.width, this.height + this.indent)
      .lineTo(0, this.height)
      .lineTo(this.width, this.height + this.indent)

    const geometry = new ExtrudeGeometry(shape, { bevelEnabled: false, depth: 0.1 });
    geometry.translate(0, 0, -0.05)
    return geometry
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
