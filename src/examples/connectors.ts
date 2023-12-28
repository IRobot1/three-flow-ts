import { AmbientLight, AxesHelper, Color, Intersection, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, PlaneGeometry, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowProperties, FlowInteraction, FlowNode, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowLabel, FlowLabelParameters, NodeConnectors, FlowConnectorParameters, ConnectorMesh, FlowEdgeParameters, FlowEventType, FlowRouteParameters, FlowRoute, FlowEdge, CustomPathParams, Path3, FlowEdgePath3 } from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

export class ConnectorsExample {

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

    const flow = new ConnectorDiagram({ linestyle: 'step' })
    scene.add(flow);

    const interaction = new FlowInteraction(flow, app.interactive)

    const connectors = new MyConnectors(flow)

    const properties = new FlowProperties(flow, interaction)

    const column1 = -1
    const column2 = 1
    const row1 = 0

    const startNode = flow.addNode({
      x: column1, y: row1, label: { text: 'Match' }, resizable: false, scalable: false, draggable: true,
      connectors: [
        { id: 'c1start', anchor: 'right', selectable: true, draggable: true, startDragDistance: 0.05, material: { color: 'green' } },
        { id: 'c2start', anchor: 'right', selectable: true, index: 1, draggable: true, startDragDistance: 0.05, material: { color: 'blue' } },
        { id: 'c3start', anchor: 'right', selectable: true, index: 2, draggable: true, startDragDistance: 0.05, material: { color: 'blue' } },
      ]
    })
    const endNode = flow.addNode({
      x: column2, y: row1, height: 1.5, label: { text: 'Colors', }, resizable: false, scalable: false, draggable: false,
      connectors: [
        { id: 'c1end', anchor: 'left', draggable: true, allowDrop: false, material: { color: 'gray' } },
        { id: 'c2end', anchor: 'left', index: 1, draggable: true, allowDrop: true, material: { color: 'green' } },
        { id: 'c3end', anchor: 'left', index: 2, draggable: true, allowDrop: true, material: { color: 'red' } },
        { id: 'c4end', anchor: 'left', index: 3, draggable: true, allowDrop: true, label: { text: 'Limit 1', alignX: 'left' }, material: { color: 'blue' }, limit: 1 },
      ]
    })

    this.dispose = () => {
      flow.dispose()
      interaction.dispose()
      orbit.dispose()
    }
  }
}

class MyConnector extends ConnectorMesh {
  constructor(public diagram: FlowDiagram, nodeconnectors: NodeConnectors, parameters: FlowConnectorParameters) {
    super(nodeconnectors, parameters)

    const disabledmaterial = diagram.getMaterial('geometry', 'connector', <MeshBasicMaterialParameters>{ color: 'gray' })
    const enabledmaterial = this.material

    const setColor = () => {
      this.material = this.allowDrop ? enabledmaterial : disabledmaterial
    }
    setColor()

    this.addEventListener(FlowEventType.DISABLE_CHANGED, setColor)
  }


  override canDrop(source: ConnectorMesh): boolean {
    if (!this.allowDrop) return false

    const color = (this.material as MeshBasicMaterial).color.getStyle()
    const othercolor = (source.material as MeshBasicMaterial).color.getStyle()
    if (color != othercolor) return false

    // check if connected limit is exceeded
    const matches = this.diagram.allConnectors.filter(e => e.toconnector == this.name)
    if (matches.length > this.limit) return false

    return true
  }

  //override dragging(edge: FlowEdge, route: FlowRoute) {
  //  // demonstrate live updating edge label
  //  const p = route.position
  //  edge.label.text = `x:${p.x.toFixed(1)}, y:${p.y.toFixed(1)}`
  //}

  //override dragOver(connector: ConnectorMesh) {
  //}

  override createDragRoute(routeparams: FlowRouteParameters, edgeparams: FlowEdgeParameters): { dragroute: FlowRoute, dragedge: FlowEdge } {
    edgeparams.material = { dashSize: 0.03, gapSize: 0.01, dashed: true, linewidth: 6 }
    edgeparams.linestyle = 'custom'
    const { dragedge, dragroute } = super.createDragRoute(routeparams, edgeparams)
    dragedge.getCustomPath = (params: CustomPathParams): { path: Path3, center: Vector3 } => {
      const edgepath = new FlowEdgePath3()
      const { path, label } = edgepath.getStraightPath(params)
      return { path, center: label }
    }
    return { dragedge, dragroute }
  }


  override dropCompleted(diagram: FlowDiagram, start: Vector3, dragIntersects: Array<Intersection>): FlowNode | undefined {
    const intersect = dragIntersects.filter(i => i.object.type == 'flowconnector')
    // ignore unless drop was on top of a connector
    if (!intersect.length) return

    intersect.forEach(intersect => {
      const otherconnector = intersect.object as ConnectorMesh
      if (!otherconnector.canDrop(this)) return

      // if there's no edge already connecting
      if (!diagram.matchConnector(this.name, otherconnector.name)) {

        const othernode = otherconnector.parent as FlowNode

        const color = this.parameters.material!.color as string

        const edgeparams: FlowEdgeParameters = {
          from: this.parent!.name, to: othernode.name, fromconnector: this.name, toconnector: otherconnector.name,
          material: { color, dashSize: 0.03, gapSize: 0.01, dashed: true, linewidth: 6, dashOffset: 0.1 },
          toarrow: {}, fromarrow: {},
          //stepOffset: 0.1, stepRadius: 0.1, bezierCurvature: 0.5
        }
        edgeparams.label = { text: color, padding: 0.01 }

        // add edge between connectors
        const edge = diagram.addEdge(edgeparams)

        const params = {
          rate: 0.01
        }
        // animate dashes
        const timer = setInterval(() => {
          const material = edge.material as LineMaterial
          material.dashOffset -= params.rate
        }, 100)

        diagram.addEventListener(FlowEventType.DISPOSE, () => {
          clearInterval(timer)
        })

        // give the line a chance to be drawn
        requestAnimationFrame(() => {
          edge.addEventListener(FlowEventType.EDGE_PROPERTIES, (e: any) => {
            const gui = e.gui as GUI
            const material = edge.material as LineMaterial
            gui.title(`${color} Properties`)
            gui.add(material, 'dashSize', 0.01, 0.1).name('Dash Size')
            gui.add(material, 'gapSize', 0.01, 0.1).name('Gap Size')
            gui.add(params, 'rate', 0.004, 0.015).name('Animation Speed')
          })
        })

        // demonstrate another object placed at center behind label
        if (color != 'green') {
          const mesh = new Mesh()
          mesh.material = diagram.getMaterial('geometry', 'edge-center', <MeshBasicMaterialParameters>{ color: 'white' })
          edge.add(mesh)

          edge.label.addEventListener(FlowEventType.HEIGHT_CHANGED, () => {
            mesh.geometry = new PlaneGeometry(edge.label.width, edge.label.height)
          })

          // listen for center position changing
          edge.addEventListener(FlowEventType.EDGE_CENTER, (e: any) => {
            const center = e.center as Vector3
            center.z = -0.001
            mesh.position.copy(center)
          })
        }
      }
    })

    return undefined
  }


}

class MyConnectors extends FlowConnectors {
  override createConnector(connectors: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh {
    return new MyConnector(this.diagram, connectors, parameters)
  }

}


class ConnectorDiagram extends FlowDiagram {
  constructor(options?: FlowDiagramOptions) {
    super(options)
  }

  override createLabel(parameters: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, parameters)
  }

}
