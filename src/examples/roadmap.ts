import { AmbientLight, Box3Helper, Color, FileLoader, ImageLoader, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, PlaneGeometry, PointLight, Scene, Texture, TextureLoader, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import { Text } from "troika-three-text";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

import { DesignerStorage, FlowConnectorParameters, FlowDesignerOptions, FlowDiagram, FlowDiagramDesigner, FlowDiagramOptions, FlowEdgeParameters, FlowEventType, FlowInteraction, FlowLabel, FlowNode, FlowNodeParameters, FlowPointer, FlowPointerEventType } from "three-flow";
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

    const flow = new RoadmapDesigner(app.interactive, {
      title: 'Roadmaps',
      initialFileName: 'roadmap.json'
    })

    scene.add(flow);

    const lorumipsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A scelerisque purus semper eget duis at tellus at urna. Lectus magna fringilla urna porttitor rhoncus. Amet facilisis magna etiam tempor orci eu lobortis elementum. Turpis cursus in hac habitasse platea dictumst quisque sagittis. Consectetur adipiscing elit pellentesque habitant morbi tristique. Auctor elit sed vulputate mi. Ipsum consequat nisl vel pretium lectus quam id leo in. Quam adipiscing vitae proin sagittis nisl rhoncus mattis. In ornare quam viverra orci sagittis eu. At in tellus integer feugiat. Accumsan sit amet nulla facilisi morbi tempus iaculis urna id.`

    const eventparams: RoadmapParameters = {
      title: 'Mars Colony',
      subtitle: '2100',
      details: lorumipsum,
      images: ['assets/examples/alchemist.png'],

    }
    flow.addNode(eventparams)

    //const loader = new FileLoader()
    //loader.setResponseType('blob')
    //loader.load('assets/examples/alchemist.png', (image) => {
    //  this.saveImage(image as ArrayBuffer)
    //})

    //this.loadImage().then(texture => {

    //  const plane = new PlaneGeometry()
    //  const material = new MeshBasicMaterial()
    //  const planeMesh = new Mesh(plane, material)
    //  scene.add(planeMesh)
    //  material.map = texture
    //})


    this.dispose = () => {
      orbit.dispose()
    }
  }


  async loadImage(): Promise<Texture> {
    const images = await this.getImages()
    const filehandle = await images.getFileHandle('alchemist.png')
    const file = await filehandle.getFile()
    const url = URL.createObjectURL(file);
    const loader = new TextureLoader()
    return loader.load(url)
  }

  async saveImage(image: ArrayBuffer) {
    const images = await this.getImages()
    const filehandle = await images.getFileHandle('alchemist.png', { create: true })
    // @ts-ignore
    const file = await filehandle.createWritable()
    file.write(image)
    file.close()
  }

  async getImages(): Promise<FileSystemDirectoryHandle> {
    const root = await navigator.storage.getDirectory() as any
    return root.getDirectoryHandle('images', { create: true })
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
      this.labelMesh.dispatchEvent<any>({ type: 'width_changed', width: newvalue })
      this.dispatchEvent<any>({ type: 'width_changed', width: newvalue })
    }
  }

  private textsize = new Vector3()
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
    this.add(label)

    this.position.y += this.maxHeight / 2



  }

  get text() { return this.labelMesh.text }
  set text(newvalue: string) {
    const label = this.labelMesh

    label.text = newvalue

    label.sync(() => {
      label.geometry.computeBoundingBox()
      const box = label.geometry.boundingBox!
      const size = box.getSize(this.textsize)

      this.textHeight = size.y// + this.padding * 2
      this.width = size.x// + this.padding * 2

      this.scroll(0)
      //this.scroll(1)
      //this.scroll(1)
      //this.scroll(1)
      //this.scroll(1)
      //this.scroll(1)
    });
  }

  topY = 0

  scroll(lines: number) {
    let deltaY = this.lineheight * 1.4;
    if (lines < 0)
      deltaY = -deltaY;
    else if (lines == 0)
      deltaY = 0

    if (this.topY + deltaY >= 0 && this.topY + this.maxHeight + deltaY < this.textHeight) {
      this.topY += deltaY;
      this.labelMesh.position.y += deltaY
      const offset = this.topY
      this.labelMesh.clipRect = [
        0,
        -this.maxHeight - offset,
        this.maxWidth,
        -offset,
      ];
    }
  }
}

interface RoadmapEvent {
  title: string
  subtitle?: string
  images: Array<string>
  details: string
}
interface RoadmapParameters extends FlowNodeParameters, RoadmapEvent {
  actions?: ButtonMenuParameters
}

interface RoadmapNodeStorage extends RoadmapEvent {
  id: string
  position: { x: number, y: number }
}
interface RoadmapLinkStorage {
  from: string, //fromconnector: string,
  to: string, //toconnector: string
}

interface RoadmapStorage extends DesignerStorage {
  nodes: RoadmapNodeStorage[],
  edges: RoadmapLinkStorage[]
}
class RoadmapDesigner extends FlowDiagramDesigner {
  textureLoader = new TextureLoader()
  constructor(interactive: FlowPointer, options: FlowDesignerOptions) {
    super(interactive, options)
  }

  override createNode(parameters: RoadmapParameters): FlowNode {
    return new RoadmapNode(this, parameters)
  }

  override loadDesign(storage: RoadmapStorage) {
    storage.nodes.forEach(item => {
      const parameters: RoadmapParameters = {
        id: item.id,
        x: item.position.x, y: item.position.y,
        title: item.title,
        subtitle: item.subtitle,
        images: item.images,
        details: item.details,
      }
      this.loadShape(parameters)
    })

    storage.edges.forEach(item => {
      const parameters: FlowEdgeParameters = {
        from: item.from, to: item.to,
        //fromconnector: item.fromconnector, toconnector: item.toconnector,
        //toarrow: { offset: 0 }
      }
      this.addEdge(parameters)
    })
  }

  loadShape(parameters: FlowNodeParameters): FlowNode {
    const newnode = this.addNode(parameters) as RoadmapNode
    //newnode.minwidth = newnode.minheight = 0.2

    // get the connectors for the new node
    const newconnectors = this.connectors.hasNode(newnode.name)!
    const connectors: Array<FlowConnectorParameters> = [
      { id: `${newnode.name}-left`, anchor: 'left', radius: 0.05, selectable: true, draggable: true },
      //{ id: `${newnode.name}-top`, anchor: 'top', radius: 0.05, selectable: true, draggable: true },
      { id: `${newnode.name}-right`, anchor: 'right', radius: 0.05, selectable: true, draggable: true },
      //{ id: `${newnode.name}-bottom`, anchor: 'bottom', radius: 0.05, selectable: true, draggable: true },
    ]
    connectors.forEach(parameters => {
      newconnectors.addConnector(parameters)
    })

    // listen for request to show node properties
    newnode.addEventListener(FlowEventType.NODE_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${newnode.name} Properties`)

      //gui.add(newnode, 'width', 0.2, 1).name('Size').onChange(() => newnode.height = newnode.width)
      //gui.add(newnode, 'showborder').name('Show Border')
      //gui.add(newnode.label, 'text').name('Label')
      //gui.add(newnode.label, 'hidden').name('Hide Label')
    })

    //this.dispatchEvent<any>({ type: FlowEventType.NODE_SELECTED, node: newnode })
    return newnode
  }

  override saveDesign(): RoadmapStorage {
    const storage: RoadmapStorage = { nodes: [], edges: [] }
    this.allNodes.forEach((node, index) => {
      const shape = node as RoadmapNode
      const parameters = shape.parameters as RoadmapParameters

      const nodeparams = <RoadmapNodeStorage>{
        id: node.name,
        position: { x: +node.position.x.toFixed(2), y: +node.position.y.toFixed(2) },
        title: parameters.title,
        subtitle: parameters.subtitle,
        images: parameters.images,
        details: parameters.details,
      }
      storage.nodes.push(nodeparams)
    })

    this.allEdges.forEach(edge => {
      const parameters = edge.parameters
      const edgeparams = <RoadmapLinkStorage>{
        from: parameters.from, to: parameters.to,
        //fromconnector: parameters.fromconnector, toconnector: parameters.toconnector
      }
      storage.edges.push(edgeparams)
    })
    return storage
  }

  override loadAsset(parameters: FlowNodeParameters): FlowNode {
    return this.loadShape(parameters)
  }
}

class RoadmapNode extends FlowNode implements RoadmapEvent {
  private _title: string
  get title() { return this._title }
  set title(newvalue: string) {
    if (this._title != newvalue) {
      this._title = newvalue
      this.titlelabel.text = newvalue
    }
  }

  private _subtitle: string = ''
  get subtitle() { return this._subtitle }
  set subtitle(newvalue: string) {
    if (this._subtitle != newvalue) {
      this._subtitle = newvalue
      this.subtitlelabel.text = newvalue
    }
  }
  images = [];

  private _details: string = ''
  get details() { return this._details }
  set details(newvalue: string) {
    if (this._details != newvalue) {
      this._details = newvalue
      this.detailslabel.text = newvalue
    }
  }

  private titlelabel: FlowLabel
  private subtitlelabel: FlowLabel
  private detailslabel: TextArea

  private padding: number
  private layout: StackLayout

  constructor(diagram: RoadmapDesigner, parameters: RoadmapParameters) {
    parameters.width = 1
    parameters.resizable = parameters.scalable = false
    super(diagram, parameters);

    const padding = 0.02
    const spacing = 0.02
    const maxWidth = this.width - padding * 2
    this.padding = padding

    const layout = new StackLayout(this, spacing, true, (object: Object3D) => {
      return object.visible && (object.type == 'Mesh')
    })
    this.layout = layout

    const title = new FlowLabel(diagram, { padding, size: 0.07 })
    title.wrapwidth = maxWidth
    this._title = title.text = parameters.title
    this.add(title)
    this.titlelabel = title
    title.position.z = 0.001

    const titindex = layout.monitorObject(title.labelMesh!)
    title.addEventListener(FlowEventType.WIDTH_CHANGED, (e: any) => {
      const x = -(this.width - title.width) / 2
      title.position.x = x

      layout.updateSize(titindex, title.height - padding * 2, title.labelMesh)
      layout.updatePositions()
    })


    const subtitle = new FlowLabel(this.diagram, { padding: this.padding, size: 0.05 })
    subtitle.name = 'subtitle'
    this.add(subtitle)
    subtitle.position.z = 0.001

    const subindex = this.layout.monitorObject(subtitle.labelMesh!)
    subtitle.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
      const x = -(this.width - subtitle.width) / 2
      subtitle.position.x = x

      layout.updateSize(subindex, subtitle.height - padding * 2, subtitle.labelMesh)
      layout.updatePositions()
    })

    this._subtitle = subtitle.text = parameters.subtitle ? parameters.subtitle : ''


    this.subtitlelabel = subtitle

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
    this._details = details.text = parameters.details
    details.position.x = -maxWidth / 2
    details.position.z = 0.001
    this.detailslabel = details

    layout.addObject(details.labelMesh!, detailsheight)

    this.addEventListener('layout_changed', (e: any) => {
      this.height = e.size
    })

    this.addEventListener(FlowEventType.NODE_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${this.name} Properties`)

      gui.add<any, any>(this, 'title').name('Title')
      gui.add<any, any>(this, 'subtitle').name('Sub Title')
      gui.add<any, any>(this, 'details').name('Details')
    })

  }

}
