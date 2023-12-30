import { AmbientLight, AxesHelper, BoxGeometry, BufferGeometry, CircleGeometry, Clock, Color, Material, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, PointLight, RepeatWrapping, Scene, Shape, TextureLoader, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowEventType ,FlowDiagram, FlowDiagramOptions, FlowEdge, FlowEdgeParameters, FlowInteraction, FlowNode, FlowNodeParameters} from "three-flow";
import { FlowTrack, FlowTracks, TrackItemEventMap } from "./flow-track";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

export class TracksExample {

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

    //scene.add(new AxesHelper(3))

    const diagram = new TrackDiagram({ linestyle: 'bezier' })
    scene.add(diagram);
    //diagram.position.y = 1

    const interaction = new FlowInteraction(diagram, app.interactive)

    // generate a basic track
    const shape = this.rectangularShape(3, 3, 0.5)
    const points = shape.getSpacedPoints(15)
    points.splice(15)// remove the last duplicate point

    // add waypoints to diagram with some random changes
    points.forEach(point => {
      const params: FlowNodeParameters = {
        x: point.x + 0.4 - Math.random(), y: point.y + 0.4 - Math.random(), z: -0.001, width: 0.2, height: 0.2,
        resizable: false, scalable: false, material: { transparent: true, opacity: 0 },
      }
      diagram.addNode(params)
    })

    // connect all the waypoints on the track
    const allnodes = diagram.allNodes
    for (let index = 0; index < allnodes.length; index++) {
      const from = allnodes[index]

      // connect the last to the first
      let nextindex = index + 1
      if (nextindex > allnodes.length - 1) nextindex = 0

      const to = allnodes[nextindex]

      const edgeparams: FlowEdgeParameters = {
        from: from.name, to: to.name, selectable: false,
      }

      diagram.addEdge(edgeparams)
    }

    const manager = new FlowTracks()
    let index = 0
    let edge: FlowEdge

    const section = manager.addTrack({
      points: [], speed: 0.5
    })
    const vehicle = new Vehicle(section, scene)

    // there's actually only 1 section, just change its curve when end of last curve is reached
    vehicle.addEventListener('endReached', (e) => {
      // move to next edge or back to first edge
      if (index++ > diagram.allEdges.length) index = 0
      edge = diagram.allEdges[index]
      // update points to be relative to diagram
      section.points = edge.curvepoints//.map(p => p.clone().add(diagram.position))
      section.start()  // start moving
    })
    scene.add(vehicle)

    // add the vehicle to the track
    section.addItem(vehicle)

    // wait for all edges to get rendered
    requestAnimationFrame(() => {
      // start at first edge
      edge = diagram.allEdges[index]
      section.points = edge.curvepoints
      section.start()
    })


    const clock = new Clock()
    // frame independent updates
    const timer = setInterval(() => {
      manager.updateTracks(clock.getDelta())
    }, 1000 / 30)


    this.dispose = () => {
      diagram.dispose()
      interaction.dispose()
      orbit.dispose()
    }
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

}

class Vehicle extends Mesh<BufferGeometry, Material | Material[], TrackItemEventMap> {
  constructor(belt: FlowTrack, scene: Scene) {
    const geometry = new BoxGeometry(0.1, 0.1, 0.1)
    geometry.translate(0, 0, 0.05)
    const material = new MeshBasicMaterial({ color: 'red' })
    super(geometry, material)

    this.addEventListener('positionUpdated', (e) => {
      this.position.copy(e.position)
    })

  }
}


export type StrokeLineJoin = 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round'
export type StrokeLineCap = 'butt' | 'round' | 'square'

class TrackEdge extends FlowEdge {
  constructor(diagram: TrackDiagram, edge: FlowEdgeParameters) {
    super(diagram, edge)

    requestAnimationFrame(() => {
      // @ts-ignore
      this.selectableObject.material = diagram.roadmaterial
    })
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const lineJoin: StrokeLineJoin = 'miter'
    const lineCap: StrokeLineCap = 'round'
    const style = SVGLoader.getStrokeStyle(thickness * 12, 'black', lineJoin, lineCap)
    return SVGLoader.pointsToStroke(curvepoints.map(v => new Vector2(v.x, v.y)), style)

  }
}

class TrackNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: FlowNodeParameters) {
    parameters.resizable = parameters.scalable = false
    super(diagram, parameters);

    const geometry = new CircleGeometry(0.06)
    const material = diagram.getMaterial('geometry', 'crossing', <MeshBasicMaterialParameters>{ color: 'black' })
    const mesh = new Mesh(geometry, material)
    this.add(mesh)
    mesh.position.z = 0.002 
  }

  override createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new CircleGeometry(0.15)
  }

}
class TrackDiagram extends FlowDiagram {
  constructor(options?: FlowDiagramOptions) {
    super(options)

    const textureLoader = new TextureLoader()
    const road = textureLoader.load('assets/road.png')
    road.wrapS = road.wrapT = RepeatWrapping
    const timer = setInterval(() => {
      road.offset.x -= 0.05
    }, 100)

    this.roadmaterial = this.getMaterial('geometry', 'road', <MeshBasicMaterialParameters>{ color: 'white', map: road, depthTest: false })

    this.addEventListener(FlowEventType.DISPOSE, () => { clearInterval(timer) })
  }

  roadmaterial: Material



  override createEdge(parameters: FlowEdgeParameters): FlowEdge {
    return new TrackEdge(this, parameters)
  }

  override createNode(parameters: FlowNodeParameters): FlowNode {
    return new TrackNode(this, parameters)
  }

}
