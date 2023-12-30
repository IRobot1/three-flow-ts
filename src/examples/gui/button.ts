import { ButtonParameters } from "./model";
import { PanelOptions, UIPanel } from "./panel";
import { UILabel } from "./label";

export interface ButtonOptions extends PanelOptions {
}

export class UIButton extends UIPanel {

  private label?: UILabel

  constructor(parameters: ButtonParameters, options: ButtonOptions = {}) {
    super(parameters, options)

    this.name = parameters.id != undefined ? parameters.id : 'button'

    if (parameters.label) {
      const label = new UILabel(parameters.label, { fontCache: this.fontCache, materialCache: this.materialCache })
      this.add(label)
      label.position.z = 0.001
      this.label = label
    }


  }
}
