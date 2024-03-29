import { AmbientLight, AxesHelper, BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, ExtrudeGeometry, FrontSide, Material, MaterialParameters, Mesh, MeshStandardMaterial, PointLight, Scene, Shape, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TubeGeometry } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowNode,
  FlowEdgeParameters,
  FlowNodeParameters,
  FlowEdge,
  ScaleNode,
  FlowDiagramOptions,
  FlowDiagramParameters,
  FlowInteraction,
  FlowArrow,
  FlowArrowParameters,
  ArrowStyle,
  FlowLabelParameters,
  FlowLabel,
  FlowEventType,
  LabelAlignY,
  LabelAlignX
} from "three-flow";
import { ResizeNode, FlowDiagram } from "three-flow";
import { TextGeometry, TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import { DagreLayout } from "./dagre-layout";
import { NodeBorder } from "./node-border";
import { FlowMaterials } from "three-flow";

interface MyFlowNodeData extends FlowNodeParameters {
  test: string
}

interface MyFlowEdgeData extends FlowEdgeParameters {
  test: string
}

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


    const nodes: MyFlowNodeData[] = [
      {
        id: "1",
        y: 2,
        label: {
          text: "Movable / Enabled",
          font: 'helvetika'
        },
        selectable: true,
        width: 1.5,
        height: 2,
        material: { color: 'green' },
        test: '1'
      },
      {
        id: "2",
        x: 2, y: 0, z: 0,
        label: {
          text: "Pinned, Disabled",
          size: 0.1,
          material: { color: 'white' },
          font: 'helvetika'
        },
        draggable: false,
        resizable: false,
        scalable: true,
        selectable: false,
        scale: 1,
        width: 1.5,
        height: 1,
        material: { color: 'red' },
        resizematerial: { color: 'red' },
        scalematerial: { color: 'yellow' },
        test: '2'
      },
      {
        id: "3",
        x: -2, y: 0, z: 0,
        label: {
          text: "Pinned / Enabled",
          size: 0.1,
          material: { color: 'white' },
          font: 'helvetika'
        },
        draggable: false,
        resizable: false,
        selectable: true,
        scalable: true,
        scale: 1,
        width: 1.5,
        height: 1,
        material: { color: 'gold' },
        resizematerial: { color: 'red' },
        scalematerial: { color: 'yellow' },
        test: '3'
      },
      {
        id: "4",
        y: -2,
        label: {
          text: "Movable / Disabled",
          font: 'helvetika'
        },
        selectable: false,
        width: 1.5,
        height: 2,
        material: { color: 'green' },
        test: '4'
      },

    ];

    const edges: MyFlowEdgeData[] = [
      {
        id: '1',
        from: "1",
        to: "3",
        material: { color: 0xff0000 },
        toarrow: {
          material: { color: 0xff0000 }
        },
        test: '1'
      },
      {
        from: "1",
        to: "2",
        test: '2'
      },
      {
        from: "4",
        to: "3",
        test: '3'
      },
      {
        from: "4",
        to: "2",
        test: '4'
      },
    ];

    const loader = new FontLoader();

    const diagram: FlowDiagramParameters = {
      version: 1,
      nodes, edges
    }

    const gui = new GUI();
    let interaction:FlowInteraction

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowDiagramOptions = {
        gridsize: 0.3,
        materialCache: new MyDiagramMaterials(),
        fonts: new Map<string, Font>([
          ['helvetika', font],
        ]),
        linethickness: 0.015,
        linematerial: { color: 0x2ead25 },
        linestyle: 'bezier',
        layout: new DagreLayout()
      }
      const flow = new MyFlowDiagram(options)
      scene.add(flow);

      // make the flow interactive
      interaction = new FlowInteraction(flow, app.interactive)

      flow.loadDiagram(diagram)
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

      edgegui.add<any, any>(edge1, 'linestyle', ['straight', 'bezier']).name('Line Style').onChange(() => {
        flow.layout()
      })
      edgegui.add<any, any>(edge1, 'divisions', 3, 15).name('Curve Divisions').step(1)
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
      interaction.dispose()
      gui.destroy()
      orbit.dispose()
    }

  }
}

class MyDiagramMaterials extends FlowMaterials {

  override createMeshMaterial(parameters: MaterialParameters): Material {
    return new MeshStandardMaterial(parameters);
  }
}

class MyFlowDiagram extends FlowDiagram {
  constructor(options?: FlowDiagramOptions) {
    super(options)
  }


  override createNode(node: MyFlowNodeData): FlowNode {
    return new MyFlowNode(this, node)
  }

  override createEdge(edge: MyFlowEdgeData): FlowEdge {
    return new MyFlowEdge(this, edge)
  }

  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new MyFlowLabel(this, label)
  }

}

const depth = 0.15
class MyFlowNode extends FlowNode {
  border: NodeBorder;

  constructor(diagram: FlowDiagram, node: MyFlowNodeData) {
    super(diagram, node);

    this.border = new NodeBorder(this, diagram)
    this.add(this.border)
  }

  override createGeometry(): BufferGeometry {
    return new BoxGeometry(this.width, this.height, depth)
  }

}

class MyFlowEdge extends FlowEdge {
  constructor(diagram: FlowDiagram, edge: MyFlowEdgeData) {
    super(diagram, edge)
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CatmullRomCurve3(curvepoints);
    return new TubeGeometry(curve, curvepoints.length, thickness)
  }

  override createArrow(arrow: FlowArrowParameters) {
    return new MyArrow(this.diagram, arrow)
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

class MyFlowLabel extends FlowLabel {

  override createText(label: string, options: any): Mesh {
    const params = options as TextGeometryParameters;
    options.height = depth

    const mesh = new Mesh()

    // only add text if font is loaded
    if (params.font) {
      mesh.geometry = new TextGeometry(label, params)

      mesh.geometry.computeBoundingBox()
      if (mesh.geometry.boundingBox) {
        const box = mesh.geometry.boundingBox
        const size = box.getSize(this.textsize)
        const center = box.getCenter(this.textcenter)

        let x = 0, y = 0
        switch (<LabelAlignX>options.alignX) {
          case 'center':
            x = -center.x
            break
          case 'right':
            x = -size.x
            break
          case 'left':
          default:
            break
        }
        switch (<LabelAlignY>options.alignY) {
          case 'middle':
            y = -center.y
            break
          case 'top':
            y = -size.y
            break
          case 'bottom':
          default:
            break
        }
        mesh.geometry.translate(x, y, 0)
      }
    }

    requestAnimationFrame(() => {
      mesh.dispatchEvent<any>({ type: FlowEventType.LABEL_READY })
    })
    return mesh
  }

}
