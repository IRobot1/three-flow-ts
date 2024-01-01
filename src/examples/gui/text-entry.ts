import { InputField, InputFieldEventType } from "./input-field"
import { PanelOptions, UIPanel } from "./panel"
import { UIKeyboardEvent } from "./keyboard"
import { UILabel } from "./label"
import { TextParameters, UIEventType } from "./model"
import { ThreeInteractive } from "three-flow"

interface TextOptions extends PanelOptions {
}

export enum TextEntryEventType {
  TEXT_NORMAL = 'text_normal',
  TEXT_DISABLED = 'text_disabled',
  TEXT_HIGHLIGHT = 'text_highlight',
  TEXT_VALUE_CHANGE = 'text_value_change',
  TEXT_SIZE_CHANGE = 'text_size_change',
}

export interface TextEntrySize {
  width: number
  radius: number
  depth: number
}


export class UITextEntry extends UIPanel implements InputField {
  inputtype: string = 'text'

  private label: UILabel

  private _text = ''
  get text() { return this._text }
  set text(newvalue: string) {
    if (this._text != newvalue) {
      this._text = newvalue
      this.label.text = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: newvalue })
    }
  }


  private _active = false
  get active(): boolean { return this._active }
  set active(newvalue: boolean) {
    if (this._active != newvalue) {
      this._active = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.ACTIVE_CHANGED, active: newvalue })
    }
  }

  private _disabled = false
  get disabled(): boolean { return this._disabled }
  set disabled(newvalue: boolean) {
    if (this._disabled != newvalue) {
      this._disabled = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.DISABLE_CHANGED, active: newvalue })
    }
  }

  constructor(parameters: TextParameters = {}, interactive: ThreeInteractive, options: TextOptions = {}) {
    if (parameters.height == undefined) parameters.height = 0.1

    super(parameters, options)

    this.name = parameters.id != undefined ? parameters.id : 'text-entry'

    if (parameters.label == undefined) parameters.label = {}
    parameters.label.size = this.height / 2
    parameters.label.padding = (this.height / 0.1) * 0.02

    const label = new UILabel(parameters.label, { fontCache: this.fontCache, materialCache: this.materialCache })
    label.alignX = 'right'
    label.alignY = 'bottom'
    label.position.x = this.width / 2 - label.padding
    label.position.y = -label.height / 2 - label.padding
    label.position.z = 0.001
    this.label = label

    this.add(label)
    //label.cliptowidth = true
    this.text = label.text

    const selectableChanged = () => {
      if (this.selectable)
        interactive.selectable.add(this)
      else
        interactive.selectable.remove(this)
    }
    this.addEventListener(UIEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
    selectableChanged()


    this.addEventListener(InputFieldEventType.KEYDOWN, (event: any) => {
      const e = event.keyboard as UIKeyboardEvent
      if (!this.active) return

      if (e.code == 'Backspace')
        this.text = this.text.slice(0, -1)

      if (e.ctrlKey) {
        const key = e.code.toLowerCase();
        if (key == 'v') {
          navigator.clipboard.readText().then(text => {
            this.text += text;
          });
        }
        else if (key == 'c' || key == 'x') {
          navigator.clipboard.writeText(this.text).then(() => {
            if (e.code == 'x') {
              this.text = '';
            }
          });
        }
      }

      else if (e.key.length == 1)
        this.filter(this, e)


    })

    const textChanged = () => {
      if (this.password)
        label.text = '*'.repeat(this.text.length);
      else
        label.text = this.text;

      if (this.active)
        label.text += this.prompt
    }
    textChanged()

    this.addEventListener(InputFieldEventType.TEXT_CHANGED, textChanged)
    this.addEventListener(InputFieldEventType.ACTIVE_CHANGED, textChanged)
  }

  private _password = false
  get password() { return this._password }
  set password(newvalue: boolean) {
    if (this._password != newvalue) {

      this._password = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: this.text })
    }
  }

  private _prompt = '_'
  get prompt() { return this._prompt }
  set prompt(newvalue: string) {
    const changed = this._prompt != newvalue
    this._prompt = newvalue
    if (changed) this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, value: this.text })
  }


  filter(entry: InputField, e: UIKeyboardEvent) {
    entry.text += e.key
  }
}

