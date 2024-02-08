import { AmbientLight, AxesHelper, BufferGeometry, Color, MaterialParameters, Mesh, MeshBasicMaterialParameters, MeshPhongMaterial, MeshPhongMaterialParameters, PlaneGeometry, PointLight, Scene, Shape, ShapeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowDiagram, FlowDiagramOptions, FlowInteraction, FlowMaterials, FlowNode, FlowNodeParameters, InteractiveEventType, RoundedRectangleGeometry, ThreeInteractive } from "three-flow";
import {
  GUI, PropertiesParameters, UIProperties,
  LabelParameters, NumberEntryParameters, SelectParameters, SliderbarParameters,
  TextButtonParameters, TextEntryParameters, UIOptions,
  FontCache, KeyboardInteraction, UIColorPicker, PanelOptions, ExpansionPanelParameters,
  UIExpansionPanel, UILabel, UIButton, UITextButton, UISliderbar, NumberOptions, UINumberEntry,
  UITextEntry, UISelect, UIMaterials, ButtonOptions, PointerInteraction, UICheckbox, SliderbarEventType, PointerEventType
} from "three-fluix";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

interface MenuAction {
  buttontext: string
  isicon: boolean
  description: string
  action(parameters: MenuAction): void
}

interface MenuParameters extends FlowNodeParameters {
  menu: Array<MenuAction>
  start?: MenuAction
  end?: MenuAction
}

interface UserInterfaceDiagramOptions extends FlowDiagramOptions {
  pointer: ThreeInteractive
  uioptions: UIOptions
}

export class UserInterfaceExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    app.enableStats()

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 2

    scene.background = new Color(0)

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
    app.pointer.addEventListener(InteractiveEventType.DRAGSTART, disableRotate)
    app.pointer.addEventListener(InteractiveEventType.DRAGEND, enableRotate)

    //scene.add(new AxesHelper(1))

    const materials = new FlowMaterials()
    materials.createMeshMaterial = (parameters: MaterialParameters) => {
      return new MeshPhongMaterial(parameters)
    }

    console.warn(document.children)

    const loader = new FontLoader();
    loader.load("assets/helvetiker_regular.typeface.json", (font) => {

      const diagramoptions: UserInterfaceDiagramOptions = {
        fonts: new Map<string, Font>([
          ['default', font],
        ]),
        materialCache: materials,
        pointer: app.interactive,
        uioptions: {
          materials: new UIMaterials,
          fontCache: new FontCache(),
          keyboard: new KeyboardInteraction(app)
        }

      }

      const flow = new UserInterfaceDiagram(diagramoptions, app.pointer)
      scene.add(flow);

      const interactive = new FlowInteraction(flow, app.interactive)

      const menu: Array<MenuAction> = [
        {
          buttontext: 'label', isicon: true, description: 'Labels', action: (p: MenuAction) => {
            if (flow.hasNode('label')) return

            const nodeparams: FlowNodeParameters = {
              id: 'label',
              x: -0.5, y: 0.5,
              type: 'label',
              material: { color: 'steelblue' },
              label: { text: p.description, size: 0.07, },
              //width:1.3,
              height: 1.6,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          buttontext: 'smart_button', isicon: true, description: 'Buttons', action: (p: MenuAction) => {
            if (flow.hasNode('button')) return

            const nodeparams: FlowNodeParameters = {
              id: 'button',
              x: -0.4, y: 0.4,
              z: 0.01,
              type: 'button',
              material: { color: 'lightsteelblue' },
              label: { text: p.description, size: 0.07, },
              //width:1.3,
              height: 1.6,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          buttontext: 'check_box', isicon: true, description: 'Checkboxes', action: (p: MenuAction) => {
            if (flow.hasNode('checkbox')) return

            const nodeparams: FlowNodeParameters = {
              id: 'checkbox',
              x: -0.3, y: 0.3,
              z: 0.02,
              type: 'checkbox',
              material: { color: 'lime' },
              label: { text: p.description, size: 0.07, },
              //width:1.3,
              height: 1.1,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          buttontext: 'expand', isicon: true, description: 'Expansion Panel', action: (p: MenuAction) => {
            if (flow.hasNode('expand')) return

            const nodeparams: FlowNodeParameters = {
              id: 'expand',
              x: -0.2, y: 0.2,
              z: 0.03,
              type: 'expansion',
              material: { color: 'green' },
              label: { text: p.description, size: 0.07, },
              //width:1.3,
              height: 1.1,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          buttontext: 'pin', isicon: true, description: 'Number Entry', action: (p: MenuAction) => {
            if (flow.hasNode('number')) return

            const nodeparams: FlowNodeParameters = {
              id: 'number',
              x: -0.1, y: 0.1,
              z: 0.04,
              type: 'number',
              material: { color: '#CCCCFF' },
              label: { text: p.description, size: 0.07, },
              //width:1.3,
              height: 1.1,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          buttontext: 'linear_scale', isicon: true, description: 'Slider Bar', action: (p: MenuAction) => {
            if (flow.hasNode('slider')) return

            const nodeparams: FlowNodeParameters = {
              id: 'slider',
              x: 0, y: 0,
              z: 0.05,
              type: 'slider',
              material: { color: '#CF9FFF' },
              label: { text: p.description, size: 0.07, },
              //width:1.3,
              height: 1.1,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        {
          buttontext: 'text_format', isicon: true, description: 'Text Entry', action: (p: MenuAction) => {
            if (flow.hasNode('text')) return

            const nodeparams: FlowNodeParameters = {
              id: 'text',
              x: 0.1, y: -0.1,
              z: 0.06,
              type: 'text',
              material: { color: 'cyan' },
              label: { text: p.description, size: 0.07, },
              //width:1.3,
              height: 1.1,
              resizable: false, scalable: false,
            }
            flow.addNode(nodeparams)
          }
        },
        //{ text: '', isicon: true, action: () => { console.warn('finances clicked') } },
      ]

      const menuparams: MenuParameters = {
        menu,
        //start: { text: 'XR', isicon: false, action: () => { /*app.enterVR()*/ } },
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
        app.disableStats()
      }
    })
  }
}
class UserInterfaceDiagram extends FlowDiagram {

  constructor(public diagramoptions: UserInterfaceDiagramOptions, private pointer: PointerInteraction,) {
    super(diagramoptions)
  }

  override createNode(parameters: MenuParameters): FlowNode {
    const uioptions = this.diagramoptions.uioptions
    if (parameters.type == 'menu')
      return new MenuUINode(this, parameters, this.pointer, uioptions)
    else if (parameters.type == 'label')
      return new LabelUINode(this, parameters, this.pointer, uioptions)
    else if (parameters.type == 'button')
      return new ButtonUINode(this, parameters, this.pointer, uioptions)
    else if (parameters.type == 'checkbox')
      return new CheckboxUINode(this, parameters, this.pointer, uioptions)
    else if (parameters.type == 'expansion')
      return new ExpansionUINode(this, parameters, this.pointer, uioptions)
    else if (parameters.type == 'number')
      return new NumberEntryUINode(this, parameters, this.pointer, uioptions)
    else if (parameters.type == 'slider')
      return new SliderbarUINode(this, parameters, this.pointer, uioptions)
    else if (parameters.type == 'text')
      return new TextEntryUINode(this, parameters, this.pointer, uioptions)

    return new FlowUINode(this, parameters, this.pointer, uioptions)
  }
}


type ArchType = 'top' | 'bottom'
class MenuUINode extends FlowNode {
  constructor(diagram: UserInterfaceDiagram, parameters: MenuParameters, pointer: PointerInteraction, uioptions: UIOptions) {
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

    if (parameters.start) {

      const startparams: TextButtonParameters = {
        label: { text: parameters.start.buttontext, isicon: parameters.start.isicon, size: 0.05 },
        width: 0.15, height: 0.12, radius: 0.06,
      }
      const startbutton = new MenuTextButton(startparams, pointer, uioptions)
      this.add(startbutton)
      startbutton.position.set(0, 0, 0.001)

      startbutton.pressed = () => { parameters.start!.action(parameters.start!) }
    }

    let y = -0.3
    parameters.menu.forEach(item => {
      const params: TextButtonParameters = {
        label: { text: item.buttontext, isicon: item.isicon, size: 0.06 },
        width: 0.12, height: 0.12, radius: 0.06,
      }
      const button = new MenuTextButton(params, pointer, uioptions)
      this.add(button)
      button.position.set(0, y, 0.001)
      y -= 0.18

      button.pressed = () => { item.action(item) }

      const labelparams: LabelParameters = {
        text: item.description, material: { color: 'white' },
        alignX: 'right'
      }
      const label = new UILabel(labelparams, uioptions)
      button.add(label)
      label.position.set(-params.width!, 0, 0.1)
      label.visible = false

      button.highlight = () => { label.visible = true }
      button.unhighlight = () => { label.visible = false }
    })

    if (parameters.end) {
      const endparams: TextButtonParameters = {
        label: { text: parameters.end.buttontext, isicon: parameters.end.isicon, size: 0.05 },
        width: 0.12, height: 0.12, radius: 0.06,
      }

      const endbutton = new MenuTextButton(endparams, pointer, uioptions)
      archmesh.add(endbutton)
      endbutton.position.set(0, 0, 0.001)

      endbutton.pressed = () => { parameters.end!.action(parameters.end!) }
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
  constructor(parameters: TextButtonParameters, pointer: PointerInteraction, options: ButtonOptions) {
    super(parameters, pointer, options)
  }

}


class FlowUINode extends FlowNode {
  titleheight = 0.15
  panel: Mesh
  private properties?: UIProperties

  constructor(protected uidiagram: UserInterfaceDiagram, parameters: FlowNodeParameters, protected pointer: PointerInteraction, protected uioptions: UIOptions) {
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

    const closebutton = new UITextButton(params, pointer, uioptions)
    this.add(closebutton)
    closebutton.position.set((this.width - buttonwidth * 1.5) / 2, 0, 0.001)

    closebutton.pressed = () => {
      uidiagram.removeNode(this)
    }
  }

  addProperties(parameters: PropertiesParameters, gui: GUI): UIProperties {
    this.properties = new UIProperties(parameters, this.pointer, this.uioptions, gui)
    this.panel.add(this.properties)
    return this.properties
  }

  override dispose() {
    super.dispose()
    if (this.properties)
      this.properties.dispose()
  }

  override createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new ArchGeometry('top', this.width, this.titleheight)
  }

}
class LabelUINode extends FlowUINode {
  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, uioptions: UIOptions) {
    super(diagram, parameters, pointer, uioptions)

    const maxwidth = this.width - 0.1
    const params: LabelParameters = {
      text: 'Three Flow', material: { color: '#111' },
      maxwidth
    }
    const label = new UILabel(params, this.uioptions)
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
    //gui.add(fake, 'fontName', ['helvetiker', 'gentilis', 'optimer']).name('Font').onChange(() => {
    //  switch (fake.fontName) {
    //    case 'helvetiker':
    //      label.fontName = 'assets/helvetiker_regular.typeface.json'
    //      break;
    //    case 'gentilis':
    //      label.fontName = 'assets/gentilis_regular.typeface.json'
    //      break;
    //    case 'optimer':
    //      label.fontName = 'assets/optimer_regular.typeface.json'
    //      break
    //  }
    //})
    //gui.add(label, 'padding', 0, 0.1, 0.01).name('Padding')
    gui.add(label, 'maxwidth', 0.1, maxwidth, 0.1).name('Maximum Width')
    gui.add(label, 'overflow', ['slice', 'clip']).name('Overflow')

    const colorpicker = new UIColorPicker({}, pointer, uioptions)

    const properties = this.addProperties({ fill: parameters.material }, gui)
    properties.getColorPicker = () => { return colorpicker }
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

}

class ButtonUINode extends FlowUINode {
  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, uioptions: UIOptions) {
    super(diagram, parameters, pointer, uioptions)

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
    //gui.add(fake, 'fontName', ['helvetiker', 'gentilis', 'optimer']).name('Font').onChange(() => {
    //  switch (fake.fontName) {
    //    case 'helvetiker':
    //      button.label.fontName = 'assets/helvetiker_regular.typeface.json'
    //      break;
    //    case 'gentilis':
    //      button.label.fontName = 'assets/gentilis_regular.typeface.json'
    //      break;
    //    case 'optimer':
    //      button.label.fontName = 'assets/optimer_regular.typeface.json'
    //      break
    //  }
    //})

    const properties = this.addProperties({ fill: parameters.material }, gui)
    properties.getColorPicker = () => { return new UIColorPicker({}, pointer, uioptions) }
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

}

class CheckboxUINode extends FlowUINode {
  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, uioptions: UIOptions) {
    super(diagram, parameters, pointer, uioptions)

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

    const properties = this.addProperties({ fill: parameters.material }, gui)
    properties.getColorPicker = () => { return new UIColorPicker({}, pointer, uioptions) }
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

}

class ExpansionUINode extends FlowUINode {
  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, uioptions: UIOptions) {
    super(diagram, parameters, pointer, uioptions)

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

    const properties = this.addProperties({ fill: parameters.material }, gui)
    properties.getColorPicker = () => { return new UIColorPicker({}, pointer, uioptions) }
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

}


class NumberEntryUINode extends FlowUINode {
  private numberEntry: UINumberEntry

  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, uioptions: UIOptions) {
    super(diagram, parameters, pointer, uioptions)

    const maxwidth = this.width - 0.1
    const params: NumberEntryParameters = {
      width: maxwidth,
      min: -10, max: 10, step: 0, decimals: 0, initialvalue: 0
    }
    const numberEntry = new UINumberEntry(params, pointer, this.uioptions)
    this.panel.add(numberEntry)
    numberEntry.position.set(0, this.height / 2 - this.titleheight, 0.001)

    this.uioptions.keyboard!.add(numberEntry)
    this.numberEntry = numberEntry

    const gui = new GUI({})

    gui.add(numberEntry, 'width', 0.2, maxwidth, 0.1).name('Width')
    gui.add(numberEntry, 'minvalue', -10, 0, 1).name('Minimum')
    gui.add(numberEntry, 'maxvalue', 0, 10, 1).name('Maximum')
    gui.add(numberEntry, 'decimals', 0, 5, 1).name('Decimals')
    gui.add(numberEntry, 'step', 0, 1.5, 0.25).name('Step')

    const properties = this.addProperties({ fill: parameters.material }, gui)
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

  override dispose() {
    super.dispose()

    this.uioptions.keyboard!.remove(this.numberEntry)
  }
}
class SliderbarUINode extends FlowUINode {
  private sliderbar: UISliderbar

  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, uioptions: UIOptions) {
    super(diagram, parameters, pointer, uioptions)

    const maxwidth = this.width - 0.1
    const params: SliderbarParameters = {
      width: maxwidth,
      min: -10, max: 10, step: 0, initialvalue: 0
    }
    const sliderbar = new UISliderbar(params, pointer, this.uioptions)
    this.panel.add(sliderbar)
    sliderbar.position.set(0, this.height / 2 - this.titleheight, 0.001)
    sliderbar.addEventListener<any>(SliderbarEventType.VALUE_CHANGED, (e) => {
      label.text = e.value.toFixed(2)
    })

    const labelparams: LabelParameters = {
      text: '', material: { color: '#111' },
      maxwidth
    }
    const label = new UILabel(labelparams, this.uioptions)
    this.panel.add(label)
    label.position.set(0, this.height / 2 - this.titleheight * 2, 0.001)

    this.uioptions.keyboard!.add(sliderbar)
    this.sliderbar = sliderbar

    const gui = new GUI({})

    gui.add(sliderbar, 'min', -10, 0, 1).name('Minimum')
    gui.add(sliderbar, 'max', 0, 10, 1).name('Maximum')
    gui.add(sliderbar, 'step', 0, 2, 0.25).name('Step')
    gui.add(sliderbar, 'slidersize', 0.03, 0.2, 0.01).name('Slider Size')

    const properties = this.addProperties({ fill: parameters.material }, gui)
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

  override dispose() {
    super.dispose()

    this.uioptions.keyboard!.remove(this.sliderbar)
  }
}
class TextEntryUINode extends FlowUINode {
  private textEntry: UITextEntry

  constructor(diagram: UserInterfaceDiagram, parameters: FlowNodeParameters, pointer: PointerInteraction, uioptions: UIOptions) {
    super(diagram, parameters, pointer, uioptions)

    const maxwidth = this.width - 0.1
    const params: TextEntryParameters = {
      width: maxwidth, label: { text: 'Three Flow' }
    }
    const textEntry = new UITextEntry(params, pointer, this.uioptions)
    this.panel.add(textEntry)
    textEntry.position.set(0, this.height / 2 - this.titleheight, 0.001)

    this.uioptions.keyboard!.add(textEntry)
    this.textEntry = textEntry

    const gui = new GUI({})

    gui.add(textEntry, 'width', 0.2, maxwidth, 0.1).name('Width')
    gui.add(textEntry, 'password').name('Is Password')
    gui.add(textEntry, 'passwordChar', 1).name('Password Character')
    //gui.add(textentry, 'prompt').name('Prompt')

    const properties = this.addProperties({ fill: parameters.material }, gui)
    properties.position.y = -0.1
    properties.position.z = 0.001
  }

  override dispose() {
    super.dispose()
    this.uioptions.keyboard!.remove(this.textEntry)
  }
}
