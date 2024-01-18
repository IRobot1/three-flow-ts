import { Group, Object3D } from "three";

import { ThreeInteractive } from "three-flow";
import { PanelEventType, PanelOptions, UIPanel } from "./panel";
import { Controller, GUI } from "./gui";
import { CheckboxParameters, ColorEntryParameters, LabelParameters, ListParameters, NumberEntryParameters, PanelParameters, SliderbarParameters, TextButtonParameters, TextEntryParameters } from "./model";
import { ButtonEventType } from "./button";
import { UITextButton } from "./button-text";
import { ExpansionPanelParameters, UIExpansionPanel } from "./expansion-panel";
import { UILabel } from "./label";
import { SliderbarEventType, UISliderbar } from "./sliderbar";
import { NumberEntryEventType, UINumberEntry } from "./number-entry";
import { UITextEntry } from "./text-entry";
import { InputField, InputFieldEventType } from "./input-field";
import { CheckboxEventType, UICheckBox } from "./checkbox";
import { SelectParameters, UISelect } from "./select";
import { ColorEntryEventType, UIColorEntry } from "./color-entry";

export interface PropertiesParameters extends PanelParameters {
  spacing?: number             // defaults to 0.02
  propertyHeight?: number    // defaults to 0.1
  // fontSize?: number          // defaults to 0.04
}

interface HeightData {
  extraheight: number
  group: Group
  index: number
}

enum PropertiesEventType {
  UPDATE_POSITIONS = 'update_positions'
}

export class UIProperties extends UIPanel {
  private spacing: number
  private propertyHeight: number

  private inputs: Array<InputField> = []

  constructor(parameters: PropertiesParameters, protected interactive: ThreeInteractive, options: PanelOptions, gui: GUI) {
    super(parameters, options)

    this.name = parameters.id != undefined ? parameters.id : 'properties'

    this.spacing = parameters.spacing != undefined ? parameters.spacing : 0.02
    this.propertyHeight = parameters.propertyHeight != undefined ? parameters.propertyHeight : 0.1

    this.height = this.addFolder(this, gui)
    this.addEventListener(PanelEventType.HEIGHT_CHANGED, (e: any) => {
      this.resizeGeometry()
    })

    if (options.keyboard) options.keyboard.add(...this.inputs)
  }

  addFolder(parent: UIPanel, gui: GUI): number {
    const data: Array<HeightData> = []

    gui.list.forEach((controller, index) => {
      const item: HeightData = { extraheight: 0, group: new Group(), index }
      // child updates height and adds objects to group
      this.addChild(parent, controller, item)

      // add this group to the parent
      parent.add(item.group)
      data.push(item)
    })

    parent.addEventListener(PropertiesEventType.UPDATE_POSITIONS, () => {
      // reposition and set parent height
      parent.height = this.updatePositions(data)
    })

    return this.updatePositions(data)
  }

  private updatePositions(data: Array<HeightData>): number {
    const height = data.reduce((total, next) => total + this.propertyHeight + next.extraheight + this.spacing, this.spacing)

    let y = 0
    data.forEach((item, index) => {
      if (index == 0) y = height / 2 - this.spacing - this.propertyHeight / 2
      item.group.position.y = y
      y -= this.spacing + this.propertyHeight + item.extraheight
    })

    return height
  }

  addChild(parent: UIPanel, controller: Controller, data: HeightData) {
    const size = 0.04

    if (controller.classname == 'function') {
      const params: TextButtonParameters = {
        label: {
          text: controller.title, maxwidth: this.parameters.width, size,
        },
        width: this.width,
        //disabled: !controller.enable,
        fill: { color: 'gray' }
      }
      const textbutton = new UITextButton(params, this.interactive, this.options)
      textbutton.addEventListener(ButtonEventType.BUTTON_PRESSED, () => {
        controller.execute()
      })
      data.group.add(textbutton)
      textbutton.position.set(0, 0, 0.001)
      this.inputs.push(textbutton)
      return
    }
    else if (controller.classname == 'folder') {
      const gui = controller.object as GUI
      const params: ExpansionPanelParameters = {
        expanded: gui.expanded,
        spacing: 0,
        width: this.width,
        label: { text: controller.title, size },
        fill: { color: 'gray' },
        panel: {
          width: this.width,
          fill: { color: 'blue' },
        }
      }

      const expansionPanel = new UIExpansionPanel(params, this.interactive, this.options)
      expansionPanel.panelExpanded = (expanded: boolean) => {
        data.extraheight = expanded ? expansionPanel.panel.height : 0

        // notify all parent panels to reposition
        expansionPanel.traverseAncestors(next => {
          next.dispatchEvent<any>({ type: PropertiesEventType.UPDATE_POSITIONS })
        })
      }

      expansionPanel.panel.addEventListener(PanelEventType.HEIGHT_CHANGED, () => {
        if (expansionPanel.expanded)
          data.extraheight = expansionPanel.panel.height
      })

      expansionPanel.panel.height = this.addFolder(expansionPanel.panel, controller.object as GUI)
      if (expansionPanel.expanded) data.extraheight = expansionPanel.panel.height
      data.group.add(expansionPanel)
      expansionPanel.position.set(0, 0, 0.001)
      this.inputs.push(expansionPanel)
      return
    }

    const labelparams: LabelParameters = {
      alignX: 'left',
      maxwidth: this.width,
      text: controller.title,
      size
    }
    const label = new UILabel(labelparams, this.options)
    label.position.set(-this.width / 2 + this.spacing, 0, 0.001)
    data.group.add(label)

    switch (controller.classname) {

      case 'number': {
        const hasrange = (controller._min || controller._max)
        let width = this.width / 2 - this.spacing * 2

        let sliderbar: UISliderbar
        if (hasrange) {
          width -= width / 2 //+ this.spacing
          const sliderparams: SliderbarParameters = {
            width: width,
            slidersize: 0.03,
            min: controller._min as number,
            max: controller._max as number,
            step: controller._step as number,
            disabled: !controller.enabled,
            initialvalue: controller.getValue(),
            fill: { color: 'gray' }
          }

          sliderbar = new UISliderbar(sliderparams, this.interactive, this.options)
          this.add(sliderbar)
          sliderbar.position.set(this.spacing + width / 2, 0, 0.001)
          data.group.add(sliderbar)

          sliderbar.addEventListener<any>(SliderbarEventType.VALUE_CHANGED, (e: any) => {
            numberentry.value = e.value
          })
          this.inputs.push(sliderbar)
        }

        const numberparams: NumberEntryParameters = {
          initialvalue: controller.getValue(),
          width: width - this.spacing,
          label: { size },
          decimals: controller._decimals,
          disabled: !controller.enabled,
          min: controller._min as number,
          max: controller._max as number,
          step: controller._step as number,
          fill: { color: 'gray' }
        }
        const numberentry = new UINumberEntry(numberparams, this.interactive, this.options)
        if (hasrange)
          numberentry.position.set(this.spacing * 2 + width * 1.5, 0, 0.001)
        else
          numberentry.position.set(this.spacing + width / 2, 0, 0.001)
        data.group.add(numberentry)

        numberentry.addEventListener(NumberEntryEventType.VALUE_CHANGED, (e: any) => {
          if (sliderbar) sliderbar.value = e.value
        })
        this.inputs.push(numberentry)
        break
      }

      case 'string': {
        const params: TextEntryParameters = {
          width: this.width / 2 - this.spacing * 2,
          label: {
            text: 'test' // this.textvalue
          },
          //disabled : !controller.enabled
          fill: { color: 'gray' }
        }

        const textentry = new UITextEntry(params, this.interactive, this.options)
        textentry.position.set(this.width / 4, 0, 0.001)
        data.group.add(textentry)
        textentry.addEventListener(InputFieldEventType.TEXT_CHANGED, (e) => {
          //this.textvalue = e.value
        })

        this.inputs.push(textentry)
        break
      }

      case 'boolean': {
        const checkboxwidth = 0.1
        const params: CheckboxParameters = {
          checked: controller.getValue(),
          //disabled : !controller.enabled,
          width: checkboxwidth,
          fill: { color: 'gray' }
        }
        const checkbox = new UICheckBox(params, this.interactive, this.options)
        checkbox.position.set(this.spacing + checkboxwidth / 2, 0, 0.001)
        data.group.add(checkbox)

        checkbox.addEventListener(CheckboxEventType.CHECKED_CHANGED, (e) => {
          //this.boolvalue = e.checked
        })
        this.inputs.push(checkbox)
        break
      }

      case 'options': {
        const options: Array<{ label: string, value: number }> = []
        if (Array.isArray(controller._min)) {
          const values = controller._min as Array<any>
          values.forEach((value, index) => {
            options.push({ label: value.toString(), value })
          })
        }
        else { // assume its an object
          for (let key in controller._min) {
            options.push({ label: key, value: controller._min[key] })
          }
        }
        let initialvalue = controller.object[controller.property]
        let match = options.find(x => x.value == initialvalue)
        if (match)
          initialvalue = match.label
        else
          initialvalue = initialvalue.toString()

        const listparams: ListParameters = {
          width: this.width / 2 - this.spacing * 2,
          data: options,
          field: 'label',
          //itemheight: this.propertyHeight,
          itemcount: 5,
        }

        const selectparams: SelectParameters = {
          width: this.width / 2 - this.spacing * 2,
          label: {
            text: initialvalue,
            size
          },
          list: listparams,
          initialselected: initialvalue
        }
        const select = new UISelect(selectparams, this.interactive, this.options)
        data.group.add(select)
        select.position.set(this.width / 4, 0, 0.001)

        select.selected = (data: any) => {
          console.warn('selected', data)
        }

        //selectentry.addEventListener<SelectChangeEvent>(SelectEventType.SELECT_CHANGE, (e) => {
        //  this.listvalue = e.text
        //})

        this.inputs.push(select)
        break
      }

      case 'color': {
        const width = this.width / 4 - this.spacing * 2

        let color = this.normalizeColorString(controller.getValue(), controller.rgbscale)
        //this.colorvalue = colorentry.text = textentry.text = color

        const colorparams: ColorEntryParameters = {
          id: '',
          width,
          //disabled : !controller.enabled,
          fill: { color }
        }
        const colorentry = new UIColorEntry(colorparams, this.interactive, this.options)
        colorentry.position.set(this.spacing + width / 2, 0, 0.001)
        data.group.add(colorentry)
        colorentry.addEventListener(ColorEntryEventType.VALUE_CHANGED, (e) => {
          textentry.text = colorentry.value
        })

        const params: TextEntryParameters = {
          width,
          label: {
            text: color, size
          },
          //disabled : !controller.enabled
          fill: { color: 'gray' }
        }

        const textentry = new UITextEntry(params, this.interactive, this.options)
        textentry.position.set(this.spacing * 2 + width * 1.5, 0, 0.001)
        data.group.add(textentry)
        textentry.addEventListener(InputFieldEventType.TEXT_CHANGED, (e) => {
          colorentry.value = textentry.text
        })

        this.inputs.push(colorentry, textentry)
        break
      }

      default:
        //console.warn('unhandled class', controller.classname)
        break
    }
  }

  //
  // adapted from https://github.com/georgealways/lil-gui/blob/master/src/utils/normalizeColorString.js
  //
  normalizeColorString(original: any, rgbscale: number): string {

    let match, result;
    if (typeof original == 'number') {
      result = original.toString(16).padStart(6, '0')
    }
    else if (typeof original == 'string') {
      if (original.startsWith('rgb')) {
        const rgb = original.replace('rgb(', '').replace(')', '').split(',')
        result = parseInt(rgb[0]).toString(16).padStart(2, '0')
          + parseInt(rgb[1]).toString(16).padStart(2, '0')
          + parseInt(rgb[2]).toString(16).padStart(2, '0')
      }
      else {
        if (original.startsWith('#')) original = original.substring(1)
        result = parseInt(original, 16).toString(16)
      }
    }
    else {
      let r, g, b
      if (Array.isArray(original)) {
        r = original[0] as number
        g = original[1] as number
        b = original[2] as number
      }
      else { //if (typeof original == 'object')
        r = original['r'] as number
        g = original['g'] as number
        b = original['b'] as number
      }
      if (rgbscale < 255) {
        r *= 255
        g *= 255
        b *= 255
      }
      result = r.toString(16).padStart(2, '0')
        + g.toString(16).padStart(2, '0')
        + b.toString(16).padStart(2, '0')

    }
    return '#' + result

  }
}
