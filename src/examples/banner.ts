import { AmbientLight, BufferGeometry, CircleGeometry, Color, CurvePath, DoubleSide, LineCurve3, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, MeshStandardMaterial, PlaneGeometry, Scene, Shape, ShapeGeometry, SpotLight, TubeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import {
  FlowConnectors,
  FlowDiagram,
  FlowDiagramOptions,
  FlowEdge,
  FlowEdgeParameters,
  FlowEventType,
  FlowInteraction,
  FlowLabel,
  FlowLabelParameters,
  FlowNode,
  FlowNodeParameters
} from "three-flow";
import { ThreeJSApp } from "../app/threejs-app";
import { TroikaFlowLabel } from "./troika-label";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import { FlowProperties } from "./flow-properties";

interface BannerParameters extends FlowNodeParameters {
  titleborderheight?: number
  icon: string
  iconsize?: number
  bannermaterial?: MeshBasicMaterialParameters
  bannerheight?: number
  bannerdentsize?: number
}

export class BannerExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 5

    //scene.background = new Color('#E8E8E8')

    //const ambient = new AmbientLight()
    //ambient.intensity = 1
    //scene.add(ambient)

    const background = new Mesh(new PlaneGeometry(20, 20), new MeshStandardMaterial({ color: '#E8E8E8' }))
    background.receiveShadow = background.castShadow = true
    scene.add(background)

    const light = new SpotLight(0xffffff, 100, 20, 5, 1)
    light.position.set(0.5, 0.5, 6)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 / 2
    scene.add(light)


    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    const flow = new BannerFlowDiagram({ gridsize: 0.1 })
    scene.add(flow);
    flow.position.z = 0.3

    const interaction = new FlowInteraction(flow, app, app.camera)
    const properties = new FlowProperties(flow)
    const connectors = new FlowConnectors(flow)

    const hidden = true
    const StepA = flow.addNode(<BannerParameters>{
      id: 'stepA',
      x: -2, label: { text: 'Step A' },
      icon: 'emoji_objects', bannermaterial: { color: '#48BD91' },
      connectors: [
        { id: 'c1stepA', anchor: 'bottom', hidden }
      ]
    })

    const StepB = flow.addNode(<BannerParameters>{
      id: 'stepB',
      x: 0, label: { text: 'Step B' },
      icon: 'power', bannermaterial: { color: '#3CC1CE' },
      connectors: [
        { id: 'c1stepB', anchor: 'bottom', hidden },
      ]
    })

    const StepC = flow.addNode(<BannerParameters>{
      id: 'stepC',
      x: 2, label: { text: 'Step C' },
      icon: 'factory', bannermaterial: { color: '#3F71B7' },
      connectors: [
        { id: 'c1stepC', anchor: 'bottom', hidden },
      ]
    })

    const startparams = <FlowNodeParameters>{
      id: 'start', x: -3, y: -1.5,
      width: 0.3, height: 0.3, hidden,
      connectors: [
        { id: 'start-pin-right', anchor: 'right', hidden },
      ]
    }
    const start = flow.addNode(startparams)

    const endparams = <FlowNodeParameters>{
      id: 'end', x: 3, y: -1.5,
      width: 0.3, height: 0.3, hidden,
      connectors: [
        { id: 'end-pin-left', anchor: 'left', hidden },
      ]
    }
    const end = flow.addNode(endparams)

    // wait for the pins to get created
    requestAnimationFrame(() => {
      let last: FlowNode = start

      // add edges from start, to pins, to end
      flow.allNodes.filter(node => node.name.endsWith('-pin')).forEach(node => {
        const params = { from: last.name, to: node.name, fromconnector: last.name + '-right', toconnector: node.name + '-left' }
        flow.addEdge(params)
        last = node
      })

      flow.addEdge({ from: last.name, to: end.name, fromconnector: last.name + '-right', toconnector: end.name + '-pin-left' })
    })

    this.dispose = () => {
      interaction.dispose()
      properties.dispose()
      orbit.dispose()
    }

  }
}

class BannerFlowDiagram extends FlowDiagram {

  constructor(options?: FlowDiagramOptions) { super(options) }

  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }

  override createNode(node: BannerParameters): FlowNode {
    if (node.label)
      return new BannerNode(this, node)
    return new PinNode(this, node)
  }

  override createEdge(edge: FlowEdgeParameters): FlowEdge {
    return new BannerEdge(this, edge)
  }
}

class BannerNode extends FlowNode {
  constructor(diagram: BannerFlowDiagram, parameters: BannerParameters) {
    parameters.material = <MeshBasicMaterialParameters>{ color: 0xffffff, side: DoubleSide }
    parameters.labelanchor = 'top'
    parameters.label!.size = 0.15
    parameters.label!.material = { color: 'black' }
    parameters.labeltransform = { translate: { y: -0.2, z: 0.002 } }
    parameters.height = 2
    parameters.width = 1.2


    super(diagram, parameters)

    // have the banner cast a shadow
    this.castShadow = true

    const bannerdentsize = parameters.bannerdentsize != undefined ? parameters.bannerdentsize : parameters.height / 20
    const iconsize = parameters.iconsize != undefined ? parameters.iconsize : 0.5
    const iconparams = <FlowLabelParameters>{
      text: parameters.icon, isicon: true, size: iconsize,
      material: { color: 'black' },
    }
    const icon = diagram.createLabel(iconparams)
    icon.material = diagram.getMaterial('geometry', 'icon', iconparams.material!)
    icon.updateLabel()
    this.add(icon)
    icon.position.set(0, (this.height - iconsize) / 4 - bannerdentsize / 2, 0.001)

    const materialparams = parameters.bannermaterial ? parameters.bannermaterial : { color: 'black' }
    const bannermaterial = diagram.getMaterial('geometry', 'banner', materialparams) as MeshStandardMaterial
    const titleborderheight = parameters.titleborderheight ? parameters.titleborderheight : 0.4
    const mesh1 = new Mesh()
    mesh1.material = bannermaterial
    this.add(mesh1)

    const bannerheight = parameters.bannerheight ? parameters.bannerheight : this.height / 2
    const mesh2 = new Mesh()
    mesh2.material = bannermaterial
    this.add(mesh2)

    const subtitle = diagram.createLabel({
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A scelerisque purus semper eget duis at tellus at urna. Lectus magna fringilla urna porttitor rhoncus. Amet facilisis magna etiam tempor orci eu lobortis elementum. Turpis cursus in`,
      size: 0.05, wrapwidth: this.width - 0.2, alignY: 'top',
      material: { color: 'black' }, textalign: 'justify'
    })
    subtitle.updateLabel()
    mesh2.add(subtitle)
    subtitle.position.set(0, bannerheight / 2 - bannerdentsize - 0.1, 0.001)

    // handle changes to width and height
    this.resizeGeometry = () => {
      mesh1.geometry = new PlaneGeometry(this.width, titleborderheight)
      mesh1.position.set(0, (this.height - titleborderheight) / 2, 0.001)

      mesh2.geometry = this.bannerGeometry(bannerheight, bannerdentsize)
      mesh2.position.set(0, (-this.height + bannerheight) / 2, 0.001)

      if (subtitle.wrapwidth != this.width - 0.2) {
        subtitle.wrapwidth = this.width - 0.2
        subtitle.updateLabel()
      }

    }

    // handle properties display
    this.addEventListener(FlowEventType.NODE_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI

      if (icon) gui.add<any, any>(icon, 'text').name('Icon').onChange(() => {
        if (icon) icon.updateLabel()
      })
      gui.add<any, any>(icon, 'size', 0.25, 1).name('Icon Size')
      gui.add<any, any>(this.label, 'text').name('Title')
      gui.add<any, any>(this.label, 'size', 0.1, 1).name('Label Size')
      gui.add<any, any>(subtitle, 'text').name('Subtitle Text')
      gui.add<any, any>(this, 'draggable').name('Draggable')
      const folder = gui.addFolder('Shared')
      folder.addColor(bannermaterial, 'color').name('Banner Color')
      folder.addColor(icon.material as MeshBasicMaterialParameters, 'color').name('Icon Color')
      folder.addColor(this.label.material as MeshBasicMaterialParameters, 'color').name('Label Color')
      folder.addColor(this.material as MeshBasicMaterial, 'color').name('Base Color')

    })


    // need to wait for this node to finish, before adding sub node and edge
    requestAnimationFrame(() => {

      const from = parameters.connectors![0].id
      const pin = from + '-pin'

      const nodeparams = <FlowNodeParameters>{
        id: pin, x: parameters.x, y: -this.height / 2 - 0.5,
        width: 0.3, height: 0.3, lockaspectratio: true,
        connectors: [
          { id: pin + '-top', anchor: 'top', hidden: true },
          { id: pin + '-left', anchor: 'left', hidden: true },
          { id: pin + '-right', anchor: 'right', hidden: true },
        ]
      }
      const node = diagram.addNode(nodeparams)
      node.material = bannermaterial
      node.material.side = DoubleSide

      const edgeparams = <FlowEdgeParameters>{
        from: parameters.id, to: pin,
        fromconnector: from, toconnector: pin + '-top',
        material: { color: 'black' }
      }

      const edge = diagram.addEdge(edgeparams)
    })
  }

  bannerGeometry(bannerheight: number, dentsize: number): BufferGeometry {
    const halfwidth = this.width / 2
    const halfheight = bannerheight / 2

    const shape = new Shape()
      .moveTo(0, halfheight - dentsize)
      .lineTo(halfwidth, halfheight)
      .lineTo(halfwidth, -halfheight)
      .lineTo(-halfwidth, -halfheight)
      .lineTo(-halfwidth, halfheight)

    return new ShapeGeometry(shape)
  }
}

class PinNode extends FlowNode {
  constructor(diagram: BannerFlowDiagram, parameters: BannerParameters) {
    super(diagram, parameters)
    this.castShadow = true
  }

  override createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new CircleGeometry(this.width / 2)
  }
}

class BannerEdge extends FlowEdge {
  constructor(diagram: BannerFlowDiagram, parameters: FlowEdgeParameters) {
    parameters.material = { color: '#484848' }
    parameters.linestyle = 'split'

    super(diagram, parameters)
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CurvePath<Vector3>()
    for (let i = 0; i < curvepoints.length - 1; i++) {
      curve.add(new LineCurve3(curvepoints[i], curvepoints[i + 1]))
    }
    return new TubeGeometry(curve, 64, thickness, 4)
  }
}

