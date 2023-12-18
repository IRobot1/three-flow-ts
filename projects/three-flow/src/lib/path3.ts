import { CatmullRomCurve3, CubicBezierCurve3, Curve, CurvePath, LineCurve3, QuadraticBezierCurve3, Vector3 } from "three";
import { EllipseCurve3D } from "./ellipse3";

export class Path3 extends CurvePath<Vector3> {
  currentPoint: Vector3
  constructor(points?: Vector3[]) {

    super();

    // @ts-ignore
    this.type = 'Path3';

    this.currentPoint = new Vector3();

    if (points) {

      this.setFromPoints(points);

    }

  }

  setFromPoints(points: Vector3[]) {

    this.moveTo(points[0].x, points[0].y, points[0].z);

    for (let i = 1, l = points.length; i < l; i++) {

      this.lineTo(points[i].x, points[i].y, points[i].z);

    }

    return this;

  }

  moveTo(x: number, y: number, z: number) {

    this.currentPoint.set(x, y, z);

    return this;

  }

  lineTo(x: number, y: number, z: number) {

    const curve = new LineCurve3(this.currentPoint.clone(), new Vector3(x, y, z));
    this.curves.push(curve);

    this.currentPoint.set(x, y, z);

    return this;

  }

  quadraticCurveTo(aCPx: number, aCPy: number, aCPz: number, aX: number, aY: number, aZ: number) {

    const curve = new QuadraticBezierCurve3(
      this.currentPoint.clone(),
      new Vector3(aCPx, aCPy, aCPz),
      new Vector3(aX, aY, aZ)
    );

    this.curves.push(curve);

    this.currentPoint.set(aX, aY, aZ);

    return this;

  }

  bezierCurveTo(aCP1x: number, aCP1y: number, aCP1z: number, aCP2x: number, aCP2y: number, aCP2z: number, aX: number, aY: number, aZ: number) {

    const curve = new CubicBezierCurve3(
      this.currentPoint.clone(),
      new Vector3(aCP1x, aCP1y, aCP1z),
      new Vector3(aCP2x, aCP2y, aCP2z),
      new Vector3(aX, aY, aZ)
    );

    this.curves.push(curve);

    this.currentPoint.set(aX, aY, aZ);

    return this;

  }

  splineThru(pts: Vector3[]) {

    const npts = [this.currentPoint.clone()].concat(pts);

    const curve = new CatmullRomCurve3(npts);
    this.curves.push(curve);

    this.currentPoint.copy(pts[pts.length - 1]);

    return this;

  }

  arc(aX = 0, aY = 0, aZ = 0,
    xRadius = 1, yRadius = 1, zRadius = 1,
    aStartAngle = 0, aEndAngle = Math.PI * 2,
    aClockwise = false, aRotation = 0) {

    const x0 = this.currentPoint.x;
    const y0 = this.currentPoint.y;
    const z0 = this.currentPoint.z;

    this.absarc(aX + x0, aY + y0, aZ + z0, xRadius, yRadius, zRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;

  }

  absarc(aX = 0, aY = 0, aZ = 0,
    xRadius = 1, yRadius = 1, zRadius = 1,
    aStartAngle = 0, aEndAngle = Math.PI * 2,
    aClockwise = false, aRotation = 0) {

    this.absellipse(aX, aY, aZ, xRadius, yRadius, zRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;

  }

  ellipse(aX = 0, aY = 0, aZ = 0,
    xRadius = 1, yRadius = 1, zRadius = 1,
    aStartAngle = 0, aEndAngle = Math.PI * 2,
    aClockwise = false, aRotation = 0) {

    const x0 = this.currentPoint.x;
    const y0 = this.currentPoint.y;
    const z0 = this.currentPoint.z;

    this.absellipse(aX + x0, aY + y0, aZ + z0, xRadius, yRadius, zRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;

  }

  absellipse(aX = 0, aY = 0, aZ = 0,
    xRadius = 1, yRadius = 1, zRadius = 1,
    aStartAngle = 0, aEndAngle = Math.PI * 2,
    aClockwise = false, aRotation = 0) {

    const curve = new EllipseCurve3D(aX, aY, aZ, xRadius, yRadius, zRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    if (this.curves.length > 0) {

      // if a previous curve is present, attempt to join
      const firstPoint = curve.getPoint(0);

      if (!firstPoint.equals(this.currentPoint)) {

        this.lineTo(firstPoint.x, firstPoint.y, firstPoint.z);

      }

    }

    this.curves.push(curve);

    const lastPoint = curve.getPoint(1);
    this.currentPoint.copy(lastPoint);

    return this;

  }

  override copy(source: any): this {

    super.copy(source);

    this.currentPoint.copy(source.currentPoint);

    return this;

  }

  override toJSON(): any {

    const data = super.toJSON();

    // @ts-ignore
    data.currentPoint = this.currentPoint.toArray();

    return data;

  }

  override fromJSON(json: any): this {

    super.fromJSON(json);

    this.currentPoint.fromArray(json.currentPoint);

    return this;

  }

}

