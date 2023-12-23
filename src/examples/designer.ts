import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, ExtrudeGeometry, ExtrudeGeometryOptions, FileLoader, Intersection, Material, MaterialParameters, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, MeshStandardMaterial, MeshStandardMaterialParameters, PlaneGeometry, PointLight, PropertyBinding, RingGeometry, Scene, Shape, ShapeGeometry, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

import { ConnectorMesh, DesignerStorage, FlowConnectorParameters, FlowConnectors, FlowDesignerOptions, FlowDiagram, FlowDiagramDesigner, FlowDiagramOptions, FlowEdge, FlowEdgeParameters, FlowEventType, FlowInteraction, FlowLabel, FlowLabelParameters, FlowNode, FlowNodeParameters, InteractiveEventType, NodeConnectors, ThreeInteractive } from "three-flow";

import { ThreeJSApp } from "../app/threejs-app";
import { TroikaFlowLabel } from "./troika-label";
import { AssetViewer, AssetNode } from "./asset-viewer";

export class DesignerExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 2

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
    const designer = new DesignerFlowDiagram(app.interactive, {
      diagram: { linestyle: 'step', lineoffset: 0.1, gridsize: 0.1 },
      title: 'Shape Designer', initialFileName: 'flow-shapes.json'
    })
    scene.add(designer);


    const tablematerial = designer.getMaterial('geometry', 'table', <MeshStandardMaterialParameters>{ color: '#F0CB2A' })

    const tablegeometry = new PlaneGeometry(10, 8)
    const table = new Mesh(tablegeometry, tablematerial)
    scene.add(table)
    table.position.z = - 0.01
    table.receiveShadow = true


    const fileLoader = new FileLoader()
    fileLoader.load(`assets/flow-designer.json`, (data) => {
      const storage = <ShapeStorage>JSON.parse(<string>data)
      designer.loadDesign(storage)
    })

    const width = 0.4

    const cylinderparams: DesignerNodeParameters = {
      x: 1, width, height: width, depth: 0.1,
      type: 'cylinder',
      data: {
        hidden: false
      },
    }

    const cubeparams: DesignerNodeParameters = {
      x: -1, width, height: width, depth: 0.1,
      type: 'cube',
      data: {
        hidden: false
      },
    }

    const assetparams: DesignerNodeParameters = {
      label: { text: 'Assets', material: { color: 'black' }, padding: 0 },
      type: 'asset',
      data: {
        hidden: false
      },
    }

    //requestAnimationFrame(() => {
    const assets = new AssetViewer(app.interactive, designer)

    assets.position.z = 0.01
    assets.createNode = (parameters: DesignerNodeParameters): FlowNode => {
      if (parameters.type == 'asset')
        return new AssetNode(assets, parameters)
      return new ShapeNode(assets, parameters)
    }

    const assetnode = assets.addNode(assetparams) as AssetNode
    assetnode.addAssets([cylinderparams, cubeparams])
    assetnode.position.set(-2, 0.5, 0)

    scene.add(assets)
    //})

    this.dispose = () => {
      designer.dispose()
      assets.dispose()
      orbit.dispose()
    }
  }
}


interface ShapeParameters {
  hidden: boolean
}
interface DesignerNodeParameters extends FlowNodeParameters {
  data: ShapeParameters
}

class ShapeNode extends FlowNode {
  get hideshape() { return !this.solid.visible }
  set hideshape(newvalue: boolean) {
    this.solid.visible = !newvalue
  }

  private solid: Mesh

  constructor(diagram: FlowDiagram, parameters: DesignerNodeParameters) {
    parameters.resizable = parameters.scalable = false
    parameters.material = { color: '#DECAAF' }
    super(diagram, parameters);

    this.castShadow = true

    const material = this.material as MeshBasicMaterial
    material.transparent = true
    material.opacity = 0

    const bordermesh = new Mesh()
    bordermesh.material = diagram.getMaterial('geometry', 'border', <MeshBasicMaterialParameters>{ color: 'black' })
    this.add(bordermesh)
    bordermesh.position.z = 0.001

    const solid = new Mesh()
    solid.material = diagram.getMaterial('geometry', 'border', parameters.material!)
    this.add(solid)
    solid.castShadow = true
    this.solid = solid
    this.solid.visible = !parameters.data.hidden

    const resizeGeometry = () => {
      // add the border
      let geometry
      if (parameters.type == 'cylinder') {
        geometry = new RingGeometry(this.width / 2 - 0.005, this.width / 2 + 0.005, 32)
      }
      else {
        geometry = this.addBorder()
      }

      bordermesh.geometry = geometry

      // add the solid shape
      if (parameters.type == 'cylinder') {
        geometry = this.createCylinder(parameters)
      }
      else {
        geometry = this.createCube(parameters)
      }

      solid.geometry = geometry
    }
    resizeGeometry()

    this.addEventListener(FlowEventType.WIDTH_CHANGED, resizeGeometry)
  }

  private addBorder(): BufferGeometry {
    const r = 0.04
    // add a border around node
    const shape = this.rectangularShape(this.width + 0.01, this.height + 0.01, 0.03)

    const points = this.rectangularShape(this.width - 0.01, this.height - 0.01, 0.02).getPoints();

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


  private createCube(parameters: DesignerNodeParameters): BufferGeometry {
    const geometry = new RoundedBoxGeometry(this.width - 0.04, this.height - 0.04, this.depth, 8, 0.02)
    geometry.translate(0, 0, this.depth / 2)
    return geometry
  }

  // try using Lathe to eliminate artifact
  private createCylinder(parameters: DesignerNodeParameters): BufferGeometry {
    const circleShape = new Shape();
    const radius = this.width / 2 - 0.04
    circleShape.absellipse(0, 0, radius, radius, 0, Math.PI * 2);


    const bevelSize = radius / 20
    // Define extrusion settings
    const extrudeSettings = <ExtrudeGeometryOptions>{
      curveSegments: 32,
      depth: parameters.depth, // extrusion depth
      bevelEnabled: true,
      bevelSize, bevelThickness: bevelSize, bevelSegments: 4

    };

    return new ExtrudeGeometry(circleShape, extrudeSettings);
  }

  // this shape is invisible, but needed for dragging
  override createGeometry(parameters: DesignerNodeParameters): BufferGeometry {
    if (parameters.type == 'cylinder')
      return new CircleGeometry(this.width / 2)
    return super.createGeometry(parameters)
  }
}


class AssetConnector extends ConnectorMesh {
  constructor(diagram: DesignerFlowDiagram, connectors: NodeConnectors, parameters: FlowConnectorParameters) {
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

  override dropCompleted(diagram: DesignerFlowDiagram, start: Vector3, dragIntersects: Array<Intersection>): FlowNode | undefined {
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
  constructor(diagram: DesignerFlowDiagram) {
    super(diagram)
  }

  override createConnector(connectors: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh {
    return new AssetConnector(this.diagram as DesignerFlowDiagram, connectors, parameters)
  }

}


interface DesignerNodeStorage {
  data: ShapeParameters
  id: string
  type: string
  position: { x: number, y: number }
  size: number
}

interface DesignerEdgeStorage {
  from: string, fromconnector: string,
  to: string, toconnector: string
}

interface ShapeStorage extends DesignerStorage {
  nodes: DesignerNodeStorage[],
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



class DesignerFlowDiagram extends FlowDiagramDesigner {
  hideconnectors = true

  override createFlowConnectors() {
    return new DesignerConnectors(this)
  }
  constructor(interactive: ThreeInteractive, options: FlowDesignerOptions) {
    super(interactive, options)

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
      //// dumb way to exclude asset nodes
      //if (index < 3) return // TODO: better solution than this

      this.removeNode(node)
    })
    return this
  }

  override loadDesign(storage: ShapeStorage) {
    storage.nodes.forEach(item => {
      const parameters: DesignerNodeParameters = {
        id: item.id,
        x: item.position.x, y: item.position.y,
        width: item.size, height: item.size, depth: 0.1,
        type: item.type,
        data: item.data
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
      //// dumb way to exclude asset nodes
      //if (index < 3) return // TODO: better solution than this

      const shape = node as ShapeNode
      const parameters = shape.parameters as DesignerNodeParameters

      const nodeparams = <DesignerNodeStorage>{
        id: node.name,
        type: parameters.type,
        data: {
          hidden: shape.hideshape
        },
        position: { x: +node.position.x.toFixed(2), y: +node.position.y.toFixed(2) },
        size: node.width
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
    const newnode = this.addNode(parameters) as ShapeNode
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
      gui.add(newnode, 'hideshape').name('Hide Shape')
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

  override createNode(parameters: DesignerNodeParameters): FlowNode {
    return new ShapeNode(this, parameters)
  }

  override createEdge(parameters: FlowEdgeParameters): FlowEdge {
    return new DesignerEdge(this, parameters)
  }

}

