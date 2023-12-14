import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, MeshBasicMaterial, MeshBasicMaterialParameters, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters, FlowRoute,
  FlowNodeParameters,
  FlowConnectorParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowDiagramParameters,
  FlowInteraction,
  FlowConnectors,
  ConnectorMesh,
  InteractiveEventType,
  FlowNode, FlowEdge, FlowEventType, FlowRouteParameters, FlowLabelParameters, FlowLabel, NodeConnectors
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

export class MindmapExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 3

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


    let interaction: FlowInteraction

    const options: FlowDiagramOptions = {
      gridsize: 0.3,
    }

    const hidden = false

    // read-only flow
    const flow = new FlowDiagram(options)
    scene.add(flow);
    //flow.position.y = 1

    // make the flow interactive
    interaction = new FlowInteraction(flow, app, app.camera)
    const connectors = new FlowConnectors(flow)

    flow.createLabel = (parameters: FlowLabelParameters): FlowLabel => { return new TroikaFlowLabel(flow, parameters) }



    // for a specific node, override connector shape based on parameters

    connectors.createConnector = (connectors1: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh => {
      const mesh = new ConnectorMesh(connectors1, parameters)

      const original = (mesh.material as MeshBasicMaterial).clone()
      const white = flow.getMaterial('geometry', 'drag-enter', <MeshBasicMaterialParameters>{ color: 'white' })
      mesh.pointerEnter = (): string | undefined => {
        mesh.material = white
        return undefined
      }
      mesh.pointerLeave = () => {
        mesh.material = original
      }
      //mesh.dragStarting = (diagram: FlowDiagram, start: Vector3): FlowRoute => {
      //  return diagram.addRoute({
      //    x: start.x, y: start.y, material: { color: 'blue' }, dragging: true
      //  })
      //}
      mesh.dropCompleted = (diagram: FlowDiagram, start: Vector3): FlowNode | undefined => {
        const connectors: Array<FlowConnectorParameters> = [
          { id: '', anchor: 'left', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
          { id: '', anchor: 'top', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
          { id: '', anchor: 'right', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
          { id: '', anchor: 'bottom', selectable: true, selectcursor: 'crosshair', draggable: true, hidden },
        ]
        return diagram.addNode({
          x: start.x, y: start.y, material: { color: 'blue' },
          label: { text: 'New Node', font: 'helvetika', material: { color: 'white' }, },
          resizable: false, connectors
        })
      }

      return mesh
    }

    //
    // how to override connector shape for a specific node or type of node
    //
    const first = flow.addNode({
      id: 'first', material: { color: 'blue' },
      label: { text: 'Main Idea', material: { color: 'white' }, },
      scalable: false, resizable: false, draggable: true
    })
    connectors.addConnectors(first, [{
      id: '', anchor: 'left', selectable: true,
      selectcursor: 'crosshair', draggable: true, hidden
    }])
    connectors.addConnectors(first, [{
      id: '', anchor: 'top', selectable: true,
      selectcursor: 'crosshair', draggable: true, hidden
    }])
    connectors.addConnectors(first, [{
      id: '', anchor: 'right', selectable: true,
      selectcursor: 'crosshair', draggable: true, hidden
    }])
    connectors.addConnectors(first, [{
      id: '', anchor: 'bottom', selectable: true,
      selectcursor: 'crosshair', draggable: true, hidden
    }])




    const node1 = flow.hasNode('first')!


    console.warn(flow.save())

    //const gui = new GUI();
    //gui.add(flow, 'gridsize', 0, 1).name('Snap-to-Grid Size')

    //const folder = gui.addFolder('Node Properties')
    //folder.add<any, any>(node1, 'width', 0.3, 3).name('Width')
    //folder.add<any, any>(node1, 'minwidth', 0.3, 3).name('Min Width')
    //folder.add<any, any>(node1, 'maxwidth', 0.3, 3).name('Max Width')
    //folder.add<any, any>(node1, 'height', 0.3, 3).name('Height')
    //folder.add<any, any>(node1, 'minheight', 0.3, 3).name('Min Height')
    //folder.add<any, any>(node1, 'maxheight', 0.3, 3).name('Max Height')
    //folder.addColor(node1, 'color').name('Color')
    //folder.add<any, any>(node1.label, 'text').name('Label')
    //folder.add<any, any>(node1.label, 'size', 0.05, 0.3).name('Label Size')
    //folder.addColor(node1.label, 'color').name('Label Color')
    ////labelfont ?: string;
    ////userData ?: { [key: string]: any };
    //folder.add<any, any>(node1, 'resizable').name('Resizable')
    ////folder.addColor(node1, 'resizecolor').name('Resize Color')
    //folder.add<any, any>(node1, 'draggable').name('Draggable')
    //folder.add<any, any>(node1, 'scalable').name('Scalable')
    ////folder.addColor(node1, 'scalecolor').name('Scale Color')
    //folder.add<any, any>(node1, 'scalar', 0.1, 5).name('Scale')
    //folder.add<any, any>(node1, 'minscale', 0.1, 2).name('Min Scale')
    //folder.add<any, any>(node1, 'maxscale', 0.1, 3).name('Max Scale')
    //folder.add<any, any>(node1, 'hidden').name('Hidden')



    this.dispose = () => {
      interaction.dispose()
      //      gui.destroy()
      orbit.dispose()
    }

  }
}
