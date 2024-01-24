import { ThreeInteractive } from "three-flow"

import { TextOptions, UITextEntry } from "./text-entry"
import { NumberEntryParameters } from "./model"
import { UIKeyboardEvent } from "./keyboard"
import { InputFieldEventType } from "./input-field"

export enum NumberEntryEventType {
  VALUE_CHANGED = 'value_changed',
}
export interface NumberOptions extends TextOptions {
}

export class UINumberEntry extends UITextEntry {
  override inputtype: string = 'number'

  protected _value = NaN
  get value() { return this._value }
  set value(newvalue: number) {
    if (newvalue == undefined) return

    if (this._value != newvalue) {
      if (this.step != undefined && this.step > 0)
        newvalue = Math.round(newvalue / this.step) * this.step

      const text = newvalue.toFixed(this.decimals)
      this.text = text

      if (this.inRange(text, this.minvalue, this.maxvalue)) {
        this._value = +text
        this.dispatchEvent<any>({ type: NumberEntryEventType.VALUE_CHANGED, value: newvalue })
      }
    }
  }

  private inRange(text: string, minvalue: number, maxvalue: number): boolean {
    const value = parseFloat(text)
    const result = isNaN(value) || (isFinite(value) && (value >= minvalue && value <= maxvalue))
    //console.warn(value, result, text, minvalue, maxvalue)
    return result
  }


  private _minvalue = -Infinity
  get minvalue(): number { return this._minvalue }
  set minvalue(newvalue: number) {
    if (newvalue == undefined) return

    if (this._minvalue != newvalue) {
      this._minvalue = newvalue;
      if (!this.inRange(this.text, newvalue, this.maxvalue))
        this.text = newvalue.toString()
    }
  }

  private _maxvalue = Infinity
  get maxvalue(): number { return this._maxvalue }
  set maxvalue(newvalue: number) {
    if (newvalue == undefined) return

    if (this._maxvalue != newvalue) {

      this._maxvalue = newvalue;
      if (!this.inRange(this.text, this.minvalue, newvalue))
        this.text = newvalue.toString()
    }
  }

  private _decimals: number | undefined
  get decimals() { return this._decimals }
  set decimals(newvalue: number | undefined) {
    if (this._decimals != newvalue) {
      this._decimals = newvalue

      this.value = +this.value.toFixed(this.decimals)
    }
  }

  private _step: number | undefined
  get step() { return this._step }
  set step(newvalue: number | undefined) {
    if (this._step != newvalue) {
      this._step = newvalue

      if (this.step != undefined && this.step > 0)
        this.value = Math.round(this.value / this.step) * this.step
    }
  }

  constructor(parameters: NumberEntryParameters = {}, interactive: ThreeInteractive, options: NumberOptions = {}) {
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'number-entry'

    if (parameters.min != undefined) this.minvalue = parameters.min
    if (parameters.max != undefined) this.maxvalue = parameters.max
    this.step = parameters.step
    this.decimals = parameters.decimals
    if (this.decimals == undefined && this.step) {
      const decimalPart = this.step.toString().split(".")[1];
      if (decimalPart) this.decimals = decimalPart.length
    }

    if (parameters.initialvalue != undefined) this.value = parameters.initialvalue

    this.addEventListener(InputFieldEventType.ACTIVE_CHANGED, () => {
      if (!this.active) this.setValue()
    })
  }

  private setValue() {
    this.value = +this.text
    this.text = this.value.toString()
  }

  override handleKeyDown(e: UIKeyboardEvent) {
    super.handleKeyDown(e)

    if (this.disabled) return

    if (e.code == 'Enter') this.setValue()
  }

  override filter(e: KeyboardEvent) {
    let allow = false

    if ('-+'.includes(e.key)) {
      // can start with +-
      if (this.text.length == 0)
        allow = true
      else {
        // or can appear after exponent
        const last = this.text.slice(-1)
        if (last == 'e' || last == 'E')
          allow = true
      }
    }
    else if ('.'.includes(e.key)) {
      // only allow one period
      if (!this.text.includes('.'))
        allow = true
    }
    else if ('eE'.includes(e.key)) {
      // only allow one exponent
      if (!this.text.includes('e') && !this.text.includes('E'))
        allow = true
    }
    // confirm its a digit
    else if ('0123456789'.includes(e.key)) {
      allow = true
    }

    if (allow) this.text += e.key
  }


}
