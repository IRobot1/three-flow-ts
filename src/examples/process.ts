import { BufferGeometry, CatmullRomCurve3, CircleGeometry, DoubleSide, Material, Mesh, MeshStandardMaterial, PlaneGeometry, PointLight, Scene, Shape, ShapeGeometry, TubeGeometry, Vector3 } from "three";
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
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";
import { MathUtils } from "three/src/math/MathUtils";

type ProcessShapeType = 'circle' | 'rhombus' | 'rect' | 'parallel'
interface ProcessShape extends FlowNodeParameters {
  shape: ProcessShapeType
}

export class ProcessExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 3.5

    const background = new Mesh(new PlaneGeometry(20, 10), new MeshStandardMaterial({ color: '#B4D8D9' }))
    background.receiveShadow = background.castShadow = true
    scene.add(background)

    background.rotation.x = MathUtils.degToRad(-15)

    const light = new PointLight(0xffffff, 20, 25)
    light.position.set(1, 1, 3)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = true;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    const flow = new MyFlowDiagram()
    background.add(flow);
    flow.position.z = 0.3
    

    const connectors = new FlowConnectors(flow)

    const start = flow.addNode(<ProcessShape>{
      x: -4, label: { text: 'Start', size: 0.15, color: 'white' }, shape: 'circle',
      connectors: [
        { id: 'c1start', anchor: 'right', hidden: true }
      ]
    })

    const decision = flow.addNode(<ProcessShape>{
      x: -2, label: { text: 'Decision', size: 0.15, color: 'white' }, shape: 'rhombus',
      connectors: [
        { id: 'c1decision', anchor: 'left', hidden: true, transform: { translate: { x: -0.1 } } },
        { id: 'c2decision', anchor: 'top', hidden: true, transform: { translate: { y: 0.1 } } },
        { id: 'c3decision', anchor: 'right', hidden: true, transform: { translate: { x: 0.1 } } },
        { id: 'c4decision', anchor: 'bottom', hidden: true, transform: { translate: { y: -0.1 } } },
      ]
    })

    flow.addEdge({ v: start.name, w: decision.name, fromconnector: 'c1start', toconnector: 'c1decision' })

    const route1 = flow.addRoute({ x: -2, y: 1, hidden: true })
    flow.addEdge({ v: decision.name, w: route1.name, fromconnector: 'c2decision' })

    const route2 = flow.addRoute({ x: -2, y: -1, hidden: true })
    flow.addEdge({ v: decision.name, w: route2.name, fromconnector: 'c4decision' })

    const process1 = flow.addNode(<ProcessShape>{
      y: 1, height: 0.5, label: { text: 'Process 1', size: 0.15, color: 'white' }, shape: 'rect',
      connectors: [
        { id: 'c1process1', anchor: 'left', hidden: true },
        { id: 'c2process1', anchor: 'right', hidden: true },
      ]
    })

    const process2 = flow.addNode(<ProcessShape>{
      height: 0.5, label: { text: 'Process 2', size: 0.15, color: 'white' }, shape: 'rect',
      connectors: [
        { id: 'c1process2', anchor: 'left', hidden: true },
        { id: 'c2process2', anchor: 'right', hidden: true },
      ]
    })
    flow.addEdge({ v: route1.name, w: process1.name, toconnector: 'c1process1' })
    flow.addEdge({ v: decision.name, w: process2.name, fromconnector: 'c3decision', toconnector: 'c1process2' })

    const process3 = flow.addNode(<ProcessShape>{
      y: -1, height: 0.5, label: { text: 'Process 3', size: 0.15, color: 'white' }, shape: 'rect',
      connectors: [
        { id: 'c1process3', anchor: 'left', hidden: true },
        { id: 'c2process3', anchor: 'right', hidden: true },
      ]
    })
    flow.addEdge({ v: route2.name, w: process3.name, toconnector: 'c1process3' })

    const route3 = flow.addRoute({ x: 2, y: 1, hidden: true })
    flow.addEdge({ v: process1.name, w: route3.name, fromconnector: 'c2process1' })

    const route4 = flow.addRoute({ x: 2, y: -1, hidden: true })
    flow.addEdge({ v: process3.name, w: route4.name, fromconnector: 'c2process3' })

    const action = flow.addNode(<ProcessShape>{
      x: 2, height: 0.5, label: { text: 'Action', size: 0.15, color: 'white' }, shape: 'parallel',
      connectors: [
        { id: 'c1action', anchor: 'left', hidden: true },
        { id: 'c2action', anchor: 'top', hidden: true },
        { id: 'c3action', anchor: 'right', hidden: true },
        { id: 'c4action', anchor: 'bottom', hidden: true },
      ]
    })
    flow.addEdge({ v: process2.name, w: action.name, fromconnector: 'c2process2', toconnector: 'c1action' })
    flow.addEdge({ v: route3.name, w: action.name, toconnector: 'c2action' })
    flow.addEdge({ v: route4.name, w: action.name, toconnector: 'c4action' })

    const end = flow.addNode(<ProcessShape>{
      x: 4, height: 0.5, label: { text: 'End', size: 0.15, color: 'white' }, shape: 'circle',
      connectors: [
        { id: 'c1end', anchor: 'left', hidden: true },
      ]
    })
    flow.addEdge({ v: action.name, w: end.name, fromconnector: 'c3action', toconnector: 'c1end' })


    this.dispose = () => {
      orbit.dispose()
    }

  }
}

class MyFlowDiagram extends FlowDiagram {

  constructor() { super() }

  override createMeshMaterial(purpose: string, color: number | string): Material {
    return new MeshStandardMaterial({ color, side: DoubleSide });
  }

  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }

  override createNode(node: ProcessShape): FlowNode {
    return new ProcessNode(this, node)
  }

  override createEdge(edge: FlowEdgeParameters): FlowEdge {
    return new ProcessEdge(this, edge)
  }
}

class ProcessEdge extends FlowEdge {
  constructor(diagram: MyFlowDiagram, edge: FlowEdgeParameters) {
    edge.color = 'orange'
    super(diagram, edge)
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CatmullRomCurve3(curvepoints);
    return new TubeGeometry(curve, curvepoints.length, thickness)
  }
}

class ProcessNode extends FlowNode {
  constructor(diagram: MyFlowDiagram, parameters: ProcessShape) {
    parameters.color = '#018083'
    super(diagram, parameters)

    const geometry = this.makeGeometry(parameters.shape, parameters.width! + 0.05, parameters.height! + 0.05)
    const mesh = new Mesh(geometry, diagram.getMaterial('geometry', 'border', 'white'))
    mesh.position.z = -0.001
    mesh.castShadow = true
    this.add(mesh)
  }

  override createGeometry(parameters: ProcessShape): BufferGeometry {
    return this.makeGeometry(parameters.shape, parameters.width!, parameters.height!)
  }

  private makeGeometry(shape: ProcessShapeType, width: number, height: number): BufferGeometry {
    let geometry: BufferGeometry
    switch (shape) {
      case 'circle':
        geometry = new CircleGeometry(width / 2)
        break;
      case 'rect':
        geometry = new ShapeGeometry(this.rectangularShape(width, height, 0.1))
        break;
      case 'rhombus':
        geometry = new ShapeGeometry(this.rhombusShape(width, height))
        break;
      case 'parallel':
        geometry = new ShapeGeometry(this.parallelogramShape(width, height))
        break;
    }
    return geometry
  }

  private parallelogramShape(width: number, height: number, offset = 0.1): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    // Outer rectangle
    const shape = new Shape()
      .moveTo(-halfwidth + offset, halfheight)
      .lineTo(halfwidth + offset, halfheight)
      .lineTo(halfwidth - offset, -halfheight)
      .lineTo(-halfwidth - offset, -halfheight)

    return shape
  }

  private rhombusShape(width: number, height: number): Shape {
    const padding = 0.1
    const halfwidth = width / 2 + padding
    const halfheight = halfwidth //height / 2 + padding

    const shape = new Shape()
      .moveTo(0, -halfheight)
      .lineTo(-halfwidth, 0)
      .lineTo(0, halfheight)
      .lineTo(halfwidth, 0)

    return shape
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
