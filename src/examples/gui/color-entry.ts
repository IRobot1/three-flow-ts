import { ThreeInteractive } from "three-flow";
import { PanelOptions } from "./panel";
import { ColorEntryParameters } from "./model";
import { UIEntry } from "./input-field";

export interface ColorEntryOptions extends PanelOptions { }

export class UIColorEntry extends UIEntry {
  inputtype: string = 'color'

  constructor(parameters: ColorEntryParameters, interactive: ThreeInteractive, options: ColorEntryOptions = {}) {
    if (parameters.height == undefined) parameters.height = 0.1

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'color-entry'
  }
}
