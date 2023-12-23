import { AmbientLight, AxesHelper, BufferGeometry, Color, EventDispatcher, Intersection, Material, MaterialParameters, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, MeshStandardMaterial, MeshStandardMaterialParameters, PlaneGeometry, PointLight, RingGeometry, Scene, Shape, Texture, TextureLoader, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

import { AnchorType, ConnectorMesh, DesignerStorage, FlowConnectorParameters, FlowConnectors, FlowDesignerOptions, FlowDiagram, FlowDiagramDesigner, FlowDiagramOptions, FlowEdge, FlowEdgeParameters, FlowEventType, FlowLabel, FlowLabelParameters, FlowNode, FlowNodeParameters, InteractiveEventType, NodeConnectors, ThreeInteractive } from "three-flow";

import { ThreeJSApp } from "../app/threejs-app";
import { TroikaFlowLabel } from "./troika-label";
import { AssetViewerDiagram, AssetViewer } from "./asset-viewer";

const AlchemistEventType = {
  MATERIAL_TEXTURE: 'material_texture',  // set a materials map property with a loaded texture
}

interface AlchemistNodeStorage {
  id: string
  type: string
  showborder: boolean
  ingredienttexture: string
  ingredienttype: string
  label: string
  showlabel: boolean,
  position: { x: number, y: number }
  size: number
}



export class AlchemistExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 4

    scene.background = new Color(0x444444)

    const ambient = new AmbientLight()
    ambient.intensity = 0.6
    scene.add(ambient)

    const light = new PointLight(0xffffff, 2, 100)
    light.position.set(0, 0, 2)
    light.castShadow = true
    //light.shadow.bias = -0.001 // this prevents artifacts
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

    const cache = new TextureCache()

    const designer = new AlchemistRecipeDiagram(app.interactive, cache, {
      diagram: { linestyle: 'step', lineoffset: 0.1, gridsize: 0.1 },
      title: 'Alchemist Recipe', initialFileName: 'alchemist-recipe.json'
    })
    scene.add(designer);

    const textureLoader = new TextureLoader()
    const blankpage = textureLoader.load('assets/blank-page.png')

    const tablematerial = designer.getMaterial('geometry', 'table', <MeshStandardMaterialParameters>{ color: '#F0EBDD', map: blankpage, transparent: true })

    const tablegeometry = new PlaneGeometry(10, 8)
    const table = new Mesh(tablegeometry, tablematerial)
    scene.add(table)
    table.position.z = - 0.01
    table.receiveShadow = true


    //const fileLoader = new FileLoader()
    //fileLoader.load(`assets/flow-recipe.json`, (data) => {
    //  const storage = <ShapeStorage>JSON.parse(<string>data)
    //  designer.loadDesign(storage)
    //})

    const width = 0.4

    const flowers: Array<string> = ['sunflower', 'cranberries', 'poison1', 'poison2', 'starflower']
    const parameters: Array<AlchemistNodeParameters> = []
    flowers.forEach(flower => {
      parameters.push(<AlchemistNodeParameters>{
        x: 1, width, height: width, depth: 0.1,
        type: flower,
        label: { text: flower, hidden: false, },
        ingredienttype: 'flower',
        ingredienttexture: flower
      })
    })


    const assetparams: FlowNodeParameters = {
      label: { text: 'Poisonous Plants', material: { color: 'black' }, padding: 0 },
      type: 'asset',
    }

    //requestAnimationFrame(() => {
    const assets = new AchemistIngredientViewer(app.interactive, designer, cache)
    assets.createAsset = (parameters: AlchemistNodeParameters): FlowNode => {
      return new AlchemistTextureNode(assets, parameters)
    }
    assets.position.z = 0.01

    const assetnode = assets.addNode(assetparams) as AssetViewer
    assetnode.addAssets(parameters)
    assetnode.position.set(-3, 2.5, 0)

    scene.add(assets)
    //})

    this.dispose = () => {
      designer.dispose()
      assets.dispose()
      orbit.dispose()
    }
  }
}

class TextureCache {
  private textureMap = new Map<string, Texture>([])

  private textureLoader = new TextureLoader()

  getTexture(url: string): Texture {
    let texture = this.textureMap.get(url)
    if (!texture) {
      texture = this.textureLoader.load(url)
      this.textureMap.set(url, texture)
    }
    return texture
  }
}

class AchemistIngredientViewer extends AssetViewerDiagram {
  constructor(interactive: ThreeInteractive, designer: FlowDiagramDesigner, cache: TextureCache, options?: FlowDiagramOptions) {
    super(interactive, designer, options)

    this.addEventListener(AlchemistEventType.MATERIAL_TEXTURE, (e: any) => {
      const material = e.material
      const url = e.url
      material.map = cache.getTexture(url)
    })
  }
}

interface AlchemistNodeParameters extends FlowNodeParameters {
  showborder?: boolean
  ingredienttexture: string
  ingredienttype: string
}


class AlchemistTextureNode extends FlowNode {
  private bordermesh: Mesh
  get showborder() { return this.bordermesh.visible }
  set showborder(newvalue: boolean) {
    this.bordermesh.visible = newvalue
  }

  constructor(diagram: FlowDiagram, parameters: AlchemistNodeParameters) {
    parameters.resizable = parameters.scalable = false
    parameters.autogrow = false
    parameters.labelanchor = 'bottom'

    super(diagram, parameters);

    this.castShadow = true

    const material = this.material as MeshBasicMaterial
    material.transparent = true
    diagram.dispatchEvent<any>({ type: AlchemistEventType.MATERIAL_TEXTURE, material, url: `assets/alchemist/plants/${parameters.type}.png` })

    const bordermesh = new Mesh()
    bordermesh.material = diagram.getMaterial('geometry', 'border', <MeshBasicMaterialParameters>{ color: 'black' })
    this.add(bordermesh)
    bordermesh.position.z = 0.001
    this.bordermesh = bordermesh

    this.showborder = parameters.showborder ? parameters.showborder : false

    const resizeGeometry = () => {
      bordermesh.geometry = new RingGeometry(this.width / 2 - 0.01, this.width / 2 + 0.01, 32)
    }
    resizeGeometry()

    this.addEventListener(FlowEventType.WIDTH_CHANGED, resizeGeometry)

  }


  //  // this shape is invisible, but needed for dragging
  //  override createGeometry(parameters: AlchemistNodeParameters): BufferGeometry {
  //    if (parameters.type == 'cylinder')
  //      return new CircleGeometry(this.width / 2)
  //    return super.createGeometry(parameters)
  //  }
}


class AssetConnector extends ConnectorMesh {
  constructor(diagram: AlchemistRecipeDiagram, connectors: NodeConnectors, parameters: FlowConnectorParameters) {
    super(connectors, parameters)

    // listen for request to show connector properties
    this.addEventListener(FlowEventType.CONNECTOR_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${this.name} Properties`)

    })


    this.addEventListener(InteractiveEventType.CLICK, (e: any) => {
      if (diagram.keyboard && diagram.keyboard.ctrlKey) {
        this.dispatchEvent<any>({ type: FlowEventType.EDGE_DELETE })
      }
    })

  }

  override pointerEnter(): string { return 'crosshair' }

  override dropCompleted(diagram: AlchemistRecipeDiagram, start: Vector3, dragIntersects: Array<Intersection>): FlowNode | undefined {
    const intersect = dragIntersects.filter(i => i.object.type == 'flowconnector')
    // ignore unless drop was on top of a connector
    if (!intersect.length) return

    intersect.forEach(intersect => {
      const mesh = intersect.object as ConnectorMesh
      const node = mesh.parent as FlowNode

      const edgeparams: FlowEdgeParameters = {
        from: this.parent!.name, to: node.name, fromconnector: this.name, toconnector: mesh.name
      }
      diagram.addEdge(edgeparams)
    })

    return undefined
  }
}


class DesignerConnectors extends FlowConnectors {
  constructor(diagram: AlchemistRecipeDiagram) {
    super(diagram)
  }

  override createConnector(connectors: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh {
    return new AssetConnector(this.diagram as AlchemistRecipeDiagram, connectors, parameters)
  }

}


interface DesignerEdgeStorage {
  from: string, fromconnector: string,
  to: string, toconnector: string
}

interface ShapeStorage extends DesignerStorage {
  nodes: AlchemistNodeStorage[],
  edges: DesignerEdgeStorage[]
}

export type StrokeLineJoin = 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round'

class DesignerEdge extends FlowEdge {
  constructor(diagram: FlowDiagram, edge: FlowEdgeParameters) {
    if (!edge.material) edge.material = {}
    edge.material.color = 'black'
    super(diagram, edge)
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const lineJoin: StrokeLineJoin = 'miter'
    const style = SVGLoader.getStrokeStyle(thickness, 'black', lineJoin)
    return SVGLoader.pointsToStroke(curvepoints.map(v => new Vector2(v.x, v.y)), style)
  }
}



class AlchemistRecipeDiagram extends FlowDiagramDesigner {
  hideconnectors = true

  override createFlowConnectors() {
    return new DesignerConnectors(this)
  }
  constructor(interactive: ThreeInteractive, cache: TextureCache, options: FlowDesignerOptions) {
    super(interactive, options)

    this.addEventListener(AlchemistEventType.MATERIAL_TEXTURE, (e: any) => {
      const material = e.material
      const url = e.url
      material.map = cache.getTexture(url)
    })

    options.keyboard = {
      'Delete': (keyboard: KeyboardEvent, node?: FlowNode) => {
        if (!node) return
        // only handle most simple case
        if (this.allNodes.length > 1) {
          this.removeNode(node)
        }
      }
    }

    this.addEventListener(FlowEventType.DIAGRAM_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.add<any, any>(this, 'hideconnectors').name('Hide Connectors').onChange(() => {
        this.connectors.allConnectors.forEach(connector => connector.visible = !this.hideconnectors)
      })
    })
  }

  override clear(): this {
    this.allNodes.forEach((node, index) => {
      this.removeNode(node)
    })
    return this
  }

  override loadDesign(storage: ShapeStorage) {
    storage.nodes.forEach(item => {
      const parameters: AlchemistNodeParameters = {
        id: item.id,
        x: item.position.x, y: item.position.y,
        width: item.size, height: item.size, depth: 0.1,
        type: item.type,
        showborder: item.showborder,
        ingredienttexture: item.ingredienttexture,
        ingredienttype: item.ingredienttype,
        label: { text: item.label, hidden: !item.showlabel }
      }
      this.loadShape(parameters)
    })

    storage.edges.forEach(item => {
      const parameters: FlowEdgeParameters = {
        from: item.from, to: item.to,
        fromconnector: item.fromconnector, toconnector: item.toconnector
      }
      this.addEdge(parameters)
    })
  }

  override saveDesign(): ShapeStorage {
    const storage: ShapeStorage = { nodes: [], edges: [] }
    this.allNodes.forEach((node, index) => {
      const shape = node as AlchemistTextureNode
      const parameters = shape.parameters as AlchemistNodeParameters

      const nodeparams = <AlchemistNodeStorage>{
        id: node.name,
        type: parameters.type,
        showborder: parameters.showborder,
        position: { x: +node.position.x.toFixed(2), y: +node.position.y.toFixed(2) },
        size: node.width,
        ingredienttexture: parameters.ingredienttexture,
        ingredienttype: parameters.ingredienttype,
        label: parameters.label!.text,
        showlabel: parameters.label!.hidden
      }
      storage.nodes.push(nodeparams)
    })

    this.allEdges.forEach(edge => {
      const parameters = edge.parameters
      const edgeparams = <DesignerEdgeStorage>{
        from: parameters.from, to: parameters.to,
        fromconnector: parameters.fromconnector, toconnector: parameters.toconnector
      }
      storage.edges.push(edgeparams)
    })
    return storage
  }

  override loadAsset(parameters: FlowNodeParameters): FlowNode {
    return this.loadShape(parameters)
  }

  loadShape(parameters: FlowNodeParameters): FlowNode {
    const newnode = this.addNode(parameters) as AlchemistTextureNode
    newnode.minwidth = newnode.minheight = 0.2

    // get the connectors for the new node
    const newconnectors = this.connectors.hasNode(newnode.name)!
    const hidden = true
    const connectors: Array<FlowConnectorParameters> = [
      { id: `${newnode.name}-left`, anchor: 'left', radius: 0.05, hidden, selectable: true, draggable: true },
      { id: `${newnode.name}-top`, anchor: 'top', radius: 0.05, hidden, selectable: true, draggable: true },
      { id: `${newnode.name}-right`, anchor: 'right', radius: 0.05, hidden, selectable: true, draggable: true },
      { id: `${newnode.name}-bottom`, anchor: 'bottom', radius: 0.05, hidden, selectable: true, draggable: true },
    ]
    connectors.forEach(parameters => {
      newconnectors.addConnector(parameters)
    })

    // listen for request to show node properties
    newnode.addEventListener(FlowEventType.NODE_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${newnode.name} Properties`)

      gui.add(newnode, 'width', 0.2, 1).name('Size').onChange(() => newnode.height = newnode.width)
      //gui.add(newnode, 'showborder').name('Show Border')
      gui.add(newnode.label, 'text').name('Label')
      gui.add(newnode.label, 'hidden').name('Hide Label')
    })

    this.dispatchEvent<any>({ type: FlowEventType.NODE_SELECTED, node: newnode })
    return newnode
  }


  override createMeshMaterial(purpose: string, parameters: MaterialParameters): Material {
    return new MeshStandardMaterial(parameters);
  }

  override createLabel(parameters: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, parameters)
  }

  override createNode(parameters: AlchemistNodeParameters): FlowNode {
    return new AlchemistTextureNode(this, parameters)
  }

  override createEdge(parameters: FlowEdgeParameters): FlowEdge {
    return new DesignerEdge(this, parameters)
  }

}

