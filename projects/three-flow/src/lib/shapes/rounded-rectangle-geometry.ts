import { ShapeGeometry } from "three";
import { RoundedRectangleShape } from "./rounded-rectangle-shape";

export class RoundedRectangleGeometry extends ShapeGeometry {
  constructor(width = 1, height = 1, radius = 0.1, curveSegments = 12) {
    super(new RoundedRectangleShape(width, height, radius), curveSegments)
  }
}
