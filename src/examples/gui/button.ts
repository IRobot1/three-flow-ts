import { InteractiveEventType, ThreeInteractive } from "three-flow";

import { ButtonParameters, UIEventType } from "./model";
import { PanelOptions, UIPanel } from "./panel";
import { UILabel } from "./label";

export enum ButtonEventType {
  HIGHLIGHT_BUTTON = 'highlight_button',
  UNHIGHLIGHT_BUTTON = 'unhighlight_button',
  BUTTON_DOWN = 'button_down',
  BUTTON_UP = 'button_up',
}

export interface ButtonOptions extends PanelOptions {
}

export class UIButton extends UIPanel {

  private label?: UILabel

  private _text = ''
  get text() { return this._text }
  set text(newvalue: string) {
    if (this._text != newvalue) {
      this._text = newvalue
      if (newvalue && this.label)
        this.label.text = newvalue
    }
  }

  constructor(parameters: ButtonParameters, interactive: ThreeInteractive, options: ButtonOptions = {}) {
    super(parameters, options)

    this.name = parameters.id != undefined ? parameters.id : 'button'

    if (parameters.label) {
      const label = new UILabel(parameters.label, { fontCache: this.fontCache, materialCache: this.materialCache })
      this.add(label)
      label.position.z = 0.001
      this.label = label
    }



    const selectableChanged = () => {
      if (this.selectable)
        interactive.selectable.add(this)
      else
        interactive.selectable.remove(this)
    }
    this.addEventListener(UIEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
    selectableChanged()


    const buttonDown = (generateEvent = false) => {
      if (this.clicking) return
      this.scale.addScalar(-0.04);
      if (generateEvent) this.pressed()
      this.clicking = true;
    }

    const buttonUp = () => {
      if (!this.clicking) return
      this.scale.addScalar(0.04);
      this.clicking = false;
    }

    this.addEventListener(InteractiveEventType.POINTERDOWN, () => { buttonDown(true) })
    this.addEventListener(InteractiveEventType.POINTERUP, buttonUp)
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
    this.addEventListener(ButtonEventType.BUTTON_DOWN, (e: any) => {
      buttonDown(e.generateEvent)
    })
    this.addEventListener(ButtonEventType.BUTTON_UP, buttonUp)
  }

  buttonDown(generateEvent = false) { }
  buttonUp() { }

  pressed() { this.dispatchEvent<any>({ type: UIEventType.BUTTON_PRESSED }) }


}
