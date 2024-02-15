import { AmbientLight, AxesHelper, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowDiagram, FlowDiagramOptions, FlowDiagramParameters, FlowEdge, FlowEdgeParameters, FlowEventType, FlowInteraction, FlowLabel, FlowNode, FlowNodeParameters, FlowPointer, FlowPointerEventType } from "three-flow";
import { DagreLayout } from "./dagre-layout";
import { ButtonMenuParameters, FontCache, KeyboardInteraction, LabelParameters, MenuButtonParameters, PointerInteraction, TextButtonParameters, UIButtonMenu, UIMaterials, UIOptions } from "three-fluix";
//import GUI from "three/examples/jsm/libs/lil-gui.module.min";

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

    const diagramOptions: FlowDiagramOptions = {
      linestyle: 'bezier', layout: new DagreLayout(),
      layoutoptions: { rankdir: 'TB', nodesep: 0.1, edgesep: 1, ranksep: 0.5 }

    }
    const flow = new FlowDiagram(diagramOptions)
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


    flow.layout(false)

    //const gui = new GUI({ title: 'Stress Options' });
    //gui.add(diagramOptions, 'linestyle', ['bezier', 'step', 'straight']).name('Edge Style').onChange(() => {
    //  flow.allEdges.forEach(edge => edge.linestyle = diagramOptions.linestyle!)
    //})
    //gui.add(diagramOptions.layoutoptions, 'rankdir', ['TB', 'LR', 'RL', 'BT']).name('Layout Direction')
    //gui.add(diagramOptions.layoutoptions, 'ranker', ['network-simplex', 'tight-tree','longest-path']).name('Layout Algorithm')

    this.dispose = () => {
      //gui.destroy()
      interaction.dispose()
      orbit.dispose()
    }
  }
}

type ExpandState = 'disabled' | 'expanded' | 'collapsed'

class ExpandCollapseNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, options: UIOptions) {
    parameters.label = { text: '', size: 0.07 }
    parameters.height = 0.2
    parameters.scalable = parameters.resizable = false
    parameters.draggable = false

    super(diagram, parameters)

    const label = this.label!
    label.text = 'nothing to expand'

    let state: ExpandState = 'disabled'
    const icon = new FlowLabel(diagram, { text: '', isicon: true })
    label.add(icon)
    icon.visible = false

    const connectedNodes: Array<FlowNode> = []

    diagram.addEventListener(FlowEventType.EDGE_ADDED, (e: any) => {
      const edge = e.edge as FlowEdge
      if (edge.from != this.name) return
      const node = diagram.hasNode(edge.to)!
      connectedNodes.push(node)

      label.text = 'click to collapse'
      state = 'expanded'
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

    const expand = () => {
      label.text = 'click to collapse'
      state = 'expanded'
      icon.text = 'expand_less'
      connectedNodes.forEach(node => node.hidden = false)
    }

    const collapse = () => {
      label.text = 'click to expand'
      state = 'collapsed'
      icon.text = 'expand_more'
      connectedNodes.forEach(node => node.hidden = true)
    }

    this.addEventListener(FlowPointerEventType.CLICK, () => {
      if (state == 'disabled') return
      if (state == 'collapsed') {
        expand()
      }
      else {
        collapse()
      }

      diagram.layout(false)
    })

    // listen for changes and forward to anything connected to match this nodes hidden state
    this.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
      if (state != 'expanded') return
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
        state = 'expanded'
        expand()

        const node = diagram.addNode({ id: '' })
        diagram.addEdge({ from: this.name, to: node.name })
        diagram.layout(false)
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
