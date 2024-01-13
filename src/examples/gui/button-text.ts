import { ThreeInteractive } from "three-flow";

import { TextButtonParameters } from "./model";
import { UILabel } from "./label";
import { ButtonOptions, UIButton } from "./button";

export class UITextButton extends UIButton {

  protected label: UILabel

  private _text = ''
  get text() { return this._text }
  set text(newvalue: string) {
    if (this._text != newvalue) {
      this._text = newvalue
      if (newvalue)
        this.label.text = newvalue
    }
  }

  constructor(parameters: TextButtonParameters, interactive: ThreeInteractive, options: ButtonOptions) {
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'text-button'

    const label = new UILabel(parameters.label, { fontCache: this.fontCache, materialCache: this.materialCache })
    this.add(label)

    let width = this.width
    if (label.maxwidth < width) width = label.maxwidth

    if (label.alignX == 'left')
      label.position.x = -(width - label.padding) / 2
    else if (label.alignX == 'right')
      label.position.x = (width + label.padding) / 2

    label.position.z = 0.001
    this.label = label
  }
}
