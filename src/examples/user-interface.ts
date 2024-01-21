import { AmbientLight, AxesHelper, BufferGeometry, Color, MaterialParameters, Mesh, MeshBasicMaterialParameters, MeshPhongMaterial, MeshPhongMaterialParameters, PlaneGeometry, PointLight, Scene, Shape, ShapeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowDiagram, FlowDiagramOptions, FlowInteraction, FlowMaterials, FlowNode, FlowNodeParameters, InteractiveEventType, RoundedRectangleGeometry, ThreeInteractive } from "three-flow";
import { UITextButton } from "./gui/button-text";
import { TextButtonParameters } from "./gui/model";
import { ButtonOptions } from "./gui/button";
import { UIOptions } from './gui/model'
import { FontCache } from "./gui/cache";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { UILabel } from "./gui/label";
import { UIProperties } from "./gui/properties";
import { GUI } from "./gui/gui-model";
import { KeyboardInteraction } from "./gui/keyboard-interaction";
import { UIColorPicker } from "./gui/color-picker";
import { UICheckbox } from "./gui/checkbox";
import { ExpansionPanelParameters, UIExpansionPanel } from "./gui/expansion-panel";

interface MenuAction {
  text: string
  isicon: boolean
  action(): void
}

interface MenuParameters extends FlowNodeParameters {
  menu: Array<MenuAction>
  start: MenuAction
  end?: MenuAction
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

    const loader = new FontLoader();
    loader.load("assets/helvetiker_regular.typeface.json", (font) => {

      const diagramoptions: UserInterfaceDiagramOptions = {
        fonts: new Map<string, Font>([
          ['default', font],
        ]),
        materialCache: materials,
        pointer: app.interactive,
        uioptions: {
          materials,
          fontCache: new FontCache(),
          keyboard: new KeyboardInteraction(app)
        }

      }

      const flow = new UserInterfaceDiagram(diagramoptions)
      scene.add(flow);

      const interactive = new FlowInteraction(flow, app.interactive)

      const menu: Array<MenuAction> = [
        {
          text: 'label', isicon: true, action: () => {
            const nodeparams: FlowNodeParameters = {
              type: 'label',
              material: { color: 'steelblue' },
              label: { text: 'Labels', size: 0.07, },
              //width:1.3,
              height: 1.6,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          text: 'smart_button', isicon: true, action: () => {
            const nodeparams: FlowNodeParameters = {
              z: 0.01,
              type: 'button',
              material: { color: 'lightsteelblue' },
              label: { text: 'Buttons', size: 0.07, },
              //width:1.3,
              height: 1.6,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          text: 'check_box', isicon: true, action: () => {
            const nodeparams: FlowNodeParameters = {
              z: 0.02,
              type: 'checkbox',
              material: { color: 'lime' },
              label: { text: 'Checkboxes', size: 0.07, },
              //width:1.3,
              height: 1.1,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          text: 'expand', isicon: true, action: () => {
            const nodeparams: FlowNodeParameters = {
              z: 0.03,
              type: 'expansion',
              material: { color: 'green' },
              label: { text: 'Expansion Panel ', size: 0.07, },
              //width:1.3,
              height: 1.1,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        { text: 'play_circle_outline', isicon: true, action: () => { console.warn('play clicked') } },
        { text: 'people', isicon: true, action: () => { console.warn('users clicked') } },
        { text: 'text_snippet', isicon: true, action: () => { console.warn('notes clicked') } },
        { text: 'paid', isicon: true, action: () => { console.warn('finances clicked') } },
      ]

      const menuparams: MenuParameters = {
        menu,
        start: { text: 'XR', isicon: false, action: () => { /*app.enterVR()*/ } },
        //end: { text: 'dashboard', isicon: true, action: () => { console.warn('dashboard clicked') } },
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
    })
  }
}
class UserInterfaceDiagram extends FlowDiagram {

  constructor(public diagramoptions: UserInterfaceDiagramOptions) {
    super(diagramoptions)
  }

  override createNode(parameters: MenuParameters): FlowNode {
    const uioptions = this.diagramoptions.uioptions
    if (parameters.type == 'menu')
      return new MenuUINode(this, parameters, uioptions)
    else if (parameters.type == 'label')
      return new LabelUINode(this, parameters, uioptions)
    else if (parameters.type == 'button')
      return new ButtonUINode(this, parameters, uioptions)
    else if (parameters.type == 'checkbox')
      return new CheckboxUINode(this, parameters, uioptions)
    else if (parameters.type == 'expansion')
      return new ExpansionUINode(this, parameters, uioptions)

    return new FlowUINode(this, parameters, uioptions)
  }
}


type ArchType = 'top' | 'bottom'
class MenuUINode extends FlowNode {
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
        width: 0.12, height: 0.12, radius: 0.06,
      }
      const button = new MenuTextButton(params, diagram.diagramoptions.pointer, uioptions)
      this.add(button)
      button.position.set(0, y, 0.001)
      y -= 0.18

      button.pressed = () => { item.action() }
    })

    if (parameters.end) {
      const endparams: TextButtonParameters = {
        label: { text: parameters.end.text, isicon: parameters.end.isicon, size: 0.05 },
        width: 0.12, height: 0.12, radius: 0.06,
      }

      const endbutton = new MenuTextButton(endparams, diagram.diagramoptions.pointer, uioptions)
      archmesh.add(endbutton)
      endbutton.position.set(0, 0, 0.001)

      endbutton.pressed = () => { parameters.end!.action() }
    }


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


class FlowUINode extends FlowNode {
  titleheight = 0.15
  panel: Mesh


  constructor(protected uidiagram: UserInterfaceDiagram, parameters: FlowNodeParameters, protected uioptions: UIOptions) {
    super(uidiagram, parameters)

    const bottomgeometry = new ArchGeometry('bottom', this.width, this.height - this.titleheight)
    const bottommaterial = uidiagram.getMaterial('geometry', 'card', <MeshBasicMaterialParameters>{ color: 'white' })
    const archmesh = new Mesh(bottomgeometry, bottommaterial)
    archmesh.position.y = -this.height / 2
    this.add(archmesh)
    this.panel = archmesh

    const buttonwidth = 0.1
    const params: TextButtonParameters = {
      label: { text: 'close', isicon: true, size: 0.05 },
      width: buttonwidth, radius: buttonwidth / 2,
    }

    const closebutton = new UITextButton(params, uidiagram.diagramoptions.pointer, uioptions)
    this.add(closebutton)
    closebutton.position.set((this.width - buttonwidth * 1.5) / 2, 0, 0.001)

    closebutton.pressed = () => { uidiagram.removeNode(this) }
  }

  override createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new ArchGeometry('top', this.width, this.titleheight)
  }

}
class LabelUINode extends FlowUINode {
  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, uioptions: UIOptions) {
    super(diagram, parameters, uioptions)

    const label = new UILabel({ text: 'Three Flow', material: { color: '#111' }, maxwidth: this.width }, this.uioptions)
    this.panel.add(label)
    label.position.set(0, this.height / 2 - this.titleheight, 0.001)

    const fake = {
      fontName: 'helvetiker'
    }
    let lasttext = ''

    const gui = new GUI({})
    gui.add(label, 'text').name('Text')
    gui.add(label, 'alignX', ['left', 'center', 'right']).name('X Alignment')
    gui.add(label, 'alignY', ['top', 'middle', 'bottom']).name('Y Alignment')
    gui.add(label, 'isicon',).name('Icon').onChange(() => {
      if (label.isicon) {
        lasttext = label.text
        label.text = 'bar_chart'
      }
      else
        label.text = lasttext
    })
    gui.add(label, 'size', 0.03, 0.1, 0.01).name('Font Size')
    gui.addColor(label, 'color').name('Color')
    gui.add(fake, 'fontName', ['helvetiker', 'gentilis', 'optimer']).name('Font').onChange(() => {
      switch (fake.fontName) {
        case 'helvetiker':
          label.fontName = 'assets/helvetiker_regular.typeface.json'
          break;
        case 'gentilis':
          label.fontName = 'assets/gentilis_regular.typeface.json'
          break;
        case 'optimer':
          label.fontName = 'assets/optimer_regular.typeface.json'
          break
      }
    })
    //gui.add(label, 'padding', 0, 0.1, 0.01).name('Padding')
    gui.add(label, 'maxwidth', 0.1, this.width, 0.1).name('Maximum Width')
    gui.add(label, 'overflow', ['slice', 'clip']).name('Overflow')

    const pointer = this.uidiagram.diagramoptions.pointer

    const properties = new UIProperties({ fill: parameters.material }, pointer, uioptions, gui)
    this.panel.add(properties)
    properties.getColorPicker = () => { return new UIColorPicker({}, pointer, uioptions) }
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

}

class ButtonUINode extends FlowUINode {
  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, uioptions: UIOptions) {
    super(diagram, parameters, uioptions)

    const pointer = this.uidiagram.diagramoptions.pointer

    const maxwidth = this.width - 0.1
    const buttonparams: TextButtonParameters = {
      width: maxwidth,
      label: { text: 'Three Flow', material: { color: '#111' }, maxwidth }
    }
    const button = new UITextButton(buttonparams, pointer, this.uioptions)
    this.panel.add(button)
    button.position.set(0, this.height / 2 - this.titleheight - 0.1, 0.001)
    button.pressed = () => { console.log('button pressed') }

    const fake = {
      fontName: 'helvetiker'
    }
    let lasttext = ''

    const gui = new GUI({})
    gui.add(button, 'text').name('Text')
    gui.add(button, 'width', 0.1, maxwidth, 0.1).name('Width').onChange(() => {
      button.width = Math.max(button.width, button.height)
      button.radius = Math.max(button.width / 2, button.radius)
    })
    gui.add(button, 'height', 0.1, 0.3, 0.1).name('Height').onChange(() => {
      button.height = Math.min(button.width, button.height)
      button.radius = Math.max(button.height / 2, button.radius, button.width / 2)
    })
    gui.add(button, 'radius', 0, 0.15, 0.01).name('Radius')
    gui.add(button.label, 'isicon',).name('Icon').onChange(() => {
      if (button.isicon) {
        lasttext = button.text
        button.text = 'home'
      }
      else
        button.text = lasttext
    })
    gui.add(button.label, 'size', 0.03, 0.1, 0.01).name('Font Size')
    gui.addColor(button, 'color').name('Color')
    gui.add(fake, 'fontName', ['helvetiker', 'gentilis', 'optimer']).name('Font').onChange(() => {
      switch (fake.fontName) {
        case 'helvetiker':
          button.label.fontName = 'assets/helvetiker_regular.typeface.json'
          break;
        case 'gentilis':
          button.label.fontName = 'assets/gentilis_regular.typeface.json'
          break;
        case 'optimer':
          button.label.fontName = 'assets/optimer_regular.typeface.json'
          break
      }
    })

    const properties = new UIProperties({ fill: parameters.material }, pointer, uioptions, gui)
    this.panel.add(properties)
    properties.getColorPicker = () => { return new UIColorPicker({}, pointer, uioptions) }
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

}

class CheckboxUINode extends FlowUINode {
  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, uioptions: UIOptions) {
    super(diagram, parameters, uioptions)

    const pointer = this.uidiagram.diagramoptions.pointer

    const maxwidth = 0.3
    const checkbox = new UICheckbox({ checked: true }, pointer, this.uioptions)
    this.panel.add(checkbox)
    checkbox.position.set(0, this.height / 2 - this.titleheight - 0.1, 0.001)

    const fake = { size: 0.1 }

    const gui = new GUI({})
    gui.add(fake, 'size', 0.1, maxwidth, 0.1).name('Size').onChange(() => {
      checkbox.width = checkbox.height = fake.size
      checkbox.radius = Math.min(fake.size / 2, checkbox.radius)
    })
    gui.add(checkbox, 'radius', 0, 0.15, 0.01).name('Radius')
    gui.addColor(checkbox, 'color').name('Color')
    gui.addColor(checkbox, 'checkcolor').name('Check Color')
    //gui.add(checkbox, 'indeterminate').name('Indeterminate')
    gui.add(checkbox, 'disabled').name('Disabled')

    const properties = new UIProperties({ fill: parameters.material }, pointer, uioptions, gui)
    this.panel.add(properties)
    properties.getColorPicker = () => { return new UIColorPicker({}, pointer, uioptions) }
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

}

class ExpansionUINode extends FlowUINode {
  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, uioptions: UIOptions) {
    super(diagram, parameters, uioptions)

    const pointer = this.uidiagram.diagramoptions.pointer

    const maxwidth = this.width - 0.1
    const params: ExpansionPanelParameters = {
      label: { text: 'Three Flow' },
      width: maxwidth,
      panel: { width: maxwidth, height: 0.1, fill: { color: 'green' } }
    }
    const expansionPanel = new UIExpansionPanel(params, pointer, this.uioptions)
    this.panel.add(expansionPanel)
    expansionPanel.position.set(0, this.height / 2 - this.titleheight, 0.001)

    const gui = new GUI({})

    gui.add(expansionPanel, 'text').name('Text')
    gui.add(expansionPanel, 'width', 0.2, maxwidth, 0.1).name('Width')
    gui.add(expansionPanel, 'radius', 0, 0.05, 0.01).name('Radius')
    gui.addColor(expansionPanel, 'color').name('Color')
    gui.add(expansionPanel, 'spacing', 0, 0.03, 0.01).name('Space to Panel')

    const properties = new UIProperties({ fill: parameters.material }, pointer, uioptions, gui)
    this.panel.add(properties)
    properties.getColorPicker = () => { return new UIColorPicker({}, pointer, uioptions) }
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

}
