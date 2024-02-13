import { AmbientLight, AxesHelper, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowDiagram, FlowDiagramParameters, FlowEdge, FlowEdgeParameters, FlowEventType, FlowInteraction, FlowLabel, FlowNode, FlowNodeParameters, FlowPointer, FlowPointerEventType } from "three-flow";
import { DagreLayout } from "./dagre-layout";
import { ButtonMenuParameters, FontCache, KeyboardInteraction, LabelParameters, MenuButtonParameters, PointerInteraction, TextButtonParameters, UIButtonMenu, UIMaterials, UIOptions } from "three-fluix";

export class ExpandCollapseExample {

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

    const disableRotate = () => { orbit.enableRotate = false }
    const enableRotate = () => { orbit.enableRotate = true }
    app.interactive.addEventListener(FlowPointerEventType.DRAGSTART, disableRotate)
    app.interactive.addEventListener(FlowPointerEventType.DRAGEND, enableRotate)

    //scene.add(new AxesHelper(3))

    const nodes: Array<FlowNodeParameters> = [
      { id: 'n1' },
      { id: 'n2' },
      { id: 'n3' },
      { id: 'n4' },
      { id: 'n5' },

      { id: 'n6' },
      { id: 'n7' },
      { id: 'n8' },
    ]

    const edges: Array<FlowEdgeParameters> = [
      { from: 'n1', to: 'n2' },
      { from: 'n1', to: 'n3' },
      { from: 'n2', to: 'n4' },
      { from: 'n3', to: 'n5' },

      { from: 'n6', to: 'n7' },
      { from: 'n6', to: 'n8' },
    ]

    const diagram: FlowDiagramParameters = {
      nodes, edges
    }

    const flow = new FlowDiagram({ linestyle: 'bezier', layout: new DagreLayout() })
    scene.add(flow);

    const interaction = new FlowInteraction(flow, app.interactive)

    const options: UIOptions = {
      materials: new UIMaterials(),
      fontCache: new FontCache(),
      keyboard: new KeyboardInteraction(app)
    }


    flow.createNode = (parameters: FlowNodeParameters): FlowNode => {
      return new ExpandCollapseNode(flow, parameters, app.pointer, options)
    }

    flow.loadDiagram(diagram)

    flow.layout({ rankdir: 'TB', nodesep: 0.1, edgesep: 1, ranksep: 0.7 })

    this.dispose = () => {
      interaction.dispose()
      orbit.dispose()
    }
  }
}

type ExpandState = 'none' | 'expand' | 'collapse'

class ExpandCollapseNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, options: UIOptions) {
    parameters.label = { text: '', size: 0.07 }
    parameters.height = 0.2
    parameters.scalable = parameters.resizable = false
    parameters.draggable = false

    super(diagram, parameters)

    const label = this.label!
    label.text = 'nothing to expand'

    let state: ExpandState = 'none'
    const icon = new FlowLabel(diagram, { text: '', isicon: true })
    label.add(icon)
    icon.visible = false

    const connectedNodes: Array<FlowNode> = []

    diagram.addEventListener(FlowEventType.EDGE_ADDED, (e: any) => {
      const edge = e.edge as FlowEdge
      if (edge.from != this.name) return
      connectedNodes.push(diagram.hasNode(edge.to)!)

      label.text = 'click to collapse'
      state = 'collapse'
      icon.text = 'expand_less'
      icon.visible = true
    })

    diagram.addEventListener(FlowEventType.NODE_REMOVED, (e: any) => {
      console.warn('node removed', e)
      const node = e.node as FlowNode
    })

    label.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
      icon.position.x = label.width / 2
    })

    this.addEventListener(FlowPointerEventType.CLICK, () => {
      if (state == 'none') return
      if (state == 'expand') {
        label.text = 'click to collapse'
        state = 'collapse'
        icon.text = 'expand_less'
      }
      else {
        label.text = 'click to expand'
        icon.text = 'expand_more'
        state = 'expand'
      }

      connectedNodes.forEach(node => node.hidden = !node.hidden)
      //diagram.layout({ rankdir: 'TB', ranksep: 0.7 })
    })

    // listen for changes and forward to anything connected to match this nodes hidden state
    this.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
      if (state != 'collapse') return
      connectedNodes.forEach(node => node.hidden = this.hidden)
    })

    const add: MenuButtonParameters = {
      button: <TextButtonParameters>{
        radius: 0.05,
        label: { text: 'add', isicon: true },
        fill: { color: 0x666666 }
      },
      hint: 'Add Child Node',
      selected: (parameters: MenuButtonParameters) => {
        const node = diagram.addNode({ id: '' })
        diagram.addEdge({ from: this.name, to: node.name })
        diagram.layout({ rankdir: 'TB', nodesep: 0.1, edgesep: 1, ranksep: 0.7 })
      }
    }

    const remove: MenuButtonParameters = {
      button: <TextButtonParameters>{
        radius: 0.05,
        label: { text: 'close', isicon: true },
        fill: { color: 0x666666 }
      },
      hint: 'Remove Node',
      selected: (parameters: MenuButtonParameters) => {
      }
    }

    const hintLabel: LabelParameters = { material: { color: 'white' } }

    const actions: ButtonMenuParameters = {
      items: [add], hintLabel
    }


    const menu = new UIButtonMenu(actions, pointer, options)
    this.add(menu)
    menu.position.set(-menu.width / 2, -this.height / 2 - menu.height, 0.001)

  }

}
