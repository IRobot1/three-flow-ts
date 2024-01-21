import { ThreeInteractive } from "three-flow";

import { TextButtonParameters } from "./model";
import { UILabel } from "./label";
import { ButtonOptions, UIButton } from "./button";
import { PanelEventType } from "./panel";

export class UITextButton extends UIButton {

  readonly label: UILabel

  get text() { return this.label.text }
  set text(newvalue: string) {
    if (this.label.text != newvalue) {
      this.label.text = newvalue
    }
  }

  get isicon() { return this.label.isicon }
  set isicon(newvalue: boolean) {
    if (this.label.isicon != newvalue) {
      this.label.isicon = newvalue;
    }
  }

  constructor(parameters: TextButtonParameters, interactive: ThreeInteractive, options: ButtonOptions) {
    if (!parameters.height) parameters.height = 0.1

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'text-button'

    const label = new UILabel(parameters.label, { fontCache: this.fontCache, materials: this.materials })
    this.add(label)

    let width = this.width
    if (label.maxwidth < width) width = label.maxwidth

    if (label.alignX == 'left')
      label.position.x = -(width - label.padding) / 2
    else if (label.alignX == 'right')
      label.position.x = (width + label.padding) / 2

    label.position.z = 0.001
    this.label = label

    this.addEventListener(PanelEventType.WIDTH_CHANGED, () => { label.maxwidth = this.width })
  }
}
