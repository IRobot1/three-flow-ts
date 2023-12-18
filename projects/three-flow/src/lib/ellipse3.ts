import { Curve, Vector3 } from "three";

export class EllipseCurve3D extends Curve<Vector3> {
  constructor(
    private aX = 0, private aY = 0, private aZ = 0,
    private xRadius = 1, private yRadius = 1, private zRadius = 1,
    private aStartAngle = 0, private aEndAngle = Math.PI * 2,
    private aClockwise = false, private aRotation = 0
  ) {
    super();

    // @ts-ignore
    this.type = 'EllipseCurve3D';

    this.aX = aX;
    this.aY = aY;
    this.aZ = aZ;

    this.xRadius = xRadius;
    this.yRadius = yRadius;
    this.zRadius = zRadius;

    this.aStartAngle = aStartAngle;
    this.aEndAngle = aEndAngle;

    this.aClockwise = aClockwise;

    this.aRotation = aRotation;
  }

  override getPoint(t: number, optionalTarget?: Vector3) {
    const point = optionalTarget || new Vector3();

    const twoPi = Math.PI * 2;
    let deltaAngle = this.aEndAngle - this.aStartAngle;
    const samePoints = Math.abs(deltaAngle) < Number.EPSILON;

    // ensures that deltaAngle is 0 .. 2 PI
    while (deltaAngle < 0) deltaAngle += twoPi;
    while (deltaAngle > twoPi) deltaAngle -= twoPi;

    if (deltaAngle < Number.EPSILON) {
      if (samePoints) {
        deltaAngle = 0;
      } else {
        deltaAngle = twoPi;
      }
    }

    if (this.aClockwise === true && !samePoints) {
      if (deltaAngle === twoPi) {
        deltaAngle = -twoPi;
      } else {
        deltaAngle = deltaAngle - twoPi;
      }
    }

    const angle = this.aStartAngle + t * deltaAngle;
    let x = this.aX + this.xRadius * Math.cos(angle);
    let y = this.aY + this.yRadius * Math.sin(angle);
    let z = this.aZ + this.zRadius * Math.sin(angle);  // Using the sine function for z

    if (this.aRotation !== 0) {
      const cos = Math.cos(this.aRotation);
      const sin = Math.sin(this.aRotation);

      const tx = x - this.aX;
      const ty = y - this.aY;

      // Rotate the point about the center of the ellipse in XY plane
      x = tx * cos - ty * sin + this.aX;
      y = tx * sin + ty * cos + this.aY;
    }

    return point.set(x, y, z);
  }
}
