import { AmbientLight, BufferGeometry, CurvePath, LineCurve3, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, SRGBColorSpace, Scene, Shape, ShapeGeometry, Texture, TextureLoader, TorusKnotGeometry, TubeGeometry, Vector3 } from "three";
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
  FlowDiagramOptions,
  RoundedRectangleGeometry,
  RoundedRectangleShape,
  RoundedRectangleBorderGeometry,
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

    const flow = new FramesFlowDiagram({ linestyle: 'straight' })
    scene.add(flow);

    flow.rotation.x = MathUtils.degToRad(-5)

    // make the flow interactive
    const interaction = new FlowInteraction(flow, app.interactive)

    const connectors = new FlowConnectors(flow)

    const start = flow.addNode(<FrameShape>{
      id: 'start', x: -3.5, width: 1.2, height: 1.2,
      content: 'texture', texture: background.clone(), icon: 'image',
      connectors: [
        { id: 'c1start', anchor: 'right', hidden: true }
      ]
    })

    const queue = flow.addNode(<FrameShape>{
      id: 'queue', x: -1.5, width: 1.2, height: 1.2,
      content: 'mesh',
      connectors: [
        { id: 'c1queue', anchor: 'left', hidden: true },
        { id: 'c2queue', anchor: 'top', hidden: true },
        { id: 'c3queue', anchor: 'right', hidden: true },
        { id: 'c4queue', anchor: 'bottom', hidden: true },
      ]
    })

    flow.addEdge({ from: start.name, to: queue.name, fromconnector: 'c1start', toconnector: 'c1queue' })

    const localtask1 = flow.addNode(<FrameShape>{
      id: 'localtask1', x: -1.5, y: 2, width: 1.2, height: 1.2,
      content: 'icon', icon: 'task',
      connectors: [
        { id: 'c1task1', anchor: 'bottom', hidden: true },
        { id: 'c2task1', anchor: 'right', hidden: true },
      ]
    })
    flow.addEdge({ from: queue.name, to: localtask1.name, fromconnector: 'c2queue', toconnector: 'c1task1' })

    const localtask2 = flow.addNode(<FrameShape>{
      id: 'localtask2', x: -1.5, y: -2, width: 1.2, height: 1.2,
      content: 'icon', icon: 'task',
      connectors: [
        { id: 'c1task2', anchor: 'top', hidden: true },
        { id: 'c2task2', anchor: 'right', hidden: true },
      ]
    })
    flow.addEdge({ from: queue.name, to: localtask2.name, fromconnector: 'c4queue', toconnector: 'c1task2' })

    const cloudtask = flow.addNode(<FrameShape>{
      id: 'cloudtask', x: 0.5, width: 1.2, height: 1.2,
      content: 'icon', icon: 'cloud', iconcolor: 'steelblue',
      connectors: [
        { id: 'c1cloud', anchor: 'left', hidden: true },
        { id: 'c2cloud', anchor: 'right', hidden: true },
      ]
    })
    flow.addEdge({ from: queue.name, to: cloudtask.name, fromconnector: 'c3queue', toconnector: 'c1cloud' })

    //
    const file1 = flow.addNode(<FrameShape>{
      id: 'file1', x: 2.5, y: 2, width: 1.2, height: 1.2,
      content: 'icon', icon: 'description',
      connectors: [
        { id: 'c1file1', anchor: 'left', hidden: true },
        { id: 'c2file1', anchor: 'bottom', hidden: true },
      ]
    })
    flow.addEdge({ from: localtask1.name, to: file1.name, fromconnector: 'c2task1', toconnector: 'c1file1' })

    const file2 = flow.addNode(<FrameShape>{
      id: 'file2', x: 2.5, y: -2, width: 1.2, height: 1.2,
      content: 'icon', icon: 'description',
      connectors: [
        { id: 'c1file2', anchor: 'left', hidden: true },
        { id: 'c2file2', anchor: 'top', hidden: true },
      ]
    })
    flow.addEdge({ from: localtask2.name, to: file2.name, fromconnector: 'c2task2', toconnector: 'c1file2' })

    const folder = flow.addNode(<FrameShape>{
      id: 'folder', x: 2.5, width: 1.2, height: 1.2,
      content: 'icon', icon: 'folder', iconcolor: 'gold',
      connectors: [
        { id: 'c1folder', anchor: 'left', hidden: true },
        { id: 'c2folder', anchor: 'top', hidden: true },
        { id: 'c3folder', anchor: 'right', hidden: true },
        { id: 'c4folder', anchor: 'bottom', hidden: true },
      ]
    })
    flow.addEdge({ from: cloudtask.name, to: folder.name, fromconnector: 'c2cloud', toconnector: 'c1folder' })
    flow.addEdge({ from: file1.name, to: folder.name, fromconnector: 'c2file1', toconnector: 'c2folder' })
    flow.addEdge({ from: file2.name, to: folder.name, fromconnector: 'c2file2', toconnector: 'c4folder' })

    const storage = flow.addNode(<FrameShape>{
      id: 'storage', x: 5, width: 2, height: 2,
      content: 'icon', icon: 'storage', iconsize: 1, iconcolor: 'black',
      connectors: [
        { id: 'c1storage', anchor: 'left', hidden: true },
      ]
    })
    flow.addEdge({ from: folder.name, to: storage.name, fromconnector: 'c3folder', toconnector: 'c1storage' })


    this.dispose = () => {
      interaction.dispose()
      orbit.dispose()
    }

  }
}

class FramesFlowDiagram extends FlowDiagram {

  constructor(options?: FlowDiagramOptions) {
    super(options)
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
    edge.material = { color: 'white' }
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

    const geometry = new RoundedRectangleGeometry(this.width - 0.2, this.height - 0.2, 0.1)
    this.geometry.center()
    const back = diagram.getMaterial('geometry', 'background', <MeshBasicMaterialParameters>{
      color: 'white', transparent: true, opacity: 0.2
    }) as MeshBasicMaterial

    const backmesh = new Mesh(geometry, back)
    backmesh.position.z = 0.001
    this.add(backmesh)
    this.background = backmesh

    const border = new RoundedRectangleBorderGeometry(this.width, this.height, 0.1)
    const mesh = new Mesh(border, diagram.getMaterial('geometry', 'border', <MeshBasicMaterialParameters>{ color: 'white' }))
    this.add(mesh)

  }
}

class FramesEdge extends FlowEdge {
  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CurvePath<Vector3>()
    for (let i = 0; i < curvepoints.length - 1; i++) {
      curve.add(new LineCurve3(curvepoints[i], curvepoints[i + 1]))
    }
    return new TubeGeometry(curve, 64, thickness, 4)
  }
}


class IconFrameNode extends FramesNode {
  constructor(diagram: FramesFlowDiagram, parameters: FrameShape) {
    super(diagram, parameters)

    const size = parameters.iconsize ? parameters.iconsize : 0.5
    const material = parameters.iconcolor ? { color: parameters.iconcolor } : { color: 'white' }

    const iconparams = <FlowLabelParameters>{ text: parameters.icon, isicon: true, size, material }
    const icon = diagram.createLabel(iconparams)
    icon.position.z = 0.001
    icon.updateLabel()

    this.add(icon)
  }
}


class TextureFrameNode extends IconFrameNode {
  constructor(diagram: FramesFlowDiagram, parameters: FrameShape) {
    super(diagram, parameters)

    const material = diagram.getMaterial('geometry', 'texture', <MeshBasicMaterialParameters>{ color: 'white' })
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

