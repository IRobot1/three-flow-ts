
import { ThreeInteractive } from "three-flow";
import { PanelOptions, UIPanel } from "./panel";
import { ButtonParameters, LabelParameters, PanelParameters, TextButtonParameters } from "./model";
import { Controller, GUI } from "./gui";
import { ButtonEventType, UIButton } from "./button";
import { UITextButton } from "./button-text";
import { InteractiveEventType } from "../../../dist/three-flow/fesm2020/three-flow-js.mjs";
import { Object3D, Vector3 } from "three";
import { ExpansionPanelParameters, UIExpansionPanel } from "./expansion-panel";
import { UILabel } from "./label";

export interface PropertiesParameters extends PanelParameters {
  spacing?: number             // defaults to 0.01
}

export class UIProperties extends UIPanel {
  private spacing: number
  constructor(parameters: PropertiesParameters, protected interactive: ThreeInteractive, options: PanelOptions, gui: GUI) {
    super(parameters, options)

    this.spacing = parameters.spacing != undefined ? parameters.spacing : 0.02

    this.height = (this.spacing + 0.1) * gui.list.length + this.spacing

    this.addFolder(this, gui)
  }

  addFolder(parent: Object3D, gui: GUI): number {
    let y = this.height / 2 - this.spacing - 0.05
    gui.list.forEach(controller => {
      this.addChild(parent, controller, y)
      y -= this.spacing + 0.1
    })
    return (this.spacing + 0.1) * gui.list.length + this.spacing
  }

  addChild(parent: Object3D, controller: Controller, y: number) {
    if (controller.classname == 'function') {
      const disabled = !controller.enabled
      const params: TextButtonParameters = {
        label: {
          text: controller.title, maxwidth: this.parameters.width,
        },
      }
      const textbutton = new UITextButton(params, this.interactive, this.options)
      textbutton.addEventListener(ButtonEventType.BUTTON_PRESSED, () => {
        controller.execute()
      })
      parent.add(textbutton)
      textbutton.position.y = y
      return
    }
    else if (controller.classname == 'folder') {
      const params: ExpansionPanelParameters = {
        expanded: true,
        label: { text: controller.title },
        panel: {
          fill: { color: 'blue' }
        }
      }

      const expansionPanel = new UIExpansionPanel(params, this.interactive, this.options)
      expansionPanel.panelExpanded = (expanded: boolean) => {
        console.warn('panel expanded', expanded)
      }

      expansionPanel.panel.height = this.addFolder(expansionPanel.panel, controller.object as GUI)
      parent.add(expansionPanel)
      expansionPanel.position.y = y
      return
    }

    const labelparams: LabelParameters = {
      alignX: 'left',
      //alignY: 'middle',
      maxwidth: this.width,
      text: controller.title,
    }
    const label = new UILabel(labelparams, this.options)
    label.position.set(-this.width/2 , y, 0.001)
    parent.add(label)

    switch (controller.classname) {

      case 'number': {
        const hasrange = (controller._min || controller._max)

        //let slider: UISlider
        //if (hasrange) {
        //  width /= 2
        //  const slidersize: SliderSize = { width, height: 0.1, radius: size.radius, depth: size.depth }
        //  const thumbsize: ThumbSize = { width: 0.04, height: 0.1, radius: size.radius, depth: size.depth }
        //  slider = new UISlider(this.render, this.theme, slidersize, 0.02, thumbsize)
        //  slider.min = controller._min as number
        //  slider.max = controller._max as number
        //  slider.step = controller._step as number
        //  slider.disabled = !controller.enabled
        //  slider.value = this.numbervalue

        //  slider.addEventListener<SliderValueEvent>(SliderEventType.SLIDER_VALUE, (e) => {
        //    this.numbervalue = e.value
        //    numberentry.value = e.value
        //  })
        //  this.interact.selectable.add(slider)
        //  this.interact.draggable.add(slider)
        //  this.input.add(slider)
        //  horizontal.add(slider)
        //}

        //const numbersize: NumberEntrySize = { width, radius: size.radius, depth: size.depth }
        //const numberentry = new UINumberEntry(this.render, this.theme, numbersize)
        //numberentry.value = this.numbervalue
        //numberentry.decimals = controller._decimals
        //numberentry.disabled = !controller.enabled
        //numberentry.minvalue = controller._min as number
        //numberentry.maxvalue = controller._max as number

        //this.item.updateDisplay = () => {
        //  if (this.numbervalue != numberentry.value) {
        //    numberentry.value = this.numbervalue
        //    if (hasrange) slider.value = numberentry.value
        //  }
        //}

        //numberentry.addEventListener<NumberValueEvent>(NumberEntryEventType.NUMBER_VALUE_CHANGE, (e) => {
        //  this.numbervalue = e.value
        //  if (slider) slider.value = e.value
        //})
        //this.interact.selectable.add(numberentry)
        //this.input.add(numberentry)
        //horizontal.add(numberentry)
        break
      }

      case 'string': {
        //const textsize: TextEntrySize = { width: width, radius: size.radius, depth: size.depth }
        //const textentry = new UITextEntry(this.render, this.theme, textsize)
        //textentry.text = this.textvalue
        //textentry.disabled = !controller.enabled

        //this.item.updateDisplay = () => {
        //  if (this.textvalue != textentry.text) {
        //    textentry.text = this.textvalue
        //  }
        //}
        //textentry.addEventListener<TextValueEvent>(TextEntryEventType.TEXT_VALUE_CHANGE, (e) => {
        //  this.textvalue = e.value
        //})
        //this.interact.selectable.add(textentry)
        //this.input.add(textentry)
        //horizontal.add(textentry)
        break
      }

      case 'boolean': {
        //const checkboxsize: CheckboxSize = { width_height: 0.1, radius: size.radius, depth: size.depth }
        //const checkbox = new UICheckbox(this.render, this.theme, checkboxsize)
        //checkbox.checked = this.boolvalue
        //checkbox.disabled = !controller.enabled

        //this.item.updateDisplay = () => {
        //  if (this.boolvalue != checkbox.checked) {
        //    checkbox.checked = this.boolvalue
        //  }
        //}
        //checkbox.addEventListener<CheckboxCheckedEvent>(CheckboxEventType.CHECKBOX_CHECKED, (e) => {
        //  this.boolvalue = e.checked
        //})
        //this.interact.selectable.add(checkbox)
        //const mesh = new Mesh(new PlaneGeometry(width, 0.1), new MeshBasicMaterial({ transparent: true, opacity: 0 }))
        //mesh.add(checkbox)
        //horizontal.add(mesh)
        break
      }

      case 'options': {
        //const list = new UIList(this.render, this.theme, this.interact.selectable)
        //list.itemcount = 5
        //list.data = controller._min
        //this.interact.selectable.add(list)

        //const selectsize: ButtonSize = { width, height: 0.1, radius: size.radius, depth: size.depth }
        //const selectentry = new UISelectEntry(this.render, this.theme, list, selectsize)
        //selectentry.text = this.listvalue

        //this.item.updateDisplay = () => {
        //  if (this.listvalue != selectentry.text) {
        //    selectentry.text = this.listvalue
        //  }
        //}

        //selectentry.addEventListener<SelectChangeEvent>(SelectEventType.SELECT_CHANGE, (e) => {
        //  this.listvalue = e.text
        //})

        //this.interact.selectable.add(selectentry)
        //this.input.add(selectentry)
        //horizontal.add(selectentry)
        break
      }

      case 'color': {
        //width /= 2
        //const colorentry = new UIColorEntry(this.render, this.theme, this.input.colorpicker, this.colorvalue, { width, radius: size.radius, depth: size.depth });
        //colorentry.disabled = !controller.enabled


        //this.interact.selectable.add(colorentry)
        //this.input.add(colorentry)
        //horizontal.add(colorentry)

        //const textsize: TextEntrySize = { width, radius: size.radius, depth: size.depth }
        //const textentry = new UITextEntry(this.render, this.theme, textsize)

        //let color = this.normalizeColorString(this.colorvalue, controller.rgbscale)
        //this.colorvalue = colorentry.text = textentry.text = color

        //this.item.updateDisplay = () => {
        //  if (this.colorvalue != colorentry.text) {
        //    color = this.normalizeColorString(this.colorvalue, controller.rgbscale)
        //    colorentry.text = textentry.text = color
        //  }
        //}

        //colorentry.addEventListener<ColorValueEvent>(ColorEntryEventType.COLOR_VALUE_CHANGE, (e) => {
        //  textentry.text = this.colorvalue = e.value
        //})

        //horizontal.add(textentry)
        break
      }

      default:
        //console.warn('unhandled class', controller.classname)
        break
    }



  }
}
