import { ThreeInteractive } from "three-flow";
import { TextButtonParameters } from "./model";
import { MeshBasicMaterial } from "three";
import { UITextButton } from "./button-text";
import { ButtonEventType, ButtonOptions } from "./button";

export enum UIKeyEventType {
  LOCK_STATE = 'lock_state',
  SET_TEXT = 'set_text',
}
export class UIKey extends UITextButton {
  constructor(parameters: TextButtonParameters, interactive: ThreeInteractive, options: ButtonOptions = {}) {
    super(parameters, interactive, options)

    const original = this.material
    const highlight = new MeshBasicMaterial({ color: 'green' })

    this.addEventListener(UIKeyEventType.LOCK_STATE, (e: any) => {
      const state = e.state as boolean
      this.material = state ? highlight : original
    })

    this.addEventListener(ButtonEventType.BUTTON_DOWN, (e: any) => { this.buttonDown()})
    this.addEventListener(ButtonEventType.BUTTON_UP, (e: any) => { this.buttonUp()})
    this.addEventListener(UIKeyEventType.SET_TEXT, (e: any) => { this.text = e.text})
  }

}
