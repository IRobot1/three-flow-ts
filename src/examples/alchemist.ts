import { AmbientLight, AxesHelper, BoxGeometry, BufferGeometry, CircleGeometry, Color, FileLoader, Intersection, LinearFilter, Material, MaterialParameters, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, MeshStandardMaterial, MeshStandardMaterialParameters, PlaneGeometry, PointLight, RingGeometry, Scene, Texture, TextureLoader, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

import { ConnectorMesh, DesignerStorage, FlowConnectorParameters, FlowConnectors, FlowDesignerOptions, FlowDiagram, FlowDiagramDesigner, FlowDiagramOptions, FlowEdge, FlowEdgeParameters, FlowEventType, FlowLabel, FlowLabelParameters, FlowNode, FlowNodeParameters, FlowPointerEventType, NodeConnectors, FlowPointer } from "three-flow";

import { ThreeJSApp } from "../app/threejs-app";

import { AssetViewerDiagram, AssetViewer } from "./asset-viewer";
import { FlowMaterials } from "three-flow";

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

interface AlchemistNodeParameters extends FlowNodeParameters {
  showborder?: boolean
  ingredienttexture: string
  ingredienttype: string
}


export class AlchemistExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    //app.enableVR() - not working well

    scene.background = new Color(0x444444)

    const ambient = new AmbientLight()
    ambient.intensity = 0.6
    scene.add(ambient)

    const light = new PointLight(0xffffff, 2, 100)
    light.position.set(0, 0, 2)
    scene.add(light)

    app.camera.position.set(0.013345295270752611, 1.200363663156926, 0.6082108650792649 - 1)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, 0.8, -1.1)
    orbit.enableRotate = false;
    orbit.update();
    //orbit.addEventListener('change', (e: any) => {
    //  console.warn(app.camera.position)
    //})

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    // scene.add(new AxesHelper(3))

    const floor = new Mesh(new CircleGeometry(3), new MeshStandardMaterial({ color: '#666' }))
    scene.add(floor)
    floor.rotation.x = MathUtils.degToRad(-90)
    floor.receiveShadow = true


    const table = new Mesh(new BoxGeometry(2, 0.1, 1), new MeshStandardMaterial({ color: '#6F6454' }))
    scene.add(table)
    table.position.y = 0.93
    table.position.z = -1
    table.rotation.x = MathUtils.degToRad(45)

    const cache = new TextureCache()

    const designer = new AlchemistRecipeDiagram(app.interactive, cache, {
      diagram: { linestyle: 'step', lineoffset: 0.1, gridsize: 0.1, materialCache : new AlchemistMaterials() },
      title: 'Alchemist Recipe', initialFileName: 'alchemist-recipe.json'
    })
    table.add(designer);
    designer.rotation.x = MathUtils.degToRad(-90)
    designer.scale.setScalar(0.1)
    designer.position.y = 0.06
    // designer .position.z = 0.1

    const textureLoader = new TextureLoader()
    const blankpage = textureLoader.load('assets/blank-page.png')

    const pagematerial = designer.getMaterial('geometry', 'table', <MeshStandardMaterialParameters>{ color: 'white', map: blankpage, transparent: true, opacity: 0.99 })

    const pagegeometry = new PlaneGeometry(10, 8)
    const page = new Mesh(pagegeometry, pagematerial)
    designer.add(page)
    page.position.z = - 0.01
    page.receiveShadow = true

    const width = 0.4

    //requestAnimationFrame(() => {
    const assets = new AchemistIngredientViewer(app.interactive, designer, cache)
    assets.createAsset = (parameters: AlchemistNodeParameters): FlowNode => {
      return new AlchemistTextureNode(assets, parameters)
    }
    assets.position.z = 0.005
    designer.add(assets)

    const loadTextures = (items: Array<string>, path: string, type: string, title: string, x: number, y: number) => {
      const assetparams: FlowNodeParameters = {
        label: { text: title, material: { color: 'black' }, padding: 0 },
        type: 'asset', material: { color: 'white' }
      }

      const assetnode = assets.addNode(assetparams) as AssetViewer
      assetnode.position.set(x, y, 0.001)

      const parameters: Array<AlchemistNodeParameters> = []
      items.forEach(item => {
        parameters.push(<AlchemistNodeParameters>{
          x: 1, width, height: width, depth: 0.1,
          type: item, material: { color: 'white' },
          label: { text: item, hidden: false, },
          ingredienttype: type,
          ingredienttexture: `assets/${path}/${item}.png`
        })
      })

      assetnode.addAssets(parameters)
    }

    const row1 = 3.5
    const row2 = -0.5

    const flowers: Array<string> = ['sunflower', 'cranberries', 'poison1', 'poison2', 'starflower']
    loadTextures(flowers, 'alchemist/plants', 'flowers', 'Poisonous Plants', 5.1, row1)

    const apparatus: Array<string> = [
      'beaker', 'bottle', 'bowl', 'bowl2', 'cork-flask', 'distiller1', 'distiller2',
      'distiller3', 'dripper', 'flask-stand', 'flask1', 'flask2', 'flat-beaker', 'pestal',
      'round-beaker', 'scales', 'tall-pestal', 'tin', 'tiny-bottle', 'tube-rack', 'urn1', 'urn2', 'warmer'
    ]
    loadTextures(apparatus, 'alchemist/apparatus', 'apparatus', 'Apparatus', 4, row1)

    const creatures: Array<string> = ['dragon1', 'dragon2', 'dragon3', 'griffin1', 'griffin2',]
    loadTextures(creatures, 'alchemist/art/creatures', 'creatures', 'Mythical Creatures', -4.1, row1)

    const symbols: Array<string> = ['symbol1', 'symbol2', 'symbol3', 'symbol4', 'symbol5', 'symbol6',]
    loadTextures(symbols, 'alchemist/art/symbols', 'symbols', 'Symbols', -5.3, row1)

    const bottles: Array<string> = ['bottle1', 'bottle2', 'bottle3', 'bottle4', 'bottle5', 'bottle6',]
    loadTextures(bottles, 'alchemist/bottles', 'bottles', 'Bottles', -6.4, row1)

    const crystals: Array<string> = ['crystal1', 'crystal2', 'crystal3', 'crystal4', 'crystal5',]
    loadTextures(crystals, 'alchemist/crystals', 'crystals', 'Crystals', -7.5, row1)

    const gems: Array<string> = ['gem1', 'gem2', 'gem3', 'gem4', 'gem5',]
    loadTextures(gems, 'alchemist/gems', 'gems', 'Gems', -4.1, row2)

    const mushrooms: Array<string> = ['mushroom1', 'mushroom2', 'mushroom3', 'mushroom4', 'mushroom5', 'mushroom6',]
    loadTextures(mushrooms, 'alchemist/mushrooms', 'mushrooms', 'Mushrooms', -5.2, row2)

    const mythicalplants: Array<string> = ['plant1', 'plant2', 'plant3', 'plant4', 'plant5', 'plant6',]
    loadTextures(mythicalplants, 'alchemist/mythical plants', 'mythicalplants', 'Mythical Plants', -6.3, row2)

    //})

    const fileLoader = new FileLoader()
    fileLoader.load(`assets/alchemist-recipe.json`, (data) => {
      const storage = JSON.parse(<string>data)
      designer.loadDesign(storage)
    })


    this.dispose = () => {
      //app.disableVR()
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
  constructor(interactive: FlowPointer, designer: FlowDiagramDesigner, cache: TextureCache, options?: FlowDiagramOptions) {
    super(interactive, designer, options)

    this.addEventListener(AlchemistEventType.MATERIAL_TEXTURE, (e: any) => {
      const material = e.material
      const url = e.url
      material.map = cache.getTexture(url)
    })
  }
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
    parameters.z = 0.001
    super(diagram, parameters);

    const material = this.material as MeshBasicMaterial
    material.transparent = true
    this.renderOrder = 1

    diagram.dispatchEvent<any>({ type: AlchemistEventType.MATERIAL_TEXTURE, material, url: parameters.ingredienttexture })

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

}


class AssetConnector extends ConnectorMesh {
  constructor(diagram: AlchemistRecipeDiagram, connectors: NodeConnectors, parameters: FlowConnectorParameters) {
    super(connectors, parameters)

    // listen for request to show connector properties
    this.addEventListener(FlowEventType.CONNECTOR_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${this.name} Properties`)

    })


    this.addEventListener(FlowPointerEventType.CLICK, (e: any) => {
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
        from: this.parent!.name, to: node.name, fromconnector: this.name, toconnector: mesh.name,
        toarrow: { offset: 0 }
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


interface RecipeStepStorage {
  from: string, fromconnector: string,
  to: string, toconnector: string
}

interface RecipeStorage extends DesignerStorage {
  nodes: AlchemistNodeStorage[],
  edges: RecipeStepStorage[]
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

class AlchemistMaterials extends FlowMaterials {

  override createMeshMaterial(parameters: MaterialParameters): Material {
    return new MeshStandardMaterial(parameters);
  }
}

class AlchemistRecipeDiagram extends FlowDiagramDesigner {
  hideconnectors = true

  override createFlowConnectors() {
    return new DesignerConnectors(this)
  }
  constructor(interactive: FlowPointer, cache: TextureCache, options: FlowDesignerOptions) {
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

  override loadDesign(storage: RecipeStorage) {
    storage.nodes.forEach(item => {
      const parameters: AlchemistNodeParameters = {
        id: item.id,
        x: item.position.x, y: item.position.y,
        width: item.size, height: item.size, depth: 0.1,
        type: item.type, material: { color: 'white' },
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
        fromconnector: item.fromconnector, toconnector: item.toconnector,
        toarrow: { offset: 0 }
      }
      this.addEdge(parameters)
    })
  }

  override saveDesign(): RecipeStorage {
    const storage: RecipeStorage = { nodes: [], edges: [] }
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
        label: node.label!.text,
        showlabel: !node.label!.hidden
      }
      storage.nodes.push(nodeparams)
    })

    this.allEdges.forEach(edge => {
      const parameters = edge.parameters
      const edgeparams = <RecipeStepStorage>{
        from: parameters.from, to: parameters.to,
        fromconnector: parameters.fromconnector, toconnector: parameters.toconnector
      }
      storage.edges.push(edgeparams)
    })
    return storage
  }

  override loadAsset(parameters: FlowNodeParameters): FlowNode {
    parameters.label!.hidden = true
    return this.loadShape(parameters)
  }

  loadShape(parameters: FlowNodeParameters): FlowNode {
    const newnode = this.addNode(parameters) as AlchemistTextureNode
    newnode.minwidth = newnode.minheight = 0.2

    // get the connectors for the new node
    const newconnectors = this.connectors.hasNode(newnode.name)!
    const connectors: Array<FlowConnectorParameters> = [
      { id: `${newnode.name}-left`, anchor: 'left', radius: 0.05, hidden: this.hideconnectors, selectable: true, draggable: true },
      { id: `${newnode.name}-top`, anchor: 'top', radius: 0.05, hidden: this.hideconnectors, selectable: true, draggable: true },
      { id: `${newnode.name}-right`, anchor: 'right', radius: 0.05, hidden: this.hideconnectors, selectable: true, draggable: true },
      { id: `${newnode.name}-bottom`, anchor: 'bottom', radius: 0.05, hidden: this.hideconnectors, selectable: true, draggable: true },
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
      if (newnode.label) {
        gui.add(newnode.label, 'text').name('Label')
        gui.add(newnode.label, 'hidden').name('Hide Label')
      }
    })

    this.dispatchEvent<any>({ type: FlowEventType.NODE_SELECTED, node: newnode })
    return newnode
  }

  override createNode(parameters: AlchemistNodeParameters): FlowNode {
    return new AlchemistTextureNode(this, parameters)
  }

  override createEdge(parameters: FlowEdgeParameters): FlowEdge {
    return new DesignerEdge(this, parameters)
  }

}

