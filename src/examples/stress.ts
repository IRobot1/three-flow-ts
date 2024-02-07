import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, MeshBasicMaterial, PlaneGeometry, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowEventType, FlowDiagram, FlowNode, FlowNodeParameters, FlowEdgeParameters, FlowInteraction, FlowLabel, FlowLabelParameters, FlowConnectors, FlowProperties, FlowDiagramOptions, FlowConnectorParameters, FlowTheme, FlowMaterials, FlowMaterialUtils } from "three-flow";


export class StressExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    app.enableStats()

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

    const changeLOD = (lod: number, visible: boolean) => {
      const action = visible ? 'show' : 'hide'
      switch (lod) {
        case 0:
        case 1:
          // console.warn(`${action} connectors`)
          connectors.allConnectors.forEach(connector => {
            connector.visible = visible
          })
          break;
        case 2:
          // console.warn(`${action} labels`)
          flow.allNodes.forEach(node => {
            if (node.label) node.label.visible = visible
          })
          flow.allEdges.forEach(edge => {
            if (edge.label) edge.label.visible = visible
          })
          break;
        case 3:
          // console.warn(`${action} edges`)
          flow.allEdges.forEach(edge => {
            edge.visible = visible
          })
          break;
        case 4:
          //  console.warn(`${action} nodes`)
          flow.allNodes.forEach(node => {
            node.visible = visible
          })
          break;
      }
    }

    let lastLOD = 0
    orbit.addEventListener('change', (e: any) => {
      const length = app.camera.position.length()
      let newLOD = 0
      if (length > 3 && length < 10)
        newLOD = 1
      else if (length > 10 && length < 20)
        newLOD = 2
      else if (length > 20 && length < 50)
        newLOD = 3
      else if (length > 50 && length < 70)
        newLOD = 4
      else if (length > 70)
        newLOD = 5

      if (newLOD != lastLOD) {
        //console.warn(`change LOD, new ${newLOD}, last ${lastLOD}`)
        if (newLOD > lastLOD)
          changeLOD(newLOD, false)
        else
          changeLOD(lastLOD, true)

        lastLOD = newLOD
      }
    })


    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    //scene.add(new AxesHelper(3))

    const flow = new StressFlowDiagram({ linestyle: 'bezier' })
    scene.add(flow);

    const interactive = new FlowInteraction(flow, app.interactive)

    const connectors = new StressFlowConnectors(flow)

    const properties = new FlowProperties(flow)

    let count = 1
    let lastnode: FlowNode | undefined
    const hidden = false

    const rows = 30
    const columns = 16
    for (let y = rows/2; y > -rows/2; y--) {
      for (let x = -columns/2; x < columns/2; x++) {
        const text = `Node ${count}`
        const nodeparams: FlowNodeParameters = {
          x, y,
          width: 0.8, height: 0.8,
          label: { text, hidden },
          resizable: false, scalable: false,
          connectors: [
            { id: "c1" + text, anchor: 'top', hidden, radius: 0.02 },
            { id: "c2" + text, anchor: 'bottom', hidden, radius: 0.02 },
          ],
        }

        const node = flow.addNode(nodeparams)
        node.userData = { x: node.position.x, y: node.position.y }

        if (lastnode) {
          const edgeparams: FlowEdgeParameters = {
            id: '', from: lastnode.name, to: node.name, divisions: 40,
            fromconnector: lastnode.parameters.connectors![1].id, toconnector: nodeparams.connectors![0].id,
          }
          flow.addEdge(edgeparams)
        }
        lastnode = node
        count++
      }
    }

    const range = -20

    const params = {
      random() {
        flow.allNodes.forEach(node => {
          node.position.x = -range + Math.random() * range*2
          node.position.y = -range + Math.random() * range*2
          node.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
        })
      },
      reset() {
        flow.allNodes.forEach(node => {
          const { x, y } = node.userData
          node.position.x = x
          node.position.y = y
          node.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
        })
      }
    }
    const gui = new GUI({ title: 'Stress Options' });
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '0';
    gui.domElement.style.left = '85px';
    gui.add<any, any>(params, 'random').name('Random Positions')
    gui.add<any, any>(params, 'reset').name('Reset Positions')

    //count = 0
    //scene.traverse(object => { count++ })
    //console.warn(scene.children, count)

    this.dispose = () => {
      gui.destroy()
      interactive.dispose()
      properties.dispose()
      orbit.dispose()
      app.disableStats()
    }
  }

}

class StressNode extends FlowNode {

  constructor(diagram: StressFlowDiagram, parameters: FlowNodeParameters) {
    super(diagram, parameters)

    this.createGeometry = (): BufferGeometry => {
      return diagram.geometry
    }
  }
}

const stressTheme: FlowTheme = {
  'geometry-connector': new MeshBasicMaterial({ color: '#01411C' }),
  'geometry-edge': new MeshBasicMaterial({ color: '#D0F0C0' }),
  'geometry-label': new MeshBasicMaterial({ color: '#006400' }),
  'geometry-node': new MeshBasicMaterial({ color: '#ACE1AF' }),
  'line-edge': FlowMaterialUtils.LineMaterial({ color: 0xD0F0C0 }),
}


class StressFlowDiagram extends FlowDiagram {
  geometry: BufferGeometry
  constructor(options: FlowDiagramOptions = {}) {
    options.materialCache = new FlowMaterials(stressTheme)
    super(options)

    this.geometry = new PlaneGeometry(0.8, 0.8)
  }

  override createNode(node: FlowNodeParameters): FlowNode {
    return new StressNode(this, node)
  }
}

class StressFlowConnectors extends FlowConnectors {
  constructor(diagram: FlowDiagram) {
    super(diagram)

    const geometry = new CircleGeometry(0.02)

    this.createGeometry = (parameters: FlowConnectorParameters): BufferGeometry => {
      return geometry
    }
  }

}
