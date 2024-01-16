
import { ThreeInteractive } from "three-flow";
import { PanelOptions, UIPanel } from "./panel";
import { ButtonParameters, CheckboxParameters, ColorEntryParameters, LabelParameters, ListParameters, NumberEntryParameters, PanelParameters, SliderbarParameters, TextButtonParameters, TextEntryParameters } from "./model";
import { Controller, GUI } from "./gui";
import { ButtonEventType, UIButton } from "./button";
import { UITextButton } from "./button-text";
import { InteractiveEventType } from "../../../dist/three-flow/fesm2020/three-flow-js.mjs";
import { Object3D, Vector3 } from "three";
import { ExpansionPanelParameters, UIExpansionPanel } from "./expansion-panel";
import { UILabel } from "./label";
import { SliderbarEventType, UISliderbar } from "./sliderbar";
import { NumberEntryEventType, UINumberEntry } from "./number-entry";
import { UITextEntry } from "./text-entry";
import { InputFieldEventType } from "./input-field";
import { CheckboxEventType, UICheckBox } from "./checkbox";
import { SelectParameters, UISelect } from "./select";
import { UIColorEntry } from "./color-entry";

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
      parent.add(textbutton)
      textbutton.position.set(0, y, 0.001)
      return
    }
    else if (controller.classname == 'folder') {
      const params: ExpansionPanelParameters = {
        expanded: false,
        label: { text: controller.title, size },
        fill: { color: 'gray' },
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
      expansionPanel.position.set(0, y, 0.001)
      return
    }

    const labelparams: LabelParameters = {
      alignX: 'left',
      maxwidth: this.width,
      text: controller.title,
      size
    }
    const label = new UILabel(labelparams, this.options)
    label.position.set(-this.width / 2 + this.spacing, y, 0.001)
    parent.add(label)

    switch (controller.classname) {

      case 'number': {
        const hasrange = (controller._min || controller._max)
        let width = this.width / 2 - this.spacing * 2
        //let slider: UISlider
        if (hasrange) {
          width -= width / 2 //+ this.spacing
          const sliderparams: SliderbarParameters = {
            width: width,
            slidersize: 0.03,
            min: controller._min as number,
            max: controller._max as number,
            step: controller._step as number,
            //disabled : !controller.enabled,
            //value : this.numbervalue
            fill: { color: 'gray' }
          }

          const sliderbar = new UISliderbar(sliderparams, this.interactive, this.options)
          this.add(sliderbar)
          sliderbar.position.set(this.spacing + width / 2, y, 0.001)
          parent.add(sliderbar)
          sliderbar.addEventListener<any>(SliderbarEventType.VALUE_CHANGED, (e: any) => {
            //    this.numbervalue = e.value
            //    numberentry.value = e.value
          })

        }

        const numberparams: NumberEntryParameters = {
          initialvalue: 0,
          width: width - this.spacing,
          label: { size },
          //decimals : controller._decimals
          //disabled : !controller.enabled
          //min: controller._min as number,
          //max: controller._max as number,
          fill: { color: 'gray' }
        }
        const numberentry = new UINumberEntry(numberparams, this.interactive, this.options)
        if (hasrange)
          numberentry.position.set(this.spacing * 2 + width * 1.5, y, 0.001)
        else
          numberentry.position.set(this.spacing + width / 2, y, 0.001)
        parent.add(numberentry)

        numberentry.addEventListener(NumberEntryEventType.VALUE_CHANGED, (e) => {
          //  this.numbervalue = e.value
          //  if (slider) slider.value = e.value
        })
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
        textentry.position.set(this.width / 4, y, 0.001)
        parent.add(textentry)
        textentry.addEventListener(InputFieldEventType.TEXT_CHANGED, (e) => {
          //this.textvalue = e.value
        })

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
        checkbox.position.set(this.spacing + checkboxwidth / 2, y, 0.001)
        parent.add(checkbox)

        checkbox.addEventListener(CheckboxEventType.CHECKED_CHANGED, (e) => {
          //this.boolvalue = e.checked
        })
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
        parent.add(select)
        select.position.set(this.width / 4, y, 0.001)

        select.selected = (data: any) => {
          console.warn('selected', data)
        }

        //selectentry.addEventListener<SelectChangeEvent>(SelectEventType.SELECT_CHANGE, (e) => {
        //  this.listvalue = e.text
        //})

        break
      }

      case 'color': {
        const width = this.width / 4 - this.spacing *2

                //let color = this.normalizeColorString(this.colorvalue, controller.rgbscale)
        //this.colorvalue = colorentry.text = textentry.text = color

        const colorparams: ColorEntryParameters = {
          width  ,
        //disabled : !controller.enabled,
          fill: { color: 'red' }
        }
        const colorentry = new UIColorEntry(colorparams, this.interactive, this.options)
        colorentry.position.set(this.spacing + width / 2, y, 0.001)
        parent.add(colorentry)
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
        textentry.position.set(this.spacing * 2 + width * 1.5, y, 0.001)
        parent.add(textentry)
        textentry.addEventListener(InputFieldEventType.TEXT_CHANGED, (e) => {
        //  this.colorvalue = e.value
        })

        break
      }

      default:
        //console.warn('unhandled class', controller.classname)
        break
    }



  }
}
