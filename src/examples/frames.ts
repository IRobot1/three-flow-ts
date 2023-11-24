import { AmbientLight, BufferGeometry, CatmullRomCurve3, DoubleSide, Material, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace, Scene, Shape, ShapeGeometry, Texture, TextureLoader, TorusKnotGeometry, TubeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters,
  FlowNodeParameters,
  FlowDiagram,
  FlowConnectors,
  FlowLabelParameters,
  FlowLabel,
  FlowNode,
  FlowEdge,
  FlowInteraction,
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

type FrameContentType = 'icon' | 'texture' | 'mesh'
interface FrameShape extends FlowNodeParameters {
  content: FrameContentType
  icon: string
  iconsize: number
  iconcolor: string
  texture: Texture
  mesh: string
}

export class FramesExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const loader = new TextureLoader()

    const scene = new Scene()
    app.scene = scene

    app.camera.position.x = 1
    app.camera.position.z = 5

    const background = loader.load('assets/frames-background.jpg')
    background.colorSpace = SRGBColorSpace;
    scene.background = background

    const ambient = new AmbientLight()
    ambient.intensity = 1
    scene.add(ambient)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(app.camera.position.x, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    const flow = new FramesFlowDiagram()
    scene.add(flow);

    flow.rotation.x = MathUtils.degToRad(-5)

    // make the flow interactive
    new FlowInteraction(flow, app, app.camera)

    const connectors = new FlowConnectors(flow)

    const start = flow.addNode(<FrameShape>{
      text: 'start', x: -3.5, width: 1.2, height: 1.2,
      content: 'texture', texture: background.clone(), icon: 'image',
      connectors: [
        { id: 'c1start', anchor: 'right', hidden: true }
      ]
    })

    const queue = flow.addNode(<FrameShape>{
      text: 'queue', x: -1.5, width: 1.2, height: 1.2,
      content: 'mesh',
      connectors: [
        { id: 'c1queue', anchor: 'left', hidden: true },
        { id: 'c2queue', anchor: 'top', hidden: true },
        { id: 'c3queue', anchor: 'right', hidden: true },
        { id: 'c4queue', anchor: 'bottom', hidden: true },
      ]
    })

    flow.addEdge({ v: start.name, w: queue.name, fromconnector: 'c1start', toconnector: 'c1queue' })

    const localtask1 = flow.addNode(<FrameShape>{
      text: 'localtask1', x: -1.5, y: 2, width: 1.2, height: 1.2,
      content: 'icon', icon: 'task',
      connectors: [
        { id: 'c1task1', anchor: 'bottom', hidden: true },
        { id: 'c2task1', anchor: 'right', hidden: true },
      ]
    })
    flow.addEdge({ v: queue.name, w: localtask1.name, fromconnector: 'c2queue', toconnector: 'c1task1' })

    const localtask2 = flow.addNode(<FrameShape>{
      text: 'localtask2', x: -1.5, y: -2, width: 1.2, height: 1.2,
      content: 'icon', icon: 'task',
      connectors: [
        { id: 'c1task2', anchor: 'top', hidden: true },
        { id: 'c2task2', anchor: 'right', hidden: true },
      ]
    })
    flow.addEdge({ v: queue.name, w: localtask2.name, fromconnector: 'c4queue', toconnector: 'c1task2' })

    const cloudtask = flow.addNode(<FrameShape>{
      text: 'cloudtask', x: 0.5, width: 1.2, height: 1.2,
      content: 'icon', icon: 'cloud', iconcolor: 'steelblue',
      connectors: [
        { id: 'c1cloud', anchor: 'left', hidden: true },
        { id: 'c2cloud', anchor: 'right', hidden: true },
      ]
    })
    flow.addEdge({ v: queue.name, w: cloudtask.name, fromconnector: 'c3queue', toconnector: 'c1cloud' })

    //
    const file1 = flow.addNode(<FrameShape>{
      text: 'file1', x: 2.5, y: 2, width: 1.2, height: 1.2,
      content: 'icon', icon: 'description',
      connectors: [
        { id: 'c1file1', anchor: 'left', hidden: true },
        { id: 'c2file1', anchor: 'bottom', hidden: true },
      ]
    })
    flow.addEdge({ v: localtask1.name, w: file1.name, fromconnector: 'c2task1', toconnector: 'c1file1' })

    const file2 = flow.addNode(<FrameShape>{
      text: 'file2', x: 2.5, y: -2, width: 1.2, height: 1.2,
      content: 'icon', icon: 'description',
      connectors: [
        { id: 'c1file2', anchor: 'left', hidden: true },
        { id: 'c2file2', anchor: 'top', hidden: true },
      ]
    })
    flow.addEdge({ v: localtask2.name, w: file2.name, fromconnector: 'c2task2', toconnector: 'c1file2' })

    const folder = flow.addNode(<FrameShape>{
      text: 'folder', x: 2.5, width: 1.2, height: 1.2,
      content: 'icon', icon: 'folder', iconcolor: 'gold',
      connectors: [
        { id: 'c1folder', anchor: 'left', hidden: true },
        { id: 'c2folder', anchor: 'top', hidden: true },
        { id: 'c3folder', anchor: 'right', hidden: true },
        { id: 'c4folder', anchor: 'bottom', hidden: true },
      ]
    })
    flow.addEdge({ v: cloudtask.name, w: folder.name, fromconnector: 'c2cloud', toconnector: 'c1folder' })
    flow.addEdge({ v: file1.name, w: folder.name, fromconnector: 'c2file1', toconnector: 'c2folder' })
    flow.addEdge({ v: file2.name, w: folder.name, fromconnector: 'c2file2', toconnector: 'c4folder' })

    const storage = flow.addNode(<FrameShape>{
      text: 'storage', x: 5, width: 2, height: 2,
      content: 'icon', icon: 'storage', iconsize: 1, iconcolor: 'black',
      connectors: [
        { id: 'c1storage', anchor: 'left', hidden: true },
      ]
    })
    flow.addEdge({ v: folder.name, w: storage.name, fromconnector: 'c3folder', toconnector: 'c1storage' })


    this.dispose = () => {
      orbit.dispose()
    }

  }
}

class FramesFlowDiagram extends FlowDiagram {

  constructor() { super() }

  override createMeshMaterial(purpose: string, color: number | string): Material {
    return new MeshBasicMaterial({ color, side: DoubleSide });
  }

  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }

  override createNode(parameters: FrameShape): FlowNode {
    switch (parameters.content) {
      case 'texture':
        return new TextureFrameNode(this, parameters)
        break;
      case 'mesh':
        return new MeshFrameNode(this, parameters)
        break;
      case 'icon':
      default:
        return new IconFrameNode(this, parameters)
    }

  }

  override createEdge(edge: FlowEdgeParameters): FlowEdge {
    return new FramesEdge(this, edge)
  }
}

class FramesNode extends FlowNode {
  background: Mesh

  constructor(diagram: FramesFlowDiagram, parameters: FrameShape) {
    parameters.resizable = parameters.scalable = false
    super(diagram, parameters)

    const material = this.material as MeshBasicMaterial
    material.transparent = true
    material.opacity = 0

    const geometry = new ShapeGeometry(this.rectangularShape(this.width - 0.2, this.height - 0.2, 0.1))
    const back = diagram.getMaterial('geometry', 'background', 'white') as MeshBasicMaterial
    back.transparent = true
    back.opacity = 0.2

    const backmesh = new Mesh(geometry, back)
    backmesh.position.z = 0.001
    this.add(backmesh)
    this.background = backmesh

    const border = this.addBorder()
    const mesh = new Mesh(border, diagram.getMaterial('geometry', 'border', 'white'))
    this.add(mesh)

  }

  private addBorder(): BufferGeometry {
    // add a border around node
    const shape = this.rectangularShape(this.width, this.height, 0.1)

    const points = shape.getPoints();
    points.forEach(item => item.multiplyScalar(0.95))

    // draw the hole
    const holePath = new Shape(points.reverse())

    // add hole to shape
    shape.holes.push(holePath);
    return new ShapeGeometry(shape);
  }

  private rectangularShape(width: number, height: number, radius: number): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    const shape = new Shape()
      .moveTo(-halfwidth + radius, -halfheight)
      .lineTo(halfwidth - radius, -halfheight)
      .quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius)
      .lineTo(halfwidth, halfheight - radius)
      .quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight)
      .lineTo(-halfwidth + radius, halfheight)
      .quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius)
      .lineTo(-halfwidth, -halfheight + radius)
      .quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight)

    return shape
  }
}

class FramesEdge extends FlowEdge {
  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CatmullRomCurve3(curvepoints);
    return new TubeGeometry(curve, curvepoints.length, thickness)
  }
}


class IconFrameNode extends FramesNode {
  constructor(diagram: FramesFlowDiagram, parameters: FrameShape) {
    super(diagram, parameters)

    const size = parameters.iconsize ? parameters.iconsize : 0.5
    const color = parameters.iconcolor ? parameters.iconcolor : 'white'

    const iconparams = <FlowLabelParameters>{ text: parameters.icon, isicon: true, size, color }
    const icon = diagram.createLabel(iconparams)
    icon.position.z = 0.001
    icon.updateLabel()

    this.add(icon)
  }
}


class TextureFrameNode extends IconFrameNode {
  constructor(diagram: FramesFlowDiagram, parameters: FrameShape) {
    super(diagram, parameters)

    const material = diagram.getMaterial('geometry', 'texture', 'white')
    const background = material as MeshBasicMaterial
    background.opacity = 1
    background.map = parameters.texture
    background.map.offset.set(0.5, 0.5)
    this.background.material = background
  }
}

class MeshFrameNode extends FramesNode {
  constructor(diagram: FramesFlowDiagram, parameters: FrameShape) {
    super(diagram, parameters)

    const geometry = new TorusKnotGeometry(10, 3, 100, 16);
    const material = new MeshBasicMaterial({ color: 'purple' });
    const torusKnot = new Mesh(geometry, material);
    torusKnot.scale.setScalar(0.02)
    this.add(torusKnot);

    setInterval(() => {
      torusKnot.rotation.y += 0.03
    }, 1000 / 30)
  }
}
