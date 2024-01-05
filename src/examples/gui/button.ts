import { InteractiveEventType, ThreeInteractive } from "three-flow";

import { ButtonParameters, UIEventType } from "./model";
import { PanelOptions } from "./panel";
import { UIEntry } from "./input-field";
import { UIKeyboardEvent } from "./keyboard";

export enum ButtonEventType {
  HIGHLIGHT_BUTTON = 'highlight_button',
  UNHIGHLIGHT_BUTTON = 'unhighlight_button',
  BUTTON_DOWN = 'button_down',
  BUTTON_UP = 'button_up',
}

export interface ButtonOptions extends PanelOptions {
}

export class UIButton extends UIEntry {
  override inputtype: string = 'button'

  constructor(parameters: ButtonParameters, interactive: ThreeInteractive, options: ButtonOptions = {}) {
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'button'

    const selectableChanged = () => {
      if (this.selectable)
        interactive.selectable.add(this)
      else
        interactive.selectable.remove(this)
    }
    this.addEventListener(UIEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
    selectableChanged()


    const buttonDown = () => {
      if (this.clicking) return
      this.scale.addScalar(-0.04);
      this.clicking = true;
    }

    const buttonUp = (generateEvent = false) => {
      if (!this.clicking) return
      this.scale.addScalar(0.04);
      if (generateEvent) this.pressed()
      this.clicking = false;
    }

    this.addEventListener(InteractiveEventType.POINTERDOWN, buttonDown )
    this.addEventListener(InteractiveEventType.POINTERUP, () => { buttonUp(true) })
    this.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      buttonUp()
      this.unhighlight()
    })

    this.addEventListener(InteractiveEventType.CLICK, () => {
      if (!this.visible) return;

      // button down event already generated in POINTERDOWN event

      const timer = setTimeout(() => {
        buttonUp()
        clearTimeout(timer);
      }, 100);
    })

    this.buttonDown = buttonDown
    this.buttonUp = buttonUp

    this.addEventListener(ButtonEventType.HIGHLIGHT_BUTTON, () => { this.highlight() })
    this.addEventListener(ButtonEventType.UNHIGHLIGHT_BUTTON, () => { this.unhighlight() })
    this.addEventListener(ButtonEventType.BUTTON_DOWN, buttonDown)
    this.addEventListener(ButtonEventType.BUTTON_UP, (e: any) => {
      buttonUp(e.generateEvent)
    })
  }

  override handleKeyDown(e: UIKeyboardEvent) {
    if (e.code == 'Enter')
      this.buttonDown()
  }

  override handleKeyUp(e: UIKeyboardEvent) {
    if (e.code == 'Enter')
      this.buttonUp(true)
  }

  buttonDown() { }
  buttonUp(generateEvent = false) { }

  pressed() { this.dispatchEvent<any>({ type: UIEventType.BUTTON_PRESSED }) }
}
