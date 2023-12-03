import { MathUtils, BufferGeometry, CatmullRomCurve3, CircleGeometry, ColorRepresentation, Curve, CurvePath, DoubleSide, LineCurve3, Material, MaterialParameters, Mesh, MeshBasicMaterialParameters, MeshStandardMaterial, Path, PlaneGeometry, Scene, Shape, ShapeGeometry, SpotLight, TubeGeometry, Vector2, Vector3, ExtrudeGeometryOptions, ExtrudeGeometry, AmbientLight, SphereGeometry, MeshBasicMaterial } from "three";
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
  FlowInteraction,
  FlowDiagramOptions,
  FlowEventType,
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import { FlowProperties } from "./flow-properties";

interface PodiumParameters extends FlowNodeParameters {
  icon: string
}

export class PodiumExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 5

    const background = new Mesh(new PlaneGeometry(20, 10), new MeshStandardMaterial({ color: '#FFD900' }))
    background.receiveShadow = true
    scene.add(background)
    background.rotation.x = MathUtils.degToRad(-80)

    const ceiling = new Mesh(new PlaneGeometry(20, 10), new MeshStandardMaterial({ color: '#FFC30D' }))
    ceiling.receiveShadow = true
    background.add(ceiling)
    ceiling.rotation.x = MathUtils.degToRad(90)
    ceiling.position.y = 1 
    ceiling.position.z = 5

    const light = new SpotLight(0xffffff, 200, 20, 5, 1)
    light.position.set(-1, 2.5, 10)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 / 1
    background.add(light)

    const light2 = new SpotLight(0xffffff, 30, 20, 5, 1)
    light2.position.set(-1, -2.5, 5)
    light2.castShadow = true
    light2.shadow.bias = -0.001 // this prevents artifacts
    light2.shadow.mapSize.width = light.shadow.mapSize.height = 512 / 1
    background.add(light2)


    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    const flow = new PodiumFlowDiagram({ gridsize: 0.1})
    background.add(flow);
    flow.position.z = 0.01

    const interaction = new FlowInteraction(flow, app, app.camera)
    const properties = new FlowProperties(flow)

    const connectors = new FlowConnectors(flow)

    const hidden = true

    const Research = flow.addNode(<PodiumParameters>{
      x: -3, label: { text: 'Research', size: 0.15, material: { color: 'black', side:DoubleSide }, },
      icon: 'biotech',
      connectors: [
        { id: 'c1research', anchor: 'right', hidden }
      ]
    })

    const Idea = flow.addNode(<PodiumParameters>{
      x: -1.5, label: { text: 'Idea', size: 0.15, material: { color: 'black', side: DoubleSide }, },
      icon: 'tips_and_updates',
      connectors: [
        { id: 'c1idea', anchor: 'left', hidden },
        { id: 'c2idea', anchor: 'right', hidden },
      ]
    })

    flow.addEdge({ from: Research.name, to: Idea.name, fromconnector: 'c1research', toconnector: 'c1idea' })


    const Planning = flow.addNode(<PodiumParameters>{
      x: 0, label: { text: 'Planning', size: 0.15, material: { color: 'black', side: DoubleSide }, },
      icon: 'checklist',
      connectors: [
        { id: 'c1planning', anchor: 'left', hidden },
        { id: 'c2planning', anchor: 'right', hidden },
      ]
    })
    flow.addEdge({ from: Idea.name, to: Planning.name, fromconnector: 'c2idea', toconnector: 'c1planning' })

    const Time = flow.addNode(<PodiumParameters>{
      x: 1.5, label: { text: 'Time', size: 0.15, material: { color: 'black', side: DoubleSide }, },
      icon: 'schedule',
      connectors: [
        { id: 'c1time', anchor: 'left', hidden },
        { id: 'c2time', anchor: 'right', hidden },
      ]
    })
    flow.addEdge({ from: Planning.name, to: Time.name, fromconnector: 'c2planning', toconnector: 'c1time' })


    const Success = flow.addNode(<PodiumParameters>{
      x: 3, label: { text: 'Success', size: 0.15, material: { color: 'black', side: DoubleSide } },
      icon: 'flag',
      connectors: [
        { id: 'c1success', anchor: 'left', hidden },
      ]
    })
    flow.addEdge({ from: Time.name, to: Success.name, fromconnector: 'c2time', toconnector: 'c1success' })


    this.dispose = () => {
      interaction.dispose()
      properties.dispose()
      orbit.dispose()
    }

  }
}

class PodiumFlowDiagram extends FlowDiagram {

  constructor(options?: FlowDiagramOptions) { super(options) }

  override createMeshMaterial(purpose: string, parameters: MaterialParameters): Material {
    return new MeshStandardMaterial(parameters);
  }

  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }

  override createNode(node: PodiumParameters): FlowNode {
    return new PodiumNode(this, node)
  }

  override createEdge(edge: FlowEdgeParameters): FlowEdge {
    return new PodiumEdge(this, edge)
  }
}

class PodiumEdge extends FlowEdge {
  constructor(diagram: PodiumFlowDiagram, parameters: FlowEdgeParameters) {
    parameters.material = { color: 'orange' }
    parameters.linestyle = 'split'

    super(diagram, parameters)
    this.position.z = 0.5
  }

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CurvePath<Vector3>()
    for (let i = 0; i < curvepoints.length - 1; i++) {
      curve.add(new LineCurve3(curvepoints[i], curvepoints[i + 1]))
    }
    return new TubeGeometry(curve, 64, thickness, 4)
  }
}

class PodiumNode extends FlowNode {
  constructor(diagram: PodiumFlowDiagram, parameters: PodiumParameters) {
    parameters.material = { color: 0xffffff }
    parameters.scalable = parameters.resizable = false 

    // position the label above the podium and rotate to the front
    parameters.labeltransform = { translate: { z: 0.45 }, rotate: { x: 90 } }

    super(diagram, parameters)

    // have the podium cast a shadow
    this.receiveShadow = this.castShadow = true

    // partial transparent sphere
    const sphere = new Mesh()
    sphere.material = diagram.getMaterial('geometry', 'sphere',
      <MeshBasicMaterialParameters>{
        color: '#FFD301', transparent: true, opacity: 0.3, depthWrite: false
      })
    sphere.position.set(0, 0, 0.55)
    sphere.castShadow = true
    this.add(sphere)

    sphere.geometry = new SphereGeometry(0.5)

    const iconparams = <FlowLabelParameters>{
      text: parameters.icon, isicon: true, size: 0.4,
      material: { color: 'black', side:DoubleSide },
    }
    const icon = diagram.createLabel(iconparams)
    icon.material = diagram.getMaterial('geometry', 'icon', iconparams.material!)
    icon.position.set(0, 0, 0.2)
    icon.updateLabel()
    sphere.add(icon) // place inside the sphere
    icon.rotation.x = MathUtils.degToRad(90)

    const subtitle = diagram.createLabel({
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      size: 0.05, wrapwidth: 0.7,
      material: { color: 'black' }, textalign: 'justify'
    })
    subtitle.updateLabel()
    subtitle.position.set(0, 0, -0.25)
    sphere.add(subtitle)
    subtitle.rotation.x = MathUtils.degToRad(90)

    this.addEventListener(FlowEventType.NODE_PROPERTIES, (e: any) => {
      const gui = e.gui as GUI

      if (icon) gui.add<any, any>(icon, 'text').name('Icon').onChange(() => {
        if (icon) icon.updateLabel()
      })
      gui.add<any, any>(icon, 'size', 0.25, 1).name('Icon Size')
      gui.add<any, any>(this.label, 'text').name('Title')
      gui.add<any, any>(this.label, 'size', 0.1, 1).name('Label Size')
      gui.add<any, any>(subtitle, 'text').name('Subtitle Text')
      gui.add<any, any>(this, 'draggable').name('Draggable')
      const folder = gui.addFolder('Shared')
      folder.addColor(icon, 'color').name('Icon Color')
      folder.addColor(this.label, 'color').name('Label Color')
      folder.addColor(sphere.material as MeshBasicMaterial, 'color').name('Sphere Color')
      folder.add<any, any>(sphere.material, 'opacity', 0, 1).name('Sphere Opacity')
      folder.addColor(this, 'color').name('Base Color')

    })

  }


  override createGeometry(parameters: PodiumParameters): BufferGeometry {
    const circleShape = new Shape();
    const radius = 0.5; // radius of the circle
    circleShape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    // Define extrusion settings
    const extrudeSettings = <ExtrudeGeometryOptions>{
      curveSegments: 64,
      depth: 0.15, // extrusion depth
      bevelEnabled: false // no bevel
    };

    // Create an extruded geometry from the circle shape
    return new ExtrudeGeometry(circleShape, extrudeSettings);
  }
}
