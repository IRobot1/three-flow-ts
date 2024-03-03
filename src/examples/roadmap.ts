import { AmbientLight, Box3Helper, Color, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, PlaneGeometry, PointLight, Scene, Texture, TextureLoader, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import { Text } from "troika-three-text";

import { FlowDiagram, FlowDiagramOptions, FlowEventType, FlowInteraction, FlowLabel, FlowNode, FlowNodeParameters, FlowPointerEventType } from "three-flow";
import { ButtonMenuParameters } from "three-fluix";
import { ThreeJSApp } from "../app/threejs-app";
import { StackLayout } from "./stack-layout";

export class RoadmapExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 2

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

    const disableRotate = () => { orbit.enableRotate = false }
    const enableRotate = () => { orbit.enableRotate = true }
    app.interactive.addEventListener(FlowPointerEventType.DRAGSTART, disableRotate)
    app.interactive.addEventListener(FlowPointerEventType.DRAGEND, enableRotate)

    //scene.add(new AxesHelper(3))

    const flow = new RoadmapDiagram({})
    scene.add(flow);

    const interaction = new FlowInteraction(flow, app.interactive)

    const lorumipsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A scelerisque purus semper eget duis at tellus at urna. Lectus magna fringilla urna porttitor rhoncus. Amet facilisis magna etiam tempor orci eu lobortis elementum. Turpis cursus in hac habitasse platea dictumst quisque sagittis. Consectetur adipiscing elit pellentesque habitant morbi tristique. Auctor elit sed vulputate mi. Ipsum consequat nisl vel pretium lectus quam id leo in. Quam adipiscing vitae proin sagittis nisl rhoncus mattis. In ornare quam viverra orci sagittis eu. At in tellus integer feugiat. Accumsan sit amet nulla facilisi morbi tempus iaculis urna id.`

    const eventparams: RoadmapParameters = {
      title: 'Mars Colony',
      subtitle: '2100',
      details: lorumipsum,
      images: ['assets/examples/alchemist.png'],

    }
    flow.addNode(eventparams)

    this.dispose = () => {
      interaction.dispose()
      orbit.dispose()
    }
  }
}

// https://protectwise.github.io/troika/troika-three-text/

class TextArea extends Object3D {
  labelMesh: Text
  textHeight = 0
  lineheight: number

  private _width = 0
  get width() { return this._width }
  set width(newvalue: number) {
    if (this._width != newvalue) {
      this._width = newvalue
      this.labelMesh.dispatchEvent<any>({type: 'width_changed', width:newvalue})
      this.dispatchEvent<any>({type: 'width_changed', width:newvalue})
    }
  }

  constructor(private maxWidth: number, private maxHeight = 0.27, fontSize = 0.07) {
    super()
    const label = new Text();
    this.labelMesh = label
    this.lineheight = fontSize

    label.anchorX = 'left'
    label.anchorY = 'top'
    
    label.maxWidth = maxWidth
    label.fontSize = fontSize
    label.color = 'black'
    label.sync();

    label.addEventListener(FlowEventType.LABEL_READY, () => {
      const bounds = label.textRenderInfo.blockBounds;
      this.textHeight = bounds[3] - bounds[1]
      this.width = bounds[2] - bounds[0]

      this.labelMesh.position.y += this.maxHeight/2
      this.scroll(0)
      //this.scroll(1)
      //this.scroll(1)
      //this.scroll(1)
      //this.scroll(1)
      //this.scroll(1)
    })

    this.add(label)
  }

  get text() { return this.labelMesh.text }
  set text(newvalue: string) { this.labelMesh.text = newvalue }

  topY = 0

  scroll(change: number) {
    let deltaY = this.lineheight * 1.4;
    if (change < 0)
      deltaY = -deltaY;
    else if (change == 0)
      deltaY = 0

    if (this.topY + deltaY >= 0 && this.topY + this.maxHeight + deltaY < this.textHeight) {
      this.topY += deltaY;
      this.labelMesh.position.y += deltaY
      const offset = this.topY
      this.labelMesh.clipRect = [
        0,
        -this.maxHeight-offset,
        this.maxWidth,
        -offset,
      ];
    }
  }

}
interface RoadmapParameters extends FlowNodeParameters {
  title: string
  subtitle?: string
  images: Array<string>
  details: string
  actions?: ButtonMenuParameters
}

class RoadmapDiagram extends FlowDiagram {
  textureLoader = new TextureLoader()
  constructor(options: FlowDiagramOptions) {
    super(options)
  }

  override createNode(parameters: RoadmapParameters): FlowNode {
    return new RoadmapNode(this, parameters)
  }

}

class RoadmapNode extends FlowNode {
  constructor(diagram: RoadmapDiagram, parameters: RoadmapParameters) {
    parameters.width = 1
    parameters.resizable = parameters.scalable = false
    super(diagram, parameters);

    const padding = 0.02
    const spacing = 0.02
    const maxWidth = this.width - padding * 2

    const layout = new StackLayout(this, spacing, true, (object: Object3D) => {
      return object.visible && (object.type == 'Mesh')
    })

    const title = new FlowLabel(diagram, { padding, size: 0.07 })
    title.wrapwidth = maxWidth
    title.text = parameters.title
    this.add(title)
    layout.monitorObject(title.labelMesh!)

    title.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
      const x = -(this.width - title.width) / 2
      title.position.set(x, 0, 0.001)
    })

    if (parameters.subtitle) {
      const subtitle = new FlowLabel(diagram, { padding, size: 0.05 })
      subtitle.name = 'subtitle'
      this.add(subtitle)

      subtitle.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
        const x = -(this.width - subtitle.width) / 2
        subtitle.position.set(x, 0, 0.001)
      })
      subtitle.text = parameters.subtitle
      layout.monitorObject(subtitle.labelMesh!)
    }

    const plane = new PlaneGeometry(this.width - padding, this.width - padding)
    const material = diagram.getMaterial('geometry', 'image', <MeshBasicMaterialParameters>{}) as MeshBasicMaterial
    const planeMesh = new Mesh(plane, material)
    planeMesh.name = 'image'
    this.add(planeMesh)
    planeMesh.position.z = 0.001

    const textures: Array<Texture> = []
    parameters.images.forEach((url, index) => {
      textures.push(diagram.textureLoader.load(url))
      if (index == 0)
        material.map = textures[0]
    })

    const buttonheight = 0.12 + padding * 2
    const fontSize = 0.07
    const detailsheight = 0.3

    const details = new TextArea(maxWidth, detailsheight, fontSize)
    this.add(details)
    details.text = parameters.details

    details.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
      const x = -details.width / 2
      details.position.set(x, 0, 0.001)
    })
    layout.addObject(details.labelMesh!, detailsheight)

    this.addEventListener('layout_changed', (e: any) => {
      this.height = e.size
    })

    layout.updatePositions()
  }
}
