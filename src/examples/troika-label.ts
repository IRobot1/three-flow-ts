// @ts-ignore
import { Text } from "troika-three-text";
import { FlowLabel } from "three-flow";
import { Mesh } from "three";

// https://protectwise.github.io/troika/troika-three-text/

export class TroikaFlowLabel extends FlowLabel {
  override createText(text: string, options: any): Mesh {
    const label = new Text();
    label.text = text;
    label.anchorX = this.alignX
    label.anchorY = this.alignY
    label.fontSize = this.size
    label.maxWidth = this.wrapwidth
    label.textAlign = this.textalign
    label.sync();
    return label;
  }
}
