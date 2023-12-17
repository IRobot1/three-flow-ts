import { AmbientLight, BufferGeometry, CircleGeometry, Color, ColorRepresentation, CurvePath, DoubleSide, LineCurve3, MathUtils, Mesh, MeshBasicMaterialParameters, MeshStandardMaterial, PlaneGeometry, Scene, Shape, ShapeGeometry, SpotLight, TubeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import {
  FlowConnectorParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowEdge,
  FlowEdgeParameters,
  FlowEventType,
  FlowInteraction,
  FlowLabel,
  FlowLabelParameters,
  FlowNode,
} from "three-flow";
import { ComputerNetworkEdges, ComputerNetworkNodes, ComputerParameters, ComputerStatus } from "./computer-network-data";
import { ThreeJSApp } from "../../app/threejs-app";
import { TroikaFlowLabel } from "../troika-label";
import { DagreLayout } from "../dagre-layout";
import { GraphLabel } from "@dagrejs/dagre";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import { FlowProperties } from "../flow-properties";


export class ComputerNetworkExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 8

    //scene.background = new Color('#E8E8E8')

    //const ambient = new AmbientLight()
    //ambient.intensity = 1
    //scene.add(ambient)

    const background = new Mesh(new PlaneGeometry(20, 20), new MeshStandardMaterial({ color: '#E8E8E8' }))
    background.receiveShadow = true
    scene.add(background)

    const light = new SpotLight(0xffffff, 100, 20, 5, 1)
    light.position.set(-2, 2, 6)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 1
    scene.add(light)


    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    const flow = new ComputerFlowDiagram({ gridsize: 0.1, layout: new DagreLayout() })
    scene.add(flow);
    flow.position.z = 0.15

    const interaction = new FlowInteraction(flow, app, app.camera)
    interaction.resizable = interaction.scalable = false

    const properties = new FlowProperties(flow)

    ComputerNetworkNodes.forEach(node => {
      node.label = { text: node.id }, node.labelanchor = 'top',
        node.labeltransform = { translate: { y: -0.1 } }
    })
    flow.load({ nodes: ComputerNetworkNodes, edges: ComputerNetworkEdges })
    flow.layout(<GraphLabel>{ rankdir: 'TD', ranksep: 0.5, nodesep: 0.5 })

    setInterval(() => {
      flow.allNodes.forEach(node => {
        const parameters = node.parameters as ComputerParameters

        // Randomly decide if each attribute should be updated
        if (parameters.cpu_usage != undefined && Math.random() > 0.5) {
          parameters.cpu_usage = MathUtils.clamp(parameters.cpu_usage! + Math.floor(-10 + Math.random() * 20), 0, 100)
        }
        if (parameters.memory_usage != undefined && Math.random() > 0.5) {
          parameters.memory_usage = MathUtils.clamp(parameters.memory_usage! + Math.floor(-20 + Math.random() * 40), 1, 8192)
        }
        if (parameters.disk_usage != undefined && Math.random() > 0.5) {
          parameters.disk_usage = MathUtils.clamp(parameters.disk_usage! + Math.floor(-0.1 + Math.random() * 0.2), 0, 128)
        }

        node.dispatchEvent<any>({ type: 'update-data' })
      })
    }, 5000);
    this.dispose = () => {
      interaction.dispose()
      properties.dispose()
      orbit.dispose()
    }

  }
}

class ComputerFlowDiagram extends FlowDiagram {

  constructor(options?: FlowDiagramOptions) { super(options) }

  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }

  override createNode(node: ComputerParameters): FlowNode {
    return new ComputerNode(this, node)
  }

  override createEdge(edge: FlowEdgeParameters): FlowEdge {
    return new ComputerEdge(this, edge)
  }
}

class ComputerNode extends FlowNode {

  constructor(diagram: ComputerFlowDiagram, parameters: ComputerParameters) {
    parameters.material = { color: 'lightsteelblue', side: DoubleSide }
    parameters.width = 2
    parameters.resizable = parameters.draggable = parameters.scalable = false

    super(diagram, parameters)

    this.castShadow = true

    const x = -this.width / 2 + 0.6

    let cpu_label: FlowLabel | undefined
    if (parameters.cpu_usage != undefined) {
      const cpu_usage = `CPU: ${parameters.cpu_usage}%`;
      cpu_label = diagram.createLabel({ text: cpu_usage, alignX: 'left' })
      cpu_label.updateLabel()
      cpu_label.position.set(x, 0.15, cpu_label.position.z)
      this.add(cpu_label)
    }

    let memory_label: FlowLabel | undefined
    if (parameters.memory_usage != undefined) {
      const memory_usage = `Memory: ${parameters.memory_usage} MB`;
      memory_label = diagram.createLabel({ text: memory_usage, alignX: 'left' })
      memory_label.updateLabel()
      memory_label.position.set(x, 0, memory_label.position.z)
      this.add(memory_label)
    }

    let disk_label: FlowLabel | undefined
    if (parameters.disk_usage != undefined) {
      const disk_usage = `Disk: ${parameters.disk_usage} GB`;
      disk_label = diagram.createLabel({ text: disk_usage, alignX: 'left' })
      disk_label.updateLabel()
      disk_label.position.set(x, -0.15, disk_label.position.z)
      this.add(disk_label)
    }

    const icon_label = diagram.createLabel({
      text: parameters.icon, isicon: true, size: 0.3,
    })
    icon_label.material = diagram.getMaterial('geometry', 'icon', { color: 'black' } as MeshBasicMaterialParameters)
    icon_label.updateLabel()
    icon_label.position.set(-(this.width) / 2 + 0.3, 0, 0.003)
    this.add(icon_label)

    const lookup: any = {
      'online': diagram.getMaterial('geometry', 'status', <MeshBasicMaterialParameters>{ color: 'green' }),
      'offline': diagram.getMaterial('geometry', 'status', <MeshBasicMaterialParameters>{ color: 'black' }),
      'failure': diagram.getMaterial('geometry', 'status', <MeshBasicMaterialParameters>{ color: 'red' }),
      'maintenance': diagram.getMaterial('geometry', 'status', <MeshBasicMaterialParameters>{ color: 'magenta' }),
      'starting': diagram.getMaterial('geometry', 'status', <MeshBasicMaterialParameters>{ color: 'blue' }),
      'standby': diagram.getMaterial('geometry', 'status', <MeshBasicMaterialParameters>{ color: 'gold' }),
    }
    const status_mesh = new Mesh()
    status_mesh.geometry = new CircleGeometry(0.1)
    status_mesh.material = lookup[parameters.status]
    this.add(status_mesh)
    status_mesh.position.set(this.width / 2 - 0.2, this.height / 2 - 0.2, 0.001)

    //let last_status = parameters.status
    let last_cpu_usage = parameters.cpu_usage
    let last_memory_usage = parameters.memory_usage
    let last_disk_usage = parameters.disk_usage

    this.addEventListener('update-data', () => {
      if (cpu_label && parameters.cpu_usage != last_cpu_usage) {
        cpu_label.text = `CPU: ${parameters.cpu_usage}%`
        last_cpu_usage = parameters.cpu_usage
      }
      if (memory_label && parameters.memory_usage != last_memory_usage) {
        memory_label.text = `Memory: ${parameters.memory_usage} MB`;
        last_memory_usage = parameters.memory_usage
      }
      if (disk_label && parameters.disk_usage != last_disk_usage) {
        disk_label.text = `Disk: ${parameters.disk_usage} GB`;
        last_disk_usage = parameters.disk_usage
      }
    })

    // handle properties display
    this.addEventListener(FlowEventType.NODE_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${this.label.text} Properties`)

      if (icon_label) {
        gui.add<any, any>(icon_label, 'text').name('Icon').onChange(() => {
          if (icon_label) icon_label.updateLabel()
        })
        gui.add<any, any>(icon_label, 'size', 0.25, 1).name('Icon Size')
      }
      gui.add<any, any>(this.label, 'text').name('Title')
      gui.add<any, any>(this.label, 'size', 0.1, 1).name('Title Size')
      const folder = gui.addFolder('Shared')
      folder.addColor(icon_label.material as MeshBasicMaterialParameters, 'color').name('Icon Color')
      folder.addColor(this.label.material as MeshBasicMaterialParameters, 'color').name('Label Color')
      folder.addColor(this.material as MeshBasicMaterialParameters, 'color').name('Base Color')

    })

  }
  timer: any

  override dispose() {
    clearInterval(this.timer)
    super.dispose()
  }

  override createGeometry = (): BufferGeometry => {
    const width = this.width
    const height = this.height
    const radius = 0.3

    const halfwidth = width / 2
    const halfheight = height / 2
    const ctx = new Shape()
      .moveTo(-halfwidth + radius, -halfheight)
      .lineTo(halfwidth - radius, -halfheight)
      .quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius)
      .lineTo(halfwidth, halfheight - radius)
      .quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight)
      .lineTo(-halfwidth + radius, halfheight)
      .quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius)
      .lineTo(-halfwidth, -halfheight + radius)
      .quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight)

    return new ShapeGeometry(ctx);
  }
}

class ComputerEdge extends FlowEdge {
  constructor(diagram: ComputerFlowDiagram, parameters: FlowEdgeParameters) {
    parameters.linestyle = 'step'

    const from = diagram.hasNode(parameters.from)!
    const to = diagram.hasNode(parameters.to)!

    const fromparams = from.parameters as ComputerParameters
    const toparams = to.parameters as ComputerParameters

    const status = fromparams.status + '-' + toparams.status
    //export type ComputerStatus = 'online' | 'offline' | 'failure' | 'maintenance' | 'starting' | 'standby'


    const lookup: any = {
      'online-online': { color: 'white', thickness: 0.01 },
      'online-standby': { color: 'gold', thickness: 0.01 },
      'online-maintenance': { color: 'magenta', thickness: 0.02 },
      'online-failure': { color: 'red', thickness: 0.03 },
      'online-starting': { color: 'blue', thickness: 0.02 },
    }
    let params = lookup[status]
    if (!params) params = { color: 'black', thickness: 0.01 }

    parameters.thickness = params.thickness
    parameters.material = { color: params.color, side: DoubleSide }

    super(diagram, parameters)

    this.position.z = -0.1
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CurvePath<Vector3>()
    for (let i = 0; i < curvepoints.length - 1; i++) {
      curve.add(new LineCurve3(curvepoints[i], curvepoints[i + 1]))
    }
    return new TubeGeometry(curve, 64, thickness, 4)
  }
}

