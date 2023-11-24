import { AmbientLight, BufferGeometry, CatmullRomCurve3, CircleGeometry, CylinderGeometry, DoubleSide, ExtrudeGeometry, ExtrudeGeometryOptions, Material, Mesh, MeshStandardMaterial, PlaneGeometry, Scene, Shape, ShapeGeometry, SpotLight, TubeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters,
  FlowNodeParameters,
  FlowDiagram,
  FlowConnectors,
  FlowLabelParameters,
  FlowLabel,
  FlowNode,
  FlowEdge,
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

type PopoutShapeType = 'circle' | 'stadium'
interface PopoutShape extends FlowNodeParameters {
  shape: PopoutShapeType
  extruderadius: number
  extrudedepth: number
  extrudecolor: string
  icon: string
}

interface PopoutGroupParameters {
  color: string
  extrudecolor: string

  Acolor: string
  Aextrudecolor: string
  Bcolor: string
  Bextrudecolor: string
  Ccolor: string
  Cextrudecolor: string
}

export class PopoutExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 3.5

    const background = new Mesh(new PlaneGeometry(20, 10), new MeshStandardMaterial())
    background.receiveShadow = background.castShadow = true
    scene.add(background)

    //const ambient = new AmbientLight()
    //ambient.intensity = 2
    //scene.add(ambient)

    const light = new SpotLight(0xffffff, 30, 20, 5, 1)
    light.position.set(3, 3, 4)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 
    scene.add(light)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = true;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    const flow = new PopoutFlowDiagram()
    background.add(flow);
    flow.position.z = 0.1


    const connectors = new FlowConnectors(flow)

    const top = flow.addNode(<PopoutShape>{
      y: 1, shape: 'circle', color: 'black', extrudecolor: '#545B5B', extruderadius: 0.35, extrudedepth: 0.05,
      icon: 'diversity_3',
      label: {
        text: 'Lorem ipsum dolor sit amet, consectetur', size: 0.05, wrapwidth: 0.5,
        color: 'white',
      },
      labeltransform: { translate: { y: -0.1, z: 0.051 } },
      connectors: [
        { id: 'topleft', anchor: 'left', hidden: true },
        { id: 'topmiddle', anchor: 'bottom', hidden: true },
        { id: 'topright', anchor: 'right', hidden: true },
      ]
    })

    const leftnode = this.addGroup(flow, 'left', -3, 0, {
      color: '#0B86C8', extrudecolor: '#189DE7',
      Acolor: '#72C5E3', Aextrudecolor: '#9FE3FE',
      Bcolor: '#2161B2', Bextrudecolor: '#2F7AD2',
      Ccolor: '#00AAE3', Cextrudecolor: '#3BCEFE',
    })
    const route1 = flow.addRoute({ x: -3, y: 1, color: 'black', hidden: true })
    flow.addEdge({ v: top.name, w: route1.name, fromconnector: 'topleft', color: 'black' })
    flow.addEdge({ v: route1.name, w: leftnode.name, toconnector: 'c1left', color: 'black' })

    const middlenode = this.addGroup(flow, 'middle', 0, 0, {
      color: '#629B3A', extrudecolor: '#71B545',
      Acolor: '#86BD47', Aextrudecolor: '#9FDB5B',
      Bcolor: '#04573F', Bextrudecolor: '#026B4C',
      Ccolor: '#468B3E', Cextrudecolor: '#509D4C',
    })
    flow.addEdge({ v: top.name, w: middlenode.name, fromconnector: 'topmiddle', toconnector: 'c1middle', color: 'black' })

    const rightnode = this.addGroup(flow, 'right', 3, 0, {
      color: '#DC2B27', extrudecolor: '#FF5656',
      Acolor: '#F78646', Aextrudecolor: '#FF9B5D',
      Bcolor: '#9B2643', Bextrudecolor: '#B92D51',
      Ccolor: '#E11F30', Cextrudecolor: '#FD4E59',
    })
    const route2 = flow.addRoute({ x: 3, y: 1, color: 'black', hidden: true })
    flow.addEdge({ v: top.name, w: route2.name, fromconnector: 'topright', color: 'black' })
    flow.addEdge({ v: route2.name, w: rightnode.name, toconnector: 'c1right', color: 'black' })


    this.dispose = () => {
      orbit.dispose()
    }

  }

  addGroup(flow: PopoutFlowDiagram, prefix: string, x: number, y: number, parameters: PopoutGroupParameters): FlowNode {
    const node = flow.addNode(<PopoutShape>{
      x, y, width: 2, height: 0.5, shape: 'stadium',
      label: { text: 'LORUM IPSUM', size: 0.1, color: 'white' },
      labelanchor: 'top',
      labeltransform: { translate: { x: -0.2, y: -0.12 } },
      color: parameters.color, extrudecolor: parameters.extrudecolor,
      connectors: [
        { id: 'c1' + prefix, anchor: 'top', hidden: true },
        { id: 'c2' + prefix, anchor: 'bottom', index: 0, hidden: true },
        { id: 'c3' + prefix, anchor: 'bottom', index: 1, hidden: true },
        { id: 'c4' + prefix, anchor: 'bottom', index: 2, hidden: true },
      ]
    })


    const A = flow.addNode(<PopoutShape>{
      x: x - 0.7, y: y - 1, width: 0.5, height: 0.5, extruderadius: 0.2, extrudedepth: 0.05,
      label: { text: 'A', size: 0.25, color: 'white' },
      labeltransform: { translate: { z: 0.051 } },
      shape: 'circle', color: parameters.Acolor, extrudecolor: parameters.Aextrudecolor,
      connectors: [
        { id: prefix + 'lefttop', anchor: 'top', hidden: true },
      ]
    })
    const leftroute1 = flow.addRoute({ x: x - 0.3, y: y - 0.5, color: 'black', hidden: true })
    const leftroute2 = flow.addRoute({ x: x - 0.7, y: y - 0.5, color: 'black', hidden: true })
    flow.addEdge({ v: node.name, w: leftroute1.name, fromconnector: 'c2' + prefix, color: 'black' })
    flow.addEdge({ v: leftroute1.name, w: leftroute2.name, color: 'black' })
    flow.addEdge({ v: leftroute2.name, w: A.name, toconnector: prefix + 'lefttop', color: 'black' })

    const B = flow.addNode(<PopoutShape>{
      x, y: y - 1, width: 0.5, height: 0.5, extruderadius: 0.2, extrudedepth: 0.05,
      label: { text: 'B', size: 0.25, color: 'white' },
      labeltransform: { translate: { z: 0.051 } },
      shape: 'circle', color: parameters.Bcolor, extrudecolor: parameters.Bextrudecolor,
      connectors: [
        { id: prefix + 'middletop', anchor: 'top', hidden: true },
      ]
    })
    flow.addEdge({ v: node.name, w: B.name, fromconnector: 'c3' + prefix, toconnector: prefix + 'middletop', color: 'black' })

    const C = flow.addNode(<PopoutShape>{
      x: x + 0.7, y: y - 1, width: 0.5, height: 0.5, extruderadius: 0.2, extrudedepth: 0.05,
      label: { text: 'C', size: 0.25, color: 'white' },
      labeltransform: { translate: { z: 0.051 } },
      shape: 'circle', color: parameters.Ccolor, extrudecolor: parameters.Cextrudecolor,
      connectors: [
        { id: prefix + 'rightttop', anchor: 'top', hidden: true },
      ]
    })
    const rightroute1 = flow.addRoute({ x: x + 0.3, y: y - 0.5, color: 'black', hidden: true })
    const rightroute2 = flow.addRoute({ x: x + 0.7, y: y - 0.5, color: 'black', hidden: true })
    flow.addEdge({ v: node.name, w: rightroute1.name, fromconnector: 'c4' + prefix, color: 'black' })
    flow.addEdge({ v: rightroute1.name, w: rightroute2.name, color: 'black' })
    flow.addEdge({ v: rightroute2.name, w: C.name, toconnector: prefix + 'righttop', color: 'black' })

    return node
  }
}

class PopoutFlowDiagram extends FlowDiagram {

  constructor() { super() }

  override createMeshMaterial(purpose: string, color: number | string): Material {
    return new MeshStandardMaterial({ color, side: DoubleSide });
  }

  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }

  override createNode(node: PopoutShape): FlowNode {
    if (node.shape == 'circle')
      return new PopoutCircleNode(this, node)
    else
      return new PopoutStadiumNode(this, node)
  }

}

class PopoutCircleNode extends FlowNode {
  constructor(diagram: PopoutFlowDiagram, parameters: PopoutShape) {
    super(diagram, parameters)

    const mesh = new Mesh(this.createCircle(parameters), diagram.getMaterial('geometry', 'border', parameters.extrudecolor))
    mesh.position.z = 0.001
    mesh.castShadow = true
    this.add(mesh)

    if (parameters.icon) {
      const iconparams = <FlowLabelParameters>{ text: parameters.icon, isicon: true, size: 0.3, color: 'white' }
      const icon = diagram.createLabel(iconparams)
      icon.position.set(0, 0.15, 0.051)
      icon.updateLabel()

      this.add(icon)
    }
  }

  override createGeometry(parameters: PopoutShape): BufferGeometry {
    return new CircleGeometry(this.width / 2, 64)
  }

  createCircle(parameters: PopoutShape): BufferGeometry {
    const circleShape = new Shape();
    const radius = parameters.extruderadius; // radius of the circle
    circleShape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    // Define extrusion settings
    const extrudeSettings = <ExtrudeGeometryOptions>{
      curveSegments: 64,
      depth: parameters.extrudedepth, // extrusion depth
      bevelEnabled: false // no bevel
    };

    return new ExtrudeGeometry(circleShape, extrudeSettings);
  }
}
class PopoutStadiumNode extends FlowNode {
  constructor(diagram: PopoutFlowDiagram, parameters: PopoutShape) {
    super(diagram, parameters)

    const mesh = new Mesh(this.createCircle(parameters), diagram.getMaterial('geometry', 'border', parameters.extrudecolor))
    mesh.position.set(this.width / 2 - 0.3, 0, 0.001)
    mesh.castShadow = true
    this.add(mesh)

    const iconparams = <FlowLabelParameters>{ text: 'person', isicon: true, size: 0.3, color: 'white' }
    const icon = diagram.createLabel(iconparams)
    icon.position.set(0, 0, 0.051)
    icon.updateLabel()
    mesh.add(icon)

    const subtitle = diagram.createLabel({
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
      size: 0.05, wrapwidth: 1,
      color: 'white', textalign: 'justify'
    })
    subtitle.updateLabel()
    subtitle.position.set(-0.2, -0.05, subtitle.position.z)
    this.add(subtitle)


  }

  createCircle(parameters: PopoutShape): BufferGeometry {
    const circleShape = new Shape();
    const radius = 0.2; // radius of the circle
    circleShape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    // Define extrusion settings
    const extrudeSettings = <ExtrudeGeometryOptions>{
      curveSegments: 64,
      depth: 0.05, // extrusion depth
      bevelEnabled: false // no bevel
    };

    // Create an extruded geometry from the circle shape
    return new ExtrudeGeometry(circleShape, extrudeSettings);
  }

  override createGeometry(parameters: PopoutShape): BufferGeometry {
    return new ShapeGeometry(this.stadiumShape(this.width, this.height))
  }

  private stadiumShape(width: number, height: number): Shape {
    var radius = height / 2
    const shape = new Shape()
      .moveTo(-width / 2 + radius, height / 2)
      .absarc(-width / 2 + radius, 0, radius, Math.PI / 2, -Math.PI / 2, false)
      .lineTo(width / 2 - radius, -height / 2)
      .absarc(width / 2 - radius, 0, radius, -Math.PI / 2, Math.PI / 2, false)
      .lineTo(-width / 2 + radius, height / 2)

    return shape
  }
}