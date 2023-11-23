// @ts-ignore
import { Text } from "troika-three-text";
import { FlowLabel } from "three-flow";
import { Mesh } from "three";

export class TroikaFlowLabel extends FlowLabel {
  override createText(text: string, options: any): Mesh {
    const label = new Text();
    label.text = text;
    label.anchorX = this.alignX
    label.anchorY = this.alignY
    label.fontSize = this.size
    label.sync();
    return label;
  }
}
