// @ts-ignore
import { Text } from "troika-three-text";
import { FlowLabel } from "three-flow";
import { Mesh } from "three";

export class TroikaFlowLabel extends FlowLabel {
  override createText(text: string, options: any): Mesh {
    const label = new Text();
    label.text = text;
    label.anchorX = "center";
    label.anchorY = 'middle';
    label.fontSize = 0.3;
    label.sync();
    return label;
  }
}
