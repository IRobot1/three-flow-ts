import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, ExtrudeGeometry, ExtrudeGeometryOptions, FileLoader, Intersection, Material, MaterialParameters, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, MeshStandardMaterial, MeshStandardMaterialParameters, PlaneGeometry, PointLight, PropertyBinding, RingGeometry, Scene, Shape, ShapeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

import { ConnectorMesh, FlowConnectorParameters, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowEdgeParameters, FlowEventType, FlowInteraction, FlowLabel, FlowLabelParameters, FlowNode, FlowNodeParameters, InteractiveEventType, NodeConnectors } from "three-flow";

import { ThreeJSApp } from "../app/threejs-app";
import { TroikaFlowLabel } from "./troika-label";
import { FlowProperties } from "./flow-properties";
import { Exporter } from "./export";

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

    const flow = new DesignerFlowDiagram({ linestyle: 'step', lineoffset: 0.1 })
    scene.add(flow);

    const interaction = new FlowInteraction(flow, app, app.camera)

    const tablematerial = flow.getMaterial('geometry', 'table', <MeshStandardMaterialParameters>{ color: '#F0CB2A' })
    const tablegeometry = new PlaneGeometry(10, 8)
    const table = new Mesh(tablegeometry, tablematerial)
    scene.add(table)
    table.position.z = - 0.01
    table.receiveShadow = true

    const radius = 0.2

    const cylinderparams: DesignerNodeParameters = {
      x: 1, width: radius * 2, height: radius * 2, depth: 0.1,
      data: { assettype: 'cylinder', radius, hidden: false },
    }

    const cubeparams: DesignerNodeParameters = {
      x: -1, width: radius * 2, height: radius * 2, depth: 0.1,
      data: { assettype: 'cube', radius: 0.02, hidden: false },
    }

    const assetparams: DesignerNodeParameters = {
      label: { text: 'Assets', material: { color: 'black' }, padding: 0 },
      data: { assettype: 'asset', radius: 0, hidden: false },
    }
    const assets = flow.addNode(assetparams) as AssetNode
    assets.addAssets([cylinderparams, cubeparams])

    this.dispose = () => {
      flow.dispose()
      interaction.dispose()
      orbit.dispose()
    }
  }
}

type ShapeType = 'asset' | 'cylinder' | 'cube'

interface ShapeParameters {
  assettype: ShapeType
  radius: number
  hidden: boolean
}
interface DesignerNodeParameters extends FlowNodeParameters {
  data: ShapeParameters
}

class ShapeNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: DesignerNodeParameters) {
    parameters.resizable = parameters.scalable = false
    parameters.material = { color: '#DECAAF' }
    super(diagram, parameters);

    this.castShadow = true

    const material = this.material as MeshBasicMaterial
    material.transparent = true
    material.opacity = 0

    // add the border
    let geometry
    if (parameters.data.assettype == 'cylinder') {
      geometry = new RingGeometry(parameters.data.radius - 0.005, parameters.data.radius + 0.005, 32)
      this.createCylinder(parameters)
    }
    else {
      geometry = this.addBorder()
      this.createCube(parameters)
    }

    const bordermesh = new Mesh(geometry)
    bordermesh.material = diagram.getMaterial('geometry', 'border', <MeshBasicMaterialParameters>{ color: 'black' })
    this.add(bordermesh)
    bordermesh.position.z = 0.001

    // add the solid shape
    if (parameters.data.assettype == 'cylinder') {
      geometry = this.createCylinder(parameters)
    }
    else {
      geometry = this.createCube(parameters)
    }

    const solid = new Mesh(geometry)
    solid.material = diagram.getMaterial('geometry', 'border', parameters.material!)
    this.add(solid)
    solid.castShadow = true
    solid.visible = !parameters.data.hidden
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
    const geometry = new RoundedBoxGeometry(this.width - 0.04, this.height - 0.04, this.depth, 8, parameters.data.radius)
    geometry.translate(0, 0, this.depth / 2)
    return geometry
  }

  // try using Lathe to eliminate artifact
  private createCylinder(parameters: DesignerNodeParameters): BufferGeometry {
    const circleShape = new Shape();
    const radius = parameters.data.radius - 0.04
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
    if (parameters.data.assettype == 'cylinder')
      return new CircleGeometry(parameters.data.radius)
    return super.createGeometry(parameters)
  }
}

// container for registered asset nodes
class AssetNode extends FlowNode {

  constructor(diagram: FlowDiagram, parameters: FlowNodeParameters) {
    parameters.width = 1
    parameters.height = 0.2
    parameters.z = 0.001
    parameters.resizable = parameters.scalable = false

    super(diagram, parameters);
  }

  addAssets(assetparameters: DesignerNodeParameters[]) {
    const diagram = this.diagram as DesignerFlowDiagram

    const nodes: Array<FlowNode> = []
    const padding = 0.2
    let position = 0

    assetparameters.forEach(parameters => {
      parameters.x = parameters.y = parameters.z = 0
      parameters.draggable = false
      const node = this.diagram.addNode(parameters)
      this.add(node)

      const nodeconnectors = diagram.connectors.addConnectors(node, [
        {
          id: '', anchor: 'center', radius: node.width / 2,
          selectable: true, draggable: true, hidden: true, createOnDrop: false
        },
      ])

      nodes.push(node)
      position += node.height
      node.position.y = -position
      position += padding

      const mesh = nodeconnectors.getConnectors()[0]

      mesh.pointerEnter = (): string => { return 'cell' }

      // override drop complete for the asset to create a new node when dragging
      mesh.dropCompleted = (diagram: DesignerFlowDiagram, start: Vector3): FlowNode | undefined => {
        const parentNode = mesh.parent as FlowNode

        // clone parameters of the template
        const parameters = JSON.parse(JSON.stringify(parentNode.parameters)) as FlowNodeParameters
        parameters.id = undefined
        parameters.x = start.x
        parameters.y = start.y
        parameters.connectors = undefined
        parameters.selectable = parameters.draggable = true
        return diagram.loadShape(parameters)
      }
    })
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
      if (diagram.ctrlKey) {
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
  position: { x: number, y: number }
  size: number
}

interface DesignerEdgeStorage {
  from: string, fromconnector: string,
  to: string, toconnector: string
}

interface DesignerStorage {
  nodes: DesignerNodeStorage[],
  edges: DesignerEdgeStorage[]
}


class DesignerFlowDiagram extends FlowDiagram {
  ctrlKey = false
  connectors: DesignerConnectors
  gui: GUI
  properties :FlowProperties

  override dispose() {
    this.gui.destroy()
    this.properties.dispose()
    super.dispose()
  }

  constructor(options?: FlowDiagramOptions) {
    super(options)

    this.connectors = new DesignerConnectors(this)
    const properties = this.properties = new FlowProperties(this)

    this.addEventListener(FlowEventType.KEY_DOWN, (e: any) => {
      const keyboard = e.keyboard as KeyboardEvent
      this.ctrlKey = keyboard.ctrlKey

      if (!properties.selectedNode) return
      const node = properties.selectedNode as FlowNode

      switch (keyboard.code) {
        case 'Delete':
          // only handle most simple case
          if (this.allNodes.length > 1) {
            this.removeNode(node)
          }
          break;
      }
    })
    this.addEventListener<any>(FlowEventType.KEY_UP, (e: any) => {
      const keyboard = e.keyboard as KeyboardEvent
      this.ctrlKey = keyboard.ctrlKey
    })

    const gui = new GUI();
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '0';
    gui.domElement.style.left = '15px';
    this.gui = gui

    const fileSaver = new Exporter()
    const fileLoader = new FileLoader();

    const params = {
      clear: () => {
        this.allNodes.forEach((node, index) => {
          // dumb way to exclude asset nodes
          if (index < 3) return // TODO: better solution than this

          this.removeNode(node)
        })
      },
      filename: 'flow-designer.json',
      save: () => {
        const storage = this.saveShape()
        fileSaver.saveJSON(storage, params.filename)
      },
      load: () => {
        fileLoader.load(`assets/flow-designer.json`, (data) => {
          params.clear()

          const storage = <DesignerStorage>JSON.parse(<string>data)

          // optionally, iterate over nodes and edges to override parameters before loading

          this.loadFrom(storage)
        });

      }
    }
    gui.add<any, any>(params, 'clear').name('Clear')
    gui.add<any, any>(params, 'filename').name('File name')
    gui.add<any, any>(params, 'save').name('Save')
    gui.add<any, any>(params, 'load').name('Load')
  }

  loadFrom(storage: DesignerStorage) {
    storage.nodes.forEach(item => {
      const parameters: DesignerNodeParameters = {
        id: item.id,
        x: item.position.x, y: item.position.y,
        width: item.size, height: item.size, depth: 0.1,
        data: item.data,
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

  saveShape(): DesignerStorage {
    const storage: DesignerStorage = { nodes: [], edges: [] }
    this.allNodes.forEach((node, index) => {
      // dumb way to exclude asset nodes
      if (index < 3) return // TODO: better solution than this

      const parameters = node.parameters as DesignerNodeParameters

      const nodeparams = <DesignerNodeStorage>{
        id: parameters.id,
        data: parameters.data,
        position: { x: +node.position.x.toFixed(2), y: +node.position.y.toFixed(2) },
        size: parameters.width
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

  loadShape(parameters: FlowNodeParameters): FlowNode {
    const newnode = this.addNode(parameters)

    // get the connectors for the new node
    const newconnectors = this.connectors.hasNode(newnode.name)!
    const hidden = false
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
    if (parameters.data.assettype == 'asset')
      return new AssetNode(this, parameters)
    return new ShapeNode(this, parameters)
  }

}
