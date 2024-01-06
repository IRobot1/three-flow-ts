import { Shape, ShapeGeometry } from "three";
import { RoundedRectangleShape } from "./rounded-rectangle-shape";

export class RoundedRectangleGeometry extends ShapeGeometry {
  constructor(width = 1, height = 1, radius = 0.1, curveSegments = 12) {
    super(new RoundedRectangleShape(width, height, radius), curveSegments)
  }
}

export class RoundedRectangleBorderGeometry extends ShapeGeometry {
  constructor(width = 1, height = 1, radius = 0.1, border = 0.1, curveSegments = 12) {
    const halfborder = border / 2
    const ratio = (width + halfborder) / (width - halfborder)

    const outershape = new RoundedRectangleShape(width + halfborder, height + halfborder, radius * ratio)
    const innershape = new RoundedRectangleShape(width - halfborder, height - halfborder, radius * 1 / ratio)

    outershape.holes.push(new Shape(innershape.getPoints().reverse()));

    super(outershape, curveSegments)
  }
}

