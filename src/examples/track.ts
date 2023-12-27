import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, CurvePath, LineCurve3, Material, MeshBasicMaterialParameters, PointLight, Scene, TextureLoader, TubeGeometry, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowEdge, FlowEdgeParameters, FlowNode, FlowNodeParameters } from "three-flow";
import { FlowTrack, FlowTracks } from "./flow-track";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { MathUtils } from "three/src/math/MathUtils";
import { LineMaterialParameters } from "three/examples/jsm/lines/LineMaterial";

type TrackNodeType = 'spawner' | 'destroy'

interface TrackNodeParameters extends FlowNodeParameters {
  nodetype: TrackNodeType
}

interface SpawnNodeParameters extends TrackNodeParameters {
  rate: number
}


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

    const connectors = new FlowConnectors(diagram)

    const spawnerparams: SpawnNodeParameters = {
      nodetype: 'spawner',
      x: -1, y: 1, z: -0.001, width: 0.2, height: 0.2,
      rate: 1,
      connectors: [
        { id: '', anchor: 'center', material: { color: 'green' }, transform: { translate: { z: 0.001 } } },
      ]
    }
    const spawner = diagram.addNode(spawnerparams)

    const destroyerparams: TrackNodeParameters = {
      nodetype: 'destroy',
      x: 1, y: 1, z: -0.001, width: 0.2, height: 0.2,
      connectors: [
        { id: '', anchor: 'center', material: { color: 'red' }, transform: { translate: { z: 0.001 } } },
      ]
    }
    const destroyer = diagram.addNode(destroyerparams)

    const tracks = new FlowTracks()
    //diagram.add(tracks)

    const edgeparams: FlowEdgeParameters = {
      from: spawner.name, to: destroyer.name, fromconnector: spawnerparams.connectors![0].id, toconnector: destroyerparams.connectors![0].id,
      material: <LineMaterialParameters>{ color: 0x000000 }
    }

    diagram.addEdge(edgeparams)

    this.dispose = () => {
      orbit.dispose()
    }
  }
}

class SpawnerNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: FlowNodeParameters) {
    super(diagram, parameters);
  }

  override createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new CircleGeometry(this.width)
  }

}

class DestroyerNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: FlowNodeParameters) {
    super(diagram, parameters);
  }

  override createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new CircleGeometry(this.width)
  }

}

export type StrokeLineJoin = 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round'
export type StrokeLineCap = 'butt' | 'round' | 'square'

class TrackEdge extends FlowEdge {
  constructor(diagram: TrackDiagram, edge: FlowEdgeParameters) {
    super(diagram, edge)

    //  requestAnimationFrame(() => {
    //    // @ts-ignore
    //    this.selectableObject.material = diagram.roadmaterial
    //  })
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const lineJoin: StrokeLineJoin = 'miter'
    const lineCap: StrokeLineCap = 'butt'
    const style = SVGLoader.getStrokeStyle(thickness * 12, 'black', lineJoin, lineCap)
    return SVGLoader.pointsToStroke(curvepoints.map(v => new Vector2(v.x, v.y)), style)

  }
}

class TrackDiagram extends FlowDiagram {
  constructor(options?: FlowDiagramOptions) {
    super(options)

    //const textureLoader = new TextureLoader()
    //const road = textureLoader.load('assets/road.png')

    //this.roadmaterial = this.getMaterial('geometry', 'road', <MeshBasicMaterialParameters>{ color: 'white', map: road, wireframe:false })

  }

  //roadmaterial: Material

  override createNode(parameters: TrackNodeParameters): FlowNode {
    switch (parameters.nodetype) {
      case 'spawner':
        return new SpawnerNode(this, parameters);
      case 'destroy':
        return new DestroyerNode(this, parameters);
      default:
        return new FlowNode(this, parameters)
    }
  }

  override createEdge(parameters: FlowEdgeParameters): FlowEdge {
    return new TrackEdge(this, parameters)
  }

}
