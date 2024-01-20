import { Shape } from "three";

export class RoundedRectangleShape extends Shape {
  constructor(width: number, height: number, radius: number, x = 0, y = 0) {
    super()

    this
      .moveTo(x, y + radius)
      .lineTo(x, height - radius)
      .quadraticCurveTo(x, height, x + radius, height)
      .lineTo(width - radius, height)
      .quadraticCurveTo(width, height, width, height - radius)
      .lineTo(width, y + radius)
      .quadraticCurveTo(width, y, width - radius, y)
      .lineTo(x + radius, y)
      .quadraticCurveTo(x, y, x, y + radius);
  }
}

export class RoundedRectangleBorderShape extends RoundedRectangleShape {
  constructor(width = 1, height = 1, radius = 0.1, border = 0.1, curveSegments = 12) {
    super(width, height, radius)

    const halfborder = border / 2
    const ratio = (width + halfborder) / (width - halfborder)

    const innershape = new RoundedRectangleShape(width - halfborder, height - halfborder, radius * 1 / ratio, halfborder, halfborder)
    this.holes.push(new Shape(innershape.getPoints().reverse()));
  }
}

