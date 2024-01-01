import { ThreeInteractive } from "three-flow";
import { PanelOptions } from "./panel";
import { ColorEntryParameters } from "./model";
import { MeshBasicMaterial } from "three";
import { InputFieldType, UIEntry } from "./input-field";

export enum ColorEntryEventType {
  VALUE_CHANGED = 'value_changed'
}
export interface ColorEntryOptions extends PanelOptions { }

export class UIColorEntry extends UIEntry {
  inputtype: InputFieldType = 'color'

  private _value = 'black'
  get value() { return this._value }
  set value(newvalue: string) {
    if (this._value != newvalue) {
      this._value = newvalue
      this.dispatchEvent<any>({ type: ColorEntryEventType.VALUE_CHANGED })
    }
  }

  constructor(parameters: ColorEntryParameters, interactive: ThreeInteractive, options: ColorEntryOptions = {}) {
    if (parameters.height == undefined) parameters.height = 0.1
    
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'color-entry'

    this.addEventListener(ColorEntryEventType.VALUE_CHANGED, () => {
      (this.material as MeshBasicMaterial).color.set(this.value)
    })
  }
}
