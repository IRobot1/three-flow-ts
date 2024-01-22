import { InputField, InputFieldEventType, UIEntry } from "./input-field"
import { PanelOptions } from "./panel"
import { UIKeyboardEvent } from "./keyboard"
import { LabelEventType, UILabel } from "./label"
import { TextEntryParameters } from "./model"
import { ThreeInteractive } from "three-flow"
import { Box3, Box3Helper } from "three"

export interface TextOptions extends PanelOptions {
}


export class UITextEntry extends UIEntry implements InputField {
  inputtype: string = 'text'

  protected label: UILabel

  protected _text = ''
  get text() { return this._text }
  set text(newvalue: string) {
    if (this._text != newvalue) {
      this._text = newvalue
      this.label.text = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: newvalue })
    }
  }

  private _password: boolean
  get password() { return this._password }
  set password(newvalue: boolean) {
    if (this._password != newvalue) {
      this._password = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: this.text })
    }
  }

  private _prompt: string
  get prompt() { return this._prompt }
  set prompt(newvalue: string) {
    if (this._prompt != newvalue) {
      this._prompt = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: this.text })
    }
  }



  constructor(parameters: TextEntryParameters = {}, interactive: ThreeInteractive, options: TextOptions = {}) {
    if (parameters.height == undefined) parameters.height = 0.1

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'text-entry'

    const padding = (this.height / 0.1) * 0.02

    if (parameters.label == undefined) parameters.label = {}
    parameters.label.size = (this.height - padding) / 2
    parameters.label.padding = padding
    parameters.label.maxwidth = this.width - padding
    parameters.label.overflow = 'slice'

    const passwordChar = parameters.passwordChar != undefined ? parameters.passwordChar : '*'

    this._password = parameters.password != undefined ? parameters.password : false
    if (parameters.label.text && this.password)
      parameters.label.text = passwordChar.repeat(parameters.label.text.length);

    parameters.label.alignX = 'left'
    parameters.label.alignY = 'bottom'

    const label = new UILabel(parameters.label, { fontCache: this.fontCache, materials: this.materials })
    label.position.x = -this.width / 2 + label.padding
    label.position.y = -parameters.label.size / 2
    label.position.z = 0.001
    this.label = label

    this.add(label)

    this._prompt = parameters.prompt != undefined ? parameters.prompt : '_'

    this.text = label.text

    const textChanged = () => {
      if (this.disabled) return

      if (this.password)
        label.text = passwordChar.repeat(this.text.length);
      else
        label.text = this.text;

      if (this.active) {
        label.overflow = 'slice'
        label.text += this.prompt
      }
      else
        label.overflow = 'clip'
    }

    this.addEventListener(InputFieldEventType.TEXT_CHANGED, textChanged)
    this.addEventListener(InputFieldEventType.ACTIVE_CHANGED, textChanged)
  }

  override handleKeyDown(e: UIKeyboardEvent) {
    if (this.disabled) return

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
      this.filter(e)
  }



  filter(e: UIKeyboardEvent) {
    this.text += e.key
  }
}

