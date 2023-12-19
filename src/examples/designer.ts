import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, ExtrudeGeometry, ExtrudeGeometryOptions, Material, MaterialParameters, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, MeshStandardMaterial, MeshStandardMaterialParameters, PlaneGeometry, PointLight, RingGeometry, Scene, Shape, ShapeGeometry } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowInteraction, FlowNode, FlowNodeParameters } from "three-flow";

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
    const connectors = new FlowConnectors(flow)

    const tablematerial = flow.getMaterial('geometry', 'table', <MeshStandardMaterialParameters>{ color: '#F0CB2A' })
    const tablegeometry = new PlaneGeometry(10, 8)
    const table = new Mesh(tablegeometry, tablematerial)
    scene.add(table)
    table.receiveShadow = true

    const radius = 0.2
    const connectorhidden = false

    const cylinderparams: ShapeParameters = {
      x: 1, width: radius * 2, height: radius * 2, depth: 0.1, 
      data: { assettype: 'cylinder', radius, hidden: false },
      connectors: [
        { id: 'cylinder-left', anchor: 'left', radius: 0.05, hidden: connectorhidden },
        { id: 'cylinder-top', anchor: 'top', radius: 0.05, hidden: connectorhidden },
        { id: 'cylinder-right', anchor: 'right', radius: 0.05, hidden: connectorhidden },
        { id: 'cylinder-bottom', anchor: 'bottom', radius: 0.05, hidden: connectorhidden },
      ]
    }
    flow.addNode(cylinderparams)

    const cubeparams: ShapeParameters = {
      x: -1, width: radius * 2, height: radius * 2, depth: 0.1,
      data: { assettype: 'cube', radius: 0.02, hidden: true },
      connectors: [
        { id: 'cube-left', anchor: 'left', radius: 0.05, hidden: connectorhidden },
        { id: 'cube-top', anchor: 'top', radius: 0.05, hidden: connectorhidden },
        { id: 'cube-right', anchor: 'right', radius: 0.05, hidden: connectorhidden },
        { id: 'cube-bottom', anchor: 'bottom', radius: 0.05, hidden: connectorhidden },
      ]
    }
    flow.addNode(cubeparams)

    this.dispose = () => {
      orbit.dispose()
    }
  }
}

type ShapeType = 'cylinder' | 'cube'

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

  // this create the solid shape
  createShape(parameters: ShapeParameters): BufferGeometry {
    if (parameters.data.assettype == 'cylinder') {
      return this.createCylinder(parameters)
    }
    return this.createCube(parameters)
  }

  // this shape is invisible, but needed for dragging
  override createGeometry(parameters: ShapeParameters): BufferGeometry {
    if (parameters.data.assettype == 'cylinder')
      return new CircleGeometry(parameters.data.radius)
    return super.createGeometry(parameters)
  }
}

class DesignerFlowDiagram extends FlowDiagram {
  constructor(options?: FlowDiagramOptions) {
    super(options)
  }

  override createMeshMaterial(purpose: string, parameters: MaterialParameters): Material {
    return new MeshStandardMaterial(parameters);
  }

  override createNode(parameters: ShapeParameters): FlowNode {
    return new ShapeNode(this, parameters)
  }

}
