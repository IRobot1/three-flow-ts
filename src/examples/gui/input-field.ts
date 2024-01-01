import { BaseEvent, Mesh, Object3DEventMap } from "three"
import { UIKeyboardEvent } from "./keyboard";
import { PanelOptions, UIPanel } from "./panel";
import { ThreeInteractive } from "three-flow";
import { PanelParameters, TextParameters, UIEventType } from "./model";

export type InputFieldType = 'text' | 'number' | 'checkbox' | string

export enum InputFieldEventType {
  ACTIVE_CHANGED = 'active_changed',
  DISABLE_CHANGED = 'disable_changed',
  TEXT_CHANGED = 'text_changed',
  KEYDOWN = 'keydown',
}

export interface InputField extends Mesh {
  inputtype: InputFieldType
  active: boolean
  disabled: boolean
}


export abstract class UIEntry extends UIPanel implements InputField {
  abstract inputtype: InputFieldType 

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

  constructor(parameters: PanelParameters = {}, interactive: ThreeInteractive, options: PanelOptions = {}) {
    super(parameters, options)

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

      this.handleKeyDown(e)
    })

  }

  handleKeyDown(keyboard: UIKeyboardEvent) { }
}

