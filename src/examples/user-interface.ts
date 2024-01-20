import { AmbientLight, AxesHelper, BufferGeometry, Color, MaterialParameters, Mesh, MeshPhongMaterial, PlaneGeometry, PointLight, Scene, Shape, ShapeGeometry } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowDiagram, FlowDiagramOptions, FlowInteraction, FlowMaterials, FlowNode, FlowNodeParameters, InteractiveEventType, ThreeInteractive } from "three-flow";
import { UITextButton } from "./gui/button-text";
import { TextButtonParameters } from "./gui/model";
import { ButtonOptions } from "./gui/button";
import { UIOptions } from './gui/model'

interface MenuAction {
  text: string
  isicon: boolean
  action(): void
}

interface MenuParameters extends FlowNodeParameters {
  menu: Array<MenuAction>
  start: MenuAction
  end: MenuAction
}

interface UserInterfaceDiagramOptions extends FlowDiagramOptions {
  pointer: ThreeInteractive
  uioptions: UIOptions
}

export class UserInterfaceExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 2

    scene.background = new Color(0xDBDFE3)

    const ambient = new AmbientLight()
    ambient.intensity = 2
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
    app.interactive.addEventListener(InteractiveEventType.DRAGSTART, disableRotate)
    app.interactive.addEventListener(InteractiveEventType.DRAGEND, enableRotate)

    app.enableVR(true)

    scene.add(new AxesHelper(1))

    const materials = new FlowMaterials()
    materials.createMeshMaterial = (parameters: MaterialParameters) => {
      return new MeshPhongMaterial(parameters)
    }

    const diagramoptions: UserInterfaceDiagramOptions = {
      materialCache: materials,
      pointer: app.interactive,
      uioptions: { materials }
    }

    const flow = new UserInterfaceDiagram(diagramoptions)
    scene.add(flow);

    const interactive = new FlowInteraction(flow, app.interactive)

    const menu: Array<MenuAction> = [
      { text: 'home', isicon:true, action: () => { console.warn('home clicked') } },
      { text: 'bar_chart', isicon: true, action: () => { console.warn('chart clicked') } },
      { text: 'account_balance', isicon: true, action: () => { console.warn('balance clicked') } },
      { text: 'email', isicon: true, action: () => { console.warn('email clicked') } },
      { text: 'play_circle_outline', isicon: true, action: () => { console.warn('play clicked') } },
      { text: 'people', isicon: true, action: () => { console.warn('users clicked') } },
      { text: 'text_snippet', isicon: true, action: () => { console.warn('notes clicked') } },
      { text: 'paid', isicon: true, action: () => { console.warn('finances clicked') } },
    ]

    const menuparams: MenuParameters = {
      menu,
      start: { text: 'XR', isicon: false, action: () => { /*app.enterVR()*/ } },
      end: { text: 'settings', isicon: true, action: () => { console.warn('settings clicked')} },
      x: -2, y: 0.7,
      type: 'menu', width: 0.25, height: 0.25,
      material: { color: '#4269EA' },
      resizable: false, scalable: false,
    }
    const menunode = flow.addNode(menuparams)

    this.dispose = () => {
      interactive.dispose()
      flow.dispose()
      orbit.dispose()
    }
  }
}
class UserInterfaceDiagram extends FlowDiagram {

  constructor(public diagramoptions: UserInterfaceDiagramOptions) {
    super(diagramoptions)
  }

  override createNode(parameters: MenuParameters): FlowNode {
    if (parameters.type == 'menu')
      return new MenuNode(this, parameters, this.diagramoptions.uioptions)

    return new FlowNode(this, parameters)
  }
}


type ArchType = 'top' | 'bottom'
class MenuNode extends FlowNode {
  constructor(diagram: UserInterfaceDiagram, parameters: MenuParameters, uioptions: UIOptions) {
    super(diagram, parameters)

    const menuheight = parameters.menu.length * 0.2
    const menugeometry = new PlaneGeometry(this.width, menuheight)
    const menumesh = new Mesh(menugeometry, this.material)
    menumesh.position.y = -this.height / 2 - menuheight / 2 - 0.02
    this.add(menumesh)

    const bottomgeometry = new ArchGeometry('bottom', this.width, this.height)
    const archmesh = new Mesh(bottomgeometry, this.material)
    archmesh.position.y = -this.height - menuheight - 0.04
    this.add(archmesh)

    const startparams: TextButtonParameters = {
      label: { text: parameters.start.text, isicon: parameters.start.isicon, size: 0.05 },
      width: 0.15, height: 0.12, radius: 0.06,
    }
    const startbutton = new MenuTextButton(startparams, diagram.diagramoptions.pointer, uioptions)
    this.add(startbutton)
    startbutton.position.set(0, 0, 0.001)

    startbutton.pressed = () => { parameters.start.action() }

    let y = -0.3
    parameters.menu.forEach(item => {
      const params: TextButtonParameters = {
        label: { text: item.text, isicon: item.isicon, size: 0.06 },
        width: 0.12, height:0.12, radius:0.06,
      }
      const button = new MenuTextButton(params, diagram.diagramoptions.pointer, uioptions)
      this.add(button)
      button.position.set(0, y, 0.001)
      y -= 0.18

      button.pressed = () => { item.action() }
    })

    const endparams: TextButtonParameters = {
      label: { text: parameters.end.text, isicon: parameters.end.isicon, size: 0.05 },
      width: 0.12, height: 0.12, radius: 0.06,
    }

    const endbutton = new MenuTextButton(endparams, diagram.diagramoptions.pointer, uioptions)
    archmesh.add(endbutton)
    endbutton.position.set(0, 0, 0.001)

    endbutton.pressed = () => { parameters.end.action() }


  }

  override createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new ArchGeometry('top', this.width, this.height)
  }

}


class TopArchShape extends Shape {
  constructor(width: number, height: number, radius: number, x = 0, y = 0) {
    super()

    this
      .lineTo(0, height - radius)
      .quadraticCurveTo(0, height, radius, height)
      .lineTo(width - radius, height)
      .quadraticCurveTo(width, height, width, height - radius)
      .lineTo(width, 0)
  }
}
class BottomArchShape extends Shape {
  constructor(width: number, height: number, radius: number, x = 0, y = 0) {
    super()

    this
      .moveTo(0, radius)
      .lineTo(0, height)
      .lineTo(width, height)
      .lineTo(width, radius)
      .quadraticCurveTo(width, 0, width - radius, 0)
      .lineTo(radius, 0)
      .quadraticCurveTo(0, 0, 0, radius)
  }
}

class ArchGeometry extends ShapeGeometry {
  constructor(type: ArchType = 'top', width = 1, height = 1, radius = 0.1, curveSegments = 12) {
    let shape
    if (type == 'top')
      shape = new TopArchShape(width, height, radius)
    else
      shape = new BottomArchShape(width, height, radius)

    super(shape, curveSegments)
    this.center()
  }
}

class MenuTextButton extends UITextButton {
  constructor(parameters: TextButtonParameters, interactive: ThreeInteractive, options: ButtonOptions) {
    super(parameters, interactive, options)
  }

}
