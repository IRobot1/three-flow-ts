// @ts-ignore
import { Text } from "troika-three-text";
import { FlowDiagram, FlowLabel, FlowLabelParameters } from "three-flow";
import { Mesh } from "three";

// https://protectwise.github.io/troika/troika-three-text/
// For list of icons, see https://fonts.google.com/icons

export class TroikaFlowLabel extends FlowLabel {
  override createText(text: string, options: any): Mesh {
    const label = new Text();
    label.text = text;
    if (this.isicon) {
      label.font = 'https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNa.woff'
      label.anchorX = 'center'
      label.anchorY = 'middle'
    }
    else {
      label.anchorX = this.alignX
      label.anchorY = this.alignY
      label.maxWidth = this.wrapwidth
      label.textAlign = this.textalign
    }
    label.fontSize = this.size
    label.sync();
    return label;
  }
}




