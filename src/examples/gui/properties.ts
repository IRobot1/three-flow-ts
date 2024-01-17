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
import { UIColorEntry } from "./color-entry";

export interface PropertiesParameters extends PanelParameters {
  spacing?: number             // defaults to 0.02
  propertyHeight?: number    // defaults to 0.1
  // fontSize?: number          // defaults to 0.04
}

interface HeightData {
  extraheight: number
  group: Group
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

    this.spacing = parameters.spacing != undefined ? parameters.spacing : 0.02
    this.propertyHeight = parameters.propertyHeight != undefined ? parameters.propertyHeight : 0.1

    this.addFolder(this, gui)

    if (options.keyboard) options.keyboard.add(...this.inputs)
  }

  addFolder(parent: UIPanel, gui: GUI): number {
    const data: Array<HeightData> = []

    gui.list.forEach(controller => {
      const item: HeightData = { extraheight: 0, group: new Group() }
      // child updates height and adds objects to group
      this.addChild(parent, controller, item)

      // add this group to the parent
      parent.add(item.group)
      data.push(item)
    })

    parent.addEventListener(PropertiesEventType.UPDATE_POSITIONS, () => {
      console.warn('update positions')
      this.updatePositions(data)
    })

    return this.updatePositions(data)
  }

  private updatePositions(data: Array<HeightData>): number {
    const height = data.reduce((total, next) => total + this.propertyHeight + next.extraheight + this.spacing, this.spacing)
    this.height = height

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
      const params: ExpansionPanelParameters = {
        expanded: true,
        spacing: 0,
        label: { text: controller.title, size },
        fill: { color: 'gray' },
        panel: {
          fill: { color: 'blue' },
        }
      }

      const expansionPanel = new UIExpansionPanel(params, this.interactive, this.options)
      expansionPanel.panelExpanded = (expanded: boolean) => {
        let height = expansionPanel.panel.height
        if (!expanded) height = -height
        data.extraheight += height
        parent.dispatchEvent<any>({ type: PropertiesEventType.UPDATE_POSITIONS })
      }

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
          checked: false, // this.boolvalue
          //disabled : !controller.enabled,
          width: checkboxwidth,
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
        const listparams: ListParameters = {
          width: this.width / 2 - this.spacing * 2,
          data: controller._min,
          //field: 'text',
          //orientation: 'vertical',
          //itemheight: 0.3,
          itemcount: 5,
        }

        const selectparams: SelectParameters = {
          width: this.width / 2 - this.spacing * 2,
          label: {
            text: 'Choose a Story', // this.listvalue
            size
          },
          list: listparams,
          //initialselected: 'Battling In The River'
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

        //let color = this.normalizeColorString(this.colorvalue, controller.rgbscale)
        //this.colorvalue = colorentry.text = textentry.text = color

        const colorparams: ColorEntryParameters = {
          width,
          //disabled : !controller.enabled,
          fill: { color: 'red' }
        }
        const colorentry = new UIColorEntry(colorparams, this.interactive, this.options)
        colorentry.position.set(this.spacing + width / 2, 0, 0.001)
        data.group.add(colorentry)
        colorentry.addEventListener(InputFieldEventType.TEXT_CHANGED, (e) => {
          //  textentry.text = this.colorvalue = e.value
        })

        const params: TextEntryParameters = {
          width,
          label: {
            text: 'test' // this.colorvalue
          },
          //disabled : !controller.enabled
          fill: { color: 'gray' }
        }

        const textentry = new UITextEntry(params, this.interactive, this.options)
        textentry.position.set(this.spacing * 2 + width * 1.5, 0, 0.001)
        data.group.add(textentry)
        textentry.addEventListener(InputFieldEventType.TEXT_CHANGED, (e) => {
          //  this.colorvalue = e.value
        })

        this.inputs.push(colorentry, textentry)
        break
      }

      default:
        //console.warn('unhandled class', controller.classname)
        break
    }
  }
}
