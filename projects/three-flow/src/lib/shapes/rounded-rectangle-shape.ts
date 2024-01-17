import { Shape } from "three";

export class RoundedRectangleShape extends Shape {
  constructor(width: number, height: number, radius: number) {
    super()
    const halfwidth = width / 2
    const halfheight = height / 2

    this
      .moveTo(-halfwidth + radius, -halfheight)
      .lineTo(halfwidth - radius, -halfheight)
      .quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius)
      .lineTo(halfwidth, halfheight - radius)
      .quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight)
      .lineTo(-halfwidth + radius, halfheight)
      .quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius)
      .lineTo(-halfwidth, -halfheight + radius)
      .quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight)
  }
}

export class RoundedRectangleBorderShape extends RoundedRectangleShape {
  constructor(width = 1, height = 1, radius = 0.1, border = 0.1, curveSegments = 12) {
    super(width, height, radius)

    const halfborder = border / 2
    const ratio = (width + halfborder) / (width - halfborder)

    const innershape = new RoundedRectangleShape(width - halfborder, height - halfborder, radius * 1 / ratio)
    this.holes.push(new Shape(innershape.getPoints().reverse()));
  }
}

