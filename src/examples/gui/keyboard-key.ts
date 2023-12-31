import { ThreeInteractive } from "three-flow";
import { UIButton } from "./button";
import { ButtonParameters } from "./model";
import { MeshBasicMaterial } from "three";

export enum UIKeyEventTypes {
  LOCK_STATE = 'lock_state',
  BUTTON_DOWN = 'button_down',
  BUTTON_UP = 'button_up',
  SET_TEXT = 'set_text',
}
export class UIKey extends UIButton {
  constructor(parameters: ButtonParameters, interactive: ThreeInteractive) {
    super(parameters, interactive)

    const original = this.material
    const highlight = new MeshBasicMaterial({ color: 'green' })

    this.addEventListener(UIKeyEventTypes.LOCK_STATE, (e: any) => {
      const state = e.state as boolean
      this.material = state ? highlight : original
    })

    this.addEventListener(UIKeyEventTypes.BUTTON_DOWN, (e: any) => { this.buttonDown()})
    this.addEventListener(UIKeyEventTypes.BUTTON_UP, (e: any) => { this.buttonUp()})
    this.addEventListener(UIKeyEventTypes.SET_TEXT, (e: any) => { this.text = e.text})
  }

}
