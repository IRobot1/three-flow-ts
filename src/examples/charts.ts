import { Box2, Float32BufferAttribute, Line, LineBasicMaterialParameters, LineSegments, Material, MaterialParameters, MathUtils, Mesh, Object3D, PlaneGeometry, Shape, ShapeGeometry, Vector2 } from "three"

export interface ChartParameters {
  length: number
  material: MaterialParameters
}

export interface RingChartParameters extends ChartParameters {
  innerRadius: number
  outerRadius: number
}

export interface RingMarkerParameters {
  width?: number // default is 0.1
  height?: number // default is 0.02
  material: MaterialParameters

  offset: number // offset from center
  position: number // angle in radians or distance along length
}

export class RingChart extends Mesh {
  constructor(public parameters: RingChartParameters) {
    super()

    this.update = () => {
      const shape = new Shape();

      shape.absarc(0, 0, parameters.outerRadius, 0, parameters.length);
      shape.absarc(0, 0, parameters.innerRadius, parameters.length, 0, true);

      this.geometry = new ShapeGeometry(shape);

      // rotate so ring starts at 9 o'clock instead of 3 o'clock
      this.geometry.rotateZ(Math.PI - parameters.length)
    }

    this.addEventListener('update', this.update)
    this.update()
  }

  update: () => void
}

export class RingMarker extends Object3D {

  private tick: Mesh
  get material() { return this.tick.material }
  set material(newvalue: Material | Material[]) {
    if (this.tick.material != newvalue) {
      this.tick.material = newvalue
    }
  }

  constructor(public parameters: RingMarkerParameters) {
    super()

    if (parameters.width == undefined) parameters.width = 0.1
    if (parameters.height == undefined) parameters.height = 0.02

    const tick = new Mesh()
    tick.geometry = new PlaneGeometry(parameters.width, parameters.height)
    this.add(tick)
    this.tick = tick

    this.update = () => {
      this.rotation.z = parameters.position
      tick.position.x = parameters.offset
    }

    this.addEventListener('update', this.update)
    this.update()
  }

  update: () => void
}

export interface LineChartParameters {
  width: number
  height: number
  margin: number
  values: Array<Vector2>
  material: LineBasicMaterialParameters
}

export class LineChart extends Line {
  constructor(public parameters: LineChartParameters) {
    super()

    const points: Array<Vector2> = [];
    const box = new Box2()

    this.update = () => {
      points.length = 0;
      box.makeEmpty();

      parameters.values.forEach(value => box.expandByPoint(value));

      let minpoint: Vector2 | undefined
      let maxpoint: Vector2 | undefined
      parameters.values.forEach(value => {
        const x = MathUtils.mapLinear(value.x, box.min.x, box.max.x, parameters.margin, parameters.width - parameters.margin);
        const y = MathUtils.mapLinear(value.y, box.min.y, box.max.y, parameters.margin, parameters.height - parameters.margin);

        const point = new Vector2(x, y)
        if (value.y == box.min.y) minpoint = point
        if (value.y == box.max.y) maxpoint = point
        points.push(point);
      })

      this.geometry.setFromPoints(points);

      this.clear()
      this.adornPoints(points)
      if (minpoint) this.adornMinPoint(minpoint)
      if (maxpoint) this.adornMaxPoint(maxpoint)
    }

    this.addEventListener('update', this.update)
    this.update()
  }

  update: () => void

  // overridables
  adornPoints(points: Array<Vector2>) { }
  adornMinPoint(point: Vector2) { }
  adornMaxPoint(point: Vector2) { }

}

export interface ChartGridParameters {
  width: number
  height: number
  columns: number
  rows: number
}

export class ChartGrid extends LineSegments {
  constructor(public parameters: ChartGridParameters) {
    super()

    this.update = () => {
      const vertices = [];

      const wsize = parameters.width / parameters.columns
      const hsize = parameters.height / parameters.rows

      for (let i = 0, w = 0; i <= parameters.columns; i++, w += wsize) {
        for (let j = 0, h = 0; j <= parameters.rows; j++, h += hsize) {

          vertices.push(0, h, 0, parameters.width, h, 0);
          vertices.push(w, 0, 0, w, parameters.height, 0);
        }
      }

      this.geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    }

    this.addEventListener('update', this.update)
    this.update()
  }

  update: () => void
}
