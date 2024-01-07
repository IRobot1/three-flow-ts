import { ThreeInteractive } from "three-flow"

import { TextOptions, UITextEntry } from "./text-entry"
import { NumberEntryParameters } from "./model"

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
    if (this._value != newvalue) {
      // avoid recursion by calling this.text
      const text = newvalue.toFixed(this.decimals)
      if (this.inRange(text, this.minvalue, this.maxvalue)) {
        this.text = text
        this._value = newvalue
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

    this._minvalue = newvalue;
    if (!this.inRange(this.text, newvalue, this.maxvalue))
      this.text = newvalue.toString()
  }

  private _maxvalue = Infinity
  get maxvalue(): number { return this._maxvalue }
  set maxvalue(newvalue: number) {
    if (newvalue == undefined) return

    this._maxvalue = newvalue;
    if (!this.inRange(this.text, this.minvalue, newvalue))
      this.text = newvalue.toString()

    let cur = this.value;
    let decimals = 0
    while (Math.floor(cur) !== cur) {
      cur *= 10
      decimals++
    }

    if (this.decimals == undefined || decimals > this.decimals) this.decimals = decimals + 1
  }

  public decimals: number | undefined

  constructor(parameters: NumberEntryParameters = {}, interactive: ThreeInteractive, options: NumberOptions = {}) {
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'number-entry'

    this.value = parameters.initialvalue != undefined ? parameters.initialvalue : 0
  }


  override filter(entry: UITextEntry, e: KeyboardEvent) {
    let allow = false

    if ('-+'.includes(e.key)) {
      // can start with +-
      if (entry.text.length == 0)
        allow = true
      else {
        // or can appear after exponent
        const last = entry.text.slice(-1)
        if (last == 'e' || last == 'E')
          allow = true
      }
    }
    else if ('.'.includes(e.key)) {
      // only allow one period
      if (!entry.text.includes('.'))
        allow = true
    }
    else if ('eE'.includes(e.key)) {
      // only allow one exponent
      if (!entry.text.includes('e') && !entry.text.includes('E'))
        allow = true
    }
    // confirm its a digit
    else if ('0123456789'.includes(e.key)) {
      allow = true
    }

    if (allow) entry.text += e.key
  }


}
