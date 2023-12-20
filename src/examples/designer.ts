import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, ExtrudeGeometry, ExtrudeGeometryOptions, Material, MaterialParameters, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, MeshStandardMaterial, MeshStandardMaterialParameters, PlaneGeometry, PointLight, RingGeometry, Scene, Shape, ShapeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

import { ThreeJSApp } from "../app/threejs-app";
import { ConnectorMesh, FlowConnectorParameters, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowEventType, FlowInteraction, FlowLabel, FlowLabelParameters, FlowNode, FlowNodeParameters, NodeConnectors } from "three-flow";
import { TroikaFlowLabel } from "./troika-label";
import { FlowProperties } from "./flow-properties";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

export class DesignerExample {

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
    light.position.set(1, 1, 0)
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

    const flow = new DesignerFlowDiagram()
    scene.add(flow);

    const interaction = new FlowInteraction(flow, app, app.camera)
    const connectors = new DesignerConnectors(flow)

    const tablematerial = flow.getMaterial('geometry', 'table', <MeshStandardMaterialParameters>{ color: '#F0CB2A' })
    const tablegeometry = new PlaneGeometry(10, 8)
    const table = new Mesh(tablegeometry, tablematerial)
    scene.add(table)
    table.receiveShadow = true

    const radius = 0.2

    const cylinderparams: ShapeParameters = {
      x: 1, width: radius * 2, height: radius * 2, depth: 0.1,
      data: { assettype: 'cylinder', radius, hidden: false },
    }

    const cubeparams: ShapeParameters = {
      x: -1, width: radius * 2, height: radius * 2, depth: 0.1,
      data: { assettype: 'cube', radius: 0.02, hidden: false },
    }

    const assetparams: ShapeParameters = {
      label: { text: 'Assets', material: { color: 'black' }, padding: 0 },
      data: { assettype: 'asset', radius: 0, hidden: false },
    }
    const assets = flow.addNode(assetparams) as AssetNode
    assets.addAssets([cylinderparams, cubeparams], connectors)

    this.dispose = () => {
      interaction.dispose()
      orbit.dispose()
    }
  }
}

type ShapeType = 'asset' | 'cylinder' | 'cube'

interface ShapeParameters extends FlowNodeParameters {
  data: {
    assettype: ShapeType
    radius: number
    hidden: boolean
  }
}
class ShapeNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: ShapeParameters) {
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


  private createCube(parameters: ShapeParameters): BufferGeometry {
    const geometry = new RoundedBoxGeometry(this.width - 0.04, this.height - 0.04, this.depth, 8, parameters.data.radius)
    geometry.translate(0, 0, this.depth / 2)
    return geometry
  }

  // try using Lathe to eliminate artifact
  private createCylinder(parameters: ShapeParameters): BufferGeometry {
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
  override createGeometry(parameters: ShapeParameters): BufferGeometry {
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

    //const geometry = new PlaneGeometry(1, 3)
    //geometry.translate(0, -1.5 - 0.1,0)
    //const plane = new Mesh(geometry)
    //this.add(plane)
  }

  addAssets(assetparameters: ShapeParameters[], connectors: DesignerConnectors) {
    const nodes: Array<FlowNode> = []
    const padding = 0.2
    let position = 0

    assetparameters.forEach(parameters => {
      parameters.x = parameters.y = parameters.z = 0
      parameters.draggable = false
      const node = this.diagram.addNode(parameters)
      this.add(node)

      connectors.addConnectors(node, [
        {
          id: '', anchor: 'center', radius: node.width / 2,
          selectable: true, draggable: true, hidden: true
        },
      ])

      nodes.push(node)
      position += node.height
      node.position.y = -position
      position += padding
    })
  }
}

class AssetConnector extends ConnectorMesh {
  constructor(diagram: FlowDiagram, connectors: NodeConnectors, parameters: FlowConnectorParameters) {
    super(connectors, parameters)

    // listen for request to show connector properties
    this.addEventListener(FlowEventType.CONNECTOR_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI
      gui.title(`${this.name} Properties`)

    })

  }



  override pointerEnter(): string {
    return 'crosshair'
  }
  override dropCompleted(diagram: DesignerFlowDiagram, start: Vector3): FlowNode | undefined {
    const parentNode = this.parent as FlowNode

    // clone the parameters
    const parameters = JSON.parse(JSON.stringify(parentNode.parameters)) as FlowNodeParameters
    parameters.id = undefined
    parameters.x = start.x
    parameters.y = start.y
    parameters.connectors = undefined
    parameters.selectable = parameters.draggable = true
    const newnode = diagram.addNode(parameters)

    const newconnectors = this.connectors.flowconnectors.hasNode(newnode.name)!
    const hidden = false
    const connectors: Array<FlowConnectorParameters> = [
      { id: `${newnode.name}-left`, anchor: 'left', radius: 0.05, hidden },
      { id: `${newnode.name}-top`, anchor: 'top', radius: 0.05, hidden },
      { id: `${newnode.name}-right`, anchor: 'right', radius: 0.05, hidden },
      { id: `${newnode.name}-bottom`, anchor: 'bottom', radius: 0.05, hidden },
    ]
    connectors.forEach(parameters => {
      newconnectors.addConnector(parameters)
    })

    return newnode
  }
}


class DesignerConnectors extends FlowConnectors {
  constructor(diagram: FlowDiagram) {
    super(diagram)
  }

  override createConnector(connectors: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh {
    parameters.createOnDrop = false
    return new AssetConnector(this.diagram, connectors, parameters)
  }

}
class DesignerFlowDiagram extends FlowDiagram {
  constructor(options?: FlowDiagramOptions) {
    super(options)

    const properties = new FlowProperties(this)

    this.dispose = () => {
      properties.dispose()
      super.dispose()
    }

    this.addEventListener(FlowEventType.KEY_DOWN, (e: any) => {
      const keyboard = e.keyboard as KeyboardEvent
      if (!properties.selectedConnector) return
      const connector = properties.selectedConnector
      const node = connector.connectors.node

      switch (keyboard.code) {
        case 'Delete':
          console.warn('dlete')
          // only handle most simple case
          if (this.allNodes.length > 1) {
            this.removeNode(node)
          }
          break;
      }
    })

  }

  override createMeshMaterial(purpose: string, parameters: MaterialParameters): Material {
    return new MeshStandardMaterial(parameters);
  }

  override createLabel(parameters: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, parameters)
  }

  override createNode(parameters: ShapeParameters): FlowNode {
    if (parameters.data.assettype == 'asset')
      return new AssetNode(this, parameters)
    return new ShapeNode(this, parameters)
  }

}
